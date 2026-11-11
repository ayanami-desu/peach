# 运行与配置

这篇讲已经跑起来的 Peach 怎么照料：数据放在哪、网盘怎么接、健康检查怎么读、出问题从哪里看。服务器上的部署与升级见[服务器部署与升级](DEPLOYMENT.md)，容器变量与挂载见 [Docker 部署](DOCKER.md)。

## 数据目录

Peach 的全部状态在一个数据根里：

- 容器里固定是 `/data`（镜像设了 `PEACH_DATA_ROOT=/data`）
- 直接运行时先看 `PEACH_DATA_ROOT`；没有这个变量就从当前目录逐级往上找第一个存在的 `<上级>/peach-data`。源码树里就是项目根旁边的 `peach-data`

搬机器、换容器、扩盘都只搬这一个目录。它下面八个子目录由 `peach init` 与首次设置建出：

| 目录 | 内容 |
| --- | --- |
| `database` | `ledger.db` 账本，以及 `ledger.pre-*.db` 备份 |
| `generated` | 缩略图、封面派生件、抽帧、外链副本，见[媒体缓存](MEDIA_CACHE.md) |
| `sources` | 资料源抓取留下的页面 |
| `state` | 运行期标记与运行偏好，例如 `data-root.txt` |
| `secrets` | 访问策略、设备记录、网盘令牌 |
| `logs` | `errors-<pid>.log` |
| `tools` | 外部工具落地位置，例如 `tools/ffmpeg` |
| `review` | 人工复核的中间产物 |

设置文件里的 `[directories]` 可以把其中任一项换成绝对路径（例如把 `generated` 放到大盘上）。换完要自己保证那份数据也随容器保留——容器里相对路径都落在 `/data` 下。

## secrets 里有什么

| 文件 | 内容 | 注意 |
| --- | --- | --- |
| `access.json` | 访问策略：`mode`（`password` 或 `open`）、`revision`、签名密钥、scrypt 盐与摘要 | 删掉它等于回到旧口令模式 |
| `browser-sessions.json` | 每台已登录设备一行：令牌摘要、设备简称、来源网段、时间 | 删掉等于把设备全部登出 |
| `auth-token` | 旧口令，`peach token` 打印的就是它 | 只在没有 `access.json` 时用于首次登录 |
| `drive-accounts.json` | 两个网盘的 refresh token、access token 与到期时间 | 权限 `0600`；被替换即要重新授权 |

这个目录是整个数据根里最敏感的：拿到 `drive-accounts.json` 等于拿到网盘读权限。备份时按备份密钥对待，别放进同步盘或仓库。

## 设置文件

`<数据根>/config.toml`。可以由 `peach init`、首次设置页或设置页直接写，也可以手写；保存后看护进程会重启服务读到新值，手改则重启服务。写错的键会在启动时报出具体路径，例如 `[drive.accounts.gdrive] 的 client_id 与 client_secret 都要填`。

```toml
[directories]
# 省略就是数据根下的同名目录，可写绝对路径

[drive]
# 网盘授权的回调基址，必须 https
public_url = "https://peach.example.com"

[drive.accounts.gdrive]
client_id = "…apps.googleusercontent.com"
client_secret = "…"

[drive.accounts.onedrive]
client_id = "…"
client_secret = "…"

[drive.roots]
# 远端目录 id，不是路径；留空（删掉这一行）表示扫该账号的根目录
gdrive = ["1AbCdEfGhIjKlMnOpQrStUvWxYz"]

[drive.modes]
# 取字节方式，只有 OneDrive 可选 redirect；写默认值等于删掉这一行
onedrive = "proxy"

[server]
# 只影响直接运行的 peach serve；容器里由入口参数决定
host = "127.0.0.1"
port = 8900
```

接受哪些键是固定的：`[drive]` 只认 `public_url`、`accounts`、`roots`、`modes`，`[drive.accounts.<网盘>]` 只认 `client_id` 与 `client_secret`，`[media]` 只认 `libraries`、`library_icons`、`library_catalog`。多写一个键会被拒绝并列出来，不会静默忽略。

## 申请网盘 OAuth 客户端

两个网盘各自一套客户端凭据，回调地址都由 `[drive] public_url` 拼出来：

```text
<public_url>/oauth/gdrive/callback
<public_url>/oauth/onedrive/callback
```

`public_url` 必须是 https 地址，且与浏览器实际访问的域名一致。网盘后台登记的回调地址要和上面逐字符相同，否则授权会在网盘一侧直接报 `redirect_uri_mismatch`。

### Google Drive

1. 在 Google Cloud Console 建一个项目，在「API 和服务 → 库」里启用 **Google Drive API**
2. 配置 OAuth 同意屏幕；应用处于「测试」状态时，只有加进测试用户的账号能授权
3. 「凭据 → 创建凭据 → OAuth 客户端 ID」，应用类型选 **Web 应用**
4. 「已获授权的重定向 URI」填 `https://<你的域名>/oauth/gdrive/callback`
5. 把 client ID 与 client secret 填进 `[drive.accounts.gdrive]`

Peach 请求的范围是 `https://www.googleapis.com/auth/drive`，授权时带 `access_type=offline` 与 `prompt=consent`，所以能拿到长期有效的 refresh token。范围开得这么大是因为 `drive.file` 只能看到本应用创建的文件，看不到你自己上传的存量。

### OneDrive

1. 在 Microsoft Entra 管理中心「应用注册」新建一个应用，账户类型按需要选（代码走 `common` 端点，单租户与多租户都行）
2. 「证书和密码」里新建客户端密码，记下值——它只显示一次
3. 「API 权限 → 添加权限 → Microsoft Graph → 委托的权限」勾 **`Files.ReadWrite.All`** 与 **`offline_access`**；企业租户还需要「代表组织授予管理员同意」
4. 「身份验证 → 添加平台 → Web」，重定向 URI 填 `https://<你的域名>/oauth/onedrive/callback`
5. 把应用程序（客户端）ID 与密码填进 `[drive.accounts.onedrive]`

`offline_access` 不能省，少了它只拿到一小时有效的 access token，Peach 会在刷新时被判为需要重新授权。

## 授权与扫描根

`GET /api/drive` 给出两个来源的当前状态，每个来源有三个字段判断到哪一步：`configured`（凭据齐了没有）、`connected`（授权还有效吗）、`last_error`（最近一次同步为什么失败）。设置页的网盘状态读的就是这一份。

- **授权**：`POST /api/drive/<网盘>/authorize` 返回一个网盘侧的授权地址，浏览器带过去同意后回跳 `/oauth/<网盘>/callback`。这个回调不查登录态，靠一次性的 `state` 认领，有效期 15 分钟；过期或对不上时报「授权回执已过期，回到设置页重新发起授权」，重新发起一次即可。
- **扫描根**：`POST /api/drive/<网盘>/roots` 整条替换扫描根，外层的 `GET /api/drive/<网盘>/folders?parent_id=` 用来逐层列远端目录。存下来的是**远端目录 id**，不是路径；一个来源可以选多个目录，空数组表示从账号根目录开始。写入会同步改 `config.toml` 的 `[drive.roots]`，并清掉这一来源的增量游标——游标只认「哪些文件变了」，留着它新选中的目录要等最长一天才进账本。所以换完扫描根，下一轮是整棵重扫。
- **立即同步**：`POST /api/drive/<网盘>/refresh` 让这个来源在下一轮先做，返回它同步后的状态。
- **取流方式**：`POST /api/drive/<网盘>/mode` 改这个来源怎么把字节交到浏览器，写入 `config.toml` 的 `[drive.modes]`。`redirect` 只给 OneDrive 用：播放时返回 302，浏览器自己去网盘的预授权地址取，不占服务器流量；`proxy` 让 Peach 按 Range 去网盘取再转发，占服务器流量，但网盘地址不出现在浏览器里。Google Drive 的字节必须带着 Bearer 取，令牌不能交给浏览器，所以它只有 `proxy` 一种。设置页「数据来源」里的「改用这个」调的就是这个接口，改完立刻重建驱动实例，不用重启。
- **断开**：`DELETE /api/drive/<网盘>` 删掉令牌并清空该来源的扫描根。账本里已经扫到的条目不动，它们会因为没有可用的驱动而进不了播放。

```sh
curl -s http://127.0.0.1:8900/api/drive | jq .          # 两个来源的 configured / connected / last_error
curl -s -X POST http://127.0.0.1:8900/api/drive/gdrive/authorize | jq -r .url
```

这几个接口都在本机上带登录态调用，或在容器里用 `curl http://127.0.0.1:8900/...`。

同一时间只同步一个来源：限流按账号算，几个来源并发只会更早撞上配额。

## 同步节拍

- 每 15 分钟追一次增量：Drive 走 `changes.list`，OneDrive 走 Graph delta
- 超过 24 小时没做过全量核对就整棵重扫一次，用来发现增量看不到的删除
- 循环每 60 秒醒一次，醒来只做被点名的来源
- `POST /api/drive/<网盘>/refresh` 把某个来源点名为下一轮先做，不等 15 分钟

同步失败不中断循环：这一轮不改账本，来源上记下错误（界面显示为「最后错误」），下一轮重试。日志里是 `同步 <网盘> 失败：<原因>`，按[常见故障](#常见故障)对号。

## 播放

播放不经过转码，本机也不留副本：

- OneDrive 给的是预授权下载地址，Peach 直接 302 把浏览器送过去，字节不经过 Peach
- Google Drive 的 `files.get?alt=media` 需要 Bearer 令牌，由 Peach 转发请求，客户端的 `Range` 原样带给上游，响应头 `content-length`、`content-range`、`accept-ranges`、`etag`、`last-modified` 透传

能不能播取决于浏览器自己认不认这个容器与编码。挑片子时看详情页的格式信息，不要指望服务端补。缓存目录与清理见[媒体缓存](MEDIA_CACHE.md)，外部播放器见[外部播放器](EXTERNAL_PLAYERS.md)。

## healthz 判读

`/healthz` 有两个版本，区别只在 `?ready=1`：

```sh
curl -s http://127.0.0.1:8900/healthz | jq .        # 概览
curl -s -o /dev/null -w '%{http_code}\n' 'http://127.0.0.1:8900/healthz?ready=1'
```

概览版永远返回 200，字段含义：

| 字段 | 读法 |
| --- | --- |
| `checks.database` | `status` 是 `ok` 表示账本能以只读方式打开并读到资产表 |
| `checks.schema` | 已登记的迁移与程序里的迁移是否一致；`pending` 说明该升级，`mismatch` 说明校验和对不上 |
| `checks.configured` | `config.toml` 是否存在且能解析 |
| `checks.drives` | 两个网盘的授权与最近一次同步状态 |
| `checks.security` | 访问策略与口令相关的问题 |
| `checks.ffmpeg` | `ffmpeg`/`ffprobe` 是否可用及其来源 |
| `db` | `available`、`empty`、`missing`、`unavailable` 四选一 |
| `ffmpeg` | 找到的可执行文件来源，找不到是 `unavailable` |
| `drive` | `{"gdrive": true, "onedrive": false}` 这样的已连接布尔值 |
| `configured` | 这台机器配过没有 |

`ready=1` 版只回答「服务现在能不能用」，状态码 200 或 503：

| `checks` 项 | 为真表示 |
| --- | --- |
| `configured` | 设置文件在 |
| `web` | 页面文件 `web/index.html` 在 |
| `database` | 账本可读（能查到 `asset` 表） |
| `schema` | 迁移全部应用且校验和一致 |
| `background` | 账本后台服务已就绪（只在当时已有结论时出现） |

容器里 `HEALTHCHECK` 打的就是 `?ready=1`，所以容器 unhealthy 时先手工请求这一条看哪项是 `false`。全部为真才是 200。首启未设置时固定返回 `{"ready": true, "setup": true}`，这是设计如此，不是异常。

检查项失败的具体原因与修法在设置页「诊断」里，逐项说明见[日志与诊断](DIAGNOSTICS.md#健康检查)。

## 访问控制

- `secrets/access.json` 的 `mode` 是 `password` 时，浏览器要用访问密码登录；是 `open` 时能连上就能进
- 没有 `access.json` 时退回旧口令模式：本机执行 `peach token` 拿到口令登录，登录后到设置页设置访问密码
- `access.json` 存在但读不出来时一律拒绝访问，不会退化成免登录
- 登录失败限速：同一来源 60 秒 10 次
- 每次保存访问设置都会换一次 `revision` 并清空设备记录，已登录的设备需要重新登录

来源怎么算取决于 `PEACH_TRUSTED_PROXIES`：受信代理转发时取 `X-Forwarded-For` 最左一个有效 IP，没有它时取 `CF-Connecting-IP`，其余连接一律按 TCP 源地址。规则细节见 [Docker 部署](DOCKER.md#受信任反向代理)。

## 备份与恢复

账本是最难重建的东西：网盘里的文件还在，但标签、评分、播放列表、关注与索引全在这一个 SQLite 文件里。备份都放在 `<database>` 目录，名字是 `ledger.pre-<用途>-<时间>.db`：

| 用途 | 什么时候写 |
| --- | --- |
| `manual` | 设置页「立即备份」 |
| `migrate` | `peach migrate upgrade` 写入之前 |
| `restore` | 从备份恢复之前，先把当前账本另存一份 |

保留规则：最近 5 份留着、不满 24 小时的留着、比当前账本更新的留着，三条都不成立才删（连 `-wal`/`-shm` 一起删）。当前账本 `integrity_check` 不是 `ok` 时拒绝清退任何一份，那正是该回滚的时候。

恢复在设置页「账本备份」里做：选一份、确认，恢复经 SQLite 的 Backup API 直接写进在用的账本，期间写一个 `ledger.restore.json` 标记。恢复被中断（断电、容器被杀）时，下次启动看到这个标记会把它收拾掉并在界面报「上次从备份恢复被中断」。

整卷备份见[服务器部署与升级](DEPLOYMENT.md#升级)的打包命令。备份与账本等大，`generated/` 里都是可重建的缓存，不必进备份。

## 升级后的自动处理

容器与源码运行都一样：服务在拉起 `peach serve` 之前先跑 `peach migrate upgrade --yes`。

- 迁移成功：账本结构跟到最新，旧的迁移前备份留在 `database` 里
- 迁移失败：进程退出并打印 `数据库升级失败，退出码 N；服务未启动`，账本保持迁移前状态
- 有 `config.toml` 却没有 `database/ledger.db`：报 `已有配置但缺少数据库，请恢复数据库后启动`
- 有 `ledger.db` 却没有 `config.toml`：报 `已有数据库但缺少配置文件，请恢复 config.toml 后启动`

后两条是在拦「半个数据目录」：把备份里的 `config.toml` 与 `ledger.db` 配齐再起，别只搬其中一个。

只想看有没有待应用的迁移，不动数据：

```sh
peach migrate status        # 已应用数量、待应用项与校验和异常，只读
```

手工升级要显式确认，命令对在用账本不给 `--yes` 时会直接拒绝（`refusing to modify the real ledger without --yes`），不会顺手改掉生产账本。真跑起来会先写 `ledger.pre-migrate-<时间>.db`，再逐条应用并打印 `backup:` 与已应用的版本号。

## 从源码运行（Windows、macOS）

服务器上用容器，本机想看代码跑起来的样子用这条路。前置是 Python 3.14 以上，以及 [uv](https://docs.astral.sh/uv/)；媒体相关的探测还要一个 `ffmpeg`（`ffprobe` 在同一个包里），装在 `PATH` 上或放到 `<数据根>/tools/ffmpeg`。

```sh
uv sync --locked --all-extras                      # 装依赖与项目本身
npm --prefix frontend ci && npm --prefix frontend run build   # 生成 web/dist
uv run peach init                                  # 建数据目录与 config.toml
uv run peach serve                                 # 默认 127.0.0.1:8900
```

Windows 上把 `npm`、`uv` 换成对应的 `npm.cmd`、`uv.exe` 即可，命令与参数一致；PowerShell 里多行用反引号续行。第一次打开时还没有访问密码，用 `uv run peach token` 打印的口令登录，然后到设置页设置访问密码。

`peach serve` 的常用参数：`--host`、`--port`、`--db`（换一份账本）、`--setup`（强制显示首次设置）。`--no-auth` 只在监听回环地址时可用，用在别的地址上会拒绝启动。改完代码重启 `peach serve` 就够了，前端改动要重新跑一次 `npm --prefix frontend run build`。

测试入口、依赖锁与选域见[测试与依赖](TESTING.md)。

## 日志与诊断

- 应用日志：`<数据根>/logs/errors-<pid>.log`，每行一条 JSON，保留 183 天，按月归档成 `<名字>.until-<最后写入日期>.log`，进程退出时回收空的进程日志
- 容器输出：`docker compose logs peach`，切分由 `PEACH_LOG_DRIVER` 一组变量控制
- 设置页「诊断」有十项检查（数据目录可写、端口、后台任务失败、来源可达性等）
- 诊断包：设置页导出，或 `python -m peach.support_bundle [目标路径]`（不启动服务也能导出），落在第一个可写的日志目录
- 每个 500 响应带 `X-Peach-Error-ID`，用它在日志里定位那一次请求

格式、脱敏与诊断包内容见[日志与诊断](DIAGNOSTICS.md)。数据管理页可以清掉已归档日志、数据库备份与可重建缩略图，范围见[媒体缓存](MEDIA_CACHE.md#清理)。

## 常见故障

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 发起授权报「没有配置回调基址，先填 [drive] public_url」 | `[drive] public_url` 为空 | 填对外域名后重启服务 |
| 网盘侧报 `redirect_uri_mismatch` | 后台登记的回调地址与 `<public_url>/oauth/<网盘>/callback` 不一致 | 两边改成逐字符一致 |
| 回调页报「授权回执已过期，回到设置页重新发起授权」 | `state` 超过 15 分钟、或换了网盘、或服务重启过 | 重新点授权 |
| `/api/drive` 返回 401 | refresh token 失效：密码改过、权限被撤、账号被停用 | 重新授权；企业租户检查管理员同意 |
| 界面显示「最后错误：…403…」 | 应用没有该目录的读权限，或管理员收紧了组织策略 | 换有权限的目录，或补 `Files.ReadWrite.All` 的同意 |
| 播放返回 `{"error": "unavailable"}` | 网盘侧文件已删、被移出扫描根、或授权失效 | 看该来源的最后同步时间，先刷新再重试 |
| 播放返回 `{"error": "no such id"}` | 账本里没有这条资产，链接过期 | 从列表重新进入 |
| 一轮同步变慢、日志出现 429 | 网盘限流 | 少选扫描根、别频繁触发立即同步，等下一轮 |
| `healthz?ready=1` 返回 503，`schema` 为 false | 迁移没跑成功 | 看启动日志的 `数据库升级失败`，按[升级后的自动处理](#升级后的自动处理)处理 |
| 页面上所有请求都被限速 | 反代地址没写进 `PEACH_TRUSTED_PROXIES`，全站共用一个来源计数 | 补上反代网段或地址 |
| 起服务报 `设置文件已存在，加 --force 才覆盖` | `peach init` 第二次跑 | 加 `--force`（会覆盖配置），或直接改设置页 |
| 起服务报「已有数据库但缺少配置文件」 | 只搬了 `ledger.db` | 把 `config.toml` 一起放回去 |

日志里没有的东西，去设置页「诊断」看十项检查，或者导一份诊断包——里面已经带上版本、迁移状态、网络可达性与最近的错误事件。
