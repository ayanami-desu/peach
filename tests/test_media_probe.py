"""远端视频的时长与画质：探哪些行、请求头怎么拼、探不出来记成什么。"""
from __future__ import annotations

import json
import os
import sqlite3
import subprocess
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

from peach import media_probe
from peach.media import MediaUnavailable
from support.ledger import fresh_ledger


class HeaderArgumentTests(unittest.TestCase):
    def test_no_headers_adds_no_argument(self):
        self.assertEqual(media_probe._headers_argument({}), [])

    def test_headers_become_one_crlf_block(self):
        self.assertEqual(
            media_probe._headers_argument({"Authorization": "Bearer t", "X-A": "1"}),
            ["-headers", "Authorization: Bearer t\r\nX-A: 1\r\n"],
        )


class ProbeTests(unittest.TestCase):
    def run_probe(self, payload, headers=None):
        with mock.patch.object(media_probe.subprocess, "run",
                               return_value=SimpleNamespace(stdout=payload, returncode=0, stderr=b"")) as run:
            result = media_probe.probe("ffprobe", "https://example.test/v", headers, timeout=3)
        return result, run.call_args

    def test_probe_reads_the_remote_head_and_keeps_ratios(self):
        payload = json.dumps({
            "format": {"duration": "95.5"},
            "streams": [{"width": 720, "height": 1280, "sample_aspect_ratio": "N/A",
                         "display_aspect_ratio": "N/A", "codec_name": "h264",
                         "avg_frame_rate": "30000/1001"}],
        }).encode()
        (duration, width, height, codec, fps, audio), call = self.run_probe(payload)
        self.assertAlmostEqual(duration, 95.5)
        self.assertEqual((width, height, codec), (720, 1280, "h264"))
        self.assertAlmostEqual(fps, 29.97, places=2)
        self.assertIsNone(audio)
        command = call.args[0]
        self.assertIn("-rw_timeout", command)
        self.assertIn("https://example.test/v", command)
        self.assertEqual(call.kwargs["timeout"], 3)
        self.assertEqual(call.kwargs["creationflags"],
                         subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)

    def test_unreadable_duration_is_minus_one_not_zero(self):
        payload = json.dumps({"format": {}, "streams": [{"width": 1280, "height": 720}]}).encode()
        result, _call = self.run_probe(payload)
        self.assertEqual(result[0], -1.0)

    def test_headers_reach_ffprobe(self):
        payload = json.dumps({"format": {"duration": "10"}, "streams": [{}]}).encode()
        _result, call = self.run_probe(payload, {"Authorization": "Bearer t"})
        command = call.args[0]
        self.assertEqual(command[command.index("-headers") + 1], "Authorization: Bearer t\r\n")


class DisplayDimensionTests(unittest.TestCase):
    def test_positive_sar_widens_and_unknown_ratio_keeps_coded_size(self):
        cases = [("256:81", "16:9", 2276), ("N/A", "16:9", 2276), ("0:1", "16:9", 2276),
                 ("1:1", "16:9", 720), ("-1:1", "N/A", 720), ("1:0", None, 720)]
        for sar, dar, width in cases:
            with self.subTest(sar=sar, dar=dar):
                stream = {"width": 720, "height": 1280, "sample_aspect_ratio": sar,
                          "display_aspect_ratio": dar}
                self.assertEqual(media_probe.display_dimensions(stream), (width, 1280))

    def test_missing_size_stays_zero(self):
        self.assertEqual(media_probe.display_dimensions({}), (0, 0))


class MeasureTests(unittest.TestCase):
    def test_success_appends_context_fields(self):
        payload = json.dumps({"format": {"duration": "1800"},
                              "streams": [{"width": 1920, "height": 1080, "codec_name": "h264",
                                           "avg_frame_rate": "30/1"}]}).encode()
        with mock.patch.object(media_probe.subprocess, "run",
                               return_value=SimpleNamespace(stdout=payload, returncode=0, stderr=b"")):
            row = media_probe.measure("ffprobe", 7, "https://example.test/v")
        self.assertEqual(row[:5], (1800.0, 1920, 1080, "h264", 30.0))
        self.assertEqual(row[6:9], ("中", "横屏", "2K"))
        self.assertEqual(row[9], 7)

    def test_failure_writes_the_minus_one_row_and_reports(self):
        error = subprocess.CalledProcessError(1, "ffprobe", stderr=b"boom")
        with mock.patch.object(media_probe.subprocess, "run", side_effect=error), \
                mock.patch("peach.error_reporting.subprocess_failure") as reported:
            row = media_probe.measure("ffprobe", 9, "https://example.test/v")
        self.assertEqual(row, (-1, 0, 0, None, 0, 0, None, None, None, 9))
        reported.assert_called_once()
        self.assertEqual(reported.call_args.args[0], "media-probe")


class ProbeMissingTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.db = fresh_ledger(self.root)

    def insert(self, name, *, medium="video", duration=None, remote_id=None, location="gdrive"):
        connection = sqlite3.connect(self.db)
        try:
            cursor = connection.execute(
                "INSERT INTO asset(location,path,name,medium,duration,remote_id,drive_root)"
                " VALUES(?,?,?,?,?,?,?)",
                (location, f"{location}:/Media/{name}", name, medium, duration, remote_id, "root-1"))
            connection.commit()
            return cursor.lastrowid
        finally:
            connection.close()

    def duration_of(self, asset_id):
        connection = sqlite3.connect(self.db)
        try:
            return connection.execute("SELECT duration FROM asset WHERE id=?", (asset_id,)).fetchone()[0]
        finally:
            connection.close()

    def engine(self, *, unavailable=()):
        asked = []

        def ffmpeg_input(asset_id):
            asked.append(asset_id)
            if asset_id in unavailable:
                raise MediaUnavailable(asset_id)
            return f"https://example.test/{asset_id}", {"Authorization": "Bearer t"}

        return SimpleNamespace(ffmpeg_input=ffmpeg_input), asked

    @staticmethod
    def fake_probe(duration):
        return mock.Mock(return_value=(duration, 640, 360, "h264", 25.0, None))

    def test_only_rows_without_duration_and_with_a_remote_id(self):
        missing = self.insert("a.mp4", remote_id="file-1")
        self.insert("b.mp4", duration=90.0, remote_id="file-2")
        self.insert("c.jpg", medium="photo", remote_id="file-3")
        self.insert("d.mp4")
        engine, asked = self.engine()
        with mock.patch.object(media_probe, "probe", self.fake_probe(12.0)) as probed:
            self.assertEqual(media_probe.probe_missing(self.db, engine, "ffprobe"), 1)
        self.assertEqual(asked, [missing])
        self.assertEqual(probed.call_args.args[1], f"https://example.test/{missing}")
        self.assertEqual(probed.call_args.args[2], {"Authorization": "Bearer t"})
        self.assertEqual(self.duration_of(missing), 12.0)

    def test_asset_ids_limit_the_batch_and_unplayable_rows_are_skipped(self):
        first = self.insert("a.mp4", remote_id="file-1")
        second = self.insert("b.mp4", remote_id="file-2")
        engine, asked = self.engine(unavailable=(second,))
        with mock.patch.object(media_probe, "probe", self.fake_probe(5.0)):
            self.assertEqual(
                media_probe.probe_missing(self.db, engine, "ffprobe", asset_ids=[first, second]), 1)
        self.assertEqual(asked, [first, second])
        self.assertEqual(self.duration_of(first), 5.0)
        self.assertIsNone(self.duration_of(second))

    def test_without_ffprobe_nothing_is_probed(self):
        self.insert("a.mp4", remote_id="file-1")
        engine, asked = self.engine()
        self.assertEqual(media_probe.probe_missing(self.db, engine, None), 0)
        self.assertEqual(asked, [])

    def test_empty_asset_ids_means_nothing_to_do(self):
        self.insert("a.mp4", remote_id="file-1")
        engine, asked = self.engine()
        self.assertEqual(media_probe.probe_missing(self.db, engine, "ffprobe", asset_ids=[]), 0)
        self.assertEqual(asked, [])


if __name__ == "__main__":
    unittest.main()
