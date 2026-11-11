# 测试与依赖

测试跑在 Python 的 unittest 上，由一个入口负责选域、准备环境、签发记录与分发分片。测试文件在 `tests/` 下；前端另有一套 vitest 与浏览器用例，由 `web` 域转交执行。

## 正式入口

两个平台各一个入口，契约相同：

```text
./scripts/test.sh auto
./scripts/test.sh checks
./scripts/test.sh media --fresh
./scripts/test.sh auto --resume
./scripts/test.sh web --focus tests/test_web_ui.py
powershell -File scripts\test.ps1 -Scope auto
powershell -File scripts\test.ps1 -Scope web -Focus frontend/test/keyboard-shortcut.test.ts
```

- `scripts/test.sh` 的第一个参数是域，其余参数原样透传给运行器；`scripts\test.ps1` 按参数名接收（`-Scope`、`-Fresh`、`-Resume`、`-Focus`、`-Base`、`-ShardIndex`、`-ShardCount`、`-Jobs`）。两边接受的域名集合一致。
- 不带域时按 `auto` 判域。
- 入口先定位 venv：本工作树有 `.venv` 就用它，否则用主检出（`git rev-parse --git-common-dir` 的父目录）那一份；随后设 `PYTHONPATH=src` 调 `scripts/test_runner.py`，并核对 `peach.__file__` 确实落在当前工作树的 `src/` 下，免得拿别处源码跑出绿结果来。
- `python -m unittest discover` 不能当验收结论：它不判域、不准备环境、不签发记录，也不排分片；验收只用 `scripts/test.sh` 或 `scripts\test.ps1`。只跑几条指定用例见[定向调试](#定向调试与局部记录)。

`scripts/test_runner.py --list-scopes` 打印运行器当前接受的域名。

## 测试域

域是 `scripts/test_runner.py` 里的 `SCOPES` 表：每行是一组测试文件名或通配，表本身是域名与文件归属的唯一来源。

| 域 | 覆盖 |
| --- | --- |
| `checks` | 仓库策略与文档层：文案、依赖清单、脚本策略、文档契约 |
| `catalog` | 目录、索引、资料页与库内操作 |
| `follow` | 关注源、订阅与抓取 |
| `media` | 媒体文件、探测与取流 |
| `metadata` | 刮削、识别与实体合并 |
| `packaging` | 打包与发布产物 |
| `tooling` | 仓库脚本与工具链 |
| `web` | 前端产物、界面用例与浏览器用例 |
| `core` | 核心运行时：配置、API 骨架、任务、错误上报 |

`full` 跑全部域并取得机器级全量锁。

`auto` 的判定过程：取相对 `--base`（默认 `master`）的改动文件，已提交、工作树与未跟踪文件都算；先按 `AUTO_SCOPE_FILES` 精确匹配文件名，再按 `AUTO_SCOPE_PREFIXES` 匹配路径前缀，命中的域全部选上。没有改动时只跑 `checks`；有文件落不进任何规则、或落在必须整体验证的面（依赖清单、构建配置、流水线定义一类）上时，跑 `full`。

同一个测试文件可以属于多个域，几个域一起选时文件只跑一次。新增测试文件要登记进 `SCOPES`：`tests/test_scripts.py` 有一项检查会列出不属于任何域的 `tests/test_*.py` 并失败。

## 环境与锁文件

- Python 依赖锁在 `uv.lock`，版本写在 `pyproject.toml`。入口调 `scripts/test_environment.py`：主检出的 `.venv` 是部署与本地服务共用的那一份，只读检查是否就绪；隔离工作树各自按 `uv sync --locked --all-extras --no-install-project` 同步一次，免得拿旧依赖跑新代码。同步失败退出码 3。
- 文档检查走 `uv run --locked --extra dev seiso check`；`dev` extra 里是 `filelock`、`ruff`、`seiso` 与测试用的 `httpx2`。
- 前端依赖锁在 `package-lock.json`：根目录那份供 `web/vendor/` 的第三方资源，`frontend/` 那份供构建与测试。装齐用 `npm ci`；`package.json` 里的版本精确钉住，不带范围符。
- 外部前置条件缺失按 `tests/support/conditions.py` 的 `missing_prerequisite` 处理：本机没有 Node、`frontend/node_modules`、ffmpeg 或浏览器时显式跳过；`GITHUB_ACTIONS` 或 `GITLAB_CI` 为 `true` 时判失败，因为那里缺前置条件是工作流写错，跳过会让用例永远不执行。
- 起分片之前有一次外部工具预检：只判本次域真的会用到的工具，用不到的只作提示。被权限挡住的工具会让本次运行退出码 3；确认与本次改动无关时用 `PEACH_SKIP_PREFLIGHT=1` 跳过预检，不要改测试或跳过用例。

## 运行记录与锁

- 记录写在主工作树的 `build/agent-verification` 下（由 `git-common-dir` 的父目录定位），一个仓库的所有工作树共用同一批记录。
- 一份记录的键是输入快照摘要：代码、依赖清单与环境指纹一起算。24 小时内、输入与范围都匹配的记录直接复用并打印一行说明，不重跑。`--fresh` 强制实际重跑。
- 正式运行取锁：`full` 先取全量锁 `full-suite.lock`，等待上限 1800 秒（`--lock-timeout`，取值 0 表示锁忙时立即返回）；再按状态摘要在同目录取一把 `<摘要>.lock`，同一状态的验证不会并行两轮。
- 锁忙时退出码 2，并打印持锁的一方与在跑的范围。
- 退出码：0 通过；1 有测试失败；2 锁忙或参数不合法；3 环境或外部工具不可用；4 验证期间输入改变，已保留未受影响的结果，用 `auto` 补齐。

## 分片与并行

- 本机：`--jobs auto` 按核数决定同时跑几个分片子进程，默认串行，正式入口传 `auto`。
- CI：`--shard-index` 与 `--shard-count` 让各片独立跑；`--shard-plan` 是父进程按耗时数据划好的逐片名单，`--timings` 回传每片的成败与逐用例耗时。不给计划时按文件名轮转。
- 分片不签发本机记录，只把成败与逐用例结果交回父进程汇总；每次运行不论串行还是分片，都照常写运行历史。
- `web` 域里既有纯粹读产物的断言，也有要跑 `tsc`、`oxlint`、`vitest` 与浏览器的容器用例，后者按阶段单独执行，不与其他文件混在同一批。

## 定向调试与局部记录

改一个模块时用 `--focus` 只跑相关用例，几秒到几十秒出结果：

```text
./scripts/test.sh auto --focus tests/test_drive_stream.py
./scripts/test.sh auto --focus tests/test_drive_stream.StreamTests
./scripts/test.sh auto --focus tests/test_drive_stream.StreamTests.test_proxy_forwards_range_and_passes_through_status
./scripts/test.sh web --focus frontend/test/keyboard-shortcut.test.ts
```

- 选择器给 `tests/` 下的文件、`模块.类` 或 `模块.类.方法`，`tests/` 前缀与 `.py` 后缀可省；也可以给 `frontend/test/` 下的一条 vitest 用例路径。
- `frontend/e2e/` 的浏览器用例由 `tests/test_web_e2e.py` 驱动：Python 这一侧造演示库、起服务并逐文件跑，默认不跑（`auto` 里会跳过），要显式开启 `PEACH_E2E=1 python -m unittest tests.test_web_e2e`，只跑几个文件时再加 `PEACH_E2E_ONLY`；`frontend/` 里的 `npm run e2e` 只按 `PEACH_E2E_FILES` 选文件，地址仍要由外部给的 `PEACH_E2E_ORIGIN` 提供。把 e2e 路径塞进 `--focus` 会被拒绝并提示这一点。
- 可重复给 `--focus`，也可以逗号分隔。
- 定向调试不签发记录，也不取机器级锁，因此不能当作验收凭据：验收要跑 `auto`、`checks`、`full` 之一并留下记录。
- 环境变量 `PEACH_TEST_FOCUS`、`PEACH_E2E_FILES`、`PEACH_VITEST_FILES` 只服务于内部转交；带着它们跑正式运行会被拒绝。
- 记下局部结果时使用运行历史：`scripts/test_history.py` 在 `build/test-history/YYYY-MM.jsonl` 里按月追加，先写一行运行头（范围、平台、提交、分支、工作树、是否 CI、涉及的文件），再逐条写非通过的用例与耗时不少于 5 秒的通过用例。写历史失败只告警，不影响测试判定。

## 测试怎么组织

- `tests/` 下每个文件是测试模块，`tests/support/` 放共用夹具与平台条件。
- 五个文件在每一个域里都跑，作为各域共用的地基：`test_context_budget.py`、`test_test_collection.py`、`test_complexity_ratchet.py`、`test_source_assertion_ratchet.py`、`test_python_lint.py`。
- 有 12 项秒级检查在起分片之前先跑一遍（脚本策略、文案终态、上下文预算、复杂度与断言棘轮、依赖策略、仓库卫生、前端预检一类），合计约一分钟；其中有一项不过就打印「快速门槛未通过，其余测试本轮不跑」并直接返回，免得等二十分钟才看到结论。
- 一轮跑完后失败的文件单独重跑一次，最多六个；失败面更大时多半是真回归，重跑只是再等一轮。
- 用例需要外部程序时调用 `tests/support/conditions.py` 的 `missing_prerequisite`，不要在本机缺前置时把整域拖红，也不要为了让它过而删断言。
- 每次运行的临时文件都落在本次专用目录（环境变量 `PEACH_TEST_RUN_TEMP`），结束时整个删掉；被强行结束的运行留下的目录超过一天由下一次运行清掉。错误上报的日志目录也指到临时目录，不写真实数据目录。
- 前端两层：`frontend/test/` 是 vitest（happy-dom），只把 `@peach/legacy/ui` 换成桩，其余别名指向真实源码，保证模块身份与生产一致；`frontend/e2e/` 是 playwright-core 驱动的浏览器用例，`harness.ts` 提供启动、访问与稳定等待。两者的验收命令见 [前端](FRONTEND.md#检查)。

## 来源录制回放

联网抓取的解析用例不现场访问站点：把一次真实查询的请求与响应录成 cassette，测试离线回放同一次查询。夹具在 `tests/fixtures/source-replay/<站点>/`。

- 匹配键是「方法 + 规范化 URL + 请求体哈希」，不比请求头；查不到抛 `ReplayMiss`，测试据此失败。回放传输不持有网络客户端，`Session` 的 `fetch`、`parse` 与分档逻辑一行不改。
- 文件只存回放需要的东西：响应留状态、最终地址与 `content-type`，不留 `Set-Cookie`；请求只存匹配键，请求头与 Cookie 不写盘。图片只留尺寸与哈希，回放时生成同尺寸灰图；视频只留字节数。
- 正文在录制时按 `minimize` 去掉与解析无关的区块，按 `redact` 把凭据值、CSRF 令牌换成固定假值 `PEACH-REDACTED`（短于 8 个字符的片段不替换，否则会误伤正文）。去之前与去之后各回放一次，解析结局不一致就不采用这一步。
- 结局是连接失败、冷却、预算、限流、验证页、封禁或地区限制的，不落成夹具，记为「未取得」。

录制（默认不带登录态；只有不登录拿不到作品页的站才加 `--with-credentials`，其中的 Cookie 值、CSRF 令牌与 `uid`、`formhash` 一类账号标识都换成固定假值）：

```text
python scripts/record_source_fixtures.py javbus:SSIS-001 avbase:SSIS-001
python scripts/record_source_fixtures.py --update javbus:SSIS-001
python scripts/record_source_fixtures.py --with-credentials javdb:SSIS-001
```

录制只读：不写账本，不写生产环境的来源冷却；代理设置与冷却记录从 `--secrets`（默认本机数据根的 secrets）复制进临时根再用，录制中撞出的新冷却只落在临时根。录制格式的版本是 `FORMAT = 1`，字段含义变化时才升。

## 文档与策略检查

这些脚本各有入口，多数由 `tests/` 下的用例带进正式运行，也能单独跑：

| 脚本 | 判据 |
| --- | --- |
| `scripts/check_copy_final_state.py` | 按 `scripts/copy-rules.json` 查 Python、HTML 与文档的文案 |
| `scripts/check_context_budget.py` | AGENTS.md、CLAUDE.md、SKILL.md 的行数与字节预算，「最后复核」日期 |
| `scripts/check_reference_updates.py` | 锁定快照与上游 Markdown 之间的漂移；来源按 `weekly`/`monthly`/`quarterly` 分档，钉版本依赖按 40 位 sha 记 |
| `scripts/check_commit_message.py` | `agent/*` 分支提交的 trailer 形态 |
| `scripts/check_ui_preview.py` | 用户验收预览的数据清单、记录来源与独立缓存 |

`scripts/check_readme_impact.py` 不是独立入口：它提供 README 安装契约与提交检查共用的 Git 读取。

`check_context_budget.py` 的退出码里 1 表示结构或预算不合规，3 表示只有「最后复核」过期、其余都合规。

## 每次发版检查

发版前的固定动作：

1. 跑一次全量：`./scripts/test.sh full`（Windows 用 `powershell -File scripts\test.ps1 -Scope full`），要求退出码 0。锁忙时等前一轮收尾，不要另起一次。
2. 发版结论只用这一次跑出来的结果：`full` 默认不复用旧记录，`--resume` 才会沿用已完成的证明。
3. 跑文档检查 `uv run --locked --extra dev seiso check --output-format=concise`，并核对 [变更日志](../CHANGELOG.md) 里已有本次的条目。
4. 对比构建产物与源码：`npm --prefix frontend run build` 之后要求 `git diff --exit-code web/dist` 为空。

## 流水线侧选测

流水线复用同一套运行器，选测逻辑分两个脚本，本机入口都不经过它们：

- `scripts/ci_scope.py` 用于主线选测：在当前分支最近 20 条成功流水线（`PIPELINE_WINDOW`）里找一条不是本次提交、且是本次提交祖先的作为已验证基线，输出基线提交与按平台划定的敏感用例，交给入口的 `--base` 与 `--focus`。取不到基线、基线不在当前历史上、改动落在流水线定义这类必须整体验证的面、或 `auto` 本身判定要 `full` 时，退回 `full`。
- `scripts/ci_plan.py` 按事件与改动文件生成作业矩阵与必需作业：改动只涉及文档时只排检查类作业，不装运行时工具；涉及前端产物时排 web-bundle 与 web-e2e。
