"""取流：预授权地址直接 302，带鉴权的地址原样转发 Range。"""
import asyncio
import unittest

import httpx
from starlette.requests import Request

from peach import drive_stream
from peach.drive_provider import DownloadTarget, DriveAuthRequired, DriveNotFound, DriveUnavailable

BODY = bytes(range(256))


async def collect(response) -> bytes:
    return b"".join([chunk async for chunk in response.body_iterator])


class Provider:
    def __init__(self, target: DownloadTarget):
        self.target = target

    def download_target(self, remote_id: str) -> DownloadTarget:
        return self.target


def request(method: str = "GET", range_header: str | None = None) -> Request:
    headers = [(b"host", b"peach.example")]
    if range_header:
        headers.append((b"range", range_header.encode()))
    return Request({"type": "http", "method": method, "path": "/stream", "headers": headers,
                    "query_string": b"", "http_version": "1.1", "scheme": "http",
                    "server": ("peach.example", 80), "client": ("127.0.0.1", 5)})


class StreamTests(unittest.TestCase):
    def streamer(self, target: DownloadTarget, handler) -> tuple[drive_stream.DriveStreamer, list[httpx.Request]]:
        seen: list[httpx.Request] = []

        def record(request: httpx.Request) -> httpx.Response:
            seen.append(request)
            return handler(request)

        client = httpx.Client(transport=httpx.MockTransport(record))
        return drive_stream.DriveStreamer(lambda location: Provider(target), lambda: client), seen

    def test_redirect_target_hands_bytes_to_browser(self):
        target = DownloadTarget("redirect", "https://cdn.example/v.mp4?sig=1", {})
        streamer, seen = self.streamer(target, lambda request: httpx.Response(500))
        response = streamer.response(request(range_header="bytes=0-1"), "onedrive", "V1", "video/mp4")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.headers["location"], "https://cdn.example/v.mp4?sig=1")
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertEqual(seen, [])

    def test_proxy_forwards_range_and_passes_through_status(self):
        target = DownloadTarget("proxy", "https://api.example/files/V1", {"Authorization": "Bearer t"})

        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(206, stream=httpx.ByteStream(BODY), headers={
                "content-range": "bytes 0-255/4096", "content-length": "256",
                "etag": "e1", "content-type": "application/json"})

        streamer, seen = self.streamer(target, handler)
        response = streamer.response(request(range_header="bytes=0-255"), "gdrive", "V1", "video/mp4")
        self.assertEqual(response.status_code, 206)
        self.assertEqual(response.headers["content-range"], "bytes 0-255/4096")
        self.assertEqual(response.headers["content-type"], "video/mp4")
        self.assertEqual(response.headers["accept-ranges"], "bytes")
        self.assertEqual(seen[0].headers["range"], "bytes=0-255")
        self.assertEqual(seen[0].headers["Authorization"], "Bearer t")
        self.assertEqual(asyncio.run(collect(response)), BODY)

    def test_proxy_never_relays_upstream_error_body(self):
        target = DownloadTarget("proxy", "https://api.example/files/V1", {"Authorization": "Bearer t"})
        streamer, _ = self.streamer(target, lambda request: httpx.Response(
            416, json={"error": "range not satisfiable"}))
        response = streamer.response(request(range_header="bytes=9999-"), "gdrive", "V1", "video/mp4")
        self.assertEqual(response.status_code, 416)
        self.assertEqual(response.body, b"upstream rejected the range request")

    def test_head_returns_headers_without_body(self):
        target = DownloadTarget("proxy", "https://api.example/files/V1", {"Authorization": "Bearer t"})
        streamer, seen = self.streamer(target, lambda request: httpx.Response(
            200, headers={"content-length": "4096", "etag": "e2"}))
        response = streamer.response(request(method="HEAD"), "gdrive", "V1", "video/mp4", download=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-length"], "4096")
        self.assertEqual(response.headers["content-disposition"], "attachment")
        self.assertEqual(seen[0].method, "HEAD")

    def test_read_prefers_partial_content_and_falls_back_to_prefix_slice(self):
        target = DownloadTarget("proxy", "https://api.example/files/V1", {"Authorization": "Bearer t"})
        streamer, seen = self.streamer(target, lambda request: httpx.Response(206, content=BODY))
        self.assertEqual(streamer.read("gdrive", "V1", 0, 16), BODY)
        self.assertEqual(seen[0].headers["range"], "bytes=0-15")

        full = bytes(range(100))
        streamer, _ = self.streamer(target, lambda request: httpx.Response(200, content=full))
        self.assertEqual(streamer.read("gdrive", "V1", 10, 5), full[10:15])

        streamer, _ = self.streamer(target, lambda request: httpx.Response(503))
        with self.assertRaises(OSError):
            streamer.read("gdrive", "V1", 0, 16)

    def test_open_maps_upstream_status_to_drive_errors(self):
        target = DownloadTarget("proxy", "https://api.example/files/V1", {"Authorization": "Bearer t"})
        for status, error in ((404, DriveNotFound), (403, DriveAuthRequired), (500, DriveUnavailable)):
            streamer, _ = self.streamer(target, lambda request, code=status: httpx.Response(code))
            with self.assertRaises(error):
                streamer.open("gdrive", "V1")

    def test_input_url_only_carries_headers_for_proxied_targets(self):
        proxied = DownloadTarget("proxy", "https://api.example/files/V1", {"Authorization": "Bearer t"})
        streamer, _ = self.streamer(proxied, lambda request: httpx.Response(200))
        self.assertEqual(streamer.input_url("gdrive", "V1"),
                         ("https://api.example/files/V1", {"Authorization": "Bearer t"}))

        redirect = DownloadTarget("redirect", "https://cdn.example/v.mp4", {})
        streamer, _ = self.streamer(redirect, lambda request: httpx.Response(200))
        self.assertEqual(streamer.input_url("onedrive", "V1"), ("https://cdn.example/v.mp4", {}))


    def test_build_follows_a_live_lookup_so_a_rebuilt_driver_takes_effect(self):
        # 换过取字节方式之后 `DriveConnections` 会重建驱动实例；抓一份旧表就等于换了没用。
        client = httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(200)))
        now = Provider(DownloadTarget("redirect", "https://cdn.example/a.mp4", {}))
        streamer = drive_stream.build(lambda location: now, lambda: client)
        self.assertEqual("redirect", streamer.target("onedrive", "V1").kind)
        now = Provider(DownloadTarget("proxy", "https://api.example/V1", {"Authorization": "Bearer t"}))
        self.assertEqual("proxy", streamer.target("onedrive", "V1").kind)


if __name__ == "__main__":
    unittest.main()
