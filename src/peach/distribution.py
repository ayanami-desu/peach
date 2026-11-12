"""分发形态（Docker 镜像与源码部署）的判定。"""
from __future__ import annotations

import os


def docker() -> bool:
    """官方镜像在 Dockerfile 里设了 `PEACH_DISTRIBUTION=docker`。"""
    return os.environ.get("PEACH_DISTRIBUTION") == "docker"
