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

Peach 采用基于 GitHub Actions 的持续集成与镜像发布机制：

1. **构建与临时验收**：代码推送到 GitHub 分支（如 `master` 或 `dev`）后，自动触发 `Docker` 工作流，在干净环境内完成依赖安装、 amd64 镜像构建以及 `smoke_docker.py` 临时容器冒烟验收。
2. **镜像标签规则**：
   * 提交 SHA 标签：`dev` 分支每次构建生成 `ghcr.io/<owner>/peach:sha-<7 位短 SHA>`，精准锁定特定代码提交。
   * 分支标签：同一份产物同时推 `ghcr.io/<owner>/peach:dev`；`master` 与 `v*` 标签的版本发布由 `release.yml` 负责（`edge` 与版本号），`Docker` 工作流只验收不发布。
3. **版本锁定原则**：生产部署环境的 `compose.yaml` 使用带有精准 commit 标识的 `sha-<7 位短 SHA>` 标签，不使用浮动的 `latest`，以保障服务更新的确定性与可追溯性。

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
