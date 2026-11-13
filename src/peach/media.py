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
#: 网页播不了、播放器自己解的容器。外链照发，不按格式拦。
OTHER_VIDEO_MIME = {
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".wmv": "video/x-ms-wmv",
    ".mov": "video/quicktime",
    ".ts": "video/mp2t",
    ".m2ts": "video/mp2t",
    ".flv": "video/x-flv",
    ".mpg": "video/mpeg",
    ".mpeg": "video/mpeg",
    ".3gp": "video/3gpp",
}
OTHER_VIDEO_SUFFIXES = frozenset(OTHER_VIDEO_MIME)
VIDEO_SUFFIXES = frozenset(BROWSER_MIME) | OTHER_VIDEO_SUFFIXES
#: 外部播放器能解的容器：网页可播的那几个之外，再加下面这张表。
PLAYER_MIME = {**BROWSER_MIME, **OTHER_VIDEO_MIME}


def suffix_of(name: str | None) -> str:
    return Path(name or "").suffix.lower()


def browser_mime(name: str | None) -> str | None:
    return BROWSER_MIME.get(suffix_of(name))


def player_mime(name: str | None) -> str | None:
    return PLAYER_MIME.get(suffix_of(name))


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
        location, root, remote_id = self._drive(asset)
        if self.cache_root is None:
            raise MediaUnavailable(asset.id)
        target = self.cache_root / location / f"{remote_id}{suffix_of(asset.name or asset.path)}"
        if target.is_file():
            return target
        target.parent.mkdir(parents=True, exist_ok=True)
        target = self._download(location, root, remote_id, target, asset.id)
        return target

    def _download(self, location: str, root: str, remote_id: str, target: Path,
                  asset_id: int) -> Path:
        import os
        import tempfile

        try:
            response = self.streamer.open(location, root, remote_id)
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

    def _drive(self, asset: MediaAsset) -> tuple[str, str, str]:
        """`(来源类型, 扫描起点, 远端 id)`：同一个来源可以接多个账号，取字节要看扫描起点。"""
        if not asset.location or not asset.remote_id:
            # 旧来源的行与本地磁盘行都进不来：它们没有远端 id，取字节的入口不成立。
            raise MediaUnavailable(asset.id)
        return asset.location, asset.drive_root or "", asset.remote_id

    def plan(self, asset_id: int, *, any_container: bool = False) -> StreamPlan:
        """`any_container` 给外链与 M3U 用：网页播不了的容器照样能签出去。"""
        asset = self.asset(asset_id)
        self._drive(asset)  # 没有远端 id 的行连计划都不该成立
        mime = (player_mime if any_container else browser_mime)(asset.name or asset.path)
        if mime is None:
            raise MediaUnavailable(asset.id)
        return StreamPlan("range", mime, "drive-range")

    def response(self, request, asset: MediaAsset, *, download: bool = False,
                 any_container: bool = False):
        location, root, remote_id = self._drive(asset)
        mime = (player_mime if any_container else browser_mime)(asset.name or asset.path)
        if mime is None:
            raise MediaUnavailable(asset.id)
        try:
            return self.streamer.response(request, location, root, remote_id, mime, download=download)
        except DriveNotFound:
            raise MediaUnavailable(asset.id) from None
        except (DriveAuthRequired, DriveUnavailable) as exc:
            raise MediaUnavailable(asset.id) from exc

    def read(self, asset: MediaAsset, offset: int, length: int) -> bytes:
        location, root, remote_id = self._drive(asset)
        try:
            return self.streamer.read(location, root, remote_id, offset, length)
        except (DriveNotFound, DriveAuthRequired, DriveUnavailable) as exc:
            raise MediaUnavailable(asset.id) from exc

    def ffmpeg_input(self, asset: MediaAsset | int) -> tuple[str, dict[str, str]]:
        """FFmpeg 的输入地址与请求头；探测与抽帧都不落本地文件。"""
        asset = self._coerce(asset)
        location, root, remote_id = self._drive(asset)
        try:
            return self.streamer.input_url(location, root, remote_id)
        except (DriveNotFound, DriveAuthRequired, DriveUnavailable) as exc:
            raise MediaUnavailable(asset.id) from exc
