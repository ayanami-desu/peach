import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ExternalPlayback } from '../../src/react/item-detail/external-playback';
import { choose, click, mount, settle } from './render';

const WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36';

function useUserAgent(userAgent: string) {
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
}

function useBrowserLocation(origin = 'http://peach.test') {
  const place = { origin, href: `${origin}/assets/1`, assign() {}, replace() {} };
  Object.defineProperty(window, 'location', { configurable: true, value: place });
  Object.defineProperty(globalThis, 'location', { configurable: true, value: place });
  return place;
}

beforeEach(() => {
  for (const key of ['peach.local-player.v1', 'peach.playback-target.v1']) localStorage.removeItem(key);
  useUserAgent(WINDOWS);
  const proto = HTMLElement.prototype;
  const matches = Element.prototype.matches;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    return selector === ':popover-open' ? this.hasAttribute('data-test-popover-open') : matches.call(this, selector);
  });
  proto.showPopover = function () { this.setAttribute('data-test-popover-open', '') };
  proto.hidePopover = function () { this.removeAttribute('data-test-popover-open') };
});

afterEach(() => {
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  delete proto.showPopover;
  delete proto.hidePopover;
  vi.restoreAllMocks();
});

it('只在你点打开时才签发链接，本机播放器拿到的是一条 scheme 地址', async () => {
  const place = useBrowserLocation();
  const fetcher = vi.fn(async () => new Response(JSON.stringify({
    url: '/external-stream/1?ticket=short', playlist: '/external-playlist/1.m3u?ticket=short',
  })));
  vi.stubGlobal('fetch', fetcher);
  const host = await mount(<ExternalPlayback id={1} />);
  await settle();
  expect(fetcher).not.toHaveBeenCalled();
  await click(host.querySelector('[aria-label="使用外部播放器打开"]'));
  await settle();
  expect(fetcher).toHaveBeenCalledWith('/api/external-playback?id=1', expect.objectContaining({ method: 'POST' }));
  expect(place.href).toBe('vlc://http://peach.test/external-stream/1?ticket=short');
  expect(host.querySelector('input')?.value).toContain('/external-stream/1?ticket=short');
});

it('菜单按这台设备给得出本机播放器，默认第一款并记住选择', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}')));
  const host = await mount(<ExternalPlayback id={3} />);
  expect(host.querySelector('[data-select-trigger]')?.textContent?.trim()).toBe('VLC');
  await click(host.querySelector('[aria-label="外部播放器"]'));
  expect([...document.querySelectorAll('[role="option"]')].map(node => node.textContent?.trim())).toEqual([
    'VLC', 'PotPlayer', 'mpv', 'M3U 播放列表', '播放链接',
  ]);
  await choose(host.querySelector('[aria-label="外部播放器"]'), 'PotPlayer');
  expect(localStorage.getItem('peach.playback-target.v1')).toBe('app:potplayer');
});

it('手机上给的是 intent 与 iOS 那几款，不出现桌面播放器', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}')));
  useUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1');
  const host = await mount(<ExternalPlayback id={4} />);
  await click(host.querySelector('[aria-label="外部播放器"]'));
  expect([...document.querySelectorAll('[role="option"]')].map(node => node.textContent?.trim())).toEqual([
    'VLC', 'VLC（iOS）', 'Infuse', 'SenPlayer', 'nPlayer', 'M3U 播放列表', '播放链接',
  ]);
});

it('选 M3U 时下载播放列表，换回别的目标时清掉已显示的地址', async () => {
  useBrowserLocation();
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
    url: '/external-stream/9?ticket=short', playlist: '/external-playlist/9.m3u?ticket=short',
  }))));
  let downloadUrl = '';
  const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloadUrl = this.href;
  });
  const opened = vi.fn();
  const host = await mount(<ExternalPlayback id={9} onOpened={opened} />);
  await choose(host.querySelector('[aria-label="外部播放器"]'), 'M3U 播放列表');
  await click(host.querySelector('[aria-label="使用外部播放器打开"]'));
  await settle();
  expect(download).toHaveBeenCalledOnce();
  expect(downloadUrl).toContain('/external-playlist/9.m3u?ticket=short');
  expect(opened).toHaveBeenCalledOnce();
  expect(host.querySelector('input')?.value).toContain('/external-stream/9?ticket=short');
  await choose(host.querySelector('[aria-label="外部播放器"]'), '播放链接');
  expect(host.querySelector('input')).toBeNull();
});

it('签发失败时保留原因，不画地址', async () => {
  useBrowserLocation();
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ detail: '播放链接已失效，请在作品详情重新打开' }), { status: 401 })));
  const host = await mount(<ExternalPlayback id={5} />);
  await click(host.querySelector('[aria-label="使用外部播放器打开"]'));
  await settle();
  expect(host.textContent).toContain('播放链接已失效');
  expect(host.querySelector('input')).toBeNull();
});
