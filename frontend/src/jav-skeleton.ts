import { islandGlyph, islandSearchInput, islandShortcutsEntry } from './island-skeleton';
import { cardRatio, gridLayout, javLayout } from './appearance';
import { DISCOVERY_SORTS } from './react/jav/discovery-sorts';

const text = (width: string) => `<span data-jav-skeleton-text class="skeleton block rounded-md" style="width:${width}" aria-hidden="true"></span>`;
export const JAV_RECOMMENDATION_GRID = 'w-full min-w-0';

/** 查询中的标签沿用筛选条的高度与横向布局。 */
export function javTagSkeleton(): string {
  return ['w-20', 'w-16', 'w-24', 'w-20', 'w-16', 'w-24'].map(width =>
    `<span data-skeleton="tag" aria-hidden="true" class="skeleton-sheen relative block h-8 flex-none rounded-(--tag-radius) ${width}"></span>`).join('');
}

/** 占位复用推荐卡的封面比例与列数。 */
export function javContentSkeleton(layout = javLayout()): string {
  const ratio = cardRatio({ ...gridLayout({ active: true, home: false, portrait: false }), size: layout });
  return `<div data-media-grid class="${JAV_RECOMMENDATION_GRID}" data-skeleton="jav-discover">${Array.from({ length: 6 }, () => `<div data-jav-skeleton-card data-media-card data-jav-card class="flex min-w-0 flex-col gap-3">
    <span data-jav-skeleton-cover class="skeleton block w-full rounded-2lg" style="aspect-ratio:${ratio}"></span>
    <div data-media-meta><span data-jav-skeleton-avatar class="skeleton block shrink-0"></span><div data-media-text>
      <div data-media-title>${text('85%')}${text('65%')}</div><div data-media-byline><span data-media-who>${text('6em')}</span><span data-media-facts><span data-media-release>${text('7em')}</span></span></div>
      <div data-media-tags><span class="skeleton block h-5 w-20 rounded-md"></span><span class="skeleton block h-5 w-24 rounded-md"></span></div>
    </div></div>
    <div data-jav-skeleton-actions class="flex flex-wrap gap-2"><span data-jav-skeleton-action class="skeleton block h-9 w-20 rounded-md"></span><span data-jav-skeleton-action class="skeleton block h-9 w-12 rounded-md"></span></div>
  </div>`).join('')}</div>`;
}

/** 照 `JavPage` 的静止态画：页头一行是标题、靠右的筛选框，下面画筛选条与卡片占位。 */
export function javPageSkeleton(): string {
  const q = new URLSearchParams(location.search).get('q') || '';
  const body = `<section class="flex min-w-0 flex-col gap-4">${javFilterSkeleton()}${javContentSkeleton()}</section>`;
  return `<div class="peach-react"><div class="flex w-full flex-col gap-6">
    <div class="flex w-full flex-col gap-4"><div class="flex min-w-0 flex-wrap items-center gap-3 max-board-narrow:gap-x-2"><h2 data-page-title class="text-display-4-medium text-text-primary max-board-narrow:text-title-1-medium">探索</h2><div data-index-search class="ml-auto min-w-0 max-w-80 flex-1">${islandSearchInput('', q, '筛选推荐')}</div></div></div>
    ${body}</div></div>`;
}

/** 首屏筛选控件使用两排容器；标签和读数依赖查询。 */
function javFilterSkeleton(): string {
  const size = (value: string, glyph: string) => `<span data-glass-segment="" ${javLayout() === value ? 'data-selected="true"' : ''} class="flex size-8 flex-none items-center justify-center rounded-lg text-(--glass-text)/62">${islandGlyph(glyph, 'size-4')}</span>`;
  const params = new URLSearchParams(location.search);
  const sort = params.get('sort') || 'release_date';
  return `<div data-filter-glass data-glass-pane data-filter-frame data-jav-filter data-catalog-frame class="sticky top-topbar z-10 mb-5.5 flex flex-col">
    <div data-filter-row="top" class="flex h-12 min-w-0 items-center overscroll-x-contain px-3 py-2 gap-1.5 overflow-visible">
      <div data-catalog-scroll><div data-catalog-tags>${javTagSkeleton()}</div></div>
    </div>
    <div data-filter-row="bottom" aria-busy="true" class="flex min-h-12 min-w-0 items-center gap-3 px-3 py-2">
      <span data-catalog-readout><span data-skeleton="count" class="relative inline-block h-3.5 w-37.5 rounded-md align-middle skeleton-sheen"></span></span>
      ${islandShortcutsEntry()}
      <span data-entity-sorts><span data-entity-layout class="inline-flex w-max max-w-full flex-none items-center gap-0.5 rounded-lg">${size('big', 'maximize')}${size('small', 'layout-grid')}</span>
        ${DISCOVERY_SORTS.map(([key, label]) => `<button type="button" data-entity-sort="${key}" data-entity-press aria-pressed="${key === sort}">${label}${key === sort ? islandGlyph('arrow-down', 'size-3.5') : ''}</button>`).join('')}
      </span>
    </div>
  </div>`;
}
