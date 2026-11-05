---
name: peach-fork-sync
description: 同步 peach-mitao 上游到本 fork 的 master、发布镜像、更新 cloud-server 容器或清理同步产物时使用。
---

# fork 上游同步与服务器更新

最后复核：2026-11-05
证据来源：2026-11-05 的单分支调整与上游同步（72acee03、run 42001986938）及服务器 sha-72acee0 更新核验。

## 分支职责

- `upstream/master` 是上游事实。本 fork 只有 `master` 一条分支，直接叠加上 fork 改动并负责部署；同步一律变基到 `upstream/master`，不产生 merge 提交，也不维护快照分支。
- `master` 只保留 `.github/workflows/docker.yml`（构建 `ghcr.io/<owner>/peach:sha-<7 位短 SHA>` 与 `:master`）；继承自上游的工作流一律不进这条分支。仓库级 Actions 保持开启，关掉会连镜像产线一起停。
- `origin/master` 的跟踪 ref 可能过期；推送前用 `git ls-remote origin refs/heads/master` 核对真实值。

## 同步到 master

1. `git fetch upstream`，`git rebase upstream/master`。
2. 冲突判据：继承自上游的工作流（release、test、project-board、star-history、upgrade-smoke、ghcr-mirror、issue-intake 等）一律 `git rm`，`docker.yml` 保留 fork 版本；`web/dist/*` 不手工合并，每个提交用 `npm --prefix frontend run build` 重建后逐文件 `git add`；测试冲突两边用例都保留。
3. 依赖先就位：上游新增前端依赖时 `npm --prefix frontend ci --ignore-scripts`；主检出 `.venv` 与 `uv.lock` 不一致会让 `./scripts/test.sh` 拒跑，先 `uv sync --locked --all-extras`。
4. 路由代码合并后核对复杂度棘轮：函数分支数到 30 要么拆开，要么在同一次改动里记入 `ACCEPTED` 并写理由。
5. 变基完成后 `git diff <上次验收的提交> HEAD` 应只剩预期差异；不同则先查冲突解析。

## 验证与推送

- 至少 `./scripts/test.sh full`、`npm --prefix frontend run typecheck`、vitest；空跑 `checks` 不足以证明合并。
- 推送用显式租约：`git push --force-with-lease=refs/heads/master:<远端实测 SHA> origin master:refs/heads/master`。`--force-with-lease` 报 stale info 时先 `git ls-remote`，不要改成 `--force`。
- 推送触发 `Docker` 工作流；`gh run watch <id> --exit-status` 后核对 `conclusion=success` 与镜像标签，再动服务器。

## 服务器更新

1. 先确认没有主任务在跑：容器内 `/data/state/library-processing.json` 的 `status` 不是 active，`/data/state/job-recovery/*.json` 都是 complete。
2. `cd /opt/peach`，备份 `compose.yaml`，把 `image:` 改成新 `sha-<7 位短 SHA>`，`docker compose pull && docker compose up -d`。
3. 核验：`curl -fsS http://127.0.0.1:8900/healthz` 各检查项 ok，日志 `migrations: N, pending: 0`，`docker ps` 为 healthy；首页 303 是正常跳转。
4. 回滚靠本地旧镜像：把 tag 改回旧 sha 再 `up -d`。部署核验通过后再删 `compose.yaml.bak-*`。

## 清理

- 工作树必须同时满足无未提交改动、无存活进程、提交内容已在 `master` 才回收；`agent_worktree.py prune` 会保留 locked 工作树，旧任务的锁先 `git worktree unlock` 再 remove。
- 删除 `backup/*`、`agent/*` 临时分支前逐个确认 tip 的内容已进 `master`；`rm` 只列具体路径，不用 glob。
- 详情与命令以 [DEPLOYMENT.md](../../../docs/DEPLOYMENT.md) 的「镜像发布体系」为准；本文只记执行顺序与判据。
