"""诊断使用临时账本与数据目录，只读分项，不修复账本、配置或工具。"""
import json
import sqlite3
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

from peach import access, diagnostics, health
from peach.config import PeachSettings
from peach.ffmpeg import BinaryChoice
from peach.settings_file import PeachConfig, ServerSettings


EMPTY_DRIVES = {"locations": []}
CONNECTED = {"locations": [{"location": "gdrive", "label": "Google Drive", "configured": True,
                            "connected": True, "roots": [{"remote_id": "root-1", "name": "Media"}],
                            "synced_at": "2026-11-11 09:00:00", "last_error": ""}]}
BROKEN = {"locations": [{"location": "gdrive", "label": "Google Drive", "configured": True,
                         "connected": False, "roots": [], "synced_at": None, "last_error": ""},
                        {"location": "onedrive", "label": "OneDrive", "configured": True,
                         "connected": False, "roots": [], "synced_at": None,
                         "last_error": "刷新令牌已失效"}]}
TOOLS_OK = {"available": True, "source": "data", "path": "/tools/ffmpeg", "usable": True,
            "av1_software": True}
TOOLS_MISSING = {"available": False, "source": None, "path": None}


class DiagnosticsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.db = self.root / "ledger.db"
        self.page = self.root / "index.html"
        self.page.write_text("<!doctype html><title>Peach</title>", encoding="utf-8")
        self.config = PeachConfig(self.root, self.root / "config.toml", data_root_found=True,
                                  server=ServerSettings(host="127.0.0.1", port=8900))
        self.settings = self.settings_for()

    def settings_for(self, **overrides):
        base = dict(db_path=self.db, page_path=self.page, host="127.0.0.1", port=8900,
                    configured=True, access_path=None, token="private-token",
                    ffmpeg_root=self.root / "tools")
        base.update(overrides)
        return PeachSettings(**base)

    def report(self, settings=None, drives=None):
        return diagnostics.report(settings or self.settings, drives or EMPTY_DRIVES, config=self.config)

    def test_a_missing_empty_and_corrupt_database_are_distinct_and_never_created(self):
        self.assertEqual(health.inspect_database(self.db)["database"], "missing")
        self.assertFalse(self.db.exists())
        sqlite3.connect(self.db).close()
        self.assertEqual(health.inspect_database(self.db)["database"], "empty")
        self.db.write_bytes(b"invalid database")
        self.assertEqual(health.inspect_database(self.db)["database"], "unavailable")

    def test_the_database_check_names_the_state_and_wants_a_backup(self):
        missing, _schema = diagnostics.database_checks(self.settings)
        self.assertEqual((missing["status"], missing["reason"]), ("failed", "数据库不存在"))
        self.assertEqual(missing["details"], {"state": "missing"})
        sqlite3.connect(self.db).close()
        from peach.migrations import upgrade
        upgrade(self.db, Path(__file__).resolve().parents[1] / "migrations")
        available, schema = diagnostics.database_checks(self.settings)
        self.assertEqual((available["status"], available["reason"]), ("ok", "数据库可读取"))
        self.assertEqual(schema["status"], "ok")

    def test_an_unconfigured_machine_points_at_the_drive_page(self):
        unconfigured = diagnostics.configuration(self.config, False, validate=False)
        self.assertEqual((unconfigured["status"], unconfigured["target"]), ("failed", "/settings#drives"))
        self.assertEqual(diagnostics.configuration(self.config, True, validate=False)["status"], "ok")

    def test_a_broken_configuration_file_is_reported_without_naming_the_path(self):
        self.config.path.write_text("[server\nhost = ", encoding="utf-8")
        broken = diagnostics.configuration(self.config, True, validate=True)
        self.assertEqual((broken["status"], broken["reason"]), ("failed", "配置文件无法读取"))
        self.assertNotIn(str(self.root), json.dumps(broken, ensure_ascii=False))

    def test_drives_report_what_is_connected_and_what_went_wrong(self):
        self.assertEqual(diagnostics.drives(EMPTY_DRIVES)["status"], "unknown")
        self.assertEqual(diagnostics.drives(EMPTY_DRIVES)["target"], "/settings#drives")
        self.assertEqual(diagnostics.drives(CONNECTED)["reason"], "已接入：Google Drive")
        broken = diagnostics.drives(BROKEN)
        self.assertEqual(broken["status"], "warning")
        self.assertIn("Google Drive：未授权", broken["reason"])
        self.assertIn("OneDrive：刷新令牌已失效", broken["reason"])
        self.assertEqual(set(broken["details"]["locations"]), {"gdrive", "onedrive"})

    def test_access_security_separates_local_only_from_an_exposed_入口(self):
        local = diagnostics.security(self.settings_for(token=""))
        self.assertEqual((local["status"], local["reason"]), ("ok", "仅监听本机"))
        with_token = diagnostics.security(self.settings)
        self.assertEqual((with_token["status"], with_token["reason"]), ("ok", "已开启访问密码"))
        exposed = self.settings_for(host="0.0.0.0", token="")
        warning = diagnostics.security(exposed)
        self.assertEqual((warning["status"], warning["target"]), ("warning", "/settings/access"))
        self.assertEqual(warning["details"], {"exposed": True, "protected": False})
        protected = self.settings_for(host="192.0.2.10",
                                      access_path=self.root / "access.json", token="")
        access.save(protected.access_path, "entry-password")
        self.assertEqual(diagnostics.security(protected)["reason"], "已开启访问密码")

    def test_a_damaged_access_policy_is_a_failure_not_a_silent_open_door(self):
        damaged = self.settings_for(access_path=self.root / "access.json")
        damaged.access_path.write_text("{not json", encoding="utf-8")
        result = diagnostics.security(damaged)
        self.assertEqual((result["status"], result["reason"]),
                         ("failed", "访问密码配置无法读取"))
        self.assertEqual(result["target"], None)

    def test_media_tools_report_missing_binaries_and_point_at_the_diagnostics_page(self):
        with patch.object(diagnostics, "FFmpegResolver") as resolver, \
             patch.object(diagnostics.shutil, "which", return_value=None), \
             patch.object(diagnostics, "binary_diagnostics", return_value=TOOLS_MISSING):
            resolver.return_value.ffmpeg.return_value = None
            resolver.return_value.ffprobe.return_value = None
            missing = diagnostics.tools(self.settings)
        self.assertEqual(missing["status"], "warning")
        self.assertEqual(missing["target"], "/settings/diagnostics")
        self.assertIn("未找到：ffmpeg、ffprobe", missing["reason"])
        with patch.object(diagnostics, "FFmpegResolver") as resolver, \
             patch.object(diagnostics.shutil, "which", return_value="/usr/bin/openssl"), \
             patch.object(diagnostics, "binary_diagnostics", return_value=TOOLS_OK):
            resolver.return_value.ffmpeg.return_value = BinaryChoice(self.root / "ffmpeg", "data")
            resolver.return_value.ffprobe.return_value = BinaryChoice(self.root / "ffprobe", "data")
            healthy = diagnostics.tools(self.settings)
        self.assertEqual((healthy["status"], healthy["target"]),
                         ("ok", None))
        self.assertEqual(healthy["reason"], "媒体工具可执行，AV1 软件解码器可用")

    def test_components_cover_the_five_faces_and_health_hides_the_details(self):
        with patch.object(diagnostics, "binary_diagnostics", return_value=TOOLS_OK), \
             patch.object(diagnostics, "FFmpegResolver"), \
             patch.object(diagnostics.shutil, "which", return_value=None):
            checks = diagnostics.component_checks(self.settings, EMPTY_DRIVES, config=self.config)
            public = diagnostics.health_components(self.settings, EMPTY_DRIVES)
        self.assertEqual(set(checks), {"database", "schema", "configured", "drives", "security", "ffmpeg"})
        self.assertEqual(set(public), set(checks))
        self.assertTrue(all(set(value) == {"status", "reason"} for value in public.values()))
        self.assertNotIn(str(self.root), json.dumps(public, ensure_ascii=False))

    def test_health_skips_config_validation_and_tool_inspection(self):
        with patch.object(diagnostics, "binary_diagnostics") as inspect, \
             patch.object(diagnostics.settings_file, "load_config") as load, \
             patch.object(diagnostics, "FFmpegResolver") as resolver, \
             patch.object(diagnostics.shutil, "which", return_value=None):
            resolver.return_value.ffmpeg.return_value = None
            resolver.return_value.ffprobe.return_value = None
            diagnostics.health_components(self.settings, CONNECTED)
        inspect.assert_not_called()
        load.assert_not_called()

    def test_the_report_rolls_the_worst_state_up_and_carries_its_parts(self):
        with patch.object(diagnostics, "binary_diagnostics", return_value=TOOLS_OK), \
             patch.object(diagnostics, "FFmpegResolver"), \
             patch.object(diagnostics.shutil, "which", return_value=None), \
             patch.object(diagnostics, "port_status",
                          return_value=diagnostics.item("端口", "ok", "端口可用")):
            report = self.report(drives=CONNECTED)
        self.assertEqual(report["status"], "failed", "库里没有表，数据库与迁移两格都该失败")
        self.assertEqual(set(report), {"version", "status", "checks", "library", "sources"})
        self.assertEqual(set(report["checks"]),
                         {"database", "schema", "configured", "drives", "security", "ffmpeg",
                          "data_root", "port", "tasks", "version"})
        self.assertEqual(report["checks"]["version"]["status"], "ok")

    def test_a_warning_only_report_stays_at_warning(self):
        with patch.object(diagnostics, "binary_diagnostics", return_value=TOOLS_OK), \
             patch.object(diagnostics, "FFmpegResolver"), \
             patch.object(diagnostics.shutil, "which", return_value=None), \
             patch.object(diagnostics, "port_status",
                          return_value=diagnostics.item("端口", "ok", "端口可用")):
            report = self.report(settings=self.settings_for(host="0.0.0.0", token=""), drives=CONNECTED)
        self.assertEqual(report["checks"]["security"]["status"], "warning")
        self.assertIn(report["status"], {"warning", "failed"})

    def test_an_empty_ledger_with_nothing_recorded_reports_no_task_failure(self):
        sqlite3.connect(self.db).close()
        from peach.migrations import upgrade
        upgrade(self.db, Path(__file__).resolve().parents[1] / "migrations")
        result = diagnostics.recent_failure(self.db)
        self.assertEqual((result["status"], result["reason"]), ("ok", "没有已记录的任务失败"))

    def test_a_missing_ledger_leaves_the_task_check_unknown(self):
        self.assertEqual(diagnostics.recent_failure(self.root / "absent.db")["status"], "unknown")

    def test_the_data_root_check_proves_it_can_write(self):
        self.assertEqual(diagnostics.writable_root(self.root)["status"], "ok")
        blocked = self.root / "absent"
        self.assertEqual(diagnostics.writable_root(blocked)["status"], "failed")

    def test_the_doctor_endpoint_is_the_configured_listener(self):
        self.assertEqual(diagnostics.doctor_endpoint(self.config), ("127.0.0.1", 8900))
        self.assertEqual(diagnostics.doctor_endpoint(
            replace(self.config, server=ServerSettings(host="0.0.0.0", port=0))), ("0.0.0.0", 0))


if __name__ == "__main__":
    unittest.main()
