"""「想要」的接口与入口：清单读写、Feed 卡与关注条目上的想要、互斥、取资料任务（ADR-0090）。"""
from __future__ import annotations

import io
import sys
import tempfile
import traceback
import unittest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from peach import feed_followup, wants, web_wants  # noqa: E402
from peach.web_contract import WebContract  # noqa: E402
from peach.web_router import dispatch_api_get, dispatch_api_post  # noqa: E402
from support.ledger import fresh_ledger  # noqa: E402


class WantWebFixture(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.contract = WebContract(fresh_ledger(self.temporary.name))
        self.addCleanup(self.contract.stop_background_jobs)
        self.contract.followups.stop()
        self.contract.cover_root = Path(self.temporary.name).resolve() / "covers"
        self.contract.follow_secrets_root = Path(self.temporary.name).resolve() / 'secrets'
        detector = Mock()
        detector.detect.return_value = []
        self.enterContext(patch('peach.cover_artwork._default_detector', return_value=detector))
        # 图像扩展在测试线程初始化，后台等待只覆盖资料与封面任务。
        from peach.face_detect import decode
        try:
            decode(self._fetch_cover(self.contract, 'DEMO-001')[0])
        except ImportError:
            pass
        # 取资料与取图都替掉：番号是假的，配额是真的。
        self.collected: list[str] = []
        self.collect_misses: set[str] = set()
        original_collect, original_fetch = feed_followup.collect, feed_followup.fetch_cover
        feed_followup.collect = self._collect
        feed_followup.fetch_cover = self._fetch_cover
        self.addCleanup(lambda: setattr(feed_followup, "collect", original_collect))
        self.addCleanup(lambda: setattr(feed_followup, "fetch_cover", original_fetch))
        original_provider = web_wants._provider
        web_wants._provider = lambda contract: (lambda: None)
        self.addCleanup(lambda: setattr(web_wants, "_provider", original_provider))

    def _collect(self, provider, code):
        self.collected.append(code)
        if code in self.collect_misses:
            raise ValueError("来源链上都没有这个番号的资料")
        return ({"title": f"{code} 的标题", "studio": "示例厂牌", "release_date": "2026-09-20",
                 "performers": [{"name": "深田えいみ"}]}, "https://images.example.test/cover.jpg")

    def _fetch_cover(self, contract, code, cover_url=None):
        from PIL import Image
        buffer = io.BytesIO()
        Image.new("RGB", (800, 538), (40, 40, 40)).save(buffer, format="JPEG")
        return buffer.getvalue(), (800, 538), {"code": code, "source": "test"}

    def get(self, path="/api/wants", **args):
        return dispatch_api_get(self.contract, path, args)

    def post(self, path, body):
        return dispatch_api_post(self.contract, path, body)

    def settle(self):
        thread = self.contract.want_job.thread
        if thread is not None:
            thread.join(10)
            frame = sys._current_frames().get(thread.ident)
            self.assertFalse(thread.is_alive(), {
                'job': self.contract.want_job.snapshot(),
                'stack': ''.join(traceback.format_stack(frame)) if frame else '',
            })

    def execute(self, sql, params=()):
        with self.contract.database.write_transaction() as connection:
            connection.execute(sql, params)

    def shell(self, discovery_id=5, code="HMN-071", ignored=None):
        self.execute(
            "INSERT INTO feed_discovery(id,code,title,cover_url,release_date,discovered_at,scraped_at,ignored_at)"
            " VALUES(?,?,'作品标题','https://images.example.test/c.jpg','2026-09-20','x','x',?)",
            (discovery_id, code, ignored))

    def follow_item(self, item_id=9, status="new"):
        self.execute("INSERT OR IGNORE INTO follow_source(id,provider,ref,label,url,semantics,created_at,"
                     "updated_at) VALUES(2,'rule34video','r34/1','Creator','https://rule34video.com/u',"
                     "'work','x','x')")
        self.execute("INSERT INTO follow_item(id,source_id,external_id,title,url,media_url,release_key,"
                     "status,first_seen_at,last_seen_at) VALUES(?,2,?,'帖子标题',"
                     "'https://rule34video.com/video/9/x/','https://rule34video.com/get_file/9.mp4',"
                     "'r',?,'x','x')", (item_id, str(item_id), status))


class WantListTests(WantWebFixture):
    def test_a_missing_cover_is_counted_when_the_metadata_succeeds(self):
        with patch.object(feed_followup, 'ensure_cover', return_value=False):
            self.post('/api/wants', {'action': 'add', 'code': 'SSIS-952'})
            self.settle()
        summary = self.contract.task_runs.query(task_key='want-scrape')[0].result_summary
        self.assertEqual((summary['fetched'], summary['covers'], summary['incomplete']), (1, 0, 1))

    def test_adding_a_typed_code_fetches_its_details_and_cover(self):
        result = self.post("/api/wants", {"action": "add", "code": "ssis950"})
        self.settle()
        self.assertTrue(result["created"])
        self.assertEqual(self.collected, ["SSIS-950"])
        listed = self.get()
        item = listed["items"][0]
        self.assertEqual((item["code"], item["title"], item["studio"], item["performers"], item["phase"]),
                         ("SSIS-950", "SSIS-950 的标题", "示例厂牌", "深田えいみ", wants.SEARCHING))
        self.assertEqual((item["cover"], item["remote_cover"]), ("/cover?code=SSIS-950&thumb=1", False))
        self.assertTrue((self.contract.cover_root / "SSIS-950.jpg").is_file())
        self.assertEqual(self.contract.task_runs.query(task_key='want-scrape')[0].result_summary['incomplete'], 0)
        self.assertEqual(listed["counts"], {"searching": 1, "unreleased": 0, "given_up": 0, "acquired": 0})

    def test_a_failed_lookup_is_recorded_and_retried_only_after_the_interval(self):
        self.collect_misses.add("SSIS-951")
        self.post("/api/wants", {"action": "add", "code": "SSIS-951"})
        self.settle()
        item = self.get()["items"][0]
        self.assertEqual(item["scrape_error"], "来源链上都没有这个番号的资料")
        self.assertEqual(self.contract.task_runs.query(task_key='want-scrape')[0].result_summary['incomplete'], 1)
        with self.contract.database.read_connection() as connection:
            self.assertEqual(web_wants.backlog(connection, self.contract.cover_root), [])
            later = datetime.now(timezone.utc) + web_wants.RETRY_AFTER + timedelta(minutes=1)
            self.assertEqual(web_wants.backlog(connection, self.contract.cover_root, now=later), [item["id"]])

    def test_a_code_already_in_the_library_or_unreadable_text_is_refused(self):
        self.execute("INSERT INTO asset(id,location,path,name,medium,code) VALUES(1,'local','R:\\a.mp4',"
                     "'a.mp4','video','ABP-123')")
        with self.assertRaisesRegex(ValueError, "已经在库里"):
            self.post("/api/wants", {"action": "add", "code": "ABP-123"})
        with self.assertRaisesRegex(ValueError, "认不出番号"):
            self.post("/api/wants", {"action": "add", "code": "hello"})
        with self.assertRaisesRegex(ValueError, "unknown want action"):
            self.post("/api/wants", {"action": "drop", "ids": [1]})

    def test_remove_and_reset_act_on_the_listed_ids(self):
        first = self.post("/api/wants", {"action": "add", "code": "ABP-100"})["want"]["id"]
        second = self.post("/api/wants", {"action": "add", "code": "ABP-101"})["want"]["id"]
        self.settle()
        self.execute("UPDATE want_item SET state='given_up',search_count=3,given_up_at='x' WHERE id=?",
                     (second,))
        self.assertEqual(self.post("/api/wants", {"action": "reset", "ids": [second]})["affected"], 1)
        self.assertEqual(self.post("/api/wants", {"action": "remove", "ids": [first]})["affected"], 1)
        self.assertEqual([(item["id"], item["phase"], item["search_count"]) for item in self.get()["items"]],
                         [(second, wants.SEARCHING, 0)])


class FeedEntryTests(WantWebFixture):
    def wanted(self):
        return {item["id"]: item["wanted"] for item in self.get("/api/feeds/discoveries", state="all")["items"]}

    def test_a_feed_card_can_be_wanted_and_unwanted(self):
        self.shell()
        self.assertEqual(self.wanted(), {5: False})
        self.post("/api/feeds/discovery", {"action": "want", "ids": [5]})
        self.settle()
        self.assertEqual(self.wanted(), {5: True})
        item = self.get()["items"][0]
        self.assertEqual((item["origin"], item["title"]), ("feed", "作品标题"))
        self.post("/api/feeds/discovery", {"action": "unwant", "ids": [5]})
        self.assertEqual(self.get()["items"], [])

    def test_ignoring_a_feed_card_drops_its_want_and_wanting_lifts_the_ignore(self):
        self.shell()
        self.post("/api/feeds/discovery", {"action": "want", "ids": [5]})
        self.post("/api/feeds/discovery", {"action": "ignore", "ids": [5]})
        self.assertEqual(self.get()["items"], [])
        self.post("/api/feeds/discovery", {"action": "want", "ids": [5]})
        self.settle()
        self.assertEqual(self.get("/api/feeds/discoveries", state="ignored")["items"], [])
        self.assertEqual(self.wanted(), {5: True})


class FollowEntryTests(WantWebFixture):
    def test_a_follow_item_can_be_wanted_and_ignoring_it_drops_the_want(self):
        self.follow_item(status="ignored")
        self.assertIsNone(self.get(follow="9")["want"])
        want = self.post("/api/wants", {"action": "add", "follow": 9})["want"]
        self.assertEqual((want["origin"], want["follow_item_id"], want["follow_provider"]),
                         ("follow", 9, "rule34video"))
        self.assertEqual(self.get(follow="9")["want"]["id"], want["id"])
        self.assertEqual([row["id"] for row in self.get(follow="abc")["items"]], [want["id"]])
        self.post("/api/follow/status", {"item": 9, "to": "ignored"})
        self.assertIsNone(self.get(follow="9")["want"])

    def test_saving_a_wanted_follow_item_marks_it_acquired(self):
        self.follow_item()
        self.post("/api/wants", {"action": "add", "follow": 9})
        saved = self.post("/api/follow/save", {"item": 9})
        item = self.get(follow="9")["want"]
        self.assertEqual((item["phase"], item["acquired_asset_id"]), (wants.ACQUIRED, saved["asset_id"]))


if __name__ == "__main__":
    unittest.main()
