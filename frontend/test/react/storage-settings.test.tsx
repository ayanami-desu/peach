/* 存储空间：目录读数与上次统计的分类占用、勾选清理、容量设置的保存，以及统计进行中的进度。
 * 清理先过确认弹层，确认了才发；外观由预览与 e2e 量。 */
import { notifyManager, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import * as legacyUi from '@peach/legacy/ui';

import { queryClient } from '../../src/react/query';
import { StorageSettings } from '../../src/react/settings/storage-settings';
import type { StorageCategory, StoragePolicy, StorageState } from '../../src/react/bundle';
import { buttonNamed, click, mount, section, settle, switches, type } from './render';

notifyManager.setScheduler(notify => notify());
afterEach(() => { queryClient.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear() });

const GB = 1024 ** 3;
const category = (fields: Partial<StorageCategory>): StorageCategory => ({
  key: 'covers', label: '封面缓存', description: '来源站取回的封面图', note: '',
  cleanable: true, bytes: GB, files: 12, reclaimable: GB / 2, ...fields,
});
const covers = category({});
/* 来源站还在用的缩略图：不清理，原因写在行里。 */
const thumbs = category({ key: 'thumbs', label: '缩略图', description: '列表里的小图', cleanable: false, note: '来源站还要用', reclaimable: 0 });
const usage = {
  measured_at: 1_700_000_000, total_bytes: 3 * GB, total_files: 1234,
  categories: [covers, thumbs], capacity_error: '',
};
const policy = (fields: Partial<StoragePolicy> = {}): StoragePolicy => ({
  enabled: false, minimum_free_gib: 5, data_max_gib: 0, cache_max_gib: 0,
  auto_clean: true, external_cache_path: '', external_cache_max_gib: 0, ...fields,
});
const state = (fields: Partial<StorageState> = {}): StorageState => ({
  data_root: '/srv/peach', free_bytes: 20 * GB, total_bytes: 100 * GB, system_drive: false,
  budget: { policy: policy(), error: '', last_check: null },
  usage, job: { state: 'idle', message: '' },
  relocation: { available: false, message: '', last: null },
  ...fields,
});

type Confirmation = Parameters<typeof legacyUi.confirmModal>[0];
function confirmWith(answer: boolean) {
  const seen: Confirmation[] = [];
  vi.spyOn(legacyUi, 'confirmModal').mockImplementation((async (options: Confirmation) => {
    seen.push(options);
    if (answer) await options.onConfirm?.();
    return { confirmed: answer };
  }) as typeof legacyUi.confirmModal);
  return seen;
}

/** 读回一律是 `first`，写接口回 `after`（默认同 `first`）；`posts()` 按调用顺序列出写接口。 */
function serve(first: StorageState, after?: StorageState) {
  const fetcher = vi.fn(async (_url: string, options?: RequestInit) => ({
    ok: true, status: 200, json: async () => (options?.method === 'POST' ? (after ?? first) : first),
  }));
  vi.stubGlobal('fetch', fetcher);
  const posts = () => fetcher.mock.calls
    .filter(([, options]) => options?.method === 'POST')
    .map(([url, options]) => ({ url: String(url), body: JSON.parse(String(options?.body)) }));
  return { posts };
}

const render = async (receipt = vi.fn()) => {
  const host = await mount(<QueryClientProvider client={queryClient}>
    <StorageSettings receipt={receipt} />
  </QueryClientProvider>);
  await settle();
  return { host, receipt };
};
const box = (host: ParentNode, name: string) => host.querySelector<HTMLInputElement>(`input[aria-label="${name}"][type="checkbox"]`);
const field = (host: ParentNode, name: string) => host.querySelector<HTMLInputElement>(`#storage-policy-${name}`);

it('列出数据目录与磁盘余量，没统计过就说明怎么统计', async () => {
  serve(state({ usage: null }));
  const { host } = await render();
  const card = section(host, '存储空间')!;
  expect(card.textContent).toContain('/srv/peach');
  expect(card.textContent).toContain('可用 20.0 GB，共 100.0 GB');
  expect(card.textContent).toContain('还没统计过');
  expect(card.textContent).not.toContain('占用总量');
});

it('系统盘与空间不足各给一句提示', async () => {
  serve(state({ system_drive: true, usage: { ...usage, capacity_error: '只剩 2% 的空间' } }));
  const { host } = await render();
  const card = section(host, '存储空间')!;
  expect(card.textContent).toContain('数据目录在系统盘上');
  expect(card.textContent).toContain('只剩 2% 的空间');
});

it('逐类列出占用与可释放，不能清理的写清原因', async () => {
  serve(state());
  const { host } = await render();
  const card = section(host, '存储空间')!;
  expect(card.textContent).toContain('占用总量');
  expect(card.textContent).toContain('1,234');
  expect(card.textContent).toContain('可释放 512 MB');
  expect(card.textContent).toContain('不能清理：来源站还要用');
  expect(box(card, '封面缓存')).not.toBeNull();
  expect(box(card, '缩略图')!.disabled).toBe(true);
});

it('清理只提交勾选的类别，确认后才发', async () => {
  const { posts } = serve(state());
  const { host, receipt } = await render();
  const confirm = confirmWith(true);
  await click(box(host, '封面缓存'));
  await click(buttonNamed('清理所选', host));
  expect(confirm).toHaveLength(1);
  expect(confirm[0].body).toContain('封面缓存');
  await settle();
  expect(posts()).toEqual([{ url: '/api/configuration/storage/clean', body: { categories: ['covers'] } }]);
  expect(receipt).toHaveBeenCalledWith('已清理所选数据。');
});

it('确认里取消就不发清理', async () => {
  const { posts } = serve(state());
  const { host, receipt } = await render();
  const confirm = confirmWith(false);
  await click(box(host, '封面缓存'));
  await click(buttonNamed('清理所选', host));
  expect(confirm).toHaveLength(1);
  await settle();
  expect(posts()).toEqual([]);
  expect(receipt).not.toHaveBeenCalled();
});

it('保存容量设置提交完整策略', async () => {
  const { posts } = serve(state());
  const { host, receipt } = await render();
  await click(switches(host)[0]);
  await type(field(host, 'data_max_gib'), '200');
  await type(field(host, 'external_cache_max_gib'), '50');
  await type(field(host, 'external-path'), '/Volumes/Cache/peach');
  await click(buttonNamed('保存容量设置', host));
  await settle();
  expect(posts()).toEqual([{
    url: '/api/configuration/storage/policy',
    body: {
      enabled: true, auto_clean: true, minimum_free_gib: 5, data_max_gib: 200, cache_max_gib: 0,
      external_cache_max_gib: 50, external_cache_path: '/Volumes/Cache/peach',
    },
  }]);
  expect(receipt).toHaveBeenCalledWith('已保存容量设置。');
});

it('清空的上限按不限（0）提交', async () => {
  const { posts } = serve(state());
  const { host } = await render();
  await type(field(host, 'minimum_free_gib'), '');
  await click(buttonNamed('保存容量设置', host));
  await settle();
  expect(posts()[0].body.minimum_free_gib).toBe(0);
});

it('统计进行中画进度、报出当前类别，并禁用两个任务键', async () => {
  serve(state({ job: { state: 'measuring', message: '正在统计封面缓存', files: 300, expected_files: 1200 } }));
  const { host } = await render();
  const bar = section(host, '存储空间')!.querySelector('svg[role="progressbar"]')!;
  expect(bar.getAttribute('aria-label')).toBe('正在统计');
  expect(bar.getAttribute('aria-valuemax')).toBe('1200');
  expect(bar.getAttribute('aria-valuenow')).toBe('300');
  expect(section(host, '存储空间')!.textContent).toContain('正在统计封面缓存');
  expect(buttonNamed('重新统计', host)!.hasAttribute('disabled')).toBe(true);
  expect(buttonNamed('清理所选', host)!.hasAttribute('disabled')).toBe(true);
});

it('重新统计提交后换成新回话并回执', async () => {
  const { posts } = serve(state({ usage: null }), state());
  const { host, receipt } = await render();
  await click(buttonNamed('重新统计', host));
  await settle();
  expect(posts()).toEqual([{ url: '/api/configuration/storage/measure', body: {} }]);
  expect(receipt).toHaveBeenCalledWith('已重新统计各类数据的占用。');
  expect(section(host, '存储空间')!.textContent).toContain('占用总量');
});
