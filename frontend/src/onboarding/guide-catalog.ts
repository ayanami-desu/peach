import { PREFERENCE_SECTIONS, CONFIGURATION_SECTIONS } from '../history/settings-route';
import type { RegisteredRoutePath } from '../history/route-meta';
import { javPath } from '../react/jav/jav-navigation';

/** 沿用应用的路由类型，页面移除或改名会在类型检查中指出教程的旧链接。 */
type GuidePath = RegisteredRoutePath;
export type GuideRoute = GuidePath | `${GuidePath}?${string}` | `${GuidePath}#${string}`;
export interface GuideStep { id: string; title: string; body: string; route?: GuideRoute | undefined; target?: string | undefined; surface?: 'detail' | 'player'; scope?: string | undefined; details?: readonly [string, string][] | undefined }
export interface GuideChapter { id: string; title: string; summary: string; kind: 'interface' | 'settings'; steps: GuideStep[] }
const step = (id: string, title: string, body: string, route?: GuideRoute, target?: string, scope?: string): GuideStep => ({ id, title, body, route, target, scope });
const page = (id: string, title: string, body: string, route: GuideRoute, target?: string) => step(id, title, body, route, target);

export const INTERFACE_CHAPTERS: GuideChapter[] = [
  { id: 'basics', kind: 'interface', title: '认识界面', summary: '4 步认识搜索、导航、作品详情和设置。', steps: [
    page('search', '搜索馆藏', '输入作品名、番号、艺人、厂牌或标签。搜索结果来自已经入库的内容。', '/', '#q, #searchBtn'),
    page('navigation', '切换浏览入口', '在侧栏按人物、厂牌和标签浏览。手机上用导航按钮展开侧栏；入口与顺序可以在设置里调整。', '/', '#filterBtn, [data-sidebar-nav]'),
    page('cards', '打开作品详情', '选择作品查看资料、版本和播放入口。还没有内容时，先在 Peach 配置里接上网盘并选好扫描起点。', '/', '[data-media-grid] > [data-id], [data-catalog-row], [data-media-empty]'),
    page('preferences', '调整自己的界面', '侧栏底部的设置包含显示与播放偏好；手机上先展开侧栏。网盘、访问和系统诊断放在其中的 Peach 配置入口。', '/', '#settingsBtn, #filterBtn'),
  ] },
  { id: 'find-play', kind: 'interface', title: '找到并播放', summary: '搜索、筛选、详情、字幕和播放器。', steps: [
    page('library', '选择媒体库', '导航顶部可以切换全部媒体库或某个媒体库；手机上先展开侧栏。媒体库按网盘与扫描起点的组合分组。', '/', '#brandHome, #filterBtn'),
    page('search', '按关键词找内容', '输入作品、番号或人物名称，结合筛选与排序定位内容。搜索记录数量可在搜索与推荐中设置。', '/', '#q, #searchBtn'),
    page('filter', '筛选与清除', '多个筛选条件会共同缩小结果。找不到内容时先检查媒体库和筛选条件。', '/', '[data-catalog-frame]'),
    { ...step('detail', '作品详情', '这里显示当前作品的标题和源文件信息。评分、人物和标签在下方；有分卷或版本的作品可从馆藏卡片进入相应队列。', '/', '[data-item-title]'), surface: 'detail' },
    { ...step('player', '播放器控件', '底部控制条提供播放、进度、音量和全屏。右侧齿轮打开播放速度、字幕和画面旋转等选项。', '/', '#stage .vjs-control-bar'), surface: 'player' },
    { ...step('external', '外部播放器', '在这里选择 M3U 播放列表或网络播放地址，再点打开。另一台设备需要能访问当前 Peach 地址。', '/', '#stage [data-local-playback-row]'), surface: 'detail' },
  ] },
  { id: 'save', kind: 'interface', title: '保存喜欢的内容', summary: '评分、标记、播放列表与当前播放队列。', steps: [
    { ...page('marks', '评分', '点击星星给作品评分；下方的喜欢、稍后看和加入播放列表用于保存感兴趣的内容。', '/', '#stage [data-item-rating]'), surface: 'detail' },
    { ...page('mark-actions', '标记与加入列表', '标记用于把作品放进已标记或稍后看；加入播放列表可把作品整理到自己的列表。', '/', '#stage [data-item-feedback]'), surface: 'detail' },
    page('lists', '建立播放列表', '在这里输入名称，创建自己的播放列表。之后从作品详情的加入播放列表按钮添加内容。', '/playlists', '[data-playlist-create]'),
    page('queue', '从列表开始播放', '选择一张播放列表卡片进入队列，查看和调整播放顺序。没有列表时先创建，再加入作品。', '/playlists', '[data-playlist-card]'),
  ] },
  { id: 'entities', kind: 'interface', title: '按人物与主题浏览', summary: '从人物、厂牌和标签继续发现相关馆藏。', steps: [
    page('people', '艺人与创作者', '选择人物卡片进入资料页，查看相关作品、照片与已连接的来源。上方可以切换艺人与卖家。', '/performers', '[data-index-body] [data-index-cell], [data-index-body] [data-empty-state]'),
    page('studios', '厂牌', '选择厂牌卡片集中查看作品。资料页中的作品仍会受到当前媒体库范围影响。', '/studios', '[data-index-body] [data-index-cell], [data-index-body] [data-empty-state]'),
    page('tags', '标签与主题', '选择标签继续浏览相关馆藏；标签来自已入库作品，可在标签管理里整理。', '/tags', '[data-index-body] [data-alpha-tag], [data-index-body] [data-tag-chip], [data-index-body] [data-empty-state]'),
    page('manage-tags', '管理标签', '铅笔按钮打开标签管理，用于整理标签名称和关系；再次点击返回浏览。', '/tags', '[data-tag-mode]'),
  ] },
  { id: 'jav', kind: 'interface', title: 'JAV 馆藏', summary: '馆藏与馆藏探索两个分区。', steps: [
    page('library', 'JAV 馆藏', '按番号、出演者和厂牌查找已入库的作品，可以选择官方封面或预览图。', javPath('library') as GuideRoute, '[data-catalog-frame]'),
    page('explore', '馆藏探索', '探索分区从馆藏里挑出值得看的作品，可按标签与排序收窄；筛选推荐框在页头右侧。', javPath('explore') as GuideRoute, '[data-index-search] input, [data-filter-glass]'),
    page('quality', '高清版', '待升级卡片列出当前版本信息和判定原因；没有目标时这里显示空状态。', '/quality-goals', '[data-goal-id], #main [data-empty-state]'),
  ] },
  { id: 'viewing', kind: 'interface', title: '专注观看', summary: '播放墙、沉浸模式与详情小窗。', steps: [
    page('wall', '播放墙', '播放墙提供多画面观看入口。结束导览后点击进入，再选择要播放的内容。', '/', '#wallBtn'),
    page('immerse', '沉浸模式', '沉浸模式适合连续观看。点击入口会进入观看流程，请在准备好播放时使用。', '/', '#immerseBtn'),
    page('mini', '离开详情后继续看', '开启小窗播放后，离开详情可以继续观看。自动播放、小窗和快进步长都在浏览与播放设置中。', '/settings/browsing', '#miniplayerSetting'),
  ] },
  { id: 'maintenance', kind: 'interface', title: '整理与维护', summary: '同步、补资料、复核、文件整理与回收站。', steps: [
    page('scan', '同步与补资料', '在媒体库处理区域选择要处理的媒体库与范围。数据来自网盘同步，导览不会启动任务。', '/data-cleanup', '#libraryProcessing'),
    page('review', '人工复核', '先按分类找到待复核资料，再查看项目的来源和证据后作决定。', '/review', '[aria-labelledby="reviewcategories"]'),
    page('organize', '文件整理', '文件整理先查看预览，确认命名与目标目录再执行。执行时按计划在网盘里移动文件。', '/data-cleanup', '[data-cleanup-organize]'),
    page('trash', '回收站', '查看已移入回收站的作品，按需要恢复或处理。永久删除前认真核对确认框中的范围。', '/trash', '[data-media-grid] > [data-id], [data-catalog-row], [data-media-empty]'),
    page('tasks', '任务与失败原因', '任务记录显示处理状态；展开记录查看详情与失败原因。还没有任务时，这里会说明哪些操作会留下记录。', '/tasks', '[data-run-id], #main [data-empty-state]'),
  ] },
  { id: 'insights', kind: 'interface', title: '了解自己的馆藏', summary: '按馆藏、存储与观看情况统计。', steps: [
    page('stats', '馆藏统计', '选择统计视图查看馆藏、存储和观看情况，各视图中的入口可继续查看相关作品。', '/stats', '[aria-label="统计视图"]'),
  ] },
];

const local = '当前浏览器 · 修改后自动保存';
const shared = '跟随馆藏 · 修改后自动保存';
const saved = '运行 Peach 的电脑 · 确认后保存配置';
type Field = [string, string, string, string?, string?];
const fields = (route: keyof typeof PREFERENCE_SECTIONS | keyof typeof CONFIGURATION_SECTIONS, entries: Field[], scope = local): GuideStep[] => entries.map(([id, title, body, target, override]) => step(id, title, body, `/settings/${route}`, target || `[data-guide-target="${id}"]`, override || scope));
export const SETTING_CHAPTERS: GuideChapter[] = [
  { id: 'appearance', kind: 'settings', title: PREFERENCE_SECTIONS.appearance, summary: '主题、光晕与导航入口。', steps: fields('appearance', [
    ['theme', '主题', '选择浅色、深色或跟随系统；适合不同光线下阅读。', '#themeSetting'],
    ['contrast', '增加对比度', '需要更清楚区分文字与背景时开启。', '#glassContrastSetting'],
    ['sounds', '界面音效', '控制界面操作反馈音，按自己的使用环境选择。', '#uiSoundsSetting'],
    ['glow', '侧栏光晕', '控制侧栏背景光晕。开启后，下方显示配色预设和参数；可调整颜色、强度、颗粒、漂移速度、柔化和大小，或恢复默认。玻璃原色只显示适用参数。', '#homeGlowSetting'],
    ['sidebar', '导航入口与顺序', '把常用入口放到侧栏，拖动调整顺序。', '[data-sidebar-setting]', shared],
  ]) },
  { id: 'browsing', kind: 'settings', title: PREFERENCE_SECTIONS.browsing, summary: '列表呈现、悬停预览与播放行为。', steps: fields('browsing', [
    ['batch', '每批作品', '决定列表一次加载多少项。列表较慢时可调小。', '#batchSizeSetting'],
    ['sort', '默认排序与方向', '决定进入列表时先看什么；随机排序不区分升降序。', '[data-setting-sort-controls]'],
    ['size', '视频卡片大小', '大图便于看封面，密集显示便于一次浏览更多作品。', '#javSizeSetting'],
    ['versions', '合并分卷与版本', '将同一作品的分卷和版本集中显示；播放时在详情选择。', '#groupCollapseSetting'],
    ['hover', '悬停预览延迟', '鼠标停留多久后开始预览，单位为秒。容易误触时增加延迟。', '#hoverDelaySetting'],
    ['autoplay', '打开详情自动播放', '决定打开作品详情时是否直接播放。需要安静浏览时关闭。', '#detailAutoplaySetting'],
    ['miniplayer', '离开详情后小窗播放', '离开详情时用小窗继续观看；需要专注浏览时关闭。', '#miniplayerSetting'],
    ['seek', '快进 / 快退', '设置每次跳转的秒数，按自己的观看习惯调整。', '#seekSecondsSetting'],
  ]) },
  { id: 'jav-settings', kind: 'settings', title: PREFERENCE_SECTIONS.jav, summary: '封面与名称语言。', steps: fields('jav', [
    ['names', '女优名称', '选择中文或日文名称。', '#performerNameLanguageSetting', shared],
    ['image', '默认图片', '选择官方封面或预览图作为卡片的默认图像。', '#javImageSetting'],
  ]) },
  { id: 'search-settings', kind: 'settings', title: PREFERENCE_SECTIONS.search, summary: '搜索记录与相关推荐数量。', steps: fields('search', [
    ['history', '搜索记录', '设置保留的搜索记录上限，0 表示不记录。', '#searchHistoryLimitSetting', shared],
    ['related', '相关推荐数量', '决定详情中显示多少项相关推荐。', '#relatedLimitSetting'],
  ]) },
  { id: 'content', kind: 'settings', title: PREFERENCE_SECTIONS.content, summary: 'SFW 模式与画面显示。', steps: fields('content', [
    ['sfw', 'SFW 模式', '隐藏敏感画面并停止悬停预览，适合需要遮挡画面的环境。访问控制请另设访问密码。', '#censorSetting'],
  ]) },
  { id: 'drives', kind: 'settings', title: CONFIGURATION_SECTIONS.drives, summary: '接入网盘、选择扫描起点与刷新。', steps: fields('drives', [
    ['account', '接入网盘', '选一个网盘点「开始授权」，在网盘自己的页面同意后回到这一页；账号与上次同步时间显示在上方。', '[data-guide-target="drives"]'],
    ['roots', '选择扫描起点', '点「选择扫描起点」逐层打开网盘目录，把要收录的那一层设为起点。起点以下的子目录都会同步。', '[data-guide-target="account"]'],
    ['refresh', '同步与刷新', '每 15 分钟取一次变化，每天一次全量；刚传完文件可以点「立即刷新」先同步这个网盘。', '[data-guide-target="account"]'],
    ['authorize-config', '接上网盘前要填什么', '两条路：设置文件的 [drive.accounts.<网盘>] 填 client_id 与 client_secret，再用「手动填认证信息」贴 refresh token，不用公网地址；或者 [drive] 的 public_url 填这台 Peach 的 https 地址，网盘后台登记 public_url 加 /oauth/<网盘>/callback，然后点「开始授权」。', '[data-guide-target="drives"]'],
  ], saved) },
  { id: 'access', kind: 'settings', title: CONFIGURATION_SECTIONS.access, summary: '访问密码与登录方式。', steps: fields('access', [
    ['password', '访问密码', '设置或修改进入 Peach 的密码；关闭后，能连接到 Peach 的设备可直接进入。', '[data-guide-target="access"]'],
  ], saved) },
  { id: 'token', kind: 'settings', title: CONFIGURATION_SECTIONS.token, summary: '给脚本与外部工具用的访问口令。', steps: fields('token', [
    ['api', 'API 令牌', '外部工具用这个令牌访问接口；更新后旧令牌立即失效。', '[data-guide-target="token"]'],
  ], saved) },
  { id: 'devices', kind: 'settings', title: CONFIGURATION_SECTIONS.devices, summary: '已登录设备与撤销。', steps: fields('devices', [
    ['sessions', '已登录设备', '列出登录过 Peach 的设备，可以逐个撤销；撤销后那台设备需要重新登录。', '[data-guide-target="devices"]'],
  ], saved) },
  { id: 'speed', kind: 'settings', title: CONFIGURATION_SECTIONS.speed, summary: '新任务的默认处理速度。', steps: fields('speed', [
    ['task-speed', '默认处理速度', '新任务使用这个档位；运行中的任务在活动页单独调整。', '[data-guide-target="speed"]'],
  ], shared) },
  { id: 'diagnostics', kind: 'settings', title: CONFIGURATION_SECTIONS.diagnostics, summary: '遇到问题时查看检查项与诊断报告。', steps: fields('diagnostics', [
    ['attention', '需要关注的检查项', '从需要关注的项目进入原因与恢复入口；没有异常时查看库健康。', '[data-guide-target="attention"], [data-guide-target="health"]'],
    ['report', '重新检查与诊断报告', '处理原因后可以重新检查。需要提供排查资料时，由你点击下载诊断报告。', '[data-guide-target="diagnostics"]'],
  ], '只读检查 · 重新检查与下载由你主动执行') },
];

/** 复杂设置的逐项解释留在可展开目录中，短导览只讲关键选择。 */
const FIELD_DETAILS: Record<string, readonly [string, string][]> = {
  glow: [
    ['配色预设', '一次应用一组配色和参数，适合先挑选整体外观。'],
    ['强度', '控制光晕的明亮程度；太抢眼时降低。'],
    ['颗粒', '控制光晕纹理中的颗粒感；需要平滑背景时降低。'],
    ['漂移速度', '控制背景光晕移动的速度。'],
    ['柔化', '控制光晕边缘的柔和程度。'],
    ['大小', '控制光晕覆盖的面积。'],
    ['三个自定义颜色', '分别设置三个光晕的颜色，组合成自己的配色。'],
    ['恢复默认', '将光晕配色和参数恢复为默认设置。'],
  ],
  account: [
    ['账号', '显示已授权网盘的邮箱或名称；未授权时显示未授权。'],
    ['扫描起点', '网点里被收录的那几层目录；没设过就是账号根目录。'],
    ['上次同步', '最近一次从这里读到变化的时刻。'],
    ['开始授权', '打开网盘自己的授权页面；回调地址没配置时按钮不可用。'],
    ['断开', '清掉这个网盘的授权与游标，已登记的记录保留。'],
    ['立即刷新', '不等下一轮，先同步这个网盘。'],
  ],
  roots: [
    ['打开', '进入下一层目录；只列目录，不列文件。'],
    ['设为扫描起点', '把当前这一层加入扫描起点；起点以下的子目录都会同步。'],
    ['移除', '把这一层从扫描起点里去掉；已经登记的记录不会被删。'],
  ],
  password: [
    ['当前访问密码', '修改访问密码时用于验证当前密码。'],
    ['新访问密码与确认', '两次填写相同密码，保存后使用新密码登录。'],
    ['关闭访问密码', '保存后，能连接到 Peach 的设备可直接进入。'],
  ],
  api: [
    ['令牌', '一串口令，配在外部工具的请求头里使用。'],
    ['更新', '换一枚新令牌；旧令牌随即失效。'],
  ],
  sessions: [
    ['设备名与来源', '按浏览器与地址列出登录过的设备。'],
    ['撤销', '让这台设备的登录失效；它需要重新输入密码。'],
  ],
  'task-speed': [
    ['档位', '决定新任务的并发与速度；运行中的任务不受影响。'],
  ],
  attention: [
    ['需要关注的检查项', '列出当前有问题的项与恢复入口。'],
    ['库健康', '没有异常时显示库与账本的检查结果。'],
  ],
  report: [
    ['诊断报告', '下载一份包含运行信息与最近错误的压缩包；由你主动点击。'],
  ],
};
for (const chapter of SETTING_CHAPTERS) for (const item of chapter.steps) {
  item.details = FIELD_DETAILS[item.id];
}
export const GUIDE_CHAPTERS = [...INTERFACE_CHAPTERS, ...SETTING_CHAPTERS];

export interface GuideTopic { id: string; kind: GuideChapter['kind']; title: string; summary: string; chapters: string[] }
/** 目录按使用意图组织；小章节可单独阅读，设置步骤对应实际设置分区。 */
export const GUIDE_TOPICS: GuideTopic[] = [
  { id: 'browse', kind: 'interface', title: '查找与发现', summary: '搜索播放、人物标签、JAV 馆藏', chapters: ['find-play', 'entities', 'jav'] },
  { id: 'collect', kind: 'interface', title: '收藏与统计', summary: '标记列表与馆藏统计', chapters: ['save', 'insights'] },
  { id: 'watch', kind: 'interface', title: '专注观看', summary: '播放墙、沉浸观看与详情小窗', chapters: ['viewing'] },
  { id: 'manage', kind: 'interface', title: '整理与维护', summary: '同步补资料、人工复核、文件整理', chapters: ['maintenance'] },
  { id: 'experience', kind: 'settings', title: '外观与播放', summary: '界面样式、播放行为、内容显示', chapters: ['appearance', 'browsing', 'content'] },
  { id: 'discovery', kind: 'settings', title: '搜索与偏好', summary: '搜索记录与封面', chapters: ['search-settings', 'jav-settings'] },
  { id: 'connection', kind: 'settings', title: '接入与访问', summary: '网盘、访问密码、令牌与设备', chapters: ['drives', 'access', 'token', 'devices'] },
  { id: 'system', kind: 'settings', title: '任务与诊断', summary: '处理速度、系统检查与诊断报告', chapters: ['speed', 'diagnostics'] },
];
export function contextualChapter(path: string): GuideChapter {
  if (path === '/') return INTERFACE_CHAPTERS[0]!;
  return SETTING_CHAPTERS.find(chapter => chapter.steps[0]?.route === path)
    || INTERFACE_CHAPTERS.find(chapter => chapter.id !== 'basics' && chapter.steps.some(item => item.route === path))
    || INTERFACE_CHAPTERS[0]!;
}
