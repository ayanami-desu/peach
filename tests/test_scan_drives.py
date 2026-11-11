"""网盘扫描：全量登记、按 remote_id 幂等、增量删除。

远端一律是内存里的假驱动：两棵目录树，分页取目录，变更队列手动喂。账本是临时库。
"""
from __future__ import annotations

import sqlite3
import tempfile
import unittest
from collections import defaultdict

from peach import scan
from peach.drive_provider import Change, DriveAccount, DriveEntry, DriveNotFound, DriveUnavailable
from peach.repository import LedgerDatabase, LedgerRepository
from support.ledger import fresh_ledger


class FakeDrive:
    """内存里的两棵树；`changes` 吐的是队列里的东西，队列空了就只换游标。"""

    location = "gdrive"

    def __init__(self, page_size: int = 2):
        self.account = DriveAccount("gdrive", "acct-g", "me@example.com", "甲", "root")
        self.page_size = page_size
        self.items: dict[str, DriveEntry] = {}
        self.children: dict[str, list[str]] = defaultdict(list)
        self.queue: list[Change] = []
        self.cursor = "c1"
        self.listed: list[str] = []

    def folder(self, remote_id: str, name: str, parent: str = "root") -> str:
        self._put(DriveEntry(remote_id, name, parent, True), parent)
        return remote_id

    def video(self, remote_id: str, name: str, parent: str, size: int = 1 << 20,
              duration: float | None = None) -> str:
        self._put(DriveEntry(remote_id, name, parent, False, size=size,
                             modified="2026-11-01T09:30:00Z", duration=duration), parent)
        return remote_id

    def _put(self, entry: DriveEntry, parent: str) -> None:
        self.items[entry.remote_id] = entry
        self.children[parent].append(entry.remote_id)

    def list_folder(self, parent_id: str, cursor: str | None = None):
        self.listed.append(parent_id)
        ids = self.children[parent_id]
        start = int(cursor) if cursor else 0
        page = [self.items[remote_id] for remote_id in ids[start:start + self.page_size]]
        following = str(start + self.page_size) if start + self.page_size < len(ids) else None
        return page, following

    def entry(self, remote_id: str) -> DriveEntry:
        try:
            return self.items[remote_id]
        except KeyError:
            raise DriveNotFound(remote_id) from None

    def changes(self, cursor: str | None):
        if cursor is None:
            return [], "c-start"
        pending, self.queue = self.queue, []
        return pending, self.cursor

    def download_target(self, remote_id: str):  # pragma: no cover - 协议占位
        raise NotImplementedError

    def move(self, remote_id: str, parent_id: str, name: str | None = None):  # pragma: no cover
        raise NotImplementedError


class Lookup:
    """`DriveConnections` 的替身：扫描现问现用驱动与扫描起点，改这两样不用重建服务。"""

    def __init__(self, providers: dict | None = None, roots: dict | None = None):
        self.table = dict(providers or {})
        self.roots = dict(roots or {})

    @property
    def providers(self) -> dict:
        return dict(self.table)

    def provider(self, location: str):
        if location not in self.table:
            raise DriveUnavailable(f"{location} 没有接入")
        return self.table[location]

    def roots_map(self) -> dict:
        return dict(self.roots)


class ScanServiceTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.db_path = fresh_ledger(self.tmp.name)
        self.database = LedgerDatabase(self.db_path)
        self.drive = FakeDrive()
        self.roots = {"gdrive": ["movies", "shows"]}
        self.lookup = Lookup({"gdrive": self.drive}, self.roots)
        self.service = scan.ScanService(self.lookup, LedgerRepository(self.database),
                                        clock=lambda: 1_780_000_000.0)

    def test_incremental_sync_moves_the_last_sync_stamp_but_not_the_full_one(self):
        self._tree()
        self.service.full_sync("gdrive")
        before = self.service.sync_state("gdrive")
        self.assertEqual(before["synced_at"], before["full_synced_at"])
        later = scan.ScanService(self.lookup, LedgerRepository(self.database),
                                 clock=lambda: 1_780_000_000.0 + 3600.0)
        later.sync_changes("gdrive")
        after = later.sync_state("gdrive")
        # 「上次同步」跟着每一次成功同步走；整棵核对的时刻不动，节拍照旧由它决定。
        self.assertEqual(after["full_synced_at"], before["full_synced_at"])
        self.assertNotEqual(after["synced_at"], before["synced_at"])

    def test_restart_drops_the_cursor_so_the_next_sync_walks_the_tree_again(self):
        # 增量游标只认「哪些文件变了」：换了扫描起点还留着它，新选中的目录要等最长一天才进账本。
        self._tree()
        self.service.full_sync("gdrive")
        self.service.sync_changes("gdrive")
        self.service.sync_changes("gdrive")
        self.assertEqual("c1", self.service.sync_state("gdrive")["cursor"])
        self.service.restart("gdrive")
        state = self.service.sync_state("gdrive")
        self.assertEqual((None, None, None), (state["cursor"], state["synced_at"], state["full_synced_at"]))
        self.assertEqual(4, self.service.full_sync("gdrive").files)

    def test_a_scan_asks_for_the_drivers_and_roots_that_are_current_now(self):
        # 换过账号或扫描起点之后 `DriveConnections` 重建过驱动：构造时抓一份表就等于换了没用。
        self._tree()
        empty = Lookup()
        service = scan.ScanService(empty, LedgerRepository(self.database), clock=lambda: 1_780_000_000.0)
        with self.assertRaises(scan.ScanTargetError):
            service.full_sync("gdrive")
        empty.table["gdrive"] = self.drive
        empty.roots["gdrive"] = ["root"]
        self.assertEqual(4, service.full_sync("gdrive").files)

    def _tree(self):
        self.drive.items["root"] = DriveEntry("root", "我的云端硬盘", "", True)
        self.drive.folder("movies", "Movies")
        self.drive.folder("inner", "Inner", parent="movies")
        self.drive.folder("shows", "Shows")
        self.drive.video("m1", "a.mp4", "movies", size=2 << 20, duration=5400.0)
        self.drive.video("m2", "b.mkv", "movies")
        self.drive.video("m3", "d.webm", "inner")
        self.drive.video("m4", "f.ts", "shows")
        self.drive.video("m5", "c.srt", "movies")       # 字幕不是作品
        self.drive.video("m6", "poster.jpg", "movies")  # 图片不是作品

    def _rows(self):
        connection = sqlite3.connect(self.db_path)
        self.addCleanup(connection.close)
        return connection.execute(
            "SELECT remote_id, path, name, medium, size, mtime FROM asset ORDER BY path").fetchall()

    def _disposal(self):
        connection = sqlite3.connect(self.db_path)
        self.addCleanup(connection.close)
        return dict(connection.execute("SELECT remote_id, disposal FROM asset"))

    def test_full_sync_registers_videos_as_drive_entries(self):
        self._tree()
        result = self.service.full_sync("gdrive")
        self.assertEqual(result.files, 4)
        self.assertEqual(result.folders, 3)
        self.assertEqual(result.failures, 0)
        self.assertEqual(len(result.new_ids), 4)
        self.assertEqual([row[1] for row in self._rows()], [
            "gdrive:/Movies/Inner/d.webm", "gdrive:/Movies/a.mp4",
            "gdrive:/Movies/b.mkv", "gdrive:/Shows/f.ts"])
        remote_id, path, name, medium, size, mtime = self._rows()[1]
        self.assertEqual((remote_id, path, name, medium, size, mtime),
                         ("m1", "gdrive:/Movies/a.mp4", "a.mp4", "video", 2 << 20, "2026-11-01"))
        connection = sqlite3.connect(self.db_path)
        self.addCleanup(connection.close)
        cursor, full_synced_at = connection.execute(
            "SELECT cursor, full_synced_at FROM drive_sync WHERE location='gdrive'").fetchone()
        self.assertIsNone(cursor)
        # 一趟扫描里 first_seen 与 full_synced_at 是同一个本地时间戳。
        self.assertEqual(full_synced_at,
                         connection.execute("SELECT first_seen FROM asset LIMIT 1").fetchone()[0])

    def test_a_release_code_in_the_name_lands_in_the_ledger(self):
        """自动落库按 `code` 找回同一部作品；扫描时不写这一列，那部片就永远落不了库。"""
        self.drive.items["root"] = DriveEntry("root", "我的云端硬盘", "", True)
        self.drive.folder("movies", "Movies")
        self.drive.video("m1", "SSIS-950-C.mp4", "movies")
        self.drive.video("m2", "holiday clip.mp4", "movies")
        self.service.full_sync("gdrive")
        connection = sqlite3.connect(self.db_path)
        self.addCleanup(connection.close)
        codes = dict(connection.execute("SELECT name, code FROM asset"))
        self.assertEqual(codes, {"SSIS-950-C.mp4": "SSIS-950", "holiday clip.mp4": None})

    def test_second_pass_keeps_one_row_per_remote_id(self):
        self._tree()
        self.service.full_sync("gdrive")
        again = self.service.full_sync("gdrive")
        self.assertEqual(again.new_ids, ())
        self.assertEqual(again.vanished, 0)
        self.assertEqual(len(self._rows()), 4)

    def test_rename_updates_the_row_instead_of_adding_one(self):
        self._tree()
        self.service.full_sync("gdrive")
        self.drive.items["m1"] = DriveEntry("m1", "a-renamed.mp4", "movies", False, size=2 << 20,
                                            modified="2026-11-02T08:00:00Z")
        self.service.full_sync("gdrive")
        paths = [row[1] for row in self._rows()]
        self.assertEqual(len(paths), 4)
        self.assertIn("gdrive:/Movies/a-renamed.mp4", paths)
        self.assertNotIn("gdrive:/Movies/a.mp4", paths)

    def test_incremental_removal_marks_vanished_and_keeps_the_row(self):
        self._tree()
        self.service.full_sync("gdrive")
        first = self.service.sync_changes("gdrive")
        self.assertEqual(first.files, 0)  # 没有游标时只取起点
        self.drive.queue = [Change("m1", True)]
        result = self.service.sync_changes("gdrive")
        self.assertEqual(result.vanished, 1)
        self.assertEqual(len(self._rows()), 4)
        self.assertEqual(self._disposal()["m1"], "vanished")
        self.assertIsNone(self._disposal()["m2"])

    def test_incremental_add_lands_under_its_parent(self):
        self._tree()
        self.service.full_sync("gdrive")
        self.service.sync_changes("gdrive")
        self.drive.video("m7", "g.mp4", "inner", size=3 << 20)
        self.drive.queue = [Change("m7", False, self.drive.items["m7"])]
        result = self.service.sync_changes("gdrive")
        self.assertEqual(result.files, 1)
        self.assertIn("gdrive:/Movies/Inner/g.mp4", [row[1] for row in self._rows()])

    def test_returning_file_leaves_the_vanished_state(self):
        self._tree()
        self.service.full_sync("gdrive")
        self.service.sync_changes("gdrive")
        self.drive.queue = [Change("m1", True)]
        self.service.sync_changes("gdrive")
        self.drive.queue = [Change("m1", False, self.drive.items["m1"])]
        self.service.sync_changes("gdrive")
        self.assertIsNone(self._disposal()["m1"])

    def test_unknown_location_is_named_in_the_error(self):
        with self.assertRaises(scan.ScanTargetError) as caught:
            self.service.full_sync("pikpak")
        self.assertIn("pikpak", str(caught.exception))

    def test_missing_roots_is_an_error(self):
        service = scan.ScanService(Lookup({"gdrive": self.drive}), LedgerRepository(self.database))
        with self.assertRaises(scan.ScanTargetError):
            service.full_sync("gdrive")


if __name__ == "__main__":
    unittest.main()


class PathShapeTests(unittest.TestCase):
    """展示路径与时间收口：账本里只存虚拟路径与日期。"""

    def test_virtual_path_keeps_the_source_prefix(self):
        self.assertEqual(scan.virtual_path("gdrive", ("Media", "a.mp4")),
                         "gdrive:/Media/a.mp4")

    def test_dates_keep_only_the_day(self):
        self.assertEqual(scan._mtime("2026-11-01T09:30:00Z"), "2026-11-01")
        self.assertEqual(scan._mtime("2026-11-01"), "2026-11-01")
        self.assertIsNone(scan._mtime("2026/11/01"))
        self.assertIsNone(scan._mtime("11-01-2026"))
        self.assertIsNone(scan._mtime(""))
        self.assertIsNone(scan._mtime(None))

    def test_stamps_stay_sqlite_sortable(self):
        self.assertRegex(scan._stamp(1_780_000_000), r"^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$")
