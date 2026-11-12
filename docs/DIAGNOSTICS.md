# 日志与诊断

Peach 的诊断证据只落在本机：错误事件写进 `logs/errors-<pid>.log`，需要交付时由用户自己导出诊断包。没有任何自动外发通道，也没有需要配置的接收端。

## 健康检查

`GET /healthz`（也接受 HEAD）不探测网盘、不迁移数据库、不读媒体字节，响应头带 `Cache-Control: no-store`。

| 字段 | 内容 |
| --- | --- |
| `ok` | 固定为 `true` |
| `service` / `version` | `peach-api` 与程序版本 |
| `checks` | `configured`、`database`、`schema`、`drives`、`security`、`ffmpeg` 六项，每项只有 `status` 与 `reason` |
| `configured` | 配置里是否已有网盘与扫描根 |
| `db` | `missing`、`empty`、`available` 或 `unavailable` |
| `ffmpeg` | 解析到的 FFmpeg 来源，没有时为 `unavailable` |
| `drive` | 每个已接驱动位置的 `connected` 布尔值 |

`checks` 走的是轻量路径：不校验配置文件内容，也不执行外部工具，因此这里只说明「找到没找到」，工具实际能不能跑要见下面的本机诊断。

`GET /healthz?ready=true` 是就绪探针：检查 `configured`、`web`、`database`、`schema`，调用方若提供后台就绪状态则再加 `background`，全部为真返回 200，否则 503。容器部署尚未完成首次配置时固定返回 `{"ready": true, "setup": true}`，`checks` 只含 `web`，避免安装流程被健康检查反复重启。

数据库检查全程只读：以 `mode=ro` 打开，`PRAGMA query_only=ON`，超时 1 秒，`readable` 要求能执行 `SELECT id FROM asset LIMIT 1`。迁移状态取值 `current`、`pending`、`mismatch`、`empty`、`unavailable`，并给出待执行与不一致的迁移编号。

未处理异常统一返回 500 `{"error": "服务处理失败，请导出诊断报告", "error_id": …}`，响应头 `X-Peach-Error-ID` 与该条本机记录一致，便于按编号回查。

## 本机诊断

`GET /api/diagnostics` 需要登录并核对同源，返回当前状态的一份 JSON：

```json
{"version": "…", "status": "ok", "checks": {…}, "library": {…}, "sources": […]}
```

`checks` 是十项检查，每项结构为 `{"label", "status", "reason", "action", "target", "details"}`，`status` 取 `ok`、`warning`、`failed`、`unknown`。

| 键 | 标题 | 通过条件 | 未通过时的原因与建议 |
| --- | --- | --- | --- |
| `database` | 数据库 | 数据库可读，且能查到资产表 | 数据库不存在、尚未初始化、无法读取或结构无法读取；检查本机数据库与备份 |
| `schema` | 数据库迁移 | 迁移状态为 `current` | 存在待执行迁移、尚未初始化、迁移记录与当前程序不一致或校验未取得；在本机核对迁移与备份 |
| `configured` | 配置 | 配置文件可读且已完成首次配置 | 文件无法读取时在本机修复配置文件；未配置时完成首次配置（`/settings/library`） |
| `drives` | 网盘 | 快照里每个位置都已连接且没有上次错误 | 空快照报「还没有接入网盘」；有位置出错时报具体错误并要求重新授权（`/settings#drives`） |
| `security` | 访问安全 | 仅监听回环，或已开启访问密码 | 局域网或公网入口没有访问密码时给出警告（`/settings/network`）；密码配置读不出来直接失败 |
| `ffmpeg` | FFmpeg／OpenSSL | 三个工具都能找到并执行，且 FFmpeg 有 AV1 软件解码器 | 列出未找到、无法执行的工具，或提示缺少 AV1 软件解码器（`/settings/maintenance`） |
| `data_root` | 数据目录 | 能在数据目录里建临时文件并清理 | 无写入权限或磁盘不可写；调整目录权限或检查可用空间 |
| `port` | 服务端口 | 端口当前可绑定，或已被本机进程占用 | 监听地址不是 IP 时状态未知；监听失败报未取得 |
| `tasks` | 后台任务 | 任务表里没有失败记录 | 最近一次失败任务的编号与时间，去任务中心查看（`/tasks`） |
| `version` | 版本 | 恒为通过 | 记录 Peach 与 Python 版本 |

十项之外，响应里还有两块只读证据：

- `library`：按 `识别失败`、`补资料失败`、`缺封面`、`缺时长` 四组列出问题条目，每组最多 500 条并以 `truncated` 标记截断；条目字段为 `id`、`code`、`name`、`title`、`location`、`path`、`duration`、`size`。`issue_at` 取自 `state/library-processing.json` 的记录时间。数据库读不到时四组留空。
- `sources`：逐个来源给出 `source`、`label`、`status`、`reason`、`last_check_at`、`elapsed_s`、`last_success_at`、`cooldown_until`。`status` 取 `ok`、`warning`、`stale`、`unknown`、`unchecked`；24 小时内解析成功才算新鲜；instagram 与厂牌来源不列出；既不在冷却中、也没有检查记录的可选来源不出现。

顶层 `status` 是汇总：任一检查 `failed` 即 `failed`；否则出现 `warning` 或 `unknown` 即 `warning`；都通过才是 `ok`。

`drives` 只读调用方传入的快照，不去问网盘。HTTP 报告传入空快照，所以这一项在接口里固定是 `unknown`「还没有接入网盘」；网盘连接状态以 `/healthz` 的 `drive` 和设置页为准。

## 错误日志

日志目录依次尝试配置里的 `logs`、数据目录下的 `logs`、系统临时目录的 `Peach/logs`，写进第一个可建目录的位置。文件名为 `errors-<pid>.log`，每行一条 JSON：

- `at` 是 UTC 时间，`stage` 标注取证入口，`thread` 是线程名。
- 每条都带程序与系统字段：Peach 版本、Python 版本、系统与内核版本、架构、是否冻结包、进程号与父进程号、服务主机时区（名称、偏移、本地时间）。
- 带异常时追加 `exception` 与 `frames`：异常链最多 8 层，每层保留类型、脱敏后截断到 4000 字符的消息、`winerror`、`errno`、操作标记、结构化错误码与附加上下文；帧只留文件名、行号、函数名，每个异常取最近 40 帧。

写日志前逐字段脱敏：网址换成 `<url>`，`Bearer`／`Basic` 凭据换成 `<credential>`，`--xxx-password`、`--xxx-token` 之类的命令行值与 `cookie:`、`authorization:` 行换成 `<redacted>`，Windows 盘符路径与 POSIX 绝对路径换成 `<path>`（`/api/…` 与 `/healthz` 保留），IPv4／IPv6 换成 `<ip>`，邮箱换成 `<email>`。字典键同样脱敏，脱敏后重名按顺序加 `#2` 等序号；`编号:路径` 形态的键保留编号、只把路径换成 `<path>`；键名含 password、token、secret、cookie 一类词的值整值写成 `<redacted>`。非 JSON 行按普通文本处理，规则相同。

常见 `stage`：`entry`（进程启动）、`unhandled-main`、`unhandled-thread`、`unraisable`、`logging`、`http-request`、`browser`、`browser-context`、`origin-mismatch`、`playback-request`、`playback-plan`、`playback-source`、`media-probe`、`background-job`、`background-result`、`job-recovery-stuck`、`diagnostics-report`。

进程退出时收走没写过任何问题的日志：崩溃日志为空、事件日志只有 `entry` 一条的直接删除。日志保留半年，仍在写的文件按自然月切段成 `<名字>.until-<最后写入日期>.log`，切下的段同样等半年后清除。

## 诊断包

设置页的「系统诊断」把诊断包当后台导出（`POST /api/diagnostics/exports`，`kind: "support"`），完成后从 `GET /api/diagnostics/exports/{identity}/download` 下载 `peach-support.zip`，`Cache-Control: no-store`。浏览器环境从请求头 `x-peach-browser-diagnostics` 解出（base64 后的 JSON，原始值超过 12000 字符则丢弃），同时记一条 `browser-context` 本机日志。导出把系统事实与浏览器快照一并打进 ZIP，与下面「后台导出」一节是同一套状态。

ZIP 结构：

| 路径 | 内容 |
| --- | --- |
| `report.json` | 系统事实、配置、运行环境、媒体工具、浏览器快照与逐文件回执 |
| `logs/<序号>/` | 各日志目录下的日志与事件日志 |
| `processing/` | 馆藏处理状态、处理问题清单与任务恢复标记 |
| `covers/` | 发现页资料任务状态与逐番号的封面处理结果 |
| `scraping/summary.json` | 来源摘要与刮削明细的合并状态 |

`report.json` 的主要字段：

- `created_at`、`system`：与日志同一份系统事实。
- `configuration`：能读取配置时为 `available`，带 `present` 与端口；读不出来时为 `unavailable` 并附异常链。
- `runtime`：分发方式、依赖包版本、SQLite 版本、逻辑核数与活动线程、内存档位、检出或构建提交号、监听地址类别与端口、代理环境变量是否存在、媒体处理偏好、各存储目录是否存在、数据盘总量与余量。
- `media_tools`：FFmpeg 与 ffprobe 的来源、路径与解码器。
- `browser`：浏览器快照白名单字段，没有快照时 `status` 为 `unavailable`。
- `checks`：去掉 `drives`（网盘明细只留本机页面），每项只保留 `status`、`reason`、`action`；`details` 只保留 `database.state`、迁移五项、`security.exposed`／`protected`、`port.port`／`state`、`tasks.id`／`finished_at`。
- `sources`：只保留来源、状态、原因、最近检查与成功时间、冷却时间。
- `scraping`：明细合并状态，含压缩后字节数、内联合并上限 100 MiB，以及 `summary_only`、`included`、`separate_export_required`。
- `logs`：每个文件的回执。
- `recent_browsers`、`recent_playback`、`recent_origin_mismatches`：从包内已脱敏日志里再提取，依次取最近 8、20、8 条。

收集范围与上限：

- 固定名单里实际存在的服务日志各取一份，带月分段 `.until-*.log` 的另取最近 2 份；`errors-*.log` 最近 8 份，`crash-*.log` 最近 4 份。
- `processing/` 收录 `library-processing.json`、`media-processing.json` 等状态文件，`library-processing-*.issues.jsonl` 最近 8 份，`job-recovery/*.json` 最近 32 份。
- 文本日志读尾部最多 96 KiB，截断时从第一个完整行开始。
- 结构化 JSON 先完整读最多 16 MiB，解析后按字段脱敏。导出内容超过 96 KiB 时缩减：集合保留 20 项、文本保留 4000 字符、嵌套最多 8 层，键按任务标识与状态、阶段、计数优先，其次是步骤与问题预览；仍放不下就整字段丢弃，并记下丢弃数量。
- JSONL 也读尾部 96 KiB，从完整行开始，只导出能解析成对象或数组的记录。
- 符号链接和指向目录外的文件不导出，回执里记为 `skipped_link`。

回执的状态取值：

| 状态 | 含义 |
| --- | --- |
| `included` | 已写入内容；是否缩减另见 `truncated` 与 `projected` |
| `empty_json` / `empty_jsonl` | JSON 是空白内容，或 JSONL 零字节 |
| `unreadable_json` / `invalid_json_shape` | JSON 解析失败，或顶层不是对象、数组 |
| `json_size_limit` | 超过 16 MiB 的完整读取上限 |
| `json_depth_limit` | 解析或脱敏时嵌套过深 |
| `json_projection_limit` | 缩减后仍放不进 96 KiB |
| `no_complete_records` | JSONL 尾部没有可导出的完整记录 |
| `skipped_link` | 符号链接或指向目录外 |

回执逐文件记录 `name`、`section`、`source_bytes`、`exported_bytes`、`status`、`truncated`；缩减过的 JSON 另有 `projected`、`omitted_fields`、`collection_counts`（顶层前 64 个字段里集合的原始数量），顶层数组用 `collection_count`；JSONL 用 `skipped_records` 记录没导出的记录数。正在写入的残行、空文件和读失败只体现在回执里，不会生成空文件，单个不可读文件也不影响其他证据。

ZIP 不包含 ledger、配置文件、私钥、登录 Cookie 或媒体文件。处理证据里 `title`、`current_asset_name` 整值换成 `<media>`，`path` 整值换成 `<path>`，资产编号和错误信息保留。访问日志只保留 `/api/…`、`/healthz` 与媒体路由，其他路径写成 `<path>`，查询串整体删除。

不启动服务也能导出：`python -m peach.support_bundle` 写出 `peach-support-<UTC 时间戳>.zip`，落在第一个可写的日志目录；带一个目标路径参数时写到该路径，要求文件不存在。

## 后台导出

刮削明细和完整诊断都走后台任务，页面轮询同一个状态。

| 接口 | 行为 |
| --- | --- |
| `GET /api/diagnostics/exports` | 当前任务快照；一次都没跑过返回 `{"status": "idle"}` |
| `POST /api/diagnostics/exports` | 请求体 `{"kind": "support" 或 "scraping", "codes": "…"}` 启动一次导出 |
| `POST /api/diagnostics/exports/{identity}/cancel` | 取消正在进行的导出 |
| `GET /api/diagnostics/exports/{identity}/download` | 下载已完成的 ZIP |

- `kind` 不合法返回 400「请选择诊断报告或刮削记录」；已有任务在跑或正在取消返回 400「已有诊断导出正在进行，请等待完成或取消」。
- 番号按空白、逗号、顿号、分号切分，转大写去重后逐个校验，必须匹配 `[A-Z0-9][A-Z0-9_-]{1,63}`，最多 20 个，否则 400「请填写有效番号，单次最多 20 个」。番号只当编号用，不拼成路径。
- 状态取 `running`、`cancelling`、`complete`、`cancelled`、`failed`；进度字段为 `stage`、`done`、`total`、`files`、`rows`；完成时带 `bytes` 与 `download_url`。
- 取消时任务先转 `cancelling`，后台线程看到标记后停下并记为 `cancelled`；标识对不上或任务已结束返回 409「导出任务已变化，请刷新后重试」。
- 下载标识必须是 32 位十六进制，且对应当前已完成的任务，否则 404「导出文件尚未就绪，请重新生成」或「导出任务未取得」；文件名为 `peach-support.zip` 或 `peach-scraping.zip`，响应头 `Cache-Control: no-store`。
- 产物写在 `generated/diagnostic-exports/`：先写 `<identity>.part`，成功后改名 `.zip`；开始新一轮会删掉上一份 ZIP，服务重启后需要重新生成。

`support` 导出复用诊断包；`scraping` 导出按番号收集来源字段、候选、当前归属与复核决定，只读现存资料。

## 浏览器错误上报

`POST /api/diagnostics/client-error` 需要同源和有效登录凭据（浏览器口令会话同样有效），否则 401。

- 请求体上限 16 KiB，超出返回 413「错误记录过长」；不是合法 JSON、不是对象或缺少字符串 `message` 时返回 400「错误记录格式无效」或「错误记录缺少原因」。
- 只接受白名单字段：`message`、`stack`、`kind`、`page`、`source_file`、`error_name` 各截断到 6000 字符；`line`、`column` 只收非负整数；`bundle_debug_ids` 只保留正式前端包名下 36 字符的值；User-Agent 截断到 512 字符。
- `kind` 为 `context` 时只记浏览器环境：同一份环境每分钟写一条，重复时不再写日志并返回 `recorded: false`。
- 其他错误每分钟最多 20 条，超出返回 429「错误记录过于频繁」。
- 带 `playback` 快照的提交写一条 `browser` 记录，快照只留白名单字段（错误码、网络与就绪状态、播放位置、时长、音量、倍速、视频尺寸、资产编号，以及只匹配媒体路由的请求摘要）；不带快照时额外写一条 `browser-context` 环境记录。
- 日志写不进去时返回 503「错误日志无法写入」。

## 媒体工具

本机诊断的 FFmpeg／OpenSSL 项会执行三个工具：ffmpeg 与 ffprobe 来自配置的 FFmpeg 目录，openssl 从 PATH 里找。执行成功时给出路径、来源与解码器清单；FFmpeg 缺少 AV1 软件解码器时报出「FFmpeg 缺少 AV1 软件解码器」并建议更新媒体工具。诊断包里的 `media_tools` 是同一份探测结果，健康检查则只看路径是否找到。
