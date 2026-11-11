/* 倍速只活在这个播放器实例里：换源保留当前速率，换片回到 1×。
 *
 * 字幕清单连同它的读写接口一起删掉了（ADR-0157），所以没有跨次打开的记忆可言。 */
import type { VjsPlayer } from './types';

export function mountPlaybackRate(player: VjsPlayer, video: HTMLVideoElement) {
  let rate = Number(player.playbackRate()) || 1;
  const apply = () => {
    video.defaultPlaybackRate = rate;
    if (Number(player.playbackRate()) !== rate) player.playbackRate(rate);
  };
  video.addEventListener('loadedmetadata', apply);
  player.on('dispose', () => video.removeEventListener('loadedmetadata', apply));
  return {
    current: () => rate,
    set(next: number) { rate = next; apply() },
  };
}
