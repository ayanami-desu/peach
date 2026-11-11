/* 开了流量保护的目录里补图：同步时这些目录不读，只有人点名的影片、确认过一次才读。
 * 作品卡上的单部按钮与状态条上的整批按钮共用这一份确认和请求。
 *
 * 服务端没有「只生成预览」这一档（`library_processing.STAGES` 就 `all`/`collect`/`metadata`），
 * 九宫格跟着采集跑，所以这里发的是 `collect` 加 `asset_ids`；`allow_metered` 只对点名的影片
 * 认（`web_library_processing._metered_grant`）。 */
import { confirmModal } from '@peach/legacy/ui';

import { apiSend } from '../../api';
import { LIBRARY_PROCESSING_URL, type LibraryProcessingData } from './library-processing';

export async function confirmMeteredPreviews(count: number): Promise<boolean> {
  const which = count > 1 ? `这 ${count.toLocaleString()} 部影片` : '这部影片';
  const each = count > 1 ? '每部影片' : '这部影片';
  const { confirmed } = await confirmModal({
    title: '读取开了流量保护的目录',
    body: `${which}所在的目录开了流量保护，同步时不会读它。补全时会读${each}的画面补九宫格，消耗这个来源的流量。`,
    confirmLabel: '继续补全',
  });
  return confirmed;
}

/** 补全这几部：资料、视频属性与九宫格都由采集那一趟做。 */
export const startPreviews = (ids: number[], metered: boolean, signal?: AbortSignal) =>
  apiSend<LibraryProcessingData>(LIBRARY_PROCESSING_URL,
    { stage: 'collect', asset_ids: ids, ...(metered ? { allow_metered: true } : {}) }, 'POST', signal);
