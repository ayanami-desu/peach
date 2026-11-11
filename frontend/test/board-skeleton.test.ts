import { describe, expect, it, vi } from 'vitest';
import { boardPageSkeleton, detailSkeletonBody } from '../src/board-skeleton';

vi.mock('@peach/legacy/core', async importOriginal => ({
  ...await importOriginal<object>(),
  icon: (name: string) => `<svg aria-hidden="true" data-icon="${name}"></svg>`,
}));

describe('Board 页面骨架', () => {
  it.each([
    ['drives', '网盘'], ['libraries', '媒体库'], ['access', '访问与安全'], ['token', 'API 令牌'],
    ['devices', '设备会话'], ['speed', '任务速度'], ['diagnostics', '系统诊断'],
  ])('配置深链 %s 使用对应分区', (key, label) => {
    const root = document.createElement('div');
    root.innerHTML = boardPageSkeleton(`/settings/${key}`);
    const tabs = [...root.querySelectorAll('.ui-board-local-nav button')];
    expect(tabs).toHaveLength(7);
    expect(tabs.filter(tab => tab.getAttribute('aria-selected') === 'true').map(tab => tab.textContent)).toEqual([label]);
  });
  it.each(['/stats', '/settings/diagnostics', '/tasks', '/duplicates', '/quality-goals', '/playlists'])('为 %s 提供单一等待语义', path => {
    const root = document.createElement('div');
    root.innerHTML = boardPageSkeleton(path);
    expect(root.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(root.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(root.querySelector('[aria-hidden="true"][inert]')).not.toBeNull();
    for (const control of root.querySelectorAll('button, input, a, summary')) {
      expect(control.closest('[inert]')).not.toBeNull();
    }
  });
  it('探索页骨架是标题与筛选推荐框，排序键按地址栏画', () => {
    const before = location.pathname + location.search;
    history.replaceState(null, '', '/jav?sort=duration&dir=asc');
    const root = document.createElement('div');
    root.innerHTML = boardPageSkeleton('/jav');
    history.replaceState(null, '', before);
    expect(root.querySelector('[data-page-title]')?.textContent).toBe('探索');
    expect(root.querySelector('[data-index-search] input')?.getAttribute('aria-label')).toBe('筛选推荐');
    expect([...root.querySelectorAll('[data-entity-sort]')].map(node => node.textContent))
      .toEqual(['发行时间', '来源评分', '时长', '番号']);
    expect(root.querySelector('[data-entity-sort][aria-pressed="true"]')?.getAttribute('data-entity-sort')).toBe('duration');
    expect(root.querySelector('[data-entity-batch]')).toBeNull();
    expect(root.querySelector('[data-filter-glass]')).not.toBeNull();
  });
  it('统计预留四张指标卡，未知页面交给自身骨架', () => {
    const root = document.createElement('div');
    root.innerHTML = boardPageSkeleton('/stats');
    expect(root.querySelectorAll('[data-stats-metrics] > div')).toHaveLength(4);
    expect(boardPageSkeleton('/assets/5')).toBe('');
  });
  it.each([
    ['/stats', '[data-stats-chart]', 2],
    ['/tasks', '.activitysection', 3],
    ['/duplicates', '[data-duplicate-group] .duplicate-row', 4],
    ['/quality-goals', '.peach-react .card-grid-cover > li', 6],
    ['/settings/diagnostics', '.peach-react .ui-configpage [data-skeleton="diagnostics"]', 1],
    ['/playlists', '.ui-playlistcards > .playlistcard', 6],
  ] as const)('%s 复用最终内容容器', (path, selector, count) => {
    const root = document.createElement('div');
    root.innerHTML = boardPageSkeleton(path);
    expect(root.querySelectorAll(selector)).toHaveLength(count);
    expect(root.querySelector('.skeleton-cards')).toBeNull();
  });
  it('详情保留媒体区和资料侧栏，不创建播放器', () => {
    const root = document.createElement('div');
    root.innerHTML = detailSkeletonBody();
    expect(root.querySelector('[data-stage-grid] > [data-stage-media]')).not.toBeNull();
    expect(root.querySelector('[data-stage-grid] > [data-stage-side] > [data-stage-side-content]')).not.toBeNull();
    expect(root.querySelectorAll('video, audio, iframe')).toHaveLength(0);
  });
});
