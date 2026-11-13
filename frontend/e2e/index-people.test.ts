import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { launch, requiredEnv, settle, visit, VIEWPORTS } from './harness.ts';

describe('本地与在线艺人共用名册布局', () => {
  let browser: Browser;
  before(async () => { browser = await launch() });
  after(async () => { await browser?.close() });
  for (const path of ['/tags', '/tags?scope=online', '/performers', '/performers?scope=online', '/creators', '/studios', '/agencies', '/series']) {
    it(`索引标题和操作同排，搜索框按可用空间收缩（${path}）`, { timeout: 60_000 }, async () => {
      const opened = await visit(browser, path, VIEWPORTS[0]);
      try {
        const page = opened.page;
        await settle(page);
        if (await page.locator('#drawer.open').count()) await page.locator('#filterBtn').click();
        for (const width of [1280, 761, 760, 640, 390, 320]) {
          await page.setViewportSize({ width, height: 844 });
          await settle(page);
          const read = () => page.locator('[data-index-head]').evaluate(head => {
            const title = head.querySelector('h2')!.getBoundingClientRect();
            const search = head.querySelector('[data-index-search]')!.getBoundingClientRect();
            const controls = [...head.querySelectorAll('[data-shortcuts-trigger],[data-tag-mode],[data-index-layout]')];
            return {
              searchWidth: search.width,
              centers: [search, ...controls.map(node => node.getBoundingClientRect())].map(box => (box.top + box.bottom - title.top - title.bottom) / 2),
              contained: controls.every(node => { const box = node.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth }),
              overflow: document.documentElement.scrollWidth > innerWidth,
            };
          });
          for (const managing of path.startsWith('/tags') ? [false, true] : [false]) {
            if (managing) await page.locator('[data-tag-mode]').click();
            await settle(page);
            const shown = await read();
            assert.ok(shown.centers.every(delta => Math.abs(delta) < 1), `${width}px 操作或搜索框没有和标题同排：${JSON.stringify(shown)}`);
            assert.ok(shown.searchWidth >= 64 && shown.searchWidth <= 320, `${width}px 搜索框没有保持可输入宽度：${shown.searchWidth}`);
            assert.equal(shown.contained, true);assert.equal(shown.overflow, false);
            if (managing) await page.locator('[data-tag-mode]').click();
          }
        }
        assert.deepEqual(opened.problems, []);
      } finally { await opened.close() }
    });
  }
  for (const viewport of VIEWPORTS) {
    it(`两种版式的卡片尺寸一致，长名字留在卡片内（${viewport.name}）`, { timeout: 60_000 }, async () => {
      const opened = await visit(browser, '/performers', viewport);
      try {
        const page = opened.page;
        const names = ['Jul3D', 'LazyProcrastinator', 'Suzutaru 3D (鈴太郎3D)', '很长的艺人名称'.repeat(6)];
        await page.route('**/api/index?**', route => route.fulfill({ json: {
          items: names.map(k => ({ k, n: 3 })), has_more: false,
        } }));
        await page.route('**/api/follow/authors?**', route => route.fulfill({ json: {
          items: names.map(k => ({ k, key: k, n: 3, avatar: '', avatar_fallback: '', providers: [] })), has_more: false,
        } }));
        await page.reload({ waitUntil: 'load' });
        const cell = page.locator('#index [data-index-cell]').first();
        await cell.waitFor({ timeout: 15_000 });
        const measure = () => page.locator('#index [data-index-cell]').evaluateAll(elements => elements.map(element => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const name = element.querySelector('[data-index-name]')!.getBoundingClientRect();
          return { width: rect.width, padding: style.padding, radius: style.borderRadius,
            whiteSpace: style.whiteSpace, font: style.font, gap: style.gap,
            contained: name.left >= rect.left && name.right <= rect.right,
          };
        }));
        for (const label of ['紧凑 · 圆形头像', '大图 · 竖幅头像']) {
          await page.getByRole('radio', { name: label, exact: true }).press('Space');
          const layout = label.startsWith('紧凑') ? 'compact' : 'big';
          await page.locator(`#index [data-index-grid][data-layout="${layout}"]`).waitFor();
          await settle(page);
          const cards = await measure();
          assert.ok(cards.every(item => item.width >= 150 && item.contained && item.whiteSpace === 'normal'));
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        }
        assert.deepEqual(opened.problems, []);
      } finally { await opened.close() }
    });
  }
  it('卖家动画作者的旧链接就地落到艺人分类，地址、标题和历史只留一条', { timeout: 60_000 }, async () => {
    const opened = await visit(browser, '/performers', VIEWPORTS[0]);
    try {
      const page = opened.page;
      await page.locator('#index [data-index-page]').waitFor({ timeout: 15_000 });
      const before = await page.evaluate(() => history.length);
      const requests: string[] = [];
      page.on('request', request => {
        const url = new URL(request.url());
        if (url.pathname === '/api/index') requests.push(url.search);
      });
      await page.goto(requiredEnv('PEACH_E2E_ORIGIN') + '/creators?category=animation', { waitUntil: 'load' });
      await page.waitForURL(url => url.pathname === '/performers', { timeout: 15_000 });
      await page.locator('#index [data-index-page]').waitFor({ timeout: 15_000 });
      await settle(page);
      assert.equal(new URL(page.url()).searchParams.get('category'), 'animation');
      assert.equal(await page.evaluate(() => history.length), before + 1, '规范化不该多压一条历史');
      assert.equal(await page.evaluate(() => document.body.dataset.surface), '/performers');
      assert.match(await page.title(), /^艺人/);
      assert.equal(await page.locator('#index [data-index-page]').getAttribute('data-index-page'), 'performers');
      assert.equal(requests.length, 1, `名册只取一次：${requests.join(' | ')}`);
      assert.match(requests[0], /kind=performers/);
      assert.match(requests[0], /category=animation/);
      assert.deepEqual(opened.problems, []);
    } finally { await opened.close() }
  });
  it('名册过滤框在手机上弹出的软键盘回车键标成「搜索」', { timeout: 60_000 }, async () => {
    const opened = await visit(browser, '/performers', VIEWPORTS[1]);
    let release = () => {};
    try {
      const pending = new Promise<void>(resolve => { release = resolve });
      await opened.page.route('**/api/index?**', async route => { await pending; await route.fallback() });
      await opened.page.reload({ waitUntil: 'commit' });
      const input = opened.page.locator('#index [data-index-search] input');
      await opened.page.locator('#index [data-index-search] input[readonly]').waitFor({ timeout: 15_000 });
      assert.equal(await input.getAttribute('enterkeyhint'), 'search');
      release();
      await opened.page.locator('#index [data-index-search] input:not([readonly])').waitFor({ timeout: 15_000 });
      assert.equal(await input.getAttribute('enterkeyhint'), 'search');
      assert.deepEqual(opened.problems, []);
    } finally { release(); await opened.close() }
  });
});
