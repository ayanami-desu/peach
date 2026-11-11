"""按 `DownloadTarget` 取字节：能 302 的直接交给浏览器，必须带鉴权的由 Peach 转发 Range。

两种形态是同一条协议的两个分支，差异只在 `kind`：

- `redirect`：网盘给的是预授权地址（OneDrive 的 `@microsoft.graph.downloadUrl`）。浏览器
  自己连，字节不经过 Peach，本机带宽只花在目录与元数据上。
- `proxy`：地址必须带 Bearer（Google Drive 的 `alt=media`）。Peach 原样转发客户端的
  `Range`，把上游的 200/206、`Content-Range`、`Content-Length` 透回去；拖进度条仍然是
  客户端发新 Range，服务端没有转码也没有分片。
"""
from __future__ import annotations

from typing import Callable, Iterator, Mapping

import httpx
from fastapi import Request
from fastapi.responses import RedirectResponse, Response, StreamingResponse

from .drive_provider import (
    DownloadTarget,
    DriveAuthRequired,
    DriveNotFound,
    DriveProvider,
    DriveUnavailable,
)

#: 转发时透传的响应头。`content-type` 由调用方按资产的 mime 给，不走上游。
PASSTHROUGH = ("content-length", "content-range", "accept-ranges", "etag", "last-modified")
#: 单次从上游读多少字节再交给客户端。
CHUNK = 256 * 1024


class DriveStreamer:
    """把资产的 `DownloadTarget` 变成 HTTP 响应；`read` 给 ffprobe 与抽帧按段取字节。"""

    def __init__(self, providers: Callable[[str], DriveProvider], client: Callable[[], httpx.Client]):
        self._providers = providers
        self._client = client

    def target(self, location: str, remote_id: str) -> DownloadTarget:
        return self._providers(location).download_target(remote_id)

    def response(self, request: Request, location: str, remote_id: str,
                 mime: str, *, download: bool = False) -> Response:
        target = self.target(location, remote_id)
        if target.kind == "redirect":
            return RedirectResponse(target.url, status_code=302, headers={"Cache-Control": "no-store"})
        return self._proxy(request, target, mime, download=download)

    def _proxy(self, request: Request, target: DownloadTarget, mime: str,
               *, download: bool) -> Response:
        headers = dict(target.headers)
        range_header = request.headers.get("range")
        if range_header:
            headers["Range"] = range_header
        client = self._client()
        if request.method == "HEAD":
            upstream = client.head(target.url, headers=headers, timeout=60)
            try:
                return Response(status_code=upstream.status_code, media_type=mime,
                                headers=self._headers(upstream, mime, download=download, head=True))
            finally:
                upstream.close()
        upstream = client.send(client.build_request("GET", target.url, headers=headers), stream=True)
        if upstream.status_code >= 400:
            status = upstream.status_code
            upstream.close()
            # 上游拒绝不给正文：它的错误体是各家格式，透传出去只是噪音。
            return Response(status_code=status, media_type="text/plain",
                            content="upstream rejected the range request")
        return StreamingResponse(
            self._chunks(upstream),
            status_code=upstream.status_code,
            media_type=mime,
            headers=self._headers(upstream, mime, download=download, head=False),
        )

    @staticmethod
    def _headers(upstream: httpx.Response, mime: str, *, download: bool, head: bool) -> dict[str, str]:
        out = {key: upstream.headers[key] for key in PASSTHROUGH if key in upstream.headers}
        out["content-type"] = mime
        out["accept-ranges"] = "bytes"
        out["cache-control"] = "private, max-age=0, no-store"
        if download:
            out["content-disposition"] = "attachment"
        return out

    @staticmethod
    def _chunks(upstream: httpx.Response) -> Iterator[bytes]:
        try:
            for chunk in upstream.iter_raw(CHUNK):
                if chunk:
                    yield chunk
        finally:
            upstream.close()

    def open(self, location: str, remote_id: str) -> httpx.Response:
        """完整取一份字节（图片落缓存用）。上游拒绝时按状态码转成领域异常。"""
        target = self.target(location, remote_id)
        client = self._client()
        response = client.send(
            client.build_request("GET", target.url, headers=dict(target.headers)),
            stream=True, follow_redirects=True,
        )
        if response.status_code >= 400:
            status = response.status_code
            response.close()
            if status == 404:
                raise DriveNotFound(remote_id)
            if status in {401, 403}:
                raise DriveAuthRequired(location)
            raise DriveUnavailable(f"upstream {status}")
        return response

    def read(self, location: str, remote_id: str, offset: int, length: int,
             *, timeout: float = 60.0) -> bytes:
        """按段取字节，给 ffprobe 与时间轴抽帧用。上游不支持 Range 时退化成整段前缀截取。"""
        target = self.target(location, remote_id)
        headers = dict(target.headers)
        headers["Range"] = f"bytes={offset}-{offset + length - 1}"
        response = self._client().get(target.url, headers=headers, timeout=timeout)
        if response.status_code == 206:
            return response.content
        if response.status_code == 200:
            return response.content[offset:offset + length]
        raise OSError(f"range read failed: {response.status_code}")

    def input_url(self, location: str, remote_id: str) -> tuple[str, dict[str, str]]:
        """给 FFmpeg 的输入地址与请求头；`redirect` 形态没有头。"""
        target = self.target(location, remote_id)
        if target.kind == "redirect":
            return target.url, {}
        return target.url, dict(target.headers)


def build(providers: Mapping[str, DriveProvider] | Callable[[str], DriveProvider],
          client: Callable[[], httpx.Client]) -> DriveStreamer:
    """`providers` 可以是一张表，也可以是一句「按来源取当前驱动」——后者才对得上会重建的驱动实例。"""
    resolve = providers if callable(providers) else (lambda location: providers[location])
    return DriveStreamer(resolve, client)
