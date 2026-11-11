"""时间轴预览的档位、按需生成与索引端点。"""
from __future__ import annotations

import shutil
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from peach import timeline_sheets, web_timeline_thumbnails


class ModeFileTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix="timeline-mode-"))
        self.addCleanup(lambda: shutil.rmtree(self.root, ignore_errors=True))
        self.path = self.root / "timeline-thumbnails.json"

    def test_an_unreadable_setting_means_nothing_is_generated(self):
        """这条链会写盘也会读片子，不能靠猜来开。"""
        self.assertEqual(web_timeline_thumbnails.read_mode(self.path), "off")
        self.path.write_text("不是 JSON", encoding="utf-8")
        self.assertEqual(web_timeline_thumbnails.read_mode(self.path), "off")

    def test_an_unknown_density_in_the_file_means_off(self):
        self.path.write_text('{"mode": "every-second"}', encoding="utf-8")
        self.assertEqual(web_timeline_thumbnails.read_mode(self.path), "off")

    def test_the_chosen_density_survives_a_restart(self):
        web_timeline_thumbnails.write_mode("coarse", self.path)
        self.assertEqual(web_timeline_thumbnails.read_mode(self.path), "coarse")


class SettingsEndpointTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix="timeline-endpoint-"))
        self.addCleanup(lambda: shutil.rmtree(self.root, ignore_errors=True))
        self.contract = MagicMock()
        self.contract.state_root = self.root / "state"
        self.contract.timeline_root = self.root / "timeline"
        patcher = patch.object(web_timeline_thumbnails, "MODE_PATH", self.root / "mode.json")
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_an_unknown_density_is_refused(self):
        with self.assertRaises(ValueError):
            web_timeline_thumbnails.w_thumbnail_jobs(self.contract, {"mode": "every-second"})
        self.assertEqual(web_timeline_thumbnails.read_mode(self.root / "mode.json"), "off")

    def test_choosing_a_density_is_remembered_and_reported(self):
        with patch.object(web_timeline_thumbnails, "metadata_only", return_value=False):
            state = web_timeline_thumbnails.w_thumbnail_jobs(self.contract, {"mode": "coarse"})
        self.assertEqual(state["mode"], "coarse")
        self.assertEqual(state["intervals"], timeline_sheets.INTERVALS)
        self.assertEqual(web_timeline_thumbnails.q_thumbnail_jobs(self.contract, {})["mode"], "coarse")

    def test_with_media_processing_off_the_density_cannot_be_turned_on(self):
        with patch.object(web_timeline_thumbnails, "metadata_only", return_value=True):
            with self.assertRaises(ValueError):
                web_timeline_thumbnails.w_thumbnail_jobs(self.contract, {"mode": "precise"})
            state = web_timeline_thumbnails.w_thumbnail_jobs(self.contract, {"mode": "off"})
        self.assertEqual(state["mode"], "off")


class TimelineIndexTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix="timeline-index-"))
        self.addCleanup(lambda: shutil.rmtree(self.root, ignore_errors=True))
        self.contract = MagicMock()
        self.contract.timeline_root = self.root

    def test_a_video_with_no_sheets_reports_an_empty_index(self):
        """页面据此决定要不要画这一层；空对象就是退回九宫格。"""
        self.assertEqual(web_timeline_thumbnails.q_timeline(self.contract, {"id": "7"}), {})
        self.assertEqual(web_timeline_thumbnails.q_timeline(self.contract, {}), {})

    def test_a_video_with_sheets_reports_the_interval_and_frame_count(self):
        directory = timeline_sheets.sheet_dir(self.root, 7)
        directory.mkdir(parents=True)
        (directory / "meta.json").write_text(
            '{"interval": 30, "frames": 120, "sheets": 2}', encoding="utf-8")
        index = web_timeline_thumbnails.q_timeline(self.contract, {"id": "7"})
        self.assertEqual((index["interval"], index["frames"]), (30, 120))
        self.assertEqual(index["source"], "peach")


class OnDemandTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix="timeline-ondemand-"))
        self.addCleanup(lambda: shutil.rmtree(self.root, ignore_errors=True))
        self.state = MagicMock()
        self.state.settings.timeline_root = self.root / "timeline"
        self.state.settings.ffmpeg_root = self.root / "tools"
        patcher = patch.object(web_timeline_thumbnails, "MODE_PATH", self.root / "mode.json")
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_with_the_density_off_nothing_is_generated(self):
        self.assertFalse(web_timeline_thumbnails.ensure_sheet(self.state, 7))

    def test_a_video_that_already_has_sheets_is_not_generated_again(self):
        web_timeline_thumbnails.write_mode("coarse", self.root / "mode.json")
        directory = timeline_sheets.sheet_dir(self.state.settings.timeline_root, 7)
        directory.mkdir(parents=True)
        (directory / "000.jpg").write_bytes(b"sheet")
        (directory / "meta.json").write_text(
            '{"interval": 30, "frames": 120, "sheets": 1}', encoding="utf-8")
        self.assertFalse(web_timeline_thumbnails.ensure_sheet(self.state, 7))

    def test_the_same_video_asked_twice_is_generated_once(self):
        """播放页一开就是几个请求，同一个 id 连点几下不能抽出三套帧。"""
        web_timeline_thumbnails.write_mode("precise", self.root / "mode.json")
        started, release = threading.Event(), threading.Event()

        def emit(*_args):
            started.set()
            release.wait(5)

        with patch.object(web_timeline_thumbnails, "_emit", emit):
            self.assertTrue(web_timeline_thumbnails.ensure_sheet(self.state, 7))
            self.assertTrue(started.wait(5))
            self.assertFalse(web_timeline_thumbnails.ensure_sheet(self.state, 7))
            release.set()
            deadline = time.monotonic() + 5
            while web_timeline_thumbnails._IN_FLIGHT and time.monotonic() < deadline:
                time.sleep(0.01)
        self.assertFalse(web_timeline_thumbnails._IN_FLIGHT)

    def test_without_ffmpeg_nothing_is_generated(self):
        web_timeline_thumbnails.write_mode("coarse", self.root / "mode.json")
        with patch.object(web_timeline_thumbnails, "FFmpegResolver") as resolver:
            resolver.return_value.ffmpeg.return_value = None
            web_timeline_thumbnails._emit(self.state, 7, 30, self.state.settings.timeline_root)
        self.state.media_engine.asset.assert_not_called()


if __name__ == "__main__":
    unittest.main()
