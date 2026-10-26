"""Web 请求的本机访问判断；配置与本地播放器共用。"""
from __future__ import annotations

import ipaddress
import os

from fastapi import Request

from . import distribution, tunnel


def managed_configuration() -> bool:
    """托盘或无桌面入口负责消费配置保存后的重载标记。"""
    return (distribution.standalone() or os.environ.get("PEACH_TRAY_MANAGED") == "1"
            or os.environ.get("PEACH_HEADLESS_MANAGED") == "1")


def tunnel_forwarded(request: Request) -> bool:
    """隧道转发请求按公网来源处理。"""
    return tunnel.from_edge(getattr(request.app.state, "tunnel", None), request.headers)


def local_client(request: Request) -> bool:
    """系统对话框与诊断的物理本机检查；不用于配置管理授权。"""
    if not request.client or tunnel_forwarded(request):
        return False
    server = request.scope.get("server")
    try:
        peer = ipaddress.ip_address(request.client.host)
        bound = ipaddress.ip_address(server[0]) if server else None
    except ValueError:
        bound = None
        try:
            peer = ipaddress.ip_address(request.client.host)
        except ValueError:
            return False
    if not peer.is_loopback and (peer != bound or peer.is_unspecified):
        return False
    if managed_configuration():
        name = request.app.state.settings.mdns_name.lower().removesuffix(".local")
        hosts = {"127.0.0.1", "localhost", "::1", f"{name}.local"}
        if bound and not bound.is_unspecified:
            hosts.add(str(bound))
        if (request.url.hostname or "").lower().rstrip(".") not in hosts:
            return False
    return True
