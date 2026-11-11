import { afterEach, expect, it, vi } from 'vitest';
import { QueryClientProvider, notifyManager } from '@tanstack/react-query';
import { queryClient } from '../../src/react/query';
import { JavPage } from '../../src/react/jav/jav-page';
import { discoveryKey } from '../../src/react/jav/jav';
import { click, mount, settle } from './render';

notifyManager.setScheduler(notify => notify());
afterEach(() => queryClient.clear());

const item = (id: number, code: string, tags: string[] = []) => ({
  id, code, title: `作品 ${id}`, performers: '葵つかさ', release_date: '2024-01-01', studio: 'S1',
  link: '', cover_url: '', has_cover: true, has_thumb: true, tags,
});

const open = (navigate = vi.fn()) => mount(
  <QueryClientProvider client={queryClient}>
    <JavPage readOnly={false} navigate={navigate} receipt={vi.fn()} />
  </QueryClientProvider>);

it('探索页只有一节内容，页头是标题与筛选推荐框', async () => {
  const host = await open();
  await settle();
  expect(host.querySelector('[data-page-title]')?.textContent).toBe('探索');
  expect(host.querySelectorAll('[role="tab"]')).toHaveLength(0);
  expect(host.querySelector('[data-index-search] input')?.getAttribute('aria-label')).toContain('筛选推荐');
});

it('探索列表按缓存立即呈现，读数是这一屏的部数', async () => {
  queryClient.setQueryData(discoveryKey('release_date', 'desc'), {
    items: [item(1, 'ABC-001', ['巨乳']), item(2, 'ABC-002')], candidate_total: 2,
    sort: 'release_date', direction: 'desc', limited: false, source: 'library',
  });
  const host = await open();
  await settle();
  expect([...host.querySelectorAll('[data-jav-title] b')].map(code => code.textContent)).toEqual(['ABC-001', 'ABC-002']);
  expect(host.querySelector('[data-catalog-readout]')?.textContent).toBe('2 部');
});

it('标签键在探索页筛这一屏，再按一次取消', async () => {
  queryClient.setQueryData(discoveryKey('release_date', 'desc'), {
    items: [item(1, 'ABC-001', ['巨乳']), item(2, 'ABC-002')], candidate_total: 2,
    sort: 'release_date', direction: 'desc', limited: false, source: 'library',
  });
  const host = await open();
  await settle();
  const pill = host.querySelector<HTMLElement>('[data-catalog-tag="巨乳"]')!;
  await click(pill);
  expect(pill.getAttribute('aria-pressed')).toBe('true');
  expect(host.querySelector('[data-catalog-readout]')?.textContent).toBe('1 部');
  await click(pill);
  expect(host.querySelector('[data-catalog-readout]')?.textContent).toBe('2 部');
});

it('点卡片进作品详情', async () => {
  queryClient.setQueryData(discoveryKey('release_date', 'desc'), {
    items: [item(1, 'ABC-001')], candidate_total: 1,
    sort: 'release_date', direction: 'desc', limited: false, source: 'library',
  });
  const navigate = vi.fn();
  const host = await open(navigate);
  await settle();
  await click(host.querySelector('[data-jav-card]')!);
  expect(navigate).toHaveBeenCalledWith('/works/ABC-001');
});
