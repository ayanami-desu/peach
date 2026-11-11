"""直接填认证信息接上网盘：客户端凭据、refresh token 与扫描起点都能就地填。

浏览器授权要走公网回调，未必人人愿意开；这三样从别处（例如 rclone）拿到之后，
填进来就该能接上。先用它们换一次票确认配套，再落设置与账号文件。
"""
import json
import os
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

from peach import drive_connections, settings_file
from peach.config import PeachSettings
from peach.drive_provider import ONEDRIVE, DriveAuthRequired, DriveEntry, DriveUnavailable

CONFIG = """
[drive]
public_url = "https://peach.example.com"

[drive.accounts.onedrive]
client_id = "old-id"
client_secret = "old-secret"
"""

ROOT_ID = "drive-1!root"


class FakeProvider:
    """只实现填凭据这条路径用到的那几个方法。"""

    location = ONEDRIVE

    def __init__(self, children=None, found=None):
        self.children = children or {}
        self.found = found or {}
        self.listed = []
        self.identified = []

    def identify(self, token: str):
        self.identified.append(token)
        return ("drive-1", "me@example.com", "示例账号", ROOT_ID)

    def list_folder(self, parent_id: str, cursor: str | None = None):
        self.listed.append(parent_id)
        return (self.children.get(parent_id, ()), None)

    def entry(self, remote_id: str):
        if remote_id in self.found:
            return self.found[remote_id]
        raise DriveUnavailable("没有这一项")


def folder(remote_id: str, name: str, parent_id: str = ROOT_ID) -> DriveEntry:
    return DriveEntry(remote_id=remote_id, name=name, parent_id=parent_id, folder=True)


class CredentialFormTests(unittest.TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name).resolve()
        (self.root / 'config.toml').write_text(CONFIG, encoding='utf-8')
        previous = os.environ.get('PEACH_DATA_ROOT')
        os.environ['PEACH_DATA_ROOT'] = str(self.root)
        self.addCleanup(self._restore, previous)
        settings_file.reset_cache()
        self.refresh = mock.Mock(return_value=("access-1", 3600, "rotated"))
        patcher = mock.patch.dict(drive_connections.REFRESHERS, {ONEDRIVE: self.refresh})
        patcher.start()
        self.addCleanup(patcher.stop)
        self.provider = FakeProvider(
            children={ROOT_ID: (folder("av", "AV"), folder("doc", "文档")),
                      "av": (folder("rir", "示例合集", "av"),)},
            found={"rir": folder("rir", "示例合集", "av"),
                   "drive-1!s04ef": folder("drive-1!s04ef", "示例合集")})
        builder = mock.patch.object(drive_connections, 'build_onedrive',
                                    return_value=self.provider)
        builder.start()
        self.addCleanup(builder.stop)
        self.build_google = mock.patch.object(drive_connections, 'build_google')
        self.build_google.start()
        self.addCleanup(self.build_google.stop)
        self.drive = drive_connections.DriveConnections(
            PeachSettings(drive_public_url='https://peach.example.com',
                          secrets_root=self.root / 'secrets',
                          drive_clients={ONEDRIVE: ('old-id', 'old-secret')}),
            lambda: mock.Mock())

    def _restore(self, previous):
        if previous is None:
            os.environ.pop('PEACH_DATA_ROOT', None)
        else:
            os.environ['PEACH_DATA_ROOT'] = previous
        settings_file.reset_cache()

    def written(self) -> str:
        return (self.root / 'config.toml').read_text(encoding='utf-8')

    def account(self) -> dict:
        path = self.root / 'secrets' / 'drive-accounts.json'
        return json.loads(path.read_text(encoding='utf-8'))[ONEDRIVE]

    def paste(self, **overrides):
        fields = {"client_id": "id-2", "client_secret": "secret-2",
                  "refresh_token": "refresh-2", "root": ""}
        fields.update(overrides)
        return self.drive.set_credentials(ONEDRIVE, **fields)

    def test_pasted_credentials_replace_the_old_app_and_land_on_disk(self):
        stored = self.paste()
        self.refresh.assert_called_once_with(mock.ANY, client_id="id-2",
                                             client_secret="secret-2",
                                             refresh_token="refresh-2")
        self.assertEqual("id-2", self.drive.settings.drive_clients[ONEDRIVE][0])
        self.assertIn("client_id = 'id-2'", self.written())
        self.assertNotIn('old-id', self.written())
        self.assertEqual("rotated", stored.refresh_token)
        self.assertEqual("me@example.com", self.account()['email'])
        self.assertEqual(ROOT_ID, self.account()['root_id'])
        self.assertEqual(["access-1"], self.provider.identified)

    def test_a_directory_path_becomes_the_scan_root(self):
        self.paste(root="/AV/示例合集")
        self.assertEqual(("rir",), self.drive.settings.drive_roots[ONEDRIVE])
        self.assertIn("onedrive = 'rir'", self.written())
        self.assertEqual([ROOT_ID, "av"], self.provider.listed)
        self.assertEqual([{"remote_id": "rir", "name": "示例合集"}],
                         self.drive.connection(ONEDRIVE)['roots'])

    def test_a_remote_id_is_taken_as_it_is(self):
        self.paste(root="drive-1!s04ef")
        self.assertEqual(("drive-1!s04ef",), self.drive.settings.drive_roots[ONEDRIVE])
        self.assertEqual([], self.provider.listed)

    def test_a_path_that_does_not_exist_is_reported_without_touching_the_roots(self):
        with self.assertRaisesRegex(DriveUnavailable, "没找到目录：不存在"):
            self.paste(root="AV/不存在")
        self.assertEqual({}, self.drive.settings.drive_roots)
        self.assertNotIn("[drive.roots]\nonedrive", self.written())
        # 凭据本身是对的，已经留下了：目录填错不该让人重填凭据。
        self.assertEqual("me@example.com", self.account()['email'])

    def test_blank_fields_are_rejected_before_any_request(self):
        with self.assertRaisesRegex(DriveUnavailable, "都要填"):
            self.paste(refresh_token="   ")
        self.refresh.assert_not_called()
        self.assertIn('old-id', self.written())

    def test_a_rejected_token_leaves_the_settings_file_alone(self):
        self.refresh.side_effect = DriveAuthRequired(ONEDRIVE)
        with self.assertRaises(DriveAuthRequired):
            self.paste()
        self.assertIn('old-id', self.written())
        self.assertFalse((self.root / 'secrets' / 'drive-accounts.json').exists())

    def test_an_unreachable_profile_still_leaves_the_credentials_usable(self):
        self.provider.identify = mock.Mock(side_effect=DriveUnavailable("网盘没回话"))
        stored = self.paste()
        self.assertEqual("rotated", stored.refresh_token)
        self.assertEqual("", self.account()['email'])
        self.assertIn("client_id = 'id-2'", self.written())

    def test_an_unknown_location_is_refused(self):
        with self.assertRaisesRegex(DriveUnavailable, "没有这个网盘"):
            self.drive.set_credentials("dropbox", client_id="a", client_secret="b",
                                       refresh_token="c")
        self.refresh.assert_not_called()


if __name__ == '__main__':
    unittest.main()
