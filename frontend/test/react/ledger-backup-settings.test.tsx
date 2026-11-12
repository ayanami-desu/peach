/* 账本备份：列表本身、恢复先过确认弹层并带上 `confirm: true`、备份进行中禁键与进度。
 * 恢复会覆盖当前账本，所以弹层文案与提交体都在这里守住。 */
import { notifyManager, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import * as legacyUi from '@peach/legacy/ui';

import { queryClient } from '../../src/react/query';
import { LedgerBackupSettings, type LedgerBackup, type LedgerBackupsState } from '../../src/react/settings/ledger-backup-settings';
import { buttonNamed, click, mount, section, settle } from './render';

notifyManager.setScheduler(notify => notify());
afterEach(() => { queryClient.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear() });

const GB = 1024 ** 3;
const manual: LedgerBackup = {
  id: 'local/manual-20260101.peach', name: 'manual-20260101.peach',
  bytes: GB, modified_at: 1_767_225_600, source: 'manual',
};
const automatic: LedgerBackup = {
  id: 'local/auto-20260102.peach', name: 'auto-20260102.peach',
  bytes: 3 * GB, modified_at: 1_767_312_000, source: 'auto', purpose: '移除媒体库前',
};
const listing = (fields: Partial<LedgerBackupsState> = {}): LedgerBackupsState => ({
  backups: [automatic, manual], backup: { status: 'idle' }, restore: { status: 'idle' },
  last_restore: null, ...fields,
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
function serve(first: LedgerBackupsState, after?: LedgerBackupsState) {
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
    <LedgerBackupSettings receipt={receipt} />
  </QueryClientProvider>);
  await settle();
  return { host, receipt };
};
const restoreKey = (name: string) => `button[aria-label="恢复 ${name}"]`;

it('逐份列出文件名、时间、大小与来源', async () => {
  serve(listing());
  const { host } = await render();
  const card = section(host, '账本备份')!;
  expect(card.textContent).toContain('auto-20260102.peach');
  expect(card.textContent).toContain('manual-20260101.peach');
  expect(card.textContent).toContain('3.0 GB');
  expect(card.textContent).toContain('1.0 GB');
  expect(card.textContent).toContain('自动 · 移除媒体库前');
  expect(card.textContent).toContain('手动');
  expect(card.querySelectorAll(restoreKey('manual-20260101.peach'))).toHaveLength(1);
  expect(card.querySelectorAll('button')).toHaveLength(3);
});

it('没有备份时只说一句，备份键还在', async () => {
  serve(listing({ backups: [] }));
  const { host } = await render();
  expect(section(host, '账本备份')!.textContent).toContain('还没有备份');
  expect(buttonNamed('立即备份', host)).not.toBeNull();
});

it('恢复先过确认弹层，弹层写明不可撤销，提交带 confirm: true', async () => {
  const { posts } = serve(listing());
  const { host, receipt } = await render();
  const confirm = confirmWith(true);
  await click(host.querySelector(restoreKey('manual-20260101.peach')));
  expect(confirm).toHaveLength(1);
  expect(confirm[0].body).toContain('恢复会用这份备份替换当前账本，无法撤销');
  await settle();
  expect(posts()).toEqual([{
    url: '/api/configuration/ledger-backups/restore',
    body: { confirm: true, id: 'local/manual-20260101.peach' },
  }]);
  expect(receipt).toHaveBeenCalledWith('已开始恢复，完成后账本就是这份备份。');
});

it('确认里取消就不恢复', async () => {
  const { posts } = serve(listing());
  const { host } = await render();
  const confirm = confirmWith(false);
  await click(host.querySelector(restoreKey('manual-20260101.peach')));
  expect(confirm).toHaveLength(1);
  await settle();
  expect(posts()).toEqual([]);
});

it('备份进行中画进度、报当前步骤，并禁掉备份与恢复', async () => {
  serve(listing({ backup: { status: 'running', stage: '检查备份完整性', done: 400, total: 1000 } }));
  const { host } = await render();
  const bar = section(host, '账本备份')!.querySelector('svg[role="progressbar"]')!;
  expect(bar.getAttribute('aria-label')).toBe('正在备份');
  expect(bar.getAttribute('aria-valuenow')).toBe('400');
  expect(bar.getAttribute('aria-valuemax')).toBe('1000');
  expect(section(host, '账本备份')!.textContent).toContain('检查备份完整性');
  expect(buttonNamed('立即备份', host)!.hasAttribute('disabled')).toBe(true);
  expect(host.querySelector<HTMLButtonElement>(restoreKey('manual-20260101.peach'))!.disabled).toBe(true);
});

it('没有总量的任务只报步骤，不画进度条', async () => {
  serve(listing({ backup: { status: 'running', stage: '写入账本' } }));
  const { host } = await render();
  expect(section(host, '账本备份')!.querySelector('svg[role="progressbar"]')).toBeNull();
  expect(section(host, '账本备份')!.textContent).toContain('写入账本');
  expect(buttonNamed('立即备份', host)!.hasAttribute('disabled')).toBe(true);
});

it('立即备份提交后回执，并换成服务端的新回话', async () => {
  const running: LedgerBackupsState = listing({ backup: { status: 'running', stage: '准备备份' } });
  const { posts } = serve(listing({ backups: [] }), running);
  const { host, receipt } = await render();
  await click(buttonNamed('立即备份', host));
  await settle();
  expect(posts()).toEqual([{ url: '/api/configuration/ledger-backups/backup', body: {} }]);
  expect(receipt).toHaveBeenCalledWith('已开始备份，进度可以在任务中心看。');
  expect(section(host, '账本备份')!.textContent).toContain('准备备份');
});

it('放过恢复就报上次恢复的结论', async () => {
  serve(listing({ last_restore: { state: 'done', message: '已恢复 12 个条目', backup: 'manual-20260101.peach', finished_at: 1_767_312_000 } }));
  const { host } = await render();
  const card = section(host, '账本备份')!;
  expect(card.textContent).toContain('上次恢复');
  expect(card.textContent).toContain('已恢复 12 个条目');
});
