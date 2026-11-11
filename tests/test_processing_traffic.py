import gzip
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import httpx
from peach import artifact_rules, upgrade_rules
from peach.http import HttpRequest, HttpxTransport
from peach.processing_traffic import (ProcessingTraffic, download_route, media_statistics,
                                      record_download, record_media_read)
from peach.settings_file import PeachConfig
from support.ledger import fresh_ledger


class ProcessingTrafficTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.config = PeachConfig(self.root, self.root / 'config.toml', present=True,
                                  drive_roots={'gdrive': ('root',)})
        self.db = fresh_ledger(self.root)

    def _sources(self, traffic):
        return {row['key']: row for row in traffic.snapshot()['sources']}

    def _metadata_bytes(self, traffic):
        return sum(row['estimated_bytes'] for row in traffic.snapshot()['sources'] if not row['root'])

    def test_media_reads_land_on_the_source_they_belong_to(self):
        traffic = ProcessingTraffic(self.config, self.db, 'metadata')
        with traffic.bind():
            record_media_read('gdrive:/夹/a.nfo', 100)
            record_media_read('onedrive:/相册/b.jpg', 200)
            record_download(50)
        result = traffic.snapshot()
        sources = {row['key']: row for row in result['sources']}
        self.assertEqual(sources['gdrive']['used_bytes'], 100)
        self.assertEqual(sources['onedrive']['used_bytes'], 200)
        self.assertTrue(sources['gdrive']['metered'])
        self.assertTrue(sources['onedrive']['metered'])
        self.assertEqual(result['used_bytes'], 350)
        self.assertEqual(result['used_bytes'], sum(row['used_bytes'] for row in result['sources']))
        self.assertEqual(result['metered_used_bytes'],
                         sum(row['used_bytes'] for row in result['sources'] if row['metered']))

    def test_http_counts_compressed_download_and_failed_partial_stream(self):
        packed = gzip.compress(b'a' * 10000)
        class Broken(httpx.SyncByteStream):
            def __iter__(self):
                yield b'abcd'
                raise httpx.ReadError('断开')
        replies = iter([httpx.Response(200, headers={'content-encoding': 'gzip'}, stream=httpx.ByteStream(packed)),
                        httpx.Response(200, stream=Broken())])
        client = httpx.Client(transport=httpx.MockTransport(lambda request: next(replies)))
        self.addCleanup(client.close)
        transport = HttpxTransport(client)
        traffic = ProcessingTraffic(self.config, self.db, 'metadata')
        with traffic.bind():
            self.assertEqual(len(transport(HttpRequest('GET', 'https://example.com/a', {}), 1, 20000).body), 10000)
            with self.assertRaises(httpx.ReadError):
                transport(HttpRequest('GET', 'https://example.com/b', {}), 1, 20000)
        self.assertEqual(traffic.snapshot()['used_bytes'], len(packed) + 4)

    def test_resume_keeps_counts_and_fresh_task_starts_at_zero(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with traffic.bind():
            record_media_read('gdrive:/夹/a.nfo', 100)
        restored = ProcessingTraffic(self.config, self.db, 'collect', resume_state={'traffic': traffic.snapshot()})
        with restored.bind():
            record_media_read('gdrive:/夹/a.nfo', 25)
        self.assertEqual(restored.snapshot()['used_bytes'], 125)
        self.assertEqual(ProcessingTraffic(self.config, self.db, 'collect').snapshot()['used_bytes'], 0)

    def test_http_route_and_media_statistics_accumulate_without_cross_task_leak(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with traffic.bind():
            with download_route(False):
                record_download(50)
            with download_route(True):
                record_download(30)
            media_statistics('gdrive:/夹/a.mp4', b'Statistics: 100 bytes read, 1 seeks\n')
            media_statistics('onedrive:/相册/b.mp4', b'ffmpeg timeout')
        record_download(500)
        result = traffic.snapshot()
        self.assertEqual(result['used_bytes'], 180)
        self.assertEqual(result['metered_used_bytes'], 130)
        self.assertTrue(result['partial'])

    def test_read_only_estimate_uses_requested_stage_without_starting_a_job(self):
        from peach.web_library_processing import q_library_processing
        database_root = self.config.directory('database')
        database_root.mkdir(parents=True)
        db = fresh_ledger(database_root)
        contract = SimpleNamespace(db_path=db)
        before = set(self.root.rglob('*'))
        with patch('peach.web_library_processing.settings_file.active', return_value=self.config):
            response = q_library_processing(contract, {'estimate': '1', 'stage': 'all'})
            with self.assertRaises(ValueError):
                q_library_processing(contract, {'estimate': '1', 'stage': 'invalid'})
        self.assertEqual(response['traffic']['used_bytes'], 0)
        self.assertEqual(set(self.root.rglob('*')), before)

    def test_plan_uses_the_rows_it_is_given_without_querying_the_ledger(self):
        traffic = ProcessingTraffic(self.config, self.db, 'all')
        rows = [dict(location='gdrive', path='gdrive:/夹/a.mp4', size=1024**3,
                     duration=None, snapshot_path=None)]
        with patch('peach.processing_traffic_plan.sqlite3.connect', side_effect=AssertionError('重复查询')):
            traffic.refresh_plan(rows)
        result = traffic.snapshot()
        self.assertEqual(result['workload']['video_files'], 1)
        self.assertEqual(result['estimated_max_bytes'], 0)

    def _video(self, **values):
        return dict(id=1, location='gdrive', path='gdrive:/夹/ABW-001.mp4', name='ABW-001.mp4',
                    code='ABW-001', size=1024**3, duration=3600, snapshot_path=None, **values)

    def test_download_plan_deduplicates_releases_and_ignores_creator_files(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with patch.object(traffic.plan, '_ready', return_value=False):
            traffic.refresh_plan([self._video()])
            single = self._metadata_bytes(traffic)
            rows = [{**self._video(), 'id': index, 'path': f'gdrive:/夹/copy{index}.mp4'} for index in range(20)]
            traffic.refresh_plan(rows)
            repeated = self._metadata_bytes(traffic)
        self.assertGreater(single, 0)
        self.assertEqual(single, repeated)
        traffic.refresh_plan([{**self._video(), 'code': None, 'name': '创作者作品.mp4'}])
        self.assertEqual(self._metadata_bytes(traffic), 0)

    def test_complete_fields_and_local_cover_have_no_download_work(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        row = self._video(catalog_title='影片', performers='演员', studio='厂牌', release_date='2026-01-01', tags='类别')
        with patch.object(traffic.plan, '_ready', return_value=True):
            traffic.refresh_plan([row])
        self.assertEqual(self._metadata_bytes(traffic), 0)

    def test_local_evidence_recalculates_actual_metadata_verification_work(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        row = self._video()
        fields = dict(title='影片', performers='演员', studio='厂牌', release_date='2026-01-01', tags='类别')
        with patch.object(traffic.plan, '_ready', return_value=True):
            traffic.prepare_metadata([(row, 'ABW-001', False, fields, [], True)])
            self.assertEqual(self._metadata_bytes(traffic), 0)
            traffic.prepare_metadata([(row, 'ABW-001', True, fields, [], True)])
            self.assertGreater(self._metadata_bytes(traffic), 0)

    def test_fresh_source_cache_and_misses_do_not_plan_network_requests(self):
        directory = self.config.directory('sources') / 'library-metadata'
        directory.mkdir(parents=True)
        for source in ('r18dev', 'javdb'):
            path = directory / f'ABW-001-{source}.json'
            payload = {'title': '影片', **({'javdb_rule': 2, 'source_id': 'VerifiedWork'} if source == 'javdb' else {})}
            path.write_text(json.dumps(payload), encoding='utf-8')
            artifact_rules.remember(path, str(upgrade_rules.PROVIDER_EVIDENCE))
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with patch.object(traffic.plan.remote, '_chain', return_value=('r18dev', 'javdb')), patch.object(traffic.plan, '_ready', return_value=True):
            traffic.refresh_plan([self._video()])
            self.assertEqual(self._metadata_bytes(traffic), 0)
        traffic.plan.evidence_names.clear()
        with patch.object(traffic.plan.remote, '_chain', return_value=('r18dev', 'javdb')), patch.object(traffic.plan.remote.misses, 'fresh', return_value=True), patch.object(traffic.plan, '_ready', return_value=True):
            traffic.refresh_plan([self._video()])
            self.assertEqual(self._metadata_bytes(traffic), 0)

    def test_download_budget_is_shared_and_finished_work_leaves_used_bytes(self):
        from peach.library_processing import MAX_SOURCE_BYTES
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        traffic.plan.units = {'metadata:ABW-001': {'metadata-proxy': MAX_SOURCE_BYTES * 3, 'metadata-direct': MAX_SOURCE_BYTES * 2}}
        result = traffic.snapshot()
        self.assertLessEqual(result['estimated_bytes'], MAX_SOURCE_BYTES)
        self.assertEqual(result['estimated_bytes'], sum(row['estimated_bytes'] for row in result['sources']))
        self.assertEqual(result['metered_estimated_bytes'], sum(row['estimated_bytes'] for row in result['sources'] if row['metered']))
        with traffic.bind(), download_route(True):
            record_download(100)
        traffic.finish_work('metadata', 'ABW-001')
        self.assertEqual(traffic.snapshot()['estimated_bytes'], 100)
        restored = ProcessingTraffic(self.config, self.db, 'collect', resume_state={'traffic': traffic.snapshot()})
        restored.refresh_plan([self._video()])
        self.assertEqual(self._metadata_bytes(restored), 100)

    def test_old_javdb_snapshot_plans_its_request_and_preserves_other_current_cache(self):
        directory = self.config.directory('sources') / 'library-metadata'
        directory.mkdir(parents=True)
        for source in ('r18dev', 'javdb'):
            path = directory / f'ABW-001-{source}.json'
            path.write_text(json.dumps({'title': '影片'}), encoding='utf-8')
            artifact_rules.remember(path, str(upgrade_rules.PROVIDER_EVIDENCE))
        old_path = directory / 'ABW-001-javdb.json'
        before = old_path.read_bytes()
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with patch.object(traffic.plan.remote, '_chain', return_value=('r18dev', 'javdb')), \
                patch.object(traffic.plan, '_ready', return_value=True):
            traffic.refresh_plan([self._video()])
        self.assertEqual(self._metadata_bytes(traffic), 500 * 1024)
        self.assertEqual(old_path.read_bytes(), before)

    def test_source_network_choice_splits_pending_downloads(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with patch.object(traffic.plan.remote, '_chain', return_value=('r18dev', 'javdb')), patch.object(traffic.plan, '_ready', return_value=True), patch('peach.scraping_access.values_for', side_effect=lambda root, source: {'network': 'direct' if source == 'javdb' else 'peach'}), patch('peach.peach_proxy.client_options', return_value={'proxy': 'http://example.invalid', 'trust_env': False}):
            traffic.refresh_plan([self._video()])
        sources = self._sources(traffic)
        self.assertEqual(sources['metadata-direct']['estimated_bytes'], 500 * 1024)
        self.assertEqual(sources['metadata-proxy']['estimated_bytes'], 500 * 1024)

    def test_external_collector_plan_is_separate_from_http_download_budget(self):
        from peach.library_processing import MAX_SOURCE_BYTES
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        traffic.plan._add('metadata:ABW-001', 'metadata-proxy', MAX_SOURCE_BYTES * 2)
        traffic.plan._add('metadata:ABW-001', 'metadata-proxy', 1000, budgeted=False)
        self.assertEqual(traffic.snapshot()['estimated_bytes'], MAX_SOURCE_BYTES + 1000)

    def test_non_release_metadata_completion_leaves_other_releases_pending(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        traffic.plan._add('metadata:ABW-001', 'metadata-proxy', 1000)
        traffic.finish_work('metadata', None)
        self.assertEqual(traffic.snapshot()['estimated_bytes'], 1000)

    def test_local_cache_file_sizes_inform_sidecar_plan_and_local_stage_settles(self):
        evidence = self.config.directory('sources') / 'library-metadata'
        evidence.mkdir(parents=True)
        (evidence / 'sample.nfo').write_bytes(b'x' * 1234)
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with patch.object(traffic.plan, '_ready', return_value=True):
            traffic.refresh_plan([self._video()])
            self.assertEqual(self._sources(traffic)['gdrive']['estimated_bytes'], 1234)
            traffic.finish_work('local')
            self.assertEqual(self._sources(traffic)['gdrive']['estimated_bytes'], 0)
            self.assertEqual(traffic.snapshot()['completed_work'], ['local:*'])

    def test_workload_counts_files_and_distinct_eligible_releases_per_source(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        traffic.refresh_plan([self._video(),
            {**self._video(), 'location': 'onedrive', 'path': 'onedrive:/相册/ABW-001.mp4'},
            {**self._video(), 'path': 'gdrive:/夹/ABW-002.mp4', 'code': 'ABW-002'},
            {**self._video(), 'path': 'gdrive:/夹/creator.mp4', 'name': '日常.mp4', 'code': None}])
        result = traffic.snapshot()
        self.assertEqual({key: result['workload'][key] for key in ('video_files', 'jav_files', 'jav_titles')},
                         dict(video_files=4, jav_files=3, jav_titles=2))
        workloads = {row['key']: row['workload'] for row in result['sources'] if row['root']}
        self.assertEqual(workloads['gdrive'], dict(video_files=3, jav_files=2, jav_titles=2))
        self.assertEqual(workloads['onedrive'], dict(video_files=1, jav_files=1, jav_titles=1))

    def test_successful_jav_samples_calibrate_matching_work_and_persist(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with patch.object(traffic.plan.remote, '_chain', return_value=('r18dev',)), patch.object(traffic.plan, '_ready', return_value=True):
            traffic.refresh_plan([{**self._video(), 'code': f'ABW-{number:03}'} for number in range(1, 5)])
            for number, amount in ((1, 1000), (2, 2000), (3, 3000)):
                code = f'ABW-{number:03}'
                traffic.start_metadata(code)
                with traffic.bind(), download_route(True):
                    record_download(amount)
                traffic.finish_work('metadata', code)
            self.assertEqual(traffic.plan.units['metadata:ABW-004']['metadata-proxy'], 2000)
            traffic.snapshot(finished=True)
        restored = ProcessingTraffic(self.config, self.db, 'collect')
        with patch.object(restored.plan.remote, '_chain', return_value=('r18dev',)), patch.object(restored.plan, '_ready', return_value=True):
            restored.refresh_plan([self._video()])
            self.assertEqual(restored.plan.units['metadata:ABW-001']['metadata-proxy'], 2000)
        with patch.object(restored.plan.remote, '_chain', return_value=('r18dev', 'javdb')), patch.object(restored.plan, '_ready', return_value=True):
            restored.refresh_plan([self._video()])
            self.assertEqual(restored.plan.units['metadata:ABW-001']['metadata-proxy'], 1000 * 1024)

    def test_failed_incomplete_and_cached_metadata_are_not_average_samples(self):
        traffic = ProcessingTraffic(self.config, self.db, 'collect')
        with patch.object(traffic.plan.remote, '_chain', return_value=('r18dev',)), patch.object(traffic.plan, '_ready', return_value=True):
            for number in range(4):
                code = f'ABW-{number:03}'
                traffic.refresh_plan([{**self._video(), 'code': code}])
                traffic.start_metadata(code)
                if number != 0:
                    with traffic.bind(), download_route(True):
                        record_download(1000)
                if number >= 2:
                    traffic.mark('metadata-proxy', '外部采集器流量未取得')
                traffic.finish_work('metadata', code, successful=number != 1)
        self.assertEqual(traffic.plan.history.samples, {})

    def test_successful_probe_average_is_kept_per_source_and_per_kind(self):
        traffic = ProcessingTraffic(self.config, self.db, 'all')
        with traffic.bind():
            for _ in range(3):
                media_statistics('gdrive:/夹/a.mp4', 'Statistics: 1024 bytes read', kind='probe', successful=True)
                media_statistics('gdrive:/夹/a.mp4', 'Statistics: 9000 bytes read', kind='frame', successful=True)
                media_statistics('onedrive:/相册/a.mp4', 'Statistics: 300 bytes read', kind='probe', successful=True)
                media_statistics('gdrive:/夹/a.mp4', 'Statistics: 999999 bytes read', kind='probe')
        traffic.snapshot(finished=True)
        restored = ProcessingTraffic(self.config, self.db, 'all')
        self.assertEqual(restored.plan.history.average('gdrive:probe', 0), 1024)
        self.assertEqual(restored.plan.history.average('gdrive:frame', 0), 9000)
        self.assertEqual(restored.plan.history.average('onedrive:probe', 0), 300)
        self.assertEqual(restored.plan.history.average('onedrive:frame', 0), 0)
