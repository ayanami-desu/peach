"""设置文件里的网盘段：回调基址、OAuth 凭据、扫描根与媒体库属性。"""
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from peach import settings_file

BASE = """
[drive]
public_url = "https://peach.example.com"

[drive.accounts.gdrive]
client_id = "id-1"
client_secret = "secret-1"

[drive.accounts.onedrive]
client_id = "id-2"
client_secret = "secret-2"

[drive.roots]
gdrive = "root-1"
onedrive = ["root-2", "root-3"]

[media.library_catalog."gdrive:root-1"]
name = "电影"
icon = "heart"
"""


class DriveSettingsTests(unittest.TestCase):
    def setUp(self):
        temporary = TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()

    def load(self, body, **kwargs):
        (self.root / 'config.toml').write_text(body, encoding='utf-8')
        return settings_file.load_config(self.root, {'PEACH_DATA_ROOT': str(self.root)}, **kwargs)

    def test_drive_sections_round_trip(self):
        config = self.load(BASE)
        self.assertEqual(config.drive_public_url, 'https://peach.example.com')
        self.assertEqual(config.drive_clients, {'gdrive': ('id-1', 'secret-1'), 'onedrive': ('id-2', 'secret-2')})
        self.assertEqual(config.drive_roots, {'gdrive': ('root-1',), 'onedrive': ('root-2', 'root-3')})
        self.assertEqual(config.library_catalog['gdrive:root-1'], {'name': '电影', 'icon': 'heart'})
        # 渲染出来的文件读回去必须一样：写回是手工编辑之外的唯一入口。
        written = settings_file.write(config, force=True)
        again = settings_file.load_config(self.root, {'PEACH_DATA_ROOT': str(self.root)})
        self.assertEqual((again.drive_public_url, again.drive_clients, again.drive_roots,
                          again.library_catalog), (config.drive_public_url, config.drive_clients,
                                                   config.drive_roots, config.library_catalog))
        self.assertTrue(written.is_file())

    def test_playback_modes_round_trip(self):
        config = self.load(BASE + '\n[drive.modes]\nonedrive = "proxy"\n')
        self.assertEqual({'onedrive': 'proxy'}, config.drive_modes)
        settings_file.write(config, force=True)
        again = settings_file.load_config(self.root, {'PEACH_DATA_ROOT': str(self.root)})
        self.assertEqual({'onedrive': 'proxy'}, again.drive_modes)

    def test_playback_mode_must_be_one_of_the_two(self):
        with self.assertRaisesRegex(settings_file.SettingsFileError, 'redirect、proxy'):
            self.load(BASE + '\n[drive.modes]\nonedrive = "stream"\n')

    def test_google_cannot_be_told_to_redirect(self):
        # Google 的字节必须带 Bearer，令牌不能交给浏览器，所以只有 proxy 一种。
        with self.assertRaisesRegex(settings_file.SettingsFileError, '只能用 proxy'):
            self.load(BASE + '\n[drive.modes]\ngdrive = "redirect"\n')

    def test_playback_mode_needs_a_configured_account(self):
        body = BASE.replace('[drive.accounts.onedrive]\nclient_id = "id-2"\nclient_secret = "secret-2"\n', '')
        body = body.replace('onedrive = ["root-2", "root-3"]\n', '')
        with self.assertRaisesRegex(settings_file.SettingsFileError, r'没在 `\[drive.accounts\]` 里配置'):
            self.load(body + '\n[drive.modes]\nonedrive = "proxy"\n')

    def test_public_url_has_to_be_https(self):
        body = BASE.replace('https://peach.example.com', 'http://peach.example.com')
        with self.assertRaisesRegex(settings_file.SettingsFileError, 'https 地址'):
            self.load(body)

    def test_unknown_drive_account_is_rejected(self):
        body = BASE.replace('[drive.accounts.onedrive]', '[drive.accounts.115]')
        with self.assertRaisesRegex(settings_file.SettingsFileError, '只接受 gdrive、onedrive'):
            self.load(body)

    def test_client_secret_is_required(self):
        body = BASE.replace('client_secret = "secret-1"\n', '')
        with self.assertRaisesRegex(settings_file.SettingsFileError, 'client_secret'):
            self.load(body)

    def test_root_array_rejects_blanks_and_duplicates(self):
        for value in ('["root-1", ""]', '["root-1", "root-1"]'):
            with self.subTest(value=value):
                body = BASE.replace('onedrive = ["root-2", "root-3"]', f'onedrive = {value}')
                with self.assertRaisesRegex(settings_file.SettingsFileError, 'onedrive|重复|空串'):
                    self.load(body)

    def test_bad_file_falls_back_when_not_strict(self):
        config = self.load('[drive]\npublic_url = "nope"\n', strict=False)
        self.assertEqual((config.drive_public_url, config.drive_roots), ('', {}))


if __name__ == '__main__':
    unittest.main()
