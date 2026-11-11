# 外部播放器与 VR

Peach 只对网页能直接播放的容器签发外链：`.mp4`、`.m4v`、`.webm`、`.ogv`、`.ogg`。其他容器入库后可以在详情页看到条目，但签发接口会以 404 拒绝。外部播放通过两条限时链接完成：M3U 播放列表和网络播放地址。

## 生成链接

`POST /api/external-playback?id=<资产 id>` 需要登录，并随 `require_auth` 接受同源检查：跨站页面发起的请求返回 403「请从 Peach 配置页提交」，没有凭据返回 401。请求体不参与判定，地址只由资产 id 决定。

| 情形 | 响应 |
| --- | --- |
| 资产不存在 | 404 `{"error": "no such id"}` |
| 容器不支持外链，或资产缺少网盘位置 | 404 `{"error": "unavailable"}` |
| Origin 无法解析 | 400「播放地址无效」 |
| 成功 | `{"url": …, "playlist": …, "expires_in": 21600}` |

成功响应返回相对路径 `/external-stream/<id>?ticket=…&origin=…` 与 `/external-playlist/<id>.m3u?ticket=…&origin=…`，页面按当前 origin 拼成完整地址；响应头为 `Cache-Control: no-store`。详情页的两个选项对应这两条路径：「M3U 播放列表」下载 `peach-<id>.m3u`，「网络播放地址 / VR」只显示可复制的地址。

## 票据

票据形如 `<过期秒>.<签名>`。签名是对字符串 `"<资产 id>.<过期秒>.<origin>"` 做的 HMAC-SHA256 十六进制摘要，密钥是进程启动时生成的 32 字节随机数。

- 有效期 6 小时。校验条件为「当前时间早于过期秒」且「过期秒不晚于当前时间加 6 小时」，把过期时间往后改不会通过。
- 密钥只存在进程内存里。Peach 重启后，此前发出的链接一律失效。
- `origin` 参与签名，改主机名或端口都要重新生成。签名不绑定客户端地址：拿到完整链接的任何人，在有效期内都能取到字节。

## Origin 的选择

页面请求带的 `Origin` 头优先，没有该头时用 `request.base_url`。取值必须能解析成 http 或 https 地址：要有主机名，路径为空或 `/`，不带查询串与片段；带用户名密码、含控制字符或在 Origin 头里无法解析时，签发接口返回 400「播放地址无效」。默认端口 80、443 会被归一化去掉，IPv6 主机名重新加方括号，票据里存的就是这个归一化后的地址。

## 取流

`GET /external-stream/<id>?ticket=…&origin=…`（也接受 HEAD）不需要登录，只认票据。`origin` 为空或票据校验失败返回 401「播放链接已失效，请在作品详情重新打开」。通过后按资产位置分流：

- OneDrive：返回 302，`Location` 是网盘给出的预授权地址，响应头 `Cache-Control: no-store`。字节由播放器直连网盘，不经过 Peach。
- Google Drive：由 Peach 转发 Range 请求。客户端带的 `Range` 原样转发，只回传 `content-length`、`content-range`、`accept-ranges`、`etag`、`last-modified`；`content-type` 取资产扩展名对应的媒体类型，并声明 `accept-ranges: bytes`，`cache-control: private, max-age=0, no-store`。分块大小 256 KiB，边读边发。

上游拒绝（状态码 400 及以上）时照搬状态码，正文固定为 `upstream rejected the range request`，不透传网盘错误体。这条端点不设 `Referrer-Policy`，也不带网页播放那组媒体安全响应头。

## 播放列表

`GET /external-playlist/<id>.m3u?ticket=…&origin=…` 同样只验票据，返回三行：

```
#EXTM3U
#EXTINF:-1,Peach <id>
<origin>/external-stream/<id>?ticket=…&origin=…
```

`Content-Type` 为 `audio/x-mpegurl`，`Content-Disposition` 为 `attachment; filename="peach-<id>.m3u"`，另有 `Cache-Control: no-store` 与 `Referrer-Policy: no-referrer`。列表里的绝对地址由签名中的 origin 拼出，反向代理改写 Host 不会把内网地址写进列表。

## 使用边界

- 链接只覆盖票据对应的那一个资产，不含网盘路径、网盘访问凭据或长期登录凭据。
- 另一台设备要能访问签发链接时用的地址：在 `localhost` 上生成的地址手机打不开，需要换成这台机器在局域网里的地址再生成。
- 容器与编码由外部播放器自己解码，Peach 只发原始字节，不做转码、切片或缓存。
- 生成链接不计入观看记录，也不能证明播放器已经开始播放。
- 服务端不提供本机播放器检测或唤起接口，播放器需要自己打开链接或下载的 M3U 文件。
