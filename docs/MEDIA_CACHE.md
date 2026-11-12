# 媒体缓存

播放本身不写盘：`/stream` 要么把网盘给的地址交给浏览器，要么把客户端的 `Range` 原样转发出去，本机不留副本。写到盘上的是那些必须变成文件才能用的东西——要交给浏览器或 PIL 的图像、要喂给 ffprobe/ffmpeg 的帧、以及只能联网再取一次的下载资料。除账本与备份外都在数据目录的 `generated/` 下。

## 保存位置

| 目录 | 内容 | 写入方 | 重建方式 |
| --- | --- | --- | --- |
| `generated/media-cache/<网盘>/<远端 ID><后缀>` | 图片资产的整份原图，`/photo` 与图片墙缩略图的取字节来源；视频不走这里，播放直接流过去 | `MediaEngine.file_for` | 重新从网盘下载 |
| `generated/photo-thumbs/<资产 ID>.jpg` | 图片墙缩略图，长边 640、JPEG 82；旁边 `<资产 ID>.jpg.rule` 记源文件签名 | `PhotoThumbnailService` | 重新下载原图后缩一次 |
| `generated/snapshots/` | 账本 `asset.snapshot_path` 指向的 3×3 接触印相（九宫格）：卡片封面、悬停扫格与进度条悬停预览都从它裁格 | `preview_sheets.generate`，处理链的「生成预览图」一步 | 重新抽九帧，见[视频预览](VIDEO_PREVIEWS.md) |
| `generated/posters/<资产 ID>_<格>.jpg` | 九宫格的单格，从接触印相裁 `iw/3:ih/3`、最长边 640 | `PreviewService.poster` | 重新裁一次 |
| `generated/timeline/<ID 末两位>/<ID>/` | 时间轴的 10×10 印相 `001.jpg`、`002.jpg`… 与索引 `meta.json` | `timeline_sheets.build` | 重新抽帧，见 [视频预览](VIDEO_PREVIEWS.md) |
| `generated/cover-thumbs/<键>.<长边>.<画质>.<版本>.webp` | 封面派生件，长边 800 与 1600 两档 | `DerivedImageService` | 从本机封面原件重缩 |
| `generated/avatar-thumbs/<键>.640.80.<版本>.webp` | 实体图派生件，长边 640 | `DerivedImageService` | 从本机实体图原件重缩 |
| `generated/sample-cache/<番号>/<序号>.jpg` | 官方样张原图，附 `<序号>.thumb.jpg` 与失败标记 `<序号>.miss` | `SampleCache` | 重新联网取；失败标记一天内不再试 |
| `generated/jav-public/` | 作品公开资料与样张的持久快照：标题、人物、厂牌、样张索引与失败标记；抓到一次就留着，不按天数失效，只有盘上没有或手动重匹配时才再问来源 | `library_processing` 的 `public_cache`、`javdb_public` | 重新联网取 |
| `generated/provider-cache/` | 资料站页面与头像原图：`performer-avatars/`、`seesaa-pages/`、`avwikidb-pages/`、`minnano-av-pages/`、`avbase-talent-pages/`、`javdb-pages/`、`sample-images/misses.json`、`followup-attempts/` | 各补全任务 | 重新联网取 |
| `generated/remote-media/` | 外链图像与清单的本机副本 | `RemoteMediaCache` | 重新联网取，见下节 |
| `generated/covers/`、`generated/avatars/`、`generated/logos/` | 封面、头像、厂牌标志的原件 | 采集与资料补全 | 重新联网取 |

派生件文件名里的长边、画质与 `upgrade_rules.PREVIEWS` 版本号由 `DerivedImageService.path_for` 拼出；换一档尺寸或换一次代号，旧文件不再被命中。派生件的目录跟着原件目录走（`cover_thumb_root`、`entity_thumb_root`），不塞进原件目录，因为那里每次都要逐条扫描判「有没有图」。

## 外链副本

`generated/remote-media/` 由 `remote_media_cache.RemoteMediaCache` 管，规则与其他目录不同：

- 身份键是服务端身份串的 sha256，不含签名地址；命中时不必重新解析来源。
- 一个键一个目录，槽名是 `full`，或按 `Range` 请求头另算的 sha256。
- 只有完整传输才安装：`.bin` 与同名 `.json`（状态、字节数、转发过的响应头），权限 `0600`。长度不符、传输中断与错误页都不成为命中。
- 命中的回执带 `Cache-Control: private, no-cache`，图像另加 CSP `sandbox` 与 `nosniff`。
- 同一段 `Range` 同时只放一个下载者，后来者最多等 `FETCH_WAIT_SECONDS = 15` 秒；等不到就直通上游，这一次不写盘。
- `bytes()` 走 `.data`、`.failed` 与 `.lock` 三个文件：失败后 3600 秒内不再试，手里还有旧副本时继续用旧的。
- 只接受被动媒体类型——图片、视频、音频、`application/octet-stream` 与 `application/vnd.apple.mpegurl` 一类；HTML、SVG、XML 不缓存，直接回 502「媒体响应类型不受支持」。
- 有效期：头像 90 天（`AVATAR_REFRESH_SECONDS`）、站点图标 365 天（`FAVICON_REFRESH_SECONDS`）。
- 容量保护拒绝写入时抛 `RemoteMediaUnavailable`，这一次交给页面处理，不写盘。

## 清理

「设置 → 存储与备份」上半格的清理只对三类开放（`data_storage.CLEANABLE`）：`backups`（数据库备份）、`thumbnails`（缩略图）、`logs`（日志）。缩略图指 `generated/cover-thumbs` 与 `generated/avatar-thumbs`——清掉后浏览时从本机已有的封面重新缩小，不用联网；容量闸门真不够时也会先清最久没用过的那几张。日志只清已归档的部分。

其余类别不提供清理入口，理由由 `data_storage.CATEGORIES` 写明：

- 预览图（`snapshots`、`posters`、`timeline`、`photo-thumbs`）：重建要重新读取整部影片，网盘里的影片会重新下载。
- 封面与网络资料（`covers`、`avatars`、`logos`、`sample-cache`、`provider-cache`、`jav-public`）：删除后要重新联网下载，已下架的来源再也取不回来。
- `media-cache` 与 `remote-media` 不在分类表里，落进「其他」，只能在数据目录里手动处理。

容量保护另按一组目录算缓存占用（`storage_budget.cache_roots`）：`generated/remote-media` 与两个派生缩略图目录，外加大盘上另指定的一个外部缓存目录。`media-cache`、`snapshots`、`posters`、`timeline`、`photo-thumbs` 不在这组里，按数据算。

统计、清理与容量保护由「设置 → 存储与备份」上半格调用，分别落到 `POST /api/configuration/storage/measure`、`POST /api/configuration/storage/clean`、`POST /api/configuration/storage/policy`；不在可清理清单里的分组名一律回 400「这一类不能在这里清理」。时间轴档位切到 `off` 只是不再按需生成，已经生成的图留在盘上。
