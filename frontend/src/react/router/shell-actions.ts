/* Application 交给路由树的能力，经 Context 下发给路由树画的那几页。
 *
 * 这里只放两类东西：换到还归壳的那一屏（目录、资料页、详情、垃圾文件），和只有壳才有的
 * 状态或回执（Toast、偏好存储、一次性上下文）。纯查表的助手（`tagLabel`、`javTitleHtml`）由页面
 * 从 `@peach/legacy/*` 直接 import；每次打开才算得出的值（只读状态、地址上的分类与页签、引导标记）
 * 跟着那一次打开走，不在这里。 */

import type { OverlayTarget } from '@peach/history';
import type { ConfigurationPath } from '@peach/history';

import type { LibraryProcessingProps } from '../bundle';
import type { CatalogFilterProps } from '../catalog-filter/catalog-filter';
import type { CatalogGridProps, MediaCardActions, MediaCardHelpers } from '../catalog-grid/types';
import type { EntityPageProps } from '../entity-page/entity-page';
import type { IndexKind, IndexPerson, IndexRoute, PeopleLayout, PersonAvatar } from '../index/index-data';
import type { JunkQueueProps } from '../junk-queue/junk-queue';
import type { SearchProps } from '../search/search';

export interface ShellActions {
  openSettings?(section: string): Promise<unknown>;
  closeSettings?(): void;
  /** 打开作品详情（舞台）。 */
  openItem(id: number): void;
  /** 打开实体资料页。`kind` 是 `creator`／`performer` 等。 */
  openEntity(kind: string, name: string): void;
  /** 回目录并按这个标签筛选。 */
  openTag(key: string): void;
  /** 口味页点一条名次：标签回目录筛选，人名进资料页。 */
  openTasteSignal(kind: string, name: string): void;
  /** 换到一个路径：push 一条不认领的地址，像后退前进一样领一个页面打开序号，由页面组按匹配打开那一页。 */
  navigate(path: string): void;
  /** 按管理区身份进一屏（路由表里 `section` 等于它的第一条；认不出的落到垃圾文件）。 */
  openManage(section: string): void;
  /** 管理区身份对应的路径；路由表里没有这个身份时是空串。 */
  managePath(section: string): string;
  /** 过去时回执（`actionReceipt`）；给了 `undo` 就带一颗撤销键。 */
  receipt(message: string, options?: { undo?: () => Promise<void> }): void;
  /** 全站 Toast 原样（`toast`）：`sound` 选提示音。 */
  toast(message: string | { text: string }, options?: { sound?: string }): void;
  /** 失败回执（`actionFailure`）：`action` 是没做成的那件事。 */
  failure(action: string, error: unknown): void;
  /** 在资源管理器里显示这个文件，失败回一句原因。 */
  revealSource(id: number): Promise<string>;
  /** 复核页把分类写回地址栏，不重开。 */
  routeReview(params: { category: string; queue?: string }): void;
  /** 来源徽标（含计费标记）的 HTML。 */
  srcBadge(location: string, cost: string): string;
  /** 索引页把过滤词、范围、视图与类型写回地址栏，不重开。`replace` 用在打字过滤那种一路改写的场合。 */
  routeIndex(params: IndexRoute, options?: { replace?: boolean }): void;
  /** 索引页的版式偏好改了，存储归壳（资料页的名册读的也是它）。 */
  savePeopleLayout(patch: { layout: PeopleLayout }): void;
  /** 退出顶栏的选择模式：键归壳。 */
  exitSelectMode(): void;
  /** 本地名册一格的头像（圆框里那段 HTML 与人脸取景），回落链在壳里只有一份。 */
  personAvatar(item: IndexPerson, entityKind: string, big: boolean): PersonAvatar;
  /** 回目录，按这一枚或这几枚本地标签筛选。 */
  showIndexTags(tags: string[], match: 'any' | 'all'): void;
  /** 打开一份播放列表的播放队列（舞台），从 `resumeAssetId` 那一个接着播。 */
  openPlaylist(id: number, resumeAssetId: number): void;
  /** 此刻能不能悬停翻页：壳的多选、遮挡、减少动效与滚动中都回 false。 */
  canFlip(): boolean;
  /** 页面组换了一页：路由树里的页面元素挂上、开始取数之前报一次。壳收起上一页留下的面（悬停预览、在途读请求、
   *  别的容器里那一页），再按种类铺开：管理区与播放列表页铺 `#stats`，索引页、
   *  资料页与目录铺首页那一侧。 */
  surfaceChanged(kind: SurfaceKind, path: string): void;
  /** 清空顶栏搜索框（带散开的残影）。 */
  clearSearch(): void;
  /** 打开沉浸模式，从 `id` 那一条开始；不给就从头。地址由调用方负责。 */
  openImmerse(id?: number): void;
  /** 打开覆盖地址上的那一条（作品详情或队列里的一条），地址已经在那里，不再写。 */
  openOverlay(target: OverlayTarget): void;
  /** 取走一次队列打开意图：等待队列定下实际条目，首屏确定后才写详情地址。 */
  openQueueRequest?(): void;
  /** 详情舞台开着就收起（正在放的视频照旧进小窗），不写地址。 */
  closeStage(): void;
  /** 目录网格卡片的助手与动作：壳里各一份、身份不变（卡片按引用比较），资料页作品区与目录共用。 */
  readonly grid: { helpers: MediaCardHelpers; actions: MediaCardActions };

  // ── 索引页与资料页的元素用（`pages/index-entity.tsx`）：取的都是只有壳才有的状态 ──
  /** 元素打开的那一页首屏画上之后报一次：索引页让壳同步侧栏与顶栏、排吸顶；资料页让壳按这一页的语境重画顶部
   *  三层。 */
  surfaceShown?(kind: 'index' | 'entity', path: string): void;
  /** 资料页那几样仍在壳里的东西。 */
  readonly entity?: EntityPageShell;

  // ── 目录用（`pages/catalog.tsx`）：搜索框、顶部三层与取数都还在壳里 ──
  /** 首页、三个筛选态、回收站与垃圾文件打开与重取时回到壳的那几步。 */
  readonly catalog?: CatalogShell;
}

/** 目录元素回到壳的那几步。筛选由元素按地址写进 `@peach/shell` 的 `state`，之后的事归壳。 */
export interface CatalogShell {
  /** 地址没写 `loc` 时的来源：缺省那几个里摘掉此刻脱盘的（壳在启动与重新检测时记下的那一份）。 */
  defaultLoc(): string;
  /** 按刚写好的 `state` 打开这一页：从别处回到首页（`entering`）先作废顶部三层的缓存；回收站清空搜索框并铺开首页
   *  那一侧，其余页把搜索框对齐 `state.q`；再同步侧栏与顶栏、重画顶部三层、取目录。`retitle`：地址刚由元素改写，
   *  标题与教程状态跟着重读。 */
  open(path: string, options?: { entering?: boolean; retitle?: boolean }): void | Promise<void>;
  /** 筛选与地址已经由壳写好：按它们重取目录。 */
  load(): void | Promise<void>;
  /** 没有背景的作品详情与队列地址（深链、刷新）下面补画目录网格：网格没被占着、又是启动那一条或还铺着目录骨架时，
   *  按当前地址取一次（不是首页口径，不写筛选）。 */
  fill(): void;
  /** 离开目录：收起 `#grid` 那一页。 */
  release(): void;
}

/** 资料页元素打开时回到壳的那几步。骨架里可有可无的几块按形状名单画，名单与目录卡片的比例都在壳里；
 *  筛选按地址解出要用壳的排序偏好；就地推要动壳的顶部三层与侧栏。 */
export interface EntityPageShell {
  missing(kind: string): void;
  /** 铺进页骨架：形状名单还在路上时先等它一下，`current` 回 false 就不铺了；铺完重取一遍名单，回来时补齐骨架
   *  里那几块。 */
  loading(kind: string, name: string, current: () => boolean): Promise<void>;
  /** 这一次打开交给页面的 props：筛选与视图按地址上的查询串解出（从别处点进来的那一次一律从头），展示设置、
   *  助手与写操作都是壳的那一份。卡片与宿主由元素补上。 */
  props(kind: string, name: string, search: string): Omit<EntityPageProps, 'card' | 'hosts'>;
  /** 后退前进落在画着的同一位的另一份地址上：把地址上的筛选与视图推给画着的那一页，顶部三层与侧栏跟着就地改。
   *  这一页没画着时回 false，由元素整页重开。 */
  refresh(kind: string, name: string, search: string): boolean;
}

/** 页面组里一页的种类，壳按它决定铺哪一侧（`surfaceChanged`）。 */
export type SurfaceKind = 'management' | 'index' | 'entity' | 'catalog' | 'playlists';

/** 管理区那几页每次打开时交给页面的值，由页面元素从地址、偏好与壳的状态算（`pages/managed.tsx`），按页面分。
 *  管理区那几页画进 `#stats`。 */
export interface ManagedOpenProps extends Record<ConfigurationPath, { section?: string }>,
  Record<import('../../cleanup-tools').CleanupToolPath, Record<string, never>> {
  '/jav': { tab: string; readOnly: boolean };
  '/stats': Record<string, never>;
  '/review': { category: string; queue?: string; readOnly: boolean; readOnlyMessage: string; writerUrl: string };
  '/data-cleanup': Record<string, never>;
  '/duplicates': Record<string, never>;
  '/quality-goals': Record<string, never>;
  '/sources': Record<string, never>;
  '/tasks': Record<string, never>;
}

export type ManagedPath = keyof ManagedOpenProps;

/** 播放列表页同样画进 `#stats`，但不是管理区：由路由树的元素按匹配打开（`pages/playlists.tsx`），所以不进
 *  `ManagedPath`。每次打开交进来的值同样按页面分，之后的开关经 `updateManagedRoute` 推进来。 */
export interface BrowseOpenProps {
  '/playlists': { revision: number };
}

export type BrowseRoutePath = keyof BrowseOpenProps;

/** 目录网格与垃圾队列画进 `#grid`，同样不算管理区：目录元素（`pages/catalog.tsx`）按地址把筛选写进壳的
 *  `state`，进首页还要重掷种子，回收站把筛选钉成 `trash`；作废顶部三层的缓存、摆搜索框与取数经
 *  `ShellActions.catalog` 回到壳。表按页面分键，不按
 *  地址：目录各路径与回收站画的都是 `/` 这一页，网格在 `/trash` 打开之后去 `/` 是就地推；`/junk-files`
 *  是垃圾队列那一页，`?state=ads` 落在 `/` 上时画的也是它。打开时交进来的是壳那一整份 props（筛选或
 *  分类、版式、选择态与卡片的助手和动作），之后的换筛选、换版式、选择模式与刷新代次经
 *  `updateManagedRoute` 推进来。卡片的助手与动作是壳里各一份、身份不变的对象（卡片按引用比较），
 *  目录网格那一份资料页的作品区与详情的接着看也在用，所以跟着打开走，不进 `ShellActions`。 */
export interface CatalogOpenProps {
  '/': CatalogGridProps;
  '/junk-files': JunkQueueProps;
}

export type CatalogPagePath = keyof CatalogOpenProps;

/** 索引页每次打开交进来的值：地址栏上的那几项（壳从地址读出）、这台浏览器的版式偏好与顶栏选择键的
 *  现值。选择键之后的开关经 `updateManagedRoute` 推进来。 */
export interface IndexOpenProps extends IndexRoute {
  layout: PeopleLayout;
  selectMode: boolean;
}

/** 索引五页画进 `#index`，一种名册一条路径。 */
export type IndexRoutePath = `/${IndexKind}`;
export type IndexOpenPropsTable = { [Path in IndexRoutePath]: IndexOpenProps };

/** 资料页画进 `#index`，每种实体一条模式（名字里可能带斜杠，吃掉剩下全部段）。种类与名字跟着打开走，
 *  名字是壳从地址解码出来的那一份。 */
export type EntityRoutePath = '/performers/*' | '/studios/*' | '/creators/*' | '/series/*' | '/agencies/*' | '/tags/*';

/** 页面里的页面内组件，按名字登记、各画进壳的一个容器：首页筛选条（`#catalogFilter`）、
 *  顶栏搜索下拉（`#searchMenu`）、任务面。props 由壳算好、整份交进来，
 *  之后经 `updateManagedRoute` 推补丁。 */
export interface SurfaceOpenProps {
  'catalog-filter': CatalogFilterProps;
  'library-processing': LibraryProcessingProps;
  search: SearchProps;
}

export type SurfaceName = keyof SurfaceOpenProps;

/** 常驻组件，按名字登记、宿主就是那个常驻节点：底部批量条（`[data-batch-dock]`）、侧栏配色卡（`#boardGlowMenu`）、
 *  管理区页头（`[data-manage-header]`）、沉浸模式（body 末尾的 `[data-immerse-host]`）、设置面板
 *  （`[data-settings-host]`，第一次打开时放进 body 末尾）、侧栏（`#drawerScroll`）与舞台（body 末尾的
 *  `[data-stage-host]`，第一次打开详情时放进去）。打开时不带 props（`openResidentSurface`），内容由壳经各自的
 *  命令式句柄推进组件自己的 store。 */
export interface ResidentOpenProps {
  'batch-dock': Record<string, never>;
  'glow-picker': Record<string, never>;
  'manage-header': Record<string, never>;
  immerse: Record<string, never>;
  'settings-panel': Record<string, never>;
  sidebar: Record<string, never>;
  stage: Record<string, never>;
}

export type ResidentName = keyof ResidentOpenProps;
