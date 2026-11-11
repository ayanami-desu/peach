# 采集与资料

采集只为已入库的作品补全资料并做来源检查。它不下载媒体，不代替用户过验证，不碰网盘上的字节——媒体只从配置的网盘根进来，扫描只读列表响应（见[总体架构](ARCHITECTURE.md)）。

采集侧的一切推断都是候选。落进账本的真相字段只经过复核（ADR-0038），复核前它们留在候选文件里，页面上标着来源与置信度。

## 资料源与解析器

`src/peach/sources/` 一个站一个模块，契约在 `base.py`：一站一类、取页与解析分开、按站配置写进数据、一种返回模型、一张失败原因表。

| 模块 | 站点与用途 |
| --- | --- |
| `r18dev.py` | r18.dev 的作品 JSON，DMM 数字版目录的镜像，有码与素人链的第一档 |
| `dmm.py` | DMM／FANZA 的 GraphQL 目录，答 r18.dev 漏收的部分 |
| `avbase.py` | AVBase 作品搜索页 |
| `javdb.py` | javdb 的作品资料：刮削走匿名接口（`JavDBPublicSource`），详情页解析只留给视频预览 |
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

## 连接方式与 Cookie

`src/peach/scraping_access.py` 管三件事：采集来源的本机设置、域内 Cookie、按来源的连接策略。

- `SOURCES` 是来源表，每项有 `label`、`domains`、`login`，需要登录或过年龄门的标 `cookie`/`session`，被 403 挡住时按 `blocked_pause` 停机（javdb 24 小时、其他 6 小时），停机时长从 `FIRST_BLOCKED_PAUSE` 起翻倍。
- 回 200 的验证页由解析器认成 `cloudflare_challenge`，经 `SourceTransport.hold` 进同一份记录：封期里接着问，只会每条都再撞一次。
- 需要登录墙或年龄门的站（javdb、javbus、fc2cmadb）靠用户在浏览器里自己过门后把 Cookie 贴进采集设置；Peach 不读浏览器的 Cookie 库，也不代替用户登录。
- 主机间隔 `library_processing.SOURCE_INTERVALS`：`{'javdb.com': 3.0, 'jdbstatic.com': 3.0}`——javdb 按出口 IP 计配额。要走 Peach 代理的来源在设置里单独指定，`peach_proxy` 负责连接方式。

## 来源检查

`src/peach/source_checks.py` 的 `check_source(secrets_root, source, *, preflight=False)` 做有界连接检查，复用来源连接与图片 CDN 判据，Web 与安装后的诊断共用同一份实现。停机与拒绝的异常在 `src/peach/scraping_access.py`：`SourcePaused`、`SourceBudgetExhausted`、`SourceRefused`，`record_source_check(root, source, stage, record)` 把结论写下来。`MOBILE_BROADBAND_HINT` 对应实测：中国移动宽带直连 DMM 图片主机常在握手后被断开，这时要把 DMM／FANZA 的连接方式设成 Peach 代理。

## 问哪几家、什么顺序

`src/peach/metadata_routes.py` 只管「问」：番号属于哪种内容、该类型的有序来源链、以及一档取到必填标量后就不再问下一档。

- `classify()` 判内容类型；国产、欧美这些一家来源都没接的体系合成 `other`，链是空的——按本机证据认得出它不是日本发行物，就一家都不问，也不问封面。形状像有码、本机证据对不上写法的归 `unsure`，只问综合索引一档一遍。
- `route_for_code()`/`stages_for_code()`/`route()`/`community_route()`/`official_route()`/`maker_sites()` 给链与分档，`parse_route_overrides()` 让调用方覆盖某几种内容类型的链，`required_scalars()` 与 `settles()` 判「够不够了、要不要再问」。
- 链的取舍借自 amane 的 `content-routes`（证据在 `docs/reference-sources.json` 的 `amane-content-routes`），三条判据：类型专属源靠前、综合索引垫后；对不匹配番号仍发 HTTP 的站不进默认链；会把无关番号拼成「看起来像详情页」的站一概不进。成员只收已经接通的几家（自写解析器或经 amane 桥），每个站只有一处归属（ADR-0048）。
- 对不匹配番号仍发 HTTP 的片商站（Prestige、FALENO、DAHLIA）由 `route_for_code()` 按本机证据裁掉。

自定义 JSON 来源作为附加档接在链末，见下节。

## 谁说了算

`src/peach/metadata_policy.py` 管结算：`FIELD_SOURCE_ORDER` 给每个字段一张来源顺序表，`PREFERRED_COMMUNITY_SOURCE = "javdb"`、`FALLBACK_SOURCES = ("javbus",)`，`source_tier()`/`field_rank()`/`chain_rank()`/`blacklisted()`/`preferred_tag_source()`/`sort_candidates()` 把这套表用起来。

查询轴与结算轴是两条，别混：javbus 是结算的最后一站（ADR-0035），在查询上却排在 javdb 前面——javdb 按出口 IP 计配额、主机间隔 3 秒，先问便宜的那两家不影响结算结论，只影响谁先撞上限流。表的字段是 `title`、`original_title`、`performers`、`studio`、`series`、`release_date`、`tags` 等；表里的站名包含自写解析器与经 amane 桥接的两类，没接通的站不会出现在路由链里。

## 自定义元数据来源

采集页的「自定义元数据来源」用于接入公开 JSON 元数据接口。每个来源保存名称、固定 HTTPS 接口地址、番号格式、字段路径、适用内容类型和连接方式。保存后可编辑、试查、启用、停用或删除。

接口地址必须包含一个 `{code}`。字段路径用点连接对象键或数组下标，例如 `data.title`、`items.0.title`。番号字段必填；标题、厂牌、系列、发行日期是文本，演员和标签是文本数组。番号格式可选原样、小写、去掉连字符或转为下划线。试查番号输入后按回车，结果显示在当前表单。

这套配置只适用于单次 GET 返回的 JSON，不解析 HTML、CSS selector、JSON-LD、YAML 规则，也不执行脚本。需要 Cookie、站点 API key、多次查询或浏览器验证的来源使用已有专用适配器。

一本道公开接口的配置是个现成的例子：

| 字段 | 值 |
| --- | --- |
| 接口地址 | `https://www.1pondo.tv/dyn/phpauto/movie_details/movie_id/{code}.json` |
| 番号格式 | 连字符转下划线 |
| 番号字段 | `MovieID` |
| 标题字段 | `Title` |
| 演员字段 | `ActressesJa` |
| 适用类型 | 无码 |

Peach 已内置一本道适配器，此例只用于说明接口配置，不需要重复添加。自定义来源的适用内容类型由用户选择；对于发行体系同形的番号，需要选择确实覆盖目标作品的接口。

### 采集与复核

启用的来源追加到适用类型的内建来源链末尾，前面的来源资料足够时按既有规则停止查询。响应中的番号字段必须与查询番号匹配，查询 URL 不能代替响应提供身份证据。

结果进入现有来源快照、候选及复核流程，置信度为 `0.5`，归为未登记来源，不参与自动批准。来源端点、字段映射、番号格式或线路变化时，新的查询规则有独立证据键；启停或改名称保持证据键。删除配置不删除已保存的来源快照或复核产物。

### 网络与存储

接口使用 HTTPS 公网域名、默认 443 端口，拒绝用户信息、片段、私网解析结果和重定向。查询使用最多 15 秒的时间预算，响应最多 1 MiB；代理配置、DNS 解析和会话准备共用该预算。系统 DNS 解析为同步调用，无法在预算到期时强制取消；解析返回时若预算已耗尽，不再发起 HTTP 请求，因此实际返回时间可能超过预算。直连或 Peach 代理都通过 cURL `CONNECT_TO` 固定已验证的公共 IP，TLS 的 SNI 和证书验证仍使用接口原域名。Peach 代理沿用已保存的连接设置，不另存凭据。

配置位于本机 `secrets/custom-metadata.json`，通过文件锁和原子替换保存；不写 ledger。

### 复用与取证

- 参考 OpenAver `502278a3e09c7520838ffb00b2ff080323a4cdcb` 的声明式配置、公网目标检查和番号身份核对。上游支持 YAML、CSS/meta/JSON-LD 及一至两步页面抓取；Peach 主动收窄为单步 JSON，未复制上游实现。
- 使用项目固定版本 `curl_cffi 0.16.3`、`filelock 4.0.12`，以及既有 `SiteRecord`、`identifies_code`、来源链与复核流程，无新增依赖。cURL 的连接边界见 [CONNECT_TO 官方说明](https://curl.se/libcurl/c/CURLOPT_CONNECT_TO.html)。
- 2026-10-13 做无写入验证：正式适配器经 Peach 代理、固定公共 IP、严格 TLS 查询 `112312_478`，返回番号匹配、标题非空、演员 1 人、置信度 `0.5`。直连 r18.dev 与一本道时返回 `curl (35) Recv failure: Connection was reset`；未降低 TLS 校验。

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
- 范围：`location='configured'` 取 `config.drive_roots` 的全部来源；`asset_ids` 处理指定资产不重新扫描；`library_id` 把范围收窄到一个媒体库；`retry_ids` 只重跑上一轮记录的可重试失败，候选与封面照常复用；`incremental=True` 只处理扫描登记在 `library-new-assets.json` 里的新影片，网页「同步新增文件」会先同步所选媒体库的账号再按这批 id 处理。
- 候选写到 `candidate_root / 'library-metadata-field-candidates.csv'`，列见 `FIELDS`（`item_key`、`code`、`field`、`candidates_json`、`source_count`、`source_profile`、`policy_version`、`status` 等），中文标签见 `LABELS`。状态里最多留 `ISSUE_PREVIEW_LIMIT = 20` 条问题，完整问题写任务专属 JSONL；没有动作截止时间的阶段超过 `STALL_AFTER_SECONDS = 120` 没心跳，就在页面上预警。
- 检查点与预算：`_LibraryCheckpoints`、`_ProcessingIssues`、`_SourceBudget`、`_NetworkGate`、`_MissCache`；`snapshot(config)` 与 `state_path(config)` 给界面与续跑用。

命令行是 `peach process`（`cli._process_library`）：它把这一轮记进任务中心（`cli_run('library-processing', ...)`），结算后把声明的后继入队。网页那一轮走同一份实现。

## 复核

采集阶段产出的字段一律是候选，按 `source` 与 `confidence` 排队，approved 之后才成为真相。候选文件的读写口径在 `src/peach/review_csv.py`（`read_rows()`/`write_rows()`/`read_candidates()`/`latest_candidate_file()`，`utf-8-sig` BOM、`newline=""`）。

- 复核页全选通过，或按字段跑 `scripts/apply_metadata_tags.py --source <来源>` 落地。
- 已经问过且答复是「没有」的番号记在 `_MissCache`，下一轮不重复问。
- 公开资料快照（作品资料、官方样张、预告）抓到一次就永久留在 `generated/jav-public/`，不按天数失效、也不在发行后再补：盘上没有、手动重试或带 `?refresh=1` 才再问来源（`src/peach/jav_cache.py` 的 `cache_fresh()` 只认时间戳是否可信，不判新旧）。策略与目录见[媒体缓存](MEDIA_CACHE.md)。
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

- Cookie、令牌与连接凭据都落本机 `secrets/`，不进账本、不进设置文件、不进日志与诊断包（`support_bundle.redact_log()` 再抹一遍）。
- 不读浏览器的 Cookie 库与历史记录，不代替用户登录或过验证码；站点拒绝就是拒绝，按来源冷却处理。
- 采集不下载媒体字节，不写远端文件系统；改名与移动只走整理（ADR-0039），候选不参与改名。
- 站点结构证据登记在 `docs/reference-sources.json`，按 `cadence` 复查（`scripts/check_reference_updates.py`）。

排障与来源检查的操作步骤见[运行与配置](OPERATIONS.md)和[诊断](DIAGNOSTICS.md)；复用与自研的边界见[复用清单](REUSE.md)。
