"""数据面板：库存统计、存储卷、搜索历史与画质目标。

这一域的输出全是聚合数，没有一条是真相字段：它们全部来自 `COUNT`/`SUM`。因此这里的
函数都可以走 `contract.cached()`，也都必须能在缓存被 `cache_bust()` 清掉时安全丢弃
结果——口径见 `web_state.WebContract.cached`。

存储卷一节只报跑着这份账本的那块盘：藏品都在网盘上，容量按 provider 算，本机再把
每个来源当成一个「卷」列出来只会给出没有意义的数。
"""
from __future__ import annotations

import shutil

from datetime import datetime

from .catalog_rules import tag_cat
from . import media_libraries, settings_file
from .platform import system_volume
from .web_activity import DEFAULT_PROFILE_ID
from .web_catalog import tag_is_not_a_performer_name, tag_not_hidden
from .media_sources import cost_for
from .web_state import WebContract


def q_search_history(contract: WebContract, limit: int = 10):
    with contract.read_connection() as connection:
        rows = connection.execute(
            "SELECT query FROM search_history ORDER BY last_used_at DESC, query LIMIT ?",
            (max(1, min(limit, 50)),),
        ).fetchall()
    return {"items": [row["query"] for row in rows]}


def w_search_history(contract: WebContract, body):
    operation = body.get("operation", "remember")
    query = str(body.get("query", "")).strip()
    if operation == "remove":
        if not query:
            raise ValueError("query is required")
        with contract.write_transaction() as connection:
            connection.execute("DELETE FROM search_history WHERE query=?", (query,))
        return {"ok": True, "operation": operation}
    if operation != "remember" or not query or len(query) > 200:
        raise ValueError("invalid search history request")
    with contract.write_transaction() as connection:
        connection.execute(
            "INSERT INTO search_history(query,used_count,last_used_at) VALUES(?,1,datetime('now')) "
            "ON CONFLICT(query) DO UPDATE SET used_count=used_count+1,last_used_at=excluded.last_used_at",
            (query,),
        )
    return {"ok": True, "operation": operation}


#: 统计页存储一节只报这一块盘：账本与各份缓存都写在这里。
STORAGE_LABEL = "系统盘"


def _storage_volumes() -> list[dict[str, object]]:
    """服务端盘上的容量。藏品在网盘上，那一侧的容量要按 provider 查，不在这一节。

    取不到容量时 `free`/`used`/`total` 留 None，页面据此不画使用率。
    """
    root = system_volume()
    row: dict[str, object] = {
        "kind": "system",
        "label": STORAGE_LABEL,
        "root": str(root),
        "free": None,
        "used": None,
        "total": None,
    }
    try:
        usage = shutil.disk_usage(root)
    except OSError:
        pass
    else:
        row.update(
            free=usage.free,
            used=max(usage.total - usage.free, 0),
            total=usage.total,
        )
    return [row]


#: 库存一节只数盘上还在的：标「已消失」的行留着只为个人记录（ADR-0087），不算库存。
#: 回收站里的照旧算进来。播放与消费一节是个人记录本身，不套这一条。
PRESENT = "COALESCE(disposal,'')<>'vanished' AND NOT peach_is_local_extra(name,path)"
PRESENT_A = "COALESCE(a.disposal,'')<>'vanished' AND NOT peach_is_local_extra(a.name,a.path)"


#: 视频的时长与画质分档，顺序同 `media_probe.context_fields` 的判据：由短到长、由高到低。
LENGTH_BANDS = ("速食", "短", "中", "长")
QUALITY_BANDS = ("4K", "2K", "1080P", "720P", "低画质")


def _bands(c, column: str, order: tuple[str, ...]) -> list[dict[str, object]]:
    """一列分档的视频数。判据里的档位按顺序全列出来，没有视频的读 0；账本里多出的档排在后面。"""
    counts = {row[0]: row[1] for row in c.execute(
        f"SELECT {column},count(*) FROM asset WHERE medium='video' AND {column} IS NOT NULL "
        f"AND {PRESENT} GROUP BY {column}")}
    extra = sorted(key for key in counts if key not in order)
    return [{"k": key, "n": counts.get(key, 0)} for key in (*order, *extra)]


#: 在线追更的一条播放不算进来的条件：它关联的馆藏视频自己已经有这一项。和 `online_played`
#: 同一个去重，一个作品在两边都播过只算一次。
_ONLINE_ONLY = ("(fi.asset_id IS NULL OR NOT EXISTS(SELECT 1 FROM asset a "
                "WHERE a.id=fi.asset_id AND {}))")


def _utc_offset(moment: datetime) -> str:
    offset = moment.strftime("%z") or "+0000"
    return f"UTC{offset[:3]}:{offset[3:]}"


def _play_activity(c, has_follow: bool) -> dict[str, object]:
    """每个作品最近一次播放落在哪一天、星期几的哪个钟点，按本机时区算。

    形状同观看页热力卡（`days`、`hours`、`timezone`）。
    账本每个作品只记最近一次播放的时间，所以一个作品只占一格。"""
    stamps = [row[0] for row in c.execute(
        "SELECT CAST(last_played AS REAL) FROM asset WHERE last_played IS NOT NULL")]
    if has_follow:
        stamps += [row[0] for row in c.execute(
            "SELECT CAST(fp.last_played AS REAL) FROM follow_playback fp "
            "JOIN follow_item fi ON fi.id=fp.follow_item_id WHERE fp.last_played IS NOT NULL AND "
            + _ONLINE_ONLY.format("a.last_played IS NOT NULL"))]
    days: dict[str, int] = {}
    hours: dict[tuple[int, int], int] = {}
    for stamp in stamps:
        if not stamp or stamp <= 0:
            continue
        try:
            moment = datetime.fromtimestamp(stamp).astimezone()
        except (OverflowError, OSError, ValueError):
            continue
        day = moment.date().isoformat()
        days[day] = days.get(day, 0) + 1
        slot = (moment.weekday(), moment.hour)
        hours[slot] = hours.get(slot, 0) + 1
    return {
        "timezone": _utc_offset(datetime.now().astimezone()),
        "days": [{"date": day, "count": count} for day, count in sorted(days.items())],
        "hours": [{"weekday": weekday, "hour": hour, "count": count}
                  for (weekday, hour), count in sorted(hours.items())],
    }


def _replays(c, has_follow: bool) -> list[dict[str, int]]:
    """播放次数的分布：播过 k 次的作品有几个。合计与 `consumption.played` 相同。"""
    counts: dict[int, int] = {}
    rows = list(c.execute("SELECT play_count,count(*) FROM asset WHERE play_count>0 GROUP BY play_count"))
    if has_follow:
        rows += c.execute(
            "SELECT fp.play_count,count(*) FROM follow_playback fp JOIN follow_item fi "
            "ON fi.id=fp.follow_item_id WHERE fp.play_count>0 AND "
            + _ONLINE_ONLY.format("a.play_count>0") + " GROUP BY fp.play_count").fetchall()
    for plays, n in rows:
        counts[int(plays)] = counts.get(int(plays), 0) + n
    return [{"k": plays, "n": n} for plays, n in sorted(counts.items())]


#: 统计页账本那一段读到的表。`tag_not_hidden` 读标签偏好与标签实体的别名，
#: `tag_is_not_a_performer_name` 读实体，在线播放读关注三张表。
STATS_TABLES = ("asset", "asset_entity", "entity", "entity_alias", "asset_tag", "asset_tag_preference",
                "asset_preference", "follow_playback", "follow_item", "follow_source")


def q_stats(contract: WebContract):
    """统计页：库存 / 归属 / 标签 / 本地与在线播放 / 服务端磁盘容量。

    账本那一段三十多条聚合 SQL 合计一秒多，按 `STATS_TABLES` 的版本缓存；媒体库划分取自设置，
    热力图按本机时区分桶，两样作为输入进版本。磁盘容量读的是本机余量，与账本无关，按时间过期。
    """
    config = settings_file.active()
    libraries = [(library, media_libraries.predicate(config, library["id"]))
                 for library in media_libraries.libraries(config)]
    out = dict(contract.cached_until_changed(
        "stats-ledger", lambda: _ledger_stats(contract, libraries),
        repr(libraries), _utc_offset(datetime.now().astimezone()), tables=STATS_TABLES))
    # 磁盘余量要真去问一次文件系统，一次一页都够了，沿用 TTL 缓存。
    out.update(contract.cached("stats-storage", _storage_stats))
    return out


def _ledger_stats(contract: WebContract, libraries) -> dict:
    with contract.read_connection() as c:
        out = {}
        out["by_loc"] = [dict(r) for r in c.execute(
            "SELECT location k, count(*) n, COALESCE(sum(size),0) bytes, "
            "SUM(CASE WHEN medium='video' THEN 1 ELSE 0 END) videos "
            f"FROM asset WHERE {PRESENT} GROUP BY location ORDER BY bytes DESC")]
        out["by_medium"] = [dict(r) for r in c.execute(
            "SELECT medium k, count(*) n, COALESCE(sum(size),0) bytes "
            f"FROM asset WHERE {PRESENT} GROUP BY medium ORDER BY bytes DESC")]
        out["by_length"] = _bands(c, "ctx_length", LENGTH_BANDS)
        out["by_quality"] = _bands(c, "ctx_quality", QUALITY_BANDS)
        out["by_library"] = []
        for library, (clause, params) in libraries:
            counts = c.execute(
                "SELECT count(*) videos,COALESCE(sum(a.size),0) bytes FROM asset a "
                f"WHERE a.medium='video' AND {PRESENT_A} AND " + clause, params,
            ).fetchone()
            out["by_library"].append({"k": library["id"], "name": library["name"],
                                      "icon": library["icon"], **dict(counts)})
        v = c.execute(f"SELECT count(*) FROM asset WHERE medium='video' AND {PRESENT}").fetchone()[0]
        def one(sql, *a):
            r = c.execute(sql, a).fetchone()
            return r[0] if r else 0
        out["attribution"] = {
            "videos": v,
            "creator": one("SELECT count(DISTINCT ae.asset_id) FROM asset_entity ae "
                           "JOIN entity e ON e.id=ae.entity_id JOIN asset a ON a.id=ae.asset_id "
                           f"WHERE a.medium='video' AND {PRESENT_A} AND e.kind='creator'"),
            "code": one(f"SELECT count(*) FROM asset WHERE medium='video' AND {PRESENT} "
                        "AND code IS NOT NULL AND code<>''"),
            "studio": one("SELECT count(DISTINCT ae.asset_id) FROM asset_entity ae "
                          "JOIN entity e ON e.id=ae.entity_id JOIN asset a ON a.id=ae.asset_id "
                          f"WHERE a.medium='video' AND {PRESENT_A} AND e.kind='studio'"),
            "thumb": one(f"SELECT count(*) FROM asset WHERE medium='video' AND {PRESENT} "
                         "AND snapshot_path IS NOT NULL"),
            "duration": one(f"SELECT count(*) FROM asset WHERE medium='video' AND {PRESENT} "
                            "AND duration IS NOT NULL"),
        }
        out["tag_source"] = [dict(r) for r in c.execute(
            "SELECT source k, count(*) n, count(DISTINCT asset_id) assets "
            "FROM asset_tag GROUP BY source ORDER BY n DESC")]
        out["tag_cov"] = one("SELECT count(DISTINCT asset_id) FROM asset_tag "
                             f"WHERE asset_id IN (SELECT id FROM asset WHERE {PRESENT}) "
                             "AND source IN ('name','r18','vision','vision-creator',"
                             "'vision_creator','vision_creator_review')")
        out["top_tags"] = [dict(r, cat=tag_cat(r["k"])) for r in c.execute(
            "SELECT t.tag k, count(*) n FROM asset_tag t JOIN asset a ON a.id=t.asset_id "
            f"WHERE a.medium='video' AND {PRESENT_A} AND t.source IN ('name','r18','vision','vision-creator',"
            "'vision_creator','vision_creator_review') "
            "AND " + tag_is_not_a_performer_name("peach_normalize(t.tag)") + " "
            "AND " + tag_not_hidden('t.asset_id', 'peach_normalize(t.tag)') + ' ' +
            "GROUP BY t.tag ORDER BY n DESC LIMIT 30")]
        tables = {row[0] for row in c.execute(
            "SELECT name FROM sqlite_schema WHERE type='table'"
        )}
        library_played = one("SELECT count(*) FROM asset WHERE play_count>0")
        library_seconds = one("SELECT COALESCE(sum(play_seconds),0) FROM asset")
        online_played = 0
        online_seconds = 0
        has_follow = "follow_playback" in tables
        if has_follow:
            online_played = one(
                "SELECT count(*) FROM follow_playback fp JOIN follow_item fi "
                "ON fi.id=fp.follow_item_id WHERE fp.play_count>0 AND "
                + _ONLINE_ONLY.format("a.play_count>0")
            )
            online_seconds = one(
                "SELECT COALESCE(sum(play_seconds),0) FROM follow_playback"
            )
        out["consumption"] = {
            "played": library_played + online_played,
            "library_played": library_played,
            "online_played": online_played,
            "play_seconds": library_seconds + online_seconds,
            "library_play_seconds": library_seconds,
            "online_play_seconds": online_seconds,
            "o_total": one("SELECT COALESCE(sum(o_count),0) FROM asset"),
            "liked": one("SELECT count(*) FROM asset_preference WHERE profile_id=? AND liked=1",
                         DEFAULT_PROFILE_ID) if "asset_preference" in tables else 0,
            "dislike": one("SELECT count(*) FROM asset WHERE feedback='dislike'"),
            "seen": one("SELECT count(*) FROM asset WHERE feedback='seen'"),
            "trash": one("SELECT count(*) FROM asset WHERE disposal='trash'"),
            "skimmed": one("SELECT count(*) FROM asset WHERE duration>0 AND play_seconds>0 "
                           "AND max_reached>0.6 AND play_seconds/duration < max_reached-0.25"),
        }
        recent = [dict(r, kind="library") for r in c.execute(
            "SELECT id,name,creator,play_seconds,duration,max_reached,leave_ratio,o_count,"
            "CAST(last_played AS REAL) last_played FROM asset WHERE last_played IS NOT NULL "
            "ORDER BY CAST(last_played AS REAL) DESC LIMIT 12")]
        if "follow_playback" in tables:
            recent.extend(dict(r, kind="online", leave_ratio=None, o_count=0) for r in c.execute(
                "SELECT fi.id,fi.title name,fs.label creator,fp.play_seconds,fi.duration,"
                "fp.max_reached,fp.last_played FROM follow_playback fp "
                "JOIN follow_item fi ON fi.id=fp.follow_item_id "
                "JOIN follow_source fs ON fs.id=fi.source_id WHERE fp.last_played IS NOT NULL "
                "ORDER BY fp.last_played DESC LIMIT 12"
            ))
        out["recent"] = sorted(
            recent, key=lambda row: float(row.get("last_played") or 0), reverse=True,
        )[:12]
        out["play_activity"] = _play_activity(c, has_follow)
        out["replays"] = _replays(c, has_follow)
    return out


def _storage_stats() -> dict:
    out = {"storage_volumes": _storage_volumes()}
    measured = [row for row in out["storage_volumes"] if row["total"] is not None]
    out["storage_summary"] = {
        "volumes": len(out["storage_volumes"]),
        "measured": len(measured),
        "free": sum(int(row["free"]) for row in measured),
        "used": sum(int(row["used"]) for row in measured),
        "total": sum(int(row["total"]) for row in measured),
    }
    system = next((row for row in out["storage_volumes"] if row["kind"] == "system"), None)
    out["system_disk"] = (
        {"root": system["root"], "free": system["free"], "total": system["total"]}
        if system and system["total"] is not None else None
    )
    return out


def q_quality_goals(contract: WebContract, args):
    """List explicit better-version targets for the management surface."""
    limit = min(max(int(args.get("limit", "60")), 1), 200)
    offset = max(int(args.get("offset", "0")), 0)
    with contract.read_connection() as connection:
        total = connection.execute(
            "SELECT count(*) FROM asset_quality_goal WHERE profile_id=? AND wanted=1",
            (DEFAULT_PROFILE_ID,),
        ).fetchone()[0]
        rows = [dict(row) for row in connection.execute(
            "SELECT a.id,a.name,a.code,a.location,a.path,a.size,a.duration,a.snapshot_path,"
            "g.reason,g.updated_at FROM asset_quality_goal g "
            "JOIN asset a ON a.id=g.asset_id "
            "WHERE g.profile_id=? AND g.wanted=1 "
            "ORDER BY g.updated_at DESC,a.id DESC LIMIT ? OFFSET ?",
            (DEFAULT_PROFILE_ID, limit, offset),
        )]
    for row in rows:
        row["cost"] = cost_for(row['location'], row.pop('path', None))
        row["has_thumb"] = contract.has_snapshot(row["snapshot_path"])
        row["has_cover"] = contract.has_cover(row.get("code"))
        row["cover_version"] = contract.cover_version(row.get("code"))
        row.pop("snapshot_path", None)
    return {"total": total, "items": rows, "offset": offset,
            "has_more": offset + len(rows) < total}
