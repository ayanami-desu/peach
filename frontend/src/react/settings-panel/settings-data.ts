/* 设置偏好与 Peach 配置的五份服务端数据，各一个 Query 键。
 *
 * - `['settings']`：跟数据库走、所有访问端同一份的那几项（`/api/settings`，`src/peach/web_settings.py`）。
 *   面板每次打开都重取一次，取回来交给壳对账（`host.syncRemote`）：界面偏好的真相仍是壳里那一份
 *   `appSettings`，这个键只是数据库那边的快照。写入同样走这个端点，成功后回来的整份写回这个键。
 * - `['thumbnail-jobs']`：视频缩略图采集的档位与状态。档位跟着机器走，不存在浏览器里。
 * - `['media-processing']`：这台机器生成预览的开关与抽帧、转码的编解码方式。配置页「视频预览」与
 *   「视频播放」两张卡读写同一份。
 *
 * 面板常驻不卸载，每次打开重取设置；Peach 配置在挂载时重取各自的数据。 */
import type { InterfaceLanguageChoice } from '../../i18n';
import { useMutation, type QueryClient } from '@tanstack/react-query';

import { apiGet, apiSend } from '../../api';
import { queryClient } from '../query';
import type { NavigationOrders } from '../../navigation-order';

export const SETTINGS_URL = '/api/settings';
export const THUMBNAIL_JOBS_URL = '/api/thumbnail-jobs';

export const SETTINGS_KEY = ['settings'] as const;
export const THUMBNAIL_JOBS_KEY = ['thumbnail-jobs'] as const;
export const MEDIA_PROCESSING_URL = '/api/media-processing';
export const MEDIA_PROCESSING_KEY = ['media-processing'] as const;

/** `/api/media-processing` 的整份；写入只送改了的那一项，回来的仍是整份。 */
export interface MediaProcessingPolicy {
  metadata_only: boolean;
  preview_acceleration?: 'auto' | 'software';
}
export const fetchMediaProcessing = (signal?: AbortSignal) =>
  apiGet<MediaProcessingPolicy>(MEDIA_PROCESSING_URL, signal);

/** `q_settings` 返回的整份；写入时只送改了的那几个键，回来的仍是整份。 */
export interface SyncedSettings {
  taskSpeedMode?: 'low' | 'standard' | 'high';
  performerNameLanguage?: 'zh-CN' | 'ja';
  interfaceLanguage?: InterfaceLanguageChoice;
  systemLanguage?: string | null;
  sidebarOrder?: string[];
  manageOrder?: string[];
  navigationOrders?: NavigationOrders;
  libraryOrder?: string[];
  postSetupTutorialDone?: boolean;
  /** 数据库里还没存过时是 null：这台设备本地那个数替所有访问端先定下来。 */
  searchHistoryLimit?: number | null;
  /** 番号识别规则，一条一个正则。 */
  codePatterns?: string[];
}

export interface ThumbnailJobStatus {
  mode: string;
  status: 'idle' | 'running' | 'failed' | 'complete' | string;
  stopped?: string;
}

export const fetchSettings = (signal?: AbortSignal) => apiGet<SyncedSettings>(SETTINGS_URL, signal);
export const fetchThumbnailJobs = (signal?: AbortSignal) =>
  apiGet<ThumbnailJobStatus>(THUMBNAIL_JOBS_URL, signal);

/** 打开偏好弹窗时重取共享设置；采集状态由 Peach 配置中的控件读取。 */
export function refreshPanelData(client: QueryClient = queryClient): Promise<SyncedSettings | null> {
  return client.fetchQuery({
    queryKey: SETTINGS_KEY, queryFn: ({ signal }) => fetchSettings(signal), staleTime: 0,
  }).catch(() => null);
}

/** 写跟数据库走的那几项。回来的是合并之后的整份，写回 `['settings']`。 */
export function useSaveSettings(scope?: string) {
  return useMutation({
    scope: scope ? { id: scope } : undefined,
    mutationFn: (patch: SyncedSettings) => apiSend<SyncedSettings>(SETTINGS_URL, patch),
    onSuccess: (saved) => queryClient.setQueryData(SETTINGS_KEY, saved),
  }, queryClient);
}

export function useSaveThumbnailMode() {
  return useMutation({
    mutationFn: (mode: string) => apiSend<ThumbnailJobStatus>(THUMBNAIL_JOBS_URL, { mode }),
    onSuccess: (status) => queryClient.setQueryData(THUMBNAIL_JOBS_KEY, status),
  });
}
