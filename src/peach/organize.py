"""按模板整理网盘上的文件名与目录：生成计划、执行、回滚（ADR-0039）。

三件事在一个模块里，因为它们共用同一份判据：什么算「会变的一行」、目标路径怎么算出来、
哪些行必须跳过。散开写的下场是预览说会改、执行时又按另一套规则跳过，而用户手上那份
CSV 于是变成一份不准的清单。

顺序是固定的：先备份 SQLite，再让网盘改名/移动，最后改账本。网盘改成功而账本写失败时
把名字改回去；反过来先改账本会留下一批指向不存在文件的条目。

账本路径一律是展示口径（`gdrive:/Movies/a.mp4`），只由网盘目录名拼出来，不翻译成本机
路径：这台机器上根本没有那份文件。
"""
from __future__ import annotations

import json
import posixpath
import sqlite3
import time
from collections.abc import Callable, Sequence
from pathlib import Path

from .catalog_rules import is_jav_code, is_uncensored_release, normalise_code_key, part_marker
from .drive_provider import (
    DriveAuthRequired, DriveError, DriveForbidden, DriveNotFound, DriveUnavailable,
)
from .fsutil import atomic_write_text
from .jobs import ACTIVE_ASSET_SQL
from .organize_templates import MAX_PATH, TemplateError, clean_filename, render, validate_template
from .review_csv import write_rows
from .task_retry import transient_delay

#: 计划 CSV 的列。`reason` 只在 `action=skip` 时有值。
PLAN_FIELDS = ["asset_id", "location", "current_path", "target_path", "action", "reason"]

#: 文件名与目录组合，以及使用示例字段时的完整路径。
PRESETS: tuple[dict[str, str], ...] = (
    {"label": "仅番号", "file": "{code}", "dir": "", "example": "ABC-123.mp4"},
    {"label": "番号和标题", "file": "{code}[ {title}]", "dir": "", "example": "ABC-123 标题.mp4"},
    {"label": "番号和画质", "file": "{code}[ {definition}]", "dir": "", "example": "ABC-123 1080p.mp4"},
    {"label": "番号和出演者", "file": "{code}[ {actors}]", "dir": "", "example": "ABC-123 甲、乙.mp4"},
    {"label": "按厂牌建文件夹", "file": "{code}[ {title}]", "dir": "{studio}", "example": "厂牌/ABC-123 标题.mp4"},
    {"label": "按系列建文件夹", "file": "{code}[ {title}]", "dir": "{series}", "example": "系列/ABC-123 标题.mp4"},
    {"label": "按出演者建文件夹", "file": "{code}[ {title}]", "dir": "{actors}", "example": "甲、乙/ABC-123 标题.mp4"},
    {"label": "按发行年建文件夹", "file": "{code}[ {title}]", "dir": "{year}", "example": "2024/ABC-123 标题.mp4"},
    {"label": "厂牌下按番号建文件夹", "file": "{code}[ {title}][ CD{cd}]", "dir": "{studio}/{code}", "example": "厂牌/ABC-123/ABC-123 标题 CD2.mp4"},
)

#: 跳过原因的固定写法。界面按这几个键分组计数，所以它们是契约的一部分。
SKIP_NOT_CONNECTED = "网盘未接入"
SKIP_MISSING_FIELD = "字段缺失"
SKIP_OUTSIDE_SCOPE = "不在整理范围内"
SKIP_TARGET_EXISTS = "目标已存在"
SKIP_TARGET_FOLDER = "目标目录不存在"
SKIP_TOO_LONG = "路径过长"
SKIP_NO_REMOTE_ID = "资产没有网盘标识"


class OrganizeError(ValueError):
    """整理本身拒绝执行。消息直接给用户看；接口按参数错误回 400。"""


def _definition(width, height) -> str:
    """按高度给一档画质。取不到尺寸就留空，让可选分组整段省略。"""
    try:
        lines = int(height or 0)
        columns = int(width or 0)
    except (TypeError, ValueError):
        return ""
    if columns and lines and columns < lines:
        # 竖屏素材按短边算，不然一条 1080×1920 会被报成 1920p。
        lines = columns
    for floor, label in ((2160, "4K"), (1440, "1440p"), (1080, "1080p"),
                         (720, "720p"), (480, "480p")):
        if lines >= floor:
            return label
    return ""


def placeholder_values(row, performers: Sequence[str] = ()) -> dict[str, str]:
    """一行资产的占位符取值，全部来自 approved 真相字段。

    候选表一个都不查：整理会让网盘上的名字变掉，而账本里没有地方记「这个名字是猜的」。
    """
    code = str(row["code"] or "")
    name = str(row["name"] or "")
    title = str(row["catalog_title"] or "") or str(row["original_title"] or "")
    release_date = str(row["release_date"] or "")
    marker = part_marker(name)
    return {
        "code": normalise_code_key(code) if is_jav_code(code) else code.strip(),
        "title": title.strip(),
        "studio": str(row["studio"] or "").strip(),
        "series": str(row["series"] or "").strip(),
        "year": release_date[:4] if len(release_date) >= 4 else "",
        # 四个以上就不再往文件名里塞：名字会长到在资源管理器里看不见番号。
        "actors": "、".join(list(performers)[:4]),
        "cd": marker.upper() if marker else "",
        # 有码不是本机可核验的事实，所以只在有无码证据时给值；`[{mosaic}]` 于是
        # 在普通片上整段消失，而不是写上一个猜出来的「有码」。
        "mosaic": "无码" if is_uncensored_release(name, code) else "",
        "definition": _definition(row["width"], row["height"]),
    }


def _performers(connection: sqlite3.Connection, location: str) -> dict[int, list[str]]:
    """资产 → 出演者规范名。`entity` 是规范身份，扁平字段只是兼容投影（ADR-0005）。"""
    found: dict[int, list[str]] = {}
    for asset_id, name in connection.execute(
        "SELECT ae.asset_id,e.canonical_name FROM asset_entity ae "
        "JOIN entity e ON e.id=ae.entity_id JOIN asset a ON a.id=ae.asset_id "
        "WHERE e.kind='performer' AND a.location=? ORDER BY e.canonical_name",
        (location,),
    ):
        found.setdefault(int(asset_id), []).append(str(name))
    return found


def _rows(connection: sqlite3.Connection, location: str,
          asset_ids: Sequence[int] | None = None) -> list[sqlite3.Row]:
    """这个来源上会被整理的行：只有视频，且不在回收站里。

    只取视频不是图省事。模板说的是「一部片叫什么」，
    它回答不了一张封面该叫什么。
    """
    connection.row_factory = sqlite3.Row
    ids = list(dict.fromkeys(int(value) for value in (asset_ids or ())))
    selected = f" AND id IN ({','.join('?' * len(ids))})" if asset_ids is not None else ""
    if asset_ids is not None and not ids:
        return []
    return connection.execute(
        "SELECT id,location,path,name,code,catalog_title,original_title,studio,series,"
        f"release_date,width,height FROM asset WHERE location=? AND {ACTIVE_ASSET_SQL} "
        f"AND medium='video' AND path IS NOT NULL AND trim(path)<>''{selected} ORDER BY id",
        (location, *ids),
    ).fetchall()


def _extension(name: str) -> str:
    stem, dot, ext = str(name).rpartition(".")
    return f".{ext}" if dot and stem else ""


def _prefix(location: str) -> str:
    """账本路径的来源前缀：`gdrive:/`。"""
    return f"{location}:/"


def segments_of(location: str, path: str) -> tuple[str, ...]:
    """账本路径 → 网盘上的目录名与文件名。"""
    text = str(path or "").strip()
    head, found, tail = text.partition(":/")
    if not found or head != location:
        raise OrganizeError(f"路径不属于 {location}：{text or '(空)'}")
    parts = tuple(part for part in tail.split("/") if part not in ("", "."))
    if not parts or ".." in parts:
        raise OrganizeError(f"路径不合法：{text}")
    return parts


def ledger_path(location: str, segments: Sequence[str]) -> str:
    """网盘目录名与文件名 → 账本路径。"""
    return _prefix(location) + "/".join(str(part) for part in segments)


def scope_path(location: str, path: str = '') -> str:
    """将指定目录核对并转换为账本路径；空值表示整个来源。"""
    if not isinstance(path, str):
        raise OrganizeError('整理路径必须是目录路径')
    text = path.strip().rstrip('/')
    if not text:
        return ''
    if '\x00' in text:
        raise OrganizeError('整理路径不能包含空字符')
    return ledger_path(location, segments_of(location, text))


def build_plan(connection: sqlite3.Connection, *, location: str,
               file_template: str = "", dir_template: str = "",
               connected: bool = True,
               asset_ids: Sequence[int] | None = None, path: str = '') -> dict:
    """按目录范围与可选模板生成逐文件整理计划。

    返回 `{"rows": [...], "counts": {...}, "reasons": {...}}`：`rows` 只含会变的行与被
    跳过的行，已经就是目标名字的行只进 `counts["unchanged"]`——几万行原样列出来，用户
    要找的那几百行反而看不见了。

    这里只比账本，不问网盘：目标目录在不在、名字撞不撞车都由执行那一步当场判，
    因为预览一次要过几万行，逐行列目录是一天的事。
    """
    file_template = validate_template(file_template)
    dir_template = validate_template(dir_template, directory=True)
    selected_path = scope_path(location, path)
    rows = _rows(connection, location, asset_ids)
    if selected_path:
        prefix = selected_path.rstrip('/') + '/'
        rows = [row for row in rows if str(row['path']).startswith(prefix)]
    counts: dict[str, int] = {"total": len(rows), "unchanged": 0, "change": 0, "skip": 0}
    reasons: dict[str, int] = {}
    plan: list[dict] = []

    def skip(row, reason: str, target: str = "") -> None:
        counts["skip"] += 1
        reasons[reason] = reasons.get(reason, 0) + 1
        plan.append({"asset_id": row["id"], "location": location,
                     "current_path": str(row["path"]), "target_path": target,
                     "action": "skip", "reason": reason})

    if not rows:
        return {"rows": plan, "counts": counts, "reasons": reasons}
    if not connected:
        for row in rows:
            skip(row, SKIP_NOT_CONNECTED)
        return {"rows": plan, "counts": counts, "reasons": reasons}

    performers = _performers(connection, location)
    # 目标撞名先按账本已知的路径判一遍：同一批里两行算出同一个名字，或者目标位置上
    # 已经躺着另一条记录，都在预览里就说清楚，而不是等执行到一半才报一行失败。
    claimed = {str(path).casefold(): int(aid) for aid, path in connection.execute(
        'SELECT id,path FROM asset WHERE location=? AND path IS NOT NULL', (location,))}

    for row in rows:
        path = str(row["path"])
        try:
            parts = segments_of(location, path)
        except OrganizeError:
            skip(row, SKIP_OUTSIDE_SCOPE)
            continue
        current_dir = parts[:-1]
        if selected_path and not path.startswith(selected_path.rstrip('/') + '/'):
            skip(row, SKIP_OUTSIDE_SCOPE)
            continue
        values = placeholder_values(row, performers.get(int(row["id"]), []))
        target_dir = current_dir
        missing: set[str] = set()
        if dir_template:
            rendered, absent = render(dir_template, values, directory=True)
            missing |= absent
            if not rendered:
                skip(row, SKIP_MISSING_FIELD)
                continue
            # 落在整理范围顶上；没给范围就落在来源的第一层目录里，与扫描起点同名。
            base = segments_of(location, selected_path) if selected_path else parts[:1]
            target_dir = (*base, *[part for part in rendered.split("/") if part])
        name = str(row["name"] or parts[-1])
        target_name = clean_filename(name)
        if file_template:
            rendered, absent = render(file_template, values)
            missing |= absent
            if not rendered:
                skip(row, SKIP_MISSING_FIELD)
                continue
            target_name = rendered + _extension(name)
        if missing:
            skip(row, SKIP_MISSING_FIELD)
            continue
        target = ledger_path(location, (*target_dir, target_name))
        if target == path:
            counts["unchanged"] += 1
            continue
        if len(target) > MAX_PATH:
            skip(row, SKIP_TOO_LONG, target)
            continue
        occupant = claimed.get(target.casefold())
        if occupant is not None and occupant != int(row["id"]):
            skip(row, SKIP_TARGET_EXISTS, target)
            continue
        claimed.pop(path.casefold(), None)
        claimed[target.casefold()] = int(row["id"])
        counts["change"] += 1
        plan.append({
            "asset_id": row["id"], "location": location, "current_path": path,
            "target_path": target,
            "action": "rename" if tuple(target_dir) == current_dir else "move", "reason": "",
        })
    return {"rows": plan, "counts": counts, "reasons": reasons}


def write_plan(path: Path | str, rows: Sequence[dict]) -> Path:
    write_rows(path, PLAN_FIELDS, rows, atomic=True)
    return Path(path)


def plan_path(root: Path | str, location: str) -> Path:
    return Path(root) / f"organize-plan-{location}.csv"


def batch_log_dir(root: Path | str) -> Path:
    return Path(root) / "organize-batches"


def latest_batch(root: Path | str) -> Path | None:
    """最近一个批次日志；一次都没执行过返回 None。"""
    logs = sorted(batch_log_dir(root).glob("organize-*.json"))
    return logs[-1] if logs else None


class _Listing:
    """一个来源的目录列举缓存。

    一次执行里同一批文件的父目录往往就那几个（按厂牌、按年建目录之后更是如此），
    每行都重新列一遍目录会让整批整理多出成百上千次往返。改完一个目录就把它作废。
    """

    def __init__(self, provider, root_ids: Sequence[str]):
        self.provider = provider
        self.root_ids = tuple(str(value) for value in root_ids)
        self._children: dict[str, list] = {}
        self._roots: dict[str, str] | None = None

    def children(self, parent_id: str) -> list:
        cached = self._children.get(parent_id)
        if cached is None:
            entries: list = []
            cursor = None
            while True:
                page, cursor = self.provider.list_folder(parent_id, cursor)
                entries.extend(page)
                if cursor is None:
                    break
            cached = self._children[parent_id] = entries
        return cached

    def forget(self, parent_id: str) -> None:
        self._children.pop(parent_id, None)

    def roots(self) -> dict[str, str]:
        """扫描起点的显示名 → 网盘目录 id。起点 id 只存在设置里，名字得问一次网盘。"""
        if self._roots is None:
            self._roots = {}
            for root_id in self.root_ids:
                self._roots[self.provider.entry(root_id).name] = root_id
        return self._roots

    def folder_id(self, parts: Sequence[str]) -> str | None:
        """目录名 → 目录 id；有一层不存在就返回 None（网盘上没有建目录的通道）。

        `parts` 是账本路径里的目录部分，第一层是扫描起点自己的名字；只有一个起点时
        名字对不上也认它，免得用户重命名过起点目录之后整个整理都动不了。
        """
        roots = self.roots()
        if not parts:
            return next(iter(roots.values()), None)
        parent = roots.get(parts[0])
        if parent is None and len(roots) == 1:
            parent = next(iter(roots.values()))
        if parent is None:
            return None
        for part in parts[1:]:
            found = None
            for entry in self.children(parent):
                if entry.folder and entry.name == part:
                    found = entry.remote_id
                    break
            if found is None:
                return None
            parent = found
        return parent

    def occupant(self, parent_id: str, name: str) -> str | None:
        """这个目录里已经叫这个名字的条目。"""
        for entry in self.children(parent_id):
            if entry.name.casefold() == name.casefold():
                return entry.remote_id
        return None


def _listing(drive, location: str, root: str = "") -> _Listing:
    """这本账的目录缓存。同来源多账号时靠 `root`（扫描起点）认是哪一本。"""
    if drive is None:
        raise OrganizeError("还没有接入网盘，整理无处执行")
    try:
        key = drive.key_for(location, root)
        provider = drive.provider(key)
        roots = drive.roots(key)
    except DriveError as error:
        raise OrganizeError(str(error)) from error
    if not roots:
        raise OrganizeError("这个来源还没有建媒体库，先到设置页加一个")
    return _Listing(provider, roots)


def _update_row(connection: sqlite3.Connection, asset_id: int,
                old_path: str, new_path: str) -> int:
    return connection.execute(
        "UPDATE asset SET path=?,name=? WHERE id=? AND path=?",
        (new_path, posixpath.basename(new_path), int(asset_id), old_path),
    ).rowcount


class MoveFailure(str):
    """保留原有原因字符串，并把可自动恢复的移动失败带回批次结果。"""

    def __new__(cls, reason: str, *, retry_after: float | None):
        value = super().__new__(cls, reason)
        value.retryable = retry_after is not None
        value.retry_after = retry_after
        return value


def _failure(error: DriveError) -> str:
    """把网盘异常翻成界面上能读的一句，并标出哪些可以重试。"""
    if isinstance(error, DriveNotFound):
        return "网盘上已经没有这个文件"
    if isinstance(error, DriveForbidden):
        return "网盘账号没有这个文件的权限"
    if isinstance(error, DriveAuthRequired):
        return "网盘授权已失效，重新授权后再整理"
    if isinstance(error, DriveUnavailable):
        return MoveFailure(f"网盘暂时不可用：{error}", retry_after=transient_delay(error))
    return f"网盘拒绝了这次改名：{error}"


def _move_one(drive, connection: sqlite3.Connection, asset_id: int,
              old_path: str, new_path: str, listing: _Listing | None = None) -> str:
    """把一个文件在网盘上改名/移动并同步账本；返回 `ok` 或跳过／失败原因。

    账本写失败就把名字改回去：反过来留下的是一条指向不存在文件的记录，而它看起来
    和正常的行没有任何区别。
    """
    location = str(new_path).partition(":")[0]
    current = connection.execute(
        "SELECT remote_id,path,disposal,drive_root FROM asset WHERE id=?",
        (int(asset_id),)).fetchone()
    listing = listing or _listing(drive, location, current[3] if current else "")
    provider = listing.provider
    if current is None or current[1] != old_path:
        return "数据库里这一行已经变了"
    if current[2] is not None:
        return "资产已不在馆藏，未执行整理"
    if not current[0]:
        return SKIP_NO_REMOTE_ID
    try:
        target_parts = segments_of(location, new_path)
        parent = listing.folder_id(target_parts[:-1])
        if parent is None:
            return SKIP_TARGET_FOLDER
        name = target_parts[-1]
        occupant = listing.occupant(parent, name)
        if occupant is not None and occupant != current[0]:
            return SKIP_TARGET_EXISTS
        provider.move(str(current[0]), parent, name)
        listing.forget(parent)
    except DriveError as error:
        return _failure(error)
    except OrganizeError as error:
        return str(error)
    try:
        if not _update_row(connection, asset_id, old_path, new_path):
            raise OrganizeError("数据库里这一行已经变了")
        connection.commit()
    except Exception as error:
        connection.rollback()
        try:
            old_parts = segments_of(location, old_path)
            back = listing.folder_id(old_parts[:-1])
            if back is None:
                raise DriveNotFound(old_path)
            provider.move(str(current[0]), back, old_parts[-1])
            listing.forget(back)
            return f"数据库写入失败，已改回原名：{error}"
        except DriveError:
            return f"数据库写入失败且改不回原名，需要人工处理：{error}"
    return "ok"


def apply_plan(drive, connection: sqlite3.Connection, rows: Sequence[dict], *,
               generated_root: Path | str, progress: Callable[..., None] | None = None,
               stamp: str | None = None) -> dict:
    """执行计划，逐条让网盘改名/移动并同步账本；失败的行单独报，不影响其余行。

    调用方必须在拿到可写连接之前完成 SQLite 备份（`scripting.open_for_write` 与
    `web_organize` 都是这么做的）。这里只负责动网盘、写账本和留下批次日志。
    """
    movable = [row for row in rows if row.get("action") in {"rename", "move"}]
    stamp = stamp or time.strftime("%Y%m%d-%H%M%S")
    log_path = batch_log_dir(generated_root) / f"organize-{stamp}.json"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    # 同一个批次号可以再来一次：中断之后重跑，已经改过的行按账本里的现状跳过。
    previous = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else {}
    entries = list(previous.get("entries") or [])
    failures: list[dict] = []
    done = {int(entry["asset_id"]) for entry in entries}
    listings: dict[tuple[str, str], _Listing] = {}

    def save() -> None:
        atomic_write_text(log_path, json.dumps(
            {"stamp": stamp, "entries": entries, "failures": failures},
            ensure_ascii=False, indent=1))

    try:
        for index, row in enumerate(movable, 1):
            asset_id = int(row["asset_id"])
            if asset_id not in done:
                old_path, new_path = str(row["current_path"]), str(row["target_path"])
                current = connection.execute(
                    "SELECT path,disposal,drive_root FROM asset WHERE id=?", (asset_id,)).fetchone()
                if current is None or current[1] is not None:
                    outcome = "资产已不在馆藏，未执行整理"
                elif current[0] == new_path:
                    outcome = "ok"
                else:
                    location, root = new_path.partition(":")[0], current[2] or ""
                    try:
                        if (location, root) not in listings:
                            listings[(location, root)] = _listing(drive, location, root)
                        outcome = _move_one(drive, connection, asset_id, old_path, new_path,
                                            listings[(location, root)])
                    except OrganizeError as error:
                        outcome = str(error)
                if outcome == "ok":
                    entries.append({"asset_id": asset_id, "old_path": old_path,
                                    "new_path": new_path})
                    done.add(asset_id)
                else:
                    retry_after = outcome.retry_after if isinstance(outcome, MoveFailure) else None
                    failures.append({"asset_id": asset_id, "path": old_path,
                                     "reason": str(outcome),
                                     "retryable": retry_after is not None,
                                     "retry_after": retry_after})
                save()
            if progress:
                progress(checked=index, total=len(movable))
    finally:
        save()
    return {"moved": len(entries), "failed": len(failures), "failures": failures[:50],
            "batch": log_path.name, "log_path": str(log_path)}


def rollback_batch(drive, connection: sqlite3.Connection, log_path: Path | str, *,
                   progress: Callable[..., None] | None = None) -> dict:
    """把一个批次逆序改回去。已经被人手工改过的行改不回来，单独报出来。

    退回一行就从日志里划掉一行，所以回滚进行到一半被打断时，日志里剩下的仍然
    是「还没退回去的那些」。
    """
    path = Path(log_path)
    payload = json.loads(path.read_text(encoding="utf-8"))
    entries = list(payload.get("entries") or [])
    restored = int(payload.get("restored_count") or 0)
    remaining = list(entries)
    failures: list[dict] = []
    listings: dict[tuple[str, str], _Listing] = {}

    def save() -> None:
        payload["entries"] = remaining
        payload["restored_count"] = restored
        atomic_write_text(path, json.dumps(payload, ensure_ascii=False, indent=1))

    for index, entry in enumerate(reversed(entries), 1):
        old_path, new_path = str(entry["old_path"]), str(entry["new_path"])
        location = old_path.partition(":")[0]
        current = connection.execute(
            "SELECT path,drive_root FROM asset WHERE id=?", (int(entry["asset_id"]),)).fetchone()
        if current is not None and current[0] == old_path:
            outcome = "ok"
        else:
            root = (current[1] if current else "") or ""
            try:
                if (location, root) not in listings:
                    listings[(location, root)] = _listing(drive, location, root)
                outcome = _move_one(drive, connection, int(entry["asset_id"]), new_path, old_path,
                                    listings[(location, root)])
            except OrganizeError as error:
                outcome = str(error)
        if outcome == "ok":
            restored += 1
            remaining.remove(entry)
        else:
            failures.append({"asset_id": int(entry["asset_id"]), "path": new_path,
                             "reason": str(outcome)})
        save()
        if progress:
            progress(checked=index, total=len(entries))
    if not remaining:
        # 整批都退回去了，这个批次就不该再出现在「回滚上一批」里。
        path.unlink(missing_ok=True)
    return {"restored": restored, "failed": len(failures), "failures": failures[:50],
            "batch": path.name}


__all__ = [
    "MAX_PATH", "PLAN_FIELDS", "PRESETS", "OrganizeError", "TemplateError", "apply_plan",
    "batch_log_dir", "build_plan", "latest_batch", "ledger_path", "placeholder_values",
    "plan_path", "rollback_batch", "scope_path", "segments_of", "write_plan",
]
