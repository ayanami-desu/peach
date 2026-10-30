# 服务器部署与更新流程

本文档说明 Peach 在 Linux 云服务器与私有服务器上的 Docker 容器化部署架构、镜像体系及标准的版本更新与回滚步骤。

## 一、部署形态与架构

Peach 在服务器环境下以独立 Docker 容器形态运行，通过 Docker Compose 进行服务生命周期管理。

### 1. 网络与端口映射

* **内部监听**：容器内 Web 服务固定监听 `0.0.0.0:8900`。
* **端口发布**：宿主机端口默认发布至回环地址 `127.0.0.1:8900:8900`。
* **外部接入**：公网访问通过反向代理（如 OpenResty 或 Nginx）配置反向代理与 SSL 证书，不直接暴露原始服务端口。
* **可信代理（反向代理部署必配）**：经 OpenResty 或 Nginx 访问时，把代理那一跳的地址写进 `PEACH_TRUSTED_PROXIES`；容器看到的连接源是 Docker 网关（用 `docker network inspect peach_default` 查到后填入）。公网写入的同源检查、会话 Cookie 的 `Secure` 标记与登录限速都靠它，不配时在公网提交登录会 403。详见 [Docker 部署](DOCKER.md#受信任反向代理)。

### 2. 存储分界与数据持久化

* **数据卷 (`peach-data`)**：
  命名数据卷挂载到容器内部 `/data`，保存 SQLite 数据库、`config.toml` 设置文件、用户凭据与缩略图缓存等状态。该数据卷独立于容器生命周期，更新容器时保留该卷。
* **媒体挂载 (`/media`)**：
  宿主机媒体根目录（如网盘挂载点或本地磁盘路径）通过 bind mount 方式挂载至容器内部 `/media`。挂载设为只读模式 (`read_only: true`)，挂载传播模式设置为 `rslave`，以支持宿主机上外部挂载点的变动实时传递给容器。

### 3. 标准编排配置 (`compose.yaml`)

服务通常部署在 `/opt/peach/` 目录下，`compose.yaml` 内容形态如下：

```yaml
services:
  peach:
    image: ghcr.io/<owner>/peach:sha-<7 位短 SHA>
    init: true
    restart: unless-stopped
    stop_grace_period: 75s
    ports:
      - "127.0.0.1:8900:8900"
    environment:
      TZ: Asia/Shanghai
      # 反向代理那一跳（Docker 网关）的地址；不配时公网登录与配置写入会被同源检查拒绝。
      PEACH_TRUSTED_PROXIES: "<docker network inspect 查到的网关地址>"
    volumes:
      - peach-data:/data
      - type: bind
        source: /srv/media
        target: /media
        read_only: true
        bind:
          propagation: rslave

volumes:
  peach-data:
```

---

## 二、镜像发布体系

本 fork 只保留两条自动流程；继承自上游的 Test、Release、项目看板同步、Star History、Windows 覆盖升级验收已从分支移除：

1. **dev → 镜像**：推送到 `dev` 且改动落在镜像输入（`src/**`、`web/**`、依赖清单等）时，`Docker` 工作流构建 linux/amd64 镜像，用 `smoke_docker.py` 跑临时容器冒烟，然后推送 `ghcr.io/<owner>/peach:sha-<7 位短 SHA>` 与 `:dev`。
2. **master → 上游快照**：`同步上游` 工作流每天定时（也可手动触发）把 `peach-mitao/peach` 的 `master` 抄到本 fork 的 `master`，并在同一个提交里移除继承的工作流。手动提交到 `master` 会被下一次同步覆盖，代码改动一律落在 `dev`。
3. **版本号与 `edge` 标签**：`release.yml` 只在上游仓库运行，本 fork 不产生版本号标签；部署用提交 SHA 标签锁定。
4. **版本锁定原则**：生产部署环境的 `compose.yaml` 使用带有精准 commit 标识的 `sha-<7 位短 SHA>` 标签，不使用浮动的 `latest`，以保障服务更新的确定性与可追溯性。

---

## 三、标准更新流程

更新容器服务按以下步骤执行。

### 步骤 1：确认前置状态

登录服务器，核验当前容器状态与健康检查接口，确认无正在执行的前台长任务：

```bash
curl -f -s http://127.0.0.1:8900/healthz
docker logs --tail 20 peach-peach-1
```

### 步骤 2：备份编排配置

在更新 `compose.yaml` 之前，保留带有时间戳的备份文件，便于异常时快速恢复：

```bash
cd /opt/peach
cp compose.yaml compose.yaml.bak-$(date +%Y%m%d-%H%M%S)
```

### 步骤 3：更新镜像标签与拉取

修改 `compose.yaml` 中的 `image:` 字段，指向 CI 构建发布的最新镜像 SHA 标签，然后拉取新镜像层：

```bash
# 修改镜像标签
sed -i "s|image: ghcr.io/<owner>/peach:sha-.*|image: ghcr.io/<owner>/peach:sha-<new_sha>|" compose.yaml

# 预先拉取新镜像
docker compose pull
```

### 步骤 4：重建并启动容器

执行容器重建，Docker Compose 会自动替换旧容器并保留命名数据卷挂载：

```bash
docker compose up -d
```

### 步骤 5：验证服务健康状态

等待容器完成初始化（包含数据库连接建立与媒体挂载探测），核验健康状态：

```bash
# 检查容器状态（确认显示 healthy）
docker ps --filter name=peach

# 检查业务健康接口
curl -f -s http://127.0.0.1:8900/healthz
```

当 `/healthz` 返回 JSON 且各核心组件检查状态均为 `"status": "ok"` 时，即代表更新完成。

---

## 四、故障回滚流程

若新镜像启动失败或在健康检查时返回异常：

1. **还原编排配置**：
   ```bash
   cd /opt/peach
   cp compose.yaml.bak-<timestamp> compose.yaml
   ```
2. **重启历史版本容器**：
   ```bash
   docker compose up -d
   ```
3. **核验证实服务恢复**：再次请求 `/healthz` 接口确认旧版本容器已恢复正常服务。

---

## 五、维护注意事项

* **数据卷保护**：命名卷 `peach-data` 包含唯一真相源账本与配置，严禁执行 `docker compose down -v` 或删除数据卷操作。
* **数据库迁移**：涉及数据库结构调整的改动，先确认迁移步骤；若未声明自动迁移，应在独立操作中按迁移指南执行。
* **派生产物管理**：缩略图缓存等派生文件存放在数据卷内的 `cover-thumbs/` 目录下。若废弃了某些规格的缓存变体，可在确认无用后在数据卷路径下针对特定文件名通配进行安全清理。
