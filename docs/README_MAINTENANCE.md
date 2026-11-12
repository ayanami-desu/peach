# README 维护

默认入口 `README.md` 用英文，简体中文版是 `README.zh-CN.md`。README 讲项目定位、核心能力、安装入口与必要限制；参数、缓存、任务恢复、诊断这些细节交给专题文档，变更历史只进 `CHANGELOG.md`。

## 双语结构

两版节序一一对应，改动同批落地：

| `README.md` | `README.zh-CN.md` |
| --- | --- |
| Screenshots | 截图 |
| Features | 能做什么 |
| Download and use | 下载与使用 |
| Documentation | 文档 |
| Reporting problems | 问题反馈 |
| Related projects | 相关项目 |
| Star History | Star 历史 |
| License | 许可证 |

两份文件的互相链接是硬要求：`scripts/check_readme_impact.py` 的 `installation_contracts()` 检查两份 README 各自的 Python 下限（照 `pyproject.toml` 的 `requires-python`）与语言入口链接，`tests/test_readme_contracts.py` 断言它返回空列表。

## 只写当前存在的东西

README 的事实逐条对着源码与文档核，不写已经不在树里的东西。分发方式是 Docker 镜像与源码树里的 `peach serve` 两条路，没有安装包、平台矩阵、托盘常驻与自动更新——`docs/` 里已经没有这些能力的文档，README 也不该留它们的入口。

| 内容 | 核验入口 |
| --- | --- |
| Python 下限与命令 | `pyproject.toml`、`src/peach/cli.py` |
| 前端工具与构建产物 | `frontend/package.json`、[前端](FRONTEND.md) |
| 镜像、容器与发布范围 | `Dockerfile`、`compose.yaml`、`.github/workflows/docker.yml`、[部署与更新](DEPLOYMENT.md) |
| 首次运行、设置文件与访问入口 | [运行与配置](OPERATIONS.md)、[Docker 部署](DOCKER.md) |
| 网盘接入与数据边界 | [采集与资料](METADATA.md)、[总体架构](ARCHITECTURE.md)、`src/peach/settings_file.py` |
| 当前行为 | 实现与测试；`./scripts/test.sh checks`、[测试](TESTING.md) |

README 不写本机 IP、端口归属、真实馆藏数字、访问口令或动态版本号。这些要么随环境变，要么本身就是隐私。

## 检查门槛

1. 文案按[写作规范](WRITING.md)过一遍，界面与说明文案的最终态由 `scripts/check_copy_final_state.py` 把守；公开文字里不许出现本机账本里的真实番号、站名与个人痕迹，`scripts/check_public_text.py` 会对着本机账本拦（正文写 `peach-public-text: <理由>` 放行）。
2. 链接不许死。`seiso` 校验相对链接与锚点，`installation_contracts()` 与 `readme_link_problems()` 校验安装契约与下载直链。
3. 改完跑[正式测试入口](TESTING.md)，README 相关用例在 `checks` 域。

## 下载直链与版本

README 里的版本直链由 `scripts/version_bump.py` 改写，不手写：

- 直链形状是 `releases/download/v<版本>/Peach-<版本>-<后缀>`（`point_downloads_at()` 的正则）。
- `plan_bump()` 只读地算出这一版该用哪一档、推到哪个版本号；`--ship` 才真正改，条件是发布制品已经齐了。
- `point_readmes()` 把两份 README 的直链换到新版本，只动 `README_FILES = ("README.md", "README.zh-CN.md")`。
- `readme_link_problems()` 要求两份 README 都有这条直链，且版本是当前版本或变更日志里紧挨着的上一版；更旧就算漏换。这个漏洞真发生过，`scripts/version_bump.py` 的注释记着「曾在 v0.50.0 停了六个版本」，现在由 `tests/test_readme_contracts.py` 守着。
- 这道门槛与 README 里写不写下载直链是绑在一起的：README 若不再列 Release 制品，`readme_link_problems()` 会报「没有 Release 下载直链」，两边要一起改。

## 截图与演示数据

README 的四张截图（馆藏、人物、统计、播放器）取官网已发布的电影演示库画面，放在官网静态资源上，仓库里不放：

- 地址形如 `https://peach.video/assets/screenshots/home-wide-20261025-2-1280.webp`，README 里 WebP 展示图链接的是同目录的无损 PNG 原图，这样点开不经过 Release 附件。
- WebP 展示图控制在 4 MB 以内，PNG 原图保持 3840×2160；换图后要确认线上真的发布了，本地有文件不等于线上可访问。
- 公开画面不得出现访问凭据、内网与隧道地址、文件系统完整路径或个人馆藏。第三方素材的署名与许可链到官网的素材来源页，软件许可不替代素材许可。

仓库里只允许 `docs/assets/` 存少量演示媒体：只收 `.mp4` 与 `.webm`，单个不超过 8 MB，由 `tests/test_repo_hygiene.py` 的 `DocumentationMediaTests` 检查；目录不存在时这一档跳过。截图与图标不进这里。

### 本地生成器

`scripts/demo_dataset.py` 生成一套 SFW 演示库，供截图与性能基准使用，只写目标目录、不碰账本：

```bash
.venv/bin/python -X utf8 scripts/demo_dataset.py --output <目录> --count 24
```

- `--art portrait`（默认）用 Gfriends 图库里一份人工逐张看过的清单（`scripts/demo-portraits.json`）排版封面与图集，出演者用清单里的规范艺名；`--art synthetic` 用 Pillow 画几何海报，不联网，规模基准与测试用它。
- 短片都是 FFmpeg lavfi 的渐变、测试图与分形，只占位。`--video stub` 用占位字节代替编码，`--seed` 固定内容。
- 三种目录形状对应三种条目：番号型 `<番号>/<番号>.mp4` 配同名 `.nfo` 与 `-poster.jpg`（部分带 `P/` 图集）；创作者型 `<创作者>/<标题>.mp4` 配 `.png` 与无番号 `.nfo`；裸文件只有视频，演示「未识别到番号」。
- 作品、厂牌、系列与标签一律虚构，词表与 `catalog_rules` 的成人词表不相交，`tests/test_demo_dataset.py` 把守；真实艺名配虚构作品，演示素材因此不断言「某人演过某片」。

人像清单只能人工逐张看过后更新，不许按图库顺序自动取。图库按目录前缀排序是「先试哪一张」，不是「哪一张能进公开文档」：排在前面的大图多是片商宣传素材。换图时取回候选、拼一张联系表一次看完、剔掉露点与出界的，再按名字对应的**文件名**（不是索引里的键名，那可能是别名）与字节哈希写进清单，最后按内容哈希去重。字节不进仓库（ADR-0026），生成器运行时取一次，缓存在输出目录的 `.portrait-cache/`；哈希对不上是硬错误，不降级放行。

生成的目录要进 Peach，得放进一个被配成扫描根的网盘目录——Peach 只按 `[drive.roots.<来源>]` 扫描远端，不读本机目录（见[目录浏览](DIRECTORY_BROWSING.md)）。新库的实体只来自复核落地，扫描本身不派生创作者、也不把图片挂到实体上，所以演示库的创作者页与实体图集为空，这是产品现状。

## Star 历史

`README.md` 与 `README.zh-CN.md` 的 Star 历史图读 `star-history` 分支上的两个 SVG（`star-history-light.svg`、`star-history-dark.svg`），由 `scripts/render_star_history.py` 生成：

```bash
.venv/bin/python scripts/render_star_history.py --repo peach-mitao/peach --output-dir build/star-history
```

横轴从第一个 Star 开始，线性坐标，深浅两套主题各出一张。仓库没有为它跑定时工作流，换图时手工生成再提交到 `star-history` 分支；`--history-file` 可以拿已保存的接口响应离线重画，不访问网络。

## 参考依据

- **README 结构（2026-09-06）**：参照 Immich、Bruno、Hoppscotch 当时的 README，URL、日期与 SHA-256 记在 `docs/reference-sources.json` 的 `readme-*` 条目。借短定位、小尺寸图标、集中下载导航与精简能力分组；只用自己的图标，不复制外部商标、截图与功能承诺。
- **同类项目的 README（2026-09-26）**：映库、OpenAver、amane、Stash、MetaTube、MDCx，同样登记在 `docs/reference-sources.json`。借的是信息顺序——页头链接行、截图靠前、一句一条功能、下载三步走、反馈要附什么；不借文案与截图。边界以 `LICENSE` 与 `SECURITY.md` 为准。
- **篇幅取舍（2026-10-27）**：保留能力分组、安装入口、文档导航与必要限制，参数与运维细节交给专题文档。
- **截图与 Star 历史（2026-10-27 / 2026-10-28）**：五张演示库截图保留，首页主图直接展示、其余折叠；Star 历史改用逐日记录的线性坐标与深浅主题，取代按周取样的第三方图。

复用与自研的边界见[复用清单](REUSE.md)，写作用词见[写作规范](WRITING.md)。
