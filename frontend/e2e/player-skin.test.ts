/* 合成短片上的播放器皮肤几何与状态。 */
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { join } from 'node:path';
import type { Browser } from 'playwright-core';
import { launch, requiredEnv, visit, VIEWPORTS } from './harness.ts';

describe('播放器皮肤', () => {
  let browser: Browser;
  before(async () => { browser = await launch() });
  after(async () => { await browser?.close() });

  it('首次加载模块期间保留海报，控制条从完整皮肤开始显示', { timeout: 60_000 }, async () => {
    let release!: () => void;
    let moduleRequested!: Promise<unknown>;
    const gate = new Promise<void>(resolve => { release = resolve });
    const opened = await visit(browser, `/assets/${requiredEnv('PEACH_E2E_ITEM')}`, VIEWPORTS[0]!, async page => {
      const modulePath = '**/vendor/videojs/*/video-player.js';
      moduleRequested = page.waitForRequest(modulePath);
      await page.route(modulePath, async route => { await gate; await route.continue() });
    });
    try {
      await moduleRequested;
      const video = opened.page.locator('#stage video.video-js');
      await video.waitFor();
      assert.equal(await video.evaluate((node: HTMLVideoElement) => node.controls), false, '模块加载期间不显示浏览器控制条');
      release();
      await opened.page.locator('#stage .vjs-peach-right-controls').waitFor();
      assert.equal(await opened.page.locator('#stage .vjs-control-bar').evaluate(bar => getComputedStyle(bar).visibility), 'visible');
      assert.equal(await opened.page.locator('#stage video.vjs-tech').evaluate((node: HTMLVideoElement) => node.controls), false);
      assert.deepEqual(opened.problems, []);
    } finally { release(); await opened.close() }
  });

  for (const viewport of VIEWPORTS) {
    it(`${viewport.name}：旋转和倍速只在本页生效，刷新回到原始方向与 1 倍速`, { timeout: 60_000 }, async () => {
      const opened = await visit(browser, `/assets/${requiredEnv('PEACH_E2E_ITEM')}`, viewport, async page => {
        await page.addInitScript(() => localStorage.setItem('peach.settings.v1', JSON.stringify({ detailAutoplay: false })));
      });
      const { page } = opened;
      try {
        await page.locator('#stage .vjs-peach-settings-toggle').click();
        await page.locator('#stage [data-player-rotation]').click();
        await page.locator('#stage [data-player-rotation-option="90"]').click();
        await page.locator('#stage [data-player-speed]').click();
        await page.locator('#stage [data-player-speed-option="1.5"]').click();
        await page.locator('#stage [data-player-menu-back]').click();
        await page.waitForFunction(() => {
          const video = document.querySelector<HTMLVideoElement>('#stage video.vjs-tech');
          return video?.style.transform.includes('rotate(90deg)') && video.playbackRate === 1.5;
        });
        await page.reload();
        /* 播放记忆随盘离场（ADR-0157）：旋转与倍速只挂在这一次挂载的播放器上，
           刷新后播放器重新挂载，回到原始方向与 1 倍速。 */
        await page.locator('#stage video.vjs-tech').waitFor();
        const restored = await page.locator('#stage video.vjs-tech').evaluate((element) => {
          const video = element as HTMLVideoElement;
          return { rate: video.playbackRate, rotated: video.style.transform.includes('rotate') };
        });
        assert.equal(restored.rate, 1, '刷新后不恢复倍速');
        assert.equal(restored.rotated, false, '刷新后不恢复旋转');
        await page.locator('#stage .vjs-peach-settings-toggle').click();
        assert.equal(await page.locator('#stage [data-player-rotation] b').textContent(), '0°');
        assert.equal(await page.locator('#stage [data-player-speed] b').textContent(), '正常');
        assert.deepEqual(opened.problems, []);
      } finally { await opened.close() }
    });

    it(`${viewport.name}：旋转画面适配播放器并恢复原始方向`, { timeout: 60_000 }, async () => {
      const opened = await visit(browser, `/assets/${requiredEnv('PEACH_E2E_ITEM')}`, viewport, async page => {
        await page.addInitScript(() => localStorage.setItem('peach.settings.v1', JSON.stringify({ detailAutoplay: false })));
      });
      const { page } = opened;
      try {
        await page.locator('#stage .vjs-peach-settings-toggle').click();
        const rotationIcon = await page.locator('#stage [data-player-rotation]>svg').first().evaluate(icon => ({
          fill: getComputedStyle(icon).fill, stroke: getComputedStyle(icon).stroke,
        }));
        assert.equal(rotationIcon.fill, 'none');
        assert.notEqual(rotationIcon.stroke, 'none');
        for (const angle of [90, 180, 270, 0]) {
          await page.locator('#stage [data-player-rotation]').click();
          await page.locator(`#stage [data-player-rotation-option="${angle}"]`).click();
          const state = await page.locator('#stage video.vjs-tech').evaluate(video => {
            const bounds = video.getBoundingClientRect();
            const container = video.closest('media-container')!.getBoundingClientRect();
            return { transform: (video as HTMLElement).style.transform,
              fit: getComputedStyle(video).objectFit, width: bounds.width, height: bounds.height,
              containerWidth: container.width, containerHeight: container.height };
          });
          assert.equal(state.transform.includes(`rotate(${angle}deg)`), angle !== 0);
          assert.ok(Math.abs(state.width - state.containerWidth) < 1);
          assert.ok(Math.abs(state.height - state.containerHeight) < 1);
          if (angle) assert.equal(state.fit, 'contain');
        }
        assert.deepEqual(opened.problems, []);
      } finally { await opened.close() }
    });

    it(`${viewport.name}：控制组贴右、进度圆点唯一、全屏保留控件`, { timeout: 60_000 }, async () => {
      const opened = await visit(browser, `/assets/${requiredEnv('PEACH_E2E_ITEM')}`, viewport, async page => {
        await page.addInitScript(theme => localStorage.setItem('peach.settings.v1',
          JSON.stringify({ detailAutoplay: true, theme })), viewport.mobile ? 'dark' : 'light');
      });
      const { page, problems } = opened;
      try {
        await page.locator('#stage .vjs-peach-bezel').waitFor({ state: 'attached' });
        await page.screenshot({ path: join(process.cwd(), `../build/player-skin-${viewport.name}.png`) });
        const geometry = await page.locator('#stage .video-js').evaluate(root => {
          const bar = root.querySelector('.vjs-control-bar')!.getBoundingClientRect();
          const group = root.querySelector('.vjs-peach-right-controls')!.getBoundingClientRect();
          const slider = root.querySelector('.vjs-progress-holder')!;
          const thumb = slider.querySelector('media-slider-thumb')!;
          return { rightGap: bar.right - group.right, thumbOpacity: getComputedStyle(thumb).opacity,
            progressDot: getComputedStyle(slider.querySelector('.vjs-play-progress')!, '::before').content };
        });
        assert.ok(Math.abs(geometry.rightGap) < 1, `右侧控制组离右边缘 ${geometry.rightGap}px`);
        assert.equal(geometry.thumbOpacity, '1', '进度圆点常驻');
        assert.equal(geometry.progressDot, 'none', '进度仅由一枚滑块显示圆点');
        if (!viewport.mobile) {
          await page.locator('#stage .vjs-volume-panel').hover();
          const volume = (await page.locator('#stage .vjs-volume-panel').boundingBox())!;
          assert.equal(volume.width, 111, '音量胶囊展开为 111px');
          const right = (await page.locator('#stage .vjs-peach-right-controls').boundingBox())!;
          const bar = (await page.locator('#stage .vjs-control-bar').boundingBox())!;
          assert.ok(Math.abs(right.x + right.width - bar.x - bar.width) < 1);
        }
        // 演示库的进度预览使用合成图片，不依赖后台抽帧完成时间。
        await page.route('**/poster?**', route => route.fulfill({ contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270"><rect width="480" height="270" fill="#888"/></svg>' }));
        await page.waitForFunction(() => document.querySelector<HTMLVideoElement>('#stage video.vjs-tech')!.readyState >= 2);
        const progress = (await page.locator('#stage .vjs-progress-control').boundingBox())!;
        await page.mouse.click(progress.x + progress.width / 2, progress.y + 3);
        await page.waitForFunction(() => document.querySelector<HTMLVideoElement>('#stage video.vjs-tech')!.currentTime > .5);
        const dot = await page.locator('#stage .vjs-progress-thumb').evaluate(thumb => {
          const box = thumb.getBoundingClientRect();
          return { width: box.width, height: box.height, color: getComputedStyle(thumb).backgroundColor,
            fill: getComputedStyle(thumb.parentElement!.querySelector('.vjs-play-progress')!).backgroundColor };
        });
        assert.ok(Math.abs(dot.width - dot.height) < .1, '进度圆点保持正圆');
        assert.equal(dot.color, dot.fill, '进度圆点与已播段使用同一颜色');
        if (viewport.mobile) await page.locator('#stage [data-player-expand]').click();
        await page.locator('#stage media-fullscreen-button').click();
        await page.waitForFunction(() => !!document.fullscreenElement);
        const fullscreen = await page.locator('#stage media-container').evaluate(container => {
          const frame = container.getBoundingClientRect();
          const play = container.querySelector('media-play-button')!.getBoundingClientRect();
          const full = container.querySelector('media-fullscreen-button')!.getBoundingClientRect();
          return { frame: [frame.width, frame.height], viewport: [innerWidth, innerHeight],
            fit: getComputedStyle(container.querySelector('video')!).objectFit,
            controlsInside: play.y >= 0 && full.right <= innerWidth && play.bottom <= innerHeight };
        });
        assert.deepEqual(fullscreen.frame, fullscreen.viewport);
        assert.equal(fullscreen.controlsInside, true);
        assert.equal(fullscreen.fit, 'contain', '全屏保留完整视频画面');
        await page.locator('#stage media-fullscreen-button').click();
        await page.waitForFunction(() => !document.fullscreenElement);
        assert.deepEqual(problems, []);
      } finally { await opened.close() }
    });
  }
});
