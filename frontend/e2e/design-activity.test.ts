import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { installDesignBrowser, tokenColor } from './design-fixture.ts';
import { visit, VIEWPORTS } from './harness.ts';

describe('任务页任务资源与检查结果', () => {
  let browser: Browser;
  installDesignBrowser((next) => { browser = next; });
  for (const viewport of VIEWPORTS) it(`${viewport.name} 资源高占用时加深，已取消使用红色标签`, async () => {
    const reading = (high: boolean) => ({
      cpu: { state: 'ready', percent: high ? 75 : 5, high },
      sampled_at: '2026-10-31T08:00:00Z',
    });
    const row = (id: number, status: string) => ({
      id, task_key: `resource-${id}`, task_label: `资源采样任务 ${id}`, trigger: 'manual', status,
      host: 'desk', started_at: '2026-10-31T08:00:00Z',
      finished_at: status === 'running' ? null : '2026-10-31T08:01:00Z',
      elapsed_seconds: 60, progress_current: 1, progress_total: 10, progress_label: '正在处理',
      result_summary: {}, error: '', parent_run_id: null as number | null, followup_key: '',
    });
    const opened = await visit(browser, '/tasks', viewport, async page => {
      await page.route('**/api/downloads?*', route => route.fulfill({ json: { available: false, tasks: [], providers: [] } }));
      await page.route('**/api/tasks*', route => route.fulfill({ json: {
        available: true, running: [
          { ...row(1, 'running'), resources: reading(true), control: { state: 'running', actions: ['pause', 'cancel', 'set_speed'], speed_mode: 'standard' } },
          { ...row(90, 'running'), parent_run_id: 1, followup_key: 'child:90', resources: reading(false),
            control: { state: 'running', actions: ['pause', 'cancel', 'set_speed'], speed_mode: 'standard' } },
        ], skipped: [], finished: [row(3, 'cancelled'), row(4, 'succeeded'), row(5, 'succeeded')],
        followup_counts: { 4: { cancelled: 2 }, 5: { succeeded: 1, cancelled: 1 } },
      } }));
    });
    try {
      const page = opened.page;
      await page.locator('[data-task-resources="1"]').waitFor();
      const pairs = [['cpu', 'blue']] as const;
      for (const [metric, color] of pairs) {
        const high = page.locator(`[data-task-resources="1"] [data-task-resource="${metric}"]`);
        const normal = page.locator(`[data-task-resources="90"] [data-task-resource="${metric}"]`);
        const normalBackground = await normal.evaluate(node => getComputedStyle(node).backgroundColor);
        const highBackground = await high.evaluate(node => getComputedStyle(node).backgroundColor);
        assert.equal(normalBackground, await tokenColor(page, 'body', `--color-status-${color}-background`));
        assert.equal(highBackground, await tokenColor(page, 'body', `--color-status-${color}-text`));
        assert.notEqual(highBackground, normalBackground);
      }
      const red = await tokenColor(page, 'body', '--color-status-rose-background');
      for (const [id, label] of [[3, '已取消'], [4, '后续任务已取消'], [5, '部分后续任务已取消']] as const) {
        const badge = page.locator(`#run-${id}`).getByText(label, { exact: true });
        const color = await badge.evaluate(node => {
          const chip = node.parentElement?.tagName === 'SPAN' ? node.parentElement : node;
          return getComputedStyle(chip).backgroundColor;
        });
        assert.equal(color, red);
      }
      const geometry = await page.locator('#run-1').evaluate(card => {
        const controls = card.querySelector('[data-task-controls="1"]')!.getBoundingClientRect();
        const title = card.querySelector('strong')!.getBoundingClientRect();
        return { fits: document.documentElement.scrollWidth <= innerWidth,
          separate: controls.left >= title.right || controls.top >= title.bottom,
          insideCard: controls.right <= card.getBoundingClientRect().right };
      });
      assert.equal(geometry.fits, true);
      assert.equal(geometry.separate, true);
      assert.equal(geometry.insideCard, true);
      assert.equal(await page.locator('[data-task-controls="1"]').getByRole('button', { name: '处理速度：标准' }).count(), 1);
      assert.deepEqual(opened.problems, []);
    } finally { await opened.close() }
  });
  for (const viewport of VIEWPORTS) it(`${viewport.name} 零读数标为未使用，单部作品的任务链接到作品详情`, async () => {
    const name = '[Studio]Very_Long_Unbroken_File_Name_That_Should_Wrap_Inside_The_Card_2026-11-03_1080p.mp4';
    const opened = await visit(browser, '/tasks', viewport, async page => {
      await page.route('**/api/downloads?*', route => route.fulfill({ json: { available: false, tasks: [], providers: [] } }));
      await page.route('**/api/tasks*', route => route.fulfill({ json: {
        available: true, skipped: [], finished: [{
          id: 8, task_key: 'amane-bridge', task_label: 'amane 桥重建', trigger: 'manual', status: 'failed',
          host: 'desk', started_at: '2026-11-03T07:00:00Z', finished_at: '2026-11-03T07:00:01Z', elapsed_seconds: 1,
          progress_current: 0, progress_total: null, progress_label: '', result_summary: { ok: false },
          error: 'uv sync 失败（exit 1）：× Failed to fetch amane\n…\n  fatal: missing object', parent_run_id: null, followup_key: '',
        }], running: [{
          id: 7, task_key: 'mp4-header-repair', task_label: '播放文件头修复', trigger: 'manual', status: 'running',
          host: 'desk', started_at: '2026-11-03T08:00:00Z', finished_at: null, elapsed_seconds: 140,
          progress_current: 0, progress_total: null, progress_label: '读取帧时间戳',
          result_summary: { asset_id: 6297, name }, error: '', parent_run_id: null, followup_key: '',
          control: { state: 'running', actions: ['pause', 'cancel'] },
          resources: {
            cpu: { state: 'ready', percent: 61.6, high: true },
            sampled_at: '2026-11-03T08:02:20Z',
          },
        }],
      } }));
    });
    try {
      const page = opened.page;
      const chips = page.locator('[data-task-resources="7"]');
      await chips.waitFor();
      const idle = await chips.locator('[data-task-resource]').evaluateAll(nodes =>
        Object.fromEntries(nodes.map(node => [(node as HTMLElement).dataset.taskResource, 'resourceIdle' in (node as HTMLElement).dataset])));
      assert.deepEqual(idle, { cpu: false });
      const link = page.locator('[data-task-subject="7"]');
      assert.equal(await link.getAttribute('href'), '/assets/6297');
      assert.equal(await link.getAttribute('title'), name);
      assert.equal(await page.locator('#run-7 details').count(), 0);
      const geometry = await page.locator('#run-7').evaluate(card => {
        const box = card.getBoundingClientRect();
        const link = card.querySelector('[data-task-subject]')!.getBoundingClientRect();
        return { fits: document.documentElement.scrollWidth <= innerWidth, inside: link.right <= box.right };
      });
      assert.deepEqual(geometry, { fits: true, inside: true });
      // 失败卡：框线是 danger 色且有宽度，画成不占盒子的 outline；结束原因在正文，全文收在底部那一行可展开的明细里。
      const failed = page.locator('#run-8');
      const frame = await failed.evaluate((node) => {
        const style = getComputedStyle(node);
        return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, border: style.borderTopWidth };
      });
      assert.deepEqual(frame, { style: 'solid', width: '1px',
        color: await tokenColor(page, '#run-8', '--color-border-error-default'), border: '0px' });
      assert.equal(await failed.locator('[data-task-error]').count(), 1);
      assert.equal(await failed.locator('details [data-error-details]').count(), 1);
      assert.equal(await failed.locator('[data-error-excerpt]').count(), 0);
      assert.deepEqual(opened.problems, []);
    } finally { await opened.close() }
  });
  for (const viewport of VIEWPORTS) it(`${viewport.name} 检查结果和技术代码块完整可读`, async () => {
    const result = { checked: 1218, total: 1218, gone_count: 5, unclear_count: 54,
      diagnostic: 'technical-detail-'.repeat(80) };
    const opened = await visit(browser, '/tasks', viewport, async page => {
      await page.route('**/api/downloads?*', route => route.fulfill({ json: { available: false, tasks: [], providers: [] } }));
      await page.route('**/api/tasks*', route => route.fulfill({ json: {
        available: true, running: [], skipped: [], finished_has_more: false, finished: [{
          id: 4037, task_key: 'link-check', task_label: '链接检查', trigger: 'manual', status: 'succeeded',
          started_at: '2026-10-01T00:00:00Z', finished_at: '2026-10-01T00:01:00Z',
          elapsed_seconds: 60, result_summary: result, error: '', parent_run_id: null, followup_key: '',
        }],
      } }));
    });
    try {
      const page = opened.page;
      const card = page.locator('[data-run-id="4037"]');
      await card.getByText('发现问题', { exact: true }).waitFor();
      assert.equal(await card.getByText('链接已失效 5', { exact: true }).count(), 1);
      assert.equal(await card.getByText('链接访问失败 54', { exact: true }).count(), 1);
      const resultLink = card.getByRole('link', { name: '查看有问题的链接' });
      assert.equal(await resultLink.getAttribute('href'), '/data-cleanup/links');
      assert.equal(await resultLink.evaluate(link => getComputedStyle(link).textDecorationLine), 'none');
      await card.locator('summary').click();
      assert.equal(await card.locator('[data-code-block] code').textContent(), JSON.stringify(result, null, 2));
      const geometry = await card.locator('pre').evaluate(pre => ({
        overflows: pre.scrollWidth > pre.clientWidth,
        pageFits: document.documentElement.scrollWidth <= innerWidth,
        leftGap: pre.closest('[data-code-block]')!.getBoundingClientRect().left
          - pre.closest('[data-run-id]')!.getBoundingClientRect().left,
        bottomGap: pre.closest('[data-run-id]')!.getBoundingClientRect().bottom
          - pre.closest('[data-code-block]')!.getBoundingClientRect().bottom,
      }));
      assert.equal(geometry.overflows, true, '长行在代码块内部横向滚动');
      assert.equal(geometry.pageFits, true);
      assert.ok(Math.abs(geometry.leftGap - geometry.bottomGap) <= 1,
        `技术详情代码块的底部留白与卡片左右内边距一致：${JSON.stringify(geometry)}`);
      assert.equal(await card.getByRole('button', { name: '复制代码' }).count(), 1);
      assert.deepEqual(opened.problems, []);
    } finally { await opened.close(); }
  });
});
