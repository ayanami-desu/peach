"""任务资源只使用临时登记、伪进程计数器和注入式 GPU 读数。"""
from __future__ import annotations

import json
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import psutil

from peach import task_resources
from peach.task_runs import TaskRunStore
from support.ledger import fresh_ledger


class Clock:
    def __init__(self):
        self.now = 100.0

    def __call__(self):
        return self.now

    def advance(self, seconds=1):
        self.now += seconds


class Process:
    def __init__(self, pid, *, created=10.0):
        self.pid, self.created = pid, created
        self.thread_cpu = {}
        self.cpu = 0.0
        self.members = []
        self.total_reads = 0

    def create_time(self):
        return self.created

    def threads(self):
        return [SimpleNamespace(id=identity, user_time=value, system_time=0.0)
                for identity, value in self.thread_cpu.items()]

    def cpu_times(self):
        self.total_reads += 1
        return SimpleNamespace(user=self.cpu, system=0.0)

    def children(self, *, recursive=False):
        return self.members

    def cpu_affinity(self):
        return list(range(4))


class TaskResourceTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.db = fresh_ledger(self.root)
        self.store = TaskRunStore(self.db)
        self.clock = Clock()
        self.root_process = Process(os.getpid())
        self.root_process.thread_cpu = {11: 1.0, 22: 4.0, 999: 1000.0}
        self.root_process.cpu = 3000.0
        self.processes = {self.root_process.pid: self.root_process}
        process_patch = patch('peach.task_resources.psutil.Process', side_effect=self.process)
        self.process_reads = process_patch.start()
        self.addCleanup(process_patch.stop)
        capacity_patch = patch('peach.task_resources.psutil.cpu_count', return_value=4)
        self.capacity = capacity_patch.start()
        self.addCleanup(capacity_patch.stop)
        threads_patch = patch('peach.task_resources.thread_times',
                              side_effect=lambda process, wanted: {t.id: t.user_time + t.system_time
                                  for t in process.threads() if t.id in wanted})
        threads_patch.start()
        self.addCleanup(threads_patch.stop)
        quota_patch = patch('peach.resource_platform.cgroup_capacity', return_value=None)
        quota_patch.start()
        self.addCleanup(quota_patch.stop)

    def process(self, pid=None):
        identity = self.root_process.pid if pid is None else int(pid)
        if identity not in self.processes:
            raise psutil.NoSuchProcess(identity)
        return self.processes[identity]

    def child(self, identity, *, cpu=0.0, created=20.0):
        process = Process(identity, created=created)
        process.cpu = cpu
        self.processes[identity] = process
        return process

    def new_run(self, name='resource-test'):
        return self.store.start(name, trigger='manual')

    def usage(self, run, *, threads=(), processes=()):
        usage = task_resources.Usage(self.db, run.id)
        self.addCleanup(usage.close)
        for identity in threads:
            with patch('peach.task_resources.threading.get_native_id', return_value=identity):
                usage.enter_thread()
        for identity in processes:
            usage.enter_process(SimpleNamespace(pid=identity))
        return usage

    def monitor(self):
        return task_resources.Monitor(self.store, clock=self.clock)

    def test_cpu_uses_registered_native_threads_and_owned_children_as_a_share_of_host_capacity(self):
        first, second = self.new_run('first'), self.new_run('second')
        child, grandchild = self.child(5001, cpu=2), self.child(5002, cpu=4)
        child.members = [grandchild]
        self.usage(first, threads=(11,), processes=(child.pid,))
        self.usage(second, threads=(22,))
        monitor = self.monitor()
        self.assertEqual(monitor.for_run(first)['cpu']['state'], 'sampling')
        self.clock.advance(2)
        self.root_process.thread_cpu[11] += 2
        self.root_process.thread_cpu[22] += .4
        self.root_process.thread_cpu[999] += 100
        self.root_process.cpu += 1000
        child.cpu += 1
        grandchild.cpu += 1
        self.assertEqual(monitor.for_run(first)['cpu']['percent'], 50.0)
        self.assertEqual(monitor.for_run(second)['cpu']['percent'], 5.0)
        self.assertEqual(self.root_process.total_reads, 0)
        self.assertTrue(monitor.for_run(first)['cpu']['high'])
        self.assertFalse(monitor.for_run(second)['cpu']['high'])

    def test_nested_registration_keeps_a_native_thread_until_its_last_scope_exits(self):
        usage = self.usage(self.new_run())
        with patch('peach.task_resources.threading.get_native_id', return_value=11):
            usage.enter_thread()
            usage.enter_thread()
            usage.leave_thread()
            self.assertEqual(usage.snapshot()['threads'], [11])
            usage.leave_thread()
            self.assertEqual(usage.snapshot()['threads'], [])

    def test_real_idle_zero_is_distinct_from_missing_registration(self):
        idle, missing = self.new_run('idle'), self.new_run('missing')
        self.usage(idle, threads=(11,))
        monitor = self.monitor()
        monitor.for_run(idle)
        self.clock.advance()
        ready = monitor.for_run(idle)
        self.assertEqual((ready['cpu']['state'], ready['cpu']['percent']), ('ready', 0.0))
        unknown = monitor.for_run(missing)
        self.assertEqual(unknown['cpu']['state'], 'unavailable')
        self.assertIsNone(unknown['cpu']['percent'])

    def test_parent_aggregation_deduplicates_cpu_parts_shared_with_a_child_run(self):
        parent = self.new_run('parent')
        child_id = self.store.enqueue_followups(parent.id, [('child:1', 'child', '子任务')])['queued'][0]
        child_run = self.store.claim_followup(['child'])
        self.assertEqual(child_run.id, child_id)
        process = self.child(5001)
        self.usage(parent, threads=(11,), processes=(process.pid,))
        self.usage(child_run, threads=(22,), processes=(process.pid,))
        monitor = self.monitor()
        monitor.for_run(parent)
        self.clock.advance(2)
        self.root_process.thread_cpu[11] += 2
        self.root_process.thread_cpu[22] += 1
        process.cpu += 1
        self.assertEqual(monitor.for_run(parent)['cpu']['percent'], 50.0)
        self.assertEqual(monitor.for_run(child_run)['cpu']['percent'], 25.0)

    def test_finished_parent_still_shows_live_descendants_but_pure_history_has_no_resources(self):
        parent = self.new_run('parent')
        child_id = self.store.enqueue_followups(parent.id, [('child:1', 'child', '子任务')])['queued'][0]
        child_run = self.store.claim_followup(['child'])
        self.usage(child_run, threads=(11,))
        self.store.finish(parent.id, 'succeeded')
        parent = self.store.get(parent.id)
        monitor = self.monitor()
        self.assertIsNotNone(monitor.for_run(parent))
        self.store.finish(child_id, 'succeeded')
        self.clock.advance()
        self.assertIsNone(monitor.for_run(parent))
        self.assertIsNone(monitor.for_run(self.store.get(child_id)))

    def test_pending_work_has_real_zero_and_running_work_does_not_collect_gpu(self):
        parent = self.new_run('parent')
        child_id = self.store.enqueue_followups(parent.id, [('child:1', 'child', '子任务')])['queued'][0]
        running = self.new_run('running')
        self.usage(running, threads=(11,))
        self.store.finish(parent.id, 'succeeded')
        monitor = self.monitor()
        result = monitor.for_run(self.store.get(child_id))
        self.assertEqual((result['cpu']['state'], result['cpu']['percent']), ('ready', 0.0))
        self.assertEqual((result['gpu']['state'], result['gpu']['percent']), ('ready', 0.0))
        sampled = monitor.for_run(running)['gpu']
        self.assertEqual((sampled['state'], sampled['percent']), ('unavailable', None))
        self.assertIn('不采集', sampled['reason'])
        self.store.finish(child_id, 'cancelled')
        self.assertIsNone(monitor.for_run(self.store.get(parent.id)))
    def test_other_host_and_reused_service_pid_are_not_attributed_to_local_tasks(self):
        foreign, reused = self.new_run('foreign'), self.new_run('reused')
        with self.store.database.write_transaction() as connection:
            connection.execute('UPDATE task_run SET host=?,pid=? WHERE id=?', ('other-host', 9001, foreign.id))
        foreign = self.store.get(foreign.id)
        self.usage(reused, threads=(11,))
        self.root_process.created += 1
        monitor = self.monitor()
        for run in (foreign, reused):
            result = monitor.for_run(run)
            self.assertEqual(result['cpu']['state'], 'unavailable')
            self.assertIsNone(result['cpu']['percent'])
            self.assertEqual(result['gpu']['state'], 'unavailable')
        self.assertNotIn(9001, [call.args[0] for call in self.process_reads.call_args_list if call.args])

    def test_reused_child_pid_does_not_transfer_cpu_ownership(self):
        run = self.new_run()
        child = self.child(5001, cpu=1)
        self.usage(run, processes=(child.pid,))
        child.created += 1
        monitor = self.monitor()
        monitor.for_run(run)
        self.clock.advance()
        child.cpu += 100
        result = monitor.for_run(run)
        self.assertEqual(result['cpu']['percent'], 0.0)
        self.assertEqual(child.total_reads, 0)

    def test_unknown_host_capacity_does_not_invent_a_cpu_percentage(self):
        run = self.new_run()
        self.usage(run, threads=(11,))
        monitor = self.monitor()
        monitor.for_run(run)
        self.clock.advance()
        self.capacity.return_value = None
        result = monitor.for_run(run)['cpu']
        self.assertEqual(result['state'], 'unavailable')
        self.assertIsNone(result['percent'])

    def test_invalid_resource_record_does_not_break_other_task_samples(self):
        broken, good = self.new_run('broken'), self.new_run('good')
        self.usage(good, threads=(11,))
        path = task_resources._path(self.db, broken.id)
        path.parent.mkdir(parents=True, exist_ok=True)
        monitor = self.monitor()
        for raw in ('not json', json.dumps([]), json.dumps({'pid': broken.pid, 'created': 'invalid'})):
            with self.subTest(record=raw):
                path.write_text(raw, encoding='utf-8')
                self.clock.advance()
                self.assertEqual(monitor.for_run(broken)['cpu']['state'], 'unavailable')
                self.assertIn(monitor.for_run(good)['cpu']['state'], ('sampling', 'ready'))
