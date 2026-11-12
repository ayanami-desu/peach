/* 整理范围：来源与范围两个下拉，长范围名在桌面／手机上都不撑宽页面。 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { layout, visit } from './harness.ts';
import { DESKTOP, MOBILE, installDesignBrowser } from './design-fixture.ts';

/** 名称特别长的扫描根：下拉要把名字截住，不能把页面撑宽。 */
const LONG_ROOT = `合集-${'长目录名称'.repeat(20)}`;

describe('整理范围', () => {
  let browser: Browser;
  installDesignBrowser((next) => { browser = next; });

  it('来源与范围各一个下拉，长范围名不撑宽页面', { timeout: 60_000 }, async () => {
    for (const viewport of [DESKTOP, MOBILE]) {
      const opened = await visit(browser, '/data-cleanup/organize', viewport, async (page) => {
        await page.route('**/api/organize', (route) => route.fulfill({ json: {
          status: 'idle', locations: [{ location: 'gdrive', roots: ['合集', LONG_ROOT] }],
          templates: {}, presets: [], placeholders: [], last_batch: '',
        } }));
      });
      try {
        const page = opened.page;
        const scope = page.locator('[data-organize-scope]');
        const triggers = scope.locator('button[aria-haspopup="listbox"]');
        await triggers.first().waitFor({ timeout: 15_000 });
        assert.equal(await triggers.count(), 2, '来源与范围各有一个下拉');
        assert.equal(await page.locator('input[name="organize-path"]').count(), 0, '不再有手填路径的输入框');
        assert.equal(await page.getByRole('textbox', { name: '整理路径', exact: true }).count(), 0);
        await triggers.nth(1).click();
        await page.getByRole('option', { name: LONG_ROOT, exact: true }).click();
        for (const dark of [false, true]) {
          await page.evaluate((isDark) => document.documentElement.classList.toggle('dark', isDark), dark);
          const geometry = await scope.evaluate((element) => {
            const box = element.getBoundingClientRect();
            const [source, range] = [...element.querySelectorAll('button[aria-haspopup="listbox"]')]
              .map((node) => node.getBoundingClientRect());
            return { box: { left: box.left, right: box.right },
              source: { left: source.left, right: source.right, top: source.top, bottom: source.bottom },
              range: { left: range.left, right: range.right, top: range.top, bottom: range.bottom } };
          });
          assert.ok(geometry.range.top >= geometry.source.bottom - 1 || geometry.range.left >= geometry.source.right - 1,
            `范围要么在来源下面换行，要么在它右侧：${JSON.stringify(geometry)}`);
          assert.ok(geometry.source.left >= geometry.box.left - 1 && geometry.range.right <= geometry.box.right + 1,
            `两个下拉都不横向溢出整理范围这一行：${JSON.stringify(geometry)}`);
          assert.ok(geometry.range.right - geometry.range.left >= 99, `范围下拉至少 100px 宽：${JSON.stringify(geometry)}`);
          const measured = await layout(page);
          assert.ok(measured.scrollWidth <= measured.viewportWidth + 1, JSON.stringify(measured));
        }
      } finally { await opened.close(); }
    }
  });
});
