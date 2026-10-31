/* 触屏封面补底的合成层。
 *
 * iOS Safari 滚动时会逐帧重栅格化 `[data-media-pic]::before` 上的 26px 模糊；补底又铺着
 * 1600 档封面，重栅格一帧就闪一次。修复只给真的有补底的格子（`data-cover-blur`）在
 * 粗指针下加 `translateZ(0)`，桌面与没有补底的卡都不建层。
 *
 * 这里不依赖演示库恰好有需要补底的封面：注入一个最小的 `.peach-react` 卡片，直接量
 * 伪元素的计算样式。触屏断言不是 none，桌面断言 none，未标记的卡两边都不建层。 */
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { Browser } from 'playwright-core';

import { launch, visit, VIEWPORTS } from './harness.ts';

const FILL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

describe('触屏封面补底的合成层', () => {
  let browser: Browser;
  before(async () => { browser = await launch(); });
  after(async () => { await browser?.close(); });

  for (const viewport of VIEWPORTS) {
    it(`${viewport.name} 只给带补底的封面提升合成层`, async () => {
      const opened = await visit(browser, '/', viewport);
      try {
        await opened.page.evaluate((fill) => {
          const host = document.createElement('div');
          host.className = 'peach-react';
          host.innerHTML = `<div data-media-pic data-cover-blur style="width:100px;height:100px;--cover-blur:url('${fill}')"></div>`
            + '<div data-media-pic style="width:100px;height:100px"></div>';
          document.body.append(host);
        }, FILL);
        const state = await opened.page.evaluate(() => {
          const marked = document.querySelector<HTMLElement>('.peach-react [data-media-pic][data-cover-blur]')!;
          const plain = document.querySelector<HTMLElement>('.peach-react [data-media-pic]:not([data-cover-blur])')!;
          return {
            coarse: matchMedia('(pointer: coarse)').matches,
            marked: getComputedStyle(marked, '::before').transform,
            plain: getComputedStyle(plain, '::before').transform,
          };
        });
        assert.equal(state.coarse, viewport.mobile);
        assert.equal(state.plain, 'none', '没有补底的卡不该建层');
        if (viewport.mobile) assert.notEqual(state.marked, 'none', '触屏补底应提升为合成层');
        else assert.equal(state.marked, 'none', '桌面不额外建层');
        assert.deepEqual(opened.problems, []);
      } finally {
        await opened.close();
      }
    });
  }
});
