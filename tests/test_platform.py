"""系统盘、目录可读性与旧形态 Windows 路径的判定。"""
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from peach.platform import is_windows_path, resolve_location, resolve_root, root_online, root_status, system_volume


class SystemVolumeTests(unittest.TestCase):
    @unittest.skipUnless(os.name == 'nt', 'Windows 系统目录 API')
    def test_system_directory_can_be_on_another_drive(self):
        import ctypes

        def windows_directory(buffer, size):
            buffer.value = 'Z:\\Windows'
            return len(buffer.value)

        with patch.object(ctypes.windll.kernel32, 'GetWindowsDirectoryW', side_effect=windows_directory):
            self.assertEqual(system_volume(), Path('Z:/'))

    @unittest.skipUnless(os.name == 'nt', 'Windows 系统目录 API')
    def test_missing_system_directory_is_reported(self):
        import ctypes
        with patch.object(ctypes.windll.kernel32, 'GetWindowsDirectoryW', return_value=0):
            with self.assertRaises(OSError):
                system_volume()

    @unittest.skipIf(os.name == 'nt', '非 Windows 平台固定用根卷')
    def test_other_platforms_use_the_root_volume(self):
        self.assertEqual(system_volume(), Path('/'))


class RootStatusTests(unittest.TestCase):
    def test_readable_directory_is_online(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(root_status(Path(tmp)), 'ok')
            self.assertTrue(root_online(Path(tmp)))

    def test_directory_that_vanished_is_missing(self):
        with tempfile.TemporaryDirectory() as tmp:
            gone = Path(tmp) / 'gone'
            gone.mkdir()
            gone.rmdir()
            self.assertEqual(root_status(gone), 'missing')
            self.assertFalse(root_online(gone))

    def test_a_file_is_not_a_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'a.mp4'
            path.write_text('x', encoding='utf-8')
            self.assertEqual(root_status(path), 'not_directory')

    @unittest.skipIf(os.name == 'nt', '非 Windows 平台不触发权限位')
    def test_unreadable_directory_is_reported(self):
        with tempfile.TemporaryDirectory() as tmp:
            locked = Path(tmp) / 'locked'
            locked.mkdir()
            locked.chmod(0o000)
            try:
                self.assertIn(root_status(locked), ('permission_denied', 'unavailable'))
            finally:
                locked.chmod(0o700)


class WindowsPathShapeTests(unittest.TestCase):
    def test_drive_letters_are_recognised(self):
        for raw in ('R:\\Media\\a.mp4', 'r:/media/a.mp4', 'Z:\\'):
            self.assertTrue(is_windows_path(raw), raw)

    def test_other_shapes_are_not_windows_paths(self):
        for raw in ('gdrive:/Media/a.mp4', '/mnt/media/a.mp4', 'C:', '', 'R:media\\a.mp4'):
            self.assertFalse(is_windows_path(raw), raw)


class ResolveRootTests(unittest.TestCase):
    ROOTS = {'local': ('R:\\Media',), 'cloud': ('R:\\Media\\Cloud',)}

    def test_the_longest_declared_prefix_wins(self):
        self.assertEqual(resolve_location('R:\\Media\\Cloud\\a.mp4', self.ROOTS), ('cloud', ('a.mp4',)))
        self.assertEqual(resolve_location('R:\\Media\\b.mp4', self.ROOTS), ('local', ('b.mp4',)))

    def test_the_index_of_the_matching_prefix_is_reported(self):
        roots = {'local': ('R:\\One', 'R:\\Two')}
        self.assertEqual(resolve_root('R:\\Two\\a.mp4', roots), ('local', 1, ('a.mp4',)))

    def test_prefixes_compare_case_insensitively(self):
        self.assertEqual(resolve_location('r:\\media\\A.MP4', self.ROOTS)[0], 'local')

    def test_paths_outside_every_prefix_have_no_location(self):
        self.assertEqual(resolve_root('R:\\Other\\a.mp4', self.ROOTS), (None, -1, ()))
        self.assertEqual(resolve_root('gdrive:/Media/a.mp4', self.ROOTS), (None, -1, ()))

    def test_without_roots_nothing_resolves(self):
        self.assertEqual(resolve_location('R:\\Media\\a.mp4'), (None, ()))
