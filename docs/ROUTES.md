# 接口与路由

一个进程里同时提供单页界面与 JSON 接口，路由分五个模块装配：

| 模块 | 负责 |
| --- | --- |
| `routes_auth` | 访问策略、登录页、三个鉴权依赖与同源检查 |
| `routes_pages` | 单页界面壳、静态资产、全部前端路由落点、首次设置 |
| `routes_configuration` | 本机配置、网盘授权、媒体库分组、容量与备份 |
| `routes_media` | 播放取流、缩图、封面、头像、外链圆标 |
| `routes_api` | JSON 契约出口，含两条 `/api/{route:path}` catch-all |

装配顺序是契约，不是随手排的：`routes_api` 必须最后接入，否则它的 catch-all 会先吃掉 `/api/stream-plan` 这类具名接口。`/healthz` 与 `/vendor` 挂在应用本身。

## 鉴权口径

服务没设访问口令时（`settings.token` 为空）所有请求都算通过，判据就是口令这一层根本没装。设了口令之后分四种访问策略：`open`（浏览不设限，写操作仍要凭据）、`password`（访问密码，带盐与哈希）、`legacy`（没有策略文件，用启动时生成的口令）、`locked`（策略读不出来，谁都进不来）。会话是 cookie `peach_session`，记在数据目录的 `browser-sessions.json` 里，可以在设置页按设备撤销。

| 凭据 | 用法 |
| --- | --- |
| `?t=<口令>` | 页面地址带口令时换一次会话：303 跳回同一路径、去掉 `t`、保留原始编码与重复参数，并设下 cookie |
| `X-Token: <口令>` | 接口与资产的请求头形式，与 `?t=` 等价 |
| cookie `peach_session` | 登录后长期有效；`legacy` 策略另认 cookie `tok` |

三种闸门按响应形态分工：

| 依赖 | 用在哪 | 失败形态 |
| --- | --- | --- |
| `require_page_auth` | 页面壳 | 303 到 `/login?next=<原地址>` |
| `require_asset_auth` | 样式、脚本、图标等静态资产 | 401，正文「需要 ?t=口令」 |
| `require_auth` | 接口与媒体端点 | 401 `{"error":"unauthorized"}` |
| `require_authenticated_client` | 管理接口 | 401；开放浏览不授予管理权限，必须有有效会话或口令 |

`/login` 的 `next` 只认站内路径，`//` 开头的协议相对地址一律回首页。登录表单可以选保持登录的天数（0–365），越界回 400「请选择有效的保持登录时间」；会话没能记到盘上时回 503「登录设备未能记下，请检查数据目录能否写入后重试」。

写操作另加同源检查：非 `GET`/`HEAD`/`OPTIONS` 的请求先比来源，`Sec-Fetch-Site: cross-site` 直接拒绝，其余比较 `Origin` 与自身地址（受信代理可另算一个 `X-Forwarded-Proto` 地址），不一致回 403「请从 Peach 配置页提交」，并留一条 `origin-mismatch` 本机取证（同一形态一分钟一条）。这条检查由各写端点自己调用，两条 `/api/{route:path}` catch-all 不做。

首次设置走另一套判据：已配置时 `/api/setup*` 一律 404，不暴露初始化入口；提交要求连接来源与自身主机名都是回环地址（403「setup is loopback-only」），Docker 部署的提交改用同源检查。

## 页面路由

所有页面返回同一份界面壳，前端按地址渲染。目录与地址：

| 地址 | 用途 |
| --- | --- |
| `/` | 全部馆藏 |
| `/?browse=folders` | 按目录浏览，`folder` 指定目录，`folder_recursive=0` 只看当前层，见 [目录浏览](DIRECTORY_BROWSING.md) |
| `/jav` | JAV 探索；JAV 馆藏是目录页的 `?jav=1` 筛选 |
| `/works/{code}` | 作品详情，`code` 先规范化再判重定向 |
| `/assets/{id}` | 资产详情 |
| `/performers`、`/creators`、`/studios`、`/agencies`、`/series`、`/tags` | 实体名册 |
| `/performers/{name:path}` 等六条同名族 | 按姓名进入实体页 |
| `/playlists` | 播放列表 |
| `/unseen`、`/watch-later`、`/flagged`、`/junk-files`、`/trash` | 状态视图 |
| `/wall`、`/immerse` | 播放墙与沉浸浏览 |
| `/stats`、`/review`、`/quality-goals`、`/duplicates` | 统计、人工复核、高清目标、重复文件 |
| `/data-cleanup`、`/data-cleanup/organize`、`/data-cleanup/orphan-records`、`/data-cleanup/links`、`/data-cleanup/batch-delete` | 数据管理与清理入口 |
| `/tasks`、`/sources` | 任务记录与采集来源 |
| `/settings`、`/settings/{section}` | 设置分区；`section` 只认外观、播放、JAV、搜索、内容、网盘、媒体库、存储与备份、访问、令牌、设备、速度、诊断，其余 404 |
| `/login` | 登录页 |

旧地址与别名都是 307 跳转，查询参数与会话照原样带过去：

| 地址 | 跳到 |
| --- | --- |
| `/item/{id}` | `/assets/{id}` |
| `/mix/{seed}/{id}`、`/parts/{seed}/{id}`、`/editions/{seed}/{id}`、`/playlists/{seed}/{id}` | `/assets/{id}`，并记下取景上下文（`mix`、`parts`、`editions`、`playlist`） |
| `/jav/movie/{code}` | `/works/{规范化后的番号}` |
| `/activity` | `/tasks` |
| `/scraping` | `/sources` |
| `/configuration` | `/settings/drives` |
| `/diagnostics` | `/settings/diagnostics` |
| `/performers/`、`/creators/`、`/studios/`、`/agencies/`、`/series/`、`/tags/` | 去掉尾斜杠的同一地址 |

站内详情链接在当前页面打开覆盖层，关闭后回到来源地址并保留查询参数；修饰键、新窗口与下载链接沿用浏览器行为。番号规范化后为空时回 404。

设置分区可直接打开、刷新并用浏览器前进后退；从当前页面打开时保留背景页面。启用接口文档时 `/docs`、`/openapi.json` 是服务文档入口，未启用时这两条不存在。

## 静态资产

| 地址 | 内容 |
| --- | --- |
| `/app.css`、`/board.css` | 分区拼接的样式，带 `ETag`，`Cache-Control: no-cache` |
| `/dist/peach-app.js`、`/dist/peach-app.css` | 应用主包，固定文件名，带 `ETag`，`Cache-Control: no-cache` |
| `/dist/peach-pages.js`、`/dist/peach-pages.css` | 页面壳包；这两条不要会话，登录页要在拿到会话之前出图 |
| `/dist/{name}` | 按页拆出的分块，名字里带内容哈希，`Cache-Control: private, max-age=31536000, immutable`；其余名字 404 |
| `/vendor/*` | 第三方静态目录，`Cache-Control: public, max-age=31536000, immutable` |
| `/dev/agentation.js` | 界面标注工具的本机构建产物，不存在时 404 |
| `/site-icon/{name}` | 站点图标 |
| `/robots.txt`、`/favicon.svg`、`/favicon.ico` | 抓取与站点图标 |
| `/peach-logo.png`、`/peach-logo-64.png`、`/peach-logo-128.png` | 标识 |

## 播放取流

| 地址 | 说明 |
| --- | --- |
| `GET`/`HEAD /stream?id=` | 播放入口。能交给浏览器的给 302，必须带鉴权的由 Peach 转发客户端 `Range`；透传 200/206、`Content-Range`、`Content-Length`、`ETag`、`Last-Modified`；响应带 `no-store`、`Referrer-Policy: no-referrer` 与媒体安全头；每次请求记一条 `playback-request` 本机事件 |
| `GET /api/stream-plan?id=` | 播放计划：`protocol`、`mime_type`、`duration`、`src`、`reason`。只有 `range` 一种协议；`src` 指回 `/stream`，不下发预授权地址，因为那个地址在一次播放期间会过期 |
| `POST /api/external-playback` | 外部播放器取地址：按请求头 `Origin`（没有就用自身地址）校验来源，签发 `ticket`，返回 `/external-stream/{id}` 与 `/external-playlist/{id}.m3u` 两条地址以及 `expires_in`；来源不合法 400「播放地址无效」，票据无效时 401「播放链接已失效，请在作品详情重新打开」 |
| `GET /external-playlist/{id}.m3u` | 文本清单，正文里的播放地址是这个来源的绝对地址，`application/x-mpegurl`，`no-store`，`Referrer-Policy: no-referrer` |

能不能播由媒体层判断：只看容器后缀，浏览器认可的五种（`.mp4`、`.m4v` 发 `video/mp4`，`.webm` 发 `video/webm`，`.ogv`、`.ogg` 发 `video/ogg`）按各自 MIME 发；其余容器没有可用的 MIME，`/stream` 与 `/api/stream-plan` 都回 404 `{"error":"unavailable"}`。拖动进度条就是客户端再发一个 `Range`，Peach 不改写字节，也不在服务端分片。

## 图像端点

图像端点只接受账本 id 或番号，自己查地址，上游地址一律不外露。

| 地址 | 内容 |
| --- | --- |
| `/thumb?id=` | 账本里已生成的快照缩略图 |
| `/photo?id=`、`/photo-thumb?id=` | 原始图片与图片墙缩略图 |
| `/poster?id=&c=0..8` | 九宫格的一格，从 `asset.snapshot_path` 指向的 3×3 接触印相裁出 |
| `/timeline?id=&s=` | 时间轴印相的一张（10×10 格），见 [视频预览](VIDEO_PREVIEWS.md) |
| `/cover?code=&thumb=` | 官方封套原件；`thumb=1` 长边 1600、`thumb=2` 长边 800 |
| `/cover-image?code=`、`/jav-image?code=&image=cover` | 采集到的封面与 JAV 官方图 |
| `/sample-thumb?code=&n=`、`/sample-image?code=&n=` | 官方样张与其缩略图 |
| `/avatar?id=`、`/avatar-choice?kind=&id=`、`/entity-image?kind=&id=&thumb=` | 资产头像、实体图与派生缩略图 |
| `/work-icon?work=`、`/logo?studio=&variant=` | 作品与厂牌的标识 |
| `/site-mark?source=`、`/link-mark?id=` | 来源标记与链接圆标 |
| `/endcard-frame?id=&name=` | 片尾固定画面 |

带写的几条：`POST /api/cover-crop` 只写封面旁的 `.poster.json`，`box` 是源图像素坐标（右下开区间），`null` 恢复默认裁切，不动图片字节；`POST /api/avatar-frame`、`POST /api/avatar-pick`、`POST /api/avatar-code-cover` 选头像取哪一帧或哪张图；`GET /api/avatar-choices` 列出可选图。

## 网盘设置面

| 地址 | 说明 |
| --- | --- |
| `GET /api/drive` | 设置页看到的网盘状态：`public_url` 与逐个来源的 `location`、`label`、`configured`、`connected`、`email`、`display_name`、`roots[{remote_id,name}]`、`synced_at`、`last_error` |
| `POST /api/drive/{location}/authorize` | 生成授权地址，返回 `{"url": ...}`，浏览器带过去登录网盘 |
| `GET /oauth/{location}/callback` | 网盘跳回来那一步。这里没有会话保证，因此不查登录凭据，边界是授权开始时服务端记下的 `state`（900 秒内有效）；成功 302 回 `/settings#drives`，失败 400 |
| `POST /api/drive/{location}/roots` | 整条替换扫描根；空数组表示从账号根目录开始，非对象数组回 400「roots 要是对象数组」 |
| `GET /api/drive/{location}/folders` | 列远端文件夹，只出目录，`parent_id` 缺省取第一个扫描根 |
| `POST /api/drive/{location}/refresh` | 把这一来源排进下一轮同步（后台每 60 秒一轮），返回该来源当前状态 |
| `POST /api/drive/{location}/mode` | 改这一来源怎么把字节交给浏览器，写进 `config.toml` 的 `[drive.modes]`；只认 `redirect` 与 `proxy`，能直连的来源才给 `redirect` |
| `POST /api/drive/public-url` | 写 `[drive] public_url`：收 `public_url`（https 地址或空串），改完立刻重建驱动，返回写下的值 |
| `POST /api/drive/{location}/credentials` | 不走回调授权：收 `client_id`、`client_secret`、`refresh_token` 与可选的 `root`，先换一次票确认配得上，再落设置与账号文件，返回该来源当前状态 |
| `DELETE /api/drive/{location}` | 忘掉这个网盘：删账号与扫描根，账本里已登记的资产不动 |

失败按网盘侧的错误分档：需要重新授权 401、权限不足 403、文件或目录不存在 404、其余网盘错误 409；不认识的来源回 404「没有这个网盘」。写端点另要求同源检查。

来源只认 Google Drive 与 OneDrive 两种，凭据落在数据目录的 `drive-accounts.json`（权限 0600），令牌提前 60 秒更换。没有填客户端凭据或没有对外地址时，`configured` 为假，授权按钮不可用；这条路上还可以直接填认证信息（`client_id`、`client_secret`、`refresh_token`），不需要对外地址。

## 本机配置与维护

| 地址 | 说明 |
| --- | --- |
| `GET /api/configuration` | 配置快照：可改字段、版本号、存储、访问、事实与口令状态；每一节独立读取，失败的一节写进 `section_errors`，其余照常返回；未完成首次设置回 409「请先完成首次设置」 |
| `POST /api/configuration` | 保存媒体库分组（名称 1–80 个可见字符，图标取自内置列表），写设置文件 |
| `POST /api/configuration/access`、`POST /api/configuration/access/first` | 保存访问策略；`first` 用于已配置但还没有策略的 Docker 部署，非 Docker 404、已有策略 409 |
| `GET /api/configuration/access/sessions`、`POST /api/configuration/access/sessions/revoke` | 列出与撤销登录设备；接受 `id` 或 `scope: "others"`，版本不符 409，撤销本机 400 |
| `POST /api/configuration/access/token/rotate` | 更换访问口令，运行中的服务当场改用新口令。只有口令来自口令文件时才可换：没有口令、或口令由 `--token`／`PEACH_TOKEN` 指定时回 409 并说明该去哪里换。新口令只在这一次回执里给出，`no-store`，同时回访问策略、被登出的设备数与是否需要重新登录 |
| `GET /api/configuration/storage` | 数据目录各类占用；界面落点「设置 → 存储与备份」上半格 |
| `POST /api/configuration/storage/measure` | 启动一次统计，已在跑 409 |
| `POST /api/configuration/storage/policy` | 保存容量保护（`enabled` 总开关默认开启），返回同一状态 |
| `POST /api/configuration/storage/clean` | 按类别清理；不在可清理清单里的分组回 400「这一类不能在这里清理」，任务在跑 409 |
| `GET /api/configuration/ledger-backups`、`POST .../backup`、`POST .../restore` | 账本备份与恢复；界面落点「设置 → 存储与备份」下半格；恢复要求 `confirm: true`，否则 400「恢复会替换当前账本，请先确认」 |
| `GET /api/diagnostics` | 系统检查 |
| `GET`/`POST /api/diagnostics/exports`、`POST .../{identity}/cancel`、`GET .../{identity}/download` | 诊断记录导出 |
| `POST /api/diagnostics/client-error` | 页面侧异常上报，按来源限频 |
| `POST /api/pick-folder` | 在服务器这台机器上弹系统文件夹对话框，返回 `{"path": ...}`；已在弹 409，无法弹 501 |
| `GET /api/setup/questions`、`POST /api/setup`、`POST /api/setup/restore` | 首次设置的问题、提交与从备份恢复 |

容量、备份与访问策略这几条写端点都要求登录凭据与同源检查。

## JSON 契约出口

`GET /api/{route:path}` 与 `POST /api/{route:path}` 把其余接口交给 `web_contract`：GET 查账本，POST 写账本。只因带请求体才用 POST、实际不写账本的接口单独列了一张清单（标签预览、媒体处理偏好、目录预览、自定义元数据、刮削设置与检查、链接检查、整理预览、人脸模型），它们不受写锁保护。

`web_router` 里另有几个具名端点：

| 地址 | 说明 |
| --- | --- |
| `GET /api/libraries` | 媒体库分组：`id`、`name`、`icon`、`folders`、`color`、`policy`、`stages`、`roots[{root_id,location}]` |
| `GET /api/tasks/{run_id}`、`POST /api/tasks/{run_id}/control` | 任务进度与暂停、继续、取消 |
| `GET /api/background-issues` | 后台问题清单 |

响应体是紧凑 JSON（不额外缩进、UTF-8 不转义）。错误形状固定：

| 情况 | 状态与正文 |
| --- | --- |
| 键不存在 | 404 `{"error":"not found"}` |
| 参数类型或取值不对 | 400 `{"error":"<类型>: <说明>"}` |
| 任务已取消 | 409 |
| 任务或目录规则冲突 | 409 |
| 版本冲突 | 409，带 `expected_revision` 与当前 `revisions` |
| 其余异常 | 500 `{"error":"internal server error"}` |

页面侧的失败另有形态：媒体 id 不存在 404 `{"error":"no such id"}`，取不到字节 404 `{"error":"unavailable"}`；导航请求（`GET`/`HEAD`、非 `/api/`、`Accept` 含 `text/html`）拿到 HTML 错误页而不是 JSON。未处理的异常回 500 `{"error":"服务处理失败，请导出诊断报告","error_id":...}`，响应头带 `X-Peach-Error-ID`，这一串就是诊断包里的定位线索。

## 健康检查

`GET`/`HEAD /healthz` 回 `ok`、服务名、版本、各项检查结果、这次启动有没有配置过、数据库与 ffmpeg 状态、调用方能不能改配置，以及每个网盘的连接状态。它不探测网盘、不迁移数据库、不读媒体字节，可以放心给探针用；加 `?ready=true` 时按就绪判据回 200 或 503，两种都带 `no-store`。

## 响应头

- 所有响应带 `X-Content-Type-Options: nosniff`。
- 没自己设 `Cache-Control` 的一律补 `no-store`；长缓存只有两处：`/vendor/` 与 `/dist/` 里带内容哈希的分块。
- 图像、视频、音频响应另加 CSP `sandbox; default-src 'none'; frame-ancestors 'none'`。
- 浏览器第一次拿到媒体策略的 HTML 页面时收到 `Clear-Site-Data: "cache"`，并种下 `peach_media_policy=1` 不再重复清理；登录状态与偏好不受影响。
- 全局带 `Referrer-Policy: same-origin` 与 `X-Robots-Tag`。
- 压缩开着，但 `application/octet-stream`、`text/plain` 与已压缩的媒体类型不参与。
