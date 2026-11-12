"""数据管理页的「孤儿记录」：个人记录还在、账本行已经标成消失的那几条。

列表列出全部 `disposal='vanished'` 的行、它们在六张表里各有几条记录与行上的评分和次数，
人从里面挑一条彻底删除。彻底删除不在这里：页面走 `/api/batch` 的 `delete`，那一支对已消失的行
只删账本行（`purge_assets`）。
"""
from __future__ import annotations

from .personal_records import VANISHED, record_counts
from .web_state import WebContract

_COLUMNS = "id,location,name,code,duration,size,snapshot_path,feedback_at"


def q_orphan_records(contract: WebContract, args=None):
    """全部已消失的行，新标的在前；每条带六张表的记录数。"""
    with contract.read_connection() as connection:
        orphans = [dict(row) for row in connection.execute(
            f"SELECT {_COLUMNS} FROM asset WHERE disposal=? ORDER BY feedback_at DESC,id DESC", (VANISHED,))]
        counts = record_counts(connection, [row["id"] for row in orphans])
    return {"total": len(orphans), "items": [
        {"id": row["id"], "name": row["name"], "code": row["code"] or "", "location": row["location"],
         "duration": row["duration"], "size": row["size"], "vanished_at": row["feedback_at"],
         "has_thumb": bool(row["snapshot_path"]), "records": counts.get(row["id"], {})}
        for row in orphans]}
