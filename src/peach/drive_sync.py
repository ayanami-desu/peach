"""网盘同步的节拍：增量按游标走，超过一天就整棵重新核对一次。

增量便宜但有代价：游标只认「哪些文件变了」，它不会告诉你某个目录这次是不是整个被
删掉了；而账本里「已消失」的判定要么靠增量里的删除事件，要么靠一次全量里没再见到。
两件事分开做：平时每 `INTERVAL_SECONDS` 追一次增量，最长 `FULL_SYNC_SECONDS` 补一次
全量核对。页面的「立即刷新」按同一入口触发，不等定时。

一次只同步一个账号：网盘的限流是按账号算的，几个账号并发只是把限流撞得更早。
"""
from __future__ import annotations

import asyncio
import logging
import threading
import time
from collections.abc import Callable
from dataclasses import dataclass

from .drive_provider import DriveError
from .scan import ScanResult, ScanService, ScanTargetError

#: 两轮增量之间隔多久。
INTERVAL_SECONDS = 15 * 60.0
#: 超过这么久没做过全量核对，就补一次。
FULL_SYNC_SECONDS = 24 * 60 * 60.0
#: 循环里每轮睡多久；比 `INTERVAL_SECONDS` 小得多，好让「立即刷新」尽快被看见。
TICK_SECONDS = 60.0

_STAMP = "%Y-%m-%d %H:%M:%S"

LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class SyncReport:
    """一轮同步的结论；`error` 非空时这一轮没改动账本。"""

    key: str
    full: bool
    result: ScanResult | None = None
    error: str = ""


def _moment(stamp: str | None) -> float | None:
    try:
        return time.mktime(time.strptime(stamp or "", _STAMP))
    except ValueError:
        return None


class DriveSync:
    """按账号排同步：谁到点了就同步谁。"""

    def __init__(self, service: ScanService, *, interval: float = INTERVAL_SECONDS,
                 full_every: float = FULL_SYNC_SECONDS, clock=time.time,
                 after: Callable[[str, ScanResult], None] | None = None):
        self.service = service
        self.interval = interval
        self.full_every = full_every
        self._clock = clock
        #: 一轮同步之后的跟进（探时长、旧行接回）；它出问题不改写扫描结论。
        self._after = after
        #: 上一轮同步的时刻，按账号记：进程刚起来时不该把所有账号一次扫完。
        self._synced: dict[str, float] = {}
        #: 手动刷新排进来的账号，`tick` 见到就先做。
        self._requested: set[str] = set()
        #: 页面点「同步新增文件」会在任务线程里立刻同步一次；定时循环同时在跑，按账号串行。
        self._lock = threading.Lock()

    def accounts(self) -> tuple[str, ...]:
        return self.service.accounts()

    def state(self, key: str) -> dict:
        return self.service.sync_state(key)

    def request(self, key: str) -> None:
        """页面按「立即刷新」：下一轮立刻做这个账号。"""
        self._requested.add(key)

    def refresh(self, key: str) -> SyncReport:
        """同步一个账号：有游标走增量，没有或者太久没全量就整棵核对。"""
        with self._lock:
            self._requested.discard(key)
            stamp = self.state(key).get("full_synced_at")
            seen = _moment(stamp)
            full = seen is None or self._clock() - seen >= self.full_every
            self._synced[key] = self._clock()
            try:
                result = self.service.full_sync(key) if full else self.service.sync_changes(key)
            except (ScanTargetError, DriveError) as error:
                return SyncReport(key, full, error=str(error))
            if self._after is not None:
                try:
                    self._after(key, result)
                except Exception:  # 跟进失败不该让这一轮扫描白做，下一轮还会再试
                    LOGGER.exception('同步 %s 之后的跟进失败了', key)
            return SyncReport(key, full, result=result)

    def tick(self) -> tuple[SyncReport, ...]:
        """到点的账号各同步一次。同一账号上一轮失败也会重试，只是要等下一轮。"""
        now = self._clock()
        reports = []
        for key in self.accounts():
            forced = key in self._requested
            last = self._synced.get(key)
            if not forced and last is not None and now - last < self.interval:
                continue
            if not forced:
                self._synced[key] = now
            reports.append(self.refresh(key))
        return tuple(reports)

    async def run(self, stop: asyncio.Event) -> None:
        """后台循环；`stop` 被设置后退出。同步本身是阻塞的，放线程里跑。"""
        while not stop.is_set():
            try:
                reports = await asyncio.to_thread(self.tick)
            except Exception:  # 单轮出错不该让同步整体停摆
                reports = ()
                LOGGER.exception("定时同步这一轮失败了，下一轮继续")
            for report in reports:
                if report.error:
                    LOGGER.warning("同步 %s 失败：%s", report.key, report.error)
            try:
                await asyncio.wait_for(stop.wait(), timeout=TICK_SECONDS)
            except asyncio.TimeoutError:
                continue
