"""内置网盘驱动的统一协议。Google Drive 与 OneDrive 各实现一份，测试用夹具实现同一份。

协议只描述「一个已授权的账号能做什么」。取字节这件事由 `drive_stream` 按
`DownloadTarget` 决定：能直连的交给浏览器，必须带鉴权的由 Peach 转发 Range。
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Mapping, Protocol, Sequence

GOOGLE = "gdrive"
ONEDRIVE = "onedrive"

#: 内置驱动。`asset.location` 只允许出现这两个值；旧账本里的其他来源只读展示。
LOCATIONS: tuple[str, ...] = (GOOGLE, ONEDRIVE)

#: 取字节的两种方式：`redirect` 交给浏览器跟预授权地址走，`proxy` 由 Peach 带着 Range 转发。
REDIRECT = "redirect"
PROXY = "proxy"
PLAYBACK_MODES: tuple[str, ...] = (REDIRECT, PROXY)
#: 能直连的来源。Google 的 `alt=media` 必须带 Bearer，令牌不能交给浏览器。
REDIRECTABLE: frozenset[str] = frozenset({ONEDRIVE})
#: 每个来源的默认方式：能直连就直连，不占服务器流量。
DEFAULT_MODES: Mapping[str, str] = {GOOGLE: PROXY, ONEDRIVE: REDIRECT}


def modes_for(location: str) -> tuple[str, ...]:
    """这个来源能选哪些方式：能直连的两个都给，只能带鉴权取的只剩转发。"""
    return PLAYBACK_MODES if location in REDIRECTABLE else (PROXY,)


def playback_mode(configured: Mapping[str, str] | None, location: str) -> str:
    """这个来源当前该用哪种方式；文件里配了用不了的组合时退回默认值。"""
    mode = (configured or {}).get(location, "")
    if mode in PLAYBACK_MODES and mode in modes_for(location):
        return mode
    return DEFAULT_MODES.get(location, PROXY)


@dataclass(frozen=True)
class DriveAccount:
    """一个已授权账号的稳定身份。`account_id` 由各家自己给，重新授权不会变。"""

    location: str
    account_id: str
    email: str
    display_name: str
    #: 扫描起点：My Drive 根、共享云端硬盘，或 OneDrive 的 root item。
    root_id: str


@dataclass(frozen=True)
class DriveEntry:
    """目录项。文件夹不带大小；视频的大小与时长来自列表响应，不额外发请求。"""

    remote_id: str
    name: str
    parent_id: str
    folder: bool
    size: int | None = None
    modified: str | None = None
    mime: str | None = None
    duration: float | None = None
    width: int | None = None
    height: int | None = None


@dataclass(frozen=True)
class DownloadTarget:
    """取字节的两种形态。

    `redirect` 是预授权的直连地址，浏览器 302 过去就行；`proxy` 必须由 Peach 带
    `headers` 转发，Google Drive 的 `alt=media` 属于这种。
    """

    kind: str
    url: str
    headers: dict[str, str] = field(default_factory=dict)
    #: 预授权地址的过期时刻（Unix 秒）。过期后重新问一次。
    expires_at: int | None = None


@dataclass(frozen=True)
class Change:
    """增量变更：`entry` 为 None 且 `removed` 为真表示这一项已经不在了。"""

    remote_id: str
    removed: bool
    entry: DriveEntry | None = None


class DriveError(RuntimeError):
    pass


class DriveAuthRequired(DriveError):
    """授权失效：refresh token 被撤销、账号被停用，或权限范围不够。"""


class DriveUnavailable(DriveError):
    """可重试：限流、5xx、网络中断。"""


class DriveNotFound(DriveError):
    pass


class DriveForbidden(DriveError):
    """文件或目录存在但当前账号没有权限。"""


class DriveProvider(Protocol):
    """一个已授权账号的读写入口。实现里的每个方法只做一次远端往返。"""

    location: str
    account: DriveAccount

    def list_folder(
        self, parent_id: str, cursor: str | None = None,
    ) -> tuple[Sequence[DriveEntry], str | None]:
        """列出直接子项，返回本页条目与下一页游标（None 表示列完）。"""

    def identify(self, token: str) -> tuple[str, str, str, str]:
        """拿一个访问令牌问出账号身份：账号 id、邮箱、显示名、根目录 id。

        手工填凭据接入时用它补全账号视图，不经过授权回调。"""
        ...

    def entry(self, remote_id: str) -> DriveEntry:
        """按 id 取单个目录项。文件已删除时抛 `DriveNotFound`。"""

    def download_target(self, remote_id: str) -> DownloadTarget:
        """取得这个文件的字节入口。每次调用都可能重新问一次预授权地址。"""

    def move(self, remote_id: str, parent_id: str, name: str | None = None) -> DriveEntry:
        """移动到 `parent_id` 下，`name` 为 None 时保留原名。"""

    def delete(self, remote_id: str) -> None:
        """把文件移到网盘自己的回收站；文件已经不在时抛 `DriveNotFound`。"""

    def changes(self, cursor: str | None) -> tuple[Sequence[Change], str]:
        """增量变更与新的游标。`cursor` 为 None 时取「从现在起」的起点。"""
