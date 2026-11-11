"""按网盘目录树登记资源：远端 id 是身份，`path` 只是展示用的虚拟路径。

`asset.location` 是驱动名（`gdrive`／`onedrive`），`asset.remote_id` 是网盘给的稳定 id，
两者的组合是唯一键；`path` 形如 `gdrive:/Movies/a.mp4`，由扫描起点的名字与目录名拼出来，
只给页面显示与日志定位，不参与身份判定。旧来源（115、PikPak、挂载网盘、本机磁盘）的行
`remote_id` 为空，本模块从不碰它们。

两条入口：

- `full_sync` 从每个来源的扫描起点（远端目录 id）递归列目录，登记全部视频，并把本次
  没再出现的行标「已消失」（`personal_records.mark_vanished`）。每日核对与手动刷新走它。
- `sync_changes` 用 `drive_sync.cursor` 取增量变更：新增与修改按同一口径 upsert，删除的
  标「已消失」。第一次没有游标时只取起点，不推断历史。

扩 展名清单与播放侧共用 `media.VIDEO_SUFFIXES`：能入库的和能在网页里播的是两份判据，
但清单只有一份。写库一律先 `INSERT OR IGNORE` 再按身份 `UPDATE`——同一路径上来一部新
片时唯一键是 `(location, path)`，撞上旧行宁可跳过也不能让整趟扫描失败。

每一次写库都只持有从这批行开始到提交为止的写锁：列目录是网络往返，几万个文件全放在
一个事务里，同一账本的其他写入者会跟着卡住。
"""
from __future__ import annotations

import sqlite3
import time
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from typing import Protocol

from .catalog_rules import is_local_extra, release_code_from_filename
from .drive_provider import DriveEntry, DriveError, DriveProvider, DriveUnavailable
from .media import VIDEO_SUFFIXES
from .personal_records import mark_vanished
from .repository import LedgerRepository

#: 每攒够这么多行写一次库。
BATCH_SIZE = 500

#: 增量里往上追父目录的最多层数。正常目录树远小于它，撞上就是个环。
MAX_DEPTH = 64

#: `last_seen`／`first_seen`／`full_synced_at` 的写法，与其他写入侧一致。
STAMP_FORMAT = "%Y-%m-%d %H:%M:%S"
#: `mtime` 沿用了日期形态。
DATE_FORMAT = "%Y-%m-%d"

_INSERT = """INSERT OR IGNORE INTO asset(
               location, remote_id, path, name, code, medium, size, mtime, duration, width, height,
               drive_root, first_seen, last_seen)
             VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"""

_UPDATE = """UPDATE asset SET path=?, name=?, size=?, mtime=?,
               duration=COALESCE(?, duration), width=COALESCE(?, width), height=COALESCE(?, height),
               drive_root=?, last_seen=?,
               disposal=CASE WHEN disposal='vanished' THEN NULL ELSE disposal END
             WHERE location=? AND remote_id=?"""

_SAVE_SYNC = """INSERT INTO drive_sync(location, account_id, cursor, synced_at, full_synced_at, last_error)
                VALUES(?,?,?,?,?,?)
                ON CONFLICT(location) DO UPDATE SET
                  account_id=excluded.account_id, cursor=excluded.cursor,
                  synced_at=COALESCE(excluded.synced_at, drive_sync.synced_at),
                  full_synced_at=COALESCE(excluded.full_synced_at, drive_sync.full_synced_at),
                  last_error=excluded.last_error"""


class ScanTargetError(ValueError):
    """扫描起点对不上：来源没有驱动，或者没配扫描根。消息可以直接给人看。"""


@dataclass(frozen=True)
class ScanResult:
    """一趟扫描的结果。`failures` 是列不动的目录数，非零时这一趟不做「已消失」判定。"""

    location: str
    folders: int = 0
    files: int = 0
    total_bytes: int = 0
    seconds: float = 0.0
    #: 本次新建的行。
    new_ids: tuple[int, ...] = ()
    #: 本次标「已消失」的行数。
    vanished: int = 0
    failures: int = 0
    #: 展示路径已被别的行占用、没能落上的行数。见 `ScanService._write`。
    conflicts: int = 0
    cursor: str | None = None

    def summary(self) -> str:
        return (f"✓ {self.location}: {self.files:,} 文件 / "
                f"{self.total_bytes / 1024 ** 3:.2f} GB / 耗时 {self.seconds:.0f}s；"
                f"新建 {len(self.new_ids):,} 行，已消失 {self.vanished:,} 行"
                + (f"，{self.failures} 个目录列不动" if self.failures else "")
                + (f"，{self.conflicts} 行的路径被旧行占用" if self.conflicts else ""))


def virtual_path(location: str, segments: Sequence[str]) -> str:
    """展示用路径：`gdrive:/Movies/a.mp4`。只由目录名拼，不翻译成本机路径。"""
    return "/".join((f"{location}:", *segments))


def _mtime(modified: str | None) -> str | None:
    """网盘给的修改时间统一收成日期；ISO 8601 之外的原样留空。"""
    text = (modified or "").strip()
    return text[:10] if len(text) >= 10 and text[4] == "-" and text[7] == "-" else None


def _stamp(moment: float) -> str:
    return time.strftime(STAMP_FORMAT, time.localtime(moment))


class DriveLookup(Protocol):
    """扫描要用到的三件东西：已授权账号、按账号取驱动、按账号取扫描起点。

    键一律是账号名（`[drive.accounts]` 的键），不是来源类型：同一个来源可以接多个账号，
    两个账号的增量游标与扫描根各管各的，得分开排队、分开判消失。全部按当前设置现问：
    `DriveConnections` 换过账号或扫描起点会重建驱动实例，抓住一份旧表就等于换了没用。
    真实实现就是 `DriveConnections` 本身。
    """

    @property
    def providers(self) -> Mapping[str, DriveProvider]: ...

    def accounts(self) -> tuple[str, ...]:
        """当前配了扫描起点的账号：同步节拍按它排队。"""
        return tuple(sorted(self.drive.roots_map()))

    def provider(self, key: str) -> DriveProvider: ...

    def roots_map(self) -> Mapping[str, Sequence[str]]: ...


class ScanService:
    """一个账本上的网盘扫描入口。

    驱动与扫描起点都按当前设置现问现用（`drive_reader`）：换过账号、扫描起点或取字节方式
    之后 `DriveConnections` 会重建驱动实例，抓住构造时那一份表就等于换了没用。驱动之外的
    来源不扫：旧账本里的 115／PikPak／本地磁盘行只读展示。
    """

    def __init__(self, drive_reader: DriveLookup, repository: LedgerRepository,
                 *, clock: Callable[[], float] = time.time):
        self.drive = drive_reader
        self.repository = repository
        self._clock = clock

    @property
    def database(self):
        return self.repository.database

    def accounts(self) -> tuple[str, ...]:
        """当前配了扫描起点的账号：同步节拍按它排队。"""
        return tuple(sorted(self.drive.roots_map()))

    def provider(self, key: str) -> DriveProvider:
        try:
            return self.drive.provider(key)
        except DriveUnavailable as missing:
            known = "、".join(sorted(self.drive.accounts())) or "（一个都没配）"
            raise ScanTargetError(f"✗ 未授权的账号 {key!r}；已授权的：{known}") from missing

    def _roots(self, key: str, provider: DriveProvider) -> tuple[str, ...]:
        roots = tuple(self.drive.roots_map().get(key) or ())
        if not roots:
            raise ScanTargetError(f"✗ 账号 {key!r} 还没有媒体库")
        return roots

    def full_sync(self, key: str) -> ScanResult:
        """从一个账号的扫描起点递归登记全部视频，再把本次没见到的行标「已消失」。"""
        provider = self.provider(key)
        source = provider.location
        roots = self._roots(key, provider)
        started = self._clock()
        stamp = _stamp(started)
        folders = files = total = failures = conflicts = 0
        new_ids: dict[int, None] = {}
        batch: list[tuple] = []
        for root_id in roots:
            root_name = self._name(provider, root_id)
            stack = [(root_id, (root_name,))]
            while stack:
                folder_id, segments = stack.pop()
                folders += 1
                page = None
                while True:
                    try:
                        entries, page = provider.list_folder(folder_id, page)
                    except DriveError:
                        failures += 1
                        break
                    for entry in entries:
                        if entry.folder:
                            stack.append((entry.remote_id, (*segments, entry.name)))
                            continue
                        if not self._registers(entry.name):
                            continue
                        files += 1
                        total += int(entry.size or 0)
                        batch.append(self._row(source, entry, segments, stamp, root_id))
                    if page is None:
                        break
                if len(batch) >= BATCH_SIZE:
                    fresh, conflicts_here = self._write(batch)
                    new_ids.update(dict.fromkeys(fresh))
                    conflicts += conflicts_here
                    batch = []
        fresh, conflicts_here = self._write(batch)
        new_ids.update(dict.fromkeys(fresh))
        conflicts += conflicts_here
        vanished = 0 if failures else self._vanish_missing(source, roots, stamp, started)
        self._save_sync(key, provider.account.account_id, cursor=None, synced_at=stamp,
                        full_synced_at=stamp)
        return ScanResult(
            key, folders=folders, files=files, total_bytes=total,
            seconds=self._clock() - started, new_ids=tuple(new_ids), vanished=vanished,
            failures=failures, conflicts=conflicts, cursor=self._cursor(key))

    def sync_changes(self, key: str) -> ScanResult:
        """按游标取增量：新增与修改登记，删除的标「已消失」。"""
        provider = self.provider(key)
        source = provider.location
        roots = self._roots(key, provider)
        started = self._clock()
        stamp = _stamp(started)
        cursor = self._cursor(key)
        try:
            changes, next_cursor = provider.changes(cursor)
        except DriveError as error:
            self._save_sync(key, provider.account.account_id, cursor=cursor,
                            last_error=str(error))
            raise
        if cursor is None:
            # 第一次只取起点：游标之前发生过的变更无从知道，等全量核对。
            self._save_sync(key, provider.account.account_id, cursor=next_cursor, synced_at=stamp)
            return ScanResult(key, seconds=self._clock() - started, cursor=next_cursor)
        names = self._root_names(key, provider)
        known: dict[str, tuple[tuple[str, ...], str] | None] = {}
        rows, removed = [], []
        for change in changes:
            if change.removed or change.entry is None:
                removed.append(change.remote_id)
                continue
            entry = change.entry
            if entry.folder or not self._registers(entry.name):
                continue
            found = self._folder_segments(provider, names, known, entry.parent_id)
            if found is None:
                continue
            segments, root_id = found
            rows.append(self._row(source, entry, segments, stamp, root_id))
        fresh, conflicts = self._write(rows)
        vanished = self._vanish_ids(source, roots, removed, started)
        self._save_sync(key, provider.account.account_id, cursor=next_cursor, synced_at=stamp)
        return ScanResult(
            key, files=len(rows) - conflicts,
            total_bytes=sum(int(row[6] or 0) for row in rows),
            seconds=self._clock() - started, new_ids=tuple(dict.fromkeys(fresh)),
            vanished=vanished, conflicts=conflicts, cursor=next_cursor)

    @staticmethod
    def _registers(name: str) -> bool:
        """只登记视频；`-trailer` 这类附属件与系统元数据不算作品。"""
        suffix = name.rsplit(".", 1)[-1] if "." in name else ""
        return f".{suffix.lower()}" in VIDEO_SUFFIXES and not is_local_extra(name)

    #: `_row` 交出的元组：身份 `(location, remote_id, path, name, code)`、`medium`、大小与时长、
    #: 尺寸、扫描根、两个时间戳。下面按下标取值的地方与它一一对应。
    @staticmethod
    def _row(location: str, entry: DriveEntry, segments: Sequence[str], stamp: str,
             root_id: str) -> tuple:
        """一行 `asset`：身份、展示路径、番号、视频元数据与它所在的扫描根。

        番号按文件名解析后原样落库：自动落库按 `code` 找回同一部作品，扫描时算不出来就等于
        这部片永远落不了库。解析不出就留空，交给后面的采集步骤。
        """
        path = virtual_path(location, (*segments, entry.name))
        return (location, entry.remote_id, path, entry.name,
                release_code_from_filename(entry.name), "video", entry.size,
                _mtime(entry.modified), entry.duration, entry.width, entry.height,
                root_id, stamp, stamp)

    def _write(self, rows: Sequence[tuple]) -> tuple[list[int], int]:
        """落一批行，返回（本次新建的 id，因展示路径被别的行占用而没落上的行数）。

        「新建」按写前后同一身份有没有行来判，不看时间戳：两趟扫描落在同一秒里也不该
        把老行当成新行。

        `asset` 上还留着挂载时代的 `UNIQUE(location, path)`：同一条展示路径换成另一份
        文件时，新身份插不进去。这里不动老行（它还带着观看记录与处置历史），只把撞上的
        行数报出去。
        """
        if not rows:
            return [], 0
        updates = [(row[2], row[3], row[6], row[7], row[8], row[9], row[10], row[11],
                    row[13], row[0], row[1]) for row in rows]
        with self.database.write_transaction() as connection:
            before = self._identities(connection, rows)
            connection.executemany(_INSERT, rows)
            connection.executemany(_UPDATE, updates)
            after = self._identities(connection, rows)
        new_ids = [identifier for key, identifier in after.items() if key not in before]
        return new_ids, len(rows) - len(after)

    @staticmethod
    def _identities(connection: sqlite3.Connection,
                    rows: Sequence[tuple]) -> dict[tuple[str, str], int]:
        """这批行里已经在库的身份 → 行 id。"""
        found: dict[tuple[str, str], int] = {}
        for location in {row[0] for row in rows}:
            remote_ids = [row[1] for row in rows if row[0] == location]
            for offset in range(0, len(remote_ids), 500):
                portion = remote_ids[offset:offset + 500]
                for identifier, remote_id in connection.execute(
                        "SELECT id, remote_id FROM asset WHERE location=? AND remote_id IN ("
                        + ",".join("?" * len(portion)) + ")", (location, *portion)):
                    found[(location, remote_id)] = int(identifier)
        return found

    def _vanish_missing(self, source: str, roots: Sequence[str], stamp: str,
                        started: float) -> int:
        """全量核对：这个账号的扫描根里本次没再见到的行标「已消失」。

        同一来源下的另一个账号可能也扫着同一批目录名，所以判据带上扫描根：
        只看 `location` 会把别人账号的行一起标掉。
        """
        marks = ",".join("?" * len(roots))
        with self.database.write_transaction() as connection:
            ids = [int(row[0]) for row in connection.execute(
                "SELECT id FROM asset WHERE location=? AND drive_root IN ("
                + marks + ") AND remote_id IS NOT NULL "
                "AND disposal IS NULL AND (last_seen IS NULL OR last_seen<?)",
                (source, *roots, stamp))]
            return len(mark_vanished(connection, ids, started))

    def _vanish_ids(self, source: str, roots: Sequence[str], remote_ids: Sequence[str],
                    started: float) -> int:
        """增量删除：按远端 id 找到这个账号扫描根下的行，标「已消失」。"""
        if not remote_ids:
            return 0
        marks = ",".join("?" * len(roots))
        with self.database.write_transaction() as connection:
            ids = []
            for offset in range(0, len(remote_ids), 500):
                portion = remote_ids[offset:offset + 500]
                ids.extend(int(row[0]) for row in connection.execute(
                    "SELECT id FROM asset WHERE location=? AND drive_root IN ("
                    + marks + ") AND remote_id IN ("
                    + ",".join("?" * len(portion)) + ")", (source, *roots, *portion)))
            return len(mark_vanished(connection, ids, started))

    def _name(self, provider: DriveProvider, remote_id: str) -> str:
        """扫描起点在虚拟路径里的那一段。"""
        try:
            return provider.entry(remote_id).name
        except DriveError:
            return remote_id

    def _root_names(self, key: str, provider: DriveProvider) -> dict[str, str]:
        """扫描起点 id → 名字，增量里追父目录时用来收尾。"""
        return {root: self._name(provider, root) for root in self._roots(key, provider)}

    def _folder_segments(self, provider: DriveProvider, names: Mapping[str, str],
                         known: dict[str, tuple[tuple[str, ...], str] | None],
                         folder_id: str) -> tuple[tuple[str, ...], str] | None:
        """远端目录在扫描根之下的层级（含扫描起点的名字）与它所属的扫描根。

        不在任何扫描根之下时返回 None。往上追父目录，最多 `MAX_DEPTH` 层：目录树坏了
        成环时不能把一趟增量卡死。`known` 缓存解析结果，同一页变更里同目录下的文件只追一次。
        """
        trail: list[str] = []
        current = folder_id
        found: tuple[tuple[str, ...], str] | None = None
        for _ in range(MAX_DEPTH):
            if current in names:
                found = ((names[current], *trail), current)
                break
            if current in known:
                cached = known[current]
                found = None if cached is None else ((*cached[0], *trail), cached[1])
                break
            try:
                ancestor = provider.entry(current)
            except DriveError:
                break
            trail.insert(0, ancestor.name)
            current = ancestor.parent_id
        known[folder_id] = found
        return found

    def sync_state(self, key: str) -> dict:
        """这个账号的同步状态：页面上的「上次同步」「最近一次错误」都读它。

        `synced_at` 是最近一次成功同步，`full_synced_at` 是最近一次整棵核对；两者分开，
        「立即刷新」按完才看得见时间在动，而整棵重扫的节拍照旧由后者决定。

        账本还没建好（首次启动、Docker 未初始化）时照样要给页面一个空态，不能抛。
        """
        empty = {"cursor": None, "synced_at": None, "full_synced_at": None, "last_error": ""}
        try:
            with self.database.read_connection() as connection:
                row = connection.execute(
                    "SELECT cursor, COALESCE(synced_at, full_synced_at), full_synced_at, last_error "
                    "FROM drive_sync WHERE location=?",
                    (key,)).fetchone()
        except sqlite3.Error:
            return empty
        if row is None:
            return empty
        return {"cursor": row[0], "synced_at": row[1], "full_synced_at": row[2],
                "last_error": row[3] or ""}

    def _cursor(self, key: str) -> str | None:
        with self.database.read_connection() as connection:
            try:
                row = connection.execute(
                    "SELECT cursor FROM drive_sync WHERE location=?", (key,)).fetchone()
            except sqlite3.Error:
                return None
        return row[0] if row else None

    def restart(self, key: str) -> None:
        """换扫描起点或重新授权之后游标不再可信：清掉它，下一轮整棵重扫。

        增量游标只认「哪些文件变了」，它不会因为换了根目录就把新根下的存量文件重报一遍；
        留着旧游标会让新选的目录直到下一次全量核对（最长一天）才出现在账本里。
        """
        with self.database.write_transaction() as connection:
            connection.execute("DELETE FROM drive_sync WHERE location=?", (key,))

    def _save_sync(self, key: str, account_id: str, *, cursor: str | None,
                   synced_at: str | None = None, full_synced_at: str | None = None,
                   last_error: str = "") -> None:
        """记下游标、这次同步的时刻与最近一次全量核对；失败原因也留在这里给页面看。

        `synced_at` 每次成功都写，页面的「上次同步」读它；`full_synced_at` 只在整棵核对时写，
        决定下一次什么时候该整棵重扫。
        """
        with self.database.write_transaction() as connection:
            connection.execute(_SAVE_SYNC,
                               (key, account_id, cursor, synced_at, full_synced_at, last_error))
