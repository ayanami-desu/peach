/* 设置页的两类分区。
 *
 * 个人设置是浮在页面上的那一叠表单，地址 `/settings/<键>`，`PREFERENCE_SECTIONS` 的五节。
 * Peach 配置是运行这一台机器的人改的那几格，一页八个页签；地址 `/settings` 就是这一页（默认开网盘那一格），
 * `/settings/<键>` 指名开哪一格。网盘授权回跳落在 `/settings#drives`，锚点与页签一一对应，别处也照这个写法链过来。
 *
 * 两套键没有重名，`settingsPath(title)` 按标题在两套里一起找。 */
export const PREFERENCE_SECTIONS = {
  appearance: '外观与导航', browsing: '浏览与播放', jav: 'JAV', search: '搜索与推荐', content: '内容显示',
} as const;
export const CONFIGURATION_SECTIONS = {
  drives: '网盘', libraries: '媒体库', data: '存储与备份', access: '访问与安全', token: 'API 令牌',
  devices: '设备会话', speed: '任务速度', diagnostics: '系统诊断',
} as const;
export type ConfigurationSectionKey = keyof typeof CONFIGURATION_SECTIONS;
/** 配置页的地址：`/settings` 与它下面这八格。 */
export type ConfigurationPath = '/settings' | `/settings/${ConfigurationSectionKey}`;

const CONFIGURATION_PATHS: readonly string[] = ['/settings', ...Object.keys(CONFIGURATION_SECTIONS).map(key => `/settings/${key}`)];
/** 这个地址开的是配置页吗。 */
export const isConfigurationPath = (path: string): boolean => CONFIGURATION_PATHS.includes(path);
/** 地址指名的那一格；`/settings` 与认不出的键都是第一格（网盘）。 */
export function configurationSection(path: string): string {
  return CONFIGURATION_SECTIONS[path.split('/')[2] as ConfigurationSectionKey] || CONFIGURATION_SECTIONS.drives;
}

/** 服务端与旧书签里还留着的旧分区地址。能力没了的（下载渠道、应用与维护）转到还在的那一页上。 */
const LEGACY_SETTINGS_TARGETS: Readonly<Record<string, string>> = {
  '/settings/library': '/settings/drives',
  '/settings/downloads': '/settings/drives',
  '/settings/network': '/settings/access',
  '/settings/maintenance': '/settings/diagnostics',
  '/settings/playback': '/settings/browsing',
};
/** 旧的设置地址换成现在的落点；不是旧地址就原样返回。 */
export const settingsTarget = (path: string): string => LEGACY_SETTINGS_TARGETS[path.split('#')[0]!] ?? path;

/** 网盘那一格。「添加媒体」「管理媒体库」这类入口都落这里，不必每处再写一遍中文标题。 */
export const DRIVE_SETTINGS_PATH: ConfigurationPath = '/settings/drives';

export const PREFERENCE_PATHS = Object.keys(PREFERENCE_SECTIONS).map(key => `/settings/${key}`);
export const isPreferencePath = (path: string): boolean => PREFERENCE_PATHS.includes(path);
export function preferenceSection(path: string): string {
  return PREFERENCE_SECTIONS[path.split('/')[2] as keyof typeof PREFERENCE_SECTIONS] || PREFERENCE_SECTIONS.appearance;
}
export function settingsPath(title: string): string {
  const key = Object.entries({ ...PREFERENCE_SECTIONS, ...CONFIGURATION_SECTIONS }).find(([, value]) => value === title)?.[0];
  return `/settings/${key || 'appearance'}`;
}
export interface SettingsBackground {
  pathname: string; search: string; state: unknown; seq: number;
}
export const settingsBackgroundOf = (state: unknown): SettingsBackground | null => {
  const background = (state as { settingsBackground?: SettingsBackground } | null)?.settingsBackground;
  return background && typeof background.pathname === 'string' ? background : null;
};
