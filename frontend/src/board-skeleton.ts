import { islandButton } from './island-skeleton';
import { configurationSkeleton } from './configuration-skeleton';
import { javPageSkeleton } from './jav-skeleton';
import { duplicatesSkeleton, qualityGoalsSkeleton, statsSkeleton } from './management-skeletons';
import { configurationSection, isConfigurationPath } from './history/settings-route';

/** 等待态复用页面容器，只有异步内容使用占位。 */
const line = (width = '60%') => `<span class="skeleton" style="width:${width}"></span>`;
const lines = () => `${line('80%')}${line('48%')}`;
const repeat = (html: string, count: number) => html.repeat(count);
/* 骨架整块 `inert`，焦点和点击都进不来；要等数据才能执行的键另标原生 `disabled` 与
   `data-skeleton-action`，外观是全站骨架共用的那副禁用面。 */
const WAITING = 'disabled data-skeleton-action';
const text = (width: string) => `<span class="skeleton skeleton-text" style="width:${width}"></span>`;
/** Board UI `Checkbox` 的未勾静止态；给了字就是「全选本页」那种带标签的一枚。 */
export const skeletonCheckbox = (label = '') => `<span class="group inline-flex items-center select-none gap-2"><span class="flex shrink-0 items-center justify-center rounded-sm size-4 border bg-background-primary-default shadow-xs border-border-checkbox-default"></span>${label ? `<span class="text-body-medium text-text-primary">${label}</span>` : ''}</span>`;
export const SORT_MARK = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12.7071 15.2929C12.3166 15.6834 11.6834 15.6834 11.2929 15.2929L7.70711 11.7071C7.07714 11.0771 7.52331 10 8.41421 10H15.5858C16.4767 10 16.9229 11.0771 16.2929 11.7071L12.7071 15.2929Z" fill="currentColor"/></svg>';

/** 详情骨架外层 `[data-skeleton="detail"]` 里面那一格：舞台岛自己画外层，里面照这一份写。格子与详情栏
 *  的几何是舞台的（`react/stage/stage.css`），骨架的底色与行距是壳的 `skeleton` 一族。 */
export function detailSkeletonBody(): string {
  return `<div data-stage-grid="" aria-hidden="true"><div data-stage-media="" class="ui-skeleton-detail-media skeleton"></div><aside data-stage-side=""><div data-stage-side-content="" class="ui-skeleton-lines">${line('85%')}${line('65%')}${repeat(lines(), 4)}</div></aside></div>`;
}

export function boardPageSkeleton(path: string): string {
  let body = '';
  if (path === '/stats') {
    body = statsSkeleton();
  } else if (path === '/jav') {
    body = javPageSkeleton();
  } else if (isConfigurationPath(path)) {
    body = configurationSkeleton(configurationSection(path));
  } else if (path === '/tasks') {
    body = `<div class="peach-react"><div class="mx-auto flex w-full max-w-board flex-col gap-8">${['正在进行', '本次未执行', '最近完成'].map(title => `<section class="activitysection flex min-w-0 flex-col gap-3"><h3 class="text-title-2-medium text-text-primary">${title}</h3><div class="min-w-0 rounded-2xl shadow-card bg-background-secondary-default"><div class="flex flex-col gap-1.5 px-5 pt-5 pb-4"><span class="text-title-1-medium">${text('8em')}</span><span class="text-caption-1-regular">${text('14em')}</span>${text('60%')}${text('40%')}</div><div class="border-t border-separator-border px-5 py-2.5">${text('6em')}</div></div></section>`).join('')}</div></div>`;
  } else if (path === '/duplicates') {
    body = duplicatesSkeleton();
  } else if (path === '/quality-goals') {
    body = qualityGoalsSkeleton();
  } else if (path === '/playlists') {
    body = `<div class="peach-react"><section class="w-full pt-1 pb-10.5"><header class="mb-4 flex items-start justify-between gap-4.5 max-board-narrow:flex-col max-board-narrow:items-stretch"><div><h2 class="mb-1 text-display-4-medium! text-text-primary">播放列表</h2><p class="text-body-2-regular text-text-secondary">保存 Mix，按自己的顺序继续播放。</p></div><div class="flex flex-wrap items-end gap-2"><div class="min-w-50 max-w-80 flex-1 basis-50 max-board-narrow:min-w-0 max-board-narrow:max-w-none"><span class="text-body-medium">新播放列表</span><span class="skeleton ui-configuration-skeleton-input mt-1.5"></span></div>${islandButton({ label: '新建', attrs: WAITING })}</div></header><div class="mx-auto w-full max-w-board"><div class="ui-playlistcards card-grid-cover gap-4.5">${repeat(`<article class="playlistcard skeletoncard"><i></i><b></b><em></em></article>`, 6)}</div></div></section></div>`;
  } else return '';
  return `<div class="board-page-skeleton" data-skeleton="board${path}" role="status" aria-label="正在读取页面"><div aria-hidden="true" inert>${body}</div></div>`;
}
