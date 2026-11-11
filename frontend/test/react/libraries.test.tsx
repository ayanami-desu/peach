/* 媒体库一页：一个远端目录就是一个库，卡片上的属性写进设置文件。
 * 这一页只改配置：加库、删库都不动账本里的行（ADR-0157 之后的媒体库口径）。 */
import { notifyManager, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import * as legacyUi from '@peach/legacy/ui';

import { queryClient } from '../../src/react/query';
import {
  LIBRARIES_URL, LibrarySettings, type LibraryData, type LibraryRow,
} from '../../src/react/settings/library-settings';
import { buttonNamed, choose, click, mount, section, settle, type } from './render';

afterEach(() => queryClient.clear());
notifyManager.setScheduler(notify => notify());

const receipt = vi.fn();
/* 处理步骤是勾选框：按看得见的那几个字认。 */
const stepBoxes = (root: ParentNode) => [...root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];

const library = (over: Partial<LibraryRow> = {}): LibraryRow => ({
  id: 'onedrive:root1', name: 'AV', icon: '', color: '', policy: 'auto', stages: '',
  account: 'onedrive', location: 'onedrive', root_id: 'root1', root_name: '示例合集',
  videos: 12, missing: 3, synced_at: '2026-11-11 09:00:00', folders: 1,
  ...over,
});

const data = (libraries: LibraryRow[] = [library()]): LibraryData => ({
  libraries,
  options: { icons: ['database', 'heart'], policies: ['auto', 'custom'], stages: ['probe', 'preview'] },
});

const drivesAround = {
  public_url: '', locations: [{
    location: 'onedrive', label: 'OneDrive', configured: true, connected: true,
    email: 'me@outlook.com', display_name: 'Me', roots: [], synced_at: null, last_error: '',
    mode: 'redirect', modes: ['redirect'],
    accounts: [{
      key: 'onedrive', configured: true, connected: true, email: 'me@outlook.com',
      display_name: 'Me', roots: [], synced_at: null, last_error: '',
    }],
  }],
};

const answer = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

function serve(payload: LibraryData, others: Record<string, unknown> = {}) {
  const replies: Record<string, unknown> = {
    [LIBRARIES_URL]: payload, '/api/drive': drivesAround, ...others,
  };
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${url}`;
    return answer(key in replies ? replies[key] : replies[url] ?? {});
  });
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}

async function open(payload: LibraryData, others: Record<string, unknown> = {}) {
  const fetcher = serve(payload, others);
  const host = await mount(<QueryClientProvider client={queryClient}>
    <LibrarySettings receipt={receipt} />
  </QueryClientProvider>);
  await settle();
  return { host, fetcher };
}

it('一个目录一张卡，只读的那几项来自账本与同步状态', async () => {
  const { host } = await open(data([library({ folders: 3 })]));
  const card = section(host, 'AV')!;
  expect(card.textContent).toContain('12');
  expect(card.textContent).toContain('3');
  expect(card.textContent).toContain('2026-11-11 09:00:00');
  expect(card.textContent).toContain('onedrive · 示例合集');
  expect(card.textContent).toContain('这个账号下还有 2 个目录同类归此库。');
});

it('保存把这一张卡的属性整份交给后端，只改这一条', async () => {
  const saved = library({ name: 'AV 精选', icon: 'heart' });
  const { host, fetcher } = await open(data(), { [`POST ${LIBRARIES_URL}/onedrive%3Aroot1`]: saved });
  const card = section(host, 'AV')!;
  await type(card.querySelector('input[aria-label="媒体库名称"]'), 'AV 精选');
  await click(buttonNamed('保存', card));
  await settle();
  const posted = fetcher.mock.calls.find(([, init]) => init?.method === 'POST');
  expect(posted?.[0]).toBe(`${LIBRARIES_URL}/onedrive%3Aroot1`);
  expect(JSON.parse(String(posted?.[1]?.body))).toEqual(
    { name: 'AV 精选', icon: '', color: '', policy: 'auto', stages: '' });
  expect(receipt).toHaveBeenCalledWith('已保存「AV 精选」');
});

it('自定义处理方式时才挑步骤，勾上的步骤跟着这一张卡一起提交', async () => {
  const saved = library({ policy: 'custom', stages: 'preview' });
  const { host, fetcher } = await open(data(), { [`POST ${LIBRARIES_URL}/onedrive%3Aroot1`]: saved });
  const card = section(host, 'AV')!;
  expect(stepBoxes(card)).toHaveLength(0);
  await choose(card.querySelector('[aria-label="处理方式"]'), '自定义步骤');
  await settle();
  await click(stepBoxes(card).find(box => box.closest('label')?.textContent?.includes('九宫格')));
  await click(buttonNamed('保存', card));
  await settle();
  const posted = fetcher.mock.calls.find(([, init]) => init?.method === 'POST');
  expect(JSON.parse(String(posted?.[1]?.body))).toEqual(
    { name: 'AV', icon: '', color: '', policy: 'custom', stages: 'preview' });
});

it('移除只删配置，确认过才发', async () => {
  const confirm = vi.spyOn(legacyUi, 'confirmModal').mockImplementation((async (options: { onConfirm?(): Promise<unknown> }) => {
    await options.onConfirm?.();
  }) as unknown as typeof legacyUi.confirmModal);
  const { host, fetcher } = await open(data(), { [`DELETE ${LIBRARIES_URL}/onedrive%3Aroot1`]: { deleted: 'onedrive:root1' } });
  await click(buttonNamed('移除媒体库', section(host, 'AV')));
  await settle();
  expect(confirm).toHaveBeenCalledOnce();
  const deleted = fetcher.mock.calls.find(([, init]) => init?.method === 'DELETE');
  expect(deleted?.[0]).toBe(`${LIBRARIES_URL}/onedrive%3Aroot1`);
  expect(receipt).toHaveBeenCalledWith('已移除「AV」');
  confirm.mockRestore();
});

it('改目录：挑到新的那一层，整张卡原位换成新的库', async () => {
  const moved = library({ id: 'onedrive:film', root_id: 'film', root_name: '电影' });
  const { host, fetcher } = await open(data(), {
    [`GET /api/drive/onedrive/folders`]: { parent_id: 'root', folders: [{ remote_id: 'film', name: '电影' }] },
    [`GET /api/drive/onedrive/folders?parent_id=film`]: { parent_id: 'film', folders: [] },
    [`POST ${LIBRARIES_URL}/onedrive%3Aroot1/move`]: moved,
  });
  await click(buttonNamed('改目录', section(host, 'AV')));
  await settle();
  await click(buttonNamed('打开'));
  await settle();
  await click(buttonNamed('用这个目录：电影'));
  await settle();
  const posted = fetcher.mock.calls.find(([url, init]) => String(url).endsWith('/move') && init?.method === 'POST');
  expect(posted?.[0]).toBe(`${LIBRARIES_URL}/onedrive%3Aroot1/move`);
  expect(JSON.parse(String(posted?.[1]?.body))).toEqual({ remote_id: 'film' });
  expect(receipt).toHaveBeenCalledWith('已把「AV」换到这个目录');
});

it('新增库：挑账号、逐层点进目录，选中的那一层就交给后端建库', async () => {
  const added = library({ id: 'onedrive:movies', name: 'Movies', root_id: 'movies' });
  const { fetcher } = await open(data([]), {
    [`GET /api/drive/onedrive/folders`]: { parent_id: 'root', folders: [{ remote_id: 'movies', name: 'Movies' }] },
    [`GET /api/drive/onedrive/folders?parent_id=movies`]: { parent_id: 'movies', folders: [] },
    [`POST ${LIBRARIES_URL}`]: added,
  });
  await click(buttonNamed('新增媒体库'));
  await settle();
  await click(buttonNamed('挑目录'));
  await settle();
  await click(buttonNamed('打开'));
  await settle();
  await click(buttonNamed('用这个目录：Movies'));
  await settle();
  const posted = fetcher.mock.calls.find(([url, init]) => url === LIBRARIES_URL && init?.method === 'POST');
  expect(JSON.parse(String(posted?.[1]?.body))).toEqual({ account: 'onedrive', remote_id: 'movies' });
  expect(receipt).toHaveBeenCalledWith('已加媒体库「Movies」');
});
