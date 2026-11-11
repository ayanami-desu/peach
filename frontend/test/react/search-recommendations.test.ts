import { describe, expect, it, vi } from 'vitest';
import { pendingRecommendations, searchRecommendations } from '../../src/react/search/recommendations';

describe('搜索图片推荐', () => {
  it('一个请求取齐馆藏推荐，各组保留作品详情与艺人入口', async () => {
    const request = vi.fn(async (_url: string) => ({
      items: { items: [{ id: 11, name: '本地作品' }] },
      jav: { items: [{ id: 12, asset_id: 12, code: 'ABW-101', performer_refs: [{ id: 15, name: '女优', has_image: true }] }] },
      latest: { 15: { id: 30, code: 'ABW-099', release_date: '2025-02-01' } },
      words: ['ABW-101', '女优'],
    }));
    const { groups, words } = await searchRecommendations(request);
    expect(request.mock.calls).toEqual([['/api/search/recommendations']]);
    expect(words).toEqual(['ABW-101', '女优']);
    const entry = (kind: string) => groups.find(group => group.kind === kind)!.items[0]!;
    expect(entry('asset').id).toBe(11);
    expect(entry('jav').href).toBe('/assets/12');
    expect(entry('jav').who).toBe('女优');
    expect(entry('performer').entity_id).toBe(15);
    expect(entry('performer').subtitle).toBe('最新作 ABW-099 · 2025-02-01');
    // 每组带着整池，「换一批」在池里翻页。
    expect(groups.find(group => group.kind === 'jav')).toMatchObject({ offset: 0, size: 5 });
    expect(groups.map(group => group.kind)).toEqual(pendingRecommendations().map(group => group.kind));
  });

  it('服务端某一份没取到只缺那一组', async () => {
    const { groups } = await searchRecommendations(async () => ({
      items: { items: [{ id: 11, name: '本地作品' }] }, jav: null, latest: {}, words: [],
    }));
    expect(groups.find(group => group.kind === 'asset')!.items).toHaveLength(1);
    expect(groups.find(group => group.kind === 'jav')!.items).toEqual([]);
    expect(groups.find(group => group.kind === 'performer')!.items).toEqual([]);
    expect(groups.find(group => group.kind === 'performer')!.action).toBe('全部艺人');
    expect(groups.some(group => group.pending)).toBe(false);
  });
});
