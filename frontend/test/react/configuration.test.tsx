/* Peach 配置页：六格页签一件一件事，第一格是网盘（媒体只在网盘上，ADR-0157）。
 * 网盘卡的状态全来自 `GET /api/drive`，这一页只负责把它分格摆出来、把深链落到对应那一格。
 * 外观由预览与 e2e 量。 */
import { notifyManager, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import * as legacyUi from '@peach/legacy/ui';

import { CONFIGURATION_URL } from '../../src/configuration-endpoints';
import type { ConfigurationData } from '../../src/react/bundle';
import { queryClient } from '../../src/react/query';
import { CONFIGURATION_KEY, prefetchConfiguration } from '../../src/react/settings/configuration';
import { ConfigurationPage } from '../../src/react/settings/configuration-page';
import { buttonNamed, click, mount, section, settle } from './render';

afterEach(() => queryClient.clear());
notifyManager.setScheduler(notify => notify());

const DRIVE_URL = '/api/drive';

interface DriveRoot { remote_id: string; name: string }

interface DriveConnection {
  location: string; label: string; configured: boolean; connected: boolean;
  email: string; display_name: string; roots: DriveRoot[]; synced_at: string | null; last_error: string;
  mode: string; modes: string[];
}

interface DriveSnapshot { public_url: string; locations: DriveConnection[] }

const data = (over: Partial<ConfigurationData> = {}): ConfigurationData => ({
  editable: true, notice: '', revision: 'rev-1', port: 9123, facts: [],
  access: { mode: 'open', revision: 'access-1' },
  api_token: { rotatable: true, reason: '', paired: false },
  ...over,
});

const connected = (over: Partial<DriveConnection> = {}): DriveConnection => ({
  location: 'onedrive', label: 'OneDrive', configured: true, connected: true,
  email: 'me@outlook.com', display_name: 'Me', roots: [{ remote_id: 'root1', name: 'Movies' }],
  synced_at: '2026-11-10 08:00:00', last_error: '', mode: 'redirect', modes: ['redirect', 'proxy'], ...over,
});

const snapshot = (over: Partial<DriveSnapshot> = {}): DriveSnapshot => ({
  public_url: 'https://peach.example', locations: [connected()], ...over,
});

type Reply = { ok: boolean; status: number; json(): Promise<unknown> };
type Fetcher = { mock: { calls: [url: string, init?: RequestInit][] } };
const answer = (body: unknown, status = 200): Reply => ({ ok: status < 400, status, json: async () => body });

/* 假服务端按 `方法 URL` 取回话：`GET` 可以直接写 URL。没有登记的请求回一份空对象。 */
function serve(config: ConfigurationData, drive: DriveSnapshot | Reply = snapshot(),
  others: Record<string, unknown> = {}) {
  const replies: Record<string, unknown> = {
    [CONFIGURATION_URL]: config,
    '/api/settings': { followInitialDays: 30, taskSpeedMode: 'standard' },
    '/api/configuration/access/sessions': { revision: 'access-1', sessions: [], manageable: false },
    [DRIVE_URL]: drive,
    ...others,
  };
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${url}`;
    const reply = key in replies ? replies[key] : replies[url];
    if (reply && typeof reply === 'object' && 'ok' in reply) return reply;
    return answer(reply ?? {});
  });
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}

const calls = (fetcher: Fetcher, method: string) =>
  fetcher.mock.calls.filter(([, init]) => (init?.method ?? 'GET') === method).map(([url]) => url);

async function open(config = data(), drive: DriveSnapshot | Reply = snapshot(),
  others: Record<string, unknown> = {}, selected?: string) {
  const fetcher = serve(config, drive, others);
  await prefetchConfiguration(new AbortController().signal);
  const host = await mount(<QueryClientProvider client={queryClient}>
    <ConfigurationPage receipt={receipt} section={selected} />
  </QueryClientProvider>);
  await settle();
  return { host, fetcher };
}

const receipt = vi.fn();
const tabs = (host: ParentNode) => [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const chosen = (host: ParentNode) => tabs(host).find(tab => tab.getAttribute('aria-selected') === 'true')!;
const press = (target: Element, key: string) => act(async () => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
});

it('六格页签各管一件事，网盘默认打开，每格都是独立面板', async () => {
  const { host } = await open();
  expect(tabs(host).map(tab => tab.textContent)).toEqual(
    ['网盘', '访问与安全', 'API 令牌', '设备会话', '任务速度', '系统诊断']);
  expect(chosen(host).textContent).toBe('网盘');
  for (const tab of tabs(host)) {
    const panel = host.querySelector(`#${tab.getAttribute('aria-controls')}`)!;
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  }
  const inPanel = (selector: string) =>
    host.querySelector(selector)?.closest('[role="tabpanel"]')?.getAttribute('aria-labelledby');
  expect(inPanel('[data-guide-target="drives"]')).toBe(tabs(host)[0]!.id);
  expect(inPanel('[data-guide-target="token"]')).toBe(tabs(host)[2]!.id);
  expect(inPanel('[data-guide-target="speed"]')).toBe(tabs(host)[4]!.id);
});

it('方向键在页签条里首尾循环，Home 与 End 到两头并同步焦点', async () => {
  const { host } = await open();
  chosen(host).focus();
  await press(chosen(host), 'ArrowUp');
  expect(chosen(host).textContent).toBe('系统诊断');
  expect(document.activeElement).toBe(chosen(host));
  await press(chosen(host), 'ArrowDown');
  expect(chosen(host).textContent).toBe('网盘');
  await press(chosen(host), 'End');
  expect(chosen(host).textContent).toBe('系统诊断');
  await press(chosen(host), 'Home');
  expect(chosen(host).textContent).toBe('网盘');
  expect(tabs(host).map(tab => tab.tabIndex)).toEqual([0, -1, -1, -1, -1, -1]);
});

it('分区深链按页签名与地址锚点打开对应那一格，重读配置不换格', async () => {
  const { host } = await open(data(), snapshot(), {}, 'API 令牌');
  expect(chosen(host).textContent).toBe('API 令牌');
  await click(tabs(host).find(tab => tab.textContent === '网盘'));
  expect(chosen(host).textContent).toBe('网盘');
  expect(window.location.hash).toBe('#drives');
  await act(async () => { queryClient.setQueryData(CONFIGURATION_KEY, data({ revision: 'rev-2' })) });
  expect(chosen(host).textContent).toBe('网盘');
});

it('地址上带着网盘授权回跳的锚点时打开那一格', async () => {
  window.location.hash = '#devices';
  try {
    const { host } = await open(data(), snapshot(), {}, '不存在');
    expect(chosen(host).textContent).toBe('设备会话');
  } finally {
    window.history.replaceState(null, '', window.location.pathname);
  }
});

it('没有访问配置时只留网盘、任务速度与系统诊断，认不出的页签名回到网盘', async () => {
  const { host } = await open(data({ editable: false, access: undefined, api_token: undefined }), snapshot(), {}, '不存在');
  expect(tabs(host).map(tab => tab.textContent)).toEqual(['网盘', '任务速度', '系统诊断']);
  expect(chosen(host).textContent).toBe('网盘');
});

it('网盘这一格一张卡对一个来源：没接写的只说怎么接，没有回调基址就不给授权', async () => {
  const { host } = await open(data(), snapshot({ public_url: '', locations: [
    connected({ location: 'google', label: 'Google Drive', configured: false, connected: false,
      email: '', display_name: '', roots: [], synced_at: null }),
    connected({ connected: false, email: '', display_name: '', roots: [], synced_at: null }),
  ] }), {}, '网盘');
  expect(section(host, 'Google Drive')?.textContent).toContain('[drive.accounts.google]');
  expect(buttonNamed('开始授权', section(host, 'Google Drive'))).toBeNull();
  expect(section(host, 'OneDrive')?.textContent).toContain('没有配置回调基址');
  expect(section(host, 'OneDrive')?.textContent).toContain('未授权');
  const authorize = buttonNamed('开始授权', section(host, 'OneDrive'));
  expect(authorize?.disabled).toBe(true);
  expect(section(host, 'OneDrive')?.textContent).toContain('回调地址 未配置');
});

it('已授权的来源读账号、扫描起点与上次同步，立即刷新只换这一张卡', async () => {
  const refreshed = connected({ synced_at: '2026-11-11 09:30:00' });
  const { host, fetcher } = await open(data(), snapshot(), {
    [`POST ${DRIVE_URL}/onedrive/refresh`]: refreshed,
  });
  const card = section(host, 'OneDrive')!;
  expect(card.textContent).toContain('me@outlook.com');
  expect(card.textContent).toContain('1 个目录');
  expect(card.textContent).toContain('2026-11-10 08:00:00');
  expect(card.textContent).toContain('Movies');
  await click(buttonNamed('立即刷新', card));
  await settle();
  expect(calls(fetcher, 'POST')).toEqual([`${DRIVE_URL}/onedrive/refresh`]);
  expect(receipt).toHaveBeenCalledWith('已安排刷新 OneDrive，下一轮同步先做这个来源');
  expect(section(host, 'OneDrive')?.textContent).toContain('2026-11-11 09:30:00');
});

it('选择扫描起点逐层列远端目录，设成起点后交回这一格重读', async () => {
  const { host, fetcher } = await open(data(), snapshot(), {
    [`${DRIVE_URL}/onedrive/folders?parent_id=`]: { parent_id: '', folders: [{ remote_id: 'm1', name: 'Movies' }] },
    [`${DRIVE_URL}/onedrive/folders?parent_id=m1`]: { parent_id: 'm1', folders: [{ remote_id: 'm2', name: '2024' }] },
    [`${DRIVE_URL}/onedrive/folders?parent_id=m2`]: { parent_id: 'm2', folders: [] },
    [`POST ${DRIVE_URL}/onedrive/roots`]: { location: 'onedrive', roots: ['root1', 'm2'] },
  });
  await click(buttonNamed('选择扫描起点', section(host, 'OneDrive')));
  await settle();
  expect(section(host, 'OneDrive')?.textContent).toContain('账号根目录');
  expect(buttonNamed('设为扫描起点：Movies', section(host, 'OneDrive'))).toBeNull();
  await click(host.querySelector('[aria-label="打开目录 Movies"]'));
  await settle();
  expect(buttonNamed('上一级', section(host, 'OneDrive'))).not.toBeNull();
  expect(buttonNamed('设为扫描起点：Movies', section(host, 'OneDrive'))).not.toBeNull();
  await click(host.querySelector('[aria-label="打开目录 2024"]'));
  await settle();
  await click(buttonNamed('设为扫描起点：2024', section(host, 'OneDrive')));
  await settle();
  expect(fetcher.mock.calls.some(([url]) => url === `${DRIVE_URL}/onedrive/folders?parent_id=m1`)).toBe(true);
  const roots = fetcher.mock.calls.find(([url]) => url === `${DRIVE_URL}/onedrive/roots`);
  expect(roots?.[1]?.method).toBe('POST');
  expect(JSON.parse(String(roots?.[1]?.body))).toEqual({ roots: [
    { remote_id: 'root1', name: 'Movies' }, { remote_id: 'm2', name: '2024' },
  ] });
  expect(receipt).toHaveBeenCalledWith('已把「2024」设为扫描起点');
});

it('断开只忘掉账号与扫描起点', async () => {
  const confirm = vi.spyOn(legacyUi, 'confirmModal').mockImplementation((async (options: { onConfirm?(): Promise<unknown> }) => {
    await options.onConfirm?.();
    return { confirmed: true };
  }) as unknown as typeof legacyUi.confirmModal);
  const { host, fetcher } = await open(data(), snapshot(), {
    [`DELETE ${DRIVE_URL}/onedrive`]: { forgotten: 'onedrive' },
  });
  await click(buttonNamed('断开', section(host, 'OneDrive')));
  await settle();
  expect(confirm).toHaveBeenCalledWith(expect.objectContaining({
    title: '断开 OneDrive',
    body: expect.stringContaining('已经登记进馆藏的条目不动'),
  }));
  expect(calls(fetcher, 'DELETE')).toEqual([`${DRIVE_URL}/onedrive`]);
  expect(receipt).toHaveBeenCalledWith('已断开 OneDrive');
});

it('网盘状态读不到时给出原因与重新读取', async () => {
  const { host, fetcher } = await open(data(), answer({ message: '网盘还没配置' }, 503));
  const card = section(host, '网盘')!;
  expect(card.textContent).toContain('网盘还没配置');
  await click(buttonNamed('重新读取', card));
  await settle();
  expect(fetcher.mock.calls.filter(([url]) => url === DRIVE_URL).length).toBeGreaterThan(1);
});

it('局部配置错误出现在对应那一格，不替换别处未保存的输入', async () => {
  const { host } = await open(data(), snapshot(), {}, 'API 令牌');
  await act(async () => {
    queryClient.setQueryData(CONFIGURATION_KEY, data({ revision: 'rev-2', section_errors: {
      api_token: { title: '访问口令未取得', message: '请重新读取。', error_id: 'token-error' },
      access: { title: '访问方式未取得', message: '请重新读取。', error_id: 'access-error' },
    } }));
  });
  expect(host.querySelector('.ui-board-group-active')?.textContent).toContain('访问口令未取得');
  await click(tabs(host).find(tab => tab.textContent === '网盘'));
  expect(host.querySelector('.ui-board-group-active')?.textContent).not.toContain('访问口令未取得');
  await click(tabs(host).find(tab => tab.textContent === '访问与安全'));
  expect(host.querySelector('.ui-board-group-active')?.textContent).toContain('访问方式未取得');
});

it('配置读取失败显示服务端原因', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => answer({ message: '数据库正在迁移' }, 503)));
  const host = await mount(<QueryClientProvider client={queryClient}>
    <ConfigurationPage receipt={vi.fn()} />
  </QueryClientProvider>);
  await settle();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('数据库正在迁移');
  expect(host.querySelector('[role="tablist"]')).toBeNull();
});
