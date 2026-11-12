/* 详情播放器：给舞台播放区的 `<video>` 挂 Video.js 与全部 Peach 控件。
 *
 * - `mountDetailPlayer` 挂一个 Video.js 实例：片源解析、时长校正、出错时从分片退回直读、脱盘判定，
 *   ready 之后挂设置菜单、拖动预览、Media Session、转圈与字幕。
 * - `attachPlayerChrome` 把统计面板、加载速度角标与氛围光接到一块媒体框上。播放器进小窗时摘下，
 *   展开回舞台时接到新的媒体框上，实例本身不重建。
 * - `mountPlayer` 是舞台播放区与沉浸模式每一格的入口：插氛围光画布与统计角标，按作品
 *   给片源、海报与上报，返回拆掉这一个播放器的函数。 */
import { detailPosterUrl } from '@peach/card-art';
import { api, esc, fmtClock, fmtSize, icon, realDuration } from '@peach/legacy/core';

import {
  mountPlayerAmbient, mountPlayerMediaSession, mountPlayerQualityControl, mountPlayerSeekPreview,
  mountPlayerSpinner,
} from './controls';
import { disposePlayer } from './dispose';
import { playerHost } from './host';
import { mountImmersePlayer, type ImmersePlayerOptions } from './immerse-player';
import { wirePlayerContextMenu } from './menu';
import { detailPlayer, setDetailPlayer } from './registry';
import { playbackKey, playbackPosition, stopPlaybackPosition, trackPlaybackPosition } from './progress';
import {
  averageBitrate, bufferedAhead, createBufferMeter, fmtLoadRate, fmtSpeed, PLAYER_PANEL_EVENT,
  playerSpeedBits, playerStatsOverlayHtml, playerStatsPlot, pushPlayerStat, streamEntries,
} from './stats';
import { detailStreamSession, detailStreamSource, directDetailSource } from './stream';
import { stopTelemetry, wireTelemetry } from './telemetry';
import type { PlayerItem, VjsPlayer } from './types';
import { ensureVideojs } from './videojs';
import { isPlayerGuidePreview } from './guide-preview';

/** 从小窗展开回来或带 `?t=` 深链进来时接着放的那一刻。 */
export interface PlayerResume { time: number; autoplay: boolean }

export interface DetailPlayerOptions {
  guidePreview?: boolean;
  playbackKey?: string;
  poster?: string | undefined;
  resume?: PlayerResume | null;
}

/** 媒体框里那三块读数：统计键、统计面板与加载速度角标（`playerStatsOverlayHtml`）。 */
interface PlayerChrome {
  statsButton: HTMLElement | null;
  statsPanel: HTMLElement | null;
  netBadge: HTMLElement | null;
}

/** 一个播放器实例的读数来源。面板画在哪一块框里由 `chrome` 决定，换框时只换它。 */
interface PlayerSession {
  chrome: PlayerChrome | null;
  /** ready 之后统计键才露出来：控件条还没挂上时点它什么也读不到。 */
  ready: boolean;
  updateStats(): void;
}

const sessions = new WeakMap<VjsPlayer, PlayerSession>();

/* 统计面板与加载速度角标的定时器。它们画在舞台的媒体框里，播放器进小窗时跟着舞台一起停。 */
let statsTimer: ReturnType<typeof setInterval> | null = null;
let netTimer: ReturnType<typeof setInterval> | null = null;
let netHideTimer: ReturnType<typeof setTimeout> | null = null;

/** 停掉统计面板与角标的刷新。播放器本身不动。 */
export function stopPlayerPanels(): void {
  if (statsTimer) { clearInterval(statsTimer); statsTimer = null }
  if (netTimer) { clearInterval(netTimer); netTimer = null }
  if (netHideTimer) { clearTimeout(netHideTimer); netHideTimer = null }
}

export async function mountDetailPlayer(
  item: PlayerItem, video: HTMLVideoElement, autoplay: boolean, options: DetailPlayerOptions = {},
): Promise<VjsPlayer | null> {
  const existing = detailPlayer();
  if (existing && !existing.isDisposed()) return existing;
  const host = playerHost();
  const resume = options.resume ?? null;
  if (resume?.autoplay) autoplay = true;
  if (options.guidePreview) autoplay = false;
  /* 拉不到就退回原生 video，和「页面里没有 videojs」是同一个兜底出口。 */
  let videojs;
  try { videojs = await ensureVideojs() } catch {
    video.controls = true;
    if (options.guidePreview) return null;
    video.preload = 'none';
    let fallbackStarted = false;
    const startFallback = () => {
      if (fallbackStarted) return;
      fallbackStarted = true;
      detailStreamSource(item).then((next) => {
        video.addEventListener('loadedmetadata', () => {
          if (resume && resume.time > 0) video.currentTime = Math.min(resume.time, realDuration(video.duration) || resume.time);
        }, { once: true });
        video.src = next.src;
        void video.play().catch(() => {});
      }).catch(() => { fallbackStarted = false });
    };
    if (autoplay) startFallback();
    else {
      video.addEventListener('click', startFallback);
      video.addEventListener('play', startFallback);
    }
    return null;
  }
  const player = videojs(video, {
    controls: true, preload: autoplay ? 'metadata' : 'none', language: 'zh-CN', responsive: true,
    /* 海报与作品当前封面偏好一致，交给原生视频显示。 */
    poster: options.poster || detailPosterUrl(item, host.settings().javImage),
    controlBar: {
      pictureInPictureToggle: true, currentTimeDisplay: false, timeDivider: false,
      durationDisplay: false, remainingTimeDisplay: false,
      // 时间与悬停预览归 Peach 控件，进度条只保留播放与拖动所需的组件。
      progressControl: { seekBar: { mouseTimeDisplay: false, playProgressBar: { timeTooltip: false } } },
    },
  });
  setDetailPlayer(player);
  player.peachItem = item;
  player.peachPlaybackKey = options.playbackKey || playbackKey(item);
  wirePlayerContextMenu(player);
  /* 手机上的画面格按视频自己的比例排（`--peach-video-ratio`）。 */
  player.on('loadedmetadata', () => {
    const tech = player.el()?.querySelector('video');
    if (tech?.videoWidth && tech.videoHeight) player.el().style.setProperty('--peach-video-ratio', `${tech.videoWidth}/${tech.videoHeight}`);
  });
  // 非正时长一律当未知。
  const expected = realDuration(item.duration);
  const statsHistory = { speed: [] as number[], activity: [] as number[], buffer: [] as number[] };
  /* 码率是速度读数的换算系数：文件大小来自这条作品自己。 */
  const mediaSize = Number(item.size) || 0;
  const meter = createBufferMeter(averageBitrate(mediaSize, item.duration));
  let statsLoaded = 0;
  let correcting = false;
  const live = () => detailPlayer() === player && !player.isDisposed();
  const enforceDuration = () => {
    if (!expected || correcting || !live()) return;
    const reported = Number(player.duration());
    if (!Number.isFinite(reported) || Math.abs(reported - expected) > Math.max(2, expected * .001)) {
      correcting = true; player.duration(expected); queueMicrotask(() => { correcting = false });
    }
  };
  const segmentedNow = () => String(player.currentSource()?.type || '').includes('mpegurl');
  const session: PlayerSession = { chrome: null, ready: false, updateStats: () => {} };
  sessions.set(player, session);
  session.updateStats = () => {
    const statsPanel = session.chrome?.statsPanel;
    if (!statsPanel || statsPanel.hidden || !live()) return;
    const quality = video.getVideoPlaybackQuality ? video.getVideoPlaybackQuality() : null;
    const rect = video.getBoundingClientRect(), current = `${video.videoWidth || item.width || '?'}×${video.videoHeight || item.height || '?'}`;
    const segmented = segmentedNow();
    const stream = detailStreamSession();
    const resources = segmented ? streamEntries(item.id, stream) : [];
    const bytes = resources.reduce((n, entry) => n + (entry.transferSize || entry.encodedBodySize || 0), 0);
    const seconds = resources.reduce((n, entry) => n + (entry.duration || 0), 0) / 1000;
    meter.sample(video);
    const speed = playerSpeedBits(player, item.id, stream, segmented ? null : meter) || (seconds > 0 ? bytes * 8 / seconds : 0);
    /* 分片流按已完成请求的字节累计；渐进源没有这种请求，按前沿推进折算，码率未知时退到秒。 */
    const loaded = segmented ? bytes : (meter.bitrate > 0 ? meter.bytes() : meter.seconds);
    const activity = Math.max(0, loaded - statsLoaded); statsLoaded = loaded;
    const buffer = bufferedAhead(video);
    pushPlayerStat(statsHistory.speed, speed);
    pushPlayerStat(statsHistory.activity, activity);
    pushPlayerStat(statsHistory.buffer, buffer);
    /* 关注条目没有落盘文件名，容器格式只能从片源 MIME 反推；HLS 已经写在传输一侧，不重复。 */
    const named = String(item.name || '');
    const container = (named.includes('.') ? named.split('.').pop() || ''
      : segmented ? '' : String(player.currentSource()?.type || '').split('/').pop() || '').toUpperCase() || '—';
    const speedText = speed ? `${(speed / 1e6).toFixed(1)} Mbps` : '—';
    const byteScale = segmented || meter.bitrate > 0;
    const loadedRow: [string, string, string] = segmented
      ? ['网络活动', `${bytes ? fmtSize(bytes) : '—'} · ${resources.length} 请求`,
        `最近一秒网络活动 ${activity ? fmtSize(activity) : '0 B'}`]
      : ['已下载', byteScale ? `${fmtSize(loaded)}${mediaSize > 0 ? ` / ${fmtSize(mediaSize)}` : ''}` : `${loaded.toFixed(0)} 秒`,
        byteScale ? `最近一秒下载 ${activity ? fmtSize(activity) : '0 B'}` : `最近一秒下载 ${activity.toFixed(1)} 秒`];
    const rows: [string, string, string?][] = [
      ['视频 ID / 会话', stream ? `${item.id} / ${stream.slice(0, 8)}` : `${item.id}`],
      ['视口 / 帧', `${Math.round(rect.width)}×${Math.round(rect.height)} / ${quality ? `${quality.totalVideoFrames - quality.droppedVideoFrames} of ${quality.totalVideoFrames}` : '—'}`],
      ['当前 / 最佳分辨率', `${current} / ${item.width || video.videoWidth || '?'}×${item.height || video.videoHeight || '?'}`],
      ['编码 / 传输', `${container} / ${segmented ? 'HLS' : 'HTTP Range'}`],
      ['连接速度', speedText,
        playerStatsPlot(statsHistory.speed, 'speed', Math.max(10e6, ...statsHistory.speed), `连接速度 ${speedText === '—' ? '暂无数据' : speedText}`)],
      [loadedRow[0], loadedRow[1],
        playerStatsPlot(statsHistory.activity, 'activity', Math.max(1, ...statsHistory.activity), loadedRow[2])],
      ['缓冲健康', `${buffer.toFixed(1)} 秒`,
        playerStatsPlot(statsHistory.buffer, 'buffer', 30, `当前可连续播放 ${buffer.toFixed(1)} 秒`)],
      ['播放时间', `${fmtClock(video.currentTime)} / ${fmtClock(expected || player.duration())}`],
      ['日期', new Date().toLocaleString()],
    ];
    statsPanel.innerHTML = `<dl>${rows.map(([key, value, plot]) =>
      `<dt>${esc(key)}</dt><dd${plot ? ' data-player-stats-metric=""' : ''}>${plot || ''}<span>${esc(value)}</span></dd>`).join('')}</dl>`;
  };
  player.on(['loadstart', 'loadedmetadata', 'durationchange', 'error'], enforceDuration);
  let segmentedSource = false, fallbackUsed = false;
  const updateNet = () => {
    const netBadge = session.chrome?.netBadge;
    if (!netBadge || player.isDisposed()) return;
    const segmented = segmentedNow();
    if (!segmented) meter.sample(video);
    const bits = playerSpeedBits(player, item.id, detailStreamSession(), segmented ? null : meter);
    const rate = segmented ? fmtSpeed(bits) : fmtLoadRate(bits, bufferedAhead(video));
    netBadge.innerHTML = `${icon('gauge')}<span class="sr-only">加载速度</span><span>${esc(rate)}</span>`;
  };
  const showNet = () => {
    const netBadge = session.chrome?.netBadge;
    if (!netBadge || !netBadge.isConnected) return;
    netBadge.hidden = false; updateNet();
    if (netTimer) clearInterval(netTimer);
    netTimer = setInterval(updateNet, 500);
  };
  const hideNet = () => {
    const netBadge = session.chrome?.netBadge;
    if (!netBadge) return;
    if (netHideTimer) clearTimeout(netHideTimer);
    netHideTimer = setTimeout(() => { netBadge.hidden = true; if (netTimer) { clearInterval(netTimer); netTimer = null } }, 1400);
  };
  player.on(['loadstart', 'progress', 'waiting', 'stalled'], showNet);
  player.on(['canplay', 'playing'], () => { updateNet(); hideNet() });
  player.on('error', () => {
    if (segmentedSource && !fallbackUsed && !player.isDisposed()) {
      fallbackUsed = true; segmentedSource = false;
      player.src(directDetailSource(item));
      if (autoplay) player.play()?.catch(() => {});
      return;
    }
    // 播到一半掉盘时 video 元素只报通用错误；来源状态才分得清脱盘和文件损坏。
    void host.loadSourceStatus().then((status) => {
      if (status[String(item.root_id || item.location)] !== false || player.isDisposed()) return;
      player.error({ code: 2, message: `媒体目录无法访问 · ${host.offlineReason(String(item.root_id || item.location))}` });
    });
  });
  player.ready(() => {
    enforceDuration();
    mountPlayerQualityControl(player, video, item.height, null);
    mountPlayerSeekPreview(player, item, { thumbnail: true });
    if (!options.guidePreview) mountPlayerMediaSession(player, item);
    mountPlayerSpinner(player);
    session.ready = true;
    if (session.chrome?.statsButton) session.chrome.statsButton.hidden = false;
  });
  let sourceStarted = false, sourceStarting = false;
  const startSource = () => {
    if (sourceStarted || sourceStarting || !live()) return;
    sourceStarting = true;
    detailStreamSource(item).then((next) => {
      sourceStarting = false;
      if (!live()) return;
      sourceStarted = true;
      segmentedSource = String(next.type || '').includes('mpegurl');
      if (resume && resume.time > 0) player.one('loadedmetadata', () => {
        if (player.isDisposed()) return;
        const duration = realDuration(player.el().querySelector('video')?.duration) || realDuration(player.duration());
        player.currentTime(Math.min(resume.time, duration || resume.time));
      });
      player.src(next);
      enforceDuration(); setTimeout(enforceDuration, 0); setTimeout(enforceDuration, 250);
      player.play()?.catch(() => {});
    }).catch(() => { sourceStarting = false });
  };
  if (!options.guidePreview) {
    if (autoplay) startSource();
    else {
      /* 不自动播时不碰片源：连 `/api/stream-plan` 也不发。首次播放意图来自播放按钮、点画面
       * 或键盘；捕获阶段拦住它们，等片源挂好后再真正播放。 */
      const root = player.el();
      const onClick = (event: Event) => {
        if (sourceStarted || sourceStarting) return;
        const target = event.target as Element | null;
        if (!target?.closest('.vjs-play-control, .vjs-big-play-button, video, .vjs-tech, .vjs-poster')) return;
        event.preventDefault(); event.stopPropagation();
        startSource();
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (sourceStarted || sourceStarting || (event.key !== ' ' && event.key !== 'Enter')) return;
        const target = event.target as Element | null;
        if (!target?.closest('.vjs-play-control, .vjs-big-play-button, video, .vjs-tech')) return;
        event.preventDefault(); event.stopPropagation();
        startSource();
      };
      root.addEventListener('click', onClick, true);
      root.addEventListener('keydown', onKeyDown, true);
      player.on('dispose', () => {
        root.removeEventListener('click', onClick, true);
        root.removeEventListener('keydown', onKeyDown, true);
      });
      player.on('play', startSource);
    }
  }
  return player;
}

const AMBIENT_CANVAS = '<canvas data-ambient-canvas="" width="32" height="18"></canvas>';

/** 氛围光放在媒体框首部；作品详情的统计键与速率挂到 React 留出的工具栏插槽，统计面板留在框内。
 *  关注详情没有工具栏，读数插在 `before` 前面。已有读数时保留当前节点与事件。 */
export function preparePlayerFrame(frame: HTMLElement, before: Element | null = null): void {
  if (!frame.querySelector(':scope > [data-ambient-canvas]')) frame.insertAdjacentHTML('afterbegin', AMBIENT_CANVAS);
  if (frame.querySelector('#playerStatsBtn')) return;
  const overlay = document.createElement('template');
  overlay.innerHTML = playerStatsOverlayHtml();
  const toolbar = frame.querySelector(':scope > [data-player-toolbar]');
  if (toolbar) {
    toolbar.querySelector('[data-player-stats-slot]')!.append(overlay.content.querySelector('#playerStatsBtn')!);
    toolbar.querySelector('[data-player-net-slot]')!.append(overlay.content.querySelector('#playerNet')!);
  }
  frame.insertBefore(overlay.content, before);
}

/** 把统计面板、加载速度角标与氛围光接到 `frame` 上（它先经过 `preparePlayerFrame`）。返回摘下的
 *  函数：进小窗时摘，播放器销毁时自己摘。 */
export function attachPlayerChrome(player: VjsPlayer, frame: HTMLElement): () => void {
  const session = sessions.get(player);
  if (!session || player.isDisposed()) return () => {};
  const find = (id: string) => frame.querySelector<HTMLElement>(`#${id}`);
  const chrome: PlayerChrome = { statsButton: find('playerStatsBtn'), statsPanel: find('playerStats'), netBadge: find('playerNet') };
  session.chrome = chrome;
  const { statsButton, statsPanel } = chrome;
  let offPanels = () => {};
  if (statsButton && statsPanel) {
    statsButton.hidden = !session.ready;
    const closeStats = () => {
      if (statsPanel.hidden) return;
      statsPanel.hidden = true; statsButton.setAttribute('aria-pressed', 'false');
      if (statsTimer) { clearInterval(statsTimer); statsTimer = null }
    };
    statsButton.onclick = () => {
      if (!statsPanel.hidden) { closeStats(); return }
      document.dispatchEvent(new CustomEvent(PLAYER_PANEL_EVENT, { detail: 'stats' }));
      statsPanel.hidden = false; statsButton.setAttribute('aria-pressed', 'true');
      session.updateStats();
      if (statsTimer) clearInterval(statsTimer);
      statsTimer = setInterval(session.updateStats, 1000);
    };
    const closeStatsForOtherPanel = (event: Event) => { if ((event as CustomEvent<string>).detail !== 'stats') closeStats() };
    document.addEventListener(PLAYER_PANEL_EVENT, closeStatsForOtherPanel);
    offPanels = () => document.removeEventListener(PLAYER_PANEL_EVENT, closeStatsForOtherPanel);
  }
  const tech = player.el().querySelector('video');
  const stopAmbient = tech ? mountPlayerAmbient(tech) : () => {};
  let attached = true;
  const detach = () => {
    if (!attached) return;
    attached = false;
    offPanels(); stopAmbient();
    if (session.chrome === chrome) { session.chrome = null; stopPlayerPanels() }
  };
  player.one('dispose', detach);
  return detach;
}

export interface MountPlayerOptions {
  kind: 'item';
  item: PlayerItem;
  /** 不给就按设置（`detailAutoplay`）。 */
  autoplay?: boolean | undefined;
  resume?: PlayerResume | null;
  /** 挂载之前在媒体框里插氛围光画布与统计角标。默认插；小窗里换片不要这些。 */
  chrome?: boolean;
  /** 挂上之后把实例交出去：小窗与展开要认得这一个。挂不上（Video.js 拉不到、退回原生 video）
   *  给 null。拆得比挂载快时不回调。 */
  onPlayer?: (player: VjsPlayer | null) => void;
  /** 这个播放器已经被小窗接走：拆播放区时不销毁它。 */
  handedOff?: (player: VjsPlayer) => boolean;
}

/** 舞台播放区的入口：给播放区里的 `<video>` 挂播放器，返回拆掉它的函数。
 *
 *  氛围光画布与统计角标在挂载之前插进媒体框：Video.js 一包，`video` 的父级就换成它自己的那层了。
 *  - 作品（`item`）：片源由 `mountDetailPlayer` 按来源解析，海报是本地图，这一次挂载第一次开播时
 *    记一次播放，离开位置与真实观看由 `wireTelemetry` 随播放写回侧栏。
 *  - 沉浸模式的一格（`immerse`）：裸 Video.js、这一格自己的流会话，见 `immerse-player.ts`。
 *  返回的清理在舞台卸下这块媒体区时调：换一份媒体只拆这一个播放器；被小窗接走的只摘读数。 */
export function mountPlayer(video: HTMLVideoElement, options: MountPlayerOptions | ImmersePlayerOptions): () => void {
  if (options.kind === 'immerse') return mountImmersePlayer(video, options);
  const { item, handedOff, onPlayer } = options;
  const guidePreview = isPlayerGuidePreview();
  const host = playerHost();
  const frame = options.chrome === false ? null : video.parentElement;
  if (frame) preparePlayerFrame(frame, video);
  const key = playbackKey(item);
  const detail: DetailPlayerOptions = { guidePreview, playbackKey: key, resume: guidePreview ? null : options.resume ?? { time: playbackPosition(key, item), autoplay: false } };
  const poster = detailPosterUrl(item, host.settings().javImage);
  if (poster) video.poster = poster;
  let player: VjsPlayer | null = null, released = false, detachChrome = () => {}, trackedVideo = video;
  const release = () => {
    detachChrome();
    if (player && handedOff?.(player)) return;
    stopPlaybackPosition(trackedVideo);
    if (!player) { stopTelemetry(trackedVideo); return }
    if (detailPlayer() === player) { setDetailPlayer(null); stopPlayerPanels() }
    disposePlayer(player);
  };
  void mountDetailPlayer(item, video, guidePreview ? false : options.autoplay ?? host.settings().detailAutoplay, detail).then((mounted) => {
    player = mounted;
    // 挂载还没回来媒体区就换了：这一个一出来就拆掉。
    if (released) { release(); return }
    trackedVideo = mounted?.el().querySelector('video') ?? video;
    if (guidePreview) {
      mounted?.el().setAttribute('data-player-guide', '');
      onPlayer?.(mounted); return;
    }
    trackPlaybackPosition(key, trackedVideo);
    trackedVideo.addEventListener('play', () => {
      void (api('/api/play', { method: 'POST', body: JSON.stringify({ id: item.id }) }) as Promise<unknown>).catch(() => {});
    }, { once: true });
    wireTelemetry(item, trackedVideo, { watched: '#watched', mark: '#mark', ratio: '#ratioTxt' });
    if (!mounted) { onPlayer?.(null); return }
    if (frame) detachChrome = attachPlayerChrome(mounted, frame);
    onPlayer?.(mounted);
  });
  return () => { released = true; release() };
}
