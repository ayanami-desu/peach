"""媒体库只是配置层的一层映射：一个远端目录就是一个库。

加两遍和加一遍的下场一样，删不在里面的目录也当没发生；整个过程只改设置文件，
不碰网盘上的文件，也不碰账本里的行（ADR-0157 之后的媒体库口径）。
"""
import os
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

from peach import drive_connections, settings_file
from peach.config import PeachSettings
from peach.drive_provider import ONEDRIVE, DriveEntry, DriveUnavailable

CONFIG = """
[drive]

[drive.accounts.onedrive]
client_id = "id-1"
client_secret = "secret-1"
"""

ROOT_ID = "drive-1!root"


class FakeProvider:
    location = ONEDRIVE

    def __init__(self, folders=("rir", "doc", "film")):
        self.folders = set(folders)
        self.entries = []

    def entry(self, remote_id: str) -> DriveEntry:
        self.entries.append(remote_id)
        if remote_id in ("movie",):
            return DriveEntry(remote_id=remote_id, name="a.mp4", parent_id=ROOT_ID, folder=False)
        if remote_id not in self.folders:
            raise DriveUnavailable("没有这一项")
        return DriveEntry(remote_id=remote_id, name=remote_id, parent_id=ROOT_ID, folder=True)


class LibraryRootTests(unittest.TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name).resolve()
        (self.root / "config.toml").write_text(CONFIG, encoding="utf-8")
        previous = os.environ.get("PEACH_DATA_ROOT")
        os.environ["PEACH_DATA_ROOT"] = str(self.root)
        self.addCleanup(self._restore, previous)
        settings_file.reset_cache()
        patcher = mock.patch.dict(drive_connections.REFRESHERS, {ONEDRIVE: mock.Mock()})
        patcher.start()
        self.addCleanup(patcher.stop)
        self.provider = FakeProvider()
        builder = mock.patch.object(drive_connections, "build_onedrive", return_value=self.provider)
        builder.start()
        self.addCleanup(builder.stop)
        self.drive = drive_connections.DriveConnections(
            PeachSettings(drive_public_url="https://peach.example.com",
                          secrets_root=self.root / "secrets", db_path=self.root / "database/ledger.db",
                          drive_clients={ONEDRIVE: ("id-1", "secret-1")}),
            lambda: mock.Mock())

    def _restore(self, previous):
        if previous is None:
            os.environ.pop("PEACH_DATA_ROOT", None)
        else:
            os.environ["PEACH_DATA_ROOT"] = previous
        settings_file.reset_cache()

    def written(self) -> str:
        return (self.root / "config.toml").read_text(encoding="utf-8")

    def test_a_fresh_account_scans_nothing_until_a_library_exists(self):
        self.assertEqual(self.drive.roots(ONEDRIVE), ())
        self.assertEqual(self.provider.entries, [])

    def test_adding_the_same_directory_twice_changes_nothing(self):
        self.drive.add_root(ONEDRIVE, "rir")
        self.drive.add_root(ONEDRIVE, "rir")
        self.assertEqual(self.drive.roots(ONEDRIVE), ("rir",))
        self.assertEqual(self.provider.entries, ["rir"])

    def test_removing_something_that_is_not_there_is_a_no_op(self):
        self.drive.add_root(ONEDRIVE, "rir")
        self.drive.remove_root(ONEDRIVE, "doc")
        self.assertEqual(self.drive.roots(ONEDRIVE), ("rir",))
        self.drive.remove_root(ONEDRIVE, "rir")
        self.assertEqual(self.drive.roots(ONEDRIVE), ())

    def test_a_file_is_not_a_library(self):
        with self.assertRaises(DriveUnavailable):
            self.drive.add_root(ONEDRIVE, "movie")

    def test_moving_a_library_replaces_its_directory_in_one_write(self):
        self.drive.add_root(ONEDRIVE, "rir")
        self.drive.add_root(ONEDRIVE, "doc")
        moved = self.drive.move_root(ONEDRIVE, "rir", "film")
        self.assertEqual(moved, ("film", "doc"))
        self.assertEqual(self.written().count("film"), 1)
        self.assertNotIn("'rir'", self.written())

    def test_moving_onto_itself_or_an_existing_library_changes_nothing(self):
        self.drive.add_root(ONEDRIVE, "rir")
        self.drive.add_root(ONEDRIVE, "doc")
        self.assertEqual(self.drive.move_root(ONEDRIVE, "rir", "rir"), ("rir", "doc"))
        self.assertEqual(self.drive.move_root(ONEDRIVE, "rir", "doc"), ("rir", "doc"))

    def test_moving_a_library_to_a_file_is_refused(self):
        self.drive.add_root(ONEDRIVE, "rir")
        with self.assertRaises(DriveUnavailable):
            self.drive.move_root(ONEDRIVE, "rir", "movie")
        self.assertEqual(self.drive.roots(ONEDRIVE), ("rir",))

    def test_libraries_never_touch_the_ledger(self):
        self.drive.add_root(ONEDRIVE, "rir")
        self.drive.remove_root(ONEDRIVE, "rir")
        self.assertFalse((self.root / "database" / "ledger.db").exists())
        self.assertNotIn("rir", self.written())


if __name__ == "__main__":
    unittest.main()
