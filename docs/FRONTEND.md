# 前端

前端由两块代码组成，打在同一份源码图里：

- 控制层是 `frontend/src/` 顶层的 TypeScript 模块。筛选、排序、选择、导航、请求、骨架屏这些与页面结构无关的行为在 `frontend/src/application/` 里安装，`initializeApplication()` 按固定顺序把各控制器挂上。
- 视图层是 `frontend/src/react/`。BoardUI 组件库在 `react/boardui/`，按页拆开的页面在 `react/pages/`、`react/router/` 与各功能目录里。

入口是 `web/index.html` 里的一个 `<script type="module" src="/dist/peach-app.js">`，挂在 `#appRoot`。首启、登录与错误三张独立页由 `web_entry.page_shell()` 画薄壳，脚本是 `/dist/peach-pages.js`。

运行时不需要 Node。`web/dist/` 下的产物提交进 Git，服务端直接发文件；Node 只用于构建、类型检查、lint、文案检查与前端测试。这样运行时服务、PyInstaller 包和 macOS 检出都不必装 Node（决策见 [ADR-0022](adr/0022-frontend-vite-preact-strangler.md)）。

## 目录

| 路径 | 内容 |
| --- | --- |
| `frontend/src/application/` | 控制器安装顺序与各功能模块：初始化、目录、筛选、媒体、关注、导航、偏好、回执、搜索、教程 |
| `frontend/src/core/` | 不依赖 DOM 的共用函数：接口地址、实体地址、站点名与站点标识、语言判定、随机 id、请求错误文案 |
| `frontend/src/react/` | React 子树：`boardui/` 是逐字复制的 BoardUI 源码，`components/` 是 Peach 组合出来的控件，其余按功能分目录 |
| `frontend/src/history/` | 全站唯一浏览器历史，以及地址规范化、页面标题、路由元信息 |
| `frontend/src/player/` | 播放器装配：Video.js 实例、进度、时间轴、字幕、画中画、旋转、遥测、释放 |
| `frontend/src/query/` | Query 客户端与媒体来源表 |
| `frontend/src/ui-kit/` | 不依赖 React 的界面部件：菜单、模态、折叠、选择条、骨架、声音、滚动条 |
| `frontend/src/i18n/`、`frontend/src/locales/` | 界面文案的翻译入口与中文、英文两份词表 |
| `frontend/src/card-art/`、`appearance/`、`shell/`、`onboarding/`、`dev/` | 封面取景、主题色、壳层共享类型、引导、开发期工具 |
| `frontend/test/` | vitest 用例，`test/react/` 下是 React 组件与页面用例 |
| `frontend/e2e/` | 浏览器用例（`node --test` + playwright-core），`harness.ts` 提供启动、访问与稳定等待 |
| `frontend/scripts/` | 构建辅助：sourcemap 上传、文案检查、文案统计 |
| `web/css/` | 传统页面样式分区，服务端拼成一份 `/app.css` |
| `web/dist/` | 构建产物：主包、页面包与按页拆出的 chunk，全部提交进 Git |
| `web/vendor/` | 固定版本的第三方前端资源（字体、图标、Swiper、Video.js）与许可证原文 |

## 构建

`frontend/package.json` 的脚本：

| 脚本 | 作用 |
| --- | --- |
| `npm --prefix frontend run build` | 依次跑主包与页面包两份配置，产物写进 `web/dist/` |
| `npm --prefix frontend run dev` | `vite build --watch`，按主包配置重建 |
| `npm --prefix frontend run typecheck` | `tsc --noEmit` 两份配置：`frontend/` 与 `frontend/src/react/` 各一份 |
| `npm --prefix frontend run lint` | `oxlint` 检查 `src`、`test`、`e2e` |
| `npm --prefix frontend run check:copy` | 按 `scripts/copy-rules.json` 检查文案 |
| `npm --prefix frontend run test` | `vitest run` |
| `npm --prefix frontend run e2e` | 串行跑 `frontend/e2e/**/*.test.ts` |
| `npm --prefix frontend run build:agentation` | 界面标注工具，产物在 `build/agentation/` |

三份 Vite 配置分工：

- `frontend/vite.config.ts` 打主包 `peach-app.js` 与 `peach-app.css`。入口固定名字，由 `web/index.html` 直接引用；低频页面经 `frontend/src/react/router/route-chunk.ts` 动态导入成 `peach-app.<名字>-<哈希>.js`，长期缓存（决策见 [ADR-0118](adr/0118-main-bundle-route-chunks.md)）。构建目标 `es2022`，CSS 目标是 `chrome111`、`edge111`、`firefox128`、`safari16.4`、`ios16.4`，压缩用 Vite 8 的 oxc 内核。
- `frontend/vite.pages.config.ts` 打页面包 `peach-pages.js` 与 `peach-pages.css`，供首启、登录与错误三张独立页使用。
- `frontend/vite.agentation.config.ts` 打标注工具到 `build/agentation/peach-agentation.js`。

产物发布由 `frontend/scripts/sentry-build.ts` 里的 `peach-publish-browser-assets` 插件负责：先把构建写进私有目录 `build/sentry/browser`（保留 JS 与 sourcemap），再删掉 `web/dist` 里旧的哈希 chunk，最后复制本次的 chunk、入口和 CSS 到 `web/dist`。删旧 chunk 这一步必要——名字带哈希，不删就会一直留在被 Git 跟踪的目录里。公开目录与私有 sourcemap 目录必须分开。

`typecheck` 跑两份 tsconfig：`frontend/tsconfig.json` 覆盖控制层与测试，`exclude` 掉 `src/react`；`frontend/src/react/tsconfig.json` 继承前者，但放宽 `exactOptionalPropertyTypes`、`noUncheckedIndexedAccess`、`verbatimModuleSyntax` 三项，因为 `src/react/boardui/` 与 `src/react/evilcharts/` 是上游源码的逐字副本。

构建产物进入 Git 也意味着「产物是否由当前源码构建」不能靠本机判断：CI 的 web-bundle 作业跑一次 `npm run build`，再要求 `git diff --exit-code web/dist` 为空。

## 服务端怎么发这些文件

`src/peach/routes_pages.py` 提供页面资产，`src/peach/api.py` 提供 `/vendor`。

| 地址 | 来源 | 缓存与鉴权 |
| --- | --- | --- |
| `/app.css` | `web/css/` 下按文件名排序的分区拼成一份 | ETag 取全部分区的 `名字:mtime_ns:字节数` 摘要，改任一分区即失效；命中 `If-None-Match` 回 304；要会话 |
| `/board.css` | `web/board.css` 原样 | 同上，单文件 ETag |
| `/dist/peach-app.js`、`/dist/peach-app.css` | `web/dist/` | 固定名，每次复验，要会话 |
| `/dist/peach-app.<名>-<哈希>.js` | `web/dist/` 的按页 chunk | `immutable` 长期缓存，要会话 |
| `/dist/peach-pages.js`、`/dist/peach-pages.css` | `web/dist/` | 两条字面量路由注册在 `/dist/{name}` 之前，不要会话——登录页要在拿到会话之前出图（决策见 [ADR-0094](adr/0094-entry-pages-bundle-public.md)） |
| `/vendor/*` | `web/vendor/` | `public, max-age=31536000, immutable` |

`/dist/{name}` 只放行 `peach-app.js`、`peach-app.css`、`peach-pages.js`、`peach-pages.css` 四个固定名与 `BUNDLE_CHUNK_NAME` 形态的 chunk，其余一律 404；名字不接受路径分隔符与附加扩展名。

首屏不为每个样式分区发一次请求：`/app.css` 一次交齐，层叠顺序由文件名决定，不写进 `index.html`。分区文件名形如 `NN-名字.css`，服务端用 `CSS_PART_NAME` 校验；分区清单由 `tests/test_web_ui.py` 钉住。

`/vendor` 是自托管的第三方前端依赖，目录形如 `web/vendor/<包名>/<版本>/`。独立页固定引 `/vendor/inter/5.3.0/index.css`。断网时界面、字幕字体与播放器控件照常可用。

第一条 HTML 响应带 `Clear-Site-Data: "cache"` 并种下 `peach_media_policy` cookie，此后不再发；非 HTML 响应默认 `no-store`，另加 `X-Content-Type-Options: nosniff` 与 `Referrer-Policy: same-origin`。

## 样式

三份样式各有归属，`web/index.html` 按这个顺序引：

1. `/dist/peach-app.css`：Tailwind 与 React 子树的类，由 Vite 从 `frontend/src/react/styles.css` 打出来。当前体积 560 888 字节（核验 2026-11-11）。
2. `/app.css`：传统页面的分区样式，作用于控制层渲染出来的结构（顶栏、筛选条、目录网格、资料页、骨架屏等）。
3. `/board.css`：BoardUI 的设计 token 与基础层，最后加载，用同名的 `--color-*` 变量定下最终取值。

改一处界面前先确认它属于哪一层：React 子树里的类名走 Tailwind 与 `react/boardui/` 的 token；控制层往 `web/index.html` 的结构里插节点时写 `web/css/` 的对应分区。分区顺序即层叠顺序，新分区按数字前缀插进相邻位置，并同步 `tests/test_web_ui.py` 的清单。

`frontend/src/react/boardui/` 是 BoardUI 注册表条目的逐字副本：来源、取得时间与条目表记在 `frontend/src/react/boardui/ORIGIN.md`，许可证原文在 `web/vendor/boardui-LICENSE.txt`。副本不做修改，逐文件 sha256 记在 `UPSTREAM.sha256` 并由 `tests/test_frontend_build.py` 比对；Peach 需要的不同组合写进 `react/components/` 等处，差异记进 `ORIGIN.md` 的表。

## 页面怎么挂进 React

`frontend/src/react/router/managed-routes.tsx` 用七张登记表把地址与画法对上：

| 表 | 内容 |
| --- | --- |
| `MANAGED_ROUTES` | 管理区页面，精确路径，画进 `#stats` |
| `BROWSE_ROUTES` | 播放列表与关注页，画进 `#stats` |
| `INDEX_ROUTES` | 索引页，画进 `#index` |
| `ENTITY_ROUTES` | 资料页，按模式登记并在打开时给出种类与名字 |
| `CATALOG_ROUTES` | 目录网格与垃圾队列，画进 `#grid` |
| `SURFACE_ROUTES` | 页面里的页面内组件，按名字登记 |
| `RESIDENT_ROUTES` | 不跟某一页走的常驻组件，按名字登记 |

后四张按名字或模式登记，不是地址、不进 `<Routes>`。另有 `REDIRECT_ROUTES` 承接旧直达地址、`IMMERSE_ROUTES` 承接沉浸模式，两者只挂元素。地址清单见 [路由](ROUTES.md)。

一次打开的流程固定为「取完数才画」：

1. 壳调 `openManagedRoute(name, open, options)`，`frontend/src/react/router/route-chunk.ts` 先 `preload()` 页面模块，页面自己的首屏取数与接口请求并行，取齐后在同一个任务里 `flushSync` 画完。
2. 之后壳调 `updateManagedRoute` 推进新 props（换筛选、换页签、换版式、刷新代次），页面只重取、不重挂。
3. 页面退出时调 `releaseManagedRoute` 交回容器。

不用 `React.lazy`：它第一次渲染总要抛一次 thenable，等于多画一帧空白。打开页面时装载失败，多半是服务端已经换了一版产物、旧入口指着的 chunk 不在了，那就查一次 `/healthz` 再整页重载拿新入口，同一会话 30 秒内只重载一次（`RELOAD_KEY`）。

常驻组件另走一条路：`frontend/src/react/application-residents.ts` 的 `connectApplication(next)` 与 `openApplicationResident(name, container, place)` 按名字装载，`place` 说明这次摆在哪儿；`frontend/src/react/entry.tsx` 导出控制层要用的配置接口（`configureBatchDock`、`configureGlowPicker`、`configureImmerse`、`configureManageHeader`、`configureSettingsPanel`、`configureSidebar`、`configureStage`、`mountToaster`、`showToast`、`prefetchManagedRoute`），类型契约在 `frontend/src/react/bundle.d.ts`。

主界面根是 `frontend/src/react/application.tsx`：`#appRoot` 上 `createRoot`，先 `initializeApplication()` 装上控制层，再接路由树与常驻组件；卸载时 `releaseAllManagedRoutes()`、`releaseHoverPreviews()` 一并收拾。`frontend/src/react/bootstrap.tsx` 是库入口，负责 `installErrorReporting()` 与宿主存在性检查。

## 共享状态怎么写

同一种状态只有一份真相，放在模块顶层，由控制层与 React 子树直接引用——两边读写的是同一个实例。`vite.config.ts`、`vitest.config.ts` 与 tsconfig 的路径别名保证这两条引用路径解析到同一个文件，模块图里不会出现第二份。

| 状态 | 放哪儿 | 写法 |
| --- | --- | --- |
| 界面偏好 | `frontend/src/settings-store.ts`，浏览器里是 `peach.settings.v1` | `createSettingsStore<T>(key, value)` 交回 `{value, version(), subscribe, save, notify}`。值就是壳启动时归一化好的那个对象，壳原地改字段后调 `save()`；快照是版本号，因为对象引用从头到尾不变，拿它当快照 React 永远以为没变 |
| 地址 | `frontend/src/history/index.ts`（`@peach/history`） | 全站唯一历史实例，包 React Router 的 `UNSAFE_createBrowserHistory`（v5Compat 档）。每次变化领一个递增 `seq`；壳写的 `shellNavigate` 当场认领，后退前进与 React 子树写的另领 `openEpoch`，页面按它重开 |
| 服务端数据 | `frontend/src/react/application.tsx` 里的 `queryClient` | 同一个 `queryKey` 只有一份快照与一条轮询，页面与常驻组件共用 |
| 界面语言 | `frontend/src/i18n/index.ts` | 模块求值时算出，整页只有一份实例；换语言靠整页重载，不做运行中切换 |
| 媒体来源表 | `frontend/src/query/media-sources.ts`、`frontend/src/react/media-sources.ts` | 与服务端 `resources/media-sources.json` 对应，启动时随配置下发 |

新增一份状态前先在这张表里找：能并进现有实例的，不再开第二个。

## 模块图与别名

| 别名 | 指向 |
| --- | --- |
| `@peach/legacy/core` | `frontend/src/core/index.ts` |
| `@peach/legacy/ui` | `frontend/src/ui-kit/index.ts` |
| `@peach/legacy/jav-title`、`tags`、`ui-sounds`、`middle-truncate` | 同名的 `frontend/src/` 顶层模块 |
| `@peach/card-art`、`appearance`、`query`、`history`、`shell` | `frontend/src/` 下同名目录的 `index.ts` |
| `@/`、`@/*` | `frontend/src/react/boardui/` |
| `@/registry`、`@/lib/utils` | `frontend/src/react/evilcharts/registry`、`frontend/src/react/charts/cn.ts` |
| `next/link` | `frontend/src/react/components/board-navigation-link.tsx` |

`@peach/legacy/*` 是控制层迁移过程中的源码别名，指向的是现在的实现，不是旧产物；`web/` 下没有任何 `.js` 源文件。

`vite.config.ts` 里 `define: {'process.env.NODE_ENV': '"production"'}` 只对应用构建生效。库模式不替换，所以读 `process.env.NODE_ENV` 的依赖（例如 Query 的开发期告警）在库里拿到的是 `undefined`，不能当作「不是生产环境」以外的分支依据。

## 依赖清单

`frontend/package.json` 的运行依赖，版本精确钉住、不带范围符：

| 依赖 | 用途 |
| --- | --- |
| `react`、`react-dom` 19.3.1 | React 子树与 `#appRoot` 上的根 |
| `react-router` 8.5.1 | 路由树、历史实例与导航 |
| `react-aria` 3.53.1、`react-aria-components` 1.22.1 | 无障碍控件（页签、表格、选择器、开关） |
| `@tanstack/react-query` 5.107.1、`@tanstack/query-core` 5.107.1 | 服务端数据缓存、轮询与失效 |
| `@tanstack/react-table` 9.3.1 | 目录表格的列、排序与虚拟化基准 |
| `@remixicon/react` 4.9.0 | React 子树里的图标组件 |
| `motion` 14.10.1 | 抽屉、选择条、数字滚动等过渡；带 `prefers-reduced-motion` 分支 |
| `sonner` 2.0.8 | 提示条 |
| `skullet` 0.0.3 | 骨架屏的尺寸测量与动画 |
| `driver.js` 1.10.2 | 首启引导的分步高亮 |
| `i18next` 27.0.1 | 界面文案的翻译查找与插值 |
| `diff` 9.0.0 | 文案与配置的差异显示 |
| `recharts` 3.10.1 | 统计页图表 |
| `d3-sankey` 0.12.3 | 流向图布局；BoardUI 的差异表把它记给流向图，当前源码没有引入方 |
| `clsx` 2.1.1、`tailwind-merge` 3.7.0 | 条件类名摊平后交给 BoardUI 的 `cx`；`tailwind-merge` 认得 Peach 的字阶类，不会把 `text-caption-1-regular` 当成颜色类丢掉 |

构建与测试工具（`devDependencies`）：`vite` 8.3.6、`typescript` 7.0.2、`oxlint` 1.92.0、`@shadcn/lint` 0.2.5、`vitest` 5.1.0、`happy-dom` 21.0.4、`playwright-core` 1.65.0、`@sentry/cli` 3.8.2、`@sentry/vite-plugin` 11.11.0（sourcemap 上传）、`@tailwindcss/vite` 4.3.5、`tailwindcss` 4.3.5、`oxc-parser` 0.157.0（文案检查扫源码）、`agentation` 3.1.2（界面标注）、`@types/react` 与 `@types/react-dom` 19.3.0、`@types/d3-sankey`。

`web/vendor/` 的第三方资源由根 `package.json` 的 `devDependencies` 钉版本，`npm run vendor:web` 按版本号写成目录并附许可证与来源说明，`npm run check:vendor` 校验字节一致：`@fontsource-variable/inter` 5.3.0（正文字体，落在 `web/vendor/inter/5.3.0/`）、`swiper` 14.4.0（卡片与画廊的滑动）、`@videojs/cdn` 10.3.0（播放器运行时）。`lucide-static` 1.70.0、`@phosphor-icons/core` 2.1.1、`remixicon` 4.9.1 与 `healthicons` 3.1.0 的图标以 symbol 内联进 `web/index.html` 的雪碧图，`web/vendor/` 里只放它们的许可证与来源说明。同一个脚本还会把 `web/` 各文件里引用的版本号改齐。新增依赖时在这两张表里补一行用途，再跑一次 `npm run vendor:web` 更新产物与锁文件。

## 站点标识与图标

`frontend/src/core/index.ts` 的 `siteMarkUrl({source})` 只接受采集来源键，交回 `/site-mark?source=<键>`。它与 `linkMarkUrl({link_id})` 同一条规矩：递的是服务端已经知道的东西——采集来源键或链接记录 id——不是任意地址，否则等于开一个任意抓取的入口。

| 地址 | 交付 |
| --- | --- |
| `/site-mark?source=` | `resources/site-marks/<来源>.png`；来源不在采集来源表里则 404，表里没有图片的来源由服务端现生成 |
| `/source-icon?provider=` | 关注与订阅来源的方形图标（`fanbox`、`patreon`、`iwara` 一类）：随包有原图就直接发，没有就按表里的地址取一次并缓存；来源不在表里、或图标还没取到时返回 404 加 `resources/site-marks/globe.svg` |
| `/site-icon/<名字>` | 五个随包发送的站点图标（`javten`、`fc2ppvdb`、`avwikidb`、`minnano-av`、`github`） |
| `/link-mark?id=` | 按实体链接记录里存的地址取标识，记录失效则 404 |

`frontend/src/react/components/site-mark.tsx` 按这个顺序选：给了链接 id 就用 `/link-mark`，站点在内置品牌标记表里就用 `/site-icon`，其余用 `siteMarkUrl`。常见社媒（X、Instagram、Threads、TikTok、YouTube、Facebook、Linktree）走 `web/index.html` 里的内联品牌 symbol，连 favicon 都不取。

`resources/site-marks/` 只放随包发送的原图与 `ORIGIN.md`（来源与许可）；现生成的标识落在生成目录，不进 Git。

## 界面标注

`frontend/vite.agentation.config.ts` 把 `frontend/src/dev/agentation.tsx` 打成单文件 `build/agentation/peach-agentation.js`，不做代码分割、不生成 sourcemap。服务端在 `/dev/agentation.js` 提供它，路径取 `settings.agentation_path`，默认就是 `build/agentation/peach-agentation.js`，并且要会话。

放在 `build/` 而不是 `web/`：这份第三方标注工具随本机开发用，不该跟着提交进 Git 的前端产物一起发布。

## 文案与语言

界面文案的源文是 `frontend/src/locales/zh-CN/<命名空间>.json`，英文在 `locales/en/`，两份由同一个 PR 维护。缺译文的键回落到中文；界面语言选「自动」时按浏览器语言、再按系统语言判定，两边都对不上时用英文（决策见 [ADR-0156](adr/0156-interface-translation.md)）。

`scripts/copy-rules.json` 是文案规则的唯一来源，两组规则：`prose` 拦沿革叙述与不清楚的表述，`doc_terms` 要求把抽象说法换成具体机制。`frontend/scripts/copy-check.mjs` 扫前端源码，`scripts/check_copy_final_state.py` 扫 Python、HTML 与文档；确需保留的逐行加 `copy-lint-disable-line` 豁免。`i18n:literals` 与 `i18n:terms` 统计字面量与术语。

## 检查

本机按 [测试与依赖](TESTING.md#环境与锁文件)安装开发环境后，前端这一层的命令：

```text
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run check:copy
npm --prefix frontend run test
npm --prefix frontend run e2e
```

Python 侧有两条衔接：

- `tests/test_frontend_build.py` 守不需要 Node 的部分：产物在不在、页面怎么加载、模块图是否独立、依赖是否钉版本、共享客户端是否唯一。需要 Node 的断言（tsc、lint、vitest）在本机缺 Node 时显式跳过，CI 由 web-bundle 统一执行。
- `tests/test_frontend_preflight.py` 跑 `npm --prefix frontend run typecheck`、`oxlint` 与 `check:copy`；没有 npm 或 `frontend/node_modules` 时按 `tests/support/conditions.py` 的 `missing_prerequisite` 处理。

浏览器用例按决策分类（[ADR-0031](adr/0031-frontend-react-boardui-tailwind.md)）：用户定过的设计决定写在 `frontend/e2e/design-*.test.ts`，读 `getComputedStyle` 断言计算值，不绑定 CSS 写法；行为写 vitest；布局与运行期不变量归 `frontend/e2e/smoke.test.ts`。`frontend/e2e/harness.ts` 提供 `launch`、`visit`、`settle`、`expectBody` 与视口表，`frontend/e2e/design-fixture.ts` 提供设计用例共用的桩数据与入口。
