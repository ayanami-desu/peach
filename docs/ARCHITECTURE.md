# 总体架构

这份文档讲 Peach 由哪几块组成、各块管什么、一次扫描和一次播放各经过哪些步骤。取舍理由在 `docs/adr/`，存储与播放形态的定案见 [ADR-0157](adr/0157-remote-drive-api-storage-and-playback.md)。

## 产品形态

Peach 是一个 FastAPI 模块化单体：逻辑上前后端分离，部署时仍是一个进程、一份 SQLite 账本。媒体不落本机——视频在 Google Drive 或 OneDrive 上，Peach 只持有它的远端身份、元数据和一份可重建的展示产物。

分发只有两条路：`Dockerfile` 构建的容器镜像（[Docker 部署](DOCKER.md)、[服务器部署与更新](DEPLOYMENT.md)），以及源码树里的 `peach serve`（[运行与配置](OPERATIONS.md)）。没有安装器、托盘、自启与自动更新。

## 分层

| 层 | 位置 | 职责 |
| --- | --- | --- |
| 入口 | `src/peach/cli.py` | `init`、`serve`、`process`、`token`、`migrate`、`status`、`check-sources` 七个子命令；`serve` 组装 `PeachSettings` 并交给 `create_app` |
| 应用层 | `src/peach/api.py`、`routes_*.py`、`web_router.py` | `create_app` 装配；HTTP 契约、鉴权、中间件、异常到中文文案 |
| 领域层 | `drive_*`、`scan.py`、`media.py`、`library_processing.py` 等 | 网盘访问、扫描、取流、探测、刮削、复核、整理 |
| 数据层 | `repository.py`、`migrations/` | SQLite 账本、一次性迁移（`0000`–`0057`），版本号表 `ledger_revision` |
| 前端 | `frontend/src/` → `web/dist/` | React 路由树、Tailwind v4 与 BoardUI 源码，构建产物提交进仓库，见[前端](FRONTEND.md) |
| 分发 | `Dockerfile`、`compose.yaml`、`.github/workflows/docker.yml` | 镜像构建与 GHCR 推送 |

## create_app 装配

`src/peach/api.py` 的 `create_app(settings)` 只做组装，按下面的顺序建对象：

1. `LedgerDatabase(settings.db_path)` 与 `LedgerRepository(database)`；`WebContract` 收下数据库与各产物根目录（`snapshot_root`、`cover_root`、`avatar_root`、`poster_root`、`timeline_root`、`photo_root`、`candidate_root` 等）。
2. `FFmpegResolver(settings.ffmpeg_root)` 找 `ffprobe`/`ffmpeg`；`HttpxTransport()` 是全应用共用的出网通道。
3. `DriveConnections(settings, lambda: http_transport.client)` → `app.state.drive`，再 `build_streamer(drive.providers, ...)` → `MediaEngine(repository, streamer, cache_root=settings.photo_root.parent / "media-cache")` → `app.state.media_engine`。
4. `ScanService(drive.providers, repository, drive.roots_map())` → `app.state.scan`；`DriveSync(scan_service, after=after_scan)` → `app.state.drive_sync`，并让 `drive.sync_state`、`drive.refresh_hook` 指到它。
5. 图像服务：`PreviewService`、`PhotoThumbnailService`、`sample_cache` 与三个 `DerivedImageService`（实体头像、封面、封面缩略）。
6. 采集：`default_registry()` 的资料源、`OpenCodeGoClient`、`FollowUpdateScheduler`（关注）与另一个 `FollowUpdateScheduler`（订阅源，`job_id=FEED_JOB_ID`、`feed-schedule.json`）、`RecoveryService`。
7. `lifespan`：`_LedgerActivation` 起调度，`_warm_ledger_aggregates` 预热 `WARM_AGGREGATES` 里的七个入口（`/api/entity/shapes`、`/api/items?limit=60`、`/api/stats`、`/api/search/recommendations`、`/api/review`、`/api/ads`、`/api/follow`），再 `asyncio.create_task(drive_sync.run(sync_stop))` 跑同步循环；退出时等这个 task 结束，然后停后台任务、摘掉人脸模型、关 HTTP 与关注媒体解析器。

`app.state` 上的对象就是可注入的服务表：

| 对象 | 类型 | 用途 |
| --- | --- | --- |
| `settings` | `PeachSettings` | 数据库路径、口令、访问策略、文档开关 |
| `web_contract` | `WebContract`（`web_state.py`） | 聚合缓存、产物根目录、写锁 |
| `repository` | `LedgerRepository` | 账本读写入口 |
| `drive` | `DriveConnections` | 账号、授权、令牌、扫描根 |
| `scan` | `ScanService` | 全量与增量扫描 |
| `drive_sync` | `DriveSync` | 定时同步循环与「立即刷新」 |
| `media_engine` | `MediaEngine` | 取流、按需落缓存、给 ffmpeg 的输入地址 |
| `providers` | 资料源注册表 | 刮削、订阅、来源检查 |
| `follow_scheduler`、`follow_media_resolver`、`follow_cover_service`、`follow_evidence` | 关注链 | 追更调度、媒体解析、封面、证据 |
| `http_transport` | `HttpxTransport` | 共用连接池、限流、代理 |
| `background_issues` | 后台问题清单 | 任务问题的统一出口 |
| `external_playback_key` | 票据签名材料 | 外部播放器链接 |

中间件与异常集中在同一处：`ResponseHeadersMiddleware` 加安全响应头，`GZipMiddleware` 排除 `application/octet-stream` 与 `text/plain`；`MediaNotFound` 回 404 `{"error":"no such id"}`，`MediaUnavailable` 回 404 `{"error":"unavailable"}`，`PageLoginRequired` 303 到 `/login?next=`，`AssetLoginRequired` 回 401 要 `?t=` 口令，`StarletteHTTPException` 统一成中文 `detail` 并带 `X-Peach-Error-ID`。`docs_url`/`openapi_url` 受 `settings.docs_enabled` 控制，`redoc_url` 恒关。

## 路由分派

五个 `APIRouter` 分片：`routes_auth`（登录与会话）、`routes_pages`（页面）、`routes_configuration`（设置面）、`routes_media`（取流与图像）、`routes_api`（`/api/*`），按这个顺序注册——FastAPI 按注册顺序匹配路径，顺序变了会抢走前面那条。`/api/{route}` 由 `web_router.py` 的 handler 表分派到 `web_catalog`、`web_entity`、`web_stats`、`web_batch`、`web_follow` 等域模块，这个文件是唯一 import 全部域模块的地方，域模块之间不互相认识。`READ_ONLY_POST_ROUTES` 是只读端仍允许的 POST 清单，漏登记的表现是按钮吃 409。

## 账本身份

资源身份是 `(location, remote_id)`：迁移 `0055_asset_remote_id.sql` 给 `asset` 加 `remote_id`，并对这对列建部分唯一索引（`WHERE remote_id IS NOT NULL`）。`location` 只有两个真值：`gdrive` 与 `onedrive`（`drive_provider.GOOGLE`/`ONEDRIVE`）。

`asset.path` 降级为展示用的虚拟路径，由 `scan.virtual_path(location, segments)` 拼出，形如 `gdrive:/Movies/2024/a.mp4`：第一段是 `<location>:`，后面每一段是远端目录名。它不翻成本机路径——这台机器上没有那份文件。目录树、面包屑与筛选都读这一列，见[目录浏览](DIRECTORY_BROWSING.md)。

`asset.drive_root`（迁移 `0056`）记下这个文件是在哪个配置的扫描根下被找到的，媒体库分组按（来源，扫描根）这一对收窄。挂载时代的旧行（115、PikPak、光鸭、已挂载网盘）保留原样只读展示，`remote_id` 为空，不参与扫描与播放。

`0000_legacy_schema.sql` 里 `UNIQUE(location, path)` 还在，扫描写库时按身份判新建、按这对列做幂等 upsert，撞上老行只计冲突不改行。

## 扫描与同步

`scan.ScanService` 只有两条写入路径：

- `full_sync()`：从配置的扫描根递归列目录（深度上限 `MAX_DEPTH=64`，每批 `BATCH_SIZE=500`），登记 `VIDEO_SUFFIXES` 里的文件（并排除 `catalog_rules.is_local_extra` 认出的系统文件），批量落库，再把这一趟没见到的行标成消失，最后把 `cursor` 清空并记下 `full_synced_at`。
- `sync_changes()`：按 `drive_sync.cursor` 取增量，删除走 `_vanish_ids`；游标为空时只取起点，不猜。

某一趟有列不动的目录时 `ScanResult.failures` 非零，这一趟不做「已消失」判定——来源抖一下不该把整库标成没了。扫描状态（`cursor`、`synced_at`、`last_error`）由 `drive_sync` 表承载，账本还没就绪时 `sync_state()` 给空态，不抛。

`drive_sync.DriveSync` 每 `TICK_SECONDS=60` 醒一次：距上次增量满 `INTERVAL_SECONDS=900` 就增量同步，满 `FULL_SYNC_SECONDS=86400` 做一次全量核对。一次只同步一个来源，限流按账号算；界面的「立即刷新」走 `drive.refresh_hook`，下一拍就生效。

### 扫描后处理链

`api.py` 的 `after_scan` 是扫描与其它子系统的唯一接缝，只处理这一趟新登记的 id：

```python
ids = list(result.new_ids)
if not ids: return
choice = resolver.ffprobe()
media_probe.probe_missing(database, media_engine, choice.path if choice else None, asset_ids=ids)
with closing(sqlite3.connect(database, timeout=30)) as connection:
    connection.row_factory = sqlite3.Row
    wants.reconcile(connection, ids); connection.commit()
record_rehome.reattach_in(database, ids)
```

1. `media_probe.probe_missing`：用 provider 给的宽高时长（Drive `videoMediaMetadata`、OneDrive `video` facet）先填，缺的再用 HTTP Range 喂 `ffprobe`，探测结果只写账本，不落本地文件。
2. `wants.reconcile`：按番号把「想要」清单里的条目对上账本资产。
3. `record_rehome.reattach_in`：把旧账本里已消失、但同一番号又出现的记录接回新资产，个人记录不丢。

扫描本身不碰字节：登记只看列表响应里的元数据。探测和抽帧是唯一会读片源的地方。

## 播放与产出

- `/stream`（`routes_media.stream`）问 `MediaEngine.response(request, asset)`：`MediaEngine.plan` 给出 `StreamPlan("range", mime, "drive-range")`，`browser_mime` 按扩展名白名单决定 MIME（`.mp4`/`.m4v` → `video/mp4`，`.webm` → `video/webm`，`.ogv`/`.ogg` → `video/ogg`），白名单外的扩展名仍入库、可浏览、可复制直链、可交外部播放器。
- 字节怎么过 Peach 由 `drive_stream.DriveStreamer` 决定：OneDrive 有预授权地址，`redirect` 让浏览器直连；Drive 必须带 Bearer，`proxy` 原样转发 `Range`，把 200/206、`Content-Range`、`Content-Length` 透回去。需要落一份给图像流水线时用 `open()`；ffprobe 与抽帧按段读，`read(location, remote_id, offset, length)`，上游不支持 Range 时退化为前缀截取。
- `/api/stream-plan` 返回 `{id, protocol, mime_type, duration, src, reason}`，`src` 永远是 `/stream?id=<id>`。预授权地址不在这里下发，因为它一次播放期间就会过期。
- 按需产物都从同一个 `MediaEngine` 取字节：实体头像与封面由 `previews`、`cover_artwork` 安装，卡片的 3×3 九宫格由 `preview_sheets` 在处理链的「生成预览图」一步生成，播放页的时间轴接触印相由 `timeline_sheets` 现做（详见[视频预览](VIDEO_PREVIEWS.md)），本机持久副本由 `remote_media_cache` 管（详见[媒体缓存](MEDIA_CACHE.md)）。九宫格不单独排一趟扫描：处理链碰到哪部还没有图，就在那一轮补上。

## 数据目录

`peach-data/` 与代码仓库分开放。子目录键是 `settings_file.DIRECTORY_KEYS`：`database`、`generated`、`sources`、`state`、`secrets`、`logs`、`tools`、`review`。设置文件里省略某项就取同名目录，写绝对路径可以把某一项搬出 Peach 数据目录。

| 目录 | 内容 |
| --- | --- |
| `database/` | `ledger.db` 及其 `-wal`/`-shm`，`ledger.pre-<用途>-<时间戳>.db` 备份与 `drive_sync` 的游标 |
| `generated/` | 封面、头像、海报、时间轴接触印相、`organize-backups/` 等可重建或需留档的产物 |
| `sources/` | 刮削与追更的原始输入、证据快照 |
| `state/` | 任务检查点、本机运行状态、调度偏好、存储占用统计 |
| `secrets/` | 访问策略、`browser-sessions.json`、网盘令牌（权限 0600，不进账本也不进设置文件） |
| `logs/` | 当前运行日志，容器里由 `log_retention` 按月切段 |
| `tools/` | FFmpeg 等本机托管运行时 |
| `review/` | 复核候选 CSV |

外链媒体的本机缓存落在 `generated/media-cache/`（`create_app` 传的是 `settings.photo_root.parent / "media-cache"`）。账本备份的保留规则在 `ledger_backups.py`：最近 `KEEP_RECENT` 份、未满 `MIN_AGE`、或比当前账本更新的都留着，账本 `integrity_check` 不是 `ok` 时一份都不清。

## 访问控制

浏览器会话是签名令牌，`secrets/browser-sessions.json` 里每台设备记一行，只存令牌摘要、设备简称、来源网段与时间——签名管伪造，这份记录管撤销（`access.py`）。来源判定在应用内自己做：uvicorn 以 `proxy_headers=False` 启动，反代地址由 `PEACH_TRUSTED_PROXIES` 声明，不被转发的 `X-Forwarded-For` 牵着走。对外可达而没有口令时 `peach serve` 直接拒绝启动，回环地址不拦。

## 明确不做

- 微服务、消息总线、PostgreSQL
- 本机保存媒体原件、做转码或 HLS 切片：浏览器原生能播的直接给 `Range`，不能播的交给外部播放器
- 多主合并的账本复制
- 抓取或保存第三方 OAuth token（网盘令牌除外，那一份只在本机 `secrets/`）
- 把 Stash 私有目录或 GPL 构建当作稳定打包依赖

Stash 遗留的数据缺陷与许可证边界见[Stash](STASH.md)；复用与自研的边界见[复用清单](REUSE.md)。
