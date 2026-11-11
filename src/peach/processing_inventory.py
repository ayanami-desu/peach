"""同步前的只读预检：工作量全部来自账本，不再走查本机目录。"""
from __future__ import annotations

import threading
import time

from .processing_traffic import ProcessingTraffic
from .library_processing_scope import scoped_assets

_LATEST = {}
_LOCK = threading.Lock()


def _identity(config, db_path, stage, asset_ids, incremental=False):
    return (str(db_path), repr(config), stage, tuple(asset_ids) if asset_ids is not None else None, incremental)


def recent_rows(config, db_path, stage, asset_ids):
    """上一次预检发现的新增文件；直连网盘之后没有本机走查，恒为空。"""
    with _LOCK:
        value = _LATEST.get(_identity(config, db_path, stage, asset_ids))
        return list(value[1]) if value and time.monotonic() - value[0] < 300 else []


class InventoryPreview:
    def __init__(self, config, db_path, stage, asset_ids, incremental=False, library_id=None):
        self.identity = _identity(config, db_path, stage, asset_ids, incremental)
        if incremental:
            from .library_new_assets import pending
            asset_ids = pending(db_path)
        self.meter = ProcessingTraffic(config, db_path, stage, scoped_assets(config, db_path, library_id, asset_ids))
        self.rows = list(self.meter.plan.assets)
        self.complete = True
        self.meter.unknown_files = False
        self.at = time.monotonic()

    def advance(self):
        self.at = time.monotonic()
        result = self.meter.snapshot()
        result['inventory'] = dict(complete=self.complete, errors=0)
        return result


def preview(config, db_path, stage, asset_ids, token=None, *, incremental=False, library_id=None):
    """一次查询给出完整工作量。

    `token` 是旧客户端带来的批次号：已经没有分批，接受但不用，也不再回发。
    """
    with _LOCK:
        expired = [key for key, value in _LATEST.items() if time.monotonic() - value[0] > 300]
        for key in expired:
            del _LATEST[key]
    session = InventoryPreview(config, db_path, stage, asset_ids, incremental, library_id)
    result = session.advance()
    with _LOCK:
        _LATEST[session.identity] = session.at, ()
    return result
