"""时间轴预览的接触印相：格子几何、整套生成，以及按需生成这一部。"""
from __future__ import annotations

import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from peach import timeline_sheets
from peach.media import MediaUnavailable


class SheetGeometryTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix="timeline-geometry-"))
        self.addCleanup(lambda: shutil.rmtree(self.root, ignore_errors=True))

    def test_sheets_of_one_video_live_under_one_bucket(self):
        """产物按 id 末两位分桶。本机三千部一层平铺就是三千个目录挤在一处。"""
        self.assertEqual(timeline_sheets.sheet_dir(self.root, 1234),
                         self.root / "34" / "1234")
        self.assertEqual(timeline_sheets.sheet_path(self.root, 1234, 7).name, "007.jpg")

    def test_a_video_too_short_to_scan_gets_no_sheet(self):
        """两帧以下没有可扫的东西，一张图也不该出。"""
        self.assertEqual(timeline_sheets.frame_count(15, 10), 1)
        self.assertEqual(timeline_sheets.frame_count(0, 10), 0)
        self.assertEqual(timeline_sheets.frame_count(3600, 10), 360)

    def test_a_missing_sheet_file_sends_the_video_back_through(self):
        """只认 meta 不看图的话，手工清过产物目录之后整批被当成做好的跳过，
        页面上则是一片取不到的图。"""
        directory = timeline_sheets.sheet_dir(self.root, 5)
        directory.mkdir(parents=True)
        (directory / "meta.json").write_text(
            json.dumps({"interval": 10, "frames": 120, "sheets": 2}), encoding="utf-8")
        (directory / "000.jpg").write_bytes(b"x")
        self.assertFalse(timeline_sheets.is_current(self.root, 5, 10))
        (directory / "001.jpg").write_bytes(b"x")
        self.assertTrue(timeline_sheets.is_current(self.root, 5, 10))
        self.assertFalse(timeline_sheets.is_current(self.root, 5, 30))

    def test_a_frame_that_would_not_decode_keeps_its_own_slot(self):
        """抽失败的格子用邻近那一帧补上。少一帧让后面全体前移一格，图还是满的，
        位置整体错开，而错开多少取决于哪几帧解不出来。"""
        for index in (0, 3):
            (self.root / f"s{index:03d}.jpg").write_bytes(bytes([index]))
        self.assertEqual(timeline_sheets._fill_gaps(self.root, 4), 4)
        self.assertEqual((self.root / "s001.jpg").read_bytes(), bytes([0]))
        self.assertEqual((self.root / "s002.jpg").read_bytes(), bytes([3]))

    def test_nothing_decoded_means_no_sheet_at_all(self):
        self.assertEqual(timeline_sheets._fill_gaps(self.root, 3), 0)


class BuildTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix="timeline-build-"))
        self.addCleanup(lambda: shutil.rmtree(self.root, ignore_errors=True))
        self.stamps: list[float] = []

    def _capture(self, _ffmpeg, _path, timestamp, destination, **_kw):
        self.stamps.append(timestamp)
        destination.write_bytes(b"frame")
        return True

    def _tile(self, _ffmpeg, _pattern, _columns, _rows, destination, **_kw):
        destination.write_bytes(b"sheet")
        return True

    def _build(self, duration, interval, **kwargs):
        with patch.object(timeline_sheets, "capture_with_retry", self._capture), \
             patch.object(timeline_sheets, "tile_frames", self._tile):
            return timeline_sheets.build("ffmpeg", "movie.mp4", duration, self.root,
                                         9, interval, **kwargs)

    def test_the_frame_number_times_the_interval_is_where_it_came_from(self):
        """前端按同一条式子从时间反算格子。采样点只被 `EDGE_MARGIN` 整体推进一点，
        不改这条对应关系的斜率。"""
        meta = self._build(100, 10)
        self.assertEqual(meta["frames"], 10)
        self.assertEqual(meta["interval"], 10)
        self.assertAlmostEqual(self.stamps[0], 1.0)
        self.assertAlmostEqual(self.stamps[3] - self.stamps[2], 10.0)

    def test_a_long_video_is_split_into_full_sheets_plus_a_remainder(self):
        meta = self._build(10 * 1000, 10)
        self.assertEqual(meta["sheets"], 10)
        self.assertEqual(meta["frames"], 990)
        self.assertTrue(timeline_sheets.sheet_path(self.root, 9, 9).is_file())

    def test_stopping_midway_leaves_no_index_behind(self):
        """半路停下不写 meta。留一份「说有 700 帧、实际只有 300 帧」的索引，
        下一趟会把它当成做好的跳过。"""
        calls = {"n": 0}

        def active():
            calls["n"] += 1
            return calls["n"] < 5

        self.assertEqual(self._build(1000, 10, active=active), {})
        self.assertIsNone(timeline_sheets.read_meta(self.root, 9))

    def test_switching_density_does_not_leave_the_old_sheets_behind(self):
        """换档位是整套重做，新的一套通常比旧的少几张。多出来的那几张 `is_current`
        又不看，只覆盖不清理就永远没人删。"""
        self._build(10 * 1000, 10)
        self._build(400, 30)
        self.assertFalse(timeline_sheets.sheet_path(self.root, 9, 1).exists())
        self.assertTrue(timeline_sheets.sheet_path(self.root, 9, 0).is_file())

    def test_a_sheet_that_will_not_tile_produces_nothing(self):
        with patch.object(timeline_sheets, "capture_with_retry", self._capture), \
             patch.object(timeline_sheets, "tile_frames", lambda *a, **k: False):
            self.assertEqual(timeline_sheets.build("ffmpeg", "movie.mp4", 100, self.root,
                                                   9, 10), {})
        self.assertFalse(timeline_sheets.sheet_path(self.root, 9, 0).exists())


class EnsureTests(unittest.TestCase):
    """按需生成：选中哪一部就给哪一部做一套，网盘不给字节就退回九宫格。"""
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix="timeline-ensure-"))
        self.addCleanup(lambda: shutil.rmtree(self.root, ignore_errors=True))
        self.engine = MagicMock()
        self.asset = MagicMock(duration=100.0, id=5)

    def _ready(self, asset_id: int = 5):
        directory = timeline_sheets.sheet_dir(self.root, asset_id)
        directory.mkdir(parents=True)
        (directory / "000.jpg").write_bytes(b"sheet")
        (directory / "meta.json").write_text(
            json.dumps({"interval": 10, "frames": 10, "sheets": 1}), encoding="utf-8")

    def test_an_existing_sheet_is_used_without_asking_the_drive(self):
        self._ready()
        path = timeline_sheets.ensure("ffmpeg", self.engine, self.asset, 100, 10, self.root)
        self.assertEqual(path, timeline_sheets.sheet_path(self.root, 5, 0))
        self.engine.ffmpeg_input.assert_not_called()

    def test_a_drive_that_will_not_give_bytes_yields_no_sheet(self):
        self.engine.ffmpeg_input.side_effect = MediaUnavailable("授权已失效")
        self.assertIsNone(timeline_sheets.ensure("ffmpeg", self.engine, self.asset, 100, 10, self.root))

    def test_a_video_too_short_to_scan_is_not_fetched_at_all(self):
        self.assertIsNone(timeline_sheets.ensure("ffmpeg", self.engine, self.asset, 15, 10, self.root))
        self.engine.ffmpeg_input.assert_not_called()

    def test_the_drive_headers_reach_every_frame(self):
        """每抽一帧都是一次单独的请求，授权头漏在别的帧上就是 401。"""
        self.engine.ffmpeg_input.return_value = ('https://drive/x', {'Authorization': 'Bearer t'})
        seen = []

        def capture(_ffmpeg, url, timestamp, destination, **options):
            seen.append((url, options.get('headers')))
            destination.write_bytes(b"frame")
            return True

        def tile(_ffmpeg, _pattern, _columns, _rows, destination, **_options):
            destination.write_bytes(b"sheet")
            return True

        with patch.object(timeline_sheets, 'capture_with_retry', capture), \
                patch.object(timeline_sheets, 'tile_frames', tile):
            path = timeline_sheets.ensure("ffmpeg", self.engine, self.asset, 100, 10, self.root)
        self.assertTrue(seen)
        self.assertEqual({url for url, _headers in seen}, {'https://drive/x'})
        self.assertEqual({json.dumps(headers, sort_keys=True) for _url, headers in seen},
                         {json.dumps({'Authorization': 'Bearer t'}, sort_keys=True)})
        self.assertTrue(path.is_file())


if __name__ == "__main__":
    unittest.main()
