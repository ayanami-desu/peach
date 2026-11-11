"""同步前的只读预检：工作量按账本行统计，媒体库按扫描根筛选。"""
import sqlite3
import tempfile
import unittest
from contextlib import closing
from dataclasses import replace
from pathlib import Path

from peach.library_processing_scope import scoped_config
from peach.media_libraries import libraries
from peach.processing_inventory import InventoryPreview, preview, recent_rows, _LATEST
from peach.processing_traffic import ProcessingTraffic
from peach.settings_file import PeachConfig
from support.ledger import fresh_ledger


class InventoryTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.config = PeachConfig(self.root, self.root / 'config.toml', present=True,
                                  drive_roots={'gdrive': ('root-1',)})
        self.db = fresh_ledger(self.root)
        self.sequence = 0
        self.addCleanup(_LATEST.clear)

    def register(self, *names, root='root-1', medium='video'):
        """按网盘扫描结果的形状登记资产：远端文件 id 加扫描根，没有本机路径。"""
        ids = []
        with closing(sqlite3.connect(self.db)) as connection, connection:
            for name in names:
                self.sequence += 1
                cursor = connection.execute(
                    'INSERT INTO asset(location,path,name,medium,remote_id,drive_root) VALUES(?,?,?,?,?,?)',
                    ('gdrive', 'gdrive:/Media/' + name, name, medium, f'file-{self.sequence}', root))
                ids.append(cursor.lastrowid)
        return ids

    def names(self, *, library_id=None, asset_ids=None, stage='all'):
        """预检认下来的账本行；它们就是同步任务要处理的那批资产。"""
        session = InventoryPreview(self.config, self.db, stage, asset_ids, library_id=library_id)
        return [row['name'] for row in session.rows]

    def test_workload_counts_ledger_rows_and_reports_a_complete_preview(self):
        self.register('ABW-001.mp4', 'ABW-001-CD2.MKV', '日常.mov')
        before = self.db.read_bytes()
        result = preview(self.config, self.db, 'all', None)
        self.assertEqual(result['inventory'], {'complete': True, 'errors': 0})
        self.assertEqual(result['workload']['video_files'], 3)
        self.assertEqual(result['workload']['jav_files'], 2)
        self.assertEqual(result['workload']['jav_titles'], 1)
        self.assertGreater(result['estimated_bytes'], 0)
        self.assertEqual(self.db.read_bytes(), before)

    def test_rows_come_from_the_ledger_and_exclude_non_video_media(self):
        self.register('ABW-001.mp4', '日常.mov')
        self.register('poster.jpg', medium='image')
        result = preview(self.config, self.db, 'collect', None)
        self.assertCountEqual(self.names(stage='collect'), ['ABW-001.mp4', '日常.mov'])
        self.assertTrue(result['inventory']['complete'])
        self.assertEqual(result['workload']['video_files'], 2)

    def test_release_code_families_count_as_jav(self):
        self.register('LAF-41.mpg', 'MKBD-S94.mkv', 'MKD-S118.iso', '040221_0012.flv',
                      'IMG_3092.mpg', 'VIDEO-2022.rmvb')
        result = preview(self.config, self.db, 'all', None)
        self.assertEqual(result['workload']['video_files'], 6)
        self.assertEqual(result['workload']['jav_files'], 4)
        self.assertEqual(result['workload']['jav_titles'], 4)

    def test_trailers_are_excluded_from_the_workload(self):
        self.register('ABC-123.mp4', 'ABC-123-trailer.mp4', 'ABC-123.TRAILER.MKV', 'short.mp4')
        result = preview(self.config, self.db, 'all', None)
        self.assertCountEqual(self.names(), ['ABC-123.mp4', 'short.mp4'])
        self.assertEqual(result['workload']['video_files'], 2)
        self.assertEqual(result['workload']['jav_files'], 1)

    def test_library_preview_only_counts_its_own_scan_root(self):
        self.register('ABW-001.mp4', root='root-1')
        self.register('ABW-002.mp4', root='root-2')
        config = replace(self.config, drive_roots={'gdrive': ('root-1', 'root-2')})
        library_id = libraries(config)[0]['id']
        result = preview(scoped_config(config, library_id), self.db, 'collect', None, library_id=library_id)
        self.assertEqual(result['workload']['video_files'], 1)
        self.assertEqual([row['name'] for row in InventoryPreview(
            scoped_config(config, library_id), self.db, 'collect', None, library_id=library_id).rows],
            ['ABW-001.mp4'])
        with self.assertRaisesRegex(ValueError, '媒体库'):
            scoped_config(config, 'missing')

    def test_selected_assets_limit_the_workload(self):
        first, _second = self.register('ABW-001.mp4', 'ABW-002.mp4')
        result = preview(self.config, self.db, 'all', [first])
        self.assertEqual(result['workload']['video_files'], 1)
        self.assertEqual(self.names(asset_ids=[first]), ['ABW-001.mp4'])

    def test_incremental_preview_only_counts_pending_assets(self):
        _, second = self.register('ABW-001.mp4', 'ABW-002.mp4')
        from peach.library_new_assets import remember
        remember(self.db, [second])
        result = preview(self.config, self.db, 'all', None, incremental=True)
        self.assertTrue(result['inventory']['complete'])
        self.assertEqual(result['workload']['video_files'], 1)
        self.assertEqual([row['id'] for row in InventoryPreview(
            self.config, self.db, 'all', None, incremental=True).rows], [second])

    def test_stale_inventory_token_is_ignored(self):
        self.register('ABW-001.mp4')
        result = preview(self.config, self.db, 'scan', None, 'stale')
        self.assertNotIn('token', result['inventory'])
        self.assertTrue(result['inventory']['complete'])
        self.assertEqual(result['workload']['video_files'], 1)

    def test_recent_rows_are_empty_and_seeded_traffic_matches_the_preview(self):
        self.register('ABW-001.mp4')
        before = preview(self.config, self.db, 'all', None)
        rows = recent_rows(self.config, self.db, 'all', None)
        self.assertEqual(rows, [])
        task = ProcessingTraffic(self.config, self.db, 'all', inventory_rows=rows)
        self.assertEqual(task.snapshot()['workload'], before['workload'])
        self.assertEqual(task.snapshot()['estimated_bytes'], before['estimated_bytes'])
        self.assertEqual(recent_rows(self.config, self.db, 'scan', None), [])
        with closing(sqlite3.connect(self.db)) as connection, connection:
            connection.execute("UPDATE asset SET size=1234, duration=3600 WHERE name='ABW-001.mp4'")
        task = ProcessingTraffic(self.config, self.db, 'all', inventory_rows=rows)
        self.assertEqual(task.snapshot()['workload']['video_files'], 1)
        self.assertEqual(task.plan.assets[0]['size'], 1234)
