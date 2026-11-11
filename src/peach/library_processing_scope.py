"""馆藏处理按媒体库限制资产集合。

库的范围只体现在账本的筛选条件上：`asset.location` 与 `asset.drive_root` 一起决定归属，
不再投影出另一份「目录配置」。
"""
import json
import sqlite3
from contextlib import closing

from .media_libraries import libraries, predicate


def scoped_config(config, library_id):
    if library_id is None:
        return config
    if not isinstance(library_id, str) or not any(row['id'] == library_id for row in libraries(config)):
        raise ValueError('所选媒体库已不存在，请重新选择')
    return config


def scoped_assets(config, db_path, library_id, asset_ids=None):
    if library_id is None:
        return asset_ids
    clause, values = predicate(config, library_id)
    query = "SELECT a.id FROM asset a WHERE a.medium='video' AND a.disposal IS NULL AND " + clause
    if asset_ids is not None:
        query += ' AND a.id IN (SELECT value FROM json_each(?))'
        values.append(json.dumps(asset_ids))
    with closing(sqlite3.connect(db_path, timeout=30)) as connection:
        return [row[0] for row in connection.execute(query + ' ORDER BY a.id', values)]
