/* 配置页的骨架：整页静态骨架（React 包与 `/api/configuration` 回来之前）与「设备会话」自己取数时的
 * 分区骨架都由这里的构件拼，按终态的结构画：行画成「标题 + 说明 + 控件」，底栏画禁用的键。
 *
 * 网盘、访问密码、访问口令、任务速度四格的分区本体在取数时自己画「正在读取…」，没有单独的分区骨架，
 * 落在整页骨架上时画通用面板。
 *
 * 设备行数随这台机器已登录的设备变：照本机上次画好时记下的行数画，没有记录时按一行（本机）画。 */
import { skeletonHtml } from '@peach/legacy/ui';

import { appSettingsStore } from './appearance/settings';
import { diagnosticsSkeleton } from './diagnostics-skeleton';
import { islandButton } from './island-skeleton';
import { NAVIGATION_GROUPS, normalizeNavigationOrder } from './navigation-order';

/* ---------- 本机记下的结构 ---------- */

/** 已登录的设备：行数，以及底栏有没有「撤销其他设备」。 */
export interface DevicesShape { rows: number; manageable: boolean }
export interface ConfigurationShape { devices: DevicesShape }
type Shapes = { [K in keyof ConfigurationShape]?: Partial<ConfigurationShape[K]> };

export const SHAPE_KEY = 'peach.configuration.shape.v1';

function shapes(): Shapes {
  try {
    const value = JSON.parse(localStorage.getItem(SHAPE_KEY) || '{}') as unknown;
    return value && typeof value === 'object' ? value as Shapes : {};
  } catch { return {} }
}

/** 记下一个分区这次画好时的结构，下次首屏骨架照它排。 */
export function rememberShape<K extends keyof ConfigurationShape>(key: K, value: ConfigurationShape[K]): void {
  try {
    const all = shapes();
    if (JSON.stringify(all[key]) === JSON.stringify(value)) return;
    localStorage.setItem(SHAPE_KEY, JSON.stringify({ ...all, [key]: value }));
  } catch { /* 下次按最小结构画。 */ }
}

/** 上次记下的结构；本机没有记录时是 `undefined`。取值时逐项校验，坏数据按没有处理。 */
export const rememberedShape = <K extends keyof ConfigurationShape>(key: K): Shapes[K] => shapes()[key];

const on = (value: unknown): boolean => value === true;
const count = (value: unknown, max: number): number => Number.isInteger(value) && (value as number) > 0 ? Math.min(value as number, max) : 0;

/* ---------- 构件：类名与正式组件同几何 ---------- */

const wait = 'disabled data-skeleton-action';
const text = (width = '60%') => `<span class="skeleton skeleton-text" style="width:${width}"></span>`;
/** 图标、徽章这类定尺寸的块：只放在 flex 行里。 */
const block = (width: string, height: string) => `<span class="skeleton shrink-0" style="width:${width};height:${height}"></span>`;
const button = (label: string, variant: 'primary' | 'secondary' = 'primary') =>
  islandButton({ label, variant, size: 'medium', attrs: wait });
const footer = (content: string, status = '') => `<div class="-ml-3 flex flex-wrap items-center justify-end gap-3 rounded-b-2xl border-t border-separator-border bg-card-footer px-3 py-3">${status ? `<div class="mr-auto min-w-0 text-body-2-regular text-text-secondary">${status}</div>` : ''}${content}</div>`;
const section = (name: string, content: string, actions = '', { status = '' } = {}) =>
  `<section aria-label="${name}" class="flex w-full flex-col gap-2 wrap-anywhere"><p class="w-full px-3 text-body-2-medium text-text-secondary">${name}</p><div class="flex w-full flex-col rounded-2xl bg-background-secondary-default pl-3">${content}${actions ? footer(actions, status) : ''}</div></section>`;
/** 同 BoardUI `SettingsRow`；`lead` 是行首图标的占位。 */
const controlRow = (label: string, description: string, control: string, lead = '') => {
  const body = `<div class="flex min-w-0 flex-col"><p class="text-body-regular text-text-primary">${label}</p>${description ? `<p class="text-body-2-regular text-text-secondary">${description}</p>` : ''}</div>`;
  return `<div class="flex min-h-[52px] w-full items-center justify-between gap-4 py-2.5 pr-2.5 border-b border-separator-border last:border-b-0">${lead ? `<div class="flex min-w-0 items-center gap-3">${lead}${body}</div>` : body}${control}</div>`;
};

/* ---------- 设备会话 ---------- */

/** 已登录的设备：分区自己取数时也画这一份。没有记录时按一行（本机）画。 */
export function devicesSkeleton(): string {
  const shape = rememberedShape('devices');
  const rows = Array.from({ length: Math.max(1, count(shape?.rows, 8)) }, () => controlRow(text('8em'), text('14em'), text('3em'), block('20px', '20px'))).join('');
  return section('已登录的设备', rows, on(shape?.manageable) ? button('撤销其他设备', 'secondary') : '',
    on(shape?.manageable) ? { status: '修改访问密码会让全部设备退出。' } : {});
}

/* ---------- 整页 ---------- */

/** 各分区复用正式表单的 Section、Stack 与 SettingsRow 几何。 */
export function configurationContentSkeleton(chosen: string): string {
  switch (chosen) {
    case '系统诊断': return diagnosticsSkeleton();
    case '设备会话': return devicesSkeleton();
    default: return skeletonHtml('正在读取配置', { variant: 'panel' });
  }
}

export function configurationSkeleton(chosen = '网盘'): string {
  const titles = normalizeNavigationOrder('configuration', appSettingsStore().value.navigationOrders.configuration)
    .map(key => NAVIGATION_GROUPS.configuration.items.find(([id]) => id === key)![1]);
  const nav = `<div class="ui-board-local-nav" data-section-nav data-section-items>${titles.map(title => `<button type="button" tabindex="-1" aria-selected="${title === chosen}">${title}</button>`).join('')}</div>`;
  return `<div class="peach-react"><div class="ui-configpage">${nav}<div class="flex min-w-0 flex-col gap-6">${configurationContentSkeleton(chosen)}</div></div></div>`;
}
