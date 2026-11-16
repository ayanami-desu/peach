---
name: peach-fork-sync
description: 用户明确要求从 peach-mitao 上游按需摘取改动、发布镜像、更新 cloud-server 容器或清理同步产物时使用；不要主动同步。
---

# 上游按需同步与服务器更新

最后复核：2026-11-17
证据来源：ADR-0157 存储与播放转型后的分支偏离评估（2026-11-14 全量 rebase 含 31 个冲突停点）、2026-11-17 确立的「独立主干 + 按需摘取前端优化、前端结构性改动与刮削规则」策略，以及服务器 sha-72acee0 更新核验。

## 分支职责与上游关系

- 本仓库 `master` 是独立演进的唯一主干，直接承载网盘 API 直连形态与部署；不再把 `master` 全量 `rebase` 或 `merge` 到 `upstream/master`。
- `upstream/master` 仅作补丁参考源。同步不是例行任务：只有用户明确要求筛选或同步上游改动时才执行。
- `master` 只保留 `.github/workflows/docker.yml`（构建 `ghcr.io/<owner>/peach:sha-<7 位短 SHA>` 与 `:master`）；上游工作流一律不引入。仓库级 Actions 保持开启，关闭会连镜像产线一起停。
- `origin/master` 的跟踪 ref 可能过期；推送前用 `git ls-remote origin refs/heads/master` 核对真实值。

## 按需摘取上游改动

1. **筛选范围**：`git fetch upstream` 后，用 `git log --oneline --no-merges HEAD..upstream/master -- <路径>` 按三类高价值方向筛选候选提交，列出 SHA、摘要与适配点，经用户确认后再动手：
   - **前端性能优化**：轮询退避与按需查询、首屏与滚屏渲染、卡片估高与导航锚定、播放器缓冲/字幕/手势优化（`frontend/src/polling.ts`、`frontend/src/player/`、`frontend/src/history/`、`frontend/src/react/`）。
   - **前端结构性改动**：共用组件提炼（`frontend/src/react/components/`、`frontend/src/ui-kit/`）、详情编辑与多选交互重构、前端依赖与固定 vendor 升级、Node 脚本统一 `.ts` 化（`frontend/scripts/`、`scripts/vendor_web_dependencies.*`）。
   - **刮削与番号规则**：站点解析修复、番号识别与分类规则更新（`src/peach/metadata_*`、`src/peach/jav_*`、`src/peach/catalog_rules.py`）。
2. **排除范围**：上游针对桌面托盘、本地挂载与 NAS 目录定位、转码与 HLS、云下载（`downloads`）、关注/订阅/想要（`follow`/`wants`）、Mix、自动更新横幅（`client-updates`）、发版公告工作流，以及将中文拆入 `resources/locales` 与 `message_code` 的多语言改造，一律跳过。
3. **移植与适配**：在隔离工作树中用 `git cherry-pick -n <sha>`（或读取 `git show <sha>` 定向移植）：
   - 剥离已删除模块文件与 `resources/locales/*`；若上游改动把文案改成了语言包键，在移植时还原为本分支直接使用的中文文本。
   - 不引入上游的 `web/dist/*` 产物；构建产物不进 Git，在构建与测试流程中由 `npm --prefix frontend run build` 生成。
   - 依赖变动先执行 `npm --prefix frontend ci --ignore-scripts` 或 `uv sync --locked --all-extras`。
   - 路由与大函数核对复杂度棘轮（分支数到 30 须拆小或同批记入 `ACCEPTED`）；两边有效测试均保留，新测试文件登记进 `scripts/test_runner.py` 的 `SCOPES`。

## 验证与推送

- 按影响域运行 `./scripts/test.sh auto`（跨共享设施或依赖升级时跑 `full`），前端改动须通过 `npm --prefix frontend run typecheck`、vitest 与前端构建检查。
- 维护者交付在主检出执行 `git merge --ff-only <工作树分支>`，直接 `git push origin master:refs/heads/master` 推进主干，不改写已发布历史。
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
