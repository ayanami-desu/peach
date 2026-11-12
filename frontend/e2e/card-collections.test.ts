import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { launch, VIEWPORTS } from './harness.ts';
import { openItemPage } from './item-fixture.ts';

describe('卡片信息与收藏入口', () => {
  let browser: Browser;
  before(async () => { browser = await launch() });
  after(async () => { await browser.close() });
  for (const viewport of VIEWPORTS) {
    it(`${viewport.name} 收藏入口是紧凑图标按钮，播放媒体没有侧箭头`, async () => {
      const opened = await openItemPage(browser, '/', viewport, { ready: '[data-catalog-frame]' });
      try {
        const geometry = await opened.page.locator('[data-shortcuts-trigger]').evaluate(node => {
          const button = node.getBoundingClientRect(), readout = document.querySelector('[data-catalog-readout]')!.getBoundingClientRect();
          return { width: button.width, height: button.height, text: node.textContent?.trim(),
            glide: !!node.parentElement?.querySelector('[data-view-glide]'),
            gap: button.left - readout.right, parent: node.closest('[data-entity-sorts]') !== null };
        });
        assert.equal(geometry.parent, false);
        assert(geometry.width >= 30 && geometry.width <= 40 && geometry.width === geometry.height
          && geometry.gap >= 0 && geometry.gap <= 16, JSON.stringify(geometry));
        assert.equal(geometry.text, '');
        assert.equal(geometry.glide, false);
        await opened.page.goto(new URL('/item/31', opened.page.url()).href);
        await opened.page.locator('[data-carousel-video-active]').waitFor();
        assert.equal(await opened.page.locator('[data-carousel-video-active] [data-follow-image-step]:visible').count(), 0);
        await opened.page.locator('[data-follow-image-item="-1"]').click();
        assert.equal(await opened.page.locator('[data-follow-image-step]:visible').count(), 2);
      } finally { await opened.close() }
    });
  }
});
