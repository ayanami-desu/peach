/* JAV 探索卡（`react/jav/`）在真浏览器里的排版：元信息区按实际内容定高，屏外跳过渲染也不改变卡片高度。
 *
 * 卡片在 `jav.css` 里换成两行标题、署名竖排或日期折行；馆藏卡那份固定估高（`--card-meta-block`）套不上
 * 这两种密度，跳过渲染时每张卡进视口才长高，上方的卡一长，视口就被挪开。这里逐张断言进视口前后高度不变：
 * 不带修复时宽松与密集两档都会失败。聚合接口 `/api/jav/discoveries` 换成固定的一份桩，演示库没有
 * 那么多待探索作品。 */
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { Browser } from 'playwright-core';

import { launch, settle, visit, VIEWPORTS } from './harness.ts';

const unrelated = (problems: string[]) => problems.filter((line) => !line.includes('/api/links/check'));

describe('JAV 探索卡排版', () => {
  let browser: Browser;

  before(async () => {
    browser = await launch();
  });

  after(async () => {
    await browser.close();
  });

  for (const viewport of VIEWPORTS) {
    it(`${viewport.name}：探索卡进视口前后高度不变`, { timeout: 90_000 }, async () => {
      const opened = await visit(browser, '/jav', viewport, async (page) => {
        await page.route('**/api/result-updates', route => route.fulfill({ json: { result_versions: {} } }));
        /* 三种署名：多位出演者、没有发行日、一位出演者带日期；标签名有长有短，标题有大半是长的。 */
        await page.route('**/api/jav/discoveries?*', route => route.fulfill({ json: {
          items: Array.from({ length: 30 }, (_, index) => ({
            id: index + 300, code: `PCH-${index + 300}`,
            title: index % 4 === 0 ? '很长的作品标题用于检查两行截断'.repeat(4) : '探索作品',
            performers: '来源原名', has_cover: false,
            performer_refs: (index % 3 === 0 ? ['规范姓名', '第二位女优', '第三位女优'] : ['规范姓名'])
              .map((name, ref) => ({ id: 42 + ref, name, has_image: false })),
            ...(index % 3 === 1 ? {} : { release_date: '2024-06-03' }),
            tags: index % 2 ? ['恋足', '单体作品', '高画质'] : ['很长的标签名称一枚', '巨乳'],
          })),
          candidate_total: 30, sort: 'release_date', direction: 'desc', limited: false, source: 'library',
        } }));
      });
      const { page } = opened;
      try {
        await settle(page);
        for (const density of ['roomy', 'dense']) {
          await page.goto(new URL('/jav', page.url()).href);
          const cards = page.locator('[data-media-grid] article[data-jav-card]');
          await cards.first().waitFor();
          await page.evaluate(value => { document.body.dataset.density = value; window.scrollTo(0, 0) }, density);
          const frame = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const heights = () => cards.evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().height * 10) / 10));
          await frame();
          const before = await heights();
          assert.equal(before.length, 30);
          for (const card of await cards.all()) { await card.scrollIntoViewIfNeeded(); await frame() }
          await page.evaluate(() => window.scrollTo(0, 0));
          await frame();
          const shown = await heights();
          assert.deepEqual(shown, before, `${density}：屏外卡进视口后长高或变矮`);
        }
        assert.deepEqual(unrelated(opened.problems), []);
      } finally { await opened.close() }
    });
  }
});
