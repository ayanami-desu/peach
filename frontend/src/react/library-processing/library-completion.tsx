import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { cardArtwork, frameArtwork } from '@peach/card-art';

import { LinkButton } from '@/components/base/buttons/link-button';
import { RiArrowRightLine } from '@remixicon/react';
import { cx } from '@/utils/cx';

import { apiSend, errorMessage } from '../../api';
import type { MediaItem } from '../catalog-grid/types';
import { Note } from '../components/note';
import { queryClient } from '../query';
import {
  DISCONNECTED_TEXT, fetchLibraryProcessing, LIBRARY_PROCESSING_KEY, LIBRARY_PROCESSING_URL,
  pollInterval, processingActive, type LibraryProcessingCommand, type LibraryProcessingData,
} from './library-processing';
import { ProcessingActions } from './processing-actions';

/** 缺图判据与卡面一致；常见的视频文件可抽帧，有番号的影片可补发行封面。 */
type PreviewItem = Pick<MediaItem, 'id' | 'name' | 'medium' | 'disposal' | 'location' | 'code' | 'is_jav'
  | 'has_cover' | 'cover_key' | 'has_thumb' | 'has_local_poster'>;

/** 卡面画不画得出来。`frames` 是竖屏格（竖屏带与筛竖屏的网格）：那里番号作品也只用视频帧，
 *  不借官方封面，判据同 `media-card.tsx` 的 `frameOnly`。 */
const pictured = (item: PreviewItem, javImage: string, frames: boolean) =>
  Boolean((frames && item.is_jav ? frameArtwork(item, false) : cardArtwork(item, 'small', false, javImage)).html);

/** 同步能补上图的缺图影片。番号作品补得到发行封面，所以 STRM 目录里的也算；竖屏格
 *  要的是视频帧，封面画不进去，番号就不再替它们开脱。 */
export function missingPreviewIds(items: PreviewItem[], javImage: string, frames = false): number[] {
  const cover = (item: PreviewItem) => !frames && !!item.code;
  return [...new Set(items.filter(item => (!item.medium || item.medium === 'video')
    && (!/\.(strm|iso)$/i.test(item.name || '') || cover(item))
    && !item.disposal && item.location !== 'online'
    && !pictured(item, javImage, frames)).map(item => item.id))];
}

/** 补全这几部：资料、视频属性与九宫格都由采集那一趟做。 */
export const startPreviews = (ids: number[], signal?: AbortSignal) =>
  apiSend<LibraryProcessingData>(LIBRARY_PROCESSING_URL, { stage: 'collect', asset_ids: ids }, 'POST', signal);

/** 单独一行；`className` 交给所在布局定外边距，列表页由父级间距负责。 */
export function LibraryCompletionPrompt({ assetIds, onComplete, className = 'mb-4' }: {
  assetIds: number[]; onComplete?(): void; className?: string;
}) {
  if (!assetIds.length) return null;
  return <Completion assetIds={assetIds} onComplete={onComplete} className={className} />;
}

function Completion({ assetIds, onComplete, className }: {
  assetIds: number[]; onComplete?(): void; className: string;
}) {
  const job = useQuery({ queryKey: LIBRARY_PROCESSING_KEY,
    queryFn: ({ signal }) => fetchLibraryProcessing(signal),
    refetchInterval: query => pollInterval(query.state.data, true) });
  const [started, setStarted] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('');
  const completed = useRef<string | null>(null);
  const start = useMutation({
    mutationFn: (command: LibraryProcessingCommand) =>
      apiSend<LibraryProcessingData>(LIBRARY_PROCESSING_URL, { ...command, asset_ids: assetIds }),
    onSuccess: next => {
      setStarted(next.job_id || null);
      queryClient.setQueryData(LIBRARY_PROCESSING_KEY, next);
      void queryClient.invalidateQueries({ queryKey: LIBRARY_PROCESSING_KEY });
    },
  });
  const state = job.data;
  useEffect(() => {
    if (!state || !started || state.job_id !== started || processingActive(state)
      || completed.current === started) return;
    completed.current = started;
    if (state.status === 'complete') {
      setOutcome(`补全完成：取得 ${state.covers || 0} 张封面，生成 ${state.previews || 0} 部视频预览。`);
    }
    void queryClient.invalidateQueries({ queryKey: ['catalog-grid'] });
    onComplete?.();
  }, [state, started, onComplete]);
  // 运行时保留缺图数量；新范围等待当前任务结束，不隐式追加或替换。
  const busy = start.isPending || processingActive(state);
  const problem = start.error ? errorMessage(start.error) : job.error ? DISCONNECTED_TEXT
    : started && state?.job_id === started && state.status === 'failed' ? state.error || '补全未完成' : '';
  const later = processingActive(state) ? '当前任务结束后可单独补全。' : '';
  const summary = `这批影片中有 ${assetIds.length.toLocaleString()} 部暂无预览，${later || '可补全资料与图片。'}`;
  const message = problem || (start.isPending ? '正在启动补全…' : outcome || summary);
  return <section aria-label="补全预览" aria-live="polite" data-library-completion="" className={cx('@container', className)}>
    <Note tone={problem ? 'warning' : 'neutral'} action={
      <ProcessingActions busy={busy} metadataOnly={state?.metadata_only} onRun={command => {
        if (busy) return;
        setOutcome('');
        start.mutate(command);
      }} />}>
      {message}{' '}<LinkButton href="/data-cleanup#libraryProcessing" size="small" trailingIcon={RiArrowRightLine}>
      {problem ? '打开扫描与采集' : '查看处理详情'}
    </LinkButton></Note>
  </section>;
}
