"""数据管理页的孤儿记录：列出网盘侧已消失的作品和还挂在它身上的记录。

账本建在临时目录里，不碰任何真实数据。
"""
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from peach import web_contract as rm_web
from peach.web_orphan_records import q_orphan_records

from support.ledger import fresh_ledger


class OrphanRecordsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.db = fresh_ledger(self.root)
        rows = [
            # id, 文件名, 番号, 时长, 处理态, 标弃时间
            (7, "ABC-123.mp4", "ABC-123", 3600, "vanished", 200),
            (9, "ABC-123.mkv", None, 3590, None, None),
            (12, "海边.mp4", None, 600, "vanished", 100),
            (14, "ABC-123 old.mp4", None, 3600, "trash", 50),
        ]
        with closing(sqlite3.connect(self.db)) as connection:
            connection.executemany(
                "INSERT INTO asset(id,location,path,name,medium,size,code,duration,disposal,feedback_at) "
                "VALUES(?,'gdrive',?,?,'video',10,?,?,?,?)",
                [(row[0], f"云盘/{row[1]}", row[1], *row[2:]) for row in rows])
            connection.execute("INSERT INTO asset_preference(profile_id,asset_id,liked,reason,updated_at) "
                               "VALUES('default',7,1,'','2026-01-01')")
            connection.execute("INSERT INTO watch_queue(profile_id,asset_id,added_at) VALUES('default',12,'2026-01-01')")
            connection.executemany(
                "INSERT INTO activity_event(asset_id,profile_id,kind,occurred_at,source) "
                "VALUES(7,'default','play',?,'web')", [("2026-01-01",), ("2026-01-02",)])
            connection.commit()
        self.contract = rm_web.WebContract(Path(self.db))

    def test_the_list_shows_each_vanished_row_with_the_records_still_attached(self):
        listed = q_orphan_records(self.contract)
        self.assertEqual(listed["total"], 2)
        first, second = listed["items"]
        self.assertEqual((first["id"], second["id"]), (7, 12), "标弃时间近的在前")
        self.assertEqual((first["code"], first["location"], first["vanished_at"]), ("ABC-123", "gdrive", 200))
        self.assertEqual(first["records"], {"asset_preference": 1, "activity_event": 2})
        self.assertEqual(second["records"], {"watch_queue": 1})
        self.assertEqual(second["name"], "海边.mp4")


if __name__ == "__main__":
    unittest.main()
