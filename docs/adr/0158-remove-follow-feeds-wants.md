# ADR-0158：删掉关注、订阅、新作、想要与 JAV 详情页的评论、资源区

- 状态：已采纳
- 日期：2026-11-11
- 关系：取代 ADR-0007、ADR-0019、ADR-0028、ADR-0042、ADR-0045、ADR-0046、ADR-0047、ADR-0058、ADR-0077、ADR-0078、ADR-0083、ADR-0090、ADR-0096、ADR-0097、ADR-0103、ADR-0134、ADR-0135、ADR-0143；其余各条不变

## 背景

关注、订阅与 Feed 发现是同一件事的三层：登记一个外部作者或站点，让后台按来源轮询出新条目，再把条目变成候选等人工复核。围绕它长出了四套表（`follow_*`、`feed_*`）、一批按来源交错的检查任务、两个整页（关注更新、关注管理）和资料页上的订阅入口。JAV 一侧另有「新作」行、「想要」清单，以及详情页的评论与资源区，各自带一套抓取与展示。

这些页面服务的是「追外部更新」，与 Peach 现在管的事情——把自己已有的馆藏认全、补齐资料、按来源检查连接——是两件不同的事。它们占掉的维护面却不小：每次改来源容器、改凭据表单、改任务中心，都要把这批页面与任务一起改一遍。2026-11-11 决定整块删除。

## 决策

**一、删除范围。**

- 页面：关注更新 `/follow`、关注条目 `/follow/item/:id`、关注管理 `/follow-manage`（含「订阅源」「添加」页签）、资料页的订阅入口与「在线」一档的 `/api/follow/authors` 取数；JAV 页的「新作」行、「想要」清单与批量条；JAV 详情页的「评论」与「资源」两段。
- 接口与页面端点：`/api/follow`、`/api/follow-qualities`、`/api/feed*`、`/api/wants*`，以及关注侧的头像、图片与封面端点（`/follow-avatar`、`/follow-image`、`/follow-cover`）。
- 模块：`web_follow*`、`follow_sources`、`follow_stream`、`wants`、`feed_*`，以及 `routes_pages.py` 里这些页面的路由与旧地址重定向。
- 后台任务：`feed-check`、`feed-scrape`、`feed-cover`、`want-scrape`、`follow-creator`、`follow-evidence-reclaim`、`jav-discovery-metadata` 不再有新的一轮。
- 前端源码：`feed-new/`、`follow*/`、`wants/`、`jav-releases`、`jav-batch-resources`、`<Reviews>` 与 `<Resources>`，以及 `ShellActions`、`IndexRoute`、`EntityPage*`、`EntityFilter*`、`JavDetail`、`SettingsPanelHost` 里对应的成员。
- 设置与文案：设置面板的「订阅」分区，以及上述页面在四种语言里的词条。

**二、保留项。**

- 馆藏探索换入口：`/api/jav/discoveries` 留在 `/jav` 探索页，只读账本、不发 HTTP；馆藏 JAV 是目录页的 `?jav=1` 筛选。候选按 `JAV_ASSET_PREDICATE` 与 `medium='video'` 取，筛掉已移除、标记过 `dislike`/`seen`、看过两次以上与播放进度过半的片子，同番号只留一张卡；排序是发行时间（默认）、来源评分、时长与番号。
- 作品资料持久化：javdb 只取作品资料，刮削走匿名接口（ADR-0144）。快照写进 `generated/jav-public/`，抓到一次就永久保存：`src/peach/jav_cache.py` 的 `cache_fresh()` 只认时间戳是否可信，不判新旧；盘上没有、手动重匹配或带 `?refresh=1` 才再问来源。
- 样张永久：官方样张随作品资料一起留在同一目录，不按天数失效。
- 后继框架保留：`src/peach/followups.py` 的后继仍只由任务结果声明（`TaskRunStore.enqueue_followups`），写账本的后继串行走 `LEDGER_LANE = "ledger"`，一次一条、重启后重排队、必须幂等（ADR-0053）。现存种类是 `entity-avatar`、`creator-identity`、`performer-alias`、`performer-profile`、`code-samples`、`seed-import`、`studio-mark`。
- 凭据保留：`CredentialStore` 与保存、撤销接口仍服务采集来源的 Cookie 与令牌（ADR-0024 扩展成来源配置页）；`follow_secrets.py` 随之改名为 `credentials.py`，跨机同步与 `CREDENTIAL_GUIDE` 字段表已无调用方，一并删除。
- 采集来源检查、手动复核与复核页全选通过照旧；来源停机的判据与记录一并保留。

**三、账本里的表只停写不删。** 迁移 `0018`、`0021`、`0022`、`0034`、`0042` 建下的 `follow_source`、`follow_item`、`follow_playback`、`follow_author_alias`、`feed_source`、`feed_item`、`feed_discovery`、`feed_discovery_entity`、`want_item` 留在既有账本里，新账本仍照这些迁移建表；没有迁移删除它们，代码也不再读、不再写。实体合并时，行里的实体引用仍按 ADR-0088 的墓碑口径搬到目标。

**四、已删种类的任务行仍要能显示。** `task_runs.TASK_LABELS` 保留这些种类的中文名，只为让任务中心读得懂账本里的历史任务行；它们不再描述现存的工作流，新任务也不会再用这些键。

**五、ADR 编号不回收。** 随功能删除的 18 篇（0007、0019、0028、0042、0045、0046、0047、0058、0077、0078、0083、0090、0096、0097、0103、0134、0135、0143）不再恢复，编号不复用。其余 ADR 里被这一刀改写的句子，就地改指向本 ADR，不改当时的结论。

## 理由

- 关注追的是外部更新，Peach 管的是已有馆藏与它的资料。两件事共用同一份账本，但前者的每一层（来源适配器、凭据、交错检查、四套表）都要跟着后者的每次改动一起改。
- 保留页面、只停调度，等于留着一批永远不会出结果的空壳：页面要处理加载与空状态，测试要覆盖它们，文案要翻译。
- 表不删只停写，是让升级可回退：旧镜像仍能打开旧账本，新账本也不会因为一次删除迁移丢掉历史行。

## 被否决的方案

- **只停后台任务，保留页面。** 页面上永远是旧条目，用户会以为检查坏了；保留的代价仍是完整的一套页面与测试。
- **连同表一起迁移删除。** 迁移不可回退，回滚旧镜像后旧账本缺表；历史任务行也会失去可指向的行。
- **把关注改造成「手动收藏外部作者」。** 仍需要来源适配器与凭据，只是把自动化拿掉，维护面不减。

## 后果

- 旧的 `/follow*`、`/follow-manage` 书签落进壳给出的默认页面；`/subscriptions` 与设置里的旧分区名重定向到 `/sources`，采集来源列表留在那里。
- 资料页与标签页都不再有「在线」一档，只剩本地索引与本地词表。
- JAV 页只剩探索，馆藏 JAV 走目录页的 `?jav=1` 筛选；详情页只剩作品资料、样张与播放。
- 删除后仍需清理的残留：`migrations/` 里那几张表的建表说明，以及 `src/peach/task_runs.py` 的 `TASK_LABELS` 里已删任务的标签（后者只为历史任务行显示）。这些不影响新行为，但会让下次读代码的人以为功能还在。
