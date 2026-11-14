"""已消失行的个人记录接到重新登记的行上：两条判据、时长最近的取舍、搬运范围与守卫。"""
from __future__ import annotations

import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from peach import record_rehome
from support.ledger import fresh_ledger

VANISHED = "vanished"


class RehomeTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.db = fresh_ledger(self.root)

    # —— 夹具 ————————————————————————————————————————————————

    def write(self, statements):
        with closing(sqlite3.connect(self.db)) as connection:
            for sql, params in statements:
                connection.execute(sql, params)
            connection.commit()

    def asset(self, asset_id, name, *, path=None, code=None, creator="", duration=None,
              disposal=None, location="gdrive", root="root-1", **extra):
        columns = ["id", "location", "path", "name", "medium", "size", "code", "creator",
                   "duration", "disposal", "drive_root"]
        values = [asset_id, location, path or f"{location}:/Media/{asset_id}/{name}", name, "video", 1024,
                  code, creator, duration, disposal, root]
        for column, value in extra.items():
            columns.append(column)
            values.append(value)
        sql = (f"INSERT INTO asset({','.join(columns)})"
               f" VALUES({','.join('?' * len(columns))})")
        self.write([(sql, values)])
        return asset_id

    def vanished(self, asset_id, name, **kwargs):
        return self.asset(asset_id, name, disposal=VANISHED, **kwargs)

    def records(self, asset_id):
        """五张引用表各留一条，验证整组都改指新行。"""
        self.write([
            ("INSERT INTO asset_preference(profile_id,asset_id,liked,source,updated_at)"
             " VALUES('p1',?,1,'manual','2026-01-01 00:00:00')", (asset_id,)),
            ("INSERT INTO watch_queue(profile_id,asset_id,added_at,source)"
             " VALUES('p1',?,'2026-01-01 00:00:00','manual')", (asset_id,)),
            ("INSERT INTO playlist(id,profile_id,name,current_asset_id,created_at,updated_at)"
             " VALUES(5,'p1','清单',?,'x','x')", (asset_id,)),
            ("INSERT INTO playlist_item(playlist_id,asset_id,position,added_at) VALUES(5,?,0,'x')",
             (asset_id,)),
            ("INSERT INTO activity_event(id,asset_id,profile_id,kind,occurred_at,source,event_key)"
             " VALUES(11,?,'p1','play','2026-01-02 00:00:00','local','k')", (asset_id,)),
            ("INSERT INTO asset_tag_preference(profile_id,asset_id,normalized_tag,hidden,updated_at)"
             " VALUES('p1',?,'tag',0,'x')", (asset_id,)),
            ("INSERT INTO asset_quality_goal(profile_id,asset_id,wanted,reason,updated_at)"
             " VALUES('p1',?,1,'想看','x')", (asset_id,)),
        ])

    def rows(self, sql, params=()):
        with closing(sqlite3.connect(self.db)) as connection:
            return connection.execute(sql, params).fetchall()

    def connect(self):
        connection = sqlite3.connect(self.db)
        connection.row_factory = sqlite3.Row
        return closing(connection)

    def reattach(self, new_ids):
        with self.connect() as connection:
            moved = record_rehome.reattach(connection, new_ids)
            connection.commit()
        return moved

    # —— 判据 ————————————————————————————————————————————————

    def test_code_key_prefers_the_code_column_and_falls_back_to_the_filename(self):
        self.assertEqual(record_rehome.code_key({"code": "ssis-950", "name": "x.mkv"}), "SSIS-950")
        self.assertEqual(record_rehome.code_key({"code": None, "name": "SSIS-950-C.mp4"}),
                         "SSIS-950")

    def test_a_file_that_came_back_under_a_new_remote_id_moves_the_records(self):
        self.vanished(7, "SSIS-950.mp4", code="SSIS-950", duration=7200.0,
                      rating=1, o_count=2, play_count=3, last_played="2026-01-01 00:00:00")
        self.records(7)
        new_id = self.asset(9, "SSIS-950.mp4", code="SSIS-950", duration=7200.0, remote_id="file-9")
        self.assertEqual(self.reattach([new_id]), [7])
        self.assertEqual(self.rows("SELECT id FROM asset"), [(9,)])
        self.assertEqual(sorted(row[0] for row in self.rows("SELECT asset_id FROM asset_preference")), [9])
        self.assertEqual(sorted(row[0] for row in self.rows("SELECT asset_id FROM watch_queue")), [9])
        self.assertEqual(sorted(row[0] for row in self.rows("SELECT asset_id FROM activity_event")), [9])
        self.assertEqual(sorted(row[0] for row in self.rows("SELECT asset_id FROM asset_tag_preference")), [9])
        self.assertEqual(self.rows("SELECT asset_id FROM playlist_item"), [(9,)])
        self.assertEqual(self.rows("SELECT current_asset_id FROM playlist"), [(9,)])
        # 找到更好版本的目标搬到新行后关掉。
        self.assertEqual(self.rows("SELECT asset_id, wanted FROM asset_quality_goal"), [(9, 0)])
        self.assertIsNotNone(self.rows("SELECT replaced_at FROM asset_quality_goal")[0][0])
        self.assertEqual(self.rows("SELECT rating, o_count, play_count, last_played FROM asset WHERE id=9"),
                         [(1, 2, 3, "2026-01-01 00:00:00")])

    def test_the_new_row_keeps_its_own_rating_and_adds_up_the_counts(self):
        self.vanished(7, "ABC-123.mp4", code="ABC-123", rating=1, o_count=2, play_count=3,
                      last_played="2026-01-03 00:00:00")
        new_id = self.asset(9, "ABC-123.mp4", code="ABC-123", rating=0, o_count=1,
                            play_count=4, last_played="2026-01-05 00:00:00")
        self.reattach([new_id])
        self.assertEqual(self.rows("SELECT rating, o_count, play_count, last_played FROM asset WHERE id=9"),
                         [(0, 3, 7, "2026-01-05 00:00:00")])

    def test_two_versions_of_the_same_code_take_the_closest_duration(self):
        self.vanished(7, "DEF-200.mp4", code="DEF-200", duration=3600.0)
        self.records(7)
        near = self.asset(8, "DEF-200.mp4", code="DEF-200", duration=3602.0)
        far = self.asset(9, "DEF-200 4K.mp4", code="DEF-200", duration=5400.0)
        self.assertEqual(self.reattach([near, far]), [7])
        self.assertEqual(self.rows("SELECT asset_id FROM asset_preference"), [(8,)])

    def test_a_tie_or_a_missing_duration_leaves_the_orphan_for_a_person(self):
        self.vanished(7, "GHI-300.mp4", code="GHI-300", duration=3600.0)
        left = self.asset(8, "GHI-300 a.mp4", code="GHI-300", duration=3601.0)
        right = self.asset(9, "GHI-300 b.mp4", code="GHI-300", duration=3599.0)
        self.assertEqual(self.reattach([left, right]), [])
        self.assertEqual(len(self.rows("SELECT id FROM asset")), 3)

    def test_two_old_rows_with_one_code_are_left_alone(self):
        self.vanished(7, "JKL-400.mp4", code="JKL-400", duration=3600.0)
        self.vanished(8, "JKL-400.mp4", code="JKL-400", duration=3600.0)
        new_id = self.asset(9, "JKL-400.mp4", code="JKL-400", duration=3600.0)
        self.assertEqual(self.reattach([new_id]), [])
        self.assertEqual(len(self.rows("SELECT id FROM asset")), 3)

    def test_a_creator_video_without_a_code_matches_creator_folder_and_duration(self):
        self.vanished(7, "studio clip.mp4", creator="创作者甲", duration=120.0,
                      path="gdrive:/Media/创作者甲/studio clip.mp4")
        new_id = self.asset(9, "studio clip.mp4", duration=121.0,
                            path="gdrive:/Media/创作者甲/重传/studio clip.mp4")
        self.assertEqual(self.reattach([new_id]), [7])

    def test_a_creator_video_under_another_creator_is_not_matched(self):
        self.vanished(7, "clip.mp4", creator="创作者甲", duration=120.0,
                      path="gdrive:/Media/创作者甲/clip.mp4")
        new_id = self.asset(9, "clip.mp4", duration=120.0,
                            path="gdrive:/Media/创作者乙/clip.mp4")
        self.assertEqual(self.reattach([new_id]), [])

    # —— 守卫 ————————————————————————————————————————————————

    def test_move_refuses_a_row_that_did_not_vanish_and_a_row_that_did(self):
        live = self.asset(7, "MNO-500.mp4", code="MNO-500")
        gone = self.vanished(8, "MNO-500.mp4", code="MNO-500")
        with self.connect() as connection:
            with self.assertRaises(ValueError):
                record_rehome.move(connection, live, gone)
            with self.assertRaises(ValueError):
                record_rehome.move(connection, gone, gone)
            record_rehome.move(connection, gone, live)
            connection.commit()
        self.assertEqual(self.rows("SELECT id FROM asset"), [(7,)])

    def test_reattach_in_opens_its_own_connection_and_commits(self):
        self.vanished(7, "PQR-600.mp4", code="PQR-600")
        self.records(7)
        new_id = self.asset(9, "PQR-600.mp4", code="PQR-600")
        self.assertEqual(record_rehome.reattach_in(self.db, [new_id]), 1)
        self.assertEqual(self.rows("SELECT asset_id FROM asset_preference"), [(9,)])
        self.assertEqual(record_rehome.reattach_in(self.db, []), 0)

    def test_plan_names_the_rule_it_used(self):
        self.vanished(7, "STU-700.mp4", code="STU-700")
        by_code = self.asset(9, "STU-700.mp4", code="STU-700")
        self.vanished(10, "clip.mp4", creator="创作者甲", duration=60.0,
                      path="gdrive:/Media/创作者甲/clip.mp4")
        by_creator = self.asset(11, "clip.mp4", duration=60.0,
                                path="gdrive:/Media/创作者甲/新/clip.mp4")
        with self.connect() as connection:
            planned = record_rehome.plan(connection, [by_code, by_creator])
        self.assertEqual([(old["id"], new["id"], rule) for old, new, rule in planned],
                         [(7, 9, "code"), (10, 11, "creator-stem-duration")])


if __name__ == "__main__":
    unittest.main()
