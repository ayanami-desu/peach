import { QueryClientProvider, notifyManager } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { JavBatchResources } from '../../src/react/jav/jav-batch-resources';
import { queryClient } from '../../src/react/query';
import type { Discovery } from '../../src/react/jav/jav';
import { click, mount, settle } from './render';

notifyManager.setScheduler(notify => notify());
afterEach(() => { queryClient.clear(); localStorage.clear() });
const works = [1, 2].map(id => ({ id, code: `DEMO-00${id}`, title: `作品 ${id}` } as Discovery));

it('批量查找逐番号取资源，只看不提交', async () => {
  const fetcher = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200,
    json: async () => ({ state: 'ready', items: [], error: '', checked_at: null }) }));
  vi.stubGlobal('fetch', fetcher);
  const close = vi.fn();
  await mount(<QueryClientProvider client={queryClient}><JavBatchResources items={works} close={close} receipt={vi.fn()} /></QueryClientProvider>);
  await settle();
  expect(fetcher.mock.calls.map(([url]) => url)).toEqual(expect.arrayContaining([
    '/api/jav/resources?code=DEMO-001', '/api/jav/resources?code=DEMO-002',
  ]));
  expect(fetcher.mock.calls.every(([, init]) => !init?.method || init.method === 'GET')).toBe(true);
  expect(document.querySelectorAll('[data-want-magnets]')).toHaveLength(2);
  await click(document.querySelector('button[aria-label="关闭批量资源查找"]'));
  expect(close).toHaveBeenCalledOnce();
});

it('资源查询取不到时留下原因', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503,
    json: async () => ({ error: '服务暂不可用' }) })));
  await mount(<QueryClientProvider client={queryClient}><JavBatchResources items={[works[0]!]} close={vi.fn()} receipt={vi.fn()} /></QueryClientProvider>);
  await settle();
  expect(document.body.textContent).toContain('资源链接未取得');
  expect(document.body.textContent).toContain('服务暂不可用');
});
