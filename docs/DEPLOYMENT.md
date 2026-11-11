# 服务器部署与升级

Peach 只以两种形态分发：Docker 镜像，以及源码树里直接运行。服务器上用镜像。容器内部怎么配（卷、端口、日志、健康检查）见 [Docker 部署](DOCKER.md)，接网盘、备份与排障见[运行与配置](OPERATIONS.md)。

## 容器里跑什么

入口是 `python -m peach.server`。这个进程是看护进程：读设置文件、跑数据库迁移，再拉起真正的服务 `peach serve`。设置文件被改动后它重启子进程，所以在浏览器里保存配置不需要重启容器。

服务在容器内监听 `0.0.0.0:8900`，宿主机端口由 Compose 映射。Peach 不讲 TLS：容器只提供 HTTP，域名与证书由反向代理负责。镜像里的运行用户是 `peach`（uid/gid 1000），工作目录 `/data`。

## 要保管的东西

| 位置 | 内容 | 丢了的后果 |
| --- | --- | --- |
| `/data` | 数据根：`config.toml`、`database/ledger.db`、`secrets/`、`logs/`、`generated/` | 账本、配置与网盘令牌一起没了，重新授权并重扫才能恢复 |
| 8900 | 容器内监听端口 | — |

Compose 把 `/data` 挂成命名卷 `peach-data`。`docker compose down -v` 会连卷一起删掉；升级做 `pull` 与 `up -d`。

## 准备

- Docker Engine 与 Compose v2，`docker compose` 子命令可用
- 磁盘：账本起步一百多 MB，每份备份与账本等大，`generated/` 随浏览增长
- 一个指向这台机器的域名，以及一层终止 TLS 的反向代理
- 容器以 uid/gid 1000 运行；挂进容器的宿主目录要让这个用户读得到

## 起容器

把 `compose.yaml` 放到服务器上的一个目录，旁边按需放 `.env`：

```sh
# .env
PEACH_VERSION=edge
PEACH_BIND=127.0.0.1
PEACH_PORT=8900
```

```sh
docker compose up -d
docker compose logs -f peach
```

日志里出现 `Peach 服务监听：0.0.0.0:8900。` 与 `首次设置：用浏览器打开服务的地址，按页面完成设置。` 就说明进程起来了。用浏览器打开映射后的地址，按页面完成首次设置；容器里不出数据目录、监听地址与端口这三题，它们在建容器时已经定死。

`/healthz?ready=1` 在设置完成之前返回 200 与 `"setup": true`，所以首次设置期间容器不会因为健康检查失败被标成 unhealthy。各字段怎么读见[运行与配置](OPERATIONS.md#healthz-判读)。

## 升级

```sh
docker compose pull
docker compose up -d
```

镜像里的看护进程在拉起服务之前先把账本迁到最新结构（`peach migrate upgrade --yes`），迁移前自动留一份 `<数据库目录>/ledger.pre-migrate-<时间>.db`。迁移失败时容器不启动，日志里是 `数据库升级失败，退出码 N；服务未启动`；`restart: unless-stopped` 会让它反复重启，先看日志定位，不要放着不管。

升级前先备份：设置 → Peach 配置 → 应用与维护 →「立即备份」，或者在宿主机上整卷打包：

```sh
docker run --rm -v peach-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/peach-data-$(date +%F).tgz -C /data .
```

## 回滚

镜像换回旧标签只需要改一个变量：

```sh
# .env
PEACH_VERSION=sha-3f2a1b4
docker compose up -d
```

数据库迁移只向前，不随镜像回退。如果新版本已经升级过账本结构，回退镜像之前要先把账本换回升级前的备份：

```sh
docker compose stop peach
docker compose run --rm --entrypoint sh peach -c \
  'rm -f /data/database/ledger.db-wal /data/database/ledger.db-shm && \
   cp /data/database/ledger.pre-migrate-20261111-101500.db /data/database/ledger.db'
docker compose up -d
```

备份文件名与库同级，用 `ls /data/database` 看确切时间戳。换完账本再起旧镜像，顺序反了旧进程会先按新结构读一次。

## 镜像发布体系

`.github/workflows/docker.yml` 在推送到 `master` 且改到镜像相关路径时触发，也可以手动 `workflow_dispatch`：

1. 构建候选镜像 `longmeidao/peach:test`
2. 用 `scripts/smoke_docker.py` 起一个临时容器做启动验收
3. 推到 `ghcr.io/<仓库所有者>/peach` 的 `master` 与 `sha-<提交前 7 位>` 两个标签

构建平台只有 `linux/amd64`。`compose.yaml` 默认从 Docker Hub 拉 `longmeidao/peach:${PEACH_VERSION:-edge}`；要跟着本仓库的流水线走，把 `image` 行改成 `ghcr.io/<所有者>/peach:${PEACH_VERSION:-master}`，`PEACH_VERSION` 填 `sha-...`。私有仓库的 GHCR 包需要在服务器上先 `docker login ghcr.io`。

每次升级都只改 `PEACH_VERSION`，这一行同时就是回滚开关。

## 公网访问

- 默认只把端口绑在 `127.0.0.1`（`PEACH_BIND`），反代跑在同一台机器上。反代在另一台机器时改成 `0.0.0.0`，并用防火墙限定来源。
- TLS 终止在反代上。`[drive] public_url` 要填对外域名，网盘后台登记的回调地址就由它拼出来；两者不一致时授权会带着 `redirect_uri_mismatch` 失败。
- 反代地址要写进 `PEACH_TRUSTED_PROXIES`，否则登录限速按连接源统计，容器看到的所有请求都来自 Docker 网关，等于全站共用一个计数桶。判读规则见 [Docker 部署](DOCKER.md#受信任反向代理)。
- 访问密码在首次设置时确定，或由建容器时的 `PEACH_ACCESS_PASSWORD` 预置；改密码在设置页「网络与访问」。
