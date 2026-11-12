/* 网盘来源卡里按账号分区，账号分组只借用外层卡的底色与左边距，不再套第二张圆角卡。
 * 这条读计算样式，防止 `Section` 又退回 `SettingsCard` 包一层。 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { DESKTOP, installDesignBrowser } from './design-fixture.ts';
import { settle, visit } from './harness.ts';

const snapshot = {
  public_url: 'https://peach.example',
  locations: [{
    location: 'onedrive', label: 'OneDrive', configured: true, connected: true,
    email: 'me@outlook.com', display_name: 'Me',
    accounts: [{
      key: 'onedrive', configured: true, connected: true, email: 'me@outlook.com',
      display_name: 'Me', roots: [{ remote_id: 'root1', name: 'Movies' }],
      synced_at: '2026-11-10 08:00:00', last_error: '',
    }],
    roots: [{ remote_id: 'root1', name: 'Movies' }],
    synced_at: '2026-11-10 08:00:00', last_error: '',
    mode: 'redirect', modes: ['redirect', 'proxy'],
  }],
};

describe('设计决定：网盘账号分区', () => {
  let browser: Browser;
  installDesignBrowser((next) => { browser = next; });

  it('账号分组只借用外层来源卡，不再画第二张圆角卡', { timeout: 60_000 }, async () => {
    const opened = await visit(browser, '/settings/drives', DESKTOP, async (page) => {
      await page.route('**/api/drive', route => route.fulfill({ json: snapshot }));
    });
    try {
      const { page } = opened;
      const account = page.locator('section[aria-label="me@outlook.com"]');
      await account.waitFor({ state: 'visible', timeout: 15_000 });
      await settle(page);
      const radii = await account.locator(':scope > div').evaluateAll(nodes =>
        nodes.map(node => getComputedStyle(node).borderTopLeftRadius));
      assert.deepEqual(radii, ['0px', '0px'], '账号分组仍在画第二张圆角卡');
      assert.deepEqual(opened.problems, []);
    } finally {
      await opened.close();
    }
  });
});
