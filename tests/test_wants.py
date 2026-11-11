"""「想要」清单的数据层：登记、与屏蔽互斥、入库对账与撤回、查找状态（ADR-0090）。

对账那一侧直接往账本里写登记行，再用 `wants.reconcile` 判命中：扫描只负责把新行交给它，
这里验的是交接之后怎么落库。
"""
from __future__ import annotations

import importlib.util
import io
import sqlite3
import tempfile
import unittest
from contextlib import closing, redirect_stdout
from datetime import date
from pathlib import Path

from peach import wants
from peach.migrations import upgrade

ROOT = Path(__file__).resolve().parents[1]
TODAY = date(2026, 10, 1)


class WantFixture(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.db = self.root / "ledger.db"
        upgrade(self.db, ROOT / "migrations")

    def write(self, fn):
        with closing(sqlite3.connect(self.db)) as connection:
            result = fn(connection)
            connection.commit()
        return result

    def query(self, sql, params=()):
        with closing(sqlite3.connect(self.db)) as connection:
            return connection.execute(sql, params).fetchall()

    def register(self, asset_id, name, *, code=None):
        """扫描登记那一刻的样子：番号还空着，只有文件名与远端 id。"""
        self.write(lambda connection: connection.execute(
            "INSERT INTO asset(id,location,path,name,medium,size,code,remote_id,drive_root)"
            " VALUES(?,'gdrive',?,?,'video',10,?,?, 'root-1')",
            (asset_id, f"gdrive:/Media/{name}", name, code, f"file-{asset_id}")))
        return asset_id

    def reconcile(self, *asset_ids):
        return self.write(lambda connection: wants.reconcile(connection, list(asset_ids)))

    def add_asset(self, asset_id, code, *, disposal=None):
        self.write(lambda connection: connection.execute(
            "INSERT INTO asset(id,location,path,name,medium,size,code,disposal)"
            " VALUES(?,'local',?,?,'video',10,?,?)",
            (asset_id, f"R:\\media\\old\\{code}.mp4", f"{code}.mp4", code, disposal)))

    def add_follow_item(self, item_id=9, status="new"):
        def insert(connection):
            connection.execute(
                "INSERT OR IGNORE INTO follow_source(id,provider,ref,label,url,semantics,created_at,updated_at)"
                " VALUES(2,'rule34video','r34/1','Creator','https://rule34video.com/u','work','x','x')")
            connection.execute(
                "INSERT INTO follow_item(id,source_id,external_id,title,url,release_key,status,"
                "published_at,first_seen_at,last_seen_at) VALUES(?,2,?,'帖子标题',"
                "'https://rule34video.com/video/9/x/','r',?,'2026-09-20T10:00:00Z','x','x')",
                (item_id, str(item_id), status))
        self.write(insert)


class RegisterTests(WantFixture):
    def test_a_typed_code_is_normalised_and_registered_once(self):
        first = self.write(lambda connection: wants.add_code(connection, "ssis00950"))
        again = self.write(lambda connection: wants.add_code(connection, "SSIS-950"))
        self.assertTrue(first["created"])
        self.assertFalse(again["created"])
        self.assertEqual(again["id"], first["id"])
        self.assertEqual(self.query("SELECT code,code_key,origin,state FROM want_item"),
                         [("SSIS-950", "SSIS-950", "code", "wanted")])

    def test_text_without_a_code_is_refused(self):
        with self.assertRaisesRegex(ValueError, "认不出番号"):
            self.write(lambda connection: wants.add_code(connection, "hello"))

    def test_a_code_already_in_the_library_is_refused_but_a_vanished_one_is_not(self):
        self.add_asset(1, "ABP-123")
        self.add_asset(2, "ABP-124", disposal="vanished")
        with self.assertRaisesRegex(ValueError, "已经在库里"):
            self.write(lambda connection: wants.add_code(connection, "abp123"))
        self.assertTrue(self.write(lambda connection: wants.add_code(connection, "ABP-124"))["created"])

    def test_wanting_a_feed_shell_takes_its_details_and_lifts_its_ignore(self):
        self.write(lambda connection: connection.execute(
            "INSERT INTO feed_discovery(id,code,title,link,cover_url,release_date,studio,performers,"
            "discovered_at,ignored_at) VALUES(5,'HMN-071','作品标题','https://javdb.com/v/Ab1',"
            "'https://images.example.test/c.jpg','2026-09-20','示例厂牌','深田えいみ','x','x')"))
        row = self.write(lambda connection: wants.add_feed(connection, 5))
        self.assertEqual((row["origin"], row["title"], row["link"], row["studio"], row["release_date"]),
                         ("feed", "作品标题", "https://javdb.com/v/Ab1", "示例厂牌", "2026-09-20"))
        self.assertEqual(self.query("SELECT ignored_at FROM feed_discovery"), [(None,)])

    def test_ignoring_a_feed_shell_drops_its_want_but_not_an_acquired_one(self):
        self.write(lambda connection: wants.add_code(connection, "HMN-071"))
        self.write(lambda connection: wants.add_code(connection, "HMN-072"))
        self.write(lambda connection: connection.execute(
            "UPDATE want_item SET state='acquired' WHERE code_key='HMN-072'"))
        dropped = self.write(lambda connection: wants.drop_codes(connection, ["hmn071", "HMN-072"]))
        self.assertEqual(dropped, 1)
        self.assertEqual(self.query("SELECT code_key FROM want_item"), [("HMN-072",)])

    def test_wanting_an_ignored_follow_item_brings_it_back_and_ignoring_drops_it(self):
        self.add_follow_item(status="ignored")
        row = self.write(lambda connection: wants.add_follow(connection, 9))
        self.assertEqual((row["origin"], row["follow_item_id"], row["title"], row["release_date"]),
                         ("follow", 9, "帖子标题", "2026-09-20"))
        self.assertEqual(self.query("SELECT status FROM follow_item"), [("seen",)])
        self.assertEqual(self.write(lambda connection: wants.drop_follow_items(connection, [9])), 1)
        self.assertEqual(self.query("SELECT count(*) FROM want_item"), [(0,)])


class ReconcileTests(WantFixture):
    def test_a_registration_marks_the_want_acquired_with_source_and_batch(self):
        self.write(lambda connection: wants.add_code(connection, "SSIS-950"))
        asset_id = self.register(7, "SSIS-950.mp4")
        self.register(8, "OTHER-001.mp4")
        self.assertEqual(self.reconcile(7, 8), [1])
        state, acquired_asset, source, batch = self.query(
            "SELECT state,acquired_asset_id,acquired_source,acquired_batch FROM want_item")[0]
        self.assertEqual((state, acquired_asset, source), ("acquired", asset_id, wants.AUTO_SOURCE))
        self.assertTrue(batch.startswith(wants.AUTO_SOURCE + "@"))

    def test_a_row_that_already_left_the_library_is_not_counted(self):
        self.write(lambda connection: wants.add_code(connection, "ABW-358"))
        self.register(7, "ABW-358.mp4")
        self.write(lambda connection: connection.execute(
            "UPDATE asset SET disposal='vanished' WHERE id=7"))
        self.assertEqual(self.reconcile(7), [])
        self.assertEqual(self.query("SELECT state FROM want_item"), [("wanted",)])

    def test_a_want_that_is_already_acquired_is_left_alone(self):
        self.write(lambda connection: wants.add_code(connection, "SSIS-952"))
        self.write(lambda connection: connection.execute(
            "UPDATE want_item SET state='acquired', acquired_asset_id=99"))
        self.register(7, "SSIS-952.mp4")
        self.assertEqual(self.reconcile(7), [])
        self.assertEqual(self.query("SELECT acquired_asset_id FROM want_item"), [(99,)])

    def test_saving_a_follow_item_reconciles_its_want(self):
        self.add_follow_item()
        self.write(lambda connection: wants.add_follow(connection, 9))
        self.add_asset(40, "X")
        self.write(lambda connection: connection.execute("UPDATE follow_item SET asset_id=40"))
        self.assertEqual(self.write(lambda connection: wants.reconcile(connection, [40])), [1])
        self.assertEqual(self.query("SELECT state,acquired_asset_id FROM want_item"), [("acquired", 40)])

    def test_revert_puts_the_batch_back_to_searching(self):
        self.write(lambda connection: wants.add_code(connection, "SSIS-950"))
        self.write(lambda connection: wants.add_code(connection, "SSIS-951"))
        self.write(lambda connection: connection.execute(
            "UPDATE want_item SET state='given_up',given_up_at='x',search_count=3 WHERE code_key='SSIS-951'"))
        self.register(7, "SSIS-950.mp4")
        self.register(8, "SSIS-951.mp4")
        self.reconcile(7, 8)
        with closing(sqlite3.connect(self.db)) as connection:
            planned = wants.planned_revert(connection, wants.AUTO_SOURCE)
            self.assertEqual(wants.planned_revert(connection, "user:other"), [])
        self.assertEqual([item["code"] for item in planned], ["SSIS-950", "SSIS-951"])
        spec = importlib.util.spec_from_file_location(
            "revert_auto_landing_under_test", ROOT / "scripts" / "revert_auto_landing.py")
        script = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(script)
        with redirect_stdout(io.StringIO()) as printed:
            self.assertEqual(script.main([
                "--db", str(self.db), "--logo-root", str(self.root / "logos"),
                "--source", wants.AUTO_SOURCE, "--batch", planned[0]["acquired_batch"],
                "--apply", "--backup", str(self.root / "backup.db")]), 0)
        self.assertIn("'想要回到待找': 2", printed.getvalue())
        self.assertEqual(self.query(
            "SELECT code,state,search_count,acquired_asset_id,acquired_batch FROM want_item ORDER BY id"),
            [("SSIS-950", "wanted", 0, None, None), ("SSIS-951", "given_up", 3, None, None)])


class SearchStateTests(WantFixture):
    def want(self, code, release_date):
        row = self.write(lambda connection: wants.add_code(connection, code))
        self.write(lambda connection: connection.execute(
            "UPDATE want_item SET release_date=? WHERE id=?", (release_date, row["id"])))
        return row["id"]

    def record(self, want_id, outcome):
        return self.write(lambda connection: wants.record_search(
            connection, want_id, outcome, today=TODAY))

    def test_an_old_release_gives_up_after_three_empty_searches_and_can_be_reset(self):
        want_id = self.want("ABP-100", "2025-01-01")
        self.assertEqual([self.record(want_id, "none") for _ in range(3)],
                         [wants.SEARCHING, wants.SEARCHING, wants.GIVEN_UP])
        self.assertEqual(self.query("SELECT state,search_count FROM want_item"), [("given_up", 3)])
        self.assertEqual(self.write(lambda connection: wants.reset_search(connection, [want_id])), 1)
        self.assertEqual(self.query("SELECT state,search_count,given_up_at FROM want_item"),
                         [("wanted", 0, None)])

    def test_a_missing_release_date_counts_as_an_old_release(self):
        want_id = self.want("ABP-101", None)
        for _ in range(3):
            self.record(want_id, "none")
        self.assertEqual(self.query("SELECT state FROM want_item"), [("given_up",)])

    def test_a_fresh_release_keeps_searching_and_errors_never_count(self):
        fresh = self.want("ABP-102", "2026-08-01")
        old = self.want("ABP-103", "2025-01-01")
        for _ in range(5):
            self.assertEqual(self.record(fresh, "none"), wants.SEARCHING)
            self.record(old, "error")
        self.assertEqual(self.query("SELECT search_count,state,last_search_outcome FROM want_item ORDER BY id"),
                         [(0, "wanted", "none"), (0, "wanted", "error")])

    def test_finding_something_clears_the_count(self):
        want_id = self.want("ABP-104", "2025-01-01")
        self.record(want_id, "none")
        self.record(want_id, "none")
        self.assertEqual(self.record(want_id, "found"), wants.SEARCHING)
        self.assertEqual(self.query("SELECT search_count FROM want_item"), [(0,)])

    def test_pending_targets_skip_unreleased_given_up_acquired_and_owned(self):
        old = self.want("ABP-110", "2025-01-01")
        fresh = self.want("ABP-111", "2026-09-15")
        self.want("ABP-112", "2026-12-24")
        given_up = self.want("ABP-113", "2025-01-01")
        self.write(lambda connection: connection.execute(
            "UPDATE want_item SET state='given_up' WHERE id=?", (given_up,)))
        self.want("ABP-114", "2025-01-01")
        self.add_asset(1, "ABP-114")
        self.add_follow_item()
        follow = self.write(lambda connection: wants.add_follow(connection, 9))["id"]
        with closing(sqlite3.connect(self.db)) as connection:
            targets = wants.pending_targets(connection, today=TODAY)
        self.assertEqual([target.id for target in targets], [fresh, follow, old])
        self.assertEqual([target.fresh for target in targets], [True, True, False])
        self.assertEqual((targets[1].code, targets[1].follow_url),
                         (None, "https://rule34video.com/video/9/x/"))

    def test_the_list_carries_the_follow_provider(self):
        self.add_follow_item()
        self.write(lambda connection: wants.add_follow(connection, 9))
        with closing(sqlite3.connect(self.db)) as connection:
            rows = wants.list_rows(connection)
        self.assertEqual((rows[0]["follow_provider"], rows[0]["follow_status"]), ("rule34video", "new"))

    def test_phase_reads_unreleased_from_the_release_date(self):
        row = {"state": "given_up", "release_date": "2026-12-01"}
        self.assertEqual(wants.phase(row, TODAY), wants.UNRELEASED)
        self.assertEqual(wants.phase({**row, "release_date": "2026-09-01"}, TODAY), wants.GIVEN_UP)
        self.assertEqual(wants.phase({**row, "state": "acquired"}, TODAY), wants.ACQUIRED)


if __name__ == "__main__":
    unittest.main()
