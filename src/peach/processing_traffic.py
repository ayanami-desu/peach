"""馆藏任务的逐来源流量读数与预估。

媒体只在网盘上，所以一个来源一行：读一个文件就是走一次外网流量，没有本地可省。
影片资料与配套文件是 Peach 自己取回的小文件，记在 `metadata` 那几行上。
"""
from __future__ import annotations

import math
import re
import threading
import time
from contextlib import contextmanager
from contextvars import ContextVar

from .media_sources import SCANNABLE_LOCATIONS, SOURCES

CURRENT = ContextVar('peach_processing_traffic', default=None)
ROUTE = ContextVar('peach_processing_traffic_route', default='metadata')
MIB = 1024 ** 2
STATISTICS = re.compile(r'Statistics:\s*(\d+) bytes read')

#: 未观测到的读数统一用这一句，界面按它标「约」。
UNOBSERVED_READ = '网盘读取量与预读未观测'


def _key(path):
    """账本路径只做比较用的键：按 `/` 归一，大小写不敏感。"""
    return str(path or '').strip().rstrip('/').casefold()


def record_download(size):
    from .task_resources import record_download as task_download
    task_download(size)
    meter = CURRENT.get()
    if meter is not None:
        meter.add(ROUTE.get(), size)


def unobserved(reason):
    from .task_resources import unobserved_network
    unobserved_network(reason)
    meter = CURRENT.get()
    if meter is not None:
        meter.mark(ROUTE.get(), reason)


def record_media_read(path, size):
    meter = CURRENT.get()
    if meter is not None:
        meter.media_read(str(path), size)


def media_statistics(path, stderr, *, kind=None, successful=False):
    """FFmpeg 的输入读取量，用来校准一个文件实际被读了多少。"""
    meter = CURRENT.get()
    if meter is None:
        return
    path = str(path)
    text = stderr.decode('utf-8', 'replace') if isinstance(stderr, bytes) else str(stderr or '')
    sizes = STATISTICS.findall(text)
    if sizes:
        amount = sum(map(int, sizes))
        record_media_read(path, amount)
        if kind and successful:
            meter.observe_media(path, kind, amount)
    else:
        meter.media_read(path, 0, missing=True)


@contextmanager
def download_route(metered):
    token = ROUTE.set('metadata-proxy' if metered else 'metadata-direct')
    try:
        yield
    finally:
        ROUTE.reset(token)


class ProcessingTraffic:
    def __init__(self, config, db_path, stage, asset_ids=None, *, resume_state=None, inventory_rows=(),
                 allow_metered=False):
        self.config, self.db_path, self.stage, self.asset_ids = config, db_path, stage, asset_ids
        self.lock = threading.RLock()
        self.publish = lambda: None
        self.published_at = 0
        self.owner = threading.get_ident()
        self.locations = SCANNABLE_LOCATIONS
        self.rows = {}
        for location in self.locations:
            self.rows[location] = dict(
                label=SOURCES[location].label, root=f'{location}:/', location=location,
                metered=True, connection='direct', network=True,
                used_bytes=0, remaining_min=0, remaining_max=0, unobserved=[])
        for key, label, metered in [('metadata', '影片资料', True),
                                     ('metadata-proxy', '影片资料', True),
                                     ('metadata-direct', '影片资料', False)]:
            self.rows[key] = dict(label=label, root='', location='metadata', metered=metered,
                connection='proxy' if metered else 'direct',
                network=True, used_bytes=0, remaining_min=0, remaining_max=0, unobserved=[])
        previous = (resume_state or {}).get('traffic') or {}
        for old in previous.get('sources', []):
            if old.get('key') in self.rows:
                self.rows[old['key']].update(used_bytes=old.get('used_bytes', 0),
                                           unobserved=list(old.get('unobserved', [])))
            elif old.get('key') and old.get('used_bytes'):
                self.rows[old['key']] = {key: old[key] for key in
                    ('label', 'root', 'location', 'metered', 'network', 'used_bytes', 'unobserved')}
                self.rows[old['key']].update(remaining_min=0, remaining_max=0,
                                             connection=old.get('connection', 'direct'))
        self.unknown_files = stage == 'all' and asset_ids is None
        from .processing_traffic_plan import TrafficPlan
        self.plan = TrafficPlan(config, stage, self._media_key, allow_metered=allow_metered)
        self.plan.completed.update(previous.get('completed_work', []))
        self.active_sample = None
        self.refresh_plan()
        self.seed_inventory(inventory_rows)

    def seed_inventory(self, rows):
        if rows:
            known = {(row['location'], _key(row['path'])) for row in self.plan.assets}
            self.plan.extend(row for row in rows if (row['location'], _key(row['path'])) not in known)

    @contextmanager
    def bind(self):
        token = CURRENT.set(self)
        try:
            yield self
        finally:
            CURRENT.reset(token)

    def _media_key(self, path, location=None):
        """账本路径属于哪个来源：`gdrive:/夹/文件.mp4` → `gdrive`。"""
        declared = str(location or str(path or '').partition(':')[0]).strip()
        return declared if declared in self.locations else None

    def refresh_plan(self, rows=None):
        """账本统计不访问网盘；网盘那一行永远标着「读取量未观测」。"""
        if rows is None:
            from .processing_traffic_plan import ledger_rows
            rows = ledger_rows(self.db_path, self.asset_ids)
        with self.lock:
            self.plan.refresh(rows)
            for row in self.rows.values():
                if row['root'] and row['network']:
                    self._reason(row, UNOBSERVED_READ)

    def start_metadata(self, code):
        from .library_processing import _provider_code
        token = 'metadata:' + str(_provider_code(code))
        with self.lock:
            profile = self.plan.profiles.get(token)
            self.active_sample = dict(profile=profile, blocked=set(),
                before={key: row['used_bytes'] for key, row in self.rows.items()}) if profile else None

    def finish_work(self, stage, code=None, *, successful=True):
        with self.lock:
            if stage == 'metadata' and self.active_sample:
                sample, self.active_sample = self.active_sample, None
                if successful:
                    for key, before in sample['before'].items():
                        if not self.rows[key]['root'] and key not in sample['blocked']:
                            self.plan.history.observe(sample['profile'] + ':' + key, self.rows[key]['used_bytes'] - before)
                    self.plan.calibrate()
                    self.plan.history.save()
            self.plan.finish(stage, code)

    def observe_media(self, path, kind, amount):
        key = self._media_key(path)
        with self.lock:
            if key:
                self.plan.history.observe(key + ':' + kind, amount)
                self.plan.history.save()

    def prepare_metadata(self, prepared):
        with self.lock:
            self.plan.prepare_metadata(prepared)

    @staticmethod
    def _reason(row, reason):
        if reason not in row['unobserved']:
            row['unobserved'].append(reason)

    def mark(self, key, reason):
        with self.lock:
            self._reason(self.rows[key], reason)
            if self.active_sample is not None:
                self.active_sample['blocked'].add(key)

    def add(self, key, size):
        if not isinstance(size, (int, float)) or not math.isfinite(size) or size <= 0:
            return
        with self.lock:
            row = self.rows[key]
            if not row['network']:
                return
            row['used_bytes'] += int(size)
            if threading.get_ident() != self.owner or time.monotonic() - self.published_at < 0.5:
                return
            self.published_at = time.monotonic()
        self.publish()

    def media_read(self, path, size, *, missing=False):
        key = self._media_key(path)
        if key is not None:
            if self.rows[key]['network']:
                self.mark(key, UNOBSERVED_READ)
            if missing:
                self.mark(key, '媒体读取量未取得')
            self.add(key, size)

    def snapshot(self, *, finished=False):
        with self.lock:
            self.plan.history.save(force=finished)
            sources = []
            remaining = self.plan.remaining(self.rows)
            for key, row in self.rows.items():
                amount = 0 if finished else remaining[key]
                if not row['root'] and not row['used_bytes'] and not amount and not row['unobserved']:
                    continue
                source = {**row, 'unobserved': list(row['unobserved'])}
                sources.append(dict(key=key, **source, workload=self.plan.workload(key),
                    estimated_bytes=row['used_bytes'] + amount,
                    estimated_min_bytes=row['used_bytes'],
                    estimated_max_bytes=row['used_bytes'] + amount))
            result = dict(sources=sources, workload=self.plan.workload(),
                          unknown_files=self.unknown_files and not finished,
                          partial=any(row['unobserved'] for row in sources),
                          completed_work=sorted(self.plan.completed))
            for field in ('used_bytes', 'estimated_bytes', 'estimated_min_bytes', 'estimated_max_bytes'):
                result[field] = sum(row[field] for row in sources)
                result['metered_' + field] = sum(row[field] for row in sources if row['metered'])
                result['unknown_route_' + field] = sum(row[field] for row in sources
                    if row.get('connection', 'unknown') in ('system', 'unknown'))
            return result
