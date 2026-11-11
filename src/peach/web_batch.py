"""垃圾复核展示、批量决定、永久删除与回收站。

`junk` 提供各流程共用的证据规则；本模块将评分转成页面数据，并执行用户的批量决定。
自动判定只把资产送进回收站，永久删除需要独立的确认与取证流程。

媒体只在网盘上，删除只动账本行：不核对本机文件是否存在，也不删任何文件。物理删除要清的
引用表只写在 `personal_records.ASSET_REFERENCE_TABLES` 一处。
"""
from __future__ import annotations

import csv
import logging
import time

from pathlib import Path, PureWindowsPath

from . import junk
from .catalog_rules import duration_clusters, is_jav_code, normalise_code_key
from .field_owners import USER_MANUAL, write_owned_fields
from .media_sources import SCANNABLE_LOCATIONS
from .personal_records import ASSET_REFERENCE_TABLES, VANISHED
from .regions import normalize_region
from .task_runs import TaskRunHandle
from .web_activity import DEFAULT_PROFILE_ID
from .web_catalog import attach_card_performers
from .web_state import WebContract

from .junk import (
    AD_DIRPACK as AD_DIRPACK,
    AD_DOMAIN as AD_DOMAIN,
    AUTO_TRASH_SCORE as AUTO_TRASH_SCORE,
    BUNDLE_DIR_ASSETS as BUNDLE_DIR_ASSETS,
    CONTENT_BYTES as CONTENT_BYTES,
    INTERNET_SHORTCUT_SUFFIXES as INTERNET_SHORTCUT_SUFFIXES,
    JUNK_KINDS as JUNK_KINDS,
    JUNK_REVIEW_SCORE as JUNK_REVIEW_SCORE,
    JUNK_VIDEO_MAX_BYTES as JUNK_VIDEO_MAX_BYTES,
    MEDIA_SIDECAR_SUFFIXES as MEDIA_SIDECAR_SUFFIXES,
    PART_MARK as PART_MARK,
    PROMO_CLUSTER_FILES as PROMO_CLUSTER_FILES,
    PROMO_DOMAIN as PROMO_DOMAIN,
    PROMO_FILLER as PROMO_FILLER,
    PROMO_PHRASE as PROMO_PHRASE,
    REAL_CODE as REAL_CODE,
    has_sibling_original as has_sibling_original,
    promo_residue as promo_residue,
)

LOGGER = logging.getLogger(__name__)

#: 垃圾评分读的账本表。不声明时任何一次提交（任务记录、复核写回）都让下一次打开当场重评
#: 十万行；声明后后台任务的提交先回上一份、后台重算（ADR-0146），前台写入照旧当场重算。
JUNK_SCORE_TABLES = ("asset", "review_decision", "download_task")

#: 批量操作在活动页上的名字。表里存 `operation`，人看的是这一列。
BATCH_LABELS = {
    "like": "批量标记喜欢", "seen": "批量标记看过", "later": "批量加入稍后看",
    "dispose": "批量移入回收站", "restore": "批量还原", "delete": "批量永久删除",
    "dismiss-junk": "批量确认不是垃圾", "reconsider-junk": "批量重新判定垃圾",
    "keep-duplicates": "重复组标记都保留", "reconsider-duplicates": "重复组重新列出",
    "region": "批量判定产地",
}

#: 重复组「都保留」记在 `review_decision` 的这一类下，键是组员 id 升序连写。组里文件一增一减，
#: 键就对不上，这组自动回到列表（做法参考 SakuraMedia `608abc0bfb`）。
DUPLICATE_KEEP_CATEGORY = "duplicate_group"


def duplicate_group_key(ids) -> str:
    return ",".join(str(asset_id) for asset_id in sorted(int(asset_id) for asset_id in ids))


def q_ads(contract: WebContract, limit=200, offset=0, kind="", status="pending"):
    """疑似垃圾复核队列 —— **不自动删**，只排队让人看证据确认。

    没有可靠的单一判据（试过「同番号短版」会误伤 CD2/part1 分卷，
    试过「同名扩散」会误伤 001.mp4 这类通用名的真文件）。
    所以给的是**嫌疑分**，按分排序，人工看图定夺，确认的走既定 CSV 删除流程。

    2026-08-15 按用户标记的 21 条真广告重新标定：命中推广词本身不算证据，
    要看**剥掉推广词后还剩不剩内容**。三类实测误判据此排除：剧情里的「微信」、
    开头是盗版站域名但正文是真实描述、以及把创作者账号当成番号去比时长。

    2026-09-03 按用户复核的三类结果再调，判据从「只看文件名」扩到**看它的邻居**：
    手游插页靠 `PROMO_FILLER` 与不再补空格的残留计算入队，剩下几个残留仍高的靠
    `PROMO_CLUSTER_FILES`（同目录成群的同类推广名）补齐；同目录资产满
    `BUNDLE_DIR_ASSETS` 的成套资源包不再因整名是域名而入队；文件自己是真番号、
    自己超过 `CONTENT_BYTES`、或是同目录正片的封面／截图时，`AD_DIRPACK` 的目录
    证据不成立——蓝光原盘和它的海报都属于这一类。

    物理资源的类型不能成为免检条件。视频保留时长、体积和同番号长版证据；图片、
    音频、压缩包和其它文件走共用的推广名／推广目录证据；Windows ``.url`` 是网址
    快捷方式，在媒体目录中直接进入人工复核。在线资产不是待清理的物理文件，排除。

    广告包还有一类没有推广词的样本：目录名自曝（`一键约炮`、`-APP`、`論壇文宣`），
    整包只有一条正片加一张配套封面，其余是装饰符小图、品牌推广卡与网页存档。
    这几种形态各自独立计分，配套封面走正片配对豁免，推广目录里的长视频只加 30 分、
    要再叠一条时长或体积证据才到门槛。

    词库 `PROMO_NAMES_FILE` 里的固定命名，以及未探测时长视频的目录与体积证据，只够进队列：
    这部分分数单独凑够 `AUTO_TRASH_SCORE` 时压到线下，须有别的证据或人看过内容才进回收站。"""
    kind = str(kind or "").strip().casefold()
    status = str(status or "pending").strip().casefold()
    if kind and kind not in JUNK_KINDS:
        raise ValueError("invalid junk kind")
    if status not in {"pending", "dismissed"}:
        raise ValueError("invalid junk status")
    out, dismissed_ids = contract.cached_until_changed(
        "junk-scored", lambda: _scored_junk(contract), tables=JUNK_SCORE_TABLES)
    pending = [item for item in out if item["id"] not in dismissed_ids]
    dismissed = [item for item in out if item["id"] in dismissed_ids]
    pool = dismissed if status == "dismissed" else pending
    counts = {junk_kind: 0 for junk_kind in JUNK_KINDS}
    for item in pool:
        counts[item["junk_kind"]] += 1
    filtered = [item for item in pool if not kind or item["junk_kind"] == kind]
    # 缓存里那份是共享的，这一页的条目复制出来再挂演员，不改到下一次请求。
    items = [dict(item) for item in filtered[offset:offset + limit]]
    attach_card_performers(
        contract, [item for item in items if item.get("medium") == "video"])
    return {
        "total": len(filtered),
        "all_total": len(pool),
        "pending_total": len(pending),
        "dismissed_total": len(dismissed),
        "counts": counts,
        "kind": kind,
        "status": status,
        "items": items,
    }


def _scored_junk(contract: WebContract) -> tuple[list[dict], frozenset[int]]:
    """领域评分加上页面需要的缩略图状态，路径留在服务内部。"""
    out, dismissed = junk.scored_candidates(contract)
    for item in out:
        item["has_thumb"] = contract.has_snapshot(item.pop("snapshot_path", None))
        item.pop("path", None)
    return out, dismissed


def _purge_outside_lock(contract: WebContract, rows, *, eligible=None, verify=None) -> dict:
    """行在事务外读好，开写事务复核后删账本行。

    `verify(connection)` 在同一事务里先跑，用来核对调用方的前提（删除清单的口令）；抛错就整批
    放弃。返回尚未 `_finish_purge` 的回执。
    """
    with contract.write_transaction() as connection:
        if verify is not None:
            verify(connection)
        return purge_assets(connection, rows, eligible=eligible)


def _own_data_root(contract, root) -> bool:
    """候选件是否就在这本账自己的数据目录里。

    生产上 `ledger.db` 在 `peach-data/database` 下，可重建产物在隔壁 `peach-data/generated`；
    临时账本常把数据库直接放在临时根下。两种形状都靠数据库定出唯一允许改动的目录树，免得
    临时账本配上默认目录时，把真实数据目录里的候选表当成自己的。
    """
    if root is None:
        return False
    database_parent = Path(contract.db_path).resolve().parent
    data_root = (database_parent.parent if database_parent.name.casefold() == "database"
                 else database_parent)
    resolved = Path(root).resolve()
    return resolved != data_root and resolved.is_relative_to(data_root)


def _purge_receipt(contract: WebContract, outcome: dict, **fields) -> dict:
    """删完之后的回执：撤下钉着这些资产的资料候选，带上调用方要的字段。"""
    return {"ok": True, **fields, **_finish_purge(outcome, contract)}


def _finish_purge(outcome, contract=None):
    """撤下钉着这些资产的资料候选（#486），返回回执。

    撤不成不影响删除结果：复核页按路径改挂或剔掉悬空行；处理任务正拿着候选表时，
    它下一次写表也可能把这几行写回去。
    """
    ids = outcome.pop("_ids", [])
    candidate_root = getattr(contract, "candidate_root", None)
    if ids and _own_data_root(contract, candidate_root):
        from .stale_candidates import withdraw_purged_rows
        try:
            withdraw_purged_rows(candidate_root, ids)
        except (OSError, ValueError, csv.Error):
            LOGGER.exception("撤下已删除资产的资料候选失败")
    return outcome


def purge_assets(connection, rows, *, missing_only: bool = False, eligible=None) -> dict:
    """在写事务里删这些账本行；先逐行复核。

    媒体只在网盘上，删除只动账本行：不核对本机文件是否存在，也不删任何文件。孤儿记录那边
    的 `missing_only` 到这里是同一种口径——两种调用都只删账本行。

    行是调用方在事务外读出来的，这段时间里行可能被改：还原出回收站、换了路径、已被别处删掉。
    `eligible(row)` 是调用方的删除条件（`row` 带 `id,path,disposal`），路径必须和读出来时一致。
    复核不过的行不删，进 `blocked`。返回 `purged`、`blocked` 与删掉的 id。
    """
    current = {}
    if rows:
        marks = ",".join("?" * len(rows))
        current = {row["id"]: row for row in connection.execute(
            f"SELECT id,path,disposal FROM asset WHERE id IN ({marks})",
            [row["id"] for row in rows])}
    kept, returned = [], []
    for row in rows:
        live = current.get(row["id"])
        if live is not None and live["path"] == row["path"] and (eligible is None or eligible(live)):
            kept.append(row)
        else:
            returned.append(row)
    purged = [row["id"] for row in kept]
    if purged:
        marks = ",".join("?" * len(purged))
        connection.execute(
            f"UPDATE playlist SET current_asset_id=NULL WHERE current_asset_id IN ({marks})",
            purged,
        )
        connection.execute(
            f"UPDATE playlist SET source_seed_asset_id=NULL WHERE source_seed_asset_id IN ({marks})",
            purged,
        )
        for table in ASSET_REFERENCE_TABLES:
            connection.execute(f"DELETE FROM {table} WHERE asset_id IN ({marks})", purged)
        # 按文件出的资料候选键是 `asset:<编号>:<字段>`；资产删了，这些决定就没有可指的东西（#486）。
        connection.executemany(
            "DELETE FROM review_decision WHERE category='metadata_fields' AND item_key GLOB ?",
            [(f"asset:{asset_id}:*",) for asset_id in purged])
        connection.execute(f"DELETE FROM asset WHERE id IN ({marks})", purged)
    return {
        "purged": len(purged),
        "blocked": [{"id": row["id"], "path": row["path"], "reason": "删除期间这一条已经变了"}
                    for row in returned],
        "_ids": purged,
    }


def w_empty_trash(contract: WebContract):
    """永久清空回收站：只处理 disposal='trash' 的资产，其余一律不碰。"""
    contract.cache_bust()
    with contract.read_connection() as connection:
        rows = connection.execute(
            "SELECT id,location,path FROM asset WHERE disposal='trash'",
        ).fetchall()
    # 这期间被还原出回收站的，事务里复核时留下。
    outcome = _purge_outside_lock(contract, rows, eligible=lambda row: row["disposal"] == "trash")
    return _purge_receipt(contract, outcome, operation="empty-trash")


def _batch_region_value(body) -> str | None:
    """批量判定产地要写进真相字段的值；`None` 表示退回未判定。

    `none` 是「撤回这个判定」。认不出的写法一律拒绝，而不是按 `normalize_region`
    的习惯当成未判定——那会把一次拼错的批量操作变成一次静默的清空。
    """
    requested = str(body.get("region") or "").strip().lower()
    value = normalize_region(requested)
    if not value and requested != "none":
        raise ValueError("unsupported region")
    return value or None


#: 还原与永久删除只对这两档成立：回收站里的，和文件已不在盘上、带着个人记录的
#: （`vanished`，ADR-0087）。还原是清掉 `disposal`，永久删除走 `purge_assets`。
DISPOSED = frozenset({"trash", VANISHED})


def _reject_ineligible_targets(operation: str, rows) -> None:
    """选中集合与操作对不上就拒绝整批，不做部分生效。"""
    if operation in {"restore", "delete"} and any(row["disposal"] not in DISPOSED for row in rows):
        raise ValueError("restore/delete is only allowed for recycle-bin or vanished assets")
    # 已消失的行文件不在盘上：进回收站再还原就成了在库，只能在孤儿记录里接回或彻底删除。
    if operation == "dispose" and any(row["disposal"] == VANISHED for row in rows):
        raise ValueError("vanished assets cannot be moved to the recycle bin")
    if operation in {"dismiss-junk", "reconsider-junk"} and any(
            row["location"] not in SCANNABLE_LOCATIONS
            or row["disposal"] is not None for row in rows):
        raise ValueError("junk decisions are only allowed for active physical assets")
    if operation in {"keep-duplicates", "reconsider-duplicates"} and (
            len(rows) < 2 or any(row["disposal"] is not None for row in rows)):
        raise ValueError("duplicate decisions need a whole group of active assets")


def _batch_disposal_reason(body):
    """移入回收站的原因；显式空值用于撤销未记录原因的条目。"""
    if body.get("operation") != "dispose":
        return None
    reason = body.get("disposal_reason", "manual")
    if reason not in (None, "manual", "junk", "duplicate", "missing"):
        raise ValueError("unsupported disposal reason")
    return reason


#: 只在 `review_decision` 里记一笔或撤一笔、不碰 asset 行的几种批量操作。
REVIEW_MARKS = frozenset({"dismiss-junk", "reconsider-junk", "keep-duplicates", "reconsider-duplicates"})


def _write_review_mark(connection, operation, ids, now):
    """「不是垃圾」按文件一条；「都保留」按整组一条，键随组员走。"""
    stamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
    upsert = ("INSERT INTO review_decision(category,item_key,status,note,updated_at) "
              "VALUES(?,?,'rejected',?,?) ON CONFLICT(category,item_key) DO UPDATE SET "
              "status='rejected',note=excluded.note,updated_at=excluded.updated_at")
    remove = "DELETE FROM review_decision WHERE category=? AND item_key=?"
    if operation == "dismiss-junk":
        connection.executemany(upsert, [("junk_file", str(i), "用户确认不是垃圾", stamp) for i in ids])
    elif operation == "reconsider-junk":
        connection.executemany(remove, [("junk_file", str(i)) for i in ids])
    elif operation == "keep-duplicates":
        connection.execute(upsert, (DUPLICATE_KEEP_CATEGORY, duplicate_group_key(ids), "用户确认这组都保留", stamp))
    else:
        connection.execute(remove, (DUPLICATE_KEEP_CATEGORY, duplicate_group_key(ids)))


def _write_batch_state(connection, rows, operation, now, disposal_reason):
    """同一事务写入反馈或回收站状态，并保留还原操作的撤销信息。"""
    ids = [row["id"] for row in rows]
    marks = ",".join("?" * len(ids))
    if operation == "restore":
        connection.execute(
            f"UPDATE asset SET disposal=NULL,disposal_reason=NULL,feedback_at=? WHERE id IN ({marks})",
            [now, *ids],
        )
        return {"restored_reasons": {str(row["id"]): row["disposal_reason"] for row in rows}}
    if operation == "dispose":
        connection.execute(
            f"UPDATE asset SET disposal='trash',disposal_reason=?,feedback_at=? WHERE id IN ({marks})",
            [disposal_reason, now, *ids],
        )
    else:
        connection.execute(f"UPDATE asset SET feedback='seen',feedback_at=? WHERE id IN ({marks})", [now, *ids])
    return {}


def w_batch(contract: WebContract, body):
    """Apply one explicit, reversible marker to a bounded selected set."""
    raw_ids = body.get("ids")
    if not isinstance(raw_ids, list):
        raise TypeError("ids must be a list")
    ids = list(dict.fromkeys(int(item) for item in raw_ids))
    if not ids or len(ids) > 200:
        raise ValueError("batch requires 1 to 200 assets")
    operation = body.get("operation")
    if operation not in {
        "like", "seen", "later", "dispose", "restore", "delete", "region", *REVIEW_MARKS,
    }:
        raise ValueError("unsupported batch operation")
    # 产地的取值在这里就要认出来，别等到写库那一步才发现拼错了。
    region_value = _batch_region_value(body) if operation == "region" else None
    disposal_reason = _batch_disposal_reason(body)
    marks = ",".join("?" * len(ids))
    contract.cache_bust()
    purge_outcome = None
    state_receipt = {}
    # 批量是一次写、几秒就完的事，但事后「刚才那一批到底删了多少、有没有半路失败」
    # 只有这条记录答得出。不声明互斥——两批不同的资产各改各的，互斥只会把正常的
    # 连续操作挡住。
    run = contract.task_runs.start("batch", trigger="manual", total=len(ids),
                                   label=BATCH_LABELS.get(operation, operation))
    handle = TaskRunHandle(contract.task_runs, run.id if run else None)
    from .task_control import bind, Cancelled
    try:
        with bind(contract.task_runs, handle.run_id):
            try:
                if operation == "delete":
                    purge_outcome, valid_ids = _batch_purge(contract, ids)
                else:
                    with contract.write_transaction() as connection:
                        found = connection.execute(
                            f"SELECT id,disposal,disposal_reason,location FROM asset WHERE id IN ({marks})", ids,
                        ).fetchall()
                        valid_ids = [row["id"] for row in found]
                        if not valid_ids:
                            raise ValueError("assets not found")
                        _reject_ineligible_targets(operation, found)
                        now = time.time()
                        if operation in {"restore", "seen", "dispose"}:
                            state_receipt = _write_batch_state(connection, found, operation, now, disposal_reason)
                        elif operation in REVIEW_MARKS:
                            _write_review_mark(connection, operation, valid_ids, now)
                        elif operation == "region":
                            # 走 `write_owned_fields` 而不是直接 UPDATE：产地是真相字段，用户这一
                            # 笔要压得住后面每一轮刮削与推断，归属列是它唯一的凭据。
                            write_owned_fields(connection, valid_ids,
                                               {"region": region_value}, USER_MANUAL)
                        elif operation == "later":
                            connection.executemany(
                                "INSERT OR IGNORE INTO watch_queue(profile_id,asset_id,added_at,source) "
                                f"VALUES('{DEFAULT_PROFILE_ID}',?,strftime('%Y-%m-%dT%H:%M:%fZ','now'),'web-batch')",
                                [(asset_id,) for asset_id in valid_ids],
                            )
                        else:
                            connection.executemany(
                                "INSERT INTO asset_preference(profile_id,asset_id,liked,reason,source,updated_at) "
                                f"VALUES('{DEFAULT_PROFILE_ID}',?,1,'','web-batch',strftime('%Y-%m-%dT%H:%M:%fZ','now')) "
                                "ON CONFLICT(profile_id,asset_id) DO UPDATE SET liked=1,source='web-batch',"
                                "updated_at=excluded.updated_at",
                                [(asset_id,) for asset_id in valid_ids],
                            )
            except BaseException as error:
                handle.finish("cancelled" if isinstance(error, Cancelled) else "failed",
                              error="" if isinstance(error, Cancelled) else f"{type(error).__name__}: {error}")
                raise
            if purge_outcome is not None:
                result = _purge_receipt(contract, purge_outcome, operation=operation)
                handle.finish("succeeded", summary={"operation": operation,
                                                    "changed": len(valid_ids)})
                return result
            handle.finish("succeeded", summary={"operation": operation,
                                                "changed": len(valid_ids)})
            return {"ok": True, "operation": operation, "changed": len(valid_ids), **state_receipt}
    except Cancelled:
        handle.finish('cancelled', summary={'cancelled_by_user': True})
        raise


def _batch_purge(contract: WebContract, ids: list[int]):
    """批量永久删除：选中的行先读出来，事务里复核仍在回收站或已消失。"""
    marks = ",".join("?" * len(ids))
    with contract.read_connection() as connection:
        found = connection.execute(
            f"SELECT id,path,disposal,disposal_reason,location FROM asset WHERE id IN ({marks})", ids,
        ).fetchall()
    valid_ids = [row["id"] for row in found]
    if not valid_ids:
        raise ValueError("assets not found")
    _reject_ineligible_targets("delete", found)
    # 已消失的行本来就不在网盘上，删的只是账本行；读出来之后又被还原出回收站的，
    # 事务里复核时留下并进 `blocked`。
    outcome = _purge_outside_lock(contract, found,
                                  eligible=lambda row: row["disposal"] in DISPOSED)
    return outcome, valid_ids


def _add_large_short_copy_cluster(items: list[dict], clusters: list[list[dict]]):
    """把同番号的大体积短版本并到完整版所在组，返回这个组。"""
    claimed = {item["id"] for cluster in clusters for item in cluster}
    full = max(items, key=lambda item: item.get("duration") or 0)
    full_duration = float(full.get("duration") or 0)
    short_copies = [item for item in items
                    if item["id"] not in claimed and item["id"] != full["id"]
                    and (item.get("size") or 0) >= JUNK_VIDEO_MAX_BYTES
                    and 0 < float(item.get("duration") or 0) < full_duration * 0.2
                    and not PART_MARK.search(PureWindowsPath(
                        str(item.get("name") or "")).stem)]
    if not short_copies:
        return None
    cluster = next((candidate for candidate in clusters if any(
        item["id"] == full["id"] for item in candidate)), None)
    if cluster is None:
        cluster = [full]
        clusters.append(cluster)
    cluster.extend(short_copies)
    return cluster


def _duplicate_groups(grouped: dict[str, list[dict]]):
    """把已按番号归组的资产整理成重复项 API 结果。"""
    groups = []
    for code, items in grouped.items():
        if len(items) < 2:
            continue
        clusters = [cluster for cluster in duration_clusters(items) if len(cluster) >= 2]
        short_copy_cluster = _add_large_short_copy_cluster(items, clusters)
        for cluster in clusters:
            largest = max(cluster, key=lambda x: x.get("size") or 0)
            longest = max(cluster, key=lambda x: x.get("duration") or 0)
            hashes_present = [x["hash"] for x in cluster if x["hash"]]
            hashes = set(hashes_present)
            for item in cluster:
                item["is_largest"] = item["id"] == largest["id"]
                item["is_longest"] = item["id"] == longest["id"]
                item.pop("hash", None)
                item.pop("disposal", None)
            groups.append({
                "code": code,
                "files": sorted(cluster, key=lambda x: -(x.get("size") or 0)),
                "count": len(cluster),
                "evidence": "same_code_short_copy" if cluster is short_copy_cluster
                else "duration",
                # 必须每个文件都有 sha1 且完全相同才算确证字节一致。缺一个哈希
                # 就只是「时长相近」的推断，不能对外宣称已确证。
                "identical": len(hashes) == 1 and len(hashes_present) == len(cluster),
                # 来源是网盘（`gdrive`/`onedrive`），不是盘符：跨来源的两个文件搬不动。
                "drives": sorted({x["location"] for x in cluster}),
                "cross_drive": len({x["location"] for x in cluster}) > 1,
                "reclaimable": sum(x.get("size") or 0 for x in cluster)
                - (largest.get("size") or 0),
            })
    return groups


#: 重复项分组读的账本表。整库十万条视频逐条判番号、按时长聚簇要一两秒，页面每翻一页、每次
#: 轮询都重来一遍；声明后只在这两张表变了才重算，后台任务的提交先回上一份（ADR-0146）。
DUPLICATE_TABLES = ("asset", "review_decision")


def q_duplicates(contract: WebContract, args):
    """按番号 + 时长找真重复，也收同番号的大体积短版本。"""
    limit = min(max(int(args.get("limit", "60")), 1), 300)
    offset = max(int(args.get("offset", "0")), 0)
    groups, found = contract.cached_until_changed(
        "duplicate-groups", lambda: _duplicate_listing(contract), tables=DUPLICATE_TABLES)
    window = groups[offset:offset + limit]
    return {
        "total": len(groups),
        "files": sum(g["count"] for g in groups),
        "reclaimable": sum(g["reclaimable"] for g in groups),
        "groups": window,
        "has_more": offset + limit < len(groups),
        # 标过「都保留」、组员没变的组数；它们不进上面任何一项。
        "kept": found - len(groups),
    }


def _duplicate_listing(contract: WebContract) -> tuple[list[dict], int]:
    """没标过「都保留」的重复组（按可腾出空间从大到小）与找到的组数，各页共用这一份。"""
    with contract.read_connection() as connection:
        rows = connection.execute(
            "SELECT id,code,location,path,name,size,duration,hash,disposal "
            "FROM asset WHERE medium='video' AND code IS NOT NULL AND code<>'' "
            "AND disposal IS NULL"
        ).fetchall()
        kept = {row[0] for row in connection.execute(
            "SELECT item_key FROM review_decision WHERE category=? AND status='rejected'",
            (DUPLICATE_KEEP_CATEGORY,))}

    grouped: dict[str, list[dict]] = {}
    for row in rows:
        if not is_jav_code(row["code"]):
            continue
        item = dict(row)
        grouped.setdefault(normalise_code_key(row["code"]), []).append(item)

    found = _duplicate_groups(grouped)
    groups = [g for g in found if duplicate_group_key(f["id"] for f in g["files"]) not in kept]
    groups.sort(key=lambda g: -g["reclaimable"])
    return groups, len(found)
