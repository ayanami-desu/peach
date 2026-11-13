# ADR-0162：去掉 JAV 详情页的视频预览采集与代理

- 状态：已采纳
- 日期：2026-11-13
- 关系：收窄 ADR-0144 中「JavDB 详情页解析只留给视频预览」的例外；ADR-0159 的匿名接口边界不变

## 背景

JAV 详情页曾把来源站点的预告片当作媒体轮播的一项：DMM 的 `ppvContent.sample2DMovie.highestMovieUrl`、Prestige 的 SKU 接口与 JavDB 详情页的 `<video src>` 三处取地址，登记进 `PreviewCache`，再经 `/jav-preview/{code}/{ref}` 按 Range 代理给浏览器。它还连带一条 HLS 重写链路：把上游 m3u8 改成同源地址、缓存分片清单、刷新签名。

这条链只在详情页点开「视频预览」时有用，却带来几处持续成本：DMM 换 CDN 主机（`cc3001` → `tencc3001`）就让全部地址校验失败；HLS 需要 `m3u8` 依赖与一套按播放列表改写 URL 的测试；代理端还要维护主机白名单与响应类型校验。2026-11-13 决定整块删除，详情页只保留封面与官方样张。

## 决策

- 删除 `jav_official_preview`、`preview_cache`、`frontend/src/player/preview-player` 与 `/jav-preview/{code}/{ref}`，以及 `web_jav_detail` 的 `preview_video_url`、`preview_state`、`preview_message` 投影。
- 删除 `m3u8` 依赖与对应的播放列表重写、签名刷新逻辑。
- 详情页媒体轮播只保留封面与 `preview_count` 张官方样张；`[data-jav-preview-toggle]` 只留给资料页「播放正片」。
- 样张后继不再只由全库任务派发：处理选中文件的任务也执行 `sample_followup.plan`，新入库的作品在下一轮就能补样张。

## 影响

- 详情页不再有视频入口，也不再提示「视频预览未取得」；加载失败提示只服务封面与样张。
- `docs/ROUTES.md` 去掉代理端点；CHANGELOG 记一条移除。
- 已落盘的 `generated/cache/preview:<code>/` 不再被读取，可随缓存清理删除。
