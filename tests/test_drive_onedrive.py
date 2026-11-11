"""OneDrive 驱动：翻页游标、预授权直链、增量删除与状态码映射。"""
import json
import tempfile
import time
import unittest
from pathlib import Path

import httpx

from peach import drive_onedrive
from peach.drive_accounts import Accounts, StoredAccount, TokenStore
from peach.drive_provider import DriveAuthRequired, DriveForbidden, DriveNotFound, DriveUnavailable

PARENT = "PARENT"
NEXT = "https://graph.microsoft.com/v1.0/me/drive/items/PARENT/children?$skiptoken=abc"
DELTA = "https://graph.microsoft.com/v1.0/me/drive/root/delta?$deltatoken=xyz"


def stored() -> StoredAccount:
    return StoredAccount(location="onedrive", account_id="user-1", email="a@example.com",
                         display_name="A", root_id="ROOT", refresh_token="refresh",
                         access_token="token", expires_at=int(time.time()) + 3600)


def file_raw(remote_id: str, name: str) -> dict:
    return {"id": remote_id, "name": name, "size": 1234,
            "lastModifiedDateTime": "2026-01-02T03:04:05Z",
            "file": {"mimeType": "video/mp4"},
            "video": {"duration": 9000, "width": 1920, "height": 1080},
            "parentReference": {"id": PARENT}}


def folder_raw(remote_id: str, name: str) -> dict:
    return {"id": remote_id, "name": name, "folder": {"childCount": 0},
            "parentReference": {"id": PARENT}}


class OneDriveTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.store = TokenStore(Path(directory.name))
        self.store.save(stored())
        self.seen: list[httpx.Request] = []

    def drive(self, handler) -> drive_onedrive.OneDrive:
        def record(request: httpx.Request) -> httpx.Response:
            self.seen.append(request)
            return handler(request)

        client = httpx.Client(transport=httpx.MockTransport(record))
        self.addCleanup(client.close)
        accounts = Accounts(self.store, lambda account: self.fail("令牌未过期，不该刷新"))
        return drive_onedrive.build(accounts, lambda: client, client_id="cid",
                                    client_secret="secret", redirect_uri="https://peach.test/cb")

    def test_list_folder_uses_the_next_link_as_cursor(self):
        def handler(request: httpx.Request) -> httpx.Response:
            if "skiptoken" in str(request.url):
                return httpx.Response(200, json={"value": [file_raw("f2", "第二集.mp4")]})
            return httpx.Response(200, json={"value": [file_raw("f1", "第一集.mp4"),
                                                       folder_raw("d1", "第一季")],
                                             "@odata.nextLink": NEXT})

        drive = self.drive(handler)
        rows, cursor = drive.list_folder(PARENT)
        self.assertEqual(["f1", "d1"], [row.remote_id for row in rows])
        self.assertEqual("第一集.mp4", rows[0].name)
        self.assertEqual(1234, rows[0].size)
        self.assertEqual("video/mp4", rows[0].mime)
        self.assertEqual(9.0, rows[0].duration)
        self.assertEqual((1920, 1080), (rows[0].width, rows[0].height))
        self.assertFalse(rows[0].folder)
        self.assertEqual(PARENT, rows[0].parent_id)
        self.assertTrue(rows[1].folder)
        self.assertIsNone(rows[1].size)
        self.assertEqual(NEXT, cursor)
        self.assertEqual("/v1.0/me/drive/items/PARENT/children", self.seen[0].url.path)
        self.assertEqual("1000", self.seen[0].url.params["$top"])
        self.assertIn("video", self.seen[0].url.params["$select"])

        rows, cursor = drive.list_folder(PARENT, cursor)
        self.assertEqual(["f2"], [row.remote_id for row in rows])
        self.assertIsNone(cursor)
        self.assertEqual(NEXT, str(self.seen[1].url))

    def test_entry_reads_a_single_item(self):
        drive = self.drive(lambda request: httpx.Response(200, json=file_raw("f1", "第一集.mp4")))
        entry = drive.entry("f1")
        self.assertEqual(("f1", "第一集.mp4", PARENT), (entry.remote_id, entry.name, entry.parent_id))
        self.assertEqual("/v1.0/me/drive/items/f1", self.seen[0].url.path)

    def test_download_target_redirects_to_the_preauthorized_url(self):
        drive = self.drive(lambda request: httpx.Response(
            200, json={"id": "f1", "@microsoft.graph.downloadUrl": "https://download.test/f1"}))
        target = drive.download_target("f1")
        self.assertEqual(("redirect", "https://download.test/f1"), (target.kind, target.url))
        self.assertEqual({}, target.headers)

    def test_download_target_without_the_field_is_unavailable(self):
        drive = self.drive(lambda request: httpx.Response(200, json={"id": "f1", "file": {}}))
        with self.assertRaises(DriveUnavailable):
            drive.download_target("f1")

    def test_move_patches_the_parent_and_name(self):
        drive = self.drive(lambda request: httpx.Response(200, json=file_raw("f1", "改名.mp4")))
        entry = drive.move("f1", "destination", name="改名.mp4")
        self.assertEqual("改名.mp4", entry.name)
        self.assertEqual(("PATCH", "/v1.0/me/drive/items/f1"),
                         (self.seen[0].method, self.seen[0].url.path))
        self.assertEqual({"parentReference": {"id": "destination"}, "name": "改名.mp4"},
                         json.loads(self.seen[0].content))

    def test_changes_report_deletions_and_skip_the_root_item(self):
        def handler(request: httpx.Request) -> httpx.Response:
            if "deltatoken" in str(request.url):
                return httpx.Response(200, json={"value": [{"id": "f2", "deleted": {"state": "deleted"}}],
                                                 "@odata.deltaLink": DELTA})
            return httpx.Response(200, json={
                "value": [file_raw("f1", "第一集.mp4"),
                          {"id": "f9", "deleted": {"state": "deleted"}},
                          {"id": "ROOT", "root": {}}],
                "@odata.deltaLink": DELTA})

        drive = self.drive(handler)
        rows, cursor = drive.changes(None)
        self.assertEqual([("f1", False), ("f9", True)], [(row.remote_id, row.removed) for row in rows])
        self.assertEqual("第一集.mp4", rows[0].entry.name)
        self.assertIsNone(rows[1].entry)
        self.assertEqual(DELTA, cursor)
        self.assertEqual("/v1.0/me/drive/root/delta", self.seen[0].url.path)
        self.assertIn("deleted", self.seen[0].url.params["$select"])

        rows, cursor = drive.changes(cursor)
        self.assertEqual([("f2", True)], [(row.remote_id, row.removed) for row in rows])
        self.assertEqual(DELTA, cursor)
        self.assertEqual(DELTA, str(self.seen[1].url))

    def test_status_codes_map_to_drive_errors(self):
        cases = ((401, DriveAuthRequired), (403, DriveForbidden), (404, DriveNotFound),
                 (429, DriveUnavailable), (503, DriveUnavailable))
        for status, expected in cases:
            drive = self.drive(lambda request, status=status: httpx.Response(status, text="busy"))
            with self.assertRaises(expected):
                drive.entry("f1")


if __name__ == "__main__":
    unittest.main()
