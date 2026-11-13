/** 手机/电脑上的本机播放器：地址交给系统打开，播放器自己来拉流。
 *
 * Peach 不出面唤起进程（那要求 Peach 与浏览器在同一台机器上），只把限时链接换成各家的 URI
 * scheme。判断能不能装上由系统决定，认不出 scheme 时浏览器什么也不做，页面不会跳走。 */
import { t } from '../i18n';

export type AppPlatform = 'ios' | 'ipad' | 'android' | 'mac' | 'windows';

export interface AppPlayer {
  id: string;
  label: string;
  platforms: readonly AppPlatform[];
  /** 把 `https://…/external-stream/1?ticket=…` 换成这个播放器认的地址。 */
  link(url: string): string;
}

const query = (url: string) => encodeURIComponent(url);
const androidIntent = (url: string, packageName?: string) => {
  const parts = new URL(url);
  const spec = [
    `scheme=${parts.protocol.replace(':', '')}`,
    'type=video/*',
    ...(packageName ? [`package=${packageName}`] : []),
    'end',
  ].join(';');
  return `intent://${parts.host}${parts.pathname}${parts.search}#Intent;${spec}`;
};

export const APP_PLAYERS: readonly AppPlayer[] = [
  { id: 'vlc', label: 'VLC', platforms: ['ios', 'ipad', 'android', 'mac', 'windows'],
    link: url => `vlc://${url}` },
  { id: 'vlc-ios', label: 'VLC（iOS）', platforms: ['ios', 'ipad'],
    link: url => `vlc-x-callback://x-callback-url/stream?url=${query(url)}` },
  { id: 'iina', label: 'IINA', platforms: ['mac'],
    link: url => `iina://weblink?url=${query(url)}` },
  { id: 'potplayer', label: 'PotPlayer', platforms: ['windows'],
    link: url => `potplayer://${url}` },
  { id: 'mpv', label: 'mpv', platforms: ['mac', 'windows'],
    link: url => `mpv://${url}` },
  { id: 'infuse', label: 'Infuse', platforms: ['ios', 'ipad'],
    link: url => `infuse://x-callback-url/play?url=${query(url)}` },
  { id: 'senplayer', label: 'SenPlayer', platforms: ['ios', 'ipad'],
    link: url => `senplayer://x-callback-url/play?url=${query(url)}` },
  { id: 'nplayer', label: 'nPlayer', platforms: ['ios', 'ipad', 'android'],
    link: url => `nplayer-${url}` },
  { id: 'mxplayer', label: 'MX Player', platforms: ['android'],
    link: url => androidIntent(url, 'com.mxtech.videoplayer.ad') },
  { id: 'android-default', label: t('player:apps.defaultPlayer'), platforms: ['android'],
    link: url => androidIntent(url) },
];

export function appPlatform(userAgent: string): AppPlatform {
  const ua = userAgent.toLowerCase();
  // iPad 单独一类：现在与 iOS 用同一批播放器，后续可能分家。iPadOS 13 起的
  // 桌面版 UA 自称 Macintosh，靠 UA 认不出来，这里只认 UA 里写明 iPad 的那些。
  if (ua.includes('ipad')) return 'ipad';
  if (/iphone|ipod/.test(ua)) return 'ios';
  if (ua.includes('android')) return 'android';
  if (ua.includes('mac')) return 'mac';
  return 'windows';
}

/** 这台设备上可能有、能装的那些。列表顺序即展示顺序。 */
export function appPlayers(userAgent: string): AppPlayer[] {
  const platform = appPlatform(userAgent);
  return APP_PLAYERS.filter(player => player.platforms.includes(platform));
}
