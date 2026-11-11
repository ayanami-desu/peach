"""关注抓取原始快照的保留规则与清退。

快照在 `sources/follow/<provider>/<来源摘要>/`，一份是 `<时间>-<摘要>.raw` 加同名 `.json`。
每个来源目录留最近 `KEEP` 份，加上被 `follow_item.evidence_path` 引用的；其余两件一起删。
新写入一份后由 `FollowStore.record` 在它自己那个目录里删一份，只抵消这次增长：它在写事务里，
在 Windows 上删一个文件就要几毫秒到几十毫秒。升级前留下的存量不自动删，也不摊到抓取里做：
抓取只按 `KEEP` 收自己那份，其余留着，等需要腾空间时按 `surplus` 与 `prune` 显式清。

除 `follow_item.evidence_path` 外没有别处读这些快照：诊断与重新解析只用账本里的条目和来源行。
引用按文件名比较：名字带时间和摘要、全库唯一，`evidence_path` 无论是相对 `sources/` 的路径、
迁移前留下的绝对路径（`data_storage.PATH_COLUMNS`），还是哪种分隔符，都对得上同一个文件。
"""
from __future__ import annotations

import logging
import os
from pathlib import Path

LOGGER = logging.getLogger(__name__)

#: 每个来源目录保留的最近快照份数，被条目引用的另算。
KEEP = 3


def reference_name(value) -> str:
    """`evidence_path` 指向的文件名，分隔符不论正反。"""
    return str(value).replace('\\', '/').rsplit('/', 1)[-1]


def referenced_names(connection, source_id: int | None = None) -> frozenset[str]:
    """被条目引用的快照文件名；给 `source_id` 时只看这一个来源（走 `source_id` 索引）。"""
    sql = "SELECT evidence_path FROM follow_item WHERE evidence_path IS NOT NULL AND evidence_path<>''"
    params: tuple = ()
    if source_id is not None:
        sql += " AND source_id=?"
        params = (int(source_id),)
    return frozenset(reference_name(row[0]) for row in connection.execute(sql, params))


def latest_snapshot(directory: Path) -> Path | None:
    """目录里最新一份 `.raw`。文件名以 UTC 时间开头，字典序就是时间序。"""
    try:
        names = [entry.name for entry in os.scandir(directory)
                 if entry.name.endswith('.raw') and entry.is_file(follow_symlinks=False)]
    except OSError:
        return None
    return Path(directory) / max(names) if names else None


def surplus(directory: Path, referenced, keep: int = KEEP, limit: int | None = None) -> list[tuple[Path, int]]:
    """目录里该删的文件与字节数：最近 `keep` 份之外、又没被引用的 `.raw`，连同同名 `.json`。

    `limit` 限定最多几份，从新往旧数：新写入后只抵消这一份增长，升级前留下的存量原样等用户确认。"""
    try:
        entries = {entry.name: entry for entry in os.scandir(directory) if entry.is_file(follow_symlinks=False)}
    except OSError:
        return []
    snapshots = sorted((name for name in entries if name.endswith('.raw')), reverse=True)
    doomed = []
    chosen = 0
    for name in snapshots[keep:]:
        if name in referenced:
            continue
        if limit is not None and chosen >= limit:
            break
        chosen += 1
        for member in (name, name[:-len('.raw')] + '.json'):
            entry = entries.get(member)
            if entry is None:
                continue
            try:
                size = entry.stat(follow_symlinks=False).st_size
            except OSError:
                size = 0
            doomed.append((Path(entry.path), size))
    return doomed


def remove(doomed) -> tuple[int, int]:
    """删掉 `surplus` 给出的文件，返回删成的个数与字节数。别人先删了的不算失败。"""
    files = freed = 0
    for path, size in doomed:
        try:
            path.unlink()
        except FileNotFoundError:
            continue
        except OSError as error:
            LOGGER.warning('关注快照删不掉：%s（%s）', path, error)
            continue
        files += 1
        freed += size
    return files, freed


def prune(directory: Path, referenced, keep: int = KEEP, limit: int | None = None) -> tuple[int, int]:
    return remove(surplus(directory, referenced, keep, limit))


def directories(root: Path):
    """`root` 下每个来源目录（`<provider>/<来源摘要>`）。根不在或读不了就是空的。"""
    try:
        providers = [entry.path for entry in os.scandir(root) if entry.is_dir(follow_symlinks=False)]
    except OSError:
        return
    for provider in sorted(providers):
        try:
            sources = [entry.path for entry in os.scandir(provider) if entry.is_dir(follow_symlinks=False)]
        except OSError:
            continue
        yield from (Path(path) for path in sorted(sources))
