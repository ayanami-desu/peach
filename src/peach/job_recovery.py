"""将可重放任务的参数保存在本机，服务启动时只领取未完成的记录。"""
from __future__ import annotations

import json
import logging
import os
from contextvars import ContextVar
from pathlib import Path

from filelock import FileLock
from .fsutil import atomic_write_text
from .task_state import state_root

LOGGER = logging.getLogger(__name__)
current_run = ContextVar('peach_resuming_run', default=None)
current_job_id = ContextVar('peach_resuming_job_id', default=None)


def _mutex(db: Path) -> FileLock:
    """任务状态文件的写操作串行化；同一进程里复用同一个锁对象，跨进程按文件锁互斥。"""
    root = state_root(db)
    root.mkdir(parents=True, exist_ok=True)
    return FileLock(str(root / 'tasks.lock'), timeout=10, is_singleton=True)


def _path(db: Path, key: str) -> Path:
    if not key or any(c not in "abcdefghijklmnopqrstuvwxyz0123456789-" for c in key):
        raise ValueError("任务恢复标识无效")
    return state_root(db) / "job-recovery" / (key + ".json")


def _worker_alive(db: Path, data: dict) -> bool:
    from .jobs import process_alive, process_matches
    pid = data.get('pid')
    if not isinstance(pid, int) or pid <= 0:
        return False
    run_id = data.get('run_id')
    if isinstance(run_id, int):
        from .task_runs import TaskRunStore
        run = TaskRunStore(db).get(run_id)
        if run is not None and (run.pid == pid or (run.pid == 0 and run.status == 'pending')):
            return process_matches(pid, run.heartbeat_at or run.started_at)
    return process_alive(pid)


def read(db: Path, key: str) -> dict:
    try:
        data = json.loads(_path(db, key).read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except FileNotFoundError:
        return {}
    except (OSError, ValueError):
        return {'status': 'blocked', 'error': '任务恢复记录无法读取，请重新发起任务。'}


def save(db: Path, key: str, job_id: str, request: dict, *, run_id=None) -> None:
    previous = read(db, key)
    atomic_write_text(_path(db, key), json.dumps({
        "job_id": job_id, "pid": os.getpid(), "status": "active",
        "request": request, 'run_id': run_id,
        'checkpoint': previous.get('checkpoint', {}) if previous.get('job_id') == job_id else {},
    }, ensure_ascii=False))


def checkpoint(db: Path, key: str, job_id: str, fields: dict) -> None:
    """结果落盘后保存进度；只更新同一任务的恢复记录。"""
    with _mutex(db):
        data = read(db, key)
        if data.get('job_id') == job_id and data.get('status') == 'active':
            data['checkpoint'] = {**data.get('checkpoint', {}), **fields}
            atomic_write_text(_path(db, key), json.dumps(data, ensure_ascii=False))


def finish(db: Path, key: str, job_id: str, status: str) -> None:
    with _mutex(db):
        data = read(db, key)
        if data.get("job_id") == job_id:
            data["status"] = status
            atomic_write_text(_path(db, key), json.dumps(data, ensure_ascii=False))


def cancel(db: Path, key: str) -> None:
    with _mutex(db):
        data = read(db, key)
        if data.get('run_id') is not None:
            from .task_runs import TaskRunStore
            TaskRunStore(db).finish(data['run_id'], 'cancelled', error='用户停止任务')
        _path(db, key).unlink(missing_ok=True)


def waiting(db: Path, key: str, job_id: str) -> None:
    """这一轮结束但没有进程在跑：记下等待，下次服务启动时接着做。"""
    with _mutex(db):
        data = read(db, key)
        if data.get('job_id') == job_id:
            data['pid'] = -1
            atomic_write_text(_path(db, key), json.dumps(data, ensure_ascii=False))


def resume(db: Path, handlers: dict) -> list[str]:
    """按恢复记录里的 pid 判定谁在跑；失败保留参数但不循环重试。"""
    resumed = []
    for key, handler in handlers.items():
        data = read(db, key)
        pid = data.get("pid")
        if key == 'library-processing':
            from .processing_control import user_paused, user_cancelled
            if user_cancelled(db, data.get('job_id')):
                if data.get('run_id') is not None:
                    from .task_runs import TaskRunStore
                    TaskRunStore(db).finish(data['run_id'], 'cancelled', error='用户停止任务')
                finish(db, key, data['job_id'], 'cancelled')
                continue
            if user_paused(db, data.get('job_id')):
                continue
        if (data.get("status") != "active" or not isinstance(data.get("request"), dict)
                or _worker_alive(db, data)):
            continue
        # 当前进程自己的新任务不属于启动恢复。
        if pid == os.getpid() and not isinstance(data.get('run_id'), int):
            continue
        try:
            context = current_run.set(data.get('run_id'))
            identity = current_job_id.set(data.get('job_id'))
            try:
                result = handler(data["request"])
                if result is None and read(db, key) == data:
                    finish(db, key, data['job_id'], 'complete')
                    if data.get('run_id') is not None:
                        from .task_runs import TaskRunStore
                        TaskRunStore(db).finish(data['run_id'], 'succeeded')
            finally:
                current_run.reset(context)
                current_job_id.reset(identity)
        except Exception as exc:
            if data.get('run_id') is not None:
                from .task_runs import TaskRunStore
                TaskRunStore(db).finish(data['run_id'], 'failed', error=str(exc))
            data.update(status="blocked", error=str(exc))
            atomic_write_text(_path(db, key), json.dumps(data, ensure_ascii=False))
            LOGGER.warning("任务 %s 未能恢复：%s", key, exc)
        else:
            resumed.append(key)
    return resumed
