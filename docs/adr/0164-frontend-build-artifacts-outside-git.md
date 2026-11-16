# ADR-0164：前端构建产物移出 Git，在构建流程中生成

- 状态：已采纳
- 日期：2026-11-17
- 关系：修订 [ADR-0022](0022-frontend-vite-preact-strangler.md)、[ADR-0031](0031-frontend-react-boardui-tailwind.md) 与 [ADR-0118](0118-main-bundle-route-chunks.md) 中「构建产物提交到 Git」的决策；`/dist/` 路由、chunk 形态、依赖锁定与测试入口不变

## 背景

`web/dist/` 保存主包、页面包与按页拆出的带哈希 chunk。过去这些产物直接提交进 Git，虽然省去了运行期和打包阶段对 Node 的依赖，但也带来了三类持续摩擦：

1. 每次前端源码改动都会在提交与审阅中混入大量编译产物和 chunk 增删 diff。
2. 并行分支或上游同步变基时，`web/dist/` 频繁冲突，每个提交都要反复重建并重新暂存产物。
3. 本仓库镜像部署已经统一通过 `Dockerfile` 与 GitHub Actions 构建，完全可以在镜像构建阶段使用官方 Node 阶段完成前端编译，无需把编译结果放进源码仓库。

## 决策

**一、Git 忽略 `web/dist/`。** `.gitignore` 排除 `web/dist/`，仓库中不再跟踪前端编译产物。

**二、Docker 构建阶段内置前端编译。** `Dockerfile` 新增 `frontend-build` 阶段（`node:24-slim`），复制 `frontend/package.json`、`frontend/package-lock.json`、`frontend/` 与 `resources/media-sources.json` 后执行 `npm --prefix frontend ci --ignore-scripts && npm --prefix frontend run build`；Python `build` 阶段通过 `COPY --from=frontend-build /app/web/dist ./web/dist` 取得产物，再由 `uv sync --locked --no-dev --no-editable` 打包进 `peach/_resources/web/dist/`。`.dockerignore` 排除宿主机 `web/dist/` 与 `frontend/node_modules/`，保证镜像只包含当次容器内构建的前端产物。`.github/workflows/docker.yml` 监听 `frontend/**` 变动，并在容器验收时校验 `/dist/peach-pages.js` 与 `/dist/peach-pages.css` 可达。

**三、Python 打包与测试流程自动构建。**
- `setup.py` 的 `BuildWithResources` 在 `npm` 与 `frontend/node_modules` 就绪时先执行 `npm --prefix frontend run build`，并校验四个固定入口产物存在后才装入 wheel。
- `tests/test_frontend_build.py` 与 `tests/test_web_e2e.py` 在 `npm` 与 `frontend/node_modules` 就绪时执行 `npm --prefix frontend run build` 生成 `web/dist/`，再执行产物契约、vitest 与浏览器用例；本机缺工具链且没有现成产物时按 `missing_prerequisite` 跳过（CI 判失败）。
- 本机从源码运行（`uv run peach serve`）按 [运行与配置](../OPERATIONS.md#从源码运行windowsmacos) 先执行 `npm --prefix frontend ci && npm --prefix frontend run build`。

## 后果

- Git 历史、分支合并与同步变基只包含源码改动，不再出现构建产物噪音与 chunk 冲突。
- 容器镜像构建、Python 打包与本地源码运行在需要产出前端静态资源时各自负责触发 `npm --prefix frontend run build`。
- 服务端运行阶段仍不依赖 Node：运行时只读取构建生成的 `web/dist/`。
