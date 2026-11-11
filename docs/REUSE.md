# 复用清单

这份清单回答一个问题：要做的事，树里是不是已经有实现，该改哪一处。新增能力前先在这里按能力查一遍——重写一份已有的实现，等于给自己留两套约定，往后每次改动都要记得两边。

规则只有三条：

1. **先查现成实现。** 同类的事只留一处实现。发现同一件事有两处代码，先合，再加新功能。
2. **外部项目只借判据与顺序，不借代码与文案。** 借来的东西登记在 `docs/reference-sources.json`，取证与更新节奏见文末。
3. **能力删干净。** 一项能力下线，它的模块、端点、设置键、界面入口与文档一起删；留着「万一还用得上」的分支，下一个人会把它当支持的特性。

存储与播放的形态定案见 [ADR-0157](adr/0157-remote-drive-api-storage-and-playback.md)，分层与装配见[总体架构](ARCHITECTURE.md)。

## 网盘驱动

| 现成实现 | 位置 |
| --- | --- |
| 驱动契约与数据类型 | `src/peach/drive_provider.py`：`DriveProvider` 协议（`list_folder`/`entry`/`download_target`/`move`/`changes`）、`DriveEntry`、`DownloadTarget`、`Change`、`LOCATIONS` 与 `GOOGLE`/`ONEDRIVE` |
| Google Drive | `src/peach/drive_google.py`：OAuth 换码、`files.list` 遍历、`alt=media` 取字节、`changes` 增量 |
| OneDrive | `src/peach/drive_onedrive.py`：OAuth 换码、`children` 遍历、预授权直链、`delta` 增量 |
| 账号与令牌 | `src/peach/drive_accounts.py`：令牌只落 `secrets_root`、权限 0600、不进账本也不进设置文件；刷新失败一律抛 `DriveAuthRequired`，不把 401 当网络错误重试 |
| 连接与扫描根 | `src/peach/drive_connections.py`：`DriveConnections.providers`/`roots_map`/`snapshot`/`authorize`/`accept`/`set_roots`/`forget` |

做一个新来源就实现 `DriveProvider` 那六个方法，每个方法只做一次远端往返；不要往协议里加「顺手多取一点」的参数，批量与并发由调用方统筹。不引入 WebDAV、rclone 或 FUSE 挂载来「顺便支持更多网盘」——挂载会把远端目录变成一块会超时、会缓存、会与本机权限纠缠的磁盘，而账本只认 `(location, remote_id)`。

## 取流

`src/peach/drive_stream.py` 是唯一的字节通道：

- `DriveStreamer.response()` 分两种形态：`redirect`（OneDrive 有预授权地址，字节不过服务器）与 `proxy`（Drive 必须带 Bearer，原样转发 `Range`，把 200/206、`Content-Range`、`Content-Length` 透回去）。`PASSTHROUGH` 决定哪些响应头照抄，`CHUNK = 256 * 1024`。
- `read(location, remote_id, offset, length)` 给 ffprobe 与抽帧按段取字节；上游不支持 Range 时退化为前缀截取。
- `open()` 取完整一份，给图像流水线与本机缓存用。

`src/peach/media.py` 的 `MediaEngine` 是调用方唯一的入口：`plan()` 给出 `StreamPlan("range", mime, "drive-range")`，`response()` 直接回 HTTP 响应，`file_for(asset, thumbnail=False)` 取本机快照，`ffmpeg_input()` 给 ffmpeg 一个可读的地址与请求头。浏览器能播什么由 `BROWSER_MIME` 的扩展名白名单决定，白名单外的不转码，交外部播放器（见[外部播放器](EXTERNAL_PLAYERS.md)）。

不要再接第二套需要落本地字节的处理管线：多一份本地渲染，就多一套缓存、清理与失败重试，而收益只是让个别容器能在浏览器里直接播——那条路 ADR-0157 已经否掉。

## 探测与缩略图

| 现成实现 | 用途 |
| --- | --- |
| `src/peach/media_probe.py`：`probe()`、`measure()`、`probe_missing()`、`context_fields()`、`display_dimensions()` | 用 provider 元数据补齐宽高时长，缺的用 HTTP Range 喂 ffprobe；结果只写账本，不落本地文件 |
| `src/peach/previews.py`：`PreviewService.poster()`/`avatar()`/`logo()`/`entity_image()` | 从本机快照裁海报、头像、厂牌 Logo 与实体图 |
| `src/peach/previews.py`：`PhotoThumbnailService`、`DerivedImageService` | 图集缩略、头像与封面缩略；`entity_thumb_root()`/`cover_thumb_root()` 给目录 |
| `src/peach/ffmpeg.py`：`FFmpegResolver`、`BinaryChoice`、`binary_diagnostics()` | 找本机或托管的 `ffmpeg`/`ffprobe`，诊断缺失原因 |

二进制只有一套：`FFmpegResolver` 找，ffprobe 读元数据，ffmpeg 抽帧。不引第二套解码栈（OpenCV、PyAV、Pillow 之外的自研解码）——多一套就多一处「这台机器上能跑，那台不能」的分叉。Pillow 只做裁切、缩放与排版，不做视频解码。

`src/peach/cover_artwork.py`（原子安装 JAV 封面与取景 sidecar）、`src/peach/jav_poster_crop.py`（横版封套正封坐标，五路取景写进框的 `method`，原图一字节不动）、`src/peach/portrait_artwork.py`（从本地封面与高清帧里挑人脸最清楚的一张）是三件不同的事，别合并：它们的输入、判据与失败处理都不一样。

## 时间轴抽帧

按需生成的流程在 `src/peach/timeline_sheets.py` 与 `src/peach/frame_capture.py`：

- `frame_capture.capture_with_retry()` 抽单帧，`tile_frames()` 拼接触印相，`headers_option()` 把请求头交给 ffmpeg。
- `timeline_sheets.build()` 生成整份，`ensure()` 判断要不要现做，`is_current()`/`read_meta()`/`frame_count()` 读产物，`discard()` 清掉，`sheet_dir()`/`meta_path()`/`sheet_path()` 定位文件。

产物格式、档位与端点见[视频预览](VIDEO_PREVIEWS.md)。第一次打开播放页才做，不做整库预生成任务——那会在买入当天跑满几小时的网盘读取，而绝大多数片子没人打开。

## 本机缓存

`src/peach/remote_media_cache.py`：`RemoteMediaCache`、`cache_for(contract)`、`RemoteMediaUnavailable`、`passive_media_type()`。只安装完整响应，Range 请求保留自己的范围，不把半截字节当成一份缓存。保存位置与清理规则见[媒体缓存](MEDIA_CACHE.md)。

## 备份

`src/peach/ledger_backups.py` 管账本备份的生命周期：

- 命名 `ledger.pre-<用途>-<时间戳>.db`，`plan()` 决定留哪些、`prune()` 执行，`BackupRejected` 是拒绝时的错误。
- 不满足 `KEEP_RECENT`/`MIN_AGE`、或比当前账本更新的备份都留着；当前账本 `integrity_check` 不是 `ok` 时一份都不清。
- `organize_dir()` 给整理批次留 `ledger.pre-organize-<时间戳>.db`，`holding()` 是持有中的备份集合。

整理要动文件顺序时一律先备份再动，见下面「整理」。

## 存储预算

`src/peach/storage_budget.py`（`StoragePolicy`、`validate()`、`load_policy()`、`save_policy()`、`refresh_usage()`）与 `src/peach/data_storage.py`（`measure()`、`clean()`、`snapshot()`、`StorageJobs`、`format_size()`、`Category`）。原则：磁盘余量实时查，数据与缓存总量逐文件统计只在后台线程做，请求读最近一次读数；超限时按修改时间从旧到新清可重建的产物，清完仍超限才暂停写入。

## 任务控制

| 现成实现 | 用途 |
| --- | --- |
| `src/peach/task_control.py`：`request()`、`intent()`、`requested()`、`speed_mode()`、`projection()`、`prune_controls()`、`Cancelled` | 停止与限速意图、安全停点、所属媒体子进程的收尾 |
| `src/peach/task_runs.py`：`TaskRunStore`、`TaskRun`、`TaskRunHandle`、`cli_run()`、`declared_rows()`、`task_label()` | 任务中心的运行记录、进度、后继登记；`cli_run()` 让命令行那一轮也进同一张表 |
| `src/peach/task_retry.py`：`transient_delay()`、`retry_delay()`、`RetryableTaskError`、`RetryableIOError` | 哪些失败值得重试、隔多久重试 |
| `src/peach/task_state.py`：`state_root()` | 任务检查点落在 `state/` |
| `src/peach/task_resources.py`：`Monitor`、`Usage` | 按任务登记的线程与子进程统计 CPU、GPU 占用；不知道的数字标成「未观测」，不猜 |
| `src/peach/processing_control.py` | 处理偏好、安全停点与带依据的耗时范围 |

新的长任务接进任务中心，而不是自己开一个后台线程加一个进度字典：停止、限速、重启后继续、失败重试都只在这一层实现一次。

## 整理

`src/peach/organize.py`（ADR-0039）的顺序是固定的：先备份 SQLite，再在网盘上改名或移动，最后改账本。网盘成功而账本失败就把名字改回去。`build_plan()`/`write_plan()`/`plan_path()`/`apply_plan()`/`rollback_batch()`/`latest_batch()`/`batch_log_dir()` 覆盖预览、执行与回滚，`segments_of()`/`ledger_path()`/`scope_path()` 换算出账本里的展示路径，`placeholder_values()` 只从已复核的真相字段取值。

路径模板在 `src/peach/organize_templates.py`：只有字面量、`{占位符}`、`[可选分组]` 三种记号，分组里有一个取不到值整段就不出现；清洗与逃逸防护分两层，缺一层就会把非法字符带进网盘路径。端点在 `src/peach/web_organize.py`，执行走后台任务（几千行改名在网盘上是分钟级的事）。命令行入口是 `scripts/organize_media.py`。

候选绝不参与改名：按未复核的猜测改名字，等于把猜测写进远端文件系统，而那一层没有 `source` 与 `confidence`。

## 目录与媒体库

- `src/peach/media_folders.py`：`folder_id()`（节点 id）、`within()`、`path_predicate()`、`directory_index()`、`browse()`。
- `src/peach/media_libraries.py`：`key(location, root_id)`、`libraries()`、`predicate()`、`stages_by_root()`、`ownership()`——媒体库按（来源，扫描根）认，不按本机路径认。
- 目录规则与筛选口径见[目录浏览](DIRECTORY_BROWSING.md)。

## 复核与资料结算

- `src/peach/review_csv.py`：候选 CSV 的读写口径（`read_rows()`/`write_rows()`/`read_candidates()`/`latest_candidate_file()`，`utf-8-sig` BOM、`newline=""`）。
- `src/peach/metadata_policy.py`：来源分级与字段结算，两套刮削栈的取舍见 ADR-0044/0048。
- `src/peach/junk.py`：垃圾判定证据与复核评分，扫描、后处理与页面共用同一套规则。

采集与资料处理的完整流程见[采集与资料](METADATA.md)。

## 诊断

- `src/peach/diagnostics.py`：`component_checks()`、`report()`、`health_components()`、`configuration()`、`database_checks()`、`tools()`、`security()`、`drives()`、`writable_root()`、`port_status()`、`recent_failure()`。只诊断，不修复账本、配置或工具。
- `src/peach/support_bundle.py`：`bundle_to()` 打脱敏诊断包（zip，无第三方依赖），`redact_log()` 抹掉敏感片段，`TAIL_BYTES` 只取日志尾部。
- `src/peach/error_reporting.py` 与前端错误上报收口，见[诊断](DIAGNOSTICS.md)。

出问题时先跑诊断包，不要在工单里贴原始日志：脱敏在这一层做，越早越好。

## 不借的东西

- **挂载与网络文件系统**：账本身份是 `(location, remote_id)`，不是本机路径；挂载会把身份藏进内核缓存。
- **转码与 HLS**：见「取流」。
- **云下载**：Peach 不代替用户下载媒体，只登记、取流与整理。
- **Stash 的库结构**：只借它对边车与番号的判据，不复制它的 schema 与依赖（见[Stash](STASH.md)）。
- **第三方抓取的私有目录**：不把 GPL 构建或私有运行目录当稳定依赖。

## 复用记录与取证

借来的判据、顺序与清单登记在 `docs/reference-sources.json`：每条有 URL、日期、SHA-256 与本地快照路径。上游快照只用于取证，保留原文与上游许可入口。

`scripts/check_reference_updates.py` 按条目里的 `cadence` 分档提醒复查；上游变了只当作参考，能力说明一律以当前实现为准。写文档与文案时的用词与去 AI 味要求见[写作规范](WRITING.md)。
