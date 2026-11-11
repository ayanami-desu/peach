"""任务中心「需要处理」的数据源：每个后台服务各自的判据、时间口径与互不牵连。"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from peach.background_issues import IssueLog  # noqa: E402
from peach.metadata_amane import bridge_python  # noqa: E402
from support.amane import write_amane_metadata  # noqa: E402


class Clock:
    def __init__(self):
        self.now = 1_790_000_000.0

    def __call__(self):
        return self.now


def keys(rows):
    return [row["key"] for row in rows]


def write_bridge_python(tools):
    python = bridge_python(tools)
    python.parent.mkdir(parents=True)
    python.write_bytes(b"")


class BackgroundIssueTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.clock = Clock()
        self.log = IssueLog(self.clock)
        # amane 桥装好的样子，其余用例才不会被它多出来的一项干扰。
        self.tools = self.root / "tools"
        write_bridge_python(self.tools)
        write_amane_metadata(self.tools, ready=True)
        self.contract = SimpleNamespace(tools_root=self.tools, follow_scheduler=None,
                                        feed_scheduler=None)
        self.state = SimpleNamespace()

    def collect(self, config=None):
        return self.log.collect(self.state, self.contract, config)

    def test_nothing_assembled_means_nothing_to_handle(self):
        self.assertEqual(self.log.collect(SimpleNamespace(), SimpleNamespace(), None), [])
        self.assertEqual(self.collect(), [])

    def test_a_row_carries_the_moment_this_process_first_noticed_it(self):
        from peach.background_issues import Issue

        live = {"on": True}

        def provider(_state, _contract, _config):
            return [Issue("probe", "某一项失败了", "/settings", "打开设置")] if live["on"] else []

        [row] = self.log.collect(self.state, self.contract, None, providers=[provider])
        noticed = row["noticed_at"]
        self.assertEqual((row["key"], row["since"], row["retry"]), ("probe", None, None))
        self.clock.now += 600
        self.assertEqual([item["noticed_at"] for item in
                          self.log.collect(self.state, self.contract, None, providers=[provider])], [noticed])
        # 消失过一次再出现，是新的一段：重新计。
        live["on"] = False
        self.assertEqual(self.log.collect(self.state, self.contract, None, providers=[provider]), [])
        live["on"] = True
        self.assertNotEqual(
            self.log.collect(self.state, self.contract, None, providers=[provider])[0]["noticed_at"], noticed)

    def test_a_broken_provider_does_not_take_the_others_down(self):
        from peach.background_issues import Issue

        def broken(_state, _contract, _config):
            raise RuntimeError("boom")

        def fine(_state, _contract, _config):
            return [Issue("probe", "某一项失败了", "/settings", "打开设置")]

        self.assertEqual(keys(self.log.collect(self.state, self.contract, None,
                                               providers=[broken, fine])), ["probe"])

    def test_a_missing_amane_bridge_can_be_rebuilt_in_place_unless_a_rebuild_is_running(self):
        self.contract.tools_root = self.root / "empty-tools"
        job = {"status": "idle"}
        self.contract.amane_bridge_job = SimpleNamespace(snapshot=lambda: job)
        [row] = self.collect()
        self.assertEqual((row["key"], row["href"], row["link_label"], row["retry"], row["retry_available"]),
                         ("amane-bridge", "/sources#amane", "打开 amane 设置",
                          "/api/scraping/amane-bridge/rebuild", True))
        job["status"] = "running"
        self.assertFalse(self.collect()[0]["retry_available"])
        job["status"] = "idle"
        self.state.sync = SimpleNamespace(read_only=True)
        self.assertFalse(self.collect()[0]["retry_available"])

    def test_a_venv_left_by_a_failed_rebuild_still_needs_the_bridge(self):
        self.contract.tools_root = self.root / "half-built-tools"
        write_bridge_python(self.contract.tools_root)
        self.assertEqual(keys(self.collect()), ["amane-bridge"])

    def test_a_failed_face_model_download_points_at_its_card_and_can_be_retried(self):
        latest: list = []
        self.contract.task_runs = SimpleNamespace(query=lambda **_: list(latest), available=lambda: True)
        # 还没取过：下次用到时会自己去取，不算问题。
        self.assertEqual(self.collect(), [])
        latest.append(SimpleNamespace(id=42, active=False, status="failed",
                                      finished_at="2026-10-22T08:00:00Z", error="连不上 GitHub"))
        [row] = self.collect()
        self.assertEqual({key: row[key] for key in ("key", "href", "link_label", "since", "retry", "retry_available")}, {
            "key": "face-models", "href": "/tasks#run-42", "link_label": "查看失败记录",
            "since": "2026-10-22T08:00:00Z", "retry": "/api/face-models", "retry_available": True})
        self.assertNotIn("连不上 GitHub", json.dumps(row, ensure_ascii=False))
        # 重新下载在跑时这一行先收起。
        latest[0] = SimpleNamespace(id=43, active=True, status="running", finished_at=None, error="")
        self.assertEqual(self.collect(), [])

    def test_one_broken_service_does_not_hide_the_others(self):
        def broken():
            raise RuntimeError("状态文件读坏了")
        self.contract.follow_scheduler = SimpleNamespace(status=broken)
        self.contract.tools_root = self.root / "empty-tools"
        with self.assertLogs("peach.background_issues", level="ERROR"):
            self.assertEqual(keys(self.collect()), ["amane-bridge"])


if __name__ == "__main__":
    unittest.main()
