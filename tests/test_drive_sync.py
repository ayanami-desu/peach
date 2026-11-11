"""同步节拍：有游标追增量，一天没全量就整棵核对，手动刷新不等定时。"""
import time
import unittest

from peach import drive_sync
from peach.scan import ScanResult, ScanTargetError


class StubService:
    """只答同步状态、只记被叫了哪一次。"""

    def __init__(self, states: dict[str, dict] | None = None, failing: str = ""):
        self.roots = {location: ("root",) for location in (states or {"gdrive": {}})}
        self.states = states or {}
        self.failing = failing
        self.full: list[str] = []
        self.incremental: list[str] = []

    def sync_state(self, location: str) -> dict:
        return self.states.get(location, {"synced_at": None, "last_error": "", "cursor": None})

    def full_sync(self, location: str) -> ScanResult:
        if location == self.failing:
            raise ScanTargetError("没配扫描目录")
        self.full.append(location)
        return ScanResult(location, files=1)

    def sync_changes(self, location: str) -> ScanResult:
        self.incremental.append(location)
        return ScanResult(location, files=2)


class DriveSyncTests(unittest.TestCase):
    def sync(self, service: StubService, now: float) -> drive_sync.DriveSync:
        return drive_sync.DriveSync(service, clock=lambda: now)

    def test_first_run_does_full_when_never_synced(self):
        service = StubService({"gdrive": {"synced_at": None, "last_error": "", "cursor": None}})
        report = self.sync(service, 1_000.0).refresh("gdrive")
        self.assertTrue(report.full)
        self.assertEqual(service.full, ["gdrive"])
        self.assertEqual(report.result.files, 1)

    def test_recent_full_sync_switches_to_incremental(self):
        now = 1_780_000_000.0
        stamp = time.strftime(drive_sync._STAMP, time.localtime(now - 60.0))
        service = StubService({"gdrive": {"synced_at": stamp, "last_error": "", "cursor": "c1"}})
        report = self.sync(service, now).refresh("gdrive")
        self.assertFalse(report.full)
        self.assertEqual(service.incremental, ["gdrive"])

    def test_stale_full_sync_falls_back_to_full(self):
        service = StubService({"gdrive": {"synced_at": "2026-05-01 00:00:00", "last_error": "", "cursor": "c1"}})
        clock = drive_sync.DriveSync(service, clock=lambda: 1_780_000_000.0)
        clock.full_every = 60.0
        report = clock.refresh("gdrive")
        self.assertTrue(report.full)
        self.assertEqual(service.full, ["gdrive"])

    def test_tick_respects_interval_and_manual_request(self):
        service = StubService({"gdrive": {"synced_at": None, "last_error": "", "cursor": None},
                               "onedrive": {"synced_at": None, "last_error": "", "cursor": None}})
        clock = drive_sync.DriveSync(service, clock=lambda: 500.0, interval=900.0)
        first = clock.tick()
        self.assertEqual([report.location for report in first], ["gdrive", "onedrive"])
        self.assertEqual(clock.tick(), ())
        clock.request("onedrive")
        forced = clock.tick()
        self.assertEqual([report.location for report in forced], ["onedrive"])

    def test_scan_target_error_becomes_report_instead_of_raising(self):
        service = StubService({"gdrive": {"synced_at": None, "last_error": "", "cursor": None}},
                              failing="gdrive")
        report = self.sync(service, 10.0).refresh("gdrive")
        self.assertEqual("没配扫描目录", report.error)
        self.assertIsNone(report.result)

    def test_failed_attempt_is_not_retried_on_every_tick(self):
        service = StubService({"gdrive": {"synced_at": None, "last_error": "", "cursor": None}},
                              failing="gdrive")
        clock = drive_sync.DriveSync(service, clock=lambda: 500.0, interval=900.0)
        self.assertTrue(clock.tick()[0].error)
        self.assertEqual(clock.tick(), ())


if __name__ == "__main__":
    unittest.main()
