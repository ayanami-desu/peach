/* 外部播放的三种取法：在本机播放器里打开、下 M3U 文件、复制网络播放地址。
 *
 * 「本机」指用户自己的手机或电脑：Peach 只把限时链接换成播放器的 URI scheme 交给系统，
 * 不检测也不唤起进程（`docs/EXTERNAL_PLAYERS.md`）。链接有效期 6 小时，设备要能访问当前
 * Peach 地址。 */
import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { apiSend } from '../../api';
import { appPlayers } from '../../player/external-apps';
import { SelectField } from '../settings-panel/legacy-controls';
import { ErrorText, Help } from '../settings/section';
import { busyProps, useAction } from '../settings/use-action';

const TARGET_KEY = 'peach.playback-target.v1';
const NETWORK_TARGETS = [['m3u', 'M3U 播放列表'], ['url', '网络播放地址 / VR']] as const;
const APP_PREFIX = 'app:';

export function ExternalPlayback({ id, onOpened }: { id: number; onOpened?(): void }) {
  const players = appPlayers(navigator.userAgent);
  const options = [
    ...players.map(player => [`${APP_PREFIX}${player.id}`, player.label] as const),
    ...NETWORK_TARGETS,
  ];
  const [target, setTarget] = useState(() => savedTarget(options.map(([key]) => key)));
  const [links, setLinks] = useState<{ url: string; playlist: string } | null>(null);
  const action = useAction();
  const open = () => void action.run('open', async signal => {
    const result = await apiSend<{ url: string; playlist: string }>(`/api/external-playback?id=${id}`, {}, 'POST', signal);
    return { url: new URL(result.url, location.origin).href, playlist: new URL(result.playlist, location.origin).href };
  }, result => {
    if (!result) return;
    setLinks(result);
    onOpened?.();
    if (target === 'url') return;
    if (target.startsWith(APP_PREFIX)) {
      const player = players.find(item => `${APP_PREFIX}${item.id}` === target);
      if (!player) return;
      /* 系统认不出 scheme 时这一步什么也不做，页面留在原地。 */
      document.querySelector<HTMLVideoElement>('#stage video')?.pause();
      location.href = player.link(result.url);
      return;
    }
    const link = document.createElement('a');
    link.href = result.playlist;
    link.rel = 'noreferrer';
    document.body.append(link);
    link.click();
    link.remove();
  });
  return <div data-local-playback="">
    <div data-local-playback-row="">
      <SelectField id={`external-target-${id}`} label="外部播放器" options={options} value={target}
        disabled={!!action.busy} epoch={Number(!!links)} onPick={value => {
          setTarget(value);
          setLinks(null);
          action.setError('');
          try { localStorage.setItem(TARGET_KEY, value) } catch { /* 浏览器未允许保存偏好。 */ }
        }} />
      <Button variant="secondary" aria-label="使用外部播放器打开" {...busyProps(action.busy === 'open')} onClick={open}>打开</Button>
    </div>
    {action.error ? <ErrorText>{action.error}</ErrorText> : null}
    {links ? <>
      <Input label="网络播放地址" value={links.url} isReadOnly />
      <Help>链接有效期为 6 小时。本机播放器由系统打开；另一台设备需要能访问当前 Peach 地址。</Help>
    </> : null}
  </div>;
}

/** 记住上次的取法；这台设备上没有那款播放器时退回 M3U。 */
function savedTarget(keys: string[]): string {
  try {
    const saved = localStorage.getItem(TARGET_KEY) || '';
    return keys.includes(saved) ? saved : keys[0]!;
  } catch { return keys[0]! }
}
