"""媒体所在磁盘与账本路径的少量系统口径。

网盘直连（ADR-0157）之后账本里不再保存本机可读的文件路径：`asset.path` 是 `gdrive:/Movies/a.mp4`
这样的虚拟路径，取字节一律走 `media_sources` 里登记的来源驱动。所以这里只剩三件事：判断系统盘在哪
（存储预算要用）、判断某个目录此刻是否可读、以及把旧形态的 Windows 路径识别出来（兼容脚本与历史记录）。
"""
from __future__ import annotations

import os
from collections.abc import Mapping, Sequence
from pathlib import Path, PureWindowsPath

#: 设备未就绪与网络路径断开的 Win32 错误码。Python 把 21 映射成 `PermissionError`、
#: 53/67 映射成 `FileNotFoundError`，只看异常类型会把掉线目录报成没权限或不存在。
_UNREACHABLE_WINERRORS = frozenset({
    21,    # ERROR_NOT_READY
    51,    # ERROR_REM_NOT_LIST
    53,    # ERROR_BAD_NETPATH
    55,    # ERROR_DEV_NOT_EXIST
    59,    # ERROR_UNEXP_NET_ERR
    64,    # ERROR_NETNAME_DELETED
    67,    # ERROR_BAD_NET_NAME
    1167,  # ERROR_DEVICE_NOT_CONNECTED
    1222,  # ERROR_NO_NETWORK
    1231,  # ERROR_NETWORK_UNREACHABLE
})

#: 目录前缀按来源分组，键是 `asset.location`。
Roots = Mapping[str, Sequence[str]]


def root_status(root: Path) -> str:
    """以目录首条读取判断可读状态；空目录可读也算在线。"""
    try:
        with os.scandir(root) as entries:
            next(iter(entries), None)
    except OSError as error:
        if getattr(error, "winerror", None) in _UNREACHABLE_WINERRORS:
            return "unavailable"
        if isinstance(error, PermissionError):
            return "permission_denied"
        if isinstance(error, FileNotFoundError):
            return "missing"
        if isinstance(error, NotADirectoryError):
            return "not_directory"
        return "unavailable"
    return "ok"


def root_online(root: Path) -> bool:
    """即时确认目录可读。"""
    return root_status(root) == "ok"


def system_volume() -> Path:
    """磁盘闸门看的那块盘。

    Windows 读取系统目录所在卷，其他平台使用根卷。
    """
    if os.name != "nt":
        return Path("/")
    import ctypes
    buffer = ctypes.create_unicode_buffer(32768)
    length = ctypes.windll.kernel32.GetWindowsDirectoryW(buffer, len(buffer))
    if not 0 < length < len(buffer):
        raise OSError("未取得 Windows 系统目录")
    return Path(PureWindowsPath(buffer.value).anchor)


def is_windows_path(raw: str | os.PathLike[str]) -> bool:
    text = os.fspath(raw)
    return len(text) >= 3 and text[0].isalpha() and text[1] == ":" and text[2] in "\\/"


def resolve_root(
    raw: str | os.PathLike[str], roots: Roots | None = None,
) -> tuple[str | None, int, tuple[str, ...]]:
    """路径属于 `roots` 里哪个来源的第几个目录前缀，以及它在那个前缀之后的层级。

    前缀重叠时取最长的那个；大小写不敏感由 `PureWindowsPath` 负责。不属于任何来源时返回
    `(None, -1, ())`。`roots` 缺省为空表，所以只对显式给出映射的调用方有意义。
    """
    text = os.fspath(raw)
    if not is_windows_path(text):
        return None, -1, ()
    candidate = PureWindowsPath(text)
    best: tuple[int, str, int] | None = None
    for location, declared_locations in (roots or {}).items():
        for index, root in enumerate(declared_locations):
            declared = PureWindowsPath(root)
            if candidate == declared or candidate.is_relative_to(declared):
                depth = len(declared.parts)
                if best is None or depth > best[0]:
                    best = (depth, location, index)
    if best is None:
        return None, -1, ()
    return best[1], best[2], candidate.parts[best[0]:]


def resolve_location(
    raw: str | os.PathLike[str], roots: Roots | None = None,
) -> tuple[str | None, tuple[str, ...]]:
    """路径属于哪个来源，以及在前缀之后的层级。判定见 `resolve_root`。"""
    location, _index, tail = resolve_root(raw, roots)
    return location, tail
