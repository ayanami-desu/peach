import { apiGet, apiSend } from '../../api';
import { queryClient } from '../query';
import type { CoverItem, FaceRef } from '@peach/card-art';
import { coverImage, javArtwork, remoteCoverUrl } from '@peach/card-art';
import { esc } from '@peach/legacy/core';
import { peachHistory, shellNavigate } from '@peach/history';
import type { DiscoveryDirection, DiscoverySort } from './discovery-sorts';

export { JAV_TABS, javTab, javPath, javLibraryPath } from './jav-navigation';

/** 分区里的筛选写进地址栏：替换当前记录，不多压一条历史。 */
export function writeJavQuery(patch: Record<string, string>): void {
  const params = new URLSearchParams(location.search);
  for (const [key, value] of Object.entries(patch)) { if (value) params.set(key, value); else params.delete(key) }
  shellNavigate(location.pathname + (params.size ? `?${params}` : ''), { replace: true, state: peachHistory.navigation.location.state });
}

/** `/api/jav/discoveries` 的一行：馆藏里还没看过的作品，带官方封面与实体引用。 */
export interface Discovery extends CoverItem {
  id: number; code: string; title: string; performers: string; release_date: string;
  studio: string; link: string; cover_url: string; has_cover: boolean; has_thumb?: boolean;
  performer_refs?: (FaceRef & { name: string; source_actor_id?: string; source_avatar?: boolean })[];
  asset_id?: number | null; tags?: string[]; rank?: number;
  source_score?: number | null; duration?: number | null;
  metadata_state?: 'pending' | 'ready' | 'partial' | 'unavailable' | 'stale';
}

/** `/api/jav/cover` 的回话：取到了就带上版本与取景的两份边车，没取到是原因。 */
export interface CoverNow {
  has_cover: boolean; cover_version: string; message: string;
  cover_frame?: CoverItem['cover_frame']; poster_box?: CoverItem['poster_box'];
}

/* 正在当场取的番号：卡上点的、整批插队里轮到的都记在这里，卡片按它画不定进度圆环，两种入口一个样子。 */
const coversInFlight = new Set<string>();
const coverListeners = new Set<() => void>();
let coverRevision = 0;
const coversChanged = () => { coverRevision += 1; coverListeners.forEach(listener => listener()) };
export const coverFetching = {
  subscribe(listener: () => void) { coverListeners.add(listener); return () => { coverListeners.delete(listener) } },
  revision: () => coverRevision,
  has: (code: string) => coversInFlight.has(code),
};

/** 不进后台的队，当场取这一部的官方封面（详情页「立即重试」同一个接口）。 */
export function fetchCoverNow(code: string, signal?: AbortSignal): Promise<CoverNow> {
  coversInFlight.add(code); coversChanged();
  return apiSend<CoverNow>('/api/jav/cover', { code }, 'POST', signal)
    .finally(() => { coversInFlight.delete(code); coversChanged() });
}

/** 一批番号逐部当场取，`parallel` 部并行。`fetchOne` 回这一部取没取到；`alive()` 为假就停在当前这部，
 *  没轮到的照旧排在后台的队里。探索页与首页的封面补取共用。 */
export async function prioritiseCovers(codes: string[], fetchOne: (code: string) => Promise<boolean>,
  progress: (done: number) => void, alive: () => boolean, parallel = 2): Promise<number> {
  const queue = [...codes];
  let done = 0, got = 0;
  const worker = async () => {
    for (let code = queue.shift(); code && alive(); code = queue.shift()) {
      const ok = await fetchOne(code).catch(() => false);
      if (!alive()) return;
      done += 1; got += ok ? 1 : 0;
      progress(done);
    }
  };
  await Promise.all(Array.from({ length: parallel }, worker));
  return got;
}

/** 当场取到的封面补进探索分区已取回的数据：卡片换上本机那张，不必整页重问。 */
export function coverArrived(code: string, result: CoverNow): void {
  const patch = (data: unknown) => {
    const items = (data as { items?: Discovery[] } | undefined)?.items;
    return items ? { ...(data as object), items: items.map(item => item.code === code ? { ...item, has_cover: true,
      cover_version: result.cover_version, cover_frame: result.cover_frame, poster_box: result.poster_box } : item) } : data;
  };
  queryClient.setQueriesData({ queryKey: ['jav-discoveries'] }, patch);
}

export interface DiscoveryResult {
  items: Discovery[]; candidate_total: number; sort: DiscoverySort; direction: DiscoveryDirection;
  limited: boolean; source: 'library';
}

export const discoveryKey = (sort: DiscoverySort = 'release_date', direction: DiscoveryDirection = 'desc') =>
  ['jav-discoveries', sort, direction] as const;

/** 馆藏探索只读：一页按所选字段排序的作品。 */
export function fetchDiscoveries(signal: AbortSignal, options: {
  sort?: DiscoverySort; direction?: DiscoveryDirection;
} = {}) {
  const params = new URLSearchParams({ limit: '100', sort: options.sort || 'release_date', direction: options.direction || 'desc' });
  return apiGet<DiscoveryResult>(`/api/jav/discoveries?${params}`, signal);
}

export function discoveryArtwork(item: Discovery, layout: 'big' | 'small', javImage: unknown): string {
  const local = javArtwork({ ...item, is_jav: true }, layout, false, javImage);
  if (local.html || !item.cover_url || !item.code) return local.html;
  const remote = esc(remoteCoverUrl(item));
  return coverImage(item, layout).replace(/ src="[^"]*"/,
    ` src="${remote}" data-jav-image="${item.id}" data-jav-cover="${remote}" data-jav-thumb="" data-jav-image-layout="${layout}"${layout === 'big' ? ' data-panel-prior="1"' : ''}`)
    .replace('data-drop="self"', 'data-drop="initial" data-initial="封面未取得" data-drop-class="media-nopic"');
}

export async function prefetchJav(tab: string, signal: AbortSignal) {
  if (tab !== 'explore') return;
  await queryClient.ensureQueryData({ queryKey: discoveryKey(), queryFn: () => fetchDiscoveries(signal),
    staleTime: 30_000, revalidateIfStale: true });
}
