"""Google Drive 驱动：翻页、视频元数据、增量游标、移动与状态码映射。"""
import json
import tempfile
import time
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import httpx

from peach import drive_google
from peach.drive_accounts import Accounts, StoredAccount, TokenStore
from peach.drive_provider import DriveForbidden, DriveNotFound, DriveUnavailable

PARENT = "PARENT"


def stored() -> StoredAccount:
    return StoredAccount(location="gdrive", account_id="user-1", email="a@example.com",
                         display_name="A", root_id="ROOT", refresh_token="refresh",
                         access_token="token", expires_at=int(time.time()) + 3600)


def video_raw(remote_id: str, name: str) -> dict:
    return {"id": remote_id, "name": name, "mimeType": "video/mp4", "size": "2048",
            "modifiedTime": "2026-01-02T03:04:05Z", "parents": [PARENT],
            "videoMediaMetadata": {"width": 1920, "height": 1080, "durationMillis": "95000"}}


def folder_raw(remote_id: str, name: str) -> dict:
    return {"id": remote_id, "name": name, "mimeType": drive_google.FOLDER_MIME,
            "parents": [PARENT]}


class DriveTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.store = TokenStore(self.root)
        self.store.save(stored())
        self.accounts = Accounts(self.store, lambda account: ("", 0, ""))
        self.requests: list[httpx.Request] = []

    def drive(self, handler) -> drive_google.GoogleDrive:
        def record(request: httpx.Request) -> httpx.Response:
            self.requests.append(request)
            return handler(request)

        client = httpx.Client(transport=httpx.MockTransport(record))
        return drive_google.GoogleDrive(self.accounts, lambda: client, client_id="cid",
                                        client_secret="secret",
                                        redirect_uri="https://peach.example/oauth/gdrive/callback")

    def test_list_folder_pages_and_reads_video_metadata(self):
        def handler(request: httpx.Request) -> httpx.Response:
            if request.url.path == "/drive/v3/about":
                return httpx.Response(200, json={"user": {"permissionId": "p", "emailAddress": "a@example.com",
                                                          "displayName": "A"}, "root": "ROOT"})
            query = request.url.params
            self.assertEqual(query["q"], f"'{PARENT}' in parents and trashed=false")
            if query.get("pageToken") == "second":
                return httpx.Response(200, json={"files": [folder_raw("F2", "2024")]})
            return httpx.Response(200, json={"files": [video_raw("V1", "a.mp4")],
                                             "nextPageToken": "second"})

        drive = self.drive(handler)
        first, cursor = drive.list_folder(PARENT)
        self.assertEqual(cursor, "second")
        self.assertEqual(first[0].remote_id, "V1")
        self.assertFalse(first[0].folder)
        self.assertEqual(first[0].duration, 95)
        self.assertEqual((first[0].width, first[0].height), (1920, 1080))
        self.assertEqual(first[0].size, 2048)

        second, cursor = drive.list_folder(PARENT, cursor)
        self.assertIsNone(cursor)
        self.assertTrue(second[0].folder)

    def test_changes_walks_pages_before_advancing_cursor(self):
        def handler(request: httpx.Request) -> httpx.Response:
            if request.url.path == "/drive/v3/about":
                return httpx.Response(200, json={"user": {}, "root": "ROOT"})
            if request.url.path == "/drive/v3/changes/startPageToken":
                return httpx.Response(200, json={"startPageToken": "S1"})
            if request.url.params.get("pageToken") == "S1":
                return httpx.Response(200, json={"changes": [
                    {"fileId": "V1", "removed": True},
                    {"fileId": "D1", "file": {"id": "D1", "name": "doc",
                                               "mimeType": "application/vnd.google-apps.document"}},
                ], "nextPageToken": "P2"})
            return httpx.Response(200, json={"changes": [{"fileId": "V2", "file": video_raw("V2", "b.mp4")}],
                                             "newStartPageToken": "S2"})

        drive = self.drive(handler)
        rows, cursor = drive.changes(None)
        self.assertEqual((rows, cursor), ((), "S1"))

        rows, cursor = drive.changes(cursor)
        self.assertEqual(cursor, "S2")
        self.assertEqual([(row.remote_id, row.removed) for row in rows], [("V1", True), ("V2", False)])
        self.assertEqual(rows[1].entry.duration, 95)

    def test_download_target_is_proxied_with_bearer(self):
        drive = self.drive(lambda request: httpx.Response(200, json={"user": {}, "root": "ROOT"}))
        target = drive.download_target("V1")
        self.assertEqual(target.kind, "proxy")
        self.assertEqual(target.url, "https://www.googleapis.com/drive/v3/files/V1?alt=media")
        self.assertEqual(target.headers["Authorization"], "Bearer token")

    def test_move_sends_add_and_remove_parents(self):
        def handler(request: httpx.Request) -> httpx.Response:
            if request.url.path == "/drive/v3/about":
                return httpx.Response(200, json={"user": {}, "root": "ROOT"})
            if request.method == "GET":
                return httpx.Response(200, json={"parents": ["OLD"]})
            payload = json.loads(request.content)
            self.assertEqual(request.url.params["addParents"], "NEW")
            self.assertEqual(request.url.params["removeParents"], "OLD")
            self.assertEqual(payload, {"name": "renamed.mp4"})
            return httpx.Response(200, json=video_raw("V1", "renamed.mp4"))

        drive = self.drive(handler)
        entry = drive.move("V1", "NEW", "renamed.mp4")
        self.assertEqual(entry.parent_id, "NEW")
        self.assertEqual(entry.name, "renamed.mp4")

    def test_status_codes_map_to_drive_errors(self):
        drive = self.drive(lambda request: httpx.Response(404, json={"error": {}}))
        with self.assertRaises(DriveNotFound):
            drive.entry("V1")

        forbidden = self.drive(lambda request: httpx.Response(403, text="forbidden"))
        with self.assertRaises(DriveForbidden):
            forbidden.entry("V1")

        broken = self.drive(lambda request: httpx.Response(500, text="boom"))
        with self.assertRaises(DriveUnavailable):
            broken.entry("V1")

    def test_authorize_url_asks_for_offline_consent(self):
        drive = self.drive(lambda request: httpx.Response(200, json={"user": {}, "root": "ROOT"}))
        query = parse_qs(urlparse(drive.authorize_url("state-1")).query)
        self.assertEqual(query["access_type"], ["offline"])
        self.assertEqual(query["prompt"], ["consent"])
        self.assertEqual(query["state"], ["state-1"])
        self.assertEqual(query["redirect_uri"], ["https://peach.example/oauth/gdrive/callback"])

    def test_exchange_without_refresh_token_fails(self):
        drive = self.drive(lambda request: httpx.Response(200, json={"access_token": "a", "expires_in": 3600}))
        with self.assertRaises(DriveUnavailable):
            drive.exchange("code")


if __name__ == "__main__":
    unittest.main()
