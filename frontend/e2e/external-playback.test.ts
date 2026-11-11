import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { launch, layout, VIEWPORTS } from './harness.ts';
import { ITEM, openItemPage } from './item-fixture.ts';

describe('外部播放器', () => {
  let browser: Browser;
  before(async () => { browser = await launch() });
  after(async () => { await browser.close() });
  for (const viewport of [VIEWPORTS.find((one) => !one.mobile)!, VIEWPORTS.find((one) => one.mobile)!]) {
    it(`${viewport.mobile ? '手机' : '桌面'}详情只签发限时链接，失败原因留在按钮下面`, { timeout: 60_000 }, async () => {
      const opened = await openItemPage(browser, `/assets/${ITEM.plain}`, viewport);
      try {
        const page = opened.page;
        let requested = 0;
        let detected = 0;
        let failOpen = true;
        await page.route('**/api/local-players', route => { detected++; return route.fulfill({ status: 404, json: {} }) });
        await page.route('**/api/external-playback?*', route => {
          requested++;
          if (failOpen) return route.fulfill({ status: 503, json: { detail: '无法签发外部播放链接' } });
          return route.fulfill({ json: { url: `/external-stream/${ITEM.plain}?ticket=${'a'.repeat(90)}`,
            playlist: `/external-playlist/${ITEM.plain}.m3u?ticket=${'a'.repeat(90)}` } });
        });
        await page.reload();
        const chooser = page.getByRole('button', { name: '外部播放器', exact: true });
        await chooser.waitFor();
        assert.equal(await page.getByRole('button', { name: '重新检测播放器', exact: true }).count(), 0);
        assert.equal(await page.getByRole('button', { name: '使用外部播放器打开', exact: true }).count(), 1);
        await chooser.click();
        const options = await page.getByRole('option').allInnerTexts();
        assert.deepEqual(options.slice(-2), ['M3U 播放列表', '网络播放地址 / VR']);
        assert.ok(options.includes('VLC'), `本机播放器没列出来：${options.join('、')}`);
        await page.getByRole('option', { name: 'M3U 播放列表', exact: true }).click();
        await page.getByRole('button', { name: '使用外部播放器打开', exact: true }).click();
        await page.locator('[data-local-playback] [role="alert"]').waitFor();
        assert.equal(requested, 1);
        const geometry = await page.locator('[data-local-playback]').evaluate(host => {
          const row = host.querySelector('[data-local-playback-row]')!.getBoundingClientRect();
          const error = host.querySelector('[role="alert"]')!.getBoundingClientRect();
          const select = host.querySelector('[aria-label="外部播放器"]')!.getBoundingClientRect();
          const button = host.querySelector('[aria-label="使用外部播放器打开"]')!.getBoundingClientRect();
          return { gap: error.top - row.bottom, left: error.left - row.left,
            sameTop: Math.abs(select.top - button.top), sameHeight: Math.abs(select.height - button.height) };
        });
        assert.equal(geometry.gap, 8);
        assert.equal(geometry.left, 0);
        assert.equal(geometry.sameTop, 0);
        assert.equal(geometry.sameHeight, 0);
        failOpen = false;
        await page.getByRole('option', { name: '网络播放地址 / VR', exact: true }).click();
        assert.equal(await page.locator('[data-local-playback] [role="alert"]').count(), 0, '换了取法还留着上一次的失败原因');
        await page.getByRole('button', { name: '使用外部播放器打开', exact: true }).click();
        await page.getByRole('textbox', { name: '网络播放地址' }).waitFor();
        assert.equal(requested, 2);
        assert.equal(detected, 0, '服务端不检测本机播放器');
        assert.match(await page.getByRole('textbox', { name: '网络播放地址' }).inputValue(), /\/external-stream\/11\?ticket=/);
        assert.deepEqual((await layout(page)).offenders, []);
      } finally { await opened.close() }
    });

    it(`${viewport.mobile ? '手机' : '桌面'}按需生成可复制的网络地址`, { timeout: 60_000 }, async () => {
      const opened = await openItemPage(browser, `/assets/${ITEM.plain}`, viewport, { ready: '#stage[open] [data-item-side]' });
      try {
        const page = opened.page;
        let requested = 0;
        await page.route('**/api/external-playback?*', route => {
          requested++;
          return route.fulfill({ json: { url: `/external-stream/${ITEM.plain}?ticket=${'a'.repeat(90)}`,
            playlist: `/external-playlist/${ITEM.plain}.m3u?ticket=${'a'.repeat(90)}` } });
        });
        await page.getByRole('button', { name: '外部播放器', exact: true }).click();
        await page.getByRole('option', { name: '网络播放地址 / VR', exact: true }).click();
        assert.equal(requested, 0);
        await page.getByRole('button', { name: '使用外部播放器打开', exact: true }).click();
        await page.getByRole('textbox', { name: '网络播放地址' }).waitFor();
        assert.equal(requested, 1);
        assert.match(await page.getByRole('textbox', { name: '网络播放地址' }).inputValue(), /\/external-stream\/11\?ticket=/);
        assert.deepEqual((await layout(page)).offenders, []);
      } finally { await opened.close() }
    });
  }
});
