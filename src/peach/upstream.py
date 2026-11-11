"""按主机白名单转发上游字节；自己跟重定向，绝不把凭据带出白名单。

这一层只服务 `/cover-image` 与 `/jav-preview` 这类「地址在服务端拼出来」的只读取图：
上游地址、签名与跳转都不外露，浏览器只看得到 Peach 的同源路径。
"""
from __future__ import annotations

import urllib.parse
from dataclasses import dataclass
from typing import Mapping

import httpx

from .http import public_https_url, resolves_publicly
from .user_agent import USER_AGENT

#: 代理层允许跟几跳重定向。归档站的主域会 302 到实际取文件的节点，所以必须跟；
#: 但每一跳都要重新过白名单。
MAX_PROXY_REDIRECTS = 3
_REDIRECT_STATUSES = frozenset({301, 302, 303, 307, 308})


class UpstreamError(RuntimeError):
    """上游存在但这一次代理不成立：状态码不对、重定向出界或传输失败。"""

    def __init__(self, message: str, *, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


@dataclass(frozen=True)
class UpstreamTarget:
    url: str
    referer: str | None = None
    headers: Mapping[str, str] | None = None
    #: 这条媒体允许落到哪些主机后缀。代理层跟重定向时每一跳都按它校验：`headers`
    #: 里可能带 Cookie / Bearer token，一旦上游把我们指到别的主机，那些凭据就跟着
    #: 送出去了。空表示不允许代理。
    allowed_hosts: tuple[str, ...] = ()
    #: 允许落到任意公网主机。给帖子里贴的第三方图床用：图站有几十家，白名单追不上；
    #: 这类媒体不带凭据取，跳到哪个公网主机都泄露不了什么，所以它与 `headers` 互斥。
    #: 边界由 `http.public_https_url` 与 `http.resolves_publicly` 守：明文、IP 字面量、
    #: 本机与局域网名字、解析到内网地址的主机仍然拒收。
    public_hosts: bool = False

    def __post_init__(self) -> None:
        if self.public_hosts and self.headers:
            raise ValueError("带凭据的媒体不能放行任意公网主机")


def _allowed_resource(url: str, hosts: tuple[str, ...]) -> bool:
    try:
        parsed = urllib.parse.urlsplit(url)
    except ValueError:
        return False
    host = (parsed.hostname or "").casefold()
    return (parsed.scheme == "https" and not parsed.username and not parsed.password
            and any(host == suffix or host.endswith("." + suffix) for suffix in hosts))


def _hop_allowed(target: UpstreamTarget, url: str) -> bool:
    """代理的每一跳（含第一跳）都过这一关：白名单主机直接放行；公网模式还要域名字面
    像公网、解析出来也全是公网地址。解析放在连接前而不是解析时，是因为存量行的
    地址可能躺了几个月，域名早已换主。"""
    if _allowed_resource(url, tuple(target.allowed_hosts)):
        return True
    if not target.public_hosts or not public_https_url(url):
        return False
    return resolves_publicly(urllib.parse.urlsplit(url).hostname or "")


def proxy_request_headers(target: UpstreamTarget,
                          incoming: Mapping[str, str]) -> dict[str, str]:
    """代理请求要带的头。只透传范围请求相关的那两个，别的一律由这里决定。"""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": incoming.get("accept") or "*/*",
        "Accept-Encoding": "identity",
    }
    if target.referer:
        headers["Referer"] = target.referer
    headers.update(target.headers or {})
    for name in ("range", "if-range"):
        value = incoming.get(name)
        if value:
            headers[name.title()] = value
    return headers


def open_upstream(client: httpx.Client, method: str, target: UpstreamTarget, *,
                  incoming: Mapping[str, str], allowed=None, accepted_statuses=(),
                  strip_credentials=False) -> httpx.Response:
    """打开上游媒体流；只在拿到可转发的 2xx 时返回。

    这里自己跟重定向而不是交给 client 的 `follow_redirects`：`target.headers` 可能
    带着 Cookie 或 Bearer token，httpx 跟跳时会把请求头一路带过去，上游只要回一个
    指向别处的 Location 就能把凭据换走。所以每一跳都重新过 `target.allowed_hosts`，
    出界直接失败，绝不带着凭据再发一次。

    非 2xx 同样在这里终止：上游的 403 页面、限流提示或错误 JSON 转发给浏览器毫无
    用处，只会把上游的状态与正文（可能含主机名、提示语）原样交出去。
    """
    if allowed is None and not target.allowed_hosts and not target.public_hosts:
        raise UpstreamError("这条媒体没有可代理的主机白名单")
    url = target.url
    headers = proxy_request_headers(target, incoming)
    response: httpx.Response | None = None
    for _ in range(MAX_PROXY_REDIRECTS + 1):
        if not (allowed(url) if allowed is not None else _hop_allowed(target, url)):
            raise UpstreamError("媒体地址不在可代理的主机范围内" if url == target.url
                                else "上游把媒体重定向到了不受信任的地址")
        request = client.build_request(method, url, headers=headers)
        if strip_credentials:
            for name in ('cookie', 'authorization', 'proxy-authorization'):
                request.headers.pop(name, None)
        response = client.send(request, stream=True, follow_redirects=False)
        if response.status_code not in _REDIRECT_STATUSES:
            break
        location = response.headers.get("location") or ""
        response.close()
        response = None
        url = urllib.parse.urljoin(url, location)
    if response is None:
        raise UpstreamError("上游重定向次数过多")
    if not 200 <= response.status_code < 300 and response.status_code not in accepted_statuses:
        status = response.status_code
        response.close()
        raise UpstreamError(f"上游返回 HTTP {status}", status_code=status)
    return response
