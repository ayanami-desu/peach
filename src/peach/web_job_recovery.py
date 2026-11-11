"""Web 组合入口为可恢复任务装配领域处理器。"""
import sys
import threading
import time
import traceback
from datetime import timezone
from pathlib import Path

from .job_recovery import resume
from .web_library_processing import w_library_processing
from .web_scraping import w_scraping_cover, w_scraping_amane_rebuild
from .web_timeline_thumbnails import w_thumbnail_jobs
from .web_links import w_links_check, w_links_prune
from .web_organize import w_organize_apply, w_organize_rollback
from apscheduler.schedulers.background import BackgroundScheduler

#: 一次接回超过这么久就记下卡在哪个任务、各线程停在哪一行；每次卡住只记一次。
STUCK_SECONDS = 30


def restore(contract, track=lambda key, handler: handler):
    handlers = {
        "library-processing": lambda body: w_library_processing(contract, body, resume=True),
        "timeline-thumbnails": lambda body: w_thumbnail_jobs(contract, body),
        "scraping-cover": lambda body: w_scraping_cover(contract, body),
        "link-check": lambda body: w_links_check(contract, {**body, 'restart': True}),
        "link-prune": lambda body: w_links_prune(contract, body),
        "amane-bridge": lambda body: w_scraping_amane_rebuild(contract, body),
        "organize": lambda body: (w_organize_rollback(contract, body) if body.get('action') == 'rollback'
                                    else w_organize_apply(contract, body)),
    }
    return resume(contract.db_path, {key: track(key, handler) for key, handler in handlers.items()})


def thread_stacks() -> dict[str, list[str]]:
    """各线程当前的调用栈，只留文件名、行号与函数名：完整路径会被本机日志脱敏成 `<path>`。"""
    names = {thread.ident: thread.name for thread in threading.enumerate()}
    return {f'{names.get(ident, "thread")}-{ident}': [
                f'{Path(frame.filename).name}:{frame.lineno} {frame.name}'
                for frame in traceback.extract_stack(stack)[-40:]]
            for ident, stack in sys._current_frames().items()}


class RecoveryService:
    """服务运行期间也会接回中断的任务：每秒看一遍谁该起跑。"""

    def __init__(self, contract, *, available):
        self.contract = contract
        self.available = available
        self.scheduler = BackgroundScheduler(timezone=timezone.utc)
        self._running_since = None
        self._step = None
        self._reported = False

    def start(self):
        if self.available and not self.scheduler.running:
            self.scheduler.add_job(self.tick, 'interval', seconds=1,
                                   max_instances=1, coalesce=True)
            self.scheduler.add_job(self.watch, 'interval', seconds=10,
                                   max_instances=1, coalesce=True)
            self.scheduler.start()

    def stop(self):
        if self.scheduler.running:
            self.scheduler.shutdown(wait=True)

    def _track(self, key, handler):
        def tracked(body):
            self._step = key
            return handler(body)
        return tracked

    def tick(self):
        self._running_since, self._step, self._reported = time.monotonic(), 'job-recovery', False
        try:
            restore(self.contract, track=self._track)
        finally:
            self._running_since = self._step = None

    def watch(self, now=None):
        """接回卡住时只记一次：卡在哪一步、多久了、各线程停在哪一行（quan he，11-08）。

        卡住期间每秒的 tick 都被调度器跳过，日志里只剩「上一次还没执行完」，看不出卡在哪。"""
        started = self._running_since
        if started is None or self._reported:
            return
        elapsed = (time.monotonic() if now is None else now) - started
        if elapsed < STUCK_SECONDS:
            return
        self._reported = True
        from . import error_reporting
        error_reporting.local_event('job-recovery-stuck', step=self._step or 'unknown',
                                    seconds=round(elapsed), stacks=thread_stacks())
