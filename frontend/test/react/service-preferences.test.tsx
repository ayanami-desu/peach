import { act } from 'react';
import { notifyManager, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';

import { queryClient } from '../../src/react/query';
import { TaskSpeedSettings, VideoThumbnailRow } from '../../src/react/settings/service-preferences';
import { buttonNamed, choose, click, mount, settle } from './render';

notifyManager.setScheduler((notify) => notify());

afterEach(() => { queryClient.clear() });

function server() {
  const settings: Record<string, unknown> = {};
  const thumbnails = { mode: 'precise', status: 'idle' };
  const routes: Record<string, object> = { '/api/settings': settings, '/api/thumbnail-jobs': thumbnails };
  const posts: { url: string; body: Record<string, unknown> }[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const data = routes[url];
    if (!data) throw new Error(`没有登记的地址：${url}`);
    if (init?.method === 'POST') {
      const body = JSON.parse(String(init.body));
      posts.push({ url, body });
      Object.assign(data, body);
    }
    return { ok: true, status: 200, json: async () => ({ ...data }) };
  }));
  return { posts, thumbnails };
}

it('默认任务档位通过共享设置保存，并显示保存回执', async () => {
  const { posts } = server();
  const receipt = vi.fn();
  const host = await mount(<QueryClientProvider client={queryClient}><TaskSpeedSettings receipt={receipt} /></QueryClientProvider>);
  await settle();
  await click(buttonNamed('标准', host));
  const slider = document.querySelector('input[type="range"]')!;
  await act(async () => {
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    slider.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home', bubbles: true }));
  });
  await vi.waitFor(() => expect(buttonNamed('低占用', host)).not.toBeNull());
  expect(posts).toEqual([{ url: '/api/settings', body: { taskSpeedMode: 'low' } }]);
  expect(receipt).toHaveBeenCalledWith('已保存默认处理速度');
});

it('缩略图选择提交原档位，保存后的控件显示采集间隔', async () => {
  const { posts } = server();
  const host = await mount(<QueryClientProvider client={queryClient}><VideoThumbnailRow /></QueryClientProvider>);
  await settle();
  await choose(host.querySelector('[aria-haspopup="listbox"]'), '每 30 秒一张');
  await settle();
  expect(posts).toEqual([{ url: '/api/thumbnail-jobs', body: { mode: 'coarse' } }]);
  expect(host.querySelector('[aria-haspopup="listbox"]')?.textContent).toContain('每 30 秒一张');
});
