"""媒体解析：可播判定、取字节入口与本地缓存。

播放不再经过本机文件系统，这一层只做三件事：按扩展名判网页能不能播、把 asset 交给
网盘流、把必须落盘的图片落到 `cache_root`。
"""
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import httpx

from peach.drive_provider import DriveAuthRequired, DriveNotFound
from peach.ffmpeg import BinaryChoice, binary_diagnostics
from peach.media import (
    BROWSER_MIME, OTHER_VIDEO_SUFFIXES, VIDEO_SUFFIXES, MediaEngine, MediaNotFound,
    MediaUnavailable, StreamPlan, browser_mime, player_mime, suffix_of,
)
from peach.repository import MediaAsset


class FakeRepository:
    def __init__(self, *assets):
        self.assets = {asset.id: asset for asset in assets}

    def media_asset(self, asset_id):
        return self.assets.get(asset_id)


class FakeStreamer:
    def __init__(self, body=b"0123456789", error=None):
        self.body = body
        self.error = error
        self.reads = []
        self.opens = []

    def open(self, location, root, remote_id):
        if self.error is not None:
            raise self.error
        self.opens.append((location, root, remote_id))
        return httpx.Response(200, content=self.body, request=httpx.Request("GET", "https://x.test"))

    def read(self, location, root, remote_id, offset, length, timeout=60):
        if self.error is not None:
            raise self.error
        self.reads.append((location, root, remote_id, offset, length))
        return self.body[offset:offset + length]

    def input_url(self, location, root, remote_id):
        if self.error is not None:
            raise self.error
        return (f"https://x.test/{remote_id}", {"Authorization": "Bearer t"})

    def response(self, request, location, root, remote_id, mime, download=False):
        from starlette.responses import Response
        if self.error is not None:
            raise self.error
        return Response(b"abcd", media_type=mime, status_code=206,
                        headers={"content-range": f"bytes 0-3/{len(self.body)}"})


class SuffixTests(unittest.TestCase):
    def test_browser_playable_suffixes_map_to_a_mime(self):
        self.assertEqual(browser_mime("ABC-123.mp4"), "video/mp4")
        self.assertEqual(browser_mime("ABC-123.M4V"), "video/mp4")
        self.assertEqual(browser_mime("clip.webm"), "video/webm")
        self.assertEqual(browser_mime("clip.ogv"), "video/ogg")

    def test_other_containers_are_indexed_but_not_playable(self):
        for suffix in (".mkv", ".avi", ".wmv", ".mov", ".ts", ".m2ts", ".flv", ".mpg", ".mpeg", ".3gp"):
            self.assertIn(suffix, OTHER_VIDEO_SUFFIXES)
            self.assertIn(suffix, VIDEO_SUFFIXES)
            self.assertIsNone(browser_mime(f"clip{suffix}"))

    def test_unknown_and_empty_names_have_no_suffix(self):
        self.assertEqual(suffix_of(None), "")
        self.assertEqual(suffix_of(""), "")
        self.assertEqual(suffix_of("no-extension"), "")
        self.assertIsNone(browser_mime("notes.txt"))
        self.assertEqual(set(BROWSER_MIME), {".mp4", ".m4v", ".webm", ".ogv", ".ogg"})

    def test_containers_only_external_players_decode_have_their_own_mime(self):
        self.assertEqual(player_mime("ABC-123.mkv"), "video/x-matroska")
        self.assertEqual(player_mime("clip.avi"), "video/x-msvideo")
        self.assertEqual(player_mime("clip.mp4"), "video/mp4")
        self.assertIsNone(player_mime("notes.txt"))
        self.assertEqual(set(OTHER_VIDEO_SUFFIXES), {
            ".mkv", ".avi", ".wmv", ".mov", ".ts", ".m2ts", ".flv", ".mpg", ".mpeg", ".3gp"})


class MediaEngineTests(unittest.TestCase):
    def engine(self, *assets, streamer=None, cache_root=None):
        streamer = streamer or FakeStreamer()
        return MediaEngine(FakeRepository(*assets), streamer, cache_root=cache_root), streamer

    def test_unknown_asset_is_not_found(self):
        engine, _ = self.engine()
        with self.assertRaises(MediaNotFound):
            engine.asset(7)

    def test_plan_reports_standard_range_for_browser_suffixes(self):
        asset = MediaAsset(1, "gdrive:/Movies/ABC-123.mp4", None, location="gdrive",
                           name="ABC-123.mp4", duration=95.0, size=100, remote_id="file-1")
        engine, _ = self.engine(asset)
        self.assertEqual(engine.plan(1), StreamPlan("range", "video/mp4", "drive-range"))

    def test_plan_refuses_containers_the_browser_cannot_play(self):
        asset = MediaAsset(1, "gdrive:/Movies/ABC-123.mkv", None, location="gdrive",
                           name="ABC-123.mkv", remote_id="file-1")
        engine, _ = self.engine(asset)
        with self.assertRaises(MediaUnavailable):
            engine.plan(1)

    def test_plan_for_external_links_accepts_any_container_players_decode(self):
        asset = MediaAsset(1, "gdrive:/Movies/ABC-123.mkv", None, location="gdrive",
                           name="ABC-123.mkv", remote_id="file-1")
        engine, _ = self.engine(asset)
        self.assertEqual(engine.plan(1, any_container=True),
                         StreamPlan("range", "video/x-matroska", "drive-range"))

    def test_rows_from_retired_sources_have_no_remote_id(self):
        asset = MediaAsset(1, "M:\\Media\\ABC-123.mp4", None, location="115", name="ABC-123.mp4")
        engine, _ = self.engine(asset)
        for call in (lambda: engine.plan(1),
                     lambda: engine.read(asset, 0, 4),
                     lambda: engine.ffmpeg_input(asset)):
            with self.assertRaises(MediaUnavailable):
                call()

    def test_read_passes_offset_and_length_to_the_drive(self):
        asset = MediaAsset(1, "gdrive:/a.mp4", None, location="gdrive", name="a.mp4",
                           remote_id="file-1")
        engine, streamer = self.engine(asset)
        self.assertEqual(engine.read(asset, 2, 3), b"234")
        self.assertEqual(streamer.reads, [("gdrive", "", "file-1", 2, 3)])

    def test_drive_errors_become_unavailable(self):
        asset = MediaAsset(1, "gdrive:/a.mp4", None, location="gdrive", name="a.mp4",
                           remote_id="file-1")
        for error in (DriveNotFound("gone"), DriveAuthRequired("re-auth")):
            engine, _ = self.engine(asset, streamer=FakeStreamer(error=error))
            with self.assertRaises(MediaUnavailable):
                engine.read(asset, 0, 4)
            with self.assertRaises(MediaUnavailable):
                engine.ffmpeg_input(asset)

    def test_ffmpeg_input_returns_url_and_headers(self):
        asset = MediaAsset(1, "onedrive:/a.mp4", None, location="onedrive", name="a.mp4",
                           remote_id="item-1")
        engine, _ = self.engine(asset)
        self.assertEqual(engine.ffmpeg_input(asset),
                         ("https://x.test/item-1", {"Authorization": "Bearer t"}))
        self.assertEqual(engine.ffmpeg_input(asset.id),
                         ("https://x.test/item-1", {"Authorization": "Bearer t"}))

    def test_response_forwards_download_flag(self):
        asset = MediaAsset(1, "gdrive:/a.mp4", None, location="gdrive", name="a.mp4",
                           remote_id="file-1")
        engine, _ = self.engine(asset)
        response = engine.response(None, asset, download=True)
        self.assertEqual(response.status_code, 206)
        self.assertEqual(response.headers["content-type"], "video/mp4")

    def test_thumbnail_only_serves_generated_snapshots(self):
        with tempfile.TemporaryDirectory() as tmp:
            snapshot = Path(tmp).resolve() / "snap.jpg"
            snapshot.write_bytes(b"jpeg")
            asset = MediaAsset(1, "gdrive:/a.mp4", str(snapshot), location="gdrive",
                               name="a.mp4", remote_id="file-1")
            engine, _ = self.engine(asset, cache_root=Path(tmp).resolve() / "cache")
            self.assertEqual(engine.file_for(asset, thumbnail=True), snapshot)
            missing = MediaAsset(2, "gdrive:/b.mp4", str(Path(tmp) / "nope.jpg"), location="gdrive",
                                 name="b.mp4", remote_id="file-2")
            engine, _ = self.engine(missing, cache_root=Path(tmp).resolve() / "cache")
            with self.assertRaises(MediaUnavailable):
                engine.file_for(missing, thumbnail=True)

    def test_full_file_is_downloaded_once_into_the_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            cache = Path(tmp).resolve()
            asset = MediaAsset(1, "gdrive:/dir/a.mp4", None, location="gdrive", name="a.mp4",
                               remote_id="file-1")
            engine, streamer = self.engine(asset, cache_root=cache)
            path = engine.file_for(asset)
            self.assertEqual(path, cache / "gdrive" / "file-1.mp4")
            self.assertEqual(path.read_bytes(), b"0123456789")
            self.assertEqual(streamer.opens, [("gdrive", "", "file-1")])
            self.assertEqual(engine.file_for(1), path)
            self.assertEqual(streamer.opens, [("gdrive", "", "file-1")])

    def test_full_file_needs_a_cache_root(self):
        asset = MediaAsset(1, "gdrive:/a.jpg", None, location="gdrive", name="a.jpg",
                           remote_id="file-1")
        engine, _ = self.engine(asset)
        with self.assertRaises(MediaUnavailable):
            engine.file_for(asset)


class ToolDiagnosticsTests(unittest.TestCase):
    def test_tool_diagnostics_distinguishes_software_av1_and_hardware_only(self):
        for decoder, available in (('av1', False), ('libdav1d', True)):
            results = [subprocess.CompletedProcess([], 0, b'ffmpeg version test\n', b''),
                       subprocess.CompletedProcess([], 0, f' V..... {decoder} AV1 decoder\n'.encode(), b'')]
            with patch('peach.ffmpeg.subprocess.run', side_effect=results):
                result = binary_diagnostics(BinaryChoice(Path('ffmpeg'), 'test'), decoders=True)
            self.assertTrue(result['usable'])
            self.assertEqual(result['av1_software'], available)

    def test_tool_diagnostics_probe_each_binary_file_once_until_it_changes(self):
        with tempfile.TemporaryDirectory() as tmp:
            binary = Path(tmp).resolve() / 'ffmpeg.exe'
            binary.write_bytes(b'one')
            choice = BinaryChoice(binary, 'test')
            version = subprocess.CompletedProcess([], 0, b'ffmpeg version test\n', b'')
            with patch('peach.ffmpeg.subprocess.run', return_value=version) as run:
                self.assertTrue(binary_diagnostics(choice)['usable'])
                self.assertTrue(binary_diagnostics(choice)['usable'])
                self.assertEqual(run.call_count, 1)
                binary.write_bytes(b'upgraded')
                self.assertTrue(binary_diagnostics(choice)['usable'])
                self.assertEqual(run.call_count, 2)
            with patch('peach.ffmpeg.subprocess.run', side_effect=subprocess.TimeoutExpired('ffmpeg', 5)) as run:
                self.assertFalse(binary_diagnostics(BinaryChoice(binary, 'other'))['usable'])
                self.assertFalse(binary_diagnostics(BinaryChoice(binary, 'other'))['usable'])
                self.assertEqual(run.call_count, 2)

    def test_tool_diagnostics_reports_execution_failure(self):
        with patch('peach.ffmpeg.subprocess.run', side_effect=subprocess.TimeoutExpired('ffmpeg', 5)):
            result = binary_diagnostics(BinaryChoice(Path('ffmpeg'), 'test'), decoders=True)
        self.assertTrue(result['available'])
        self.assertFalse(result['usable'])
        self.assertEqual(result['error'], 'TimeoutExpired')


if __name__ == '__main__':
    unittest.main()
