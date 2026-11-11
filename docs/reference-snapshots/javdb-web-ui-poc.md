# JavDB Web UI 只读验证

验证日期：2026-10-11 至 12。入口：<https://catembylegacy.fastcdn.dpdns.org/>。
本文件是人工取证笔记，不登记进 `docs/reference-sources.json`：记录的是实际请求结果，
不是可重复抓取并锁定哈希的上游文档，也不作为可被上游更新覆盖的快照。

## 结论

该地址提供独立的 JavDB API 前端，匿名搜索、样本详情、人物资料与图片可读。
完整数据、持续访问和不限流均未证明。不能把它作为现有 JavDB HTML 解析器的替换域名。

作品资料可复用现有的封面与人物引用；来源数据需要独立适配器。
基础字段按作品身份一次取回并永久保存，同时保留来源和未取得状态。
未入库作品不能直接套用要求本地资产 ID 和播放器的馆藏详情。

## 实测

本机通过严格 TLS 校验的 HTTPX 读取公开前端与匿名 API；HTML/API 共 11 次 GET，
顺序访问间隔至少 3 秒，另读取静态 JavaScript 并执行一次图片 HEAD。未使用登录凭据，
未写配置或 ledger，未下载或展示成人图片。Web 工具返回 `not accessible`，本机通道取得响应。

| 验证面 | 实测结果 |
| --- | --- |
| 首页 | HTTP 200，1,781 B，标题为 `JavDB Web UI`，React 应用外壳，无原站作品卡片 |
| 搜索 | HTTP 200，业务状态 `success=1`，匿名返回 10 条作品 |
| 详情 | `ABW-358` 身份匹配，HTTP 200，业务状态 `success=1` |
| 人物 | `/v1/actors/KxPb` HTTP 200、`success=1`，含身份、别名、生日、体型与社媒字段结构 |
| 图片 | 封面 HEAD 200，`binary/octet-stream`，476,969 B；未读取图片正文，解码与像素未验证 |
| 登录与 VIP | 匿名搜索、详情可读；详情 `show_vip_banner=true`，前端支持登录与 VIP 状态 |

人物与图片请求无 query/body、Authorization 或 Cookie，仅使用公开 `jdsignature` 头，
每个端点请求一次，未出现登录、VIP 错误或权限标志。

样本有值：番号、标题、原始标题、封面、缩略图、时长、评分、发行日期、片商、发行商、
系列、6 个标签、演员、10 张预览图、预览视频入口与播放源。
`summary`、`director_name`、个人 `review` 为空；无法区分来源缺失与样本本来没有。

## 接口与域名

公开前端的 API 根地址为 `https://jdforrepam.com/api`，封面与缩略图指向 `tp.spfcas.com`，
首页统计脚本来自 `static.cloudflareinsights.com`。

| 接口路径 | 验证范围 |
| --- | --- |
| `/v2/search` | 实际匿名请求成功 |
| `/v4/movies/{id}` | 实际匿名请求成功 |
| `/v1/actors/{id}` | 样本匿名请求成功 |

请求需要公开前端算法生成的 `jdsignature`。未提供时 HTTP 200，但业务状态为 `success=0`、
`ParameterInvalid`，提示 `參數不能爲空: jdsignature`。HTTP 状态不能代替业务状态验证。
接口与签名可能变化，现有 3 秒间隔和来源冷却应保留；本轮没有进行压测。

## Peach 当前资料与外链

作品资料保存番号、标题、出演者、厂牌、发行日和封面；评分、简介、标签和预览图
尚未随作品资料保存。固定人物入口为 JavDB、MISSAV、みんなのAV，另有 ledger 中已登记的
官网、社媒与资料站，如 X、Instagram、Patreon、Babepedia、IAFD。敏感来源与失效链接不下发地址。
固定入口不等同于全部来源采集能力。

## 站内作品资料

`/api/jav/detail` 以作品番号为身份返回作品资料；`/api/jav/cover` 与 `/api/jav/samples` 负责封面与样张，抓到一次就永久保存。
资料与图片缓存保留在有界内存，不回写 ledger。

独立适配器在 `ABW-358` 取回封面正文并解码为 JPEG 840×566，首张预览图为 JPEG 560×840。
公开图片支持原始图像、首字节 XOR 和固定 `0x7f` XOR；输出必须由 Pillow 完整解码后才能展示。
重放证据为工作树 `build/verify-jav-public.py` 与脱敏 `build/jav-public-result.json`，来源请求使用严格 TLS。
公开前端常量只留内存，不带登录 Cookie 或 Authorization；访问失败只显示实际取得状态。
请求保留 3 秒主机间隔、失败冷却和缓存，未进行压测，未新增运行依赖。
