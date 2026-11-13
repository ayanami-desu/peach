/* 换主题那一刻，控件上的颜色过渡不播。
 *
 * 夹具默认按「减少动态效果」开页面，全局规则会把过渡一并关掉，这里要的正是过渡开着的样子，
 * 所以页面级改回 `no-preference`。同一页先绕过 `applyTheme` 直接写属性换一次，确认这枚按钮
 * 在这种换法下确实会起过渡，后面那句「为空」才说明是 `applyTheme` 关掉的。 */
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { launch, settle, visit, VIEWPORTS } from './harness.ts';

const desktop = VIEWPORTS.find((viewport) => !viewport.mobile)!;

describe('切换主题', () => {
  let browser: Browser;
  before(async () => { browser = await launch() });
  after(async () => { await browser.close() });

  it('侧栏底部的明暗、配色与设置控件在展开和收起时顺序一致', async () => {
    const opened = await visit(browser, '/', desktop);
    try {
      const { page } = opened;
      const drawer = page.locator('#drawer');
      if (!await drawer.evaluate(node => node.classList.contains('open'))) await page.locator('#filterBtn').click();
      await settle(page);
      const positions = () => page.locator('.board-sidebar-foot').evaluate(root => {
        const selectors = ['.board-theme-toggle', '#boardGlowBtn', '#settingsBtn'];
        return selectors.map(selector => {
          const r = root.querySelector(selector)!.getBoundingClientRect();
          return { x: r.left, y: r.top };
        });
      });
      const expanded = await positions();
      assert.ok(expanded[0]!.x < expanded[1]!.x && expanded[1]!.x < expanded[2]!.x);
      const buttons = await page.locator('.board-sidebar-foot button').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')));
      assert.deepEqual(buttons, ['浅色主题', '深色主题', '光晕配色', '打开设置']);
      await page.locator('#filterBtn').click();
      await page.waitForFunction(() => Math.round(document.querySelector('#drawer')!.getBoundingClientRect().width) === 60);
      await settle(page);
      const collapsed = await positions();
      assert.ok(collapsed[0]!.y < collapsed[1]!.y && collapsed[1]!.y < collapsed[2]!.y);
      assert.deepEqual(opened.problems, []);
    } finally { await opened.close(); }
  });

});
