"""只读 JAV 馆藏探索：没怎么看过的馆藏，按所选字段排序。"""
from __future__ import annotations

from . import entities, web_catalog

#: 馆藏探索的排序：发行时间（默认）、来源评分、时长、番号。
DISCOVERY_SORTS = ("release_date", "source_score", "duration", "code")
#: 一次最多看这么多部；排序在截断后的候选上做，不再为打分另排一遍。
CANDIDATE_LIMIT = 4000
#: 这些表只记观看痕迹，不改变候选与排序，不必让缓存失效。
RANKING_UNREAD_TABLES = ("activity_event", "search_history")


def _identity(connection, kind, name):
    found = entities.resolve_entity(connection, kind, name)
    return int(found["id"]) if found else f"name:{entities.normalize_entity_name(name)}"


def _library(connection):
    # 完播作品和反复观看作品不属于「少看」；未知时长只按已有观看次数判断。
    rows = [dict(row) for row in connection.execute(
        "SELECT a.id,a.location,a.name,COALESCE(NULLIF(a.catalog_title,''),NULLIF(a.original_title,''),a.name) AS title,a.creator,a.studio,a.code,"
        "a.release_date,a.duration,a.snapshot_path,a.play_count,a.max_reached,a.region,"
        + web_catalog.EFFECTIVE_REGION_SQL + " AS effective_region FROM asset a WHERE "
        + web_catalog.JAV_ASSET_PREDICATE
        + " AND a.medium='video' AND a.disposal IS NULL AND COALESCE(a.feedback,'') NOT IN ('dislike','seen')"
        " AND COALESCE(a.play_count,0)<=1 AND (COALESCE(a.duration,0)<=0"
        " OR COALESCE(a.max_reached,0)<a.duration*0.5) ORDER BY a.id")]
    by_id = {row["id"]: row for row in rows}
    excluded = entities.male_performer_ids(connection)
    for row in rows:
        row.update({"entities": {}, "tags": [], "asset_id": row["id"], "cover_url": "", "link": "",
                    "source_score": None, "metadata_state": "ready", "metadata_fields": {}})
    for offset in range(0, len(rows), 800):
        ids = [row["id"] for row in rows[offset:offset + 800]]
        marks = ",".join("?" * len(ids))
        for aid, identity, kind, name in connection.execute(
            "SELECT ae.asset_id,e.id,e.kind,e.canonical_name FROM asset_entity ae"
            " JOIN entity e ON e.id=ae.entity_id WHERE ae.asset_id IN (" + marks + ")"
            " AND e.kind IN ('performer','creator','tag','studio','series') AND (e.kind<>'tag' OR "
            + web_catalog.tag_not_hidden("ae.asset_id", "e.normalized_name") + ") ORDER BY e.canonical_name", ids):
            if identity in excluded:
                continue
            row = by_id[aid]
            row["entities"].setdefault(kind, set()).add(identity)
            if kind == "tag" and web_catalog.tag_cat(name) in (
                    "general", "relationship", "role", "appearance", "scene", "story", "position"):
                row["tags"].append(name)
        # 兼容投影仍须同一身份解析，不以名称子串匹配。
        for row in rows[offset:offset + 800]:
            if not row["entities"].get("studio") and row.get("studio"):
                row["entities"]["studio"] = {_identity(connection, "studio", row["studio"])}
            if not row["entities"].get("creator") and row.get("creator"):
                row["entities"]["creator"] = {_identity(connection, "creator", row["creator"])}
    return rows


def _ranking_args(args):
    limit = max(1, min(int(args.get("limit") or 60), 100))
    sort = args.get("sort") if args.get("sort") in DISCOVERY_SORTS else DISCOVERY_SORTS[0]
    return limit, sort, args.get("direction") != "asc"


def _scored(contract):
    """候选与去重：各种排序共用一份。

    同一部作品在库里可能有多行，按番号只留第一行；超过 `CANDIDATE_LIMIT` 的按查询顺序截断。
    """
    def compute():
        with contract.read_connection() as connection, entities.memoized_resolution():
            candidates = _library(connection)
        unique = {}
        for row in candidates:
            key = web_catalog.normalise_code_key(row["code"]) or row["id"]
            unique.setdefault(key, row)
        candidates = list(unique.values())
        return {"total": len(candidates), "bounded": candidates[:CANDIDATE_LIMIT]}

    return contract.cached_until_changed(
        "jav-explore", compute, tables=contract.ledger_tables_except(RANKING_UNREAD_TABLES),
        allow_stale=False)


def _field_order(rows, field, descending):
    """按所选字段稳定排序；取不到值的排在末尾，不随方向翻转。"""
    known = [row for row in rows if row.get(field) not in (None, "")]
    known.sort(key=lambda row: row[field], reverse=descending)
    return known + [row for row in rows if row.get(field) in (None, "")]


def _ranked(contract, sort, descending, limit):
    """一页探索：按所选字段排序后取前 `limit` 条，与候选相同的输入版本缓存。

    页面会反复来取，结果是共享对象，调用方先复制再改。
    """
    def compute():
        scored = _scored(contract)
        picked = _field_order(scored["bounded"], sort, descending)[:limit]
        for rank, row in enumerate(picked, 1):
            row.pop("entities", None)
            row.pop("why", None)
            row["rank"] = rank
        return {"total": scored["total"], "picked": picked}

    return contract.cached_until_changed(
        repr(("jav-explore", sort, descending, limit)), compute,
        tables=contract.ledger_tables_except(RANKING_UNREAD_TABLES), allow_stale=False)


def q_jav_discoveries(contract, args):
    """按所选字段排序取一页；只读。"""
    limit, sort, descending = _ranking_args(args)
    ranked = _ranked(contract, sort, descending, limit)
    picked = [dict(row) for row in ranked["picked"]]
    web_catalog.attach_card_performers(contract, picked)
    for row in picked:
        row["performer_refs"] = row.pop("performer_entities", [])
        row["performers"] = "、".join(row["performers"])
        web_catalog.attach_artwork_fields(contract, row)
        row["has_thumb"] = contract.has_snapshot(row.pop("snapshot_path", None))
    return {"items": picked, "candidate_total": ranked["total"], "sort": sort,
            "direction": "asc" if args.get("direction") == "asc" else "desc",
            "limited": ranked["total"] > CANDIDATE_LIMIT, "source": "library"}
