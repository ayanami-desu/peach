import { describe, expect, it } from 'vitest';
import { APP_PLAYERS, appPlatform, appPlayers } from '../../src/player/external-apps';

const URL = 'https://peach.example/external-stream/7?ticket=abc';

const linkOf = (id: string) => APP_PLAYERS.find(player => player.id === id)!.link(URL);

describe('本机播放器地址', () => {
  it('桌面播放器直接拼 scheme', () => {
    expect(linkOf('vlc')).toBe(`vlc://${URL}`);
    expect(linkOf('potplayer')).toBe(`potplayer://${URL}`);
    expect(linkOf('mpv')).toBe(`mpv://${URL}`);
  });

  it('iOS 那几款把地址放在回调参数里，要编码', () => {
    expect(linkOf('vlc-ios')).toBe(`vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(URL)}`);
    expect(linkOf('iina')).toBe(`iina://weblink?url=${encodeURIComponent(URL)}`);
    expect(linkOf('infuse')).toBe(`infuse://x-callback-url/play?url=${encodeURIComponent(URL)}`);
    expect(linkOf('nplayer')).toBe(`nplayer-${URL}`);
  });

  it('Android 用 intent，指定包名的带着播放器走', () => {
    expect(linkOf('mxplayer')).toBe(
      'intent://peach.example/external-stream/7?ticket=abc#Intent;scheme=https;type=video/mp4;'
      + 'package=com.mxtech.videoplayer.ad;end');
    expect(linkOf('android-default')).toBe(
      'intent://peach.example/external-stream/7?ticket=abc#Intent;scheme=https;type=video/mp4;end');
  });
});

describe('按设备挑播放器', () => {
  it('认得出四类设备', () => {
    expect(appPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('ios');
    expect(appPlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('ios');
    expect(appPlatform('Mozilla/5.0 (Linux; Android 15; Pixel 9)')).toBe('android');
    expect(appPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)')).toBe('mac');
    expect(appPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('windows');
  });

  it('只给这台设备装得上的那些，桌面没有 intent', () => {
    expect(appPlayers('Mozilla/5.0 (Windows NT 10.0; Win64; x64)').map(player => player.id))
      .toEqual(['vlc', 'potplayer', 'mpv']);
    expect(appPlayers('Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)').map(player => player.id))
      .toEqual(['vlc', 'iina', 'mpv']);
    expect(appPlayers('Mozilla/5.0 (Linux; Android 15; Pixel 9)').map(player => player.id))
      .toEqual(['vlc', 'nplayer', 'mxplayer', 'android-default']);
    expect(appPlayers('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)').map(player => player.id))
      .toEqual(['vlc', 'vlc-ios', 'infuse', 'nplayer']);
  });
});
