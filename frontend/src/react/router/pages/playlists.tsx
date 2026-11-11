/* 播放列表页的路由元素（ADR-0031）：页面组匹配到 `BROWSE_ROUTES` 的 `/playlists` 时挂上，按地址打开那一页，
 * 画进 `#stats`。元素自己什么都不画：页面经 `openManagedRoute` 登记进 `#stats`，由 `ManagedSurface` 画。
 *
 * 什么时候打开同索引页（`usePageOpen`）：挂上、领了页面打开序号（后退前进与不认领的跳转）、壳要求按当前地址重开
 * （`@peach/shell` 的 `pageOpens` 加一）各一次；`pageOpens` 还是 0 时壳没开始路由，元素只挂着；那一刻被详情压着
 * （页面组按背景匹配）就不动，关掉详情时这一页没画着才打开。
 *
 * 每次打开都整页重开、取最新的那一份。停在这一页时壳要求重读（顶栏「换一批」）就写一个新的刷新代次
 * （`playlistsRevision`），元素推给画着的那一页，页面重取、不重挂。
 *
 * 元素卸下时不收页面：换到管理区、索引页时由它们认领表面收掉；资料页压过来时壳只藏起 `#stats`，回来还要接着用。 */
import { useContext, useEffect, useRef, useSyncExternalStore } from 'react';

import { managedEntry, openManagedRoute, updateManagedRoute } from '@peach/history';
import { playlistsRevision, subscribeShell } from '@peach/shell';

import { pageNavigationReady } from '../../../history/page-navigation';
import { managementSkeletonHtml, paintManagementPlaceholder } from '../../../management-placeholder';
import { ShellActionsContext, useOpenEpoch } from '../router';
import type { ShellActions } from '../shell-actions';
import { usePageOpen } from './index-entity';

const statsHost = () => document.getElementById('stats');
const readPlaylistsRevision = () => playlistsRevision;

/* `#stats` 里画着的是播放列表页。 */
function playlistsShown(stats: HTMLElement | null): stats is HTMLElement {
  const entry = stats ? managedEntry(stats) : null;
  return !!entry && entry.path === '/playlists' && entry.host.isConnected;
}

async function openPlaylists(actions: ShellActions, live: () => boolean) {
  const stats = statsHost();
  if (!stats) return;
  actions.surfaceChanged('playlists', '/playlists');
  paintManagementPlaceholder(stats, managementSkeletonHtml('/playlists'));
  void pageNavigationReady(live, stats, { pending: true });
  await openManagedRoute('/playlists', { revision: playlistsRevision }, { container: stats, isCurrent: live });
  if (live()) void pageNavigationReady(live);
}

/** 播放列表页的元素。 */
export function PlaylistsMatch() {
  const actions = useContext(ShellActionsContext);
  const revision = useSyncExternalStore(subscribeShell, readPlaylistsRevision);
  const last = useRef(revision);
  useEffect(() => {
    if (last.current === revision) return;
    last.current = revision;
    const stats = statsHost();
    if (playlistsShown(stats)) updateManagedRoute(stats, { revision });
  }, [revision]);
  usePageOpen(useOpenEpoch(), (_fresh, live) => {
    if (actions) void openPlaylists(actions, live);
  }, { shown: () => { const stats = statsHost(); return playlistsShown(stats) && !stats.hidden } });
  return null;
}
