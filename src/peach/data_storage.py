"""Peach 数据目录的占用统计与缓存清理。

数据目录随馆藏增长：数据库与它的备份、封面头像、预览图、播放缓存，几万部片子就是几十 GB。
设置页的「存储空间」由这里供数：

- **占用统计**：整棵目录走一遍，按类别累计字节，结果存进 `state/storage-usage.json`。
  几十 GB 的小文件要走一两分钟，所以在后台线程里跑，页面轮询。
- **清理**：只清能在本机自动重建、或者有保留规则兜底的几类：播放缓存、缩略图、旧数据库备份、
  已归档日志。预览图要重读媒体、封面头像要重新联网，只统计不清理。
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
import json
import os
from pathlib import Path, PureWindowsPath
import re
import shutil
import threading
import time
from typing import Callable

from . import ledger_backups
from .fsutil import atomic_write_text

USAGE_NAME = "storage-usage.json"
#: 统计时多久报一次走到哪了，秒。页面 1.5 秒问一次，比这更密没有读者。
REPORT_INTERVAL = 0.5
#: 整片转码缓存；同目录的 `.mp4hdr` 是重建的文件头，生成要重扫原片，不在清理范围。
_ROTATED_LOG = re.compile(r"^(?:.+\.until-\d{8}\.log|crash-\d+\.log)$")
#: 账本目录里归「数据库备份」的文件：`ledger.pre-*.db` 和它的 `-wal`／`-shm`。
_BACKUP_FILE = re.compile(r"^ledger\.pre-.+\.db(?:-wal|-shm)?$")


def backup_directories(config) -> tuple[Path, ...]:
    """一份 Peach 数据目录里放账本备份的全部目录：账本目录在前。"""
    return (config.directory("database"), ledger_backups.organize_dir(config.directory("generated")))


@dataclass(frozen=True)
class Category:
    key: str
    label: str
    #: 这一类是什么。
    description: str
    cleanable: bool = False
    #: 可清理的写清理之后会怎样；不能清理的写为什么不能。
    note: str = ""


#: 每一类都说清是什么；能清理的说清理后会怎样，不能清理的说为什么。
#: 缩略图与预览图名字相近，区别在来源：缩略图由已下载的封面、头像缩小而来，本机随时能重算；
#: 预览图从视频抽帧，重建要重新读取整部影片。
CATEGORIES = (
    Category("database", "数据库", "影片、人物、标签与观看记录",
             note="Peach 的全部资料都在这里，删除就是清空媒体库"),
    Category("backups", "数据库备份", "升级、迁移与整理前自动留下的数据库副本", True,
             "每处保留最近一份，更早的无法再恢复"),
    Category("thumbnails", "缩略图", "封面与头像的小尺寸副本，列表和网格里显示的就是它", True,
             "浏览时从本机已有的封面重新缩小"),
    Category("previews", "预览图", "从视频抽帧生成的九宫格、海报与进度条预览",
             note="重建要重新读取整部影片，网盘里的影片会重新下载，所以不在这里清理"),
    Category("downloads", "封面与网络资料", "从资料站下载的封面、头像、厂牌标志与网页缓存",
             note="删除后要重新联网下载，已下架的来源再也取不回来"),
    Category("sources", "导入资料", "从其他软件导入的资料与原始记录",
             note="Peach 无法重新生成，删除后只能重新导入"),
    Category("records", "任务与复核记录", "断点续跑、自动修复回执、待复核清单与归档",
             note="删除会丢失任务进度和尚未处理的复核结论"),
    Category("tools", "媒体工具", "FFmpeg、人脸识别等播放、抽帧与识别用到的程序",
             note="删除后播放、预览与识别不可用，需要重新安装"),
    Category("accounts", "登录状态", "访问令牌与资料站登录用的浏览器资料",
             note="删除后需要重新登录各个网站与设备"),
    Category("logs", "日志", "运行日志与崩溃记录", True,
             "只清理已归档的日志与崩溃记录，正在写入的保留"),
    Category("other", "其他", "数据目录里不属于以上各类的文件",
             note="Peach 无法判断它们的用途，请自行确认后手动处理"),
)
CATEGORY_KEYS = tuple(category.key for category in CATEGORIES)
CLEANABLE = frozenset(category.key for category in CATEGORIES if category.cleanable)


def _key(path: Path) -> str:
    return os.path.normcase(os.path.abspath(path))


def _roots(config) -> dict[str, str]:
    """数据目录下各子目录归哪一类；没有列名的按上一级归类，最外层归「其他」。"""
    from .previews import cover_thumb_root, entity_thumb_root
    generated = config.directory("generated")
    pairs = [
        (config.directory("database"), "database"),
        (generated / ledger_backups.ORGANIZE_DIRNAME, "backups"),
        (cover_thumb_root(generated / "covers"), "thumbnails"),
        (entity_thumb_root(generated / "avatars"), "thumbnails"),
        (generated / "snapshots", "previews"),
        (generated / "posters", "previews"),
        (generated / "timeline", "previews"),
        (generated / "photo-thumbs", "previews"),
        (generated / "covers", "downloads"),
        (generated / "avatars", "downloads"),
        (generated / "logos", "downloads"),
        (generated / "follow-assets", "downloads"),
        (generated / "sample-cache", "downloads"),
        (generated / "provider-cache", "downloads"),
        (config.directory("sources"), "sources"),
        (config.directory("state"), "records"),
        (config.directory("review"), "records"),
        (config.data_root / "archive", "records"),
        (config.directory("tools"), "tools"),
        (config.directory("secrets"), "accounts"),
        (config.directory("logs"), "logs"),
    ]
    return {_key(path.resolve()): category for path, category in pairs}


def _reclaimable(category: str, path: Path, parent_name: str) -> bool:
    if category == "thumbnails":
        return True
    if category == "logs":
        return bool(_ROTATED_LOG.match(path.name))
    return False


def measure(config, *, should_stop: Callable[[], bool] = lambda: False,
            report: Callable[[int, int], None] | None = None) -> dict:
    """走一遍数据目录，按类别统计文件数、字节与可清理字节。链接不跟随。

    `report(文件数, 字节)` 报告走到哪了，最多每 `REPORT_INTERVAL` 秒一次。
    """
    root = config.data_root
    roots = _roots(config)
    database = _key(config.directory("database").resolve())
    totals = {key: {"bytes": 0, "files": 0, "reclaimable": 0} for key in CATEGORY_KEYS}
    from . import storage_budget
    policy = storage_budget.load_policy(config)
    config.directory('state').mkdir(parents=True, exist_ok=True)
    binding = storage_budget.layout(config, policy)
    stack = [(path, roots.get(_key(path), 'other')) for path in storage_budget.data_roots(config)]
    files = size_seen = 0
    allocated = 0
    allocated_files = set()
    allocated_error = ''
    reported = time.monotonic()
    while stack:
        if should_stop():
            raise InterruptedError("统计已停止")
        if report is not None and time.monotonic() - reported >= REPORT_INTERVAL:
            reported = time.monotonic()
            report(files, size_seen)
        folder, inherited = stack.pop()
        try:
            entries = list(os.scandir(folder))
        except FileNotFoundError:
            continue
        except OSError as error:
            allocated_error = str(error)
            continue
        in_database = _key(folder) == database
        for entry in entries:
            try:
                if entry.is_symlink() or Path(entry.path).is_junction():
                    continue
                if entry.is_dir(follow_symlinks=False):
                    stack.append((Path(entry.path), roots.get(_key(Path(entry.path)), inherited)))
                    continue
                info = storage_budget.file_stat(entry)
                size = info.st_size
            except OSError as error:
                allocated_error = str(error)
                continue
            category = inherited
            if in_database and _BACKUP_FILE.match(entry.name):
                category = "backups"
            bucket = totals[category]
            bucket["bytes"] += size
            bucket["files"] += 1
            files += 1
            size_seen += size
            try:
                if storage_budget.count_file(info, allocated_files):
                    allocated += storage_budget.allocated_bytes(Path(entry.path), info)
            except OSError as error:
                allocated_error = str(error)
            if _reclaimable(category, Path(entry.path), Path(folder).name):
                bucket["reclaimable"] += size
    live = config.directory("database") / "ledger.db"
    totals["backups"]["reclaimable"] = sum(
        _backup_plan(live, directory).removable_bytes
        for directory in backup_directories(config))
    try:
        capacity = {**storage_budget.cache_usage(config), 'capacity_error': ''}
    except (OSError, ValueError) as error:
        capacity = {'managed_cache_bytes': None, 'external_cache_bytes': None, 'capacity_error': str(error)}
    if storage_budget.layout(config, policy) != binding:
        raise OSError('容量目录在统计期间发生变化，请重新统计')
    return {
        "root": str(root.resolve()), "layout": binding,
        "measured_at": time.time(),
        "total_bytes": sum(item["bytes"] for item in totals.values()),
        "total_files": sum(item["files"] for item in totals.values()),
        "allocated_bytes": allocated if not allocated_error else None,
        "allocation_error": allocated_error,
        "categories": totals,
        **capacity,
    }


def _backup_plan(live: Path, directory: Path, *, apply: bool = False) -> ledger_backups.BackupPlan:
    """手动清理每处只留最近一份，不看备份年龄；当前账本校验不过时一份都不删。"""
    return ledger_backups.prune(live, apply=apply, keep_recent=1, min_age=timedelta(0), directory=directory)


def _remove(path: Path) -> tuple[int, int, int]:
    """删一个文件或整个目录，返回 (删掉的文件数, 字节, 删不掉的文件数)。"""
    removed = size = failed = 0
    if path.is_symlink() or path.is_junction():
        return 0, 0, 0
    if path.is_dir() and not path.is_symlink():
        folders = []
        for folder, dirs, files in os.walk(path):
            dirs[:] = [name for name in dirs if not (Path(folder) / name).is_symlink()
                       and not (Path(folder) / name).is_junction()]
            folders.append(Path(folder))
            for name in files:
                file = Path(folder) / name
                if file.is_symlink():
                    continue
                try:
                    length = file.stat().st_size
                    file.unlink()
                except OSError:
                    failed += 1
                    continue
                removed += 1
                size += length
        for folder in reversed(folders):
            try:
                folder.rmdir()
            except OSError:
                pass
        return removed, size, failed
    try:
        length = path.stat().st_size
        path.unlink()
    except OSError:
        return 0, 0, 1
    return 1, length, 0


def clean(config, category: str) -> dict:
    """清理一类可重建的产物，返回删掉的文件数、字节和删不掉的数量。"""
    if category not in CLEANABLE:
        raise ValueError("这一类不能在这里清理")
    generated = config.directory("generated")
    targets: list[Path] = []
    if category == "backups":
        live = config.directory("database") / "ledger.db"
        removed = size = 0
        for directory in backup_directories(config):
            decided = _backup_plan(live, directory, apply=True)
            if decided.refused:
                raise ValueError(f"数据库备份未清理：{decided.refused}")
            removed += len(decided.remove) + len(decided.orphans)
            size += decided.removable_bytes
        if removed:
            from .storage_budget import invalidate_measurements
            invalidate_measurements(config)
        return {"files": removed, "bytes": size, "failed": 0}
    if category == "thumbnails":
        from .previews import cover_thumb_root, entity_thumb_root
        for folder in (cover_thumb_root(generated / "covers"), entity_thumb_root(generated / "avatars")):
            if folder.is_dir():
                targets += list(folder.iterdir())
    elif category == "logs":
        logs = config.directory("logs")
        if logs.is_dir():
            targets += [path for path in logs.iterdir() if path.is_file() and _ROTATED_LOG.match(path.name)]
    totals = [0, 0, 0]
    for target in targets:
        for index, value in enumerate(_remove(target)):
            totals[index] += value
    if totals[0]:
        from .storage_budget import invalidate_measurements
        invalidate_measurements(config)
    return {"files": totals[0], "bytes": totals[1], "failed": totals[2]}


def read_usage(config) -> dict | None:
    """只显示当前目录及挂载身份的统计，目录或挂载身份变了旧读数就失效。"""
    from . import storage_budget
    try:
        data = json.loads((config.directory("state") / USAGE_NAME).read_text(encoding="utf-8"))
        current = storage_budget.layout(config, storage_budget.load_policy(config))
    except (OSError, ValueError):
        return None
    if (not isinstance(data, dict) or data.get("root") != str(config.data_root.resolve())
            or data.get('layout') != current):
        return None
    return data


class StorageJobs:
    """统计与清理共用一条后台线程：同一时间只做一件事，清理完顺手重新统计。"""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._state: dict = {"state": "idle", "message": ""}
        self._thread: threading.Thread | None = None

    def snapshot(self) -> dict:
        with self._lock:
            return dict(self._state)

    def busy(self) -> bool:
        with self._lock:
            return self._state["state"] != "idle"

    def start(self, config, action: str | list[str] | tuple[str, ...]) -> dict:
        """`"measure"` 是重新统计；一个或几个类别键是依次清理它们，清理完统一统计一次。"""
        keys = [] if action == "measure" else [action] if isinstance(action, str) else list(action)
        if action != "measure" and (not keys or any(key not in CLEANABLE for key in keys)):
            raise ValueError("这一类不能在这里清理")
        keys = [key for key in CATEGORY_KEYS if key in keys]
        with self._lock:
            if self._state["state"] != "idle":
                raise RuntimeError("正在统计或清理，请稍候")
            self._state = {"state": "cleaning" if keys else "measuring", "category": keys[0] if keys else "",
                           "categories": keys, "message": "", **self._expected(config)}
            self._thread = threading.Thread(target=self._run, args=(config, keys),
                                            name="PeachStorage", daemon=True)
            self._thread.start()
            return dict(self._state)

    @staticmethod
    def _expected(config) -> dict:
        """上次统计的文件数，这一轮的进度条按它估；没统计过就只报走过多少。"""
        usage = read_usage(config)
        return {"files": 0, "bytes": 0, "expected_files": int(usage["total_files"]) if usage else None}

    def _progress(self, files: int, size: int) -> None:
        with self._lock:
            self._state.update(files=files, bytes=size)

    def join(self, timeout: float | None = None) -> None:
        thread = self._thread
        if thread is not None:
            thread.join(timeout)

    def _run(self, config, keys: list[str]) -> None:
        message = ""
        try:
            if keys:
                freed = failed = 0
                for key in keys:
                    with self._lock:
                        self._state.update(category=key)
                    result = clean(config, key)
                    freed += result["bytes"]
                    failed += result["failed"]
                labels = "、".join(item.label for item in CATEGORIES if item.key in keys)
                message = f"已清理{labels}，释放 {format_size(freed)}"
                if failed:
                    message += f"；{failed} 个文件正在使用，未能删除"
                with self._lock:
                    self._state.update(state="measuring", category="", message=message, files=0, bytes=0)
            usage = measure(config, report=self._progress)
            atomic_write_text(config.directory("state") / USAGE_NAME, json.dumps(usage))
        except Exception as exc:
            message = f"{message}；{exc}" if message else str(exc)
            with self._lock:
                self._state = {"state": "idle", "message": message, "error": True}
            return
        with self._lock:
            self._state = {"state": "idle", "message": message}


JOBS = StorageJobs()


def format_size(size: int) -> str:
    """与前端 `fmtSize` 同一套写法，回执里的数字和页面上对得上。"""
    if size <= 0:
        return "0 B"
    if size < 1 << 20:
        return f"{max(1, round(size / 1024))} KB"
    if size < 1 << 30:
        return f"{size >> 20} MB"
    if size < 1 << 40:
        return f"{size / (1 << 30):.1f} GB"
    return f"{size / (1 << 40):.2f} TB"


def snapshot(config) -> dict:
    """设置页「存储空间」一屏的数据。"""
    from . import storage_budget
    root = config.data_root.resolve()
    try:
        disk = shutil.disk_usage(root)
        free, total = disk.free, disk.total
    except OSError:
        free = total = None
    drive = PureWindowsPath(str(root)).drive.casefold()
    system = os.environ.get("SystemDrive", "C:").casefold()
    usage = read_usage(config)
    categories = None
    if usage is not None:
        found = usage.get("categories") or {}
        categories = [{"key": item.key, "label": item.label, "description": item.description, "note": item.note,
                       "cleanable": item.cleanable, **(found.get(item.key) or {"bytes": 0, "files": 0, "reclaimable": 0})}
                      for item in CATEGORIES]
    return {
        "data_root": str(root),
        "free_bytes": free, "total_bytes": total,
        "system_drive": os.name == "nt" and bool(drive) and drive == system,
        "budget": storage_budget.snapshot(config, usage=usage),
        "usage": None if usage is None else {
            "measured_at": usage.get("measured_at"), "total_bytes": usage.get("total_bytes", 0),
            "total_files": usage.get("total_files", 0), "categories": categories,
            "allocated_bytes": usage.get('allocated_bytes'),
            "capacity_error": usage.get('allocation_error') or usage.get('capacity_error') or '',
            "managed_cache_bytes": usage.get('managed_cache_bytes'),
            "external_cache_bytes": usage.get('external_cache_bytes')},
        "job": JOBS.snapshot(),
    }
