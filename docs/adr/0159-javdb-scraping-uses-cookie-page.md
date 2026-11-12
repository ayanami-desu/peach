# ADR-0159：JavDB 刮削改用 Cookie 详情页，匿名接口只留探索

- 状态：已采纳
- 日期：2026-11-12
- 关系：取代 [ADR-0144](0144-javdb-scraping-uses-the-anonymous-api.md) 的决策一；保留 ADR-0144 的类别映射、身份核对、失败分档与字段写法；[ADR-0148](0148-javdb-api-host-and-signature-fallback.md) 的接口主机冷却只作用于馆藏探索与作品资料。

## 背景

ADR-0144 把 JavDB 刮削改成匿名接口，理由是详情页要 Cookie、受登录墙和按出口 IP 的配额限制。2026-11-12，匿名接口开始对作品查询返回：

```json
{"success":0,"action":"JWTVerificationError","message":"請登錄帳號驗證","data":null}
```

`javdb_public._json()` 原先把所有业务 `success != 1` 都当成来源限流，设 60 秒全局暂停。一次登录校验失败后，同一轮里后面的作品都在暂停窗口内被短路成 `PublicSourcePaused`，任务摘要因此写成“4 项来源限流”，与实际的 401 语义不符。

详情页路径 `JavDBSource` 已有 Cookie 支持和登录页识别（`LOGIN` → `SourceFailure(AUTH_REQUIRED)`），`scraping_access.SOURCES["javdb"]` 也一直保留 `cookie`/`session`。现有 Cookie 配置可以直接复用，不需要新会话或新的凭据界面。

## 决策

**一、刮削改用详情页。** `SITE_SOURCES['javdb']` 登记 `JavDBSource`，解析器名记为 `javdb-page`。请求走 `javdb.com` 的搜索页与详情页，沿用该来源既有的 Cookie 注入与 `blocked_pause` 冷却。`JavDBPublicSource` 不再参与元数据刮削，只保留给馆藏探索与作品资料使用。

**二、鉴权失败单独分档。** `javdb_public` 新增 `PublicAuthRequired(PublicSourceUnavailable)`：登录校验失败时设置一个短时的 `auth_until` 并抛该异常，后续请求在窗口内直接失败，不再发 HTTP；窗口内不写 `paused_until`。`JavDBPublicSource.query` 把 `PublicAuthRequired` 翻成 `SourceFailure(AUTH_REQUIRED, "javdb 要求登录")`。其他业务失败也不设全局 60 秒暂停，按普通的未取得/网络失败处理。

**三、没有 Cookie 就报登录。** 详情页遇到登录墙时按 `AUTH_REQUIRED` 记账，任务里显示“javdb 要求登录”，提示用户去“来源和凭证”配置 Cookie；不回退匿名接口。匿名接口当前对所有元数据查询都要求登录，回退只会重复撞墙，并让候选的解析器名与实际取法不一致。

**四、其余规则不变。** 类别 id 映射、番号身份、出演者次序、字段优先级和失败分档继续按 ADR-0144；详情页自身的冷却与主机间隔继续按 `scraping_access`，匿名接口的 15 分钟主机冷却继续按 ADR-0148，只影响探索与作品资料。

## 影响

- 刮削现在依赖 JavDB Cookie；没配 Cookie 的作品会以可重试的 `auth` 问题留下，不再伪装成“来源限流”。
- 已落库的 `javdb` 值不需要失效；`sources/library-metadata/<番号>-javdb.json` 形状不变。新候选的 `provider` 是 `javdb-page`，旧候选的 `javdb-api` 仍可按来源撤回。
- 详情页请求占用 `javdb.com` 的出口配额，遵守既有的 3 秒主机间隔；匿名接口仍只服务探索与作品资料。
