"""取字节方式：直连与转发两种并存，由用户按部署线路自己选（ADR-0157）。

直连把预授权地址交给浏览器，Peach 不占带宽；转发由 Peach 按 Range 取字节再吐出去，
浏览器只跟 Peach 说话。Google 的字节必须带 Bearer，所以它只有转发一种。
"""
import os
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

from peach import drive_connections, settings_file
from peach.config import PeachSettings
from peach.drive_provider import GOOGLE, ONEDRIVE, DriveUnavailable, modes_for, playback_mode

CONFIG = """
[drive]
public_url = "https://peach.example.com"

[drive.accounts.onedrive]
client_id = "id-2"
client_secret = "secret-2"
"""


class PlaybackModeTests(unittest.TestCase):
    def test_google_has_only_proxy_and_onedrive_has_both(self):
        self.assertEqual(('proxy',), modes_for(GOOGLE))
        self.assertEqual(('redirect', 'proxy'), modes_for(ONEDRIVE))

    def test_configured_mode_wins_and_impossible_values_fall_back(self):
        self.assertEqual('redirect', playback_mode({}, ONEDRIVE))
        self.assertEqual('proxy', playback_mode({ONEDRIVE: 'proxy'}, ONEDRIVE))
        self.assertEqual('redirect', playback_mode({ONEDRIVE: 'stream'}, ONEDRIVE))
        # 设置文件会拒绝给 Google 写 redirect；万一绕过读文件走到这里，也不能把令牌地址发出去。
        self.assertEqual('proxy', playback_mode({GOOGLE: 'redirect'}, GOOGLE))


class SetModeTests(unittest.TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name).resolve()
        (self.root / 'config.toml').write_text(CONFIG, encoding='utf-8')
        previous = os.environ.get('PEACH_DATA_ROOT')
        os.environ['PEACH_DATA_ROOT'] = str(self.root)
        self.addCleanup(self._restore, previous)
        settings_file.reset_cache()
        self.builder = mock.patch.object(
            drive_connections, 'build_onedrive', return_value=mock.Mock(location=ONEDRIVE))
        self.build = self.builder.start()
        self.addCleanup(self.builder.stop)
        self.drive = drive_connections.DriveConnections(
            PeachSettings(drive_public_url='https://peach.example.com',
                          secrets_root=self.root / 'secrets',
                          drive_clients={ONEDRIVE: ('id-2', 'secret-2')}),
            lambda: mock.Mock())

    def _restore(self, previous):
        if previous is None:
            os.environ.pop('PEACH_DATA_ROOT', None)
        else:
            os.environ['PEACH_DATA_ROOT'] = previous
        settings_file.reset_cache()

    def written(self) -> str:
        return (self.root / 'config.toml').read_text(encoding='utf-8')

    def test_switching_to_proxy_is_persisted_and_rebuilds_the_driver(self):
        self.assertEqual('proxy', self.drive.set_mode(ONEDRIVE, 'proxy'))
        self.assertEqual({ONEDRIVE: 'proxy'}, self.drive.settings.drive_modes)
        self.assertIn('[drive.modes]', self.written())
        self.assertIn("onedrive = 'proxy'", self.written())
        # 驱动实例把方式记在自己身上，换完必须重建一次才生效。
        self.assertEqual('proxy', self.build.call_args.kwargs['mode'])

    def test_switching_back_to_the_default_drops_the_line(self):
        self.drive.set_mode(ONEDRIVE, 'proxy')
        self.drive.set_mode(ONEDRIVE, 'redirect')
        self.assertEqual({}, self.drive.settings.drive_modes)
        self.assertNotIn('[drive.modes]', self.written())
        self.assertEqual('redirect', self.build.call_args.kwargs['mode'])

    def test_a_mode_the_source_cannot_use_is_rejected(self):
        with self.assertRaises(DriveUnavailable):
            self.drive.set_mode(ONEDRIVE, 'stream')
        self.assertEqual({}, self.drive.settings.drive_modes)


class SetPublicUrlTests(unittest.TestCase):
    """回调基址只服务「开始授权」，改完立刻重建驱动，不用重启服务。"""

    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name).resolve()
        (self.root / 'config.toml').write_text(CONFIG, encoding='utf-8')
        previous = os.environ.get('PEACH_DATA_ROOT')
        os.environ['PEACH_DATA_ROOT'] = str(self.root)
        self.addCleanup(self._restore, previous)
        settings_file.reset_cache()
        self.build = mock.patch.object(
            drive_connections, 'build_onedrive', return_value=mock.Mock(location=ONEDRIVE)).start()
        self.addCleanup(self.build.stop)
        self.drive = drive_connections.DriveConnections(
            PeachSettings(drive_public_url='', secrets_root=self.root / 'secrets',
                          drive_clients={ONEDRIVE: ('id-2', 'secret-2')}),
            lambda: mock.Mock())

    def _restore(self, previous):
        if previous is None:
            os.environ.pop('PEACH_DATA_ROOT', None)
        else:
            os.environ['PEACH_DATA_ROOT'] = previous
        settings_file.reset_cache()

    def written(self) -> str:
        return (self.root / 'config.toml').read_text(encoding='utf-8')

    def test_a_new_base_is_persisted_and_moves_the_callback(self):
        self.assertEqual('https://peach.test', self.drive.set_public_url('https://peach.test/'))
        self.assertEqual('https://peach.test', self.drive.settings.drive_public_url)
        self.assertIn("public_url = 'https://peach.test'", self.written())
        self.assertEqual('https://peach.test/oauth/onedrive/callback',
                         self.build.call_args.kwargs['redirect_uri'])

    def test_clearing_the_base_leaves_authorization_without_a_callback(self):
        self.drive.set_public_url('https://peach.test')
        self.assertEqual('', self.drive.set_public_url('  '))
        self.assertEqual('', self.build.call_args.kwargs['redirect_uri'])

    def test_a_base_that_is_not_https_is_rejected(self):
        with self.assertRaises(DriveUnavailable):
            self.drive.set_public_url('http://127.0.0.1:8900')
        self.assertEqual('', self.drive.settings.drive_public_url)


if __name__ == '__main__':
    unittest.main()