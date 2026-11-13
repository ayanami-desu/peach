import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Browser, Page } from 'playwright-core';
import { launch, layout, requiredEnv, settle, VIEWPORTS } from './harness.ts';
import { JAV_DETAIL, mockJavDetail } from './jav-detail-fixture.ts';

describe('库外 JAV 作品详情', () => {
  const revealInStage = async (page: Page, selector: string) =>
    page.evaluate((targetSelector) => {
      const scroll = document.querySelector<HTMLElement>('[data-stage-scroll]');
      const target = scroll?.querySelector<HTMLElement>(targetSelector);
      if (!scroll || !target) throw new Error(`missing ${targetSelector}`);
      const host = scroll.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      scroll.scrollTop += box.top - host.top - (host.height - box.height - 140);
      const next = target.getBoundingClientRect();
      return { x: next.left + next.width / 2, y: next.top + next.height / 2 };
    }, selector);

  let browser: Browser;
  before(async () => { browser = await launch() });
  after(async () => { await browser.close() });

  for (const viewport of VIEWPORTS) {
    it(`${viewport.name}：加载骨架的两栏保持在详情画框内`, async () => {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
      let release!: () => void;
      const held = new Promise<void>(resolve => { release = resolve });
      try {
        await context.addInitScript(() => localStorage.setItem('peach.settings.v1', JSON.stringify({ detailAutoplay: false })));
        const page = await context.newPage();
        await mockJavDetail(page);
        await page.route(/\/api\/jav\/detail\?/, async route => {
          await held;
          await route.fulfill({ json: { ...JAV_DETAIL, preview_count: 0 } });
        });
        await page.goto(requiredEnv('PEACH_E2E_ORIGIN') + '/works/EXM-001', { waitUntil: 'domcontentloaded' });
        const skeleton = page.locator('#stage [data-skeleton="detail"]');
        await skeleton.waitFor();
        const bounds = await skeleton.evaluate(node => {
          const grid = node.querySelector('[data-stage-grid]')!.getBoundingClientRect();
          const media = node.querySelector('[data-stage-media]')!.getBoundingClientRect();
          const side = node.querySelector('[data-stage-side]')!.getBoundingClientRect();
          const shell = node.closest('[data-stage]')!.getBoundingClientRect();
          const lines = [...node.querySelectorAll('[data-stage-side] .skeleton')].map(line => line.getBoundingClientRect());
          return { grid: { width: grid.width, height: grid.height }, shellHeight: shell.height, mediaHeight: media.height,
            mediaWithin: media.left >= grid.left - 1 && media.right <= grid.right + 1,
            columnsSeparate: side.top >= media.bottom - 1 || media.right <= side.left + 1,
            linesWithin: lines.every(line => line.left >= side.left - 1 && line.right <= side.right + 1) };
        });
        assert.ok(bounds.mediaWithin && bounds.columnsSeparate && bounds.linesWithin, JSON.stringify(bounds));
        await page.screenshot({ path: `../build/jav-detail-pending-${viewport.name}.png` });
        release();
        await page.locator('#stage [data-jav-detail] h1').waitFor();
        const ready = await page.locator('#stage [data-jav-detail][data-stage-grid]').boundingBox();
        const shell = await page.locator('#stage').boundingBox();
        const media = await page.locator('#stage [data-jav-detail] > [data-stage-media]').boundingBox();
        assert.ok(ready && shell && media && Math.abs(ready.width - bounds.grid.width) <= 1
          && Math.abs(shell.height - bounds.shellHeight) <= 1 && Math.abs(media.height - bounds.mediaHeight) <= 1,
          JSON.stringify({ ready, bounds }));
      } finally { release(); await context.close() }
    });
    it(`${viewport.name} 作品详情预览切换与关闭返回`, { timeout: 60000 }, async () => {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.mobile, hasTouch: viewport.mobile, reducedMotion: 'reduce' });
      try {
        await context.addInitScript(() => localStorage.setItem('peach.settings.v1', JSON.stringify({ detailAutoplay: false })));
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await mockJavDetail(page);
        await page.route(/\/jav-image\?/, async route => {
          const portrait = new URL(route.request().url()).searchParams.get('image') === '1';
          if (portrait) await new Promise(resolve => setTimeout(resolve, 350));
          const [width, height] = portrait ? [600, 900] : [900, 600];
          await route.fulfill({ contentType: 'image/svg+xml',
            body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#777"/></svg>` });
        });
        await page.goto(requiredEnv('PEACH_E2E_ORIGIN') + '/');
        await page.goto(requiredEnv('PEACH_E2E_ORIGIN') + '/works/EXM-001');
        await page.locator('#stage [data-jav-detail] h1').waitFor({ state: 'visible' });
        assert.ok(await page.locator('#stage').evaluate(el => (el as HTMLDialogElement).open));
        await page.getByRole('img', { name: 'EXM-001 封面', exact: true }).waitFor({ state: 'visible' });
        const shared = await page.locator('[data-jav-info]').evaluate(el => {
          const faces = [...el.querySelectorAll('[data-identity-primary] [data-id-face]')].map(face => {
            const box = face.getBoundingClientRect(); return { width: box.width, height: box.height, y: box.y };
          });
          const stars = [...el.querySelectorAll('[data-jav-rating] [data-rate]')];
          const code = el.querySelector('[data-detail-title] b')!.getBoundingClientRect();
          const tag = el.querySelector('[data-jav-tags] [data-detail-tag]')!;
          const tagStyle = getComputedStyle(tag), detailStyle = getComputedStyle(el);
          const range = document.createRange();
          // 标题文字在带语言标记的 span 里：量它的第一个字。
          const text = el.querySelector('[data-detail-title] > span')!.firstChild!;
          range.setStart(text, 0); range.setEnd(text, 1);
          return { faces, stars: stars.length, filled: stars.filter(star => star.getAttribute('data-on') === 'true').length,
            icons: el.querySelectorAll('[data-stage-meta] [data-spec-item] svg').length,
            codeY: code.y, titleY: range.getBoundingClientRect().y,
            tag: el.querySelector('[data-jav-tags] [data-tag]')?.textContent,
            tagCat: el.querySelector('[data-jav-tags] [data-tag-cat]')?.getAttribute('data-tag-cat'),
            tagShape: { height: parseFloat(tagStyle.height), radius: parseFloat(tagStyle.borderRadius), border: parseFloat(tagStyle.borderTopWidth) },
            tagTokens: { height: parseFloat(detailStyle.getPropertyValue('--control-h-inline')),
              radius: parseFloat(detailStyle.getPropertyValue('--tag-radius')), border: 1 } };
        });
        assert.equal(shared.faces.length, 3, '女优、未知出演者与厂牌各有独立身份格');
        assert.equal(await page.locator('[data-id-gender="male"]').count(), 0);
        for (const [gender, label] of [['female', '女优'], ['unknown', '出演者']]) {
          assert.equal(await page.locator(`[data-id-gender="${gender}"] [data-id-label]`).textContent(), label);
          assert.equal(await page.locator(`[data-id-gender="${gender}"] [data-id-face]`).count(), 1);
        }
        assert.ok(shared.faces.every(face => face.width === 46 && face.height === 46));
        assert.ok(shared.faces.every(face => Math.abs(face.y - shared.faces[0]!.y) < 1));
        assert.equal(shared.stars, 5);
        assert.equal(shared.filled, 4);
        assert.equal(await page.locator('[data-jav-art]').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(0, 0, 0)');
        const ratingPoint = await revealInStage(page, '[data-jav-rating] [data-rate="1"]');
        await page.mouse.move(ratingPoint.x, ratingPoint.y);
        const fraction = await page.locator('[data-jav-info] > [data-jav-rating] [data-rate="5"]').evaluate(el =>
          el.querySelector('[data-rating-fill]')!.getBoundingClientRect().width / el.querySelector('[data-rating-icon]')!.getBoundingClientRect().width);
        assert.ok(Math.abs(fraction - 0.4) < 0.01, '4.4 的第五颗星填充 40%');
        const starLayers = await page.locator('[data-jav-info] > [data-jav-rating] [data-rate]').evaluateAll(nodes => nodes.map(node => {
          const [outline, fill] = node.querySelectorAll('svg');
          const a = outline!.getBoundingClientRect(), b = fill!.getBoundingClientRect();
          return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.width - b.width), Math.abs(a.height - b.height));
        }));
        assert.ok(starLayers.every(error => error < .5), JSON.stringify(starLayers));
        assert.equal(shared.icons, 2);
        assert.ok(Math.abs(shared.codeY - shared.titleY) < 2, '番号与标题在同一行开始');
        assert.equal(shared.tag, '痴女'); assert.equal(shared.tagCat, 'role');
        assert.deepEqual(shared.tagShape, shared.tagTokens, '新作标签沿用本地详情的高度、圆角与边框');
        await page.locator('[data-id-gender="female"] [data-id-face] img').waitFor({ state: 'visible' });
        assert.equal(await page.locator('[data-id-cell="studio"]').evaluate(node => node.tagName), 'SPAN', '未登记厂牌只显示名称');
        assert.equal(await page.locator('[data-follow-image-dots] button').count(), 12);
        const dots = await page.locator('[data-follow-image-dots]').evaluate(el => {
          const box = el.getBoundingClientRect();
          const rect = el.querySelector('[aria-current="true"]')!.getBoundingClientRect();
          return el.scrollWidth > el.clientWidth && rect.left >= box.left && rect.right <= box.right;
        });
        assert.ok(dots, '圆点条可滚动且当前项完整可见');
        assert.equal(await page.locator('[data-media-thumbnails]').count(), 1);
        await page.locator('[data-media-thumbnail="1"] img').waitFor({ state: 'visible' });
        const indicator = page.locator('[data-follow-image-dots]');
        const stripBox = await indicator.boundingBox(), mainBox = await page.locator('[data-jav-picture]').boundingBox();
        assert.ok(stripBox && mainBox && stripBox.y >= mainBox.y + mainBox.height);
        await indicator.hover();
        await page.mouse.wheel(0, 180);
        await page.waitForFunction(() => (document.querySelector('[data-follow-image-dots]')?.scrollLeft || 0) > 0);
        const imageDot = page.getByRole('button', { name: '预览 2', exact: true });
        await page.keyboard.press('Tab');
        await imageDot.focus();
        assert.equal(await page.locator('[data-follow-image-item][aria-current="true"]').getAttribute('data-follow-image-item'), '-1', '聚焦预览保持当前图片');
        await imageDot.click();
        await page.getByRole('img', { name: 'EXM-001 预览 2', exact: true }).waitFor();
        await page.getByRole('button', { name: '封面', exact: true }).click();
        if (viewport.mobile) {
          await page.setViewportSize({ width: 350, height: viewport.height });
          assert.equal(await page.locator('[data-follow-image-dots] button').count(), 12);
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.locator('[data-follow-image-dots]').waitFor({ state: 'visible' });
        }
        await page.getByRole('button', { name: '下一项媒体', exact: true }).click();
        await page.getByRole('img', { name: 'EXM-001 预览 1', exact: true }).waitFor({ state: 'visible' });
        await page.getByRole('button', { name: '上一项媒体', exact: true }).click();
        const sourceButton = page.getByRole('link', { name: '作品来源', exact: true });
        assert.deepEqual(await page.locator('[data-jav-actions] :is(button, a)').allTextContents(), ['作品来源']);
        assert.ok(await sourceButton.evaluate(el => parseFloat(getComputedStyle(el).borderWidth) > 0));
        await settle(page, '#stage[open]');
        const geometry = await layout(page);
        assert.ok(geometry.scrollWidth <= geometry.viewportWidth + 1);
        assert.deepEqual(errors, []);
        await page.screenshot({ path: `../build/jav-detail-${viewport.name}.png` });
        await page.locator('#closeStage').click();
        await page.waitForURL(url => url.pathname === '/jav' && url.searchParams.get('tab') === 'discover');
        assert.equal(await page.locator('#stage').count(), 0);
        await page.goBack();
        await page.locator('#stage [data-jav-detail] h1').waitFor({ state: 'visible' });
        await page.keyboard.press('Escape');
        await page.waitForURL(url => url.pathname === '/jav' && url.searchParams.get('tab') === 'discover');
        assert.equal(await page.locator('#stage').count(), 0);
        await page.goto(requiredEnv('PEACH_E2E_ORIGIN') + '/works/EXM-001');
        await page.locator('#stage [data-jav-detail] h1').waitFor({ state: 'visible' });
        const detailUrl = page.url();
        const studioPoint = await revealInStage(page, '[data-id-cell="studio"]');
        await page.mouse.click(studioPoint.x, studioPoint.y);
        assert.equal(page.url(), detailUrl);
        assert.ok(await page.locator('#stage').isVisible(), '未登记厂牌不跳转筛选');
      } finally { await context.close() }
    });
    it(`${viewport.name}：已登记厂牌打开资料页`, { timeout: 60000 }, async () => {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        await mockJavDetail(page);
        await page.route(/\/api\/jav\/detail\?/, route => route.fulfill({ json: { ...JAV_DETAIL,
          preview_count: 0, source_image: false, studio_refs: [{ id: 50, name: '示例厂牌', has_logo: false }] } }));
        await page.goto(requiredEnv('PEACH_E2E_ORIGIN') + '/works/EXM-001');
        const studio = page.locator('button[data-id-cell="studio"]');
        await studio.waitFor();
        const studioPoint = await revealInStage(page, 'button[data-id-cell="studio"]');
        await page.mouse.click(studioPoint.x, studioPoint.y);
        await page.waitForURL(url => url.pathname === '/studios/50');
        assert.equal(await page.locator('#stage').count(), 0);
      } finally { await context.close() }
    });
    it(`${viewport.name} 深链刷新与来源未取得仍可关闭`, { timeout: 60000 }, async () => {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        await mockJavDetail(page);
        await page.addInitScript(() => {
          const heights: number[] = [];
          Object.assign(window, { coldDetailHeights: heights });
          const sample = () => {
            const dialog = document.querySelector<HTMLDialogElement>('#stage[open]');
            if (dialog) heights.push(dialog.clientHeight);
            if (heights.length < 180) requestAnimationFrame(sample);
          }; requestAnimationFrame(sample);
        });
        await page.route(/\/api\/jav\/detail\?/, async route => {
          await new Promise(resolve => setTimeout(resolve, 400));
          await route.fulfill({ json: { ...JAV_DETAIL, state: 'partial', source_image: false,
            preview_count: 0, message: '作品资料未取得，请稍后重试' } });
        });
        await page.goto(requiredEnv('PEACH_E2E_ORIGIN') + '/works/EXM-001');
        await page.getByText('作品资料未取得，请稍后重试', { exact: true }).waitFor({ state: 'visible' });
        const heights = await page.evaluate(() => (window as unknown as { coldDetailHeights: number[] }).coldDetailHeights);
        assert.ok(heights.length > 5 && Math.max(...heights) - Math.min(...heights) < 1, JSON.stringify(heights));
        await page.reload();
        await page.getByText('作品资料未取得，请稍后重试', { exact: true }).waitFor({ state: 'visible' });
        await page.locator('#closeStage').click();
        await page.waitForURL('**/jav?tab=discover');
      } finally { await context.close() }
    });
  }
});
