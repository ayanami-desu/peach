"""按 asset id 解析网盘上的媒体：可播判定、取字节入口与字幕旁挂。

播放不再经过本机文件系统：客户端拿到的要么是 302 到网盘预授权地址，要么是 Peach 原样
转发的 Range。能否在网页里播放只取决于编解码与容器，与来源无关，判据是扩展名白名单。
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from .drive_provider import DriveAuthRequired, DriveNotFound, DriveUnavailable
from .drive_stream import DriveStreamer
from .repository import LedgerRepository, MediaAsset

#: 浏览器原生可播的容器与编码组合；`video/mp4` 覆盖 `.m4v`。
BROWSER_MIME = {
    ".mp4": "video/mp4",
    ".m4v": "video/mp4",
    ".webm": "video/webm",
    ".ogv": "video/ogg",
    ".ogg": "video/ogg",
}
#: 入库但不是网页可播：能浏览、能复制直链、能交外部播放器。
OTHER_VIDEO_SUFFIXES = frozenset({
    ".mkv", ".avi", ".wmv", ".mov", ".ts", ".m2ts", ".flv", ".mpg", ".mpeg", ".3gp",
})
VIDEO_SUFFIXES = frozenset(BROWSER_MIME) | OTHER_VIDEO_SUFFIXES


def suffix_of(name: str | None) -> str:
    return Path(name or "").suffix.lower()


def browser_mime(name: str | None) -> str | None:
    return BROWSER_MIME.get(suffix_of(name))


@dataclass(frozen=True)
class StreamPlan:
    """协议层播放计划：`redirect` 直连，`proxy` 由 Peach 转发 Range。"""

    protocol: str
    mime_type: str
    reason: str = ""


class MediaNotFound(RuntimeError):
    pass


class MediaUnavailable(RuntimeError):
    """网盘侧拿不到字节：授权失效、文件被删、限流。"""


class MediaEngine:
    def __init__(self, repository: LedgerRepository, streamer: DriveStreamer,
                 cache_root: Path | None = None):
        self.repository = repository
        self.streamer = streamer
        #: 图片与封面这类必须落到本地才能交给 PIL/浏览器缓存的文件。
        self.cache_root = cache_root

    def asset(self, asset_id: int) -> MediaAsset:
        asset = self.repository.media_asset(asset_id)
        if asset is None:
            raise MediaNotFound(asset_id)
        return asset

    def _coerce(self, asset: MediaAsset | int) -> MediaAsset:
        return self.asset(asset) if isinstance(asset, int) else asset

    def file_for(self, asset: MediaAsset | int, thumbnail: bool = False) -> Path:
        """本地可读的一份：`thumbnail=True` 只认已生成的快照，不吃整片下载。"""
        asset = self._coerce(asset)
        if thumbnail:
            path = Path(asset.snapshot_path) if asset.snapshot_path else None
            if path is None or not path.is_file():
                raise MediaUnavailable(asset.id)
            return path
        location, remote_id = self._drive(asset)
        if self.cache_root is None:
            raise MediaUnavailable(asset.id)
        target = self.cache_root / location / f"{remote_id}{suffix_of(asset.name or asset.path)}"
        if target.is_file():
            return target
        target.parent.mkdir(parents=True, exist_ok=True)
        target = self._download(location, remote_id, target, asset.id)
        return target

    def _download(self, location: str, remote_id: str, target: Path, asset_id: int) -> Path:
        import os
        import tempfile

        try:
            response = self.streamer.open(location, remote_id)
        except (DriveNotFound, DriveAuthRequired, DriveUnavailable) as exc:
            raise MediaUnavailable(asset_id) from exc
        handle, temporary = tempfile.mkstemp(dir=str(target.parent), suffix=".part")
        try:
            with os.fdopen(handle, "wb") as sink:
                for chunk in response.iter_bytes(256 * 1024):
                    sink.write(chunk)
            os.replace(temporary, target)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
            response.close()
        return target

    def _drive(self, asset: MediaAsset) -> tuple[str, str]:
        if not asset.location or not asset.remote_id:
            # 旧来源的行与本地磁盘行都进不来：它们没有远端 id，取字节的入口不成立。
            raise MediaUnavailable(asset.id)
        return asset.location, asset.remote_id

    def plan(self, asset_id: int) -> StreamPlan:
        asset = self.asset(asset_id)
        location, remote_id = self._drive(asset)
        mime = browser_mime(asset.name or asset.path)
        if mime is None:
            raise MediaUnavailable(asset.id)
        return StreamPlan("range", mime, "drive-range")

    def response(self, request, asset: MediaAsset, *, download: bool = False):
        location, remote_id = self._drive(asset)
        mime = browser_mime(asset.name or asset.path)
        if mime is None:
            raise MediaUnavailable(asset.id)
        try:
            return self.streamer.response(request, location, remote_id, mime, download=download)
        except DriveNotFound:
            raise MediaUnavailable(asset.id) from None
        except (DriveAuthRequired, DriveUnavailable) as exc:
            raise MediaUnavailable(asset.id) from exc

    def read(self, asset: MediaAsset, offset: int, length: int) -> bytes:
        location, remote_id = self._drive(asset)
        try:
            return self.streamer.read(location, remote_id, offset, length)
        except (DriveNotFound, DriveAuthRequired, DriveUnavailable) as exc:
            raise MediaUnavailable(asset.id) from exc

    def ffmpeg_input(self, asset: MediaAsset) -> tuple[str, dict[str, str]]:
        """FFmpeg 的输入地址与请求头；探测与抽帧都不落本地文件。"""
        location, remote_id = self._drive(asset)
        try:
            return self.streamer.input_url(location, remote_id)
        except (DriveNotFound, DriveAuthRequired, DriveUnavailable) as exc:
            raise MediaUnavailable(asset.id) from exc
