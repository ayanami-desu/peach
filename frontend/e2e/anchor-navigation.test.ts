import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { launch, VIEWPORTS } from './harness.ts';
import { openItemPage } from './item-fixture.ts';

describe('页面滚动定位', () => {
  let browser: Browser;
  before(async () => { browser = await launch() });
  after(async () => { await browser?.close() });
  for (const viewport of VIEWPORTS) {
    for (const reduced of [false, true]) {
      it(`${viewport.name}：内容就绪后定位，减少动态效果=${reduced}`, { timeout: 60_000 }, async () => {
        const opened = await openItemPage(browser, '/', viewport, { ready: '#grid [data-media-card]' });
        const { page } = opened;
        let release!: () => void;
        const waiting = new Promise<void>(resolve => { release = resolve });
        try {
          await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
          await page.route('**/api/library-processing', async route => {
            await waiting;
            await route.fulfill({ json: { status: 'idle' } });
          });
          await page.reload({ waitUntil: 'load' });
          await page.locator('#grid [data-media-card]').first().waitFor();
          await page.evaluate(() => {
            const scroll = Element.prototype.scrollIntoView;
            const calls: { id: string; behavior: string | undefined }[] = [];
            Object.assign(window, { anchorScrolls: calls });
            Element.prototype.scrollIntoView = function(options) {
              calls.push({ id: this.id, behavior: typeof options === 'object' ? options.behavior : undefined });
              return scroll.call(this, options);
            };
            const link = document.createElement('a');
            link.href = '/data-cleanup#libraryProcessing'; link.textContent = '打开扫描与采集';
            document.querySelector('#main')!.prepend(link);
          });
          const navigations: string[] = [];
          page.on('request', request => { if (request.isNavigationRequest()) navigations.push(request.url()) });
          await page.getByRole('link', { name: '打开扫描与采集', exact: true }).click();
          await page.waitForURL('**/data-cleanup#libraryProcessing');
          assert.deepEqual(navigations, [], '跨页锚点复用站内导航');
          await page.waitForTimeout(150);
          assert.ok(await page.locator('#libraryProcessing [data-skeleton-action]').count() > 0, '依赖内容就绪前保留扫描骨架');
          assert.equal(await page.evaluate(() => (window as unknown as {
            anchorScrolls: { id: string }[];
          }).anchorScrolls.some(call => call.id === 'libraryProcessing')), false, '内容就绪前不按骨架位置定位');
          release();
          await page.locator('#libraryProcessing [data-skeleton-action]').first().waitFor({ state: 'detached' });
          await page.locator('#libraryProcessing section[aria-label="扫描与采集"]').waitFor();
          await page.waitForFunction(expected => {
            const calls = (window as unknown as { anchorScrolls: { id: string; behavior: string }[] }).anchorScrolls;
            return calls.some(call => call.id === 'libraryProcessing' && call.behavior === expected);
          }, reduced ? 'instant' : 'smooth');
          await page.waitForFunction(() => {
            const target = document.getElementById('libraryProcessing')!;
            const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
            const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
            const desired = Math.min(target.getBoundingClientRect().top + scrollY - margin - padding,
              document.documentElement.scrollHeight - innerHeight);
            return Math.abs(scrollY - desired) < 2;
          });
          const before = await page.locator('#libraryProcessing').evaluate(node => node.getBoundingClientRect().top);
          await page.waitForTimeout(200);
          assert.ok(Math.abs(await page.locator('#libraryProcessing').evaluate(node => node.getBoundingClientRect().top) - before) < 2);
          await page.evaluate(() => {
            Object.assign(window, { cleanupNode: document.getElementById('libraryProcessing') });
            const link = document.createElement('a');
            link.href = '#cleanup-maintenance'; link.textContent = '定位维护工具';
            document.getElementById('libraryProcessing')!.prepend(link);
          });
          await page.getByRole('link', { name: '定位维护工具', exact: true }).click();
          await page.waitForFunction(expected => {
            const state = window as unknown as { anchorScrolls: { id: string; behavior: string }[]; cleanupNode: Element };
            return state.anchorScrolls.some(call => call.id === 'cleanup-maintenance' && call.behavior === expected)
              && state.cleanupNode === document.getElementById('libraryProcessing');
          }, reduced ? 'instant' : 'smooth');
          assert.deepEqual(opened.problems, []);
        } finally { release(); await opened.close() }
      });
      it(`${viewport.name}：栏目位置平滑往返，双击导航回顶，减少动态效果=${reduced}`, { timeout: 60_000 }, async () => {
        const opened = await openItemPage(browser, '/', viewport, { ready: '#grid [data-media-card]' });
        const { page } = opened;
        try {
          await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
          await page.evaluate(() => {
            document.getElementById('main')!.style.minHeight = '6000px';
            const scroll = window.scrollTo.bind(window);
            const calls: ScrollToOptions[] = [];
            Object.assign(window, { pageScrolls: calls });
            window.scrollTo = (options: ScrollToOptions | number, y?: number) => {
              if (typeof options === 'number') scroll(options, y ?? 0);
              else { calls.push(options); scroll(options) }
            };
          });
          const move = async (nav: string, path: string, top: number, double = false) => {
            await page.evaluate(() => { (window as unknown as { pageScrolls: ScrollToOptions[] }).pageScrolls.length = 0 });
            if (viewport.mobile) await page.locator('header button[aria-label="展开侧栏"]').click();
            const item = page.locator(`#drawer [data-nav="${nav}"]`);
            if (double) await item.dblclick(); else await item.click();
            await page.waitForURL(url => url.pathname + url.search === path);
            await page.waitForFunction(({ behavior, top }) => {
              const calls = (window as unknown as { pageScrolls: ScrollToOptions[] }).pageScrolls;
              return calls.some(call => call.top === top && call.behavior === behavior) && scrollY === top;
            }, { top, behavior: reduced ? 'instant' : 'smooth' });
          };
          await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
          await move('performers', '/performers', 0);
          await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }));
          await move('', '/', 700);
          await move('', '/', 0, true);
          await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
          await move('performers', '/performers', 1000);
          await move('', '/', 700);
          await move('studios', '/studios', 0);
          assert.deepEqual(opened.problems, []);
        } finally { await opened.close() }
      });
    }
  }
});
