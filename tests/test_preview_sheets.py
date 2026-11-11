"""卡片接触印相（3×3）的不变式：分桶落盘、九个采样点、停止即停、登记与复用。"""
from __future__ import annotations

import hashlib
import shutil
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import MagicMock, patch

from PIL import Image

from peach import artifact_rules, preview_sheets
from peach import library_processing
from peach.drive_provider import DriveNotFound
from peach.media import MediaEngine, MediaUnavailable
from peach.repository import LedgerDatabase, LedgerRepository
from support.ledger import fresh_ledger

FRAME = (32, 18)
#: `asset(location, remote_id)` 上有唯一约束，各行的远端 id 得互不相同。
_AUTO = object()


class ContactPathTest(unittest.TestCase):
    """落盘位置：按 digest 分桶，跟着展示路径走。"""

    def test_buckets_by_first_two_digest_digits(self):
        root = Path('/tmp/snapshots')
        destination = preview_sheets.contact_path(root, 'gdrive', 'gdrive:/Movies/a.mp4')
        digest = hashlib.sha1(b'gdrive:/Movies/a.mp4').hexdigest()[:16]
        self.assertEqual(destination, root / 'gdrive' / digest[:2] / (digest + '.jpg'))

    def test_display_path_decides_the_file(self):
        root = Path('/tmp/snapshots')
        before = preview_sheets.contact_path(root, 'gdrive', 'gdrive:/Movies/a.mp4')
        after = preview_sheets.contact_path(root, 'gdrive', 'gdrive:/Movies/b.mp4')
        self.assertNotEqual(before, after)


class BuildTest(unittest.TestCase):
    """抽帧与拼图这一步，用假的抽帧器顶上，不碰真的 ffmpeg 与网盘。"""

    def setUp(self):
        holder = Path(tempfile.mkdtemp(prefix='peach-contact-test-'))
        self.addCleanup(shutil.rmtree, holder, ignore_errors=True)
        self.destination = holder / 'sheets' / 'ab' / 'abcdef.jpg'
        self.timestamps = []
        self.headers = []
        capture = patch.object(preview_sheets, 'capture_with_retry', self._capture)
        tile = patch.object(preview_sheets, 'tile_frames', self._tile)
        capture.start()
        tile.start()
        self.addCleanup(capture.stop)
        self.addCleanup(tile.stop)

    def _capture(self, ffmpeg, url, timestamp, destination, *, headers=None, width=None, timeout=None):
        """假抽帧：记下时间点与请求头，然后写一张真能解开的 JPEG。"""
        self.timestamps.append(timestamp)
        self.headers.append(headers)
        self._frame(destination, len(self.timestamps))
        return True

    def _tile(self, ffmpeg, pattern, columns, rows, destination, *, timeout=None):
        destination.parent.mkdir(parents=True, exist_ok=True)
        Image.new('RGB', (columns * FRAME[0], rows * FRAME[1])).save(destination, 'JPEG')
        return True

    @staticmethod
    def _frame(destination, shade=0):
        destination.parent.mkdir(parents=True, exist_ok=True)
        Image.new('RGB', FRAME, (shade * 20 % 255, 0, 0)).save(destination, 'JPEG')

    def test_samples_nine_points_inside_the_movie(self):
        self.assertTrue(preview_sheets.build('ffmpeg', 'https://drive/x', 1000.0, self.destination,
                                             headers={'Authorization': 'Bearer t'}))
        self.assertEqual(len(self.timestamps), 9)
        self.assertEqual(self.timestamps, sorted(self.timestamps))
        self.assertEqual(len(set(self.timestamps)), 9)
        # 头尾各让开 3%：片头黑场、片尾字幕板都不该占一格。
        self.assertGreater(self.timestamps[0], 1000.0 * 0.03)
        self.assertLess(self.timestamps[-1], 1000.0 * 0.97)
        # 九帧是九个独立请求，头漏在任何一帧上都是 401。
        self.assertEqual(self.headers, [{'Authorization': 'Bearer t'}] * 9)

    def test_writes_a_readable_sheet_and_remembers_it(self):
        self.assertTrue(preview_sheets.build('ffmpeg', 'https://drive/x', 600.0, self.destination))
        self.assertTrue(self.destination.is_file())
        # 登记过的产物才敢复用；这张图的来源是网盘流，代际无从比对，所以只记规则名。
        self.assertTrue(artifact_rules.current(self.destination))

    def test_stops_when_active_turns_false(self):
        answers = iter([True, True, True, False])
        self.assertFalse(preview_sheets.build('ffmpeg', 'https://drive/x', 600.0, self.destination,
                                              active=lambda: next(answers, False)))
        # 停了就停在原地：不再要剩下的帧，也不留半张图。
        self.assertEqual(len(self.timestamps), 3)
        self.assertFalse(self.destination.exists())

    def test_rejects_a_lone_frame(self):
        """只抽到一帧时整张作废：九格同一帧不是九宫格，封面还会永远是同一个画面。"""

        def capture(ffmpeg, url, timestamp, destination, **options):
            if timestamp > 100:
                return False
            self._frame(destination)
            return True

        with patch.object(preview_sheets, 'capture_with_retry', capture):
            self.assertFalse(preview_sheets.build('ffmpeg', 'https://drive/x', 600.0, self.destination))
        self.assertFalse(self.destination.exists())

    def test_rejects_an_unreadable_sheet(self):
        def tile(ffmpeg, pattern, columns, rows, destination, **options):
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(b'not an image')
            return True

        with patch.object(preview_sheets, 'tile_frames', tile):
            self.assertFalse(preview_sheets.build('ffmpeg', 'https://drive/x', 600.0, self.destination))
        self.assertFalse(artifact_rules.current(self.destination))

    def test_refuses_a_movie_without_duration(self):
        self.assertFalse(preview_sheets.build('ffmpeg', 'https://drive/x', 0.0, self.destination))
        self.assertEqual(self.timestamps, [])


class GenerateTest(unittest.TestCase):
    """登记 `snapshot_path` 这一步要连着真账本跑。"""

    def setUp(self):
        holder = Path(tempfile.mkdtemp(prefix='peach-contact-ledger-'))
        self.addCleanup(shutil.rmtree, holder, ignore_errors=True)
        self.db = fresh_ledger(holder)
        self.root = holder / 'snapshots'
        self.captures = []
        self.streamer = MagicMock()
        self.streamer.input_url.return_value = ('https://drive.test/stream', {'Authorization': 'Bearer t'})
        self.engine = MediaEngine(LedgerRepository(self.db), self.streamer)
        capture = patch.object(preview_sheets, 'capture_with_retry', self._capture)
        tile = patch.object(preview_sheets, 'tile_frames', self._tile)
        capture.start()
        tile.start()
        self.addCleanup(capture.stop)
        self.addCleanup(tile.stop)

    def _capture(self, ffmpeg, url, timestamp, destination, *, headers=None, width=None, timeout=None):
        self.captures.append(timestamp)
        destination.parent.mkdir(parents=True, exist_ok=True)
        Image.new('RGB', FRAME, (int(timestamp) % 255, 0, 0)).save(destination, 'JPEG')
        return True

    def _tile(self, ffmpeg, pattern, columns, rows, destination, *, timeout=None):
        destination.parent.mkdir(parents=True, exist_ok=True)
        Image.new('RGB', (columns * FRAME[0], rows * FRAME[1])).save(destination, 'JPEG')
        return True

    def _insert(self, row_id, *, medium='video', duration=120, remote_id=_AUTO,
                disposal=None, snapshot_path=None):
        with closing(sqlite3.connect(self.db)) as connection, connection:
            connection.execute(
                "INSERT INTO asset(id,location,path,name,medium,duration,remote_id,"
                "disposal,snapshot_path) VALUES(?,?,?,?,?,?,?,?,?)",
                (row_id, 'gdrive', f'/Movies/{row_id}.mp4', f'{row_id}.mp4', medium, duration,
                 f'remote-{row_id}' if remote_id is _AUTO else remote_id, disposal, snapshot_path))

    def snapshot_path(self, row_id):
        """这一行的 `snapshot_path`；行已经不在了就是 None。"""
        with closing(sqlite3.connect(self.db)) as connection:
            row = connection.execute('SELECT snapshot_path FROM asset WHERE id=?', (row_id,)).fetchone()
        return row[0] if row else None

    def test_records_the_sheet_path(self):
        self._insert(1)
        made = preview_sheets.generate(self.engine, 'ffmpeg', 1, self.root)
        self.assertIsNotNone(made)
        self.assertEqual(self.snapshot_path(1), str(made))
        self.assertTrue(made.is_file())

    def test_reuses_a_current_sheet(self):
        self._insert(1)
        first = preview_sheets.generate(self.engine, 'ffmpeg', 1, self.root)
        self.assertIsNotNone(first)
        self.assertEqual(len(self.captures), 9)
        # 产物在、规则对、解得开就不再抽一遍：那是九次远端读取，结果还一样。
        self.assertEqual(preview_sheets.generate(self.engine, 'ffmpeg', 1, self.root), first)
        self.assertEqual(len(self.captures), 9)

    def test_returns_none_when_the_drive_refuses(self):
        self._insert(1)
        self.streamer.input_url.side_effect = DriveNotFound('gone')
        self.assertIsNone(preview_sheets.generate(self.engine, 'ffmpeg', 1, self.root))
        self.assertIsNone(self.snapshot_path(1))

    def test_returns_none_for_a_row_without_a_remote_id(self):
        self._insert(1, remote_id=None)
        self.assertIsNone(preview_sheets.generate(self.engine, 'ffmpeg', 1, self.root))
        self.assertIsNone(self.snapshot_path(1))

    def test_leaves_a_disposed_row_untouched(self):
        self._insert(1, disposal='vanished')
        made = preview_sheets.generate(self.engine, 'ffmpeg', 1, self.root)
        # 图在盘上，但账本不认：这一行已经不是馆藏里的作品了。
        self.assertIsNotNone(made)
        self.assertIsNone(self.snapshot_path(1))

    def test_keeps_the_sheet_when_the_row_is_gone(self):
        self._insert(1)
        self._insert(2)
        asset = self.engine.asset(2)
        with closing(sqlite3.connect(self.db)) as connection, connection:
            connection.execute('DELETE FROM asset WHERE id=2')
        self.assertIsNotNone(preview_sheets.generate(self.engine, 'ffmpeg', asset, self.root))
        self.assertIsNone(self.snapshot_path(2))


class PendingTest(unittest.TestCase):
    """队列只挑能取字节、又有片长的馆藏视频。"""

    def setUp(self):
        holder = Path(tempfile.mkdtemp(prefix='peach-contact-pending-'))
        self.addCleanup(shutil.rmtree, holder, ignore_errors=True)
        self.db = fresh_ledger(holder)

    def _insert(self, row_id, *, medium='video', duration=120, remote_id=_AUTO,
                disposal=None, snapshot_path=None):
        with closing(sqlite3.connect(self.db)) as connection, connection:
            connection.execute(
                "INSERT INTO asset(id,location,path,name,medium,duration,remote_id,disposal,snapshot_path) "
                "VALUES(?,?,?,?,?,?,?,?,?)",
                (row_id, 'gdrive', f'/Movies/{row_id}.mp4', f'{row_id}.mp4', medium, duration,
                 f'remote-{row_id}' if remote_id is _AUTO else remote_id, disposal, snapshot_path))

    def pending(self, **options):
        with closing(sqlite3.connect(self.db)) as connection:
            return preview_sheets.pending(connection, 20, **options)

    def test_lists_only_videos_without_a_sheet(self):
        self._insert(1)                                           # 缺图，该做
        self._insert(2, snapshot_path='/tmp/snapshots/b/x.jpg')   # 已经有图
        self._insert(3, disposal='vanished')                      # 不在馆藏里了
        self._insert(4, remote_id=None)                           # 挂载时代的旧行，取不到流
        self._insert(5, duration=0)                               # 没片长，摊不开采样点
        self._insert(6, medium='image')                           # 不是视频
        self.assertEqual(self.pending(), [1])

    def test_honours_an_explicit_scope(self):
        for row_id in (1, 2, 3):
            self._insert(row_id)
        self.assertEqual(self.pending(asset_ids=[3, 1, 9]), [1, 3])
        self.assertEqual(self.pending(asset_ids=[]), [])

    def test_respects_the_limit(self):
        for row_id in (1, 2, 3):
            self._insert(row_id)
        with closing(sqlite3.connect(self.db)) as connection:
            self.assertEqual(preview_sheets.pending(connection, 2), [1, 2])


class UnavailableTest(unittest.TestCase):
    """`MediaUnavailable` 只是这一部暂时没有图，不该冒泡成整轮失败。"""

    def test_generate_returns_none(self):
        holder = Path(tempfile.mkdtemp(prefix='peach-contact-offline-'))
        self.addCleanup(shutil.rmtree, holder, ignore_errors=True)
        engine = MagicMock()
        engine.ffmpeg_input.side_effect = MediaUnavailable(7)
        asset = MagicMock(id=7, path='/Movies/7.mp4', location='gdrive', duration=100.0)
        self.assertIsNone(preview_sheets.generate(engine, 'ffmpeg', asset, holder / 'snapshots'))


if __name__ == '__main__':
    unittest.main()


class LibraryStepTest(unittest.TestCase):
    """处理链里接上的那一步：只碰范围内的行，该让路时让路，逐部报进度。"""

    def setUp(self):
        holder = Path(tempfile.mkdtemp(prefix='peach-contact-step-'))
        self.addCleanup(shutil.rmtree, holder, ignore_errors=True)
        self.db = fresh_ledger(holder)
        self.generated = holder / 'generated'
        self.state = holder / 'state'
        self.state.mkdir()
        self.rows = [{'id': 1, 'name': 'Movies/a.mp4'}, {'id': 2, 'name': 'b.mp4'}]
        self.updates = []
        self.calls = []
        self.engine = MagicMock()
        self.engine.repository.database = LedgerDatabase(self.db)
        engine = patch.object(library_processing, '_preview_engine', return_value=self.engine)
        resolver = patch('peach.ffmpeg.FFmpegResolver')
        generate = patch.object(preview_sheets, 'generate', self._generate)
        self.ffmpeg = resolver.start()
        self.ffmpeg.return_value.ffmpeg.return_value = MagicMock(path='/opt/ffmpeg/bin/ffmpeg')
        engine.start()
        generate.start()
        self.addCleanup(engine.stop)
        self.addCleanup(resolver.stop)
        self.addCleanup(generate.stop)
        self._insert(1)
        self._insert(2)
        # 已经有图的行：即使落在范围内也不该重抽。
        self._insert(3, snapshot_path='/tmp/snapshots/xx/y.jpg')

    def _insert(self, row_id, *, duration=120, snapshot_path=None):
        with closing(sqlite3.connect(self.db)) as connection, connection:
            connection.execute(
                "INSERT INTO asset(id,location,path,name,medium,duration,remote_id,"
                "disposal,snapshot_path) VALUES(?,?,?,?,?,?,?,?,?)",
                (row_id, 'gdrive', f'/Movies/{row_id}.mp4', f'{row_id}.mp4', 'video', duration,
                 f'remote-{row_id}', None, snapshot_path))

    def _generate(self, engine, ffmpeg, asset, root, *, active=None):
        self.calls.append((engine, ffmpeg, asset, root))
        return root / f'{asset}.jpg'

    def _config(self):
        config = MagicMock()
        config.directory.side_effect = {'generated': self.generated, 'tools': self.state,
                                        'state': self.state, 'secrets': self.state}.__getitem__
        return config

    def _run(self, *, stage='collect'):
        return library_processing._generate_preview_sheets(
            self._config(), LedgerDatabase(self.db), self.rows, stage=stage,
            update=lambda **values: self.updates.append(values), active=lambda: True)

    def test_makes_contact_sheets_for_the_rows_in_scope(self):
        self.assertEqual(self._run(), 2)
        self.assertEqual([call[2] for call in self.calls], [1, 2])
        self.assertEqual({call[1] for call in self.calls}, {'/opt/ffmpeg/bin/ffmpeg'})
        self.assertEqual({call[3] for call in self.calls}, {self.generated / 'snapshots'})
        self.assertEqual(self.updates[0]['stage'], library_processing.PREVIEWS_STAGE)
        self.assertEqual((self.updates[0]['checked'], self.updates[0]['total']), (2, 4))
        self.assertEqual(self.updates[0]['current_asset_name'], 'a.mp4')
        # 每部片先报「正在做这一部」，做成了再报一张数：第二条只有 `previews`。
        self.assertEqual(self.updates[1]['previews'], 1)
        self.assertEqual((self.updates[2]['checked'], self.updates[2]['total']), (3, 4))
        self.assertEqual(self.updates[-1]['previews'], 2)
        self.assertIsNone(self.updates[-1]['current_asset_id'])

    def test_a_metadata_only_run_leaves_the_step_out(self):
        self.assertEqual(self._run(stage=library_processing.METADATA_STAGE), 0)
        self.assertEqual(self.calls, [])

    def test_the_video_byte_switch_skips_everything(self):
        (self.state / 'media-processing.json').write_text('{"metadata_only": true}', encoding='utf-8')
        self.assertEqual(self._run(), 0)
        self.assertEqual(self.calls, [])

    def test_without_ffmpeg_the_step_is_skipped(self):
        self.ffmpeg.return_value.ffmpeg.return_value = None
        self.assertEqual(self._run(), 0)
        self.assertEqual(self.calls, [])

    def test_without_drive_access_the_step_is_skipped(self):
        with patch.object(library_processing, '_preview_engine', return_value=None):
            self.assertEqual(self._run(), 0)
        self.assertEqual(self.calls, [])

    def test_a_video_that_cannot_be_read_leaves_no_sheet(self):
        with patch.object(preview_sheets, 'generate', return_value=None):
            self.assertEqual(self._run(), 0)
        self.assertEqual(self.updates[-1]['previews'], 0)
