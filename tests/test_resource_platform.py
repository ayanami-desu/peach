"""原生线程读取和 Linux 控制组容量的行为验证。"""
from __future__ import annotations

import ctypes
import errno
import os
from pathlib import Path
import tempfile
import threading
import time
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import psutil

from peach.resource_platform import ThreadInfo, cgroup_capacity, cpu_capacity, thread_times


class PlatformCpuTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.proc = self.root / 'proc'
        (self.proc / '10').mkdir(parents=True)
        self.mount = self.root / 'groups'
        (self.mount / 'service' / 'worker').mkdir(parents=True)

    def groups(self, *, version=2, mount_root='/', group='/service/worker'):
        unified = version == 2
        (self.proc / '10/cgroup').write_text(f"{'0::' if unified else '2:cpu,cpuacct:'}{group}\n")
        path = str(self.mount).replace(' ', r'\040')
        filesystem = 'cgroup2 cgroup rw' if unified else 'cgroup cgroup rw,cpu,cpuacct'
        (self.proc / '10/mountinfo').write_text(f'20 1 0:30 {mount_root} {path} rw - {filesystem}\n')

    def test_v2_uses_visible_parent_quota_and_container_namespace_root(self):
        self.groups()
        (self.mount / 'cpu.max').write_text('max 100000')
        (self.mount / 'service/cpu.max').write_text('150000 100000')
        (self.mount / 'service/worker/cpu.max').write_text('200000 100000')
        self.assertEqual(cgroup_capacity(self.proc, 10), 1.5)
        self.groups(group='/')
        (self.mount / 'cpu.max').write_text('50000 100000')
        self.assertEqual(cgroup_capacity(self.proc, 10), .5)

    def test_v1_uses_cpu_mount_root_and_does_not_treat_unlimited_as_zero(self):
        self.groups(version=1, mount_root='/docker/unit', group='/docker/unit/service')
        (self.mount / 'cpu.cfs_quota_us').write_text('-1')
        (self.mount / 'cpu.cfs_period_us').write_text('100000')
        (self.mount / 'service/cpu.cfs_quota_us').write_text('75000')
        (self.mount / 'service/cpu.cfs_period_us').write_text('100000')
        self.assertEqual(cgroup_capacity(self.proc, 10), .75)
        (self.mount / 'service/cpu.cfs_quota_us').write_text('-1')
        self.assertIsNone(cgroup_capacity(self.proc, 10))

    def test_invalid_quota_and_unreadable_membership_are_not_host_capacity(self):
        self.groups()
        for value in ('0 100000', '200000 0', 'broken', 'max zero'):
            with self.subTest(value=value):
                (self.mount / 'service/worker/cpu.max').write_text(value)
                with self.assertRaises(ValueError):
                    cgroup_capacity(self.proc, 10)
        with patch.object(Path, 'read_text', side_effect=PermissionError('denied')):
            with self.assertRaises(PermissionError):
                cgroup_capacity(self.proc, 10)

    def test_capacity_intersects_host_affinity_and_fractional_quota(self):
        process = Mock(pid=10)
        process.cpu_affinity.return_value = [2, 3]
        with patch('peach.resource_platform.sys.platform', 'linux'), \
                patch('peach.resource_platform.psutil.cpu_count', return_value=32), \
                patch('peach.resource_platform.cgroup_capacity', return_value=.5) as quota:
            self.assertEqual(cpu_capacity(process), .5)
            quota.return_value = None
            self.assertEqual(cpu_capacity(process), 2)

    def test_macos_requests_native_thread_ids_and_converts_nanoseconds(self):
        def read(pid, flavor, identity, buffer, size):
            self.assertEqual((pid, flavor, size), (10, 15, ctypes.sizeof(ThreadInfo)))
            self.assertIn(identity, (123456789, 987654321))
            buffer._obj.user, buffer._obj.system = 1_000_000_000, 250_000_000
            return size
        library = SimpleNamespace(proc_pidinfo=Mock(side_effect=read))
        with patch('peach.resource_platform.sys.platform', 'darwin'), \
                patch('peach.resource_platform._libproc', return_value=library):
            self.assertEqual(thread_times(SimpleNamespace(pid=10), {123456789, 987654321}),
                             {123456789: 1.25, 987654321: 1.25})

    def test_macos_permission_error_is_distinct_from_an_exited_thread(self):
        def denied(*_args):
            ctypes.set_errno(errno.EPERM)
            return 0
        library = SimpleNamespace(proc_pidinfo=Mock(side_effect=denied))
        with patch('peach.resource_platform.sys.platform', 'darwin'), \
                patch('peach.resource_platform._libproc', return_value=library):
            with self.assertRaises(PermissionError):
                thread_times(SimpleNamespace(pid=10), {20})
            def exited(*_args):
                ctypes.set_errno(errno.ESRCH)
                return 0
            library.proc_pidinfo.side_effect = exited
            self.assertEqual(thread_times(SimpleNamespace(pid=10), {20}), {})

    def test_native_running_thread_has_increasing_cpu_time(self):
        process = psutil.Process(os.getpid())
        identity = threading.get_native_id()
        before = thread_times(process, {identity})
        deadline = time.thread_time() + .04
        while time.thread_time() < deadline:
            pass
        after = thread_times(process, {identity})
        self.assertGreater(after[identity], before[identity])
        self.assertGreater(cpu_capacity(process), 0)
