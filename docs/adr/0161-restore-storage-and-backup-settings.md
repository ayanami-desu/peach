# ADR-0161：恢复设置页的存储与备份面板，收回没有调用方的接口

- 状态：已采纳
- 日期：2026-11-13
- 关系：补回 [ADR-0157](0157-remote-drive-api-storage-and-playback.md) 删掉的设置面板；把 [ADR-0138](0138-user-triggered-ledger-backup-and-restore.md) 的备份与恢复接到界面上；修正 [ADR-0003](0003-ai-provider-boundaries.md) 第一阶段登记的 `/api/providers` 检查接口（已移除）。

## 背景

`31cdabe57` 把存储与播放改成直连网盘 API（[ADR-0157](0157-remote-drive-api-storage-and-playback.md)），同时删掉了设置页的存储面板与账本备份面板：`frontend/src/react/settings/storage-settings.tsx`、`ledger-backup-settings.tsx` 连同各自测试一起移除，配置页页签只剩七格。后端没有跟着删：`data_storage`（占用统计、分类清理）与 `ledger_backups`（立即备份、恢复）一直保留，`/api/configuration/storage*` 与 `/api/configuration/ledger-backups*` 这些路由也从未动过。

删掉的是界面，不是能力。容量保护仍在后台执行：`storage_budget` 按数据目录与缓存目录的可用空间拦住写入，按 `auto_clean` 清掉最久没用过的缩略图。但阈值写在 `state/` 下的 `storage-policy.json`，用户没有入口改，只能接受默认值（总开关开启、无上限、自动清理开启）。账本备份只剩接口：想「立即备份」或「恢复」得自己带登录凭据 POST，恢复还要显式带 `confirm: true`。

## 决策

**一、配置页第八格「存储与备份」。** `/settings` 的页签在「媒体库」之后插入一格，地址 `/settings/data`，锚点 `#data`。上半格是存储：分类占用读数、启动一次统计、三类可清理项、容量保护表单（总开关、保留可用空间、数据目录上限、缓存上限、外部缓存目录与其上限、自动清理）。下半格是账本备份：备份列表、立即备份、恢复，以及上次恢复的结果。

**二、只暴露现存能力。** 面板直接调已有的七条接口，不新增后端逻辑。不提供数据目录迁移：`data-relocation` 的请求与结果文件随 ADR-0157 一并退役，数据目录仍在设置文件里改；外部缓存目录不自动探测——容量设置里填过就按那个路径算进缓存占用，没填就当没有，不在数据目录旁边猜一个。

**三、收回没有调用方的入口。** 前端没有一处请求这几组地址，删掉：`GET /api/providers`、`GET /api/providers/opencode-go/models`（来源注册表最后一个读取方）、`GET /api/diagnostics/bundle`（诊断包改由 `POST /api/diagnostics/exports` 的 `support` 导出承担，见[日志与诊断](../DIAGNOSTICS.md)）、`/api/entity/latest`（`web_router` 的具名端点）。`/api/parts` 与 `/api/editions` 保留：详情页的「分卷」「版本」以 `` `/api/${ref.kind}?id=` `` 动态请求（`frontend/src/react/item-detail/item-detail.ts:136`），只按调用点搜字符串会以为没人用。

## 影响

- 用户重新可以自助备份与恢复账本，不必停服务换文件；恢复的前置条件、替换方式与中断标记仍按 ADR-0138 执行，没有因换界面而放宽。
- 存储占用看得见、阈值改得动；清理仍只限 `backups`、`thumbnails`、`logs` 三类，`previews` 重建要重新读取整片所以不开放。容量保护、统计与清理的行为本身没有变。
- 接口面缩小：来源健康检查与诊断包的一次性下载入口都不在了。以后做 AI 刮削选模型，需要重新引入 provider 注册表与对应的检查接口。
