"""把「已消失」行的个人记录接到重新登记的文件上（ADR-0087 决策二，按 ADR-0157 精简）。

网盘文件被删掉又被重新传上来时，扫描先把它标成 `disposal='vanished'`，新上传的那份是一个
新的 `remote_id`，登记成新行。两行对不上，但人只有一部片：评分、播放进度、收藏、队列都在
旧行上。新行登记完（时长探测之后再判一遍，见 `reattach_in`）按下面两条判据找旧行：

1. 番号：`normalise_code_key` 之后对上的已消失行只有一条、新行也只有一个就搬；几个时取
   时长最接近的，时长缺或并列就不搬，留人在孤儿记录里选。
2. 无番号的创作者视频：旧行的创作者是新文件路径上的一层目录、文件名主干相同、时长差在
   `DURATION_TOLERANCE` 秒之内；候选多个时同样取最接近的。

搬运改指五张引用表、把旧行四列个人记录并进新行，然后删掉旧行。与挂载时代的实现相比，
这里不再写 `record_rehome` 批次快照：整批撤回的入口（自动落库撤回、孤儿接回按钮）已随
挂载面一起删除，留着快照没有读者。撤销只能回到账本备份。

调用方负责事务：这里的函数都只在给定连接上写，不提交。
"""
from __future__ import annotations

import logging
import sqlite3
from collections import Counter, defaultdict
from collections.abc import Iterable, Sequence
from contextlib import closing
from datetime import datetime
from pathlib import PureWindowsPath

from .catalog_rules import normalise_code_key, release_code_from_filename
from .personal_records import ASSET_RECORD_COLUMNS, ASSET_REFERENCE_TABLES, VANISHED

LOGGER = logging.getLogger(__name__)

#: 搬运时改指新行的五张表，各自除 `asset_id` 之外认同一条记录的键。
MOVED_TABLES: dict[str, tuple[str, ...]] = {
    "asset_preference": ("profile_id",),
    "watch_queue": ("profile_id",),
    "playlist_item": ("playlist_id",),
    "activity_event": ("id",),
    "asset_tag_preference": ("profile_id", "normalized_tag"),
}
#: 寻找更好版本的目标：搬到新行后关闭。
GOAL_TABLE, GOAL_KEYS = "asset_quality_goal", ("profile_id",)

#: 无番号的创作者视频：时长差在这几秒之内算同一部。
DURATION_TOLERANCE = 2.0

_COLUMNS = "id,location,path,name,code,creator,duration"


def _rows(connection, sql: str, params: Sequence = ()) -> list[dict]:
    return [dict(row) for row in connection.execute(sql, params).fetchall()]


def code_key(row: dict) -> str:
    """一行的番号键：有 `code` 用它，新登记的行还没有，就从文件名里解析。"""
    return normalise_code_key(row.get("code") or release_code_from_filename(row.get("name")))


def _stem(name: str | None) -> str:
    return PureWindowsPath(name or "").stem.casefold()


def _creator(connection, row: dict) -> str:
    if row.get("creator"):
        return str(row["creator"])
    found = connection.execute(
        "SELECT creator FROM asset WHERE id=?", (row["id"],)).fetchone()
    return str(found[0] or "") if found else ""


def _under(path: str, creator: str) -> bool:
    """创作者目录是不是这个文件路径上的一层。虚拟路径与旧的本机路径都按同一套写法看。"""
    wanted = creator.strip().casefold()
    if not wanted:
        return False
    parts = [part.casefold() for part in PureWindowsPath(path or "").parts]
    return any(part == wanted for part in parts)


def _closest(old: dict, candidates: list[dict]) -> dict | None:
    """只有一个候选就是它；多个时取时长与旧行最接近的，时长缺或并列返回 None。"""
    if len(candidates) == 1:
        return candidates[0]
    duration = old.get("duration")
    if not candidates or not duration or any(not item.get("duration") for item in candidates):
        return None
    gaps = sorted((abs(float(item["duration"]) - float(duration)), item["id"]) for item in candidates)
    if gaps[0][0] == gaps[1][0]:
        return None
    return next(item for item in candidates if item["id"] == gaps[0][1])


def _creator_candidates(connection, old: dict, by_stem: dict[str, list[dict]]) -> list[dict]:
    """`by_stem` 是无番号的在库行按文件名主干分的组：在整库里找时不必逐行比一遍。"""
    same_stem = by_stem.get(_stem(old["name"]), [])
    creator, duration = (_creator(connection, old), old.get("duration")) if same_stem else ("", None)
    if not creator or not duration:
        return []
    return [item for item in same_stem
            if _under(item["path"], creator) and item.get("duration")
            and abs(float(item["duration"]) - float(duration)) <= DURATION_TOLERANCE]


def _vanished_rows(connection) -> list[dict]:
    return _rows(connection, f"SELECT {_COLUMNS} FROM asset WHERE disposal=? AND medium='video'",
                 (VANISHED,))


def _pairs(connection, vanished: list[dict], fresh: list[dict]) -> list[tuple[dict, dict, str]]:
    """已消失行与在库行按两条判据配对，只留一对一的。"""
    olds_by_code: dict[str, list[dict]] = defaultdict(list)
    news_by_code: dict[str, list[dict]] = defaultdict(list)
    news_by_stem: dict[str, list[dict]] = defaultdict(list)
    for row in vanished:
        if key := code_key(row):
            olds_by_code[key].append(row)
    for row in fresh:
        if key := code_key(row):
            news_by_code[key].append(row)
        else:
            news_by_stem[_stem(row["name"])].append(row)
    pairs = []
    for key, olds in olds_by_code.items():
        # 同番号消失了几条（分卷、两个版本都没了）就分不出哪条记录归哪个文件，留给人。
        chosen = _closest(olds[0], news_by_code.get(key, [])) if len(olds) == 1 else None
        if chosen:
            pairs.append((olds[0], chosen, "code"))
    for old in vanished:
        if not code_key(old):
            chosen = _closest(old, _creator_candidates(connection, old, news_by_stem))
            if chosen:
                pairs.append((old, chosen, "creator-stem-duration"))
    # 两条旧行争同一个新文件：分不出，都留给人。
    claimed = Counter(new["id"] for _old, new, _rule in pairs)
    return [pair for pair in pairs if claimed[pair[1]["id"]] == 1]


def plan(connection, new_ids: Iterable[int]) -> list[tuple[dict, dict, str]]:
    """这几行新文件各自该接哪一条已消失行：`(旧行, 新行, 判据)`，一对一。"""
    wanted = sorted({int(item) for item in new_ids})
    if not wanted:
        return []
    vanished = _vanished_rows(connection)
    if not vanished:
        return []
    fresh = []
    for offset in range(0, len(wanted), 400):
        batch = wanted[offset:offset + 400]
        fresh += _rows(connection,
                       f"SELECT {_COLUMNS} FROM asset WHERE id IN ({','.join('?' * len(batch))}) "
                       "AND disposal IS NULL AND medium='video'", batch)
    return _pairs(connection, vanished, fresh)


def _move_rows(connection, table: str, keys: tuple[str, ...], old_id: int, new_id: int) -> list[dict]:
    """把旧行在这张表里的记录改指新行，新行已有同键记录的那条不搬；返回搬了的键。"""
    moved = []
    match = " AND ".join(f"{key}=?" for key in keys)
    for row in _rows(connection, f"SELECT {','.join(keys)} FROM {table} WHERE asset_id=?", (old_id,)):
        values = [row[key] for key in keys]
        if connection.execute(f"SELECT 1 FROM {table} WHERE asset_id=? AND {match}",
                              (new_id, *values)).fetchone():
            continue
        connection.execute(f"UPDATE {table} SET asset_id=? WHERE asset_id=? AND {match}",
                           (new_id, old_id, *values))
        moved.append(row)
    return moved


def _epoch(value) -> float:
    """`last_played` 多数是 epoch 秒，早年导入的行可能是 ISO 时间；认不出的当最早。"""
    try:
        return float(value)
    except (TypeError, ValueError):
        try:
            return datetime.fromisoformat(str(value).replace("Z", "+00:00")).timestamp()
        except ValueError:
            return float("-inf")


def _fold_row_records(connection, old_id: int, new_id: int) -> None:
    """把旧行上四列个人记录并进新行：评分新行为空才取旧的，次数相加，最近播放取较晚的。"""
    columns = ",".join(ASSET_RECORD_COLUMNS)
    old = _rows(connection, f"SELECT {columns} FROM asset WHERE id=?", (old_id,))[0]
    new = _rows(connection, f"SELECT {columns} FROM asset WHERE id=?", (new_id,))[0]
    merged = {"rating": new["rating"] if new["rating"] is not None else old["rating"]}
    for column in ("o_count", "play_count"):
        both = (old[column], new[column])
        merged[column] = None if both == (None, None) else sum(int(value or 0) for value in both)
    played = [value for value in (old["last_played"], new["last_played"]) if value is not None]
    merged["last_played"] = max(played, key=_epoch) if played else None
    connection.execute(f"UPDATE asset SET {','.join(f'{column}=?' for column in ASSET_RECORD_COLUMNS)} "
                       "WHERE id=?", (*[merged[column] for column in ASSET_RECORD_COLUMNS], new_id))


def move(connection, old_id: int, new_id: int, *, rule: str = "code") -> None:
    """把一条已消失行的个人记录搬到新行，删掉旧行。调用方提交。"""
    old = connection.execute("SELECT disposal FROM asset WHERE id=?", (old_id,)).fetchone()
    target = connection.execute("SELECT disposal FROM asset WHERE id=?", (new_id,)).fetchone()
    if old is None or old[0] != VANISHED:
        raise ValueError("只能接回已消失的行")
    if target is None or target[0] is not None or old_id == new_id:
        raise ValueError("只能接到在库的另一行")
    for table, keys in MOVED_TABLES.items():
        _move_rows(connection, table, keys, old_id, new_id)
    _fold_row_records(connection, old_id, new_id)
    moved_goals = _move_rows(connection, GOAL_TABLE, GOAL_KEYS, old_id, new_id)
    connection.executemany(
        f"UPDATE {GOAL_TABLE} SET wanted=0,replaced_at=strftime('%Y-%m-%d %H:%M:%S','now') "
        "WHERE asset_id=? AND profile_id=?",
        [(new_id, row["profile_id"]) for row in moved_goals])
    for column in ("current_asset_id", "source_seed_asset_id"):
        connection.execute(f"UPDATE playlist SET {column}=? WHERE {column}=?", (new_id, old_id))
    for table in ASSET_REFERENCE_TABLES:
        connection.execute(f"DELETE FROM {table} WHERE asset_id=?", (old_id,))
    connection.execute("DELETE FROM asset WHERE id=?", (old_id,))
    LOGGER.info("个人记录接回：旧行 %s 接到新行 %s（%s）", old_id, new_id, rule)


def reattach(connection, new_ids: Iterable[int]) -> list[int]:
    """登记完一批新文件后接回记录；返回接走了的旧行 id。调用方提交。"""
    pairs = plan(connection, new_ids)
    for old, new, rule in pairs:
        move(connection, old["id"], new["id"], rule=rule)
    return [old["id"] for old, _new, _rule in pairs]


def reattach_in(db_path, new_ids: Sequence[int]) -> int:
    """探完时长之后再判一遍：登记那一刻新文件还没有时长，多个候选与无番号的那条判据要等它。"""
    if not new_ids:
        return 0
    with closing(sqlite3.connect(db_path, timeout=30)) as connection:
        connection.row_factory = sqlite3.Row
        reattached = reattach(connection, new_ids)
        connection.commit()
    return len(reattached)
