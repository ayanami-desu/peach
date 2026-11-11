# 采集与资料

采集侧只做三件事：知道最近出了什么、把用户关注的东西追到、把已入库的片子补全资料。它不下载媒体，不代替用户过验证，不碰网盘上的字节——媒体只从配置的网盘根进来，扫描只读列表响应（见[总体架构](ARCHITECTURE.md)）。

采集侧的一切推断都是候选。落进账本的真相字段只经过复核（ADR-0038），复核前它们留在候选文件里，页面上标着来源与置信度。

## 番号发现

`src/peach/feeds.py`（ADR-0042）只回答一个问题：某个人最近出了哪些番号。它不下载种子或 enclosure、不建目录、不碰媒体；解析只吃已经下载下来的字节。

两类订阅都按人：JavDB 演员页的伪 Feed（`KIND_JAVDB_ACTOR = "javdb-actor"`）与 DMM 女优片单（`KIND_DMM_ACTRESS = "dmm-actress"`，页面模板 `DMM_ACTRESS_PAGE`，`DMM_ACTRESS_PROVIDERS = ("dmm", "r18dev")`），体积与取名规则见 ADR-0047、0083、0135。

- 节奏：`DEFAULT_INTERVAL_MINUTES = 360`、`TICK_MINUTES = 30`、`MAX_ENTRIES = 200`、`MAX_NEW_PER_POLL = 20`。
- 合集与剪辑不混进「新作」：`compilation_kind()` 按标题里的时长与出演人数判，`COMPILATION_MINUTES = 240`、`COMPILATION_PERFORMERS = 8`，`DEFAULT_HIDDEN_COMPILATIONS` 默认藏起拼盘与节选，`EXCERPT_STUDIOS` 是已知只发节选的厂牌。
- 订阅调度在 `api.create_app` 里由另一个 `FollowUpdateScheduler` 承担（`job_id=FEED_JOB_ID`、`feed-schedule.json`）。

「不想看」与「想要」是两套记录，互斥写在 `src/peach/wants.py` 一处：登记想要时清掉对应屏蔽，屏蔽时撤掉对应想要；新文件登记后 `reconcile()` 把命中的想要标成「已入库」。

## 追更

站点连接器在 `src/peach/follow_sources.py`，一个站一份站点知识，统一由 `_BaseConnector` 派生，注册进 `CONNECTORS`：Fanbox、Patreon、SubscribeStar、Kemono（含三个镜像键）、Rule34Video、Rule34XXX、Rule34Paheal、F95Zone、SimpCity、Iwara。

连接器只做发现，不写账本，不在启动或浏览时联网，也不绕机器人验证。凭据由 `follow_secrets.CredentialStore` 提供，只进请求头或 POST 体。共同用到的判据也在这个文件里：`FollowCandidate`、`SourceFetch`、`published_stamp()`、`within_history()`、`history_window()`、`resource_links()`、`video_seconds()`、`origin_group_key()`、`display_thumb_url()`、`media_content_hash()`，条目上限 `DEFAULT_MAX_ITEMS = 100`，资源链接只认 `_FILE_HOST_DOMAINS` 里的主机。

调度在 `src/peach/follow_scheduler.py`：APScheduler 的 `BackgroundScheduler`，任务号 `JOB_ID = "peach-follow-update"`，间隔下限 `MIN_INTERVAL_MINUTES = 15`、上限 `MAX_INTERVAL_MINUTES = 7 * 24 * 60`，偏好持久在 `state/` 下的调度文件里。连续失败会退避：第一次不推迟（可能只是抖动），从第二次起翻倍，最多到 `MAX_BACKOFF_FACTOR = 8` 倍——按原间隔继续敲只会把同一个错误重复几十遍，还白耗额度。

## 资料源与解析器

`src/peach/sources/` 一个站一个模块，契约在 `base.py`：一站一类、取页与解析分开、按站配置写进数据、一种返回模型、一张失败原因表。

| 模块 | 站点与用途 |
| --- | --- |
| `r18dev.py` | r18.dev 的作品 JSON，DMM 数字版目录的镜像，有码与素人链的第一档 |
| `dmm.py` | DMM／FANZA 的 GraphQL 目录，答 r18.dev 漏收的部分 |
| `avbase.py` | AVBase 作品搜索页 |
| `javdb.py` | javdb 作品页 |
| `javbus.py` | JavBus 作品页 |
| `fc2.py` | FC2 内容市场商品页，以及 FC2 链上五站共用的番号、时长与原件地址 |
| `fc2cmadb.py` | fc2cmadb 作品页：下架 FC2 的镜像、评论区维护的演员与等价标记 |
| `fc2ppvdb.py` | FC2PPV Database：FC2 商品元数据，女优、卖家与「流出」标记由站方用户维护 |
| `javten.py` | JAVten（前身 fc2hub）的 FC2 作品页：下架商品另一份标题、标签、卖家与原件地址 |
| `javarchive.py` | JavArchive：fc2cmadb 也没有的下架 FC2 的最后一档 |
| `onepondo.py` | 一本道官网的作品 JSON |
| `seesaa.py` | Seesaa 上三个认人 Wiki：作品条目里的精确番号出演证据 |
| `replay.py` | 来源录制回放：把一次真实查询的请求与响应存成 cassette，测试离线重放 |

`fc2ppvdb.py` 与 `javten.py` 两站都在 Cloudflare 的 JS 验证后面，走 httpx 并带用户在采集设置里贴的 `cf_clearance` Cookie（`scraping_access.SOURCES` 里 `cookie`/`session` 皆真）：Cookie 绑着解题那台浏览器的 User-Agent，所以整站 UA 与用户的 Chrome 保持一致；验证没过或 Cookie 过期按 `blocked_pause` 整站停下。

### 连接方式与 Cookie

`src/peach/scraping_access.py` 管三件事：采集来源的本机设置、域内 Cookie、按来源的连接策略。

- `SOURCES` 是来源表，每项有 `label`、`domains`、`login`，需要登录或过年龄门的标 `cookie`/`session`，被 403 挡住时按 `blocked_pause` 停机（javdb 24 小时、其他 6 小时），停机时长从 `FIRST_BLOCKED_PAUSE` 起翻倍。
- 回 200 的验证页由解析器认成 `cloudflare_challenge`，经 `SourceTransport.hold` 进同一份记录：封期里接着问，只会每条都再撞一次。
- 需要登录墙或年龄门的站（javdb、javbus、fc2cmadb）靠用户在浏览器里自己过门后把 Cookie 贴进采集设置；Peach 不读浏览器的 Cookie 库，也不代替用户登录。
- 主机间隔 `library_processing.SOURCE_INTERVALS`：`{'javdb.com': 3.0, 'jdbstatic.com': 3.0}`——javdb 按出口 IP 计配额。要走 Peach 代理的来源在设置里单独指定，`peach_proxy` 负责连接方式。

### 来源检查

`src/peach/source_checks.py` 的 `check_source(secrets_root, source, *, preflight=False)` 做有界连接检查，复用来源连接与图片 CDN 判据，Web 与安装后的诊断共用同一份实现。停机与拒绝的异常在 `src/peach/scraping_access.py`：`SourcePaused`、`SourceBudgetExhausted`、`SourceRefused`，`record_source_check(root, source, stage, record)` 把结论写下来。`MOBILE_BROADBAND_HINT` 对应实测：中国移动宽带直连 DMM 图片主机常在握手后被断开，这时要把 DMM／FANZA 的连接方式设成 Peach 代理。

## 问哪几家、什么顺序

`src/peach/metadata_routes.py` 只管「问」：番号属于哪种内容、该类型的有序来源链、以及一档取到必填标量后就不再问下一档。

- `classify()` 判内容类型；国产、欧美这些一家来源都没接的体系合成 `other`，链是空的——按本机证据认得出它不是日本发行物，就一家都不问，也不问封面。形状像有码、本机证据对不上写法的归 `unsure`，只问综合索引一档一遍。
- `route_for_code()`/`stages_for_code()`/`route()`/`community_route()`/`official_route()`/`maker_sites()` 给链与分档，`parse_route_overrides()` 让调用方覆盖某几种内容类型的链，`required_scalars()` 与 `settles()` 判「够不够了、要不要再问」。
- 链的取舍借自 amane 的 `content-routes`（证据在 `docs/reference-sources.json` 的 `amane-content-routes`），三条判据：类型专属源靠前、综合索引垫后；对不匹配番号仍发 HTTP 的站不进默认链；会把无关番号拼成「看起来像详情页」的站一概不进。成员只收已经接通的几家（自写解析器或经 amane 桥），每个站只有一处归属（ADR-0048）。
- 对不匹配番号仍发 HTTP 的片商站（Prestige、FALENO、DAHLIA）由 `route_for_code()` 按本机证据裁掉。

## 谁说了算

`src/peach/metadata_policy.py` 管结算：`FIELD_SOURCE_ORDER` 给每个字段一张来源顺序表，`PREFERRED_COMMUNITY_SOURCE = "javdb"`、`FALLBACK_SOURCES = ("javbus",)`，`source_tier()`/`field_rank()`/`chain_rank()`/`blacklisted()`/`preferred_tag_source()`/`sort_candidates()` 把这套表用起来。

查询轴与结算轴是两条，别混：javbus 是结算的最后一站（ADR-0035），在查询上却排在 javdb 前面——javdb 按出口 IP 计配额、主机间隔 3 秒，先问便宜的那两家不影响结算结论，只影响谁先撞上限流。表的字段是 `title`、`original_title`、`performers`、`studio`、`series`、`release_date`、`tags` 等；表里的站名包含自写解析器与经 amane 桥接的两类，没接通的站不会出现在路由链里。

`src/peach/discovery_rules.py` 是系统元数据的共用判据，全量扫描、推送与下载登记都读它。

## 资料处理

`src/peach/library_processing.py` 的 `process_library()` 是采集侧唯一的批量入口：

```python
process_library(config, db_path, candidate_root, cover_root, *,
                location='configured', report=..., provider_factory=None,
                job_id=None, retry_ids=None, active=..., stage=ALL_STAGES,
                database=None, route_overrides=None, state_file=None,
                asset_ids=None, resume_state=None, speed_mode=None,
                protected_ids=(), recheck_existing=False, incremental=False,
                network=None, library_id=None, allow_metered=False,
                refresh_metadata=False)
```

- 阶段：`STAGES = (ALL_STAGES, COLLECT_STAGE, METADATA_STAGE)`，即 `all`/`collect`/`metadata`。资产不再落本机，扫描与预览生成都已不在这里：`collect`（旧名）与 `all` 都按采集处理。
- 范围：`location='configured'` 取 `config.drive_roots` 的全部来源；`asset_ids` 处理指定资产不重新扫描；`library_id` 把范围收窄到一个媒体库；`retry_ids` 只重跑上一轮记录的可重试失败，候选与封面照常复用。
- 候选写到 `candidate_root / 'library-metadata-field-candidates.csv'`，列见 `FIELDS`（`item_key`、`code`、`field`、`candidates_json`、`source_count`、`source_profile`、`policy_version`、`status` 等），中文标签见 `LABELS`。状态里最多留 `ISSUE_PREVIEW_LIMIT = 20` 条问题，完整问题写任务专属 JSONL；没有动作截止时间的阶段超过 `STALL_AFTER_SECONDS = 120` 没心跳，就在页面上预警。
- 检查点与预算：`_LibraryCheckpoints`、`_ProcessingIssues`、`_SourceBudget`、`_NetworkGate`、`_MissCache`；`snapshot(config)` 与 `state_path(config)` 给界面与续跑用。

命令行是 `peach process`（`cli._process_library`）：它把这一轮记进任务中心（`cli_run('library-processing', ...)`），结算后把声明的后继入队。网页那一轮走同一份实现。

## 复核

采集阶段产出的字段一律是候选，按 `source` 与 `confidence` 排队，approved 之后才成为真相。候选文件的读写口径在 `src/peach/review_csv.py`（`read_rows()`/`write_rows()`/`read_candidates()`/`latest_candidate_file()`，`utf-8-sig` BOM、`newline=""`）。

- 复核页全选通过，或按字段跑 `scripts/apply_metadata_tags.py --source <来源>` 落地。
- 已经问过且答复是「没有」的番号记在 `_MissCache`，下一轮不重复问。
- 垃圾判定规则在 `src/peach/junk.py`，扫描、后处理与页面共用一份；按范围隔离到回收站由 `process_library()` 自己做完（给了 `database` 才会动账本）。
- 旧账本里已消失、同一番号又出现的记录，由 `record_rehome.reattach_in()` 把个人记录接到新资产上，判据优先番号，其次时长（`DURATION_TOLERANCE`），判不准就留成孤儿记录等人选。

## 标题与封面取景

标题走 `FIELD_SOURCE_ORDER` 的 `title`/`original_title` 两列：片商官网最前，DMM 与 r18.dev 次之，社区站垫后；`sort_candidates()` 按字段排，`chain_rank()` 记这次候选来自链上哪一档。原标题单独一列，不覆盖 `title`。

封面是三步，职责不重叠：

1. `src/peach/cover_artwork.py` 原子安装封面，并写一份与当前图片匹配的取景 sidecar——图换了，sidecar 必须一起换。
2. `src/peach/jav_poster_crop.py` 算横版封套的正封坐标。它不改原图一个字节，五种取景方式写进框的 `method`，便于回看当时按哪条规则裁的。`scripts/poster_crop_boxes.py` 用来调取景框。
3. `src/peach/portrait_artwork.py` 给单人作品挑一张人脸最清楚的：从本地封面与已有高清帧里选，`_passes_size_bar` 要求正方形且最短边 ≥400。

取舍与判据的完整说明见[封面与取景](COVER_ARTWORK.md)。预览不在采集侧：它在播放页打开时按需生成，见[视频预览](VIDEO_PREVIEWS.md)。

## 凭据与边界

- Cookie、令牌与追更凭据都落本机 `secrets/`，不进账本、不进设置文件、不进日志与诊断包（`support_bundle.redact_log()` 再抹一遍）。
- 不读浏览器的 Cookie 库与历史记录，不代替用户登录或过验证码；站点拒绝就是拒绝，按来源冷却处理。
- 采集不下载媒体字节，不写远端文件系统；改名与移动只走整理（ADR-0039），候选不参与改名。
- 站点结构证据登记在 `docs/reference-sources.json`，按 `cadence` 复查（`scripts/check_reference_updates.py`）。

排障与来源检查的操作步骤见[运行与配置](OPERATIONS.md)和[诊断](DIAGNOSTICS.md)；复用与自研的边界见[复用清单](REUSE.md)。
