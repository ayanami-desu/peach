import { describe, expect, it } from 'vitest';
import { getManageMenuSections, NAV_CATALOG, SIDEBAR_ITEMS } from '../../src/application/navigation-items';
import { DEFAULT_SIDEBAR_ORDER, normalizeSidebarOrder } from '../../src/sidebar';

describe('应用导航词表', () => {
  it('播放列表的下一项是沉浸模式，可选入口不挤进默认可见顺序', () => {
    const keys = SIDEBAR_ITEMS.map(([key]) => key);
    expect(keys.slice(keys.indexOf('playlists'), keys.indexOf('playlists') + 2)).toEqual(['playlists', 'immerse']);
    expect(normalizeSidebarOrder([])).toEqual(DEFAULT_SIDEBAR_ORDER);
    expect(DEFAULT_SIDEBAR_ORDER).not.toContain('immerse');
    expect(NAV_CATALOG.map(([key]) => key)).toContain('immerse');
  });

  it('每个导航身份只有一项，JAV 与播放列表有各自可见名称', () => {
    const keys = NAV_CATALOG.map(([key]) => key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(NAV_CATALOG.find(([key]) => key === 'jav')?.[1]).toBe('JAV');
    expect(NAV_CATALOG.find(([key]) => key === 'playlists')?.[1]).toBe('播放列表');
  });

  it('配置入口始终在管理菜单里，顺序按偏好排', () => {
    const sections = getManageMenuSections(['stats', 'configuration']);
    expect(sections.map(([key]) => key)).toEqual(['stats', 'configuration', 'cleanup', 'activity']);
  });
});
