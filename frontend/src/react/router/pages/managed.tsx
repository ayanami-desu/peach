/* 管理区那几页的页面元素：页面组按匹配挂上它们，挂上就打开那一页（ADR-0031「管理区页面由
 * 路由树按匹配打开」）。
 *
 * 一次打开：等壳开始路由（`@peach/shell` 的 `pageOpens` 大于 0），经 `surfaceChanged` 让壳收起别的面、铺开管理区，铺这一页的
 * 骨架（与壳冷启动铺的是同一张，键相同就不重画），按需问一次 `/healthz`，再走 `openManagedRoute` 取齐首屏、
 * 在同一个任务里换成整页。首帧 props 由元素自己从地址、偏好与壳的状态算。
 *
 * 按页面打开序号挂 key：没人认领的历史变化一次就是打开一次，同一路径再打开就重挂重取；认领的写地址（复核页换分类、
 * 关注管理换页签）代次不变，不重开。详情压在上面时页面组还匹配这一页：key 停在压上来之前那一次，页面不拆；经背景
 * 匹配挂上的（后退落到压在这一页上的详情）先不打开，详情撤下时按那一刻的代次挂 key 打开。
 *
 * 卸载时这一页还画在 `#stats` 里、壳也没藏起它，才收起；资料页、首页压过来时壳只藏起 `#stats`，页面照旧活着，
 * 等下一次认领表面才收。收起排进微任务：卸载发生在路由根同步提交的那一次里。 */
import { useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router';

import { appSettingsStore } from '@peach/appearance';
import { followManageParams } from '../../follow-manage/manage-route';
import { javTab } from '../../jav/jav-navigation';
import { isOverlayPath, managedEntry, openManagedRoute, peachHistory, isConfigurationPath } from '@peach/history';
import { api, isAbort } from '@peach/legacy/core';
import { pageOpens, subscribeShell } from '@peach/shell';

import { pageNavigationReady } from '../../../history/page-navigation';
import { managementSkeletonHtml, paintManagementPlaceholder } from '../../../management-placeholder';
import { isReviewCategory, reviewQueueOf } from '../../review/review';
import { ShellActionsContext, useOpenEpoch } from '../router';
import type { ManagedOpenProps, ManagedPath, ShellActions } from '../shell-actions';

/** 一次打开的存活状态：元素卸掉就不再画、不再滚动、不再写地址。 */
interface Run {
  live: boolean;
  /** 画上之后那一页的代次；还在取首屏时是 0。 */
  revision: number;
  /** 这一次的读请求（`/healthz`），卸掉时中止。 */
  controller: AbortController;
}

/** 本机的写入状态（`/healthz`）。 */
interface Runtime {
  ledger_read_only?: boolean;
  ledger_read_only_message?: string;
  ledger_writer_origin?: string;
}

const readStarted = () => pageOpens > 0;
/** 壳开始路由没有（`pageOpens` 大于 0）。 */
const useRoutingStarted = (): boolean => useSyncExternalStore(subscribeShell, readStarted);

const followLayout = (): string => (appSettingsStore().value.followLayout === 'table' ? 'table' : 'default');
const search = (): URLSearchParams => new URLSearchParams(window.location.search);

/** 只读态：中止了回 null，照只能浏览以外的缺省处理。 */
function readRuntime(run: Run): Promise<Runtime | null> {
  return (api('/healthz', { signal: run.controller.signal }) as Promise<Runtime>)
    .catch((error: unknown) => { if (isAbort(error)) return null; throw error });
}

function writerProps(runtime: Runtime | null, path: string) {
  return {
    readOnly: !!runtime?.ledger_read_only,
    readOnlyMessage: runtime?.ledger_read_only_message || '本机当前只能浏览',
    writerUrl: runtime?.ledger_writer_origin ? new URL(path, runtime.ledger_writer_origin).href : '',
  };
}

/** 这一次打开交给页面的值，从地址、偏好与壳的状态算。等 `/healthz` 期间走开了回 null。 */
async function openProps(path: ManagedPath, run: Run): Promise<object | null> {
  if (path === '/stats') return {} satisfies ManagedOpenProps['/stats'];
  if (isConfigurationPath(path)) return {} satisfies ManagedOpenProps['/settings'];
  if (path === '/jav') {
    const runtime = await readRuntime(run);
    if (!run.live) return null;
    /* 四个分区地址（`?tab=wants|discover|releases|library`）各画各的：页签从地址读，缺省回作品库。 */
    return { tab: javTab(search().get('tab')), readOnly: !!runtime?.ledger_read_only } satisfies ManagedOpenProps['/jav'];
  }
  if (path === '/review') {
    const category = search().get('category') || '';
    const runtime = await readRuntime(run);
    if (!run.live) return null;
    return { category: isReviewCategory(category) ? category : '', queue: reviewQueueOf(search().get('queue')),
      ...writerProps(runtime, '/review') } satisfies ManagedOpenProps['/review'];
  }
  if (path === '/subscriptions') {
    const route = followManageParams('?' + search().toString());
    const runtime = await readRuntime(run);
    if (!run.live) return null;
    const preferences = appSettingsStore().value;
    return {
      ...route, pageSize: Number(preferences.followPageSize) || 20, layout: followLayout(), ...writerProps(runtime, '/subscriptions'),
    } satisfies ManagedOpenProps['/subscriptions'];
  }
  return {};
}

async function openPage(path: ManagedPath, actions: ShellActions, run: Run): Promise<void> {
  const seq = peachHistory.navigation.seq;
  const isCurrent = () => run.live && peachHistory.navigation.seq === seq;
  if (path === '/subscriptions' && search().get('tab') === 'source') {
    peachHistory.replace('/sources'); return;
  }
  const stats = document.getElementById('stats');
  if (!stats) return;
  actions.surfaceChanged('management', path);
  paintManagementPlaceholder(stats, managementSkeletonHtml(path, {
    followLayout: followLayout(), followSort: search().get('sort') || '', followDir: search().get('dir') || '',
  }));
  void pageNavigationReady(isCurrent, stats, { pending: true });
  const props = await openProps(path, run);
  if (!props) return;
  const opened = await openManagedRoute(path, props, { container: stats, isCurrent });
  if (opened) run.revision = managedEntry(stats)?.revision ?? 0;
  if (opened && isCurrent()) {
    void pageNavigationReady(isCurrent);
    /* 配置页是六节纵向排开的一页：地址带 `#drives` 这类锚点时滚到那一节（网盘授权的回跳就落在 `#drives`）。 */
    const { hash } = window.location;
    if (isConfigurationPath(path) && hash.length > 1) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
    }
  }
}

/** 管理区一页的元素。 */
export function ManagedMatch({ path }: { path: ManagedPath }) {
  const epoch = useOpenEpoch();
  // 每次导航都重渲染一次：详情撤下的那一次认领写地址不领代次，也要看得见。
  useLocation();
  const covered = isOverlayPath(peachHistory.navigation.location.pathname);
  const opening = useRef<number | null>(covered ? null : epoch);
  const wasCovered = useRef(covered);
  // 已打开的背景页在详情撤下时保留代次；深链下的背景等待首次打开。
  if (!covered && (!wasCovered.current || opening.current === null)) opening.current = epoch;
  wasCovered.current = covered;
  // 路径也进 key：认领的写地址从一页换到另一页（配置页改写到数据管理页）时代次不变，页面组在同一个位置换了路由。
  const group = isConfigurationPath(path) ? '/settings' : path;
  return <ManagedPage key={`${group} ${opening.current ?? 'covered'}`} path={path} covered={opening.current === null} />;
}

function ManagedPage({ path, covered }: { path: ManagedPath; covered: boolean }) {
  const actions = useContext(ShellActionsContext);
  const started = useRoutingStarted();
  const run = useRef<Run | null>(null);
  useEffect(() => {
    if (covered || !actions || !started || run.current) return;
    const current: Run = { live: true, revision: 0, controller: new AbortController() };
    run.current = current;
    queueMicrotask(() => { if (current.live) void openPage(path, actions, current) });
    // 每次挂上只打开一次：壳开始路由那一刻，或挂上时已经开始了。
  }, [started]);
  useEffect(() => () => {
    const current = run.current;
    if (!current) return;
    current.live = false;
    current.controller.abort();
  }, []);
  return null;
}

