import { expect, it, vi } from 'vitest';
import { advanceImageFallback } from '../../src/card-art/image-fallback';
import { discoveryArtwork, discoveryKey, fetchDiscoveries, javLibraryPath, prefetchJav,
  type Discovery } from '../../src/react/jav/jav';
import { queryClient } from '../../src/react/query';

it('馆藏探索只读，按排序与方向各取一份，不带范围参数', async () => {
  const asked: URL[] = [];
  vi.stubGlobal('fetch', vi.fn(async (input: string) => {
    asked.push(new URL(input, 'https://peach.test'));
    return { ok: true, status: 200, json: async () => ({ items: [], candidate_total: 0, limited: false, source: 'library' }) };
  }));
  try {
    const signal = new AbortController().signal;
    await fetchDiscoveries(signal, { sort: 'source_score', direction: 'asc' });
    expect(Object.fromEntries(asked[0]!.searchParams)).toEqual({ limit: '100', sort: 'source_score', direction: 'asc' });
    expect(asked[0]!.pathname).toBe('/api/jav/discoveries');
    await fetchDiscoveries(signal);
    expect(Object.fromEntries(asked[1]!.searchParams)).toEqual({ limit: '100', sort: 'release_date', direction: 'desc' });
    expect(discoveryKey('source_score', 'desc')).not.toEqual(discoveryKey('duration', 'desc'));
    expect(discoveryKey('source_score', 'desc')).not.toEqual(discoveryKey('source_score', 'asc'));
  } finally { vi.unstubAllGlobals() }
});

it('打开 /jav 时预取探索那一份', async () => {
  const fetcher = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ items: [], candidate_total: 0,
    limited: false, source: 'library' }) }));
  vi.stubGlobal('fetch', fetcher);
  try {
    queryClient.clear();
    await prefetchJav(new AbortController().signal);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(discoveryKey())).toBeTruthy();
  } finally { vi.unstubAllGlobals(); queryClient.clear() }
});

it('发现封面优先本机缓存，远程封面经 Peach 代理并保留原地大小图取景身份', () => {
  const item = { id: 1, code: 'ABC-001', has_cover: true, cover_url: 'https://pics.dmm.co.jp/digital/video/abc00001/abc00001pl.jpg' } as Discovery;
  const local = document.createElement('div');
  local.innerHTML = discoveryArtwork(item, 'big', 'cover');
  expect(local.querySelector('img')?.getAttribute('src')).toContain('/cover?code=ABC-001');
  local.innerHTML = discoveryArtwork({ ...item, has_cover: false }, 'small', 'cover');
  const image = local.querySelector('img')!;
  expect(image.getAttribute('src')).toBe('/cover-image?code=ABC-001');
  expect(image.dataset.javImageLayout).toBe('small');
  expect(image.dataset.javCover).toBe('/cover-image?code=ABC-001');
  expect(local.innerHTML).not.toContain('dmm.co.jp');
  expect(advanceImageFallback(image)).toBe('drop');
  expect(local.querySelector('span.media-nopic')?.textContent).toBe('封面未取得');
  expect(discoveryArtwork({ ...item, has_cover: false, code: '' }, 'small', 'cover')).toBe('');
});

it('馆藏深链保留目录的搜索和筛选条件，只有探索地址不再带页签', () => {
  const url = new URL(javLibraryPath('?tab=explore&q=ABC-123&studio=演示厂牌&loc=cloud&sort=new&jav=0'), 'https://peach.test');
  expect(url.pathname).toBe('/');
  expect(Object.fromEntries(url.searchParams)).toEqual({ q: 'ABC-123', studio: '演示厂牌', loc: 'cloud', sort: 'new', jav: '1' });
});
