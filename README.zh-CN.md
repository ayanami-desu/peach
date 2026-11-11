<p align="center"><img src="resources/peach-logo-128.png" alt="Peach" width="88"></p>

# Peach

自托管的影片信息管理工具，媒体留在你自己的 Google Drive 或 OneDrive 里。

[官网](https://peach.video) · [下载](#下载与使用) · [在线演示](https://demo.peach.video) · [文档](#文档) · [English](README.md)

[![Release](https://img.shields.io/github/v/release/peach-mitao/peach?include_prereleases&sort=semver&label=release&logo=github)](https://github.com/peach-mitao/peach/releases)
[![许可证](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue?logo=gnu&logoColor=white)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-image-2496ED?logo=docker&logoColor=white)](docs/DOCKER.md)
[![年龄限制](https://img.shields.io/badge/age-18%2B-555555)](#许可证)

## 截图

[![影片馆藏：搜索、筛选与海报墙](https://peach.video/assets/screenshots/home-wide-20261025-2-1280.webp)](https://peach.video/assets/screenshots/home-wide-20261025-2.png)

电影演示资料，来源与许可见[素材说明](https://peach.video/credits/)。

<details>
<summary>更多截图</summary>

**人物与作品**

[![查理·卓别林的资料与作品](https://peach.video/assets/screenshots/profile-wide-20261025-2-1280.webp)](https://peach.video/assets/screenshots/profile-wide-20261025-2.png)

**创作者关注**

[![创作者关注与作品更新](https://peach.video/assets/screenshots/follow-wide-20261025-2-1280.webp)](https://peach.video/assets/screenshots/follow-wide-20261025-2.png)

**馆藏统计**

[![馆藏、存储与观看统计](https://peach.video/assets/screenshots/stats-wide-20261025-3-1280.webp)](https://peach.video/assets/screenshots/stats-wide-20261025-3.png)

**播放器**

[![Big Buck Bunny 播放器](https://peach.video/assets/screenshots/play-wide-20261025-2-1280.webp)](https://peach.video/assets/screenshots/play-wide-20261025-2.png)

</details>

## 能做什么

- **影片刮削**：识别影片编号，读取 NFO，多来源补齐标题、演员、厂牌和封面，保留人工修改。
- **网盘里的馆藏**：接上 Google Drive 与 OneDrive，选好要扫描的目录就能浏览。影片留在原处，Peach 只保存资料、缩略图和观看记录。
- **播放**：在网页里播放，或者把一条带时限的直链交给桌面播放器；续播位置、倍速和时间轴预览按作品保存。
- **变更跟踪**：每 15 分钟取一次增量、每天一次全量，配置页也能当场刷新。
- **关注与发现**：订阅人物与创作者更新，发现作品，管理「想要」清单。
- **馆藏管理**：管理标签、重复文件、多版本与分卷；按女优批量删除影片，保留人物档案和照片。
- **任务中心**：暂停、继续或取消后台任务，看进度和问题。

## 下载与使用

| 方式 | 入口 |
| --- | --- |
| Docker / NAS | [部署说明](docs/DOCKER.md) |
| 源码运行 | [安装步骤](docs/OPERATIONS.md)，需要 Git、uv 和 Python 3.14+ |

Peach 就是一个容器或一个进程，跑在你自己的数据目录上。首次启动后在配置页授权一个 Google Drive 或 OneDrive 账号，选定要扫描的目录，馆藏会自己长出来。

OAuth 客户端由你自己申请：在 Google Cloud 或 Azure 上登记应用，把 client id 与 secret 填进配置，令牌就一直在你手里。详见[部署说明](docs/DOCKER.md)。

## 文档

[部署](docs/DOCKER.md) · [运行与配置](docs/OPERATIONS.md) · [来源支持](docs/SOURCING.md) · [外部播放器](docs/EXTERNAL_PLAYERS.md) · [诊断与数据分享](docs/DIAGNOSTICS.md) · [更新日志](CHANGELOG.md)

参与开发：[贡献说明](CONTRIBUTING.md) · [开发约定](AGENTS.md) · [测试](docs/TESTING.md)

## 问题反馈

[提交问题或建议](https://github.com/peach-mitao/peach/issues/new/choose)，附版本、复现步骤与报错。公开截图使用演示资料，遮盖隐私；不要上传影片或数据库。安全问题按[安全政策](SECURITY.md)私下报告。

## 相关项目

感谢 [amane](https://github.com/sqzw-x/amane) 与 [Gfriends](https://github.com/gfriends/gfriends)；完整致谢见[复用清单](docs/REUSE.md)。

## Star 历史

<a href="https://github.com/peach-mitao/peach/tree/star-history">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/peach-mitao/peach/star-history/star-history-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/peach-mitao/peach/star-history/star-history-light.svg">
    <img alt="Peach 累计 Star 数，线性坐标" src="https://raw.githubusercontent.com/peach-mitao/peach/star-history/star-history-light.svg">
  </picture>
</a>

## 许可证

[AGPL-3.0-or-later](LICENSE) · Copyright (C) 2026 The Peach contributors。第三方组件保留各自的许可证。Peach 名称与图标的使用见[名称与标识政策](docs/TRADEMARKS.md)。

仅管理自行持有或获授权使用的媒体，遵守法律、版权及来源平台的访问、年龄和地区限制。Peach 不提供影片资源或付费内容访问权。
