# ADR-0157：存储改为直连网盘 API，取流优先 302，取消本地视频处理与桌面分发

- 状态：已采纳
- 日期：2026-11-11
- 关系：取代 [ADR-0016](0016-remote-mp4-default-range-hls-opt-in.md)、[ADR-0089](0089-cloud-offline-download.md)、[ADR-0065](0065-cloudflare-sources-load-in-the-local-browser.md)；修正 [ADR-0021](0021-close-stash-adapter.md)、[ADR-0041](0041-new-files-are-pushed-in-scanning-is-the-backstop.md)、[ADR-0050](0050-settings-modal-holds-values-pages-hold-work.md)、[ADR-0080](0080-resource-sync-owns-empty-folders-and-purges-vanished-rows.md)、[ADR-0149](0149-docker-first-access-setup.md)；[ADR-0011](0011-windows-tray-autostart.md)、[ADR-0012](0012-version-and-update-boundary.md)、[ADR-0017](0017-dual-host-local-runtime-and-sync-boundaries.md)、[ADR-0091](0091-restart-prepares-runtime.md) 随之失效

## 背景

现形态的前提是「Peach 跑在有桌面的机器上，媒体先被挂成本机目录」：

- 每个云来源都先由 CloudDrive2、rclone 或 OpenList 挂成本机目录，Peach 只认路径（`docs/CLOUDDRIVE.md`）。远端 MP4 播放走标准 Range，HLS 是按需模式（ADR-0016）。
- 云下载只对 115（CloudDrive2 gRPC）与 PikPak（非官方 API）存在（`src/peach/downloads.py:3-4`）。
- 入口守卫是「局域网闸门的口令 + Cloudflare Tunnel」：`src/peach/auth.py` 绑非回环地址却拿不到口令时拒绝启动，`src/peach/web_local_access.py` 只认 loopback 与私网来源并拒绝 `x-forwarded-*`。
- 分发靠 Windows 托盘、安装器与九条自动更新通道。

实际部署方式是「一台服务器 + 浏览器访问」，上面每条前提都不成立：服务器没有桌面播放器（`local_playback` 拉起系统程序）、没有本机浏览器（`browser_transport` 拉起用户机器的 Chrome 过 Cloudflare 校验，ADR-0065）、没有托盘可点，入口必须能公网直连。ADR-0016 里也记着用户实测：CloudDrive 与资源管理器里的本地播放器加载明显快于 Peach，因为每次进入新区块都要起 FFmpeg seek/remux。

另一条根因是身份：Google Drive 与 OneDrive 都给每个文件一个永不改变的 id，改名、移动都不变；而账本把 `UNIQUE(location, path)` 当身份（`migrations/0000_legacy_schema.sql:14`），`path` 是 Windows 形态的挂载路径，于是需要 `record_rehome` 这类「文件消失再把个人记录接回去」的补丁。

## 决策

**一、存储只走 provider API，不挂载。** Peach 自己持有账号凭据，列目录、取元数据、取直链、改名移动全部走 API。第一阶段只做 Google Drive 与 OneDrive，115、PikPak、光鸭与其他已挂载网盘退出。

**二、取流优先 302，两种方式由用户选。** OneDrive 用 Graph 返回的预授权 `@microsoft.graph.downloadUrl`（约一小时有效）直接 302；Google Drive 的 `Files: get?alt=media` 必须带 Bearer，由 Peach 转发 Range。OneDrive 另外保留「Peach 带 Range 转发」这一档（`[drive.modes] onedrive = "proxy"`），因为直连把网盘临时地址交给播放器、速度也不受 Peach 控制，网络差或不想暴露直链时可以换。两条路径各自排错、各自测试。

**三、只在浏览器能直接解码时才播放。** 转码与 HLS 全部删除，`BROWSER_MIME`（`src/peach/media.py`）成为唯一判据。白名单外照常入库、可浏览、可复制直链、可交外部播放器。

**四、元数据靠 provider 字段与远端探测。** 优先用 Drive 的 `videoMediaMetadata`、OneDrive 的 `video` facet；缺字段时用 HTTP Range 取头部给 `ffprobe`，不落本地文件。九宫格（卡片 3×3 接触印相）保留，改成从网盘流抽九帧生成（`preview_sheets`）；时间轴预览不变，仍按需生成。

**五、时间轴预览保留，按需生成。** 第一次打开播放页时后台抽帧并缓存，扫描只登记不碰字节。

**六、云下载整条链路删除。** organize 保留，改写成 Drive／OneDrive 的 rename/move。

**七、服务端形态。** 只保留 Docker 镜像与源码树的 `peach serve`。托盘、安装器、卸载器、开机自启、全部自动更新通道与打包脚本删除。入口去掉局域网闸门与 Cloudflare Tunnel，公网由外部反代终止 TLS，来源判定改用 `PEACH_TRUSTED_PROXIES`。

**八、变更发现用增量 API。** Drive `changes.list`、Graph `delta` 为主，每日一次全量核对兜底，界面提供「立即刷新」。

**九、身份键改 `(location, remote_id)`。** `path` 降级为展示用虚拟路径。改名与移动不再影响个人记录，`record_rehome` 失去对象。

**十、界面形态不变。** 只换数据来源与播放通道，媒体库页面结构保持。

**十一、登录与访问控制交给会话层。** `access.py` 从「按来源网段判定」改为纯会话：令牌摘要、设备简称、时间；不再记录或校验来源网段。

**十二、实现按大爆炸推进。** 直接删旧链路再从零加新链路，不做挂载与新驱动的共存兼容层。旧 Docker 镜像继续跑生产，新链路验证通过后再替换。

## 影响面

删除 28 709 行，占 `src/peach` 126 870 行的 22.6%：挂载专属 7 文件 1 824 行、转码与 HLS 7 文件 1 932 行、MP4 修复与索引 3 文件 1 088 行、云下载链 18 文件 5 524 行、桌面与更新 24 文件 7 215 行、局域网与网络 5 文件 1 692 行、浏览器历史与 `browser_transport` 8 文件 3 262 行、双机同步与对外上报 11 文件 3 048 行、存量修复框架与入口 5 文件 2 506 行、本地磁盘三件 380 行、外部播放 2 文件 238 行。

保留并改造：`platform`（盘符↔挂载点翻译改 provider 路径渲染）、`media_configuration`、`media_folders`、`media_libraries`、`junk`、`storage_budget`、`data_storage`、`access`。

保留不动：人脸与头像、时间轴抽帧、刮削采集、`auto_landing_revert` 撤回机制、`support_bundle`、`error_reporting`、`endcard` 首尾帧证据、`external_playback` 限时票据，以及四个只在 `scripts/` 手工脚本里用的单点修复。

## 后果

- 部署只剩一个容器加三条凭据；升级不再依赖托盘与自动更新。
- 播放路径由「本机读挂载 + 服务端 remux」变成「浏览器直连或单跳转发」，可播集合收窄到浏览器原生支持的容器与编码。
- Google Drive 的播放流量全部经过服务器，上行带宽与计费需要按实际被看到的内容评估。
- 探测与抽帧从远端读，每个文件要拉几百 KB 到数 MB；必须设并发上限，避免触发网盘限流。
- FC2PPV-DB 与 JAVten 不再由本机浏览器过 Cloudflare 验证，改走 httpx 加用户在采集设置里贴的 `cf_clearance` Cookie；验证没过照常整站冷却。
- 旧账本里 115／PikPak／光鸭 的行不再参与扫描与播放，只做只读展示；处置由维护者手工执行。

## 验证

- 驱动层用假 provider 夹具覆盖：token 过期刷新、分页列目录、`changes.list`／`delta` 增量、改名后 `remote_id` 不变、直链过期后重新取。
- 播放面用真实小样本逐条验：Drive 转发 Range 的 seek、OneDrive 302 的 Range 语义、白名单外文件的浏览与直链。
- 账本迁移用旧库副本验：`(location, remote_id)` 唯一键建立、旧行回填、`path` 展示渲染。
- 交付门槛按 `docs/TESTING.md`：本机 `auto` 起步，影响面跨共享设施时用 `full`。

## 未决

- Google OAuth 客户端、Azure 应用与公网 HTTPS 域名三项前置条件未到位前，端到端验证只能停在假 provider 夹具。
- 旧来源账本行的最终处置（删除或改写成本地位置）由维护者决定。
