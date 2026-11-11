# Docker 部署

镜像用在单人 VPS 与 NAS 上：一个容器、一个数据卷、一个网页，配置全在浏览器里做。服务器上从部署到回滚的流程见[服务器部署与升级](DEPLOYMENT.md)。

## 镜像

- Docker Hub：`longmeidao/peach`，`compose.yaml` 默认用 `${PEACH_VERSION:-edge}`
- GHCR：`ghcr.io/<仓库所有者>/peach`，本仓库的流水线推 `master` 与 `sha-<7位>`
- 平台只有 `linux/amd64`

在本机改代码后重建：

```sh
docker compose build
docker compose up -d
```

`compose.yaml` 里 `build: .` 与 `image:` 同时存在：`docker compose build` 覆盖本地镜像，`pull` 走仓库。

## 首次启动

```sh
docker compose up -d
docker compose logs -f peach
```

容器起来后打开映射的地址。数据目录固定 `/data`、监听固定 `0.0.0.0:8900`，所以页面上只问网盘公网地址与访问密码。提交后服务自己重启成正常模式，不需要再动容器。

设置文件、账本、令牌都在 `/data`。重建容器不影响它们，删卷才会。

## Compose 变量

全部写在 `compose.yaml` 同目录的 `.env` 里，或直接导出到 shell。

| 变量 | 默认 | 作用 |
| --- | --- | --- |
| `PEACH_VERSION` | `edge` | 镜像标签 |
| `PEACH_BIND` | `127.0.0.1` | 宿主侧绑定地址 |
| `PEACH_PORT` | `8900` | 宿主侧端口，容器内固定 8900 |
| `PEACH_ACCESS_PASSWORD` | 空 | 首次启动前预置访问密码，8–256 个字符 |
| `PEACH_HEALTHCHECK_INTERVAL` | `30s` | 健康检查间隔 |
| `PEACH_HEALTHCHECK_TIMEOUT` | `5s` | 单次健康检查超时 |
| `PEACH_HEALTHCHECK_START_PERIOD` | `60s` | 启动宽限期 |
| `PEACH_HEALTHCHECK_RETRIES` | `3` | 连续失败多少次标 unhealthy |
| `PEACH_LOG_DRIVER` | `json-file` | 容器日志驱动，只能 `json-file` 或 `local` |
| `PEACH_LOG_MAX_SIZE` | `10m` | 单个日志文件上限 |
| `PEACH_LOG_MAX_FILE` | `3` | 保留几个日志文件 |

`docker compose config` 可核对展开后的结果。

## 卷与挂载

| 卷 | 挂载点 | 说明 |
| --- | --- | --- |
| `peach-data` | `/data` | 数据根，必须以卷的形式保留 |

媒体不在宿主机上：影片留在 Google Drive 或 OneDrive 里，容器只挂数据根一个卷。要留本机文件（备份、转存）自己再加一条 bind，容器不依赖它。

## 访问密码

首次设置里选。建容器时给 `PEACH_ACCESS_PASSWORD` 可以预置：只有 `<数据根>/secrets/access.json` 还不存在时生效，生效后从环境里删掉；已经设置过访问密码时它被忽略，日志里提示去设置页「网络与访问」改。

留空密码是允许的，那台服务就是免登录，只适合绑在回环地址后面的场景。密码策略与登录限速见[运行与配置](OPERATIONS.md#访问控制)。

## 受信任反向代理

`PEACH_TRUSTED_PROXIES` 决定 Peach 信不信转发头，默认 `127.0.0.1,::1`。取值是逗号分隔的 IP 或 CIDR，写错的一项不会授予信任（不会退回成"信任全部"）。显式写成空串则表示不信任任何代理。

- 连接来自受信代理时，客户端地址取 `X-Forwarded-For` 最左边一个有效 IP；没有这个头时取 `CF-Connecting-IP`。
- 其余连接一律按 TCP 源地址算，转发头不参与判断。
- 同一套判定也用在写请求的来源校验上：受信代理可以按它声明的 `X-Forwarded-Proto` 另算一个地址，别的连接声明的协议不算数。

容器部署时反代通常和 Peach 不在同一网络命名空间，容器看到的源地址是 Docker 网关。此时要把网关网段（按你自己的网络填，例如 `192.0.2.0/24`）或反代容器地址写进这个变量，否则登录限速会把全站算成一个来源。

## 日志

两处，别混：

- `docker compose logs peach`：容器的标准输出，含看护进程的启动行与 `peach serve` 的输出。切分由 `PEACH_LOG_DRIVER`、`PEACH_LOG_MAX_SIZE`、`PEACH_LOG_MAX_FILE` 控制。
- `/data/logs/`：应用自己写的 `errors-<pid>.log`，每行一条 JSON，脱敏后保留 183 天，按月归档成 `<名字>.until-<日期>.log`。数据管理页可以清掉已归档的部分。格式与脱敏规则见[日志与诊断](DIAGNOSTICS.md)。

## 健康检查

镜像自带：

```text
python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8900/healthz?ready=1', timeout=3).read()"
```

返回 200 算健康，503 算失败。`compose.yaml` 只覆盖节奏，不换命令；Dockerfile 里的默认值是 30s/5s/60s/3，与 Compose 的默认值一致。

`ready=1` 版本会在未完成首次设置时返回 200 与 `"setup": true`，所以设置期间不会一直 unhealthy。判读每个字段见[运行与配置](OPERATIONS.md#healthz-判读)。

## 镜像里已经有的工具

- **FFmpeg**：`ffmpeg` 与 `ffprobe` 在 `PATH` 上，用于读时长、抽帧与生成接触印相，不做转码。
- **人脸模型**：`/app/tools/face-models` 下的 `face_detection_yunet_2023mar.onnx` 与 `face_recognition_sface_2021dec.onnx`，路径由 `PEACH_FACE_MODELS` 指定，构建时校验 sha256。
- **amane 运行时**：构建阶段生成的 `/app/amane-runtime`，路径由 `PEACH_AMANE_RUNTIME` 指定，刮削侧经 amane 桥调用的站点见[采集与资料](SOURCING.md#资料源与解析器)。

镜像里已经设好的环境变量不用再传：`PEACH_DATA_ROOT=/data`、`PEACH_DISTRIBUTION=docker`、`PEACH_FACE_MODELS`、`PEACH_AMANE_RUNTIME`、`PYTHONUNBUFFERED=1`、`PYTHONIOENCODING=utf-8`、`PYTHONUTF8=1`。

## 容器里能跑的命令

```sh
docker compose exec peach peach status              # 账本构成与迁移版本
docker compose exec peach peach migrate status      # 只读检查待应用的迁移
docker compose exec peach peach token               # 打印访问口令（仅未设置访问密码时用得上）
docker compose exec peach python -m peach.support_bundle
```

`peach status` 在库不存在时退出码为 4。诊断包写出后落在容器内第一个可写日志目录，用 `docker cp` 取出来，或者直接在设置页点导出。
