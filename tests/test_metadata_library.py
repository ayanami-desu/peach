"""既有库边车识别和统一处理的隔离回归。"""
import io
import json
import os
import sqlite3
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import DEFAULT, Mock, patch
from contextlib import closing, contextmanager

from filelock import FileLock
from PIL import Image
from peach import artifact_rules, library_processing, upgrade_rules

from peach.catalog_rules import normalise_code_key, release_code_from_filename
from peach.genre_taxonomy import map_genres
from peach.jav_cover_fetch import NotFound
from peach.http import HttpResponse
from peach.library_nfo import read_nfo, sidecars, local_art
from peach.library_processing import (STALL_AFTER_SECONDS, ProcessingBusy, _candidate_identity, _save,
                                      decorate, issues_path, _merge_local_performer_profiles,
                                      process_library, snapshot, state_path, _fields)
from peach.repository import LedgerDatabase
from peach.review_csv import read_rows
from peach.settings_file import PeachConfig
from support.ledger import fresh_ledger


def stub_provider():
    """只关心 r18.dev 那一档的用例用它：DMM 兜底与综合索引那两档按「没有」桩掉。

    来源链在 r18.dev 没给全必填标量时会接着问 DMM，再问综合索引（`peach.metadata_routes`）。
    桩不给答复，那几问拿到的是 Mock 的自动属性，报出来的错和被测行为无关。
    `provider.query.return_value` 与 `side_effect` 仍由各用例设，只对 r18.dev 那一问生效。
    """
    provider = Mock()

    def dmm_has_nothing(code, source='r18dev', **_):
        if source in ('dmm', 'javdb'):
            raise NotFound('HTTP 404')
        return DEFAULT

    provider.query.side_effect = dmm_has_nothing
    provider.community.side_effect = NotFound('社区来源都没有这个番号')
    provider.amane.side_effect = NotFound('amane 桥问的几站都没有这个番号')
    provider.wiki.side_effect = NotFound('Wiki 搜索范围内未取得精确作品表格行')
    return provider


def _mirror_page(image='https://storage92000.contents.fc2.com/file/1.jpg', video=3189161):
    """fc2cmadb 的作品页：Inertia 把整棵 props 树连同握手版本号放在一个 script 里。

    和真的 `_fetch` 一样交字节。
    """
    page = {'component': 'Articles/Show', 'version': 'fcb3b524d4c7f8f3d2c38e437b35b7a9',
            'url': f'/articles/{video}',
            'props': {'article': {'video_id': video, 'title': '【無】コスプレシリーズ',
                                  'release_date': '2023-02-19', 'duration': '46:06',
                                  'image_url': image,
                                  'writer': {'slug': 'rina_vlog', 'name': '梨奈'},
                                  'tags': [{'name': 'ハメ撮り'}]}}}
    return (f'<script data-page="app" type="application/json">'
            f'{json.dumps(page, ensure_ascii=False)}</script><div id="app"></div>').encode()


#: JavArchive 的作品地址把商品号夹在标题里，站上真的用空格分隔（用户 2026-09-22 给的
#: `FC2PPV%203232110%20…`）；搜索结果那一步要 unquote 之后才认得出这个号。
_ARCHIVE_LINK = '/859881-FC2PPV%203232110%20%E3%81%BF%E3%81%8A-pn.html'
_ARCHIVE_COVER = 'https://img.javstore.net/images/2023/12/26/3232110pl.jpg'
#: 同一页上的第二个图位（schema.org 的 `image`）。转存者存的图会失效，排头那张 404 时
#: 只有这张还能用——2026-09-22 实测 `FC2-PPV-1021177` 那页排头的图就已经是 404。
_ARCHIVE_COVER_SECOND = 'https://img.javstore.net/images/2023/12/26/FC2PPV-3232110-2.jpg'


def _archive_pages(url):
    """JavArchive 那一档的两跳：先搜出站内地址，作品页上才有封面和正文那块资料。和真的 `_fetch` 一样交字节。"""
    if 'search' in url:
        return f'<div class="post"><a href="{_ARCHIVE_LINK}">FC2PPV 3232110</a></div>'.encode()
    return ('<h1><a href="' + _ARCHIVE_LINK + '">FC2PPV 3232110 みおちゃんが素人さん</a></h1>'
            f'<div class="fisrst_sc"><img src="{_ARCHIVE_COVER}" alt="x" /></div>'
            f'<img itemprop="image" src="{_ARCHIVE_COVER_SECOND}" alt="x" />'
            '<div class="news">标签：素人 <br />日期：2023/03/23 <br />时长：45:12 <br /></div>').encode()


#: 账本把这些后缀的文件当视频行：扫描只登记它们，测试目录里别的文件是边车。
VIDEO_SUFFIXES = ('.mp4', '.mkv', '.mpg', '.mpeg', '.avi', '.mov', '.wmv', '.flv', '.iso', '.ts', '.m2ts')


def drive_config(root, *roots):
    """处理任务只认网盘扫描根：账本里的媒体行是 `gdrive:`/`onedrive:` 的远端文件。"""
    return PeachConfig(root, root / 'config.toml', present=True,
                       drive_roots={'gdrive': tuple(roots) if roots else ('root-1',)})


def register_assets(db, *names, root='root-1', location='gdrive'):
    """按网盘扫描结果的形状登记资产：远端文件 id 加扫描根，没有本机路径。

    `code` 是账本里的编目写法（`LAF-41.mp4` 记成 `LAF-041`）：自动落库与候选人按这一列
    找同号资产，网盘扫描登记时一并写好。
    """
    ids = []
    with closing(sqlite3.connect(db)) as connection, connection:
        for name in names:
            cursor = connection.execute(
                'INSERT INTO asset(location,path,name,medium,remote_id,drive_root,code) '
                'VALUES(?,?,?,?,?,?,?)',
                (location, f'{location}:/Media/{name}', name, 'video', f'{root}-{name}', root,
                 _code_of(name)))
            ids.append(cursor.lastrowid)
    return ids


def register_media(db, media, root='root-1', location='gdrive'):
    """把测试目录里的视频文件按网盘扫描结果的形状登记进账本，返回新行 id。"""
    media = Path(media)
    files = sorted(path for path in media.rglob('*')
                   if path.is_file() and path.suffix.lower() in VIDEO_SUFFIXES)
    ids = []
    with closing(sqlite3.connect(db)) as connection, connection:
        for path in files:
            relative = path.relative_to(media).as_posix()
            cursor = connection.execute(
                'INSERT INTO asset(location,path,name,medium,remote_id,drive_root,code) '
                'VALUES(?,?,?,?,?,?,?)',
                (location, f'{location}:/Media/{relative}', path.name, 'video',
                 f'{root}-{relative}', root, _code_of(path.name)))
            ids.append(cursor.lastrowid)
    return ids


def _code_of(name):
    """文件名里的番号按编目规则归一化；认不出的文件（`holiday.mp4`）没有番号。"""
    return normalise_code_key(release_code_from_filename(name) or '') or None


class LibraryNfoTests(unittest.TestCase):
    def _fc2_metadata_session(self, name, *, known=False, mirror=True, catalog='r18dev'):
        from peach.entities import normalize_entity_name
        from peach.library_processing import _MissCache, _RemoteSession
        db = LedgerDatabase(fresh_ledger(self.root))
        with db.write_transaction() as connection:
            connection.execute("INSERT INTO asset(id,location,path,name,code,medium) VALUES(1,?,?,?,?,'video')",
                               ('local', 'B:\\a.mp4', 'FC2-PPV-1234567.mp4', 'FC2-PPV-1234567'))
        if known:
            with db.write_transaction() as connection:
                identity = connection.execute(
                    "INSERT INTO entity(kind,canonical_name,normalized_name,created_at,updated_at) "
                    "VALUES('performer',?,?,?,?)", ('春野あや', normalize_entity_name('春野あや'), '2024', '2024')).lastrowid
                connection.execute('INSERT INTO entity_alias(entity_id,alias,normalized_alias,source,confidence) VALUES(?,?,?,?,1)',
                                   (identity, name, normalize_entity_name(name), 'user:manual'))
                connection.execute('INSERT INTO entity_external_ref(entity_id,provider,external_kind,external_id,last_synced_at) VALUES(?,?,?,?,?)',
                                   (identity, catalog, 'performer', '101', '2024'))
        config = PeachConfig(self.root, self.root / 'config.toml', present=True)
        provider = stub_provider()
        payload = dict(id='FC2-PPV-1234567', title='作品标题', maker='', release_date='2024-01-01',
                       actresses=[{'japanese_name': name}] if name else [], genres=['素人'],
                       javdb_rule=2, source_id='Example')
        provider.community.side_effect = None
        provider.community.return_value = [('javdb', payload)]
        provider.fc2.return_value = ([('fc2cmadb', dict(payload, actresses=[{'japanese_name': '春野あや'}]))]
                                     if mirror else [])
        session = _RemoteSession(config, lambda: provider, _MissCache(self.root / 'misses.json'),
                                 retrying=True, database=db)
        return session, provider, payload, db

    def test_fc2_uses_complete_javdb_metadata_for_a_confirmed_performer(self):
        session, provider, _payload, _db = self._fc2_metadata_session('春野あや', known=True)
        found = session._metadata({'id': 1, 'name': 'FC2-PPV-1234567.mp4', 'path': 'B:\\a.mp4'},
                                  'FC2-PPV-1234567', ['title','studio','performers','release_date'],
                                  update=lambda **_: None, issue=Mock())
        self.assertEqual([source for source, _, _ in found], ['javdb'])
        provider.fc2.assert_not_called()

    def test_fc2_resolves_a_confirmed_alias_before_deciding_to_stop(self):
        session, provider, _payload, _db = self._fc2_metadata_session('あやちゃん', known=True)
        session._metadata({'id': 1, 'name': 'FC2-PPV-1234567.mp4', 'path': 'B:\\a.mp4'},
                          'FC2-PPV-1234567', ['performers'], update=lambda **_: None, issue=Mock())
        provider.fc2.assert_not_called()

    def test_fc2_missing_or_unconfirmed_javdb_names_continue_to_specialists(self):
        for name in ('', 'Chisa', 'みおちゃん'):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as folder:
                previous = self.root
                self.root = Path(folder).resolve()
                try:
                    session, provider, _payload, _db = self._fc2_metadata_session(name)
                    found = session._metadata({'id': 1, 'name': 'FC2-PPV-1234567.mp4', 'path': 'B:\\a.mp4'},
                                              'FC2-PPV-1234567', ['performers'],
                                              update=lambda **_: None, issue=Mock())
                    self.assertEqual([source for source, _, _ in found], ['javdb', 'fc2cmadb'])
                    provider.fc2.assert_called_once()
                finally:
                    self.root = previous

    def test_an_unconfirmed_fc2_javdb_name_stays_a_review_candidate(self):
        session, _provider, payload, database = self._fc2_metadata_session('Chisa', mirror=False)
        groups = {}
        row = dict(id=1, name='FC2-PPV-1234567.mp4', path='B:\\a.mp4', size=8)
        library_processing._merge_candidates(groups, row, 'FC2-PPV-1234567', 'javdb', payload,
                                             self.root / 'source.json', {}, database=database)
        candidate = json.loads(groups['asset:1:performers']['candidates_json'])[0]
        self.assertTrue(candidate['requires_review'])
        from peach.metadata_auto_apply import metadata_auto_apply_candidate
        group = {**groups['asset:1:performers'], 'candidates': [candidate]}
        with database.read_connection() as connection:
            self.assertIsNone(metadata_auto_apply_candidate(connection, group))
        specialist = dict(payload, actresses=[{'japanese_name': '春野あや'}])
        library_processing._merge_candidates(groups, row, 'FC2-PPV-1234567', 'fc2cmadb', specialist,
                                             self.root / 'specialist.json', {}, database=database)
        group = {**groups['asset:1:performers'],
                 'candidates': json.loads(groups['asset:1:performers']['candidates_json'])}
        with database.read_connection() as connection:
            chosen = metadata_auto_apply_candidate(connection, group)
        self.assertEqual(chosen['source'], 'fc2cmadb')

    def test_a_javdb_actor_id_alone_does_not_confirm_an_fc2_name(self):
        session, provider, _payload, _database = self._fc2_metadata_session('Chisa', known=True, catalog='javdb')
        session._metadata({'id': 1, 'name': 'FC2-PPV-1234567.mp4', 'path': 'B:\\a.mp4'},
                          'FC2-PPV-1234567', ['performers'], update=lambda **_: None, issue=Mock())
        provider.fc2.assert_called_once()

    def test_a_confirmed_fc2_alias_keeps_the_existing_automatic_candidate(self):
        _session, _provider, payload, database = self._fc2_metadata_session('あやちゃん', known=True)
        groups = {}
        row = dict(id=1, name='FC2-PPV-1234567.mp4', path='B:\\a.mp4', size=8)
        library_processing._merge_candidates(groups, row, 'FC2-PPV-1234567', 'javdb', payload,
                                             self.root / 'source.json', {}, database=database)
        candidate = json.loads(groups['asset:1:performers']['candidates_json'])[0]
        self.assertFalse(candidate.get('requires_review', False))
        from peach.metadata_auto_apply import metadata_auto_apply_candidate
        with database.read_connection() as connection:
            chosen = metadata_auto_apply_candidate(connection, {
                **groups['asset:1:performers'], 'candidates': [candidate]})
        self.assertEqual(chosen['source'], 'javdb')

    def test_old_completed_receipts_retry_only_fc2_rows_without_cast(self):
        from peach.entities import normalize_entity_name
        from peach.library_processing import _LibraryCheckpoints
        database = LedgerDatabase(fresh_ledger(self.root))
        rows = [{'id': value, 'path': f'R:\\{value}.mp4'} for value in (1, 2, 3)]
        with database.write_transaction() as connection:
            for row, code in zip(rows, ('FC2-PPV-1234567','ABW-123','FC2-PPV-1234568')):
                connection.execute('INSERT INTO asset(id,location,path,name,code) VALUES(?,?,?,?,?)',
                                   (row['id'], 'local', row['path'], f"{row['id']}.mp4", code))
            identity = connection.execute(
                "INSERT INTO entity(kind,canonical_name,normalized_name,created_at,updated_at) "
                "VALUES('performer',?,?,?,?)", ('春野あや', normalize_entity_name('春野あや'), '2024', '2024')).lastrowid
            connection.execute('INSERT INTO asset_entity(asset_id,entity_id,role,source,confidence) VALUES(?,?,?,?,1)',
                               (3, identity, 'performer', 'user:manual'))
        keys = [library_processing._checkpoint_key(row) for row in rows]
        previous = dict(processing_rule=upgrade_rules.PROCESSING, completed_metadata=keys, completed_previews=keys)
        current = {}
        checkpoints = _LibraryCheckpoints(current, previous, database, database.db_path)
        self.assertEqual([row['id'] for _, row in checkpoints.remaining_metadata(rows)], [1])
        self.assertEqual(set(current['completed_previews']), set(keys))
        self.assertEqual(set(current['completed_metadata']), set(keys[1:]))

    def test_javdb_candidate_keeps_its_verified_rule_and_source_identity(self):
        from peach.library_processing import _merge_candidates
        from peach.javdb_identity import current_candidate
        groups = {}
        document = {'id': 'MIKR-023', 'title': '原题', 'javdb_rule': 2,
                    'source_id': 'XeYkdb', 'source_url': 'https://javdb.com/v/XeYkdb'}
        row = {'id': 1, 'name': 'MIKR-023.mp4', 'path': 'R:/Films/MIKR-023.mp4', 'size': 1}
        _merge_candidates(groups, row, 'MIKR-023', 'javdb', document, self.root / 'raw.json', {})
        candidate = json.loads(groups['asset:1:title']['candidates_json'])[0]
        self.assertTrue(current_candidate(candidate))
        self.assertEqual((candidate['source_id'], candidate['source_url']),
                         ('XeYkdb', 'https://javdb.com/v/XeYkdb'))

    def test_targeted_recheck_asks_a_source_despite_old_miss_but_normal_collection_keeps_it(self):
        from peach.library_processing import _MissCache, misses_path
        for recheck in (False, True):
            with self.subTest(recheck=recheck):
                root = self.root / ('recheck' if recheck else 'normal')
                root.mkdir(parents=True)
                db = fresh_ledger(root)
                config = drive_config(root)
                register_assets(db, 'DASS-468.mp4')
                misses = _MissCache(misses_path(config))
                misses.record('javdb', 'DASS-468')
                misses.record('javdb', 'DASS-469')
                document = {'id': 'DASS-468', 'title': '原题', 'maker': 'Das', 'release_date': '2024-09-10',
                            'actresses': [{'japanese_name': '胡桃さくら'}]}
                provider = stub_provider()
                provider.query.side_effect = lambda code, source='r18dev', document=document, **kwargs: (
                    {**document, 'genres': ['高跟鞋'], 'javdb_rule': 2} if source == 'javdb' else document)
                provider.cover.return_value = False
                process_library(config, db, root / 'generated', root / 'covers', asset_ids=[1],
                                stage='metadata', recheck_existing=recheck, provider_factory=lambda provider=provider: provider)
                javdb_calls = [call for call in provider.query.call_args_list if call.args[1] == 'javdb']
                self.assertEqual(len(javdb_calls), 1 if recheck else 0)
                self.assertTrue(_MissCache(misses_path(config)).fresh('javdb', 'DASS-469'))

    def test_cover_failure_retains_redacted_exception_in_scraping_export_and_remains_retryable(self):
        from peach.library_processing import _MissCache, _ProcessingIssues, _RemoteSession
        from peach.scraping_diagnostics import _issues

        config = PeachConfig(self.root, self.root / 'config.toml', present=True)
        path = issues_path(config, 'cover-job')
        path.parent.mkdir(parents=True, exist_ok=True)
        provider = stub_provider()
        failure = RuntimeError('model unreadable token=hidden-secret C:\\private\\model.onnx')
        provider.cover.side_effect = [failure, False]
        remote = _RemoteSession(config, lambda: provider, _MissCache(self.root / 'misses.json'), retrying=False)
        state = dict(job_id='cover-job', notes={}, issue_count=0, paused_count=0,
                     issue_preview=[], retryable_asset_ids=[], issues_truncated=False)
        issue = _ProcessingIssues(state, path, lambda: None, lambda values: None)
        row = {'id': 1, 'name': 'ABC-199_AI.mp4', 'path': 'R:/Films/ABC-199_AI.mp4'}
        remote._cover(row, 'ABC-199', self.root / 'covers', update=lambda **values: None, issue=issue)
        remote._cover(dict(row, id=2), 'ABC-200', self.root / 'covers', update=lambda **values: None, issue=issue)
        self.assertEqual(provider.cover.call_count, 2)
        self.assertFalse(remote.misses.fresh('cover', 'ABC-199'))
        recorded = json.loads(path.read_text(encoding='utf-8'))
        self.assertEqual(recorded['diagnostics']['code'], 'ABC-199')
        self.assertEqual(recorded['diagnostics']['stage'], 'fetching_cover')
        self.assertEqual(recorded['diagnostics']['exception'][0]['type'], 'RuntimeError')
        self.assertTrue(recorded['diagnostics']['frames'])
        self.assertNotIn('hidden-secret', json.dumps(recorded))
        self.assertNotIn('private', json.dumps(recorded))
        self.assertEqual((state['issue_count'], state['retryable_asset_ids']), (1, [1]))
        exported = {}
        export = SimpleNamespace(add=lambda name, value: exported.update({name: value}),
                                 unavailable=lambda *args: self.fail(str(args)))
        _issues(config, {1}, export)
        self.assertEqual(exported['issues.json']['records'][0]['diagnostics'], recorded['diagnostics'])
        self.assertEqual(exported['issues.json']['records'][0]['job_id'], 'cover-job')

    def test_retry_assets_with_one_code_share_a_fresh_source_answer(self):
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-101-CD1.mp4', 'ABW-101-CD2.mp4')
        provider = stub_provider()
        provider.query.return_value = {'id': 'ABW-101', 'title': '同一作品', 'maker': '厂牌',
            'release_date': '2026-01-01', 'actresses': [{'japanese_name': '测试演员'}]}
        provider.cover.side_effect = NotFound('没有封面')
        result = process_library(config, db, self.root / 'generated', self.root / 'covers', stage='metadata',
            retry_ids=[1, 2], provider_factory=lambda: provider)
        r18 = [call for call in provider.query.call_args_list if call.args[1] == 'r18dev']
        self.assertEqual(len(r18), 1)
        self.assertEqual(provider.cover.call_count, 1)
        candidates = read_rows(self.root / 'generated/library-metadata-field-candidates.csv')
        titles = [row for row in candidates if row['field'] == 'title']
        self.assertEqual({row['asset_id'] for row in titles}, {'1', '2'})
        self.assertEqual(result['checked'], 2)

    def test_a_confirmed_censored_title_takes_its_tags_from_the_community_source(self):
        """有码作品的标签以 JavDB 社区类别为准：官方来源给的那组被换下，记进复核留痕。"""
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'SSIS-057.mp4')
        database = LedgerDatabase(db)
        provider = stub_provider()
        provider.cover.return_value = False

        def tags():
            with database.read_connection() as connection:
                return {row[0] for row in connection.execute(
                    "SELECT tag FROM asset_tag WHERE asset_id=1 AND tag NOT LIKE '演员:%'")}

        def query(code, source='r18dev', **kwargs):
            if source == 'javdb':
                return {'id': code, 'genres': ['高跟鞋', '絲襪'], 'javdb_rule': 2, 'source_id': 'Ssis057'}
            if source == 'dmm':
                raise NotFound('没有')
            return {'id': code, 'title': 'MSIS-057 的标题', 'maker': 'Prestige', 'release_date': '2023-05-26',
                    'actresses': [{'japanese_name': '涼森れむ'}], 'genres': ['巨乳']}

        provider.query.side_effect = query
        with patch('peach.library_processing._enrich_finished_performers',
                   return_value={'aliases': 0, 'avatars': 0, 'conflicts': 0, 'failed': 0}):
            process_library(config, db, self.root / 'generated', self.root / 'covers',
                            provider_factory=lambda: provider, database=database,
                            route_overrides='censored=r18dev,javdb')
        self.assertEqual(tags(), {'高跟', '丝袜'})
        with database.read_connection() as connection:
            note = json.loads(connection.execute(
                "SELECT note FROM review_decision WHERE item_key='asset:1:tags'").fetchone()[0])
        self.assertEqual(note['rule'], 'metadata-censored-javdb-tags')
        self.assertEqual(note['tag_policy'], 'censored-javdb')
        self.assertEqual(note['overruled'], [{'source': 'r18dev', 'value': '巨乳'}])
        from peach.web_contract import WebContract
        from peach.web_review import q_review
        contract = WebContract(db, candidate_root=self.root / 'generated', database=database)
        pending = q_review(contract)['sections']['metadata_fields']
        self.assertNotIn('tags', [item['field'] for item in pending])

    def test_a_confirmed_site_is_visible_before_another_site_reaches_its_deadline(self):
        from peach.library_processing import LibraryMetadataProvider
        from peach.jav_cover_fetch import DeadlineExceeded
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4')
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.cover = Mock(return_value=False)
        provider.transport = Mock()
        seen = []

        def site(source, code, **kwargs):
            if source == 'avbase':
                return {'id': code, 'title': '已确认来源标题'}
            if source == 'javbus':
                with closing(sqlite3.connect(db)) as connection:
                    seen.extend(connection.execute('SELECT catalog_title FROM asset').fetchone())
                self.assertTrue((config.directory('sources') / 'library-metadata/ABW-358-avbase.json').is_file())
                raise DeadlineExceeded('等待另一站超时')
            raise NotFound('没有')

        provider.site = site
        with patch('peach.library_processing._enrich_finished_performers',
                   return_value={'aliases': 0, 'avatars': 0, 'conflicts': 0, 'failed': 0}):
            process_library(config, db, self.root / 'generated', self.root / 'covers', stage='metadata',
                            provider_factory=lambda: provider, database=LedgerDatabase(db),
                            route_overrides='censored=avbase,javbus,javdb')
        self.assertEqual(seen, ['已确认来源标题'])
        candidates = read_rows(self.root / 'generated/library-metadata-field-candidates.csv')
        self.assertEqual(json.loads(candidates[0]['candidates_json'])[0]['source'], 'avbase')

    def test_metadata_checkpoint_is_saved_when_evidence_was_flushed_before_cover_finished(self):
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4')
        provider = stub_provider()
        provider.query.return_value = {'id': 'ABW-358', 'title': '已保存资料'}
        provider.cover.return_value = False
        with patch('peach.library_processing.CANDIDATE_FLUSH_SECONDS', 0), \
                patch('peach.library_processing.CANDIDATE_FLUSH_COST_RATIO', 0):
            result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                     stage='metadata', provider_factory=lambda: provider)
        self.assertEqual(len(result['completed_metadata']), 1)
        provider.query.reset_mock()
        process_library(config, db, self.root / 'generated', self.root / 'covers', stage='metadata',
                        provider_factory=lambda: provider, resume_state=result)
        provider.query.assert_not_called()

    def test_a_slow_candidate_file_is_rewritten_no_more_often_than_its_cost_allows(self):
        """候选表整份写一次越久，两次写之间隔得越开：处理线程不能一半时间都在写文件。"""
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, *(f'ABW-35{number}.mp4' for number in range(1, 9)))
        provider = stub_provider()
        provider.query.side_effect = lambda code, *args, **kwargs: {'id': code, 'title': f'{code} 资料'}
        provider.cover.return_value = False
        writes = []
        real_write = library_processing.write_rows

        def slow_write(*args, **kwargs):
            started = time.monotonic()
            time.sleep(0.2)
            real_write(*args, **kwargs)
            writes.append((started, time.monotonic()))

        with patch('peach.library_processing.CANDIDATE_FLUSH_SECONDS', 0), \
                patch('peach.library_processing.CANDIDATE_FLUSH_COST_RATIO', 20), \
                patch('peach.library_processing.write_rows', side_effect=slow_write):
            process_library(config, db, self.root / 'generated', self.root / 'covers',
                            stage='metadata', provider_factory=lambda: provider)
        # 每次写耗时约 0.2 秒、倍数取 20：节流的写之间至少隔 4 秒，八部片采完用不了这么久，
        # 只剩第一次节流写与几处收尾的强制写。倍数不起作用时每采一部片就写一次。
        self.assertLessEqual(len(writes), 5, writes)
        self.assertTrue(read_rows(self.root / 'generated/library-metadata-field-candidates.csv'))

    def test_user_pause_keeps_published_fields_and_resumes_the_same_collection(self):
        import threading
        from peach.processing_control import control_for
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4')
        provider = stub_provider()
        provider.query.return_value = {'id': 'ABW-358', 'title': '已确认资料'}
        provider.cover.return_value = False
        control = control_for(config)
        paused, requested = threading.Event(), threading.Event()
        pause_lock = threading.Lock()
        results, errors = [], []
        def report(state):
            if state['status'] == 'paused':
                paused.set()
            elif state.get('auto_applied', 0):
                with pause_lock:
                    if not requested.is_set():
                        requested.set()
                        control.request('pause', state['job_id'])
        def run():
            try:
                results.append(process_library(config, db, self.root / 'generated', self.root / 'covers',
                    stage='metadata', speed_mode='high', job_id='one', report=report,
                    provider_factory=lambda: provider, database=LedgerDatabase(db)))
            except BaseException as exc:
                errors.append(exc)
        with patch('peach.library_processing.CANDIDATE_FLUSH_SECONDS', 0), \
                patch('peach.library_processing.CANDIDATE_FLUSH_COST_RATIO', 0), \
                patch('peach.library_processing._enrich_finished_performers',
                      return_value={'aliases': 0, 'avatars': 0, 'conflicts': 0, 'failed': 0}):
            thread = threading.Thread(target=run)
            thread.start()
            try:
                self.assertTrue(paused.wait(5), errors)
                with closing(sqlite3.connect(db)) as connection:
                    self.assertEqual(connection.execute('SELECT catalog_title FROM asset').fetchone()[0], '已确认资料')
                self.assertTrue(read_rows(self.root / 'generated/library-metadata-field-candidates.csv'))
                self.assertEqual(snapshot(config)['status'], 'paused')
            finally:
                with pause_lock:
                    requested.set()
                    control.request('resume', 'one')
                thread.join(5)
        self.assertFalse(thread.is_alive())
        self.assertEqual(errors, [])
        self.assertEqual((results[0]['job_id'], results[0]['status']), ('one', 'complete'))
        self.assertGreater(results[0]['auto_applied'], 0)

    def test_confirmed_online_fields_are_committed_while_cover_fetch_is_pending(self):
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4')
        provider = stub_provider()
        provider.query.return_value = {'id': 'ABW-358', 'title': '已确认标题', 'maker': 'Prestige',
            'release_date': '2023-05-26', 'actresses': [{'japanese_name': '涼森れむ'}]}
        visible = []

        def cover(*args, **kwargs):
            with closing(sqlite3.connect(db)) as connection:
                visible.extend(connection.execute('SELECT catalog_title FROM asset').fetchone())
            raise KeyboardInterrupt()

        provider.cover.side_effect = cover
        with self.assertRaises(KeyboardInterrupt):
            process_library(config, db, self.root / 'generated', self.root / 'covers',
                            provider_factory=lambda: provider, database=LedgerDatabase(db))
        self.assertEqual(visible, ['已确认标题'])

    def test_targeted_collection_keeps_global_progress_and_unrelated_candidates(self):
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4', 'ABW-359.mp4')
        database = LedgerDatabase(db)
        provider = stub_provider()
        provider.query.side_effect = lambda code, *args, **kwargs: (
            {'id': code, 'title': f'作品 {code}'} if code == 'ABW-358' else {})
        generated = self.root / 'generated'
        covers = self.root / 'covers'
        with patch('peach.library_processing._enrich_finished_performers',
                   return_value={'aliases': 0, 'avatars': 0, 'conflicts': 0, 'failed': 0}):
            process_library(config, db, generated, covers, provider_factory=lambda: provider)
            prior = state_path(config).read_bytes()
            output = self.root / 'state/download-processing/1.json'
            result = process_library(config, db, generated, covers, retry_ids=[1], stage='collect',
                                     state_file=output, provider_factory=lambda: provider, database=database)
        self.assertEqual(state_path(config).read_bytes(), prior)
        self.assertTrue(output.exists())
        self.assertEqual(result['total'], 1)
        candidates = read_rows(generated / 'library-metadata-field-candidates.csv')
        self.assertEqual(result['candidates'], sum(row['asset_id'] == '1' for row in candidates))
        with database.read_connection() as connection:
            self.assertIsNotNone(connection.execute('SELECT catalog_title FROM asset WHERE id=1').fetchone()[0])
            self.assertIsNone(connection.execute('SELECT catalog_title FROM asset WHERE id=2').fetchone()[0])

    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()

    def test_amane_preparation_failure_preserves_the_unprocessed_selection_for_retry(self):
        from peach import metadata_amane
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        expected = set(register_assets(db, 'SSIS-057.mp4', 'SSIS-058.mp4'))
        register_assets(db, 'FC2-PPV-1234567.mp4')
        generated, covers = self.root / 'generated', self.root / 'covers'
        with patch.object(metadata_amane, 'ensure',
                          side_effect=metadata_amane.PreparationError('下载未完成')) as prepare, \
                patch('peach.library_processing._RemoteSession.collect', return_value=([], 0)) as collect:
            result = process_library(config, db, generated, covers, stage='metadata')
        self.assertEqual(prepare.call_count, 1)
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['issue_count'], 1)
        self.assertEqual(set(result['retryable_asset_ids']), expected)
        self.assertEqual(collect.call_count, 1)
        self.assertEqual(collect.call_args.args[1], 'FC2-PPV-1234567')
        self.assertIn('下载未完成', result['issue_preview'][0]['message'])
        provider = stub_provider()
        provider.query.return_value = {'id': 'SSIS-057', 'title': '作品资料'}
        provider.cover.return_value = False
        retried = process_library(config, db, generated, covers, stage='metadata',
            retry_ids=result['retryable_asset_ids'], provider_factory=lambda: provider,
            route_overrides='censored=r18dev')
        self.assertEqual(retried['checked'], 2)
        self.assertTrue(provider.query.called)

    def test_filename_code_families_enter_metadata_collection(self):
        codes = {'LAF-41.mpg': 'LAF-041', 'MKBD-S94.mkv': 'MKBD-S94',
                 'MKD-S118.iso': 'MKD-S118', '040221_0012.flv': '040221_0012'}
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, *codes)
        provider = stub_provider()
        provider.query.side_effect = lambda code, *args, **kwargs: {
            'id': code, 'title': f'测试作品 {code}', 'maker': '测试厂牌',
            'release_date': '2026-01-01', 'actresses': [{'japanese_name': '测试演员'}]}
        with patch('peach.library_processing._asks_cover', return_value=False), \
                patch('peach.library_processing._enrich_finished_performers',
                      return_value={'aliases': 0, 'avatars': 0, 'conflicts': 0, 'failed': 0}):
            result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                stage='metadata', provider_factory=lambda: provider, database=LedgerDatabase(db),
                route_overrides='censored=r18dev;uncensored=r18dev')
        self.assertEqual(result['status'], 'complete')
        self.assertEqual(result['identified'], len(codes))
        self.assertEqual({call.args[0] for call in provider.query.call_args_list}, set(codes.values()))
        with closing(sqlite3.connect(db)) as connection:
            rows = connection.execute('SELECT name,code,catalog_title FROM asset').fetchall()
        self.assertEqual({name: code for name, code, _ in rows}, codes)
        self.assertEqual({code: title for _, code, title in rows},
                         {code: f'测试作品 {code}' for code in codes.values()})

    def test_javboss_fields_and_original_tags(self):
        path = self.root / 'sample.nfo'
        path.write_text('<movie><generator>JavBoss</generator><uniqueid type="javboss">ABW-358</uniqueid>'
            '<title>作品</title><originaltitle>原題</originaltitle><set><name>系列</name></set>'
            '<premiered>2023-05-26</premiered><runtime>210</runtime><actor><name>涼森れむ</name></actor>'
            '<genre>自定义标签</genre><tag>有码</tag><tag>主觀視角</tag><tag>苗條</tag>'
            '<tag>單體作品</tag><tag>MGSだけのおまけ映像付き</tag>'
            '<tag>フルハイビジョン(FHD)</tag></movie>', encoding='utf-8')
        payload, raw = read_nfo(path)
        self.assertEqual(payload['id'], 'ABW-358')
        self.assertEqual(payload['source_generator'], 'JavBoss')
        tags = _fields(payload)['tags']['value']
        self.assertEqual(tags, ['自定义标签', '有码', '主观视角', '苗条'])
        self.assertEqual(payload['runtime'], '210')
        self.assertEqual(raw, path.read_bytes())

    def test_movie_sidecar_only_when_unambiguous_and_named_file_preferred(self):
        video = self.root / 'one.mp4'
        video.touch()
        common = self.root / 'movie.nfo'
        common.touch()
        self.assertEqual(sidecars(video)[0], common)
        (self.root / 'two.mkv').touch()
        self.assertIsNone(sidecars(video)[0])
        named = self.root / 'one.NFO'
        named.touch()
        self.assertEqual(sidecars(video)[0], named)

    def test_numbered_image_set_beside_the_video_is_not_its_poster(self):
        gallery = self.root / 'gallery'
        gallery.mkdir()
        video = gallery / 'TG@BOT- (1).mp4'
        for name in ('TG@BOT- (1).mp4', 'TG@BOT- (1).jpg', 'TG@BOT- (2).jpg', 'TG@BOT- (10).jpg'):
            (gallery / name).touch()
        self.assertEqual(sidecars(video)[1], [])
        (gallery / 'cover.jpg').touch()
        self.assertEqual(sidecars(video)[1], [gallery / 'cover.jpg'])

    def test_release_sidecar_is_shared_by_parts_and_versions(self):
        video = self.root / 'ABC-123-CD1.mp4'
        for name in (video.name, 'ABC-123-CD2.mp4', 'ABC-123-4K.mkv', 'ABC-124.mp4'):
            (self.root / name).touch()
        shared = self.root / 'ABC-123.nfo'
        shared.write_text('<movie><id>ABC-123</id><title>本地标题</title></movie>', encoding='utf-8')
        for name in (video.name, 'ABC-123-CD2.mp4', 'ABC-123-4K.mkv'):
            self.assertEqual(sidecars(self.root / name)[0], shared)
        self.assertIsNone(sidecars(self.root / 'ABC-124.mp4')[0])
        named = video.with_suffix('.nfo')
        named.touch()
        self.assertEqual(sidecars(video)[0], named)
        (self.root / 'ABC-123-4K.nfo').touch()
        self.assertIsNone(sidecars(self.root / 'ABC-123-CD2.mp4')[0])

    def test_movie_sidecar_is_shared_only_by_one_release(self):
        video = self.root / 'ABC-123-CD1.mp4'
        for name in (video.name, 'ABC-123-CD2.mp4'):
            (self.root / name).touch()
        common = self.root / 'movie.nfo'
        common.touch()
        self.assertEqual(sidecars(video)[0], common)
        (self.root / 'ABC-124.mp4').touch()
        self.assertIsNone(sidecars(video)[0])

    def test_releases_sharing_a_folder_keep_their_same_name_posters(self):
        for code in ('ABC-123', 'ABC-124'):
            (self.root / f'{code}.mp4').touch()
            (self.root / f'{code}.jpg').touch()
        (self.root / 'ABC-123-fanart.jpg').touch()
        self.assertEqual(sidecars(self.root / 'ABC-123.mp4')[1], [self.root / 'ABC-123.jpg'])

    def test_episode_and_plain_set_without_jav_identity(self):
        path = self.root / 'episode.nfo'
        path.write_text('<episodedetails><title>Episode</title><uniqueid type="tmdb">123</uniqueid>'
            '<set>Collection</set><aired>2024-01-02</aired></episodedetails>', encoding='utf-8')
        payload, _ = read_nfo(path)
        self.assertEqual(payload['id'], '')
        self.assertEqual(payload['series'], 'Collection')
        self.assertEqual(payload['release_date'], '2024-01-02')

    def test_jav_id_and_imdb_id_have_distinct_meanings(self):
        path = self.root / 'movie.nfo'
        path.write_text('<movie><id>ABW-358</id></movie>', encoding='utf-8')
        self.assertEqual(read_nfo(path)[0]['id'], 'ABW-358')
        path.write_text('<movie><id>tt1234567</id></movie>', encoding='utf-8')
        self.assertEqual(read_nfo(path)[0]['id'], '')

    def test_entity_declarations_rejected_in_utf16(self):
        path = self.root / 'unsafe.nfo'
        path.write_bytes('<!DOCTYPE movie [<!ENTITY x "test">]><movie><title>&x;</title></movie>'.encode('utf-16'))
        with self.assertRaises(ValueError):
            read_nfo(path)

    def test_art_cannot_escape_media_directory(self):
        folder = self.root / 'film'
        folder.mkdir()
        (self.root / 'outside.jpg').touch()
        self.assertIsNone(local_art(folder / 'film.mp4', {'local_art': '../outside.jpg'}))
        self.assertIsNone(local_art(folder / 'film.mp4', {'local_art': 'https://example.com/poster.jpg'}))

    def test_status_reads_do_not_start_processing(self):
        from peach.web_library_processing import q_library_processing
        from unittest.mock import patch
        contract = Mock()
        contract.db_path = self.root / 'database/ledger.db'
        contract.library_processing_job.snapshot.return_value = {'status': 'running', 'job_id': 'one'}
        contract.task_runs.query.return_value = []
        with patch('peach.web_library_processing.process_library') as worker:
            self.assertEqual(q_library_processing(contract, {})['job_id'], 'one')
            worker.assert_not_called()

    def test_network_recovery_retries_only_a_run_that_skipped_rows_offline(self):
        from peach.web_library_processing import retry_after_network_recovery
        skipped = {'status': 'failed', 'offline_skipped': 2, 'retryable_asset_ids': [1, 2]}
        writer, reader = SimpleNamespace(read_only=False), SimpleNamespace(read_only=True)
        cases = {
            'skipped offline': (skipped, writer, True),
            'failed for other reasons': ({**skipped, 'offline_skipped': 0}, writer, False),
            'nothing left': ({**skipped, 'retryable_asset_ids': []}, writer, False),
            'read-only device': (skipped, reader, False),
        }
        for name, (live, sync, expected) in cases.items():
            with self.subTest(name):
                contract = Mock()
                contract.db_path = self.root / 'database/ledger.db'
                contract.library_processing_job.thread = None
                contract.library_processing_job.snapshot.return_value = {**live, 'job_id': 'one', 'started_at': 1}
                with patch('peach.web_library_processing.settings_file.active'), \
                        patch('peach.web_library_processing.snapshot', return_value={}), \
                        patch('peach.web_library_processing.w_library_processing') as start:
                    retry_after_network_recovery(contract, sync)
                if expected:
                    start.assert_called_once_with(contract, {'job_id': 'one', 'retry': []})
                else:
                    start.assert_not_called()
        # 断网那一趟还在收尾：这次恢复不算用掉，留给探测器下一次判回联网。
        contract = Mock()
        contract.library_processing_job.snapshot.return_value = {**skipped, 'status': 'running', 'job_id': 'one'}
        with patch('peach.web_library_processing.w_library_processing') as start:
            self.assertIs(retry_after_network_recovery(contract, writer), False)
        start.assert_not_called()

    def test_stop_preserves_committed_fields_and_prevents_followup_writes(self):
        """停止保留已提交资料，禁止后续写入与头像下载。"""
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4', 'ABW-359.mp4')
        provider = stub_provider()
        # 第二个视频开始采集的那一刻按下停止：第一个已经落库，第二个不再写。
        alive = {'value': True}

        def answer(code, *args, **kwargs):
            if code == 'ABW-359':
                alive['value'] = False
            return {'id': code, 'title': f'{code} 的标题'}

        provider.query.side_effect = answer
        commits = []
        database = LedgerDatabase(db)
        database.after_commit = lambda: commits.append(alive['value'])

        with self.assertRaises(InterruptedError):
            process_library(config, db, self.root / 'generated', self.root / 'covers',
                            provider_factory=Mock(return_value=provider),
                            database=database, active=lambda: alive['value'])

        with closing(sqlite3.connect(db)) as connection:
            titles = dict(connection.execute('SELECT code, catalog_title FROM asset').fetchall())
        self.assertEqual(titles, {'ABW-358': 'ABW-358 的标题', 'ABW-359': None})
        self.assertTrue(commits)
        self.assertTrue(all(commits))
        self.assertFalse((self.root / 'generated' / 'avatars').exists())

    def test_profile_evidence_gives_the_candidate_a_new_identity(self):
        """把资料页证据并进 NFO 那条候选之后，`candidate_key` 换成新取值的那一个。

        键是「用户批准的是哪一版」的唯一凭据。补了 DMM 编号和官方头像却留着旧键，
        事后按键回溯拿到的是没有这些证据的那一版，两边对不上。
        """
        groups = {}
        key = 'asset:1:performers'
        people = [{'name': '涼森れむ'}]
        groups[key] = {'item_key': key, 'field': 'performers',
                       'candidates_json': json.dumps(
                           [{'candidate_key': _candidate_identity('local_nfo', people),
                             'source': 'local_nfo', 'value': people}], ensure_ascii=False)}
        before = json.loads(groups[key]['candidates_json'])[0]['candidate_key']

        _merge_local_performer_profiles(groups, key, {'value': [{
            'name': '涼森れむ', 'external_id': '1051912',
            'thumb_url': 'https://pics.dmm.co.jp/mono/actjpgs/suzumori_remu.jpg',
            'profile_source': 'r18dev'}]}, 'r18dev')

        candidate = json.loads(groups[key]['candidates_json'])[0]
        self.assertNotEqual(candidate['candidate_key'], before)
        self.assertEqual(candidate['candidate_key'],
                         _candidate_identity('local_nfo', candidate['value']))

    def test_offline_scan_finishes_locally_and_leaves_only_remote_rows_for_retry(self):
        """断网那一趟：要出网的行记成可重试，一个来源都不问；联网后重试补齐。

        文件名读不出番号的行没有来源可问，不进重试集合。"""
        from peach.library_processing import OFFLINE_MESSAGE
        from peach.network_reachability import NetworkReachability
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4', 'SSIS-057.mp4', 'holiday.mp4')
        provider = stub_provider()
        provider.query.return_value = {'id': 'SSIS-057', 'title': '作品资料'}
        provider.cover.return_value = False
        factory = Mock(return_value=provider)
        generated, covers = self.root / 'generated', self.root / 'covers'
        offline = NetworkReachability(check=lambda: False, retry_delay=0)
        self.addCleanup(offline.stop)

        result = process_library(config, db, generated, covers, provider_factory=factory, stage='metadata',
                                 database=LedgerDatabase(db), network=offline)

        self.assertEqual(provider.method_calls, [])
        self.assertEqual((result['status'], result['offline_skipped']), ('failed', 2))
        with closing(sqlite3.connect(db)) as connection:
            ids = dict(connection.execute('SELECT name,id FROM asset'))
        self.assertEqual(sorted(result['retryable_asset_ids']), sorted([ids['ABW-358.mp4'], ids['SSIS-057.mp4']]))
        self.assertIn('holiday.mp4', ids)
        self.assertEqual({issue['message'] for issue in result['issue_preview']}, {OFFLINE_MESSAGE})

        online = NetworkReachability(check=lambda: True, retry_delay=0)
        self.addCleanup(online.stop)
        retried = process_library(config, db, generated, covers, provider_factory=factory,
                                  database=LedgerDatabase(db), network=online,
                                  retry_ids=result['retryable_asset_ids'])
        self.assertEqual(retried['offline_skipped'], 0)
        self.assertEqual({call.args[0] for call in provider.query.call_args_list}, {'ABW-358', 'SSIS-057'})

    def test_spent_source_budget_stops_remote_rows_with_one_summary(self):
        """整趟采集预算到顶后，后面要出网的行一家都不问，只记一条汇总，留给重试接着采。"""
        from peach.scraping_access import BUDGET_SPENT
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4', 'SSIS-057.mp4', 'SSIS-058.mp4')
        provider = stub_provider()
        provider.query.return_value = {'id': 'ABW-358', 'title': '作品资料'}
        provider.cover.return_value = False
        # 第一部问完预算就到顶。
        provider.budget_spent.side_effect = lambda: BUDGET_SPENT['seconds'] if provider.query.called else ''
        generated, covers = self.root / 'generated', self.root / 'covers'

        result = process_library(config, db, generated, covers, provider_factory=Mock(return_value=provider),
                                 stage='metadata', database=LedgerDatabase(db))

        self.assertEqual(len({call.args[0] for call in provider.query.call_args_list}), 1)
        self.assertEqual(result['budget_skipped'], 2)
        summary = [issue for issue in result['issue_preview'] if issue['message'].startswith('本趟采集时间已用完')]
        self.assertEqual([issue['message'] for issue in summary],
                         ['本趟采集时间已用完，还有 2 部没问外部来源，再跑一次接着采。'])
        self.assertTrue(result['error'].startswith('本趟采集时间已用完，还有 2 部'))
        asked = {call.args[0] for call in provider.query.call_args_list}
        with closing(sqlite3.connect(db)) as connection:
            unasked = {row_id for row_id, code in connection.execute('SELECT id,code FROM asset')
                       if code not in asked}
        self.assertEqual(len(unasked), 2)
        self.assertLessEqual(unasked, set(result['retryable_asset_ids']))
        self.assertLessEqual(unasked, set(result['paused_asset_ids']))

        fresh = stub_provider()
        fresh.query.return_value = {'id': 'SSIS-057', 'title': '作品资料'}
        fresh.cover.return_value = False
        process_library(config, db, generated, covers, provider_factory=Mock(return_value=fresh),
                        database=LedgerDatabase(db), retry_ids=result['retryable_asset_ids'])
        self.assertLessEqual({code for code in ('ABW-358', 'SSIS-057', 'SSIS-058') if code not in asked},
                             {call.args[0] for call in fresh.query.call_args_list})

    def test_online_sources_only_offer_fields_the_ledger_has_no_value_for(self):
        """账本有日文原题，r18 的英文机翻不是分歧，只是写法。"""
        media = self.root / 'media'
        media.mkdir()
        (media / 'DASS-468.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.query.return_value = {'id': 'DASS-468', 'title': 'I Was Spoiled To Death', 'maker': 'Das',
                                       'series': 'Spoiled To Death', 'release_date': '2024-09-10',
                                       'actresses': [{'japanese_name': '胡桃さくら'}]}
        factory = Mock(return_value=provider)
        candidates = self.root / 'generated/library-metadata-field-candidates.csv'
        process_library(config, db, self.root / 'generated', self.root / 'covers', provider_factory=factory)
        self.assertEqual({row['field'] for row in read_rows(candidates)},
                         {'title', 'studio', 'series', 'release_date', 'performers'})
        with closing(sqlite3.connect(db)) as connection, connection:
            asset_id = connection.execute("SELECT id FROM asset WHERE code='DASS-468'").fetchone()[0]
            connection.execute("UPDATE asset SET catalog_title=?, studio=?, series=?, release_date=? WHERE id=?",
                               ('ふわとろ巨乳の年下義母 胡桃さくら', 'Das', 'ふわとろ巨乳の年下義母',
                                '2024-09-06', asset_id))
            connection.execute("INSERT INTO asset_tag(asset_id, tag, confidence, source) VALUES(?,?,?,?)",
                               (asset_id, '巨乳', 1.0, 'user'))
            connection.execute("INSERT INTO entity(kind, canonical_name, normalized_name, created_at, updated_at) "
                               "VALUES(?,?,?,?,?)",
                               ('performer', '胡桃樱花', 'hutaoyinghua', '2026-09-15', '2026-09-15'))
            entity_id = connection.execute("SELECT id FROM entity WHERE canonical_name='胡桃樱花'").fetchone()[0]
            connection.execute("INSERT INTO asset_entity(asset_id, entity_id, role, source, confidence) "
                               "VALUES(?,?,?,?,?)", (asset_id, entity_id, 'performer', 'user', 1.0))
        candidates.unlink()
        process_library(config, db, self.root / 'generated', self.root / 'covers', provider_factory=factory)
        self.assertEqual(list(read_rows(candidates, missing_ok=True)), [])
        self.assertEqual([call.args[1] for call in provider.query.call_args_list], ['r18dev', 'javdb'])

    def test_a_performer_marker_is_not_a_content_tag_the_ledger_already_has(self):
        """`演员:` 是出演者在 `asset_tag` 上的扁平投影，算成标签就再也采不回 genre。
        """
        media = self.root / 'media'
        media.mkdir()
        (media / 'MIDE-612.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.query.return_value = {'id': 'MIDE-612', 'title': '痴女秘書', 'maker': 'MOODYZ',
                                       'release_date': '2018-01-01', 'genres': ['淫語'],
                                       'actresses': [{'japanese_name': '本田岬'}]}
        factory = Mock(return_value=provider)
        candidates = self.root / 'generated/library-metadata-field-candidates.csv'
        process_library(config, db, self.root / 'generated', self.root / 'covers', provider_factory=factory)
        with closing(sqlite3.connect(db)) as connection, connection:
            asset_id = connection.execute("SELECT id FROM asset WHERE code='MIDE-612'").fetchone()[0]
            connection.execute("UPDATE asset SET catalog_title=?, studio=?, release_date=? WHERE id=?",
                               ('痴女秘書', 'MOODYZ', '2018-01-01', asset_id))
            connection.execute("INSERT INTO asset_tag(asset_id, tag, confidence, source) VALUES(?,?,?,?)",
                               (asset_id, '演员:本田岬', 1.0, 'user'))
        candidates.unlink()
        process_library(config, db, self.root / 'generated', self.root / 'covers', provider_factory=factory)
        self.assertIn('tags', {row['field'] for row in read_rows(candidates, missing_ok=True)})

    def _collect_with_maker(self, code, maker, payload, r18dev=None, javdb=None):
        """一部有码片走采集，官方档由经桥的片商站 `maker` 答 `payload`；返回 (provider, 候选行)。"""
        media = self.root / 'media'
        media.mkdir()
        (media / f'{code}.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.amane.side_effect = None
        provider.amane.return_value = [(maker, {'id': code, 'content_id': code, 'source': maker, **payload})]
        provider.query.return_value = r18dev or {'id': code}
        if javdb is not None:
            other_query = provider.query.side_effect
            provider.query.side_effect = lambda query, source='r18dev', **kwargs: (
                javdb if source == 'javdb' else other_query(query, source, **kwargs))
        process_library(config, db, self.root / 'generated', self.root / 'covers',
                        provider_factory=Mock(return_value=provider))
        return provider, read_rows(self.root / 'generated/library-metadata-field-candidates.csv')

    def _collect_amateur(self, code, wiki_answers, performer=None):
        """一部素人片走采集：MGStage 给齐标量、演员只给素人名义，认人 Wiki 按 `wiki_answers` 答。

        `performer` 给了就先把这个演员挂到账本上，这一行就不缺演员。返回 (provider, 候选行)。"""
        media = self.root / 'media'
        media.mkdir()
        (media / f'{code}.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        if performer:
            # 先扫一遍入库，再把标量与演员写进账本：这一行只剩列表字段可补。第一遍桩出来的「没有」
            # 记忆一并清掉，第二遍问不问 Wiki 只看这一行缺不缺演员。
            from peach.library_processing import misses_path
            scan = stub_provider()
            scan.query.return_value = {'id': code}
            process_library(config, db, self.root / 'generated', self.root / 'covers',
                            provider_factory=Mock(return_value=scan))
            with closing(sqlite3.connect(db)) as connection, connection:
                connection.execute("UPDATE asset SET catalog_title=?, studio=?, release_date=? WHERE code=?",
                                   ('素人の標題', 'ラグジュTV', '2024-01-01', code))
                connection.execute("INSERT INTO entity(kind, canonical_name, normalized_name, created_at, updated_at) "
                                   "VALUES('performer', ?, ?, '2026-11-05', '2026-11-05')", (performer, performer))
                connection.execute("INSERT INTO asset_entity(asset_id, entity_id, role, source, confidence) "
                                   "SELECT a.id, e.id, 'performer', 'manual', 1.0 FROM asset a, entity e "
                                   "WHERE a.code=? AND e.canonical_name=?", (code, performer))
            misses_path(config).unlink(missing_ok=True)
            (self.root / 'generated/library-metadata-field-candidates.csv').unlink(missing_ok=True)
        provider = stub_provider()
        provider.amane.side_effect = None
        provider.amane.return_value = [('mgstage', {
            'id': code, 'content_id': code, 'source': 'mgstage', 'title': '素人の標題', 'maker': 'ラグジュTV',
            'release_date': '2024-01-01', 'actresses': [{'japanese_name': 'まいな'}]})]

        def wiki(source, query, **_):
            if source not in wiki_answers:
                raise NotFound('Wiki 搜索范围内未取得精确作品表格行')
            return [(source, {'id': query, 'source': source, 'actresses': [{'japanese_name': wiki_answers[source]}]})]

        provider.wiki.side_effect = wiki
        process_library(config, db, self.root / 'generated', self.root / 'covers',
                        provider_factory=Mock(return_value=provider))
        return provider, read_rows(self.root / 'generated/library-metadata-field-candidates.csv', missing_ok=True)

    def test_a_missing_amateur_cast_asks_the_name_wikis_after_mgstage_and_stops_at_the_first_answer(self):
        """MGStage 只给素人名义，缺演员的素人片接着问认人 Wiki；素人系総合 Wiki 没有就问 av_neme，
        有一个给出艺名就停，不再落到综合索引（ADR-0145）。"""
        provider, rows = self._collect_amateur('259LUXU-1378', {'av_neme': '優梨まいな'})
        self.assertEqual([call.args[0] for call in provider.wiki.call_args_list], ['sougouwiki', 'av_neme'])
        provider.community.assert_not_called()
        performers = next(row for row in rows if row['field'] == 'performers')
        self.assertEqual({candidate['source'] for candidate in json.loads(performers['candidates_json'])},
                         {'mgstage', 'av_neme'})

    def test_an_amateur_code_neither_wiki_knows_settles_on_mgstage_without_the_community_sites(self):
        provider, rows = self._collect_amateur('259LUXU-1378', {})
        self.assertEqual([call.args[0] for call in provider.wiki.call_args_list], ['sougouwiki', 'av_neme'])
        provider.community.assert_not_called()
        performers = next(row for row in rows if row['field'] == 'performers')
        self.assertEqual({candidate['source'] for candidate in json.loads(performers['candidates_json'])},
                         {'mgstage'})

    def test_an_amateur_row_that_already_has_its_cast_does_not_ask_the_wikis(self):
        provider, _ = self._collect_amateur('259LUXU-1378', {'sougouwiki': '優梨まいな'}, performer='優梨まいな')
        provider.wiki.assert_not_called()

    def test_javdb_tags_are_collected_with_their_community_identity_after_maker_scalars(self):
        provider, rows = self._collect_with_maker('SSIS-057', 'makers', {
            'title': '標題', 'maker': 'エスワン ナンバーワンスタイル', 'release_date': '2021-05-07',
            'genres': ['巨乳'], 'actresses': [{'japanese_name': '葵つかさ'}]},
            javdb={'id': 'SSIS-057', 'genres': ['高跟鞋', '絲襪', '待收錄分類']})
        self.assertEqual([call.args[1] for call in provider.query.call_args_list], ['javdb'])
        provider.community.assert_not_called()
        tags = next(row for row in rows if row['field'] == 'tags')
        candidate = next(c for c in json.loads(tags['candidates_json']) if c['source'] == 'javdb')
        self.assertEqual(candidate['value'], ['高跟', '丝袜'])
        self.assertEqual(candidate['unmapped_genres'], ['待收錄分類'])
        self.assertEqual((candidate['source_kind'], candidate['official']), ('community', False))

    def test_a_maker_site_answering_every_scalar_settles_the_chain_before_r18dev(self):
        """片商官网给齐标量后，只额外请求 JavDB 内容类别。"""
        provider, rows = self._collect_with_maker('SSIS-057', 'makers', {
            'title': '標題', 'maker': 'エスワン ナンバーワンスタイル', 'release_date': '2021-05-07',
            'genres': ['巨乳'], 'actresses': [{'japanese_name': '葵つかさ'}]})
        self.assertEqual(provider.amane.call_args.kwargs['route'], ('makers',))
        self.assertEqual([call.args[1] for call in provider.query.call_args_list], ['javdb'])
        provider.community.assert_not_called()
        title = next(row for row in rows if row['field'] == 'title')
        self.assertEqual([candidate['source'] for candidate in json.loads(title['candidates_json'])], ['makers'])

    def test_a_maker_site_without_tags_leaves_them_to_r18dev_but_not_to_the_indexes(self):
        """FALENO 官网不给类别：继续请求 r18.dev 与 JavDB。"""
        provider, rows = self._collect_with_maker('FSDSS-437', 'faleno', {
            'title': '標題', 'maker': 'FALENO', 'release_date': '2022-07-07',
            'actresses': [{'japanese_name': '女優'}]},
            r18dev={'id': 'FSDSS-437', 'genres': ['巨乳']})
        self.assertEqual(provider.amane.call_args.kwargs['route'], ('faleno',))
        self.assertEqual([call.args[1] for call in provider.query.call_args_list], ['r18dev', 'javdb'])
        provider.community.assert_not_called()
        tags = next(row for row in rows if row['field'] == 'tags')
        self.assertEqual({candidate['source'] for candidate in json.loads(tags['candidates_json'])}, {'r18dev'})

    def test_the_collector_carries_the_cookies_saved_in_scraping_settings(self):
        """采集设置里贴的 JavBus Cookie 要真的跟着采集走。

        凭据根多给一层 `follow` 不会报错，只会让每个来源都读成「没贴过 Cookie」，
        表现是 JavBus 一直回年龄确认页。
        """
        from peach import scraping_access
        from peach.library_processing import _RemoteSession
        config = PeachConfig(self.root, self.root / 'config.toml', present=True)
        scraping_access.save(config.directory('secrets'), 'javbus', {'cookie': 'existmag=all; age=verified'})
        session = _RemoteSession(config, None, None, retrying=False)
        root = session.provider().transport.inner.root
        self.assertTrue(list(scraping_access.cookie_jar(scraping_access.values_for(root, 'javbus'), 'javbus')))

    def test_a_candidate_repeating_the_current_value_is_not_a_question(self):
        """来源给的取值和账本里那个字一模一样时没有什么可判断的。"""
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_assets(db, 'ABW-358.mp4')
        provider = stub_provider()
        provider.query.return_value = {'id': 'ABW-358', 'title': '涼森れむ流'}
        factory = Mock(return_value=provider)
        candidates = self.root / 'generated/library-metadata-field-candidates.csv'
        process_library(config, db, self.root / 'generated', self.root / 'covers', provider_factory=factory)
        self.assertIn('title', {row['field'] for row in read_rows(candidates)})
        with closing(sqlite3.connect(db)) as connection, connection:
            connection.execute("UPDATE asset SET catalog_title=? WHERE code='ABW-358'", ('涼森れむ流',))
        candidates.unlink()
        process_library(config, db, self.root / 'generated', self.root / 'covers', provider_factory=factory)
        from peach.web_contract import WebContract
        from peach.web_review import q_review
        queue = q_review(WebContract(db, candidate_root=candidates.parent))['sections']['metadata_fields']
        self.assertNotIn('title', {row['field'] for row in queue})

    def test_r18_metadata_takes_japanese_title_series_and_names(self):
        from peach.library_processing import LibraryMetadataProvider
        detail = {'content_id': '118abw358', 'title': 'Remu Style', 'maker': {'name': 'Prestige'},
                  'series': {'name': 'HOW TO SEX'}, 'actresses': [{'name': 'Remu Suzumori'}]}
        combined = {'content_id': '118abw358', 'title_ja': '涼森れむ流', 'series_name_ja': '保健室の先生',
                    'label_name_ja': 'ABSOLUTELY WONDERFUL', 'maker_name_ja': 'プレステージ',
                    'actresses': [{'id': 1051912, 'image_url': 'suzumori_remu.jpg',
                                   'name_kanji': '涼森れむ', 'name_kana': 'すずもりれむ',
                                   'name_romaji': 'Remu Suzumori'}],
                    'directors': [{'name_kanji': 'チャーリー中田'}]}
        pages = lambda transport, url, **kwargs: json.dumps(combined if 'combined=' in url else detail)
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages) as fetch:
            payload = provider.query('ABW-358')
        self.assertIn('combined=118abw358', fetch.call_args_list[1].args[1])
        fields = _fields(payload)
        self.assertEqual(fields['title']['value'], '涼森れむ流')
        self.assertEqual(fields['series']['value'], '保健室の先生')
        self.assertEqual(fields['performers']['display_value'], '涼森れむ')
        self.assertEqual(fields['performers']['value'][0]['external_id'], '1051912')
        self.assertEqual(fields['performers']['value'][0]['aliases'],
                         ['すずもりれむ', 'Remu Suzumori'])
        self.assertEqual(fields['performers']['value'][0]['thumb_url'],
                         'https://pics.dmm.co.jp/mono/actjpgs/suzumori_remu.jpg')
        # 账本厂牌实体用品牌名，日文写法会另起一个实体。
        self.assertEqual(fields['studio']['value'], 'Prestige')

    def test_r18_genres_are_taken_in_japanese_not_in_r18s_english(self):
        """英文是 r18 在 DMM 那套词上再译一层，取日文原词才不丢信息。

        丢的是词根：`その他フェチ` 一眼看得出是「フェチ」那一格的兜底，从
        `Other Fetishes` 反推不回去。英文写法要另外逐条登记才追得平。
        """
        from peach.library_processing import LibraryMetadataProvider
        detail = {'content_id': '118miad573', 'title': 'x',
                  'categories': [{'name': 'Variety'}, {'name': 'Other Fetishes'},
                                 {'name': 'Slender'}]}
        combined = {'content_id': '118miad573',
                    'categories': [{'name_en': 'Variety', 'name_ja': '企画'},
                                   {'name_en': 'Other Fetishes', 'name_ja': 'その他フェチ'},
                                   {'name_en': 'Slender', 'name_ja': 'スレンダー'}]}
        pages = lambda transport, url, **kwargs: json.dumps(combined if 'combined=' in url else detail)
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            payload = provider.query('MIAD-573')
        self.assertEqual(payload['genres'], ['企画', 'その他フェチ', 'スレンダー'])
        tags, unmapped = map_genres(payload['genres'])
        self.assertEqual(tags, ['苗条'])
        self.assertEqual(unmapped, [], '`企画` 是发行企划、`その他フェチ` 是兜底格，都按非内容排除')

    def test_without_the_japanese_page_r18_gives_no_english_title_or_romaji_cast(self):
        from peach.jav_cover_fetch import Unavailable
        from peach.library_processing import LibraryMetadataProvider
        detail = {'content_id': '118abw358', 'title': 'Remu Style', 'actresses': [{'name': 'Remu Suzumori'}],
                  'categories': [{'name': 'Slender'}]}
        def pages(transport, url, **kwargs):
            if 'combined=' in url:
                raise Unavailable('HTTP 503')
            return json.dumps(detail)
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            payload = provider.query('ABW-358')
        fields = _fields(payload)
        self.assertNotIn('title', fields, '英文页的标题是 r18 的译文，留空让来源链去问下一家')
        self.assertNotIn('performers', fields, '罗马字演员会建出罗马字的女优实体')
        self.assertEqual(payload['genres'], ['Slender'], '日文页没取到时，genre 仍然能投影')
        self.assertNotIn('translations', payload)

    def test_fc2cmadb_asks_a_second_time_for_the_women_that_page_holds_back(self):
        """女优是那一页的延迟 prop：第一跳拿到的 HTML 里一个人也没有。"""
        from peach.library_processing import LibraryMetadataProvider
        asked = []
        def pages(transport, url, **kwargs):
            asked.append((url, kwargs.get('extra_headers') or {}))
            if 'fc2cmadb.com' not in url:
                raise NotFound('官方那一页已空')
            if kwargs.get('extra_headers'):
                return json.dumps({'props': {'actresses': [{'name': '野々宮すず'}]}}).encode()
            return _mirror_page()
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            found = provider.fc2('FC2-PPV-3189161', route=('fc2', 'fc2cmadb'))
        self.assertEqual(found, [('fc2cmadb', found[0][1])])
        self.assertEqual(found[0][1]['actresses'], [{'japanese_name': '野々宮すず'}])
        second = [headers for url, headers in asked if headers]
        self.assertEqual([headers['X-Inertia-Partial-Data'] for headers in second], ['actresses'])
        self.assertEqual(_fields(found[0][1])['performers']['display_value'], '野々宮すず',
                         '点名问来的女优进演员候选')

    def test_a_silent_second_ask_costs_the_women_and_nothing_else(self):
        """那一跳撞上限流是常事，其余字段是站上最全的一份，不跟着一起丢。"""
        from peach.jav_cover_fetch import Unavailable
        from peach.library_processing import LibraryMetadataProvider
        def pages(transport, url, **kwargs):
            if 'fc2cmadb.com' not in url:
                raise NotFound('官方那一页已空')
            if kwargs.get('extra_headers'):
                raise Unavailable('HTTP 429')
            return _mirror_page()
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            found = provider.fc2('FC2-PPV-3189161', route=('fc2', 'fc2cmadb'))
        self.assertEqual(found[0][1]['actresses'], [])
        self.assertEqual(found[0][1]['title'], '【無】コスプレシリーズ')

    def _fc2_provider(self, asked, *, image='https://storage92000.contents.fc2.com/file/1.jpg'):
        """三档都摆好的 FC2 链：官方页已空，镜像在，JavArchive 上另有一张转存封面。"""
        from peach.library_processing import LibraryMetadataProvider
        def pages(transport, url, **kwargs):
            if 'fc2cmadb.com' in url:
                if kwargs.get('extra_headers'):
                    # 女优那一栏点名再问一次，问的还是这一页，不算又问了一档。
                    return json.dumps({'props': {'actresses': []}}).encode()
                asked.append(url)
                return _mirror_page(image=image, video=3232110)
            asked.append(url)
            if 'javarchive.com' in url:
                return _archive_pages(url)
            raise NotFound('官方那一页已空')
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        return provider, pages

    def test_the_metadata_step_stops_at_the_source_that_answers(self):
        """标量字段够了就不必再问一档：那一趟只多一批标签，一份流量却是实打实的。"""
        asked = []
        provider, pages = self._fc2_provider(asked)
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            found = provider.fc2('FC2-PPV-3232110')
        self.assertEqual([source for source, _ in found], ['fc2cmadb'])
        self.assertFalse([url for url in asked if 'javarchive.com' in url])

    def _live_fc2_provider(self, asked, *, mirror=True):
        """官方商品页还在：它答上了标题、卖家和发行日，却没有演员栏。"""
        from peach.library_processing import LibraryMetadataProvider
        product = {'@type': 'Product', '@id': 'article:3232110', 'sku': '3232110', 'name': '在售的那一部',
                   'image': {'url': 'https://storage92000.contents.fc2.com/file/1.jpg'},
                   'brand': {'url': 'https://adult.contents.fc2.com/users/rina_vlog/'}}
        shop = (f'<script type="application/ld+json">{json.dumps(product, ensure_ascii=False)}</script>'
                '<div class="items_article_headerInfo"><h3>在售的那一部</h3>'
                '<a href="https://adult.contents.fc2.com/users/rina_vlog/">梨奈</a></div>'
                '<div class="items_article_Releasedate"><p>販売日 : 2022/04/28</p></div>')
        def pages(transport, url, **kwargs):
            if 'fc2cmadb.com' in url:
                if not mirror:
                    asked.append(url)
                    raise NotFound('镜像站上没有这一部')
                if kwargs.get('extra_headers'):
                    return json.dumps({'props': {'actresses': [{'name': '梨奈'}]}}).encode()
                asked.append(url)
                return _mirror_page(video=3232110)
            asked.append(url)
            if 'javarchive.com' in url:
                return _archive_pages(url)
            return shop.encode()
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        return provider, pages

    def test_a_live_product_without_women_still_asks_the_mirror_for_them(self):
        """发行方商品页没有演员栏，镜像站那一栏是 FC2 链上唯一对得上人的地方。"""
        asked = []
        provider, pages = self._live_fc2_provider(asked)
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            found = provider.fc2('FC2-PPV-3232110', required=('title', 'performers'))
        self.assertEqual([source for source, _ in found], ['fc2', 'fc2cmadb'])
        self.assertEqual(found[1][1]['actresses'], [{'japanese_name': '梨奈'}])
        self.assertFalse([url for url in asked if 'javarchive.com' in url], 'JavArchive 不给演员，不为演员去问它')

    def test_the_database_is_asked_for_the_women_the_mirror_does_not_name_and_javten_is_not(self):
        """镜像那一栏空着时接着问 FC2PPV-DB，它也有女优栏；JAVten 不给演员，不为演员去问它。"""
        from peach.library_processing import LibraryMetadataProvider
        asked = []
        database = ('<html><body><main><h1>FC2-PPV-3232110 在售的那一部</h1>'
                    '<div><div><p>出演女優</p></div><div><a href="/ja/actresses/x"><span><img alt="梨奈"></span>'
                    '<span>梨奈</span></a></div></div></main></body></html>')

        def pages(transport, url, **kwargs):
            asked.append(url)
            if 'fc2cmadb.com' in url:
                if kwargs.get('extra_headers'):
                    return json.dumps({'props': {'actresses': []}}).encode()
                return _mirror_page(video=3232110)
            if 'fc2ppv-db.com' in url:
                return database.encode()
            raise NotFound('别处都没有')

        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            found = provider.fc2('FC2-PPV-3232110', required=('title', 'performers'))
        self.assertEqual([source for source, _ in found], ['fc2cmadb', 'fc2ppvdb'])
        self.assertEqual(found[1][1]['actresses'], [{'japanese_name': '梨奈'}])
        self.assertFalse([url for url in asked if 'javten.com' in url or 'javarchive.com' in url])

    def test_a_row_that_already_has_its_cast_stops_at_the_product_page(self):
        asked = []
        provider, pages = self._live_fc2_provider(asked)
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            found = provider.fc2('FC2-PPV-3232110', required=('title',))
        self.assertEqual([source for source, _ in found], ['fc2'])
        self.assertFalse([url for url in asked if 'fc2cmadb.com' in url])

    def test_a_cached_product_page_counts_as_answered(self):
        """缓存里已有官方那页：只为演员去问镜像，镜像也没有就交空，不把整档记成「没有」。"""
        known = [{'id': 'FC2-PPV-3232110', 'title': '在售的那一部', 'actresses': []}]
        for mirror, sources in ((True, ['fc2cmadb']), (False, [])):
            asked = []
            provider, pages = self._live_fc2_provider(asked, mirror=mirror)
            with self.subTest(mirror=mirror), patch('peach.jav_cover_fetch._fetch', side_effect=pages):
                found = provider.fc2('FC2-PPV-3232110', required=('performers',),
                                     route=('fc2cmadb', 'javarchive'), known=known)
                self.assertEqual([source for source, _ in found], sources)
                self.assertFalse([url for url in asked if 'fc2cmadb.com' not in url], '官方页与 JavArchive 都不再问')

    def test_a_cached_answer_skips_non_cast_sources_and_reaches_the_mirror(self):
        from peach import metadata_routes
        known = [{'id': 'FC2-PPV-3232110', 'title': '缓存标题', 'actresses': []}]
        asked = []
        provider, pages = self._live_fc2_provider(asked)
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            found = provider.fc2('FC2-PPV-3232110', required=('performers',),
                                 route=metadata_routes.FC2_STAGE, known=known)
        self.assertEqual([source for source, _ in found], ['fc2cmadb'])
        self.assertTrue(asked)
        self.assertTrue(all('fc2cmadb.com' in url for url in asked))

    def test_the_cover_step_asks_the_rest_of_the_chain_for_more_image_sources(self):
        """答上的那一档给的地址下不下得来图，这一层判不出来，所以图源要凑齐再挑。"""
        asked = []
        provider, pages = self._fc2_provider(asked)
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            provider.fc2('FC2-PPV-3232110')
            found = provider.fc2('FC2-PPV-3232110', covers=True)
        self.assertEqual([source for source, _ in found], ['fc2cmadb', 'javarchive'])
        self.assertEqual(found[1][1]['cover_url'], _ARCHIVE_COVER)
        self.assertEqual([url for url in asked if 'fc2cmadb.com' in url and 'articles' in url].count(
            'https://fc2cmadb.com/articles/3232110'), 1, '资料那步问过的档不再问第二遍')

    def test_the_mirrors_placeholder_leaves_the_cover_to_the_next_source(self):
        """镜像站标着没有商品图时，它那一栏挂的是占位件，不是这部片的封面。"""
        asked = []
        provider, pages = self._fc2_provider(asked, image='/storage/images/article/no-image.jpg')
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            found = provider.fc2('FC2-PPV-3232110', covers=True)
        self.assertEqual(found[0][1]['cover_url'], '')
        self.assertEqual(found[0][1]['title'], '【無】コスプレシリーズ', '资料照旧带着走')
        self.assertEqual(found[1][1]['cover_url'], _ARCHIVE_COVER)

    def test_every_image_slot_on_the_page_becomes_a_candidate(self):
        """一页上收了几个图位就交几个：排头那张失效时，另一张还得有人量过。"""
        asked = []
        provider, pages = self._fc2_provider(asked)
        with patch('peach.jav_cover_fetch._fetch', side_effect=pages):
            candidates = provider._official_candidates('FC2-PPV-3232110')
        self.assertEqual([candidate.url for candidate in candidates],
                         ['https://storage92000.contents.fc2.com/file/1.jpg',
                          _ARCHIVE_COVER, _ARCHIVE_COVER_SECOND])

    def test_javdb_keeps_its_own_host_interval_on_both_of_its_hosts(self):
        """这一档的节奏由用户定，改动要连图床一起改：页面与图分别落在两个主机上。"""
        from peach.library_processing import SOURCE_INTERVALS
        self.assertEqual(SOURCE_INTERVALS, {'javdb.com': 3.0, 'jdbstatic.com': 3.0})

    def test_every_provider_waits_on_one_shared_host_interval(self):
        """想要作品资料采集、新作资料采集与资料处理各起一个 provider；同时跑时问 javdb 也要排同一条队。"""
        from peach.library_processing import SOURCE_LIMITER, LibraryMetadataProvider
        from peach.web_feeds import _transport
        with tempfile.TemporaryDirectory() as root:
            first, second = LibraryMetadataProvider(root), LibraryMetadataProvider(root)
            feed = _transport(SimpleNamespace(follow_secrets_root=Path(root)))
        self.assertIs(first.transport.limiter, SOURCE_LIMITER)
        self.assertIs(second.transport.limiter, SOURCE_LIMITER)
        self.assertIs(feed.limiter, SOURCE_LIMITER)

    def test_community_sources_are_asked_once_per_code_and_say_why_they_failed(self):
        """资料和封面两步都要社区来源的结果，javdb 的配额经不起同一部片问两遍。"""
        from peach.jav_cover_fetch import NotFound, Unavailable
        from peach.library_processing import LibraryMetadataProvider
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        avbase = Mock(side_effect=NotFound('AVBase 没有这个番号'))
        javdb = Mock(return_value={'id': 'ORETD-615'})
        asks = {'avbase': avbase, 'javdb': javdb}
        provider.site = lambda source, code, deadline=None: asks[source](provider.transport, code, deadline=deadline)
        with patch('peach.community_catalog.COMMUNITY_SOURCES', ('avbase', 'javdb')):
            self.assertEqual(provider.community('ORETD-615'), [('javdb', {'id': 'ORETD-615'})])
            provider.community('ORETD-615')
            javdb.side_effect = TimeoutError()
            with self.assertRaisesRegex(Unavailable, r'^javdb：处理出错（TimeoutError）$'):
                provider.community('ORETD-616')
            with self.assertRaisesRegex(Unavailable, 'javdb：'):
                provider.community('ORETD-616')
            javdb.side_effect = Unavailable('javdb 要求登录')
            with self.assertRaisesRegex(Unavailable, '^javdb 要求登录$'):
                provider.community('ORETD-617')
            javdb.side_effect = NotFound('javdb 没有这个番号')
            with self.assertRaises(NotFound):
                provider.community('ORETD-618')
        self.assertEqual(javdb.call_count, 4)

    def test_a_small_official_cover_stays_unless_a_bigger_one_is_confirmed_by_another_origin(self):
        """小封面比没有封面强；社区来源的大图要另一个图源对得上才换上（ADR-0030）。"""
        from peach.jav_cover_fetch import Candidate, NotFound, Unavailable
        from peach.library_processing import LibraryMetadataProvider
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        provider.community = Mock(return_value=[('javdb', {'cover_urls': ['https://c0.jdbstatic.com/covers/x.jpg']})])
        small = (Candidate('image.mgstage.com', 'https://image.mgstage.com/pf_o1.jpg'), (300, 200), b'small')
        large = (Candidate('img.javbus.com', 'https://img.javbus.com/covers/x.jpg'), (1200, 800), b'large',
                 ('javdb', 'mgstage'))
        covers = self.root / 'covers'
        with patch('peach.jav_cover_fetch.best_cover', return_value=small) as official, \
                patch('peach.community_catalog.verified_cover', return_value=large) as verified:
            self.assertTrue(provider.cover('ORETD-615', covers))
        self.assertEqual(official.call_args.kwargs['minimum_width'], 240)
        self.assertEqual(verified.call_args.kwargs['reference'], small)
        self.assertEqual((covers / 'ORETD-615.jpg').read_bytes(), b'large')
        evidence = json.loads((covers / 'ORETD-615.scraping.json').read_text(encoding='utf-8'))
        self.assertEqual((evidence['width'], evidence['verified_by']), (1200, ['javdb', 'mgstage']))

        with patch('peach.jav_cover_fetch.best_cover', return_value=small), \
                patch('peach.community_catalog.verified_cover', side_effect=Unavailable('javdb、mgstage 给的封面不是同一张图，无法互相印证')):
            self.assertTrue(provider.cover('ORETD-616', covers))
        self.assertEqual((covers / 'ORETD-616.jpg').read_bytes(), b'small')

        lone = (Candidate('img.javbus.com', 'https://img.javbus.com/covers/y.jpg'), (800, 538), b'lone', ())
        with patch('peach.jav_cover_fetch.best_cover', side_effect=NotFound('所有渠道都没有候选')), \
                patch('peach.community_catalog.verified_cover', return_value=lone):
            self.assertTrue(provider.cover('IPX-060', covers))
        evidence = json.loads((covers / 'IPX-060.scraping.json').read_text(encoding='utf-8'))
        self.assertEqual(((covers / 'IPX-060.jpg').read_bytes(), evidence['verified_by']), (b'lone', []),
                         '只有一个图源的封面照样装上，verified_by 为空即未经印证')

        with patch('peach.jav_cover_fetch.best_cover', side_effect=Unavailable('官方封面只有缩略图或占位图')), \
                patch('peach.community_catalog.verified_cover', side_effect=Unavailable('社区来源的封面下载失败')), \
                self.assertRaisesRegex(Unavailable, '^官方封面只有缩略图或占位图；社区来源的封面下载失败$'):
            provider.cover('ORETD-617', covers)
        provider.community.side_effect = NotFound('社区来源都没有这个番号')
        with patch('peach.jav_cover_fetch.best_cover', side_effect=NotFound('所有渠道都没有候选')), \
                self.assertRaises(NotFound):
            provider.cover('ORETD-618', covers)

    def test_catalog_connection_failure_preserves_installed_cover_and_provenance(self):
        from peach import jav_cover_fetch
        from peach.library_processing import LibraryMetadataProvider
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock(return_value=Mock(status=404, body=b''))
        candidate = jav_cover_fetch.candidate_for('https://official.example/missing.jpg')
        provider._official_candidates = Mock(return_value=(candidate,))
        provider.community = Mock(side_effect=NotFound('社区来源都没有这个番号'))
        covers = self.root / 'covers'
        covers.mkdir()
        target = covers / 'SSIS-057.jpg'
        buffer = io.BytesIO()
        Image.new('RGB', (800, 540), 'gray').save(buffer, format='JPEG')
        target.write_bytes(buffer.getvalue())
        provenance = target.with_suffix('.scraping.json')
        saved = json.dumps({'source_url': 'https://official.example/installed.jpg', 'checked_at': 1})
        provenance.write_text(saved, encoding='utf-8')
        with patch.object(jav_cover_fetch, 'dmm_evidence', side_effect=jav_cover_fetch.httpx.ConnectError('TLS EOF')), \
                patch.object(jav_cover_fetch, 'r18_evidence', return_value=jav_cover_fetch.MetadataEvidence()):
            with self.assertRaises(jav_cover_fetch.Unavailable) as caught:
                provider.cover('SSIS-057', covers)
        self.assertNotIsInstance(caught.exception, NotFound)
        provider.community.assert_called_once()
        self.assertEqual(target.read_bytes(), buffer.getvalue())
        self.assertEqual(provenance.read_text(encoding='utf-8'), saved)

    def test_a_thumbnail_on_disk_is_asked_again_and_only_a_wider_cover_replaces_it(self):
        """缩略图不算有了封面：发行方那里常常还留着原图，问来的更宽才换。"""
        from peach.jav_cover_fetch import Candidate
        from peach.library_processing import CoverKept, LibraryMetadataProvider
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        provider._official_candidates = Mock(return_value=())
        covers = self.root / 'covers'
        covers.mkdir()

        def picture(path, size):
            buffer = io.BytesIO()
            Image.new('RGB', size, 'gray').save(buffer, format='JPEG')
            path.write_bytes(buffer.getvalue())

        picture(covers / 'FC2-PPV-1.jpg', (800, 450))
        with patch('peach.jav_cover_fetch.best_cover') as official:
            self.assertFalse(provider.cover('FC2-PPV-1', covers))
        official.assert_not_called()

        picture(covers / 'FC2-PPV-2.jpg', (276, 154))
        big = (Candidate('storage.contents.fc2.com', 'https://storage.contents.fc2.com/2.jpg'),
               (1180, 2100), b'big')
        with patch('peach.jav_cover_fetch.best_cover', return_value=big):
            self.assertTrue(provider.cover('FC2-PPV-2', covers))
        self.assertEqual((covers / 'FC2-PPV-2.jpg').read_bytes(), b'big')

        picture(covers / 'FC2-PPV-3.jpg', (276, 154))
        before = (covers / 'FC2-PPV-3.jpg').read_bytes()
        # 同一张缩略图转存到别处常差一行像素：面积大一点不算更清楚。
        same = (Candidate('storage.contents.fc2.com', 'https://storage.contents.fc2.com/3.jpg'),
                (276, 155), b'same')
        provider.community = Mock(side_effect=NotFound('社区来源都没有这个番号'))
        with patch('peach.jav_cover_fetch.best_cover', return_value=same), \
                self.assertRaises(CoverKept):
            provider.cover('FC2-PPV-3', covers)
        self.assertEqual((covers / 'FC2-PPV-3.jpg').read_bytes(), before)

        # 官方这一趟没问成时，镜像给的缩略图不能让这部片一周都不再问。
        from peach.jav_cover_fetch import Unavailable
        mirror = (Candidate('img.javstore.net', 'https://img.javstore.net/3.jpg'), (276, 155), b'mirror')
        provider.community = Mock(return_value=[])
        with patch('peach.jav_cover_fetch.best_cover', side_effect=Unavailable('FC2：来源正在冷却')), \
                patch('peach.community_catalog.verified_cover', return_value=(*mirror, ())), \
                self.assertRaises(Unavailable) as raised:
            provider.cover('FC2-PPV-3', covers)
        self.assertNotIsInstance(raised.exception, CoverKept)
        self.assertEqual((covers / 'FC2-PPV-3.jpg').read_bytes(), before)

        # 官方图全回 404（卖家删了图）是确定答复：镜像那张不比本机宽，就是保留，一周不再问。
        with patch('peach.jav_cover_fetch.best_cover', side_effect=NotFound('官方封面地址都没有取到图片')), \
                patch('peach.community_catalog.verified_cover', return_value=(*mirror, ())), \
                self.assertRaises(CoverKept):
            provider.cover('FC2-PPV-3', covers)
        self.assertEqual((covers / 'FC2-PPV-3.jpg').read_bytes(), before)

    def test_a_verified_cover_replaces_a_wider_unverified_picture_of_something_else(self):
        """官方那一档按尺寸挑中的是正片截图：同页竖版商品图经 javdb 印证后，窄一点也换上。

        FC2 官方存储上那张是卖家自己传的商品图，没印证也不当错图换；已经印证过的也不换。
        """
        from peach.jav_cover_fetch import Candidate
        from peach.library_processing import CoverKept, LibraryMetadataProvider
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        portrait_url = 'https://img.javstore.net/images/FC2PPV-1PS.jpg'
        siblings = (Candidate('img.javstore.net', portrait_url),)
        provider._official_candidates = Mock(return_value=siblings)
        provider.community = Mock(return_value=[('javdb', {'cover_urls': ['https://c0.jdbstatic.com/covers/x.jpg']})])
        covers = self.root / 'covers'
        covers.mkdir()

        def gradient(size, rising):
            image = Image.new('L', size)
            image.putdata([int(255 * (x if rising else size[0] - 1 - x) / (size[0] - 1))
                           for x in range(size[0])] * size[1])
            buffer = io.BytesIO()
            image.convert('RGB').save(buffer, format='JPEG')
            return buffer.getvalue()

        screenshot = (Candidate('img.javstore.net', 'https://img.javstore.net/images/FC2PPV-1.jpg'),
                      (605, 364), gradient((605, 364), True))
        portrait = (siblings[0], (510, 616), gradient((510, 616), False), ('img.javstore.net', 'javdb'))

        def kept(code, **evidence):
            (covers / f'{code}.jpg').write_bytes(screenshot[2])
            (covers / f'{code}.scraping.json').write_text(json.dumps(
                {'source_url': screenshot[0].url, 'verified_by': [], **evidence}), encoding='utf-8')

        kept('FC2-PPV-1')
        with patch('peach.jav_cover_fetch.best_cover', return_value=screenshot), \
                patch('peach.community_catalog.verified_cover', return_value=portrait) as verified:
            self.assertTrue(provider.cover('FC2-PPV-1', covers))
        self.assertEqual(verified.call_args.kwargs['siblings'], siblings)
        self.assertEqual((covers / 'FC2-PPV-1.jpg').read_bytes(), portrait[2])
        evidence = json.loads((covers / 'FC2-PPV-1.scraping.json').read_text(encoding='utf-8'))
        self.assertEqual((evidence['width'], evidence['verified_by']), (510, ['img.javstore.net', 'javdb']))

        kept('FC2-PPV-2', source_url='https://storage71000.contents.fc2.com/file/1.jpg')
        kept('FC2-PPV-3', verified_by=['dmm', 'javdb'])
        for code in ('FC2-PPV-2', 'FC2-PPV-3'):
            with patch('peach.jav_cover_fetch.best_cover', return_value=screenshot), \
                    patch('peach.community_catalog.verified_cover', return_value=portrait), \
                    self.assertRaises(CoverKept):
                provider.cover(code, covers)
            self.assertEqual((covers / f'{code}.jpg').read_bytes(), screenshot[2])

    def test_codes_r18_does_not_know_are_collected_from_the_community_sources(self):
        """r18.dev 没有的番号问 AVBase 与 javdb，两家各留一条候选；免不免复核由落库那道闸按几家一致判。"""
        from peach.jav_cover_fetch import NotFound
        media = self.root / 'media'
        media.mkdir()
        (media / 'ORETD-615.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = Mock()
        provider.amane.side_effect = NotFound('片商官网没有这个番号')
        provider.query.side_effect = NotFound('HTTP 404')
        provider.community.return_value = [
            ('avbase', {'id': 'ORETD-615', 'title': 'たまき', 'release_date': '2024-01-05',
                        'source_url': 'https://www.avbase.net/works/orenoshirouto:ORETD-615'}),
            ('javdb', {'id': 'ORETD-615', 'title': 'たまき', 'release_date': '2024-01-04',
                       'source_url': 'https://javdb.com/v/abc'})]
        provider.cover.return_value = False
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=Mock(return_value=provider))
        self.assertEqual((result['status'], result['issue_count']), ('complete', 0))
        rows = {row['field']: row for row in read_rows(self.root / 'generated/library-metadata-field-candidates.csv')}
        title = json.loads(rows['title']['candidates_json'])
        self.assertEqual(sorted((c['source'], c['provider'], c['source_kind'], c['official'], c['provider_id'])
                                for c in title),
                         [('avbase', 'avbase-search', 'community', False, 'ORETD-615'),
                          ('javdb', 'javdb-api', 'community', False, 'ORETD-615')])
        self.assertEqual(rows['title']['source_profile'], 'library')
        self.assertEqual(len(json.loads(rows['release_date']['candidates_json'])), 2)

    def test_korean_mib_codes_ask_no_jav_source_for_metadata_or_cover(self):
        """`HA-101` 是 MIB 的编号，也是一部日本片的番号：问了就取回那部日本片。"""
        media = self.root / 'media'
        media.mkdir()
        for name in ('HA-101.mp4', 'ABW-001.mp4'):
            (media / name).write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.query.return_value = {'maker': 'Studio', 'id': 'ABW-001', 'source_url': ''}
        provider.cover.return_value = False
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=Mock(return_value=provider))
        self.assertEqual(result['status'], 'complete')
        self.assertEqual(result['identified'], 2)
        # r18.dev 只答了厂牌，链接着问 DMM 兜底；两问都只为 ABW-001 发。
        self.assertEqual([item.args[:2] for item in provider.query.call_args_list],
                         [('ABW-001', 'r18dev'), ('ABW-001', 'dmm')])
        self.assertEqual([item.args[0] for item in provider.cover.call_args_list], ['ABW-001'])

    def test_codes_of_other_systems_ask_nobody_and_misread_ones_ask_only_the_indexes(self):
        """国产的 `兔子先生TZ-105` 形状和有码一样，按有码链问是每一家都白问一遍、封面还可能取回同号日本片。

        文件名被读错了号的（`UWFr85dczsVeysGg` 读成 `UWFR-085`）只问综合索引一遍。
        """
        media = self.root / 'media'
        (media / '兔子先生TZ-105').mkdir(parents=True)
        (media / '兔子先生TZ-105' / '兔子先生TZ-105K杯.mp4').write_bytes(b'video')
        (media / 'UWFr85dczsVeysGg.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.cover.return_value = False
        with closing(sqlite3.connect(db)) as connection, connection:
            connection.execute("UPDATE asset SET code='TZ-105' WHERE name LIKE '%TZ-105%'")
            connection.execute("UPDATE asset SET code='UWFR-085' WHERE name LIKE 'UWF%'")
        process_library(config, db, self.root / 'generated', self.root / 'covers', stage='collect',
                        provider_factory=lambda: provider)
        provider.query.assert_not_called()
        provider.amane.assert_not_called()
        self.assertEqual([item.args[0] for item in provider.community.call_args_list], ['UWFR-085'])
        self.assertEqual([item.args[0] for item in provider.cover.call_args_list], ['UWFR-085'])

    def test_fc2_codes_ask_the_shop_itself_and_never_r18(self):
        """r18.dev 没有 FC2，问一次就是白等一次主机间隔；发行方自己那一页才有这批番号。"""
        media = self.root / 'media'
        media.mkdir()
        for name in ('FC2-PPV-1239052.mp4', 'ABW-001.mp4'):
            (media / name).write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.query.return_value = {'maker': 'Studio', 'id': 'ABW-001', 'source_url': ''}
        provider.fc2.return_value = [('fc2', {
            'id': 'FC2-PPV-1239052', 'content_id': '1239052', 'maker': 'FC2-PPV',
            'title': 'みお(19)の動画', 'label': '大人仮面Z', 'genres': ['おっぱい'],
            'release_date': '2024-03-31', 'actresses': [],
            'source_url': 'https://adult.contents.fc2.com/article/1239052/'})]
        provider.cover.return_value = False
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=Mock(return_value=provider))
        self.assertEqual(result['status'], 'complete')
        self.assertEqual([item.args[:2] for item in provider.query.call_args_list],
                         [('ABW-001', 'r18dev'), ('ABW-001', 'dmm')])
        self.assertEqual([item.args[0] for item in provider.fc2.call_args_list], ['FC2-PPV-1239052'])
        self.assertEqual(sorted(item.args[0] for item in provider.cover.call_args_list),
                         ['ABW-001', 'FC2-PPV-1239052'])
        self.assertEqual(result['issue_count'], 0)
        rows = {(row['code'], row['field']): row
                for row in read_rows(self.root / 'generated/library-metadata-field-candidates.csv')}
        title = json.loads(rows[('FC2-PPV-1239052', 'title')]['candidates_json'])
        self.assertEqual([(c['source'], c['provider'], c['source_kind'], c['official']) for c in title],
                         [('fc2', 'fc2-article', 'official', True)])
        self.assertEqual(json.loads(rows[('FC2-PPV-1239052', 'studio')]['candidates_json'])[0]['value'],
                         'FC2-PPV')

    def test_a_dated_code_asks_1pondo_only_when_this_file_says_it_is_theirs(self):
        """一本道与カリビアンコム 的番号同形：问错那家，答回来的是同一天发行的另一部片。

        指不着一本道的那条落到综合索引，不问 r18.dev：无码番号在它上面没有
        （`peach.metadata_routes.ROUTES['uncensored']`）。
        """
        media = self.root / 'media'
        (media / '1pon').mkdir(parents=True)
        (media / 'Carib-040221-001-FHD').mkdir()
        (media / '1pon' / '112312_478-1pon-whole1_hd.mp4').write_bytes(b'video')
        (media / 'Carib-040221-001-FHD' / '040221-001-carib-1080p.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.one_pondo.return_value = [('1pondo', {
            'id': '112312_478', 'content_id': '112312_478', 'maker': '一本道',
            'title': '裸演奏 〜第5回演奏会・ホルン〜', 'series': '裸演奏',
            'release_date': '2012-11-23', 'genres': ['スレンダー'],
            'actresses': [{'japanese_name': '飯岡かなこ', 'name_romaji': 'Kanako Iioka'}],
            'source_url': 'https://www.1pondo.tv/movies/112312_478/'})]
        provider.community.side_effect = None
        provider.community.return_value = [('javdb', {
            'id': '040221-001', 'maker': 'カリビアンコム', 'title': '未熟な僕と年上の彼女',
            'release_date': '2021-04-02', 'actresses': [{'japanese_name': '倉本すみれ'}],
            'source_url': 'https://javdb.com/v/carib'})]
        provider.cover.return_value = False
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=Mock(return_value=provider))
        self.assertEqual(result['status'], 'complete')
        self.assertEqual([item.args[0] for item in provider.one_pondo.call_args_list], ['112312_478'])
        self.assertEqual([item.args[0] for item in provider.community.call_args_list], ['040221-001'])
        provider.query.assert_not_called()
        rows = {(row['code'], row['field']): row
                for row in read_rows(self.root / 'generated/library-metadata-field-candidates.csv')}
        performers = json.loads(rows[('112312_478', 'performers')]['candidates_json'])
        self.assertEqual([(c['source'], c['provider'], c['official']) for c in performers],
                         [('1pondo', '1pondo-json', True)])
        self.assertEqual(performers[0]['display_value'], '飯岡かなこ')
        self.assertEqual(result['issue_count'], 0)

    def test_files_without_a_code_are_registered_but_not_reported(self):
        """账本里两万多行创作者作品本来就没有番号，逐行报问题只会淹掉真正要处理的几十条。"""
        media = self.root / 'media'
        media.mkdir()
        (media / '某创作者的作品.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        factory = Mock()
        reports = []
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=factory, report=lambda state: reports.append(dict(state)))
        factory.assert_not_called()
        self.assertEqual((result['status'], result['issue_count'], result['checked']), ('complete', 0, 1))
        self.assertEqual(reports[-1]['issue_preview'], [])

    def test_a_directory_name_sitting_in_the_code_column_counts_as_no_code(self):
        """`asset.code` 里的创作者自编号不是发行番号，拿去问来源的写法是空串。"""
        from peach.library_processing import _provider_code
        self.assertEqual(_provider_code('DTW003'), '')
        self.assertEqual(_provider_code('某创作者的作品'), '')
        self.assertEqual(_provider_code('TOKYO-HOT-N0762'), 'n0762')
        self.assertEqual(_provider_code('ABW-358'), 'ABW-358')

    def test_a_tokyo_hot_code_written_with_the_site_name_is_asked_for(self):
        """账本里按目录名落的 `TOKYO-HOT-N0762` 是真番号，要按规范写法去问来源。

        Tokyo-Hot 的编号是无码那条链，问的是综合索引而不是 r18.dev。
        """
        media = self.root / 'media'
        media.mkdir()
        (media / 'n0762.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.community.side_effect = None
        provider.community.return_value = [('javdb', {
            'id': 'n0762', 'maker': 'Tokyo-Hot', 'title': '東京熱 n0762',
            'release_date': '2011-09-30', 'actresses': [{'japanese_name': '倉本すみれ'}],
            'source_url': 'https://javdb.com/v/n0762'})]
        provider.cover.return_value = False
        with closing(sqlite3.connect(db)) as connection, connection:
            connection.execute("UPDATE asset SET code='TOKYO-HOT-N0762'")
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 stage='collect', provider_factory=lambda: provider)
        self.assertEqual([item.args[0] for item in provider.community.call_args_list], ['n0762'])
        provider.query.assert_not_called()
        self.assertEqual(result['issue_count'], 0)

    def test_a_throttled_source_reads_as_waiting_not_as_a_thing_that_went_wrong(self):
        """限流和取不到分开报：一个等一会儿就有，一个再点多少次都是同一句。"""
        from peach.jav_cover_fetch import NotFound
        from peach.scraping_access import SourcePaused
        media = self.root / 'media'
        media.mkdir()
        (media / 'STP-26232.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.query.side_effect = NotFound('HTTP 404')
        provider.community.side_effect = SourcePaused('来源正在冷却，请稍后重试；已有图片保留')
        provider.cover.side_effect = SourcePaused('本趟采集次数已用完，再跑一次接着采')
        state = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                provider_factory=Mock(return_value=provider))
        self.assertEqual([row['message'] for row in state['issue_preview']],
                         ['外部资料本趟没轮到：来源正在冷却，请稍后重试；已有图片保留',
                          '封面本趟没轮到：本趟采集次数已用完，再跑一次接着采'])
        self.assertEqual({row['severity'] for row in state['issue_preview']}, {'paused'})
        self.assertEqual((state['issue_count'], state['paused_count']), (2, 2))
        self.assertEqual(state['error'], '2 项都卡在来源限流上，等一会儿再跑一次。')
        self.assertEqual(state['retryable_asset_ids'], [1], '等来源放开之后重试仍然有意义')
        self.assertEqual(state['paused_asset_ids'], [1], '升级补全据此把这部片延后而不是判失败')

    def test_the_two_kinds_are_counted_apart_in_the_line_that_sums_them_up(self):
        from peach.library_processing import issue_summary
        self.assertEqual(issue_summary(0), '')
        self.assertEqual(issue_summary(3), '3 项需要处理，可重试未完成的部分。')
        self.assertEqual(issue_summary(3, 1),
                         '3 项需要处理，其中 1 项是来源限流，等一会儿再跑；其余可重试未完成的部分。')
        self.assertEqual(issue_summary(3, 3), '3 项都卡在来源限流上，等一会儿再跑一次。')

    def test_a_source_that_said_no_is_not_asked_again_for_a_week(self):
        """r18.dev 不认识的番号每轮都重问、每条卡一次 2 秒的主机间隔，答案永远一样。

        只记来源明确说「没有」的（`NotFound`）；超时与网络故障照旧下次再问。
        「重试未完成项」按上一任务的失败集合强制重试，不看这份记忆。
        """
        from peach.jav_cover_fetch import NotFound, Unavailable
        from peach.library_processing import _MissCache, misses_path
        media = self.root / 'media'
        media.mkdir()
        (media / 'STP-26232.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.query.side_effect = NotFound('HTTP 404')
        provider.community.side_effect = NotFound('社区来源都没有这个番号')
        provider.cover.side_effect = Unavailable('HTTP 503')
        run = lambda **extra: process_library(config, db, self.root / 'generated', self.root / 'covers',
                                              provider_factory=Mock(return_value=provider), **extra)
        first = run()
        self.assertEqual((provider.query.call_count, provider.community.call_count), (1, 1))
        self.assertEqual([row['message'] for row in first['issue_preview']],
                         ['封面未取得：来源返回 HTTP 503'], '来源说没有只报一个数，不占问题清单')
        self.assertEqual(first['notes'], {'querying_metadata': 1})
        recorded = json.loads(misses_path(config).read_text(encoding='utf-8'))
        self.assertEqual(list(recorded['misses']),
                         ['mgstage', 'sougouwiki', 'av_neme', 'avbase', 'javbus', 'javdb', 'r18dev'],
                         '按站记，不按档记')
        self.assertEqual(provider.amane.call_args.kwargs['route'], ('mgstage',))
        self.assertEqual(list(recorded['misses']['r18dev']), ['STP-26232'])

        provider.cover.side_effect = NotFound('所有渠道都没有候选')
        second = run()
        self.assertEqual((provider.query.call_count, provider.community.call_count), (1, 1), '资料 7 天内不再问')
        self.assertEqual(provider.cover.call_count, 2, '封面上次是来源故障，这次照问')
        self.assertEqual(second['issue_preview'], [])
        self.assertEqual(second['notes'], {'querying_metadata': 1, 'fetching_cover': 1})
        self.assertEqual(second['retryable_asset_ids'], [])
        self.assertEqual((second['status'], second['issue_count']), ('complete', 0))
        self.assertEqual((first['status'], first['issue_count']), ('failed', 1))
        # 状态文件里没有 `notes` 的任务，读出来要按日志把告知项和问题分开重算。
        stored = dict(second, status='failed', error='2 项需要处理，可重试未完成的部分。', issue_count=2,
                      issue_preview=[{'asset_id': 1, 'title': 'STP-26232.mp4', 'path': '',
                                      'message': message, 'severity': 'error'}
                                     for message in ('外部来源没有这部片的资料，7 天内不再问',
                                                     '外部来源没有这部片的封面，7 天内不再问')])
        stored.pop('notes')
        state_path(config).write_text(json.dumps(stored), encoding='utf-8')
        projected = snapshot(config)
        self.assertEqual((projected['status'], projected['issue_count'], projected['issue_preview']),
                         ('complete', 0, []))
        self.assertEqual(projected['notes'], {'querying_metadata': 1, 'fetching_cover': 1})
        self.assertEqual(json.loads(state_path(config).read_text(encoding='utf-8'))['status'], 'failed')

        third = run()
        self.assertEqual((provider.query.call_count, provider.cover.call_count), (1, 2))
        self.assertEqual(third['issue_count'], 0)
        self.assertEqual((third['status'], third['retryable_asset_ids']), ('complete', []))

        run(retry_ids=[1])
        self.assertEqual((provider.query.call_count, provider.cover.call_count), (2, 3), '重试未完成项不看记忆')

        cache = _MissCache(misses_path(config), now=lambda: time.time() + 8 * 24 * 3600)
        self.assertFalse(cache.fresh('r18dev', 'STP-26232'), '7 天后再问一次')
        self.assertFalse(_MissCache(self.root / 'missing.json').fresh('r18dev', 'STP-26232'))

    def test_a_source_that_already_answered_within_the_week_is_not_asked_again(self):
        """上一趟存下的原始快照还新鲜就直接用，不发请求。

        有效期与「说过没有」的记忆同一个（7 天）。给过待批候选的来源不重问；
        重试忽略过期/缺失记忆，只向尚未给过候选的来源请求新答复。
        """
        media = self.root / 'media'
        media.mkdir()
        (media / 'DASS-468.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        snapshot_path = config.directory('sources') / 'library-metadata' / 'DASS-468-r18dev.json'
        snapshot_path.parent.mkdir(parents=True, exist_ok=True)
        snapshot_path.write_text(json.dumps({
            'id': 'DASS-468', 'title': '甘やかされて', 'maker': 'Das', 'release_date': '2024-09-10',
            'actresses': [{'japanese_name': '胡桃さくら'}], 'source_url': 'https://r18.dev/'}),
            encoding='utf-8')
        artifact_rules.remember(snapshot_path, str(upgrade_rules.PROVIDER_EVIDENCE))
        provider = stub_provider()
        provider.query.return_value = json.loads(snapshot_path.read_text(encoding='utf-8'))
        provider.cover.return_value = False
        run = lambda **extra: process_library(config, db, self.root / 'generated', self.root / 'covers',
                                              provider_factory=Mock(return_value=provider), **extra)
        result = run()
        self.assertEqual([call.args[1] for call in provider.query.call_args_list], ['javdb'])
        provider.community.assert_not_called()
        self.assertEqual((result['status'], result['issue_count']), ('complete', 0))
        rows = {row['field']: json.loads(row['candidates_json'])
                for row in read_rows(self.root / 'generated/library-metadata-field-candidates.csv')}
        self.assertEqual([entry['source'] for entry in rows['title']], ['r18dev'])

        os.utime(snapshot_path, (time.time() - 8 * 24 * 3600,) * 2)
        run(retry_ids=[1])
        # r18dev 的整份答复已在待批候选表；重试不重复该来源。DMM 尚未给过候选，
        # 社区档在重试时可以再查此前只说过「没有」的 JavDB。
        retry_sources = [call.args[1] for call in provider.query.call_args_list[1:]]
        self.assertEqual(retry_sources, ['dmm'])
        provider.community.assert_called_once()
        self.assertIn('javdb', provider.community.call_args.kwargs['route'])
        rows = {row['field']: json.loads(row['candidates_json'])
                for row in read_rows(self.root / 'generated/library-metadata-field-candidates.csv')}
        self.assertEqual([entry['source'] for entry in rows['title']], ['r18dev'])
        self.assertEqual(rows['title'][0]['value'], '甘やかされて')

    def test_fresh_official_and_javdb_snapshots_supply_scalars_and_tags_without_queries(self):
        media = self.root / 'media'
        media.mkdir()
        (media / 'DASS-468.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        directory = config.directory('sources') / 'library-metadata'
        directory.mkdir(parents=True)
        documents = {
            'r18dev': {'id': 'DASS-468', 'title': '甘やかされて', 'maker': 'Das',
                      'release_date': '2024-09-10', 'actresses': [{'japanese_name': '胡桃さくら'}]},
            'javdb': {'id': 'DASS-468', 'genres': ['高跟鞋', 'Anal Play'], 'javdb_rule': 2,
                      'source_url': 'https://javdb.com/v/example'},
        }
        for source, payload in documents.items():
            path = directory / f'DASS-468-{source}.json'
            path.write_text(
                json.dumps(payload, ensure_ascii=False), encoding='utf-8')
            artifact_rules.remember(path, str(upgrade_rules.PROVIDER_EVIDENCE))
        provider = stub_provider()
        provider.cover.return_value = False
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=Mock(return_value=provider))
        provider.query.assert_not_called()
        provider.community.assert_not_called()
        self.assertEqual((result['status'], result['issue_count']), ('complete', 0))
        rows = {row['field']: json.loads(row['candidates_json'])
                for row in read_rows(self.root / 'generated/library-metadata-field-candidates.csv')}
        self.assertEqual([entry['source'] for entry in rows['title']], ['r18dev'])
        self.assertEqual([(entry['source'], entry['value']) for entry in rows['tags']],
                         [('javdb', ['高跟', '屁眼'])])
        self.assertEqual(Path(rows['tags'][0]['raw_snapshot']), directory / 'DASS-468-javdb.json')

    def test_javdb_snapshot_requires_current_identity_evidence_without_removing_raw_json(self):
        from peach.library_processing import _MissCache, _RemoteSession, misses_path
        from peach.javdb_identity import current_evidence
        config = PeachConfig(self.root, self.root / 'config.toml', present=True)
        directory = config.directory('sources') / 'library-metadata'
        directory.mkdir(parents=True)
        for marker in (None, 1, True, '2', 2):
            with self.subTest(marker=marker):
                payload = {'id': 'DASS-468', 'title': '原题', 'javdb_rule': marker}
                path = directory / 'DASS-468-javdb.json'
                path.write_text(json.dumps(payload), encoding='utf8')
                artifact_rules.remember(path, str(upgrade_rules.PROVIDER_EVIDENCE))
                before = path.read_bytes()
                session = _RemoteSession(config, None, _MissCache(misses_path(config)), retrying=False)
                self.assertEqual(session._cached_evidence(['javdb'], 'DASS-468'),
                                 [('javdb', payload, path)] if marker == 2 and type(marker) is int else [])
                self.assertEqual(current_evidence(payload), marker == 2 and type(marker) is int)
                self.assertEqual(path.read_bytes(), before)

    def test_damaged_snapshot_is_not_reused_even_with_a_current_receipt(self):
        from peach.library_processing import _MissCache, _RemoteSession, misses_path
        config = PeachConfig(self.root, self.root / 'config.toml', present=True)
        path = config.directory('sources') / 'library-metadata' / 'DASS-468-makers.json'
        path.parent.mkdir(parents=True)
        for field, value in (('title', '坏\ufffd标题'),
                             ('actresses', [{'japanese_name': '坏\ufffd姓名'}]),
                             ('genres', ['坏\ufffd标签'])):
            with self.subTest(field=field):
                path.write_text(json.dumps({'id': 'DASS-468', field: value}), encoding='utf-8')
                artifact_rules.remember(path, str(upgrade_rules.PROVIDER_EVIDENCE))
                before = path.read_bytes()
                session = _RemoteSession(config, None, _MissCache(misses_path(config)), retrying=False)
                self.assertEqual(session._cached_evidence(['makers'], 'DASS-468'), [])
                self.assertEqual(path.read_bytes(), before, '原始损坏证据保留供诊断')

        payload = {'id': 'DASS-468', 'title': '完整标题',
                   'collection_diagnostics': {'detail': '历史诊断\ufffd'}}
        path.write_text(json.dumps(payload), encoding='utf-8')
        artifact_rules.remember(path, str(upgrade_rules.PROVIDER_EVIDENCE))
        session = _RemoteSession(config, None, _MissCache(misses_path(config)), retrying=False)
        self.assertEqual(session._cached_evidence(['makers'], 'DASS-468'), [('makers', payload, path)])

    def test_expired_javdb_snapshot_is_requested_once_and_answered_sources_are_skipped(self):
        from peach.library_processing import _MissCache, _RemoteSession, misses_path
        config = PeachConfig(self.root, self.root / 'config.toml', present=True)
        path = config.directory('sources') / 'library-metadata' / 'DASS-468-javdb.json'
        path.parent.mkdir(parents=True)
        path.write_text(json.dumps({'id': 'DASS-468', 'genres': ['口交']}), encoding='utf-8')
        os.utime(path, (time.time() - 8 * 24 * 3600,) * 2)
        provider = Mock()
        provider.query.return_value = {'id': 'DASS-468', 'genres': ['高跟鞋']}
        session = _RemoteSession(config, Mock(return_value=provider),
                                 _MissCache(misses_path(config)), retrying=False)
        options = dict(issue=Mock(), deadline=time.monotonic() + 60)
        try:
            entries = session._preferred_tags({}, 'DASS-468', ['tags'], ('r18dev', 'javdb'),
                                              [], set(), **options)
            self.assertEqual([(source, payload['genres']) for source, payload, _ in entries],
                             [('javdb', ['高跟鞋'])])
            provider.query.assert_called_once()
            self.assertEqual(provider.query.call_args.args, ('DASS-468', 'javdb'))
            # 同一趟已取到的来源、已有待批候选的来源均不重问；新鲜快照直接复用。
            self.assertEqual(session._preferred_tags({}, 'DASS-468', ['tags'], ('r18dev', 'javdb'),
                                                      entries, set(), **options), [])
            self.assertEqual(session._preferred_tags({}, 'DASS-468', ['tags'], ('r18dev', 'javdb'),
                                                      [], {'javdb'}, **options), [])
            cached = session._preferred_tags({}, 'DASS-468', ['tags'], ('r18dev', 'javdb'),
                                             [], set(), **options)
            self.assertEqual(cached, entries)
            provider.query.assert_called_once()
        finally:
            session.close()

    def test_a_refused_javdb_tag_request_is_no_issue_when_the_chain_already_gave_tags(self):
        """MIAB-086：片商官网这一趟已给标签，JavDB 拒绝访问只是换不到更细的类别，不记成问题。"""
        from peach.library_processing import _MissCache, _RemoteSession, misses_path
        from peach.scraping_access import SourcePaused
        config = PeachConfig(self.root, self.root / 'config.toml', present=True)
        provider = Mock()
        provider.query.side_effect = SourcePaused('来源拒绝访问，暂停向它请求一段时间')
        session = _RemoteSession(config, Mock(return_value=provider),
                                 _MissCache(misses_path(config)), retrying=False)
        issue = Mock()
        options = dict(issue=issue, deadline=time.monotonic() + 60)
        official = [('makers', {'id': 'MIAB-086', 'genres': ['痴女', '护士']}, None)]
        try:
            self.assertEqual(session._preferred_tags({}, 'MIAB-086', ['tags'], ('makers', 'javdb'),
                                                     official, set(), **options), [])
            issue.assert_not_called()
            # 链上没给标签时照旧记成限流问题。
            session._preferred_tags({}, 'MIAB-086', ['tags'], ('makers', 'javdb'), [], set(), **options)
            self.assertTrue(issue.call_args.kwargs['paused'])
        finally:
            session.close()

    def test_a_cached_product_page_still_sends_the_row_to_the_mirror_for_its_cast(self):
        """缓存里只有官方商品页、那一页没有演员栏：这一行缺的演员照样去镜像站要，官方页不再问。"""
        media = self.root / 'media'
        media.mkdir()
        (media / 'FC2-PPV-2851534.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        product = {'id': 'FC2-PPV-2851534', 'title': 'キュートなバニーメイド', 'maker': 'rina_vlog',
                   'release_date': '2022-04-28', 'actresses': [], 'source_url': 'https://adult.contents.fc2.com/'}
        snapshot_path = config.directory('sources') / 'library-metadata' / 'FC2-PPV-2851534-fc2.json'
        snapshot_path.parent.mkdir(parents=True, exist_ok=True)
        snapshot_path.write_text(json.dumps(product, ensure_ascii=False), encoding='utf-8')
        artifact_rules.remember(snapshot_path, str(upgrade_rules.PROVIDER_EVIDENCE))
        provider = stub_provider()
        provider.fc2.return_value = [('fc2cmadb', {'id': 'FC2-PPV-2851534', 'actresses': [{'japanese_name': '梨奈'}],
                                                   'source_url': 'https://fc2cmadb.com/articles/2851534'})]
        provider.cover.return_value = False
        process_library(config, db, self.root / 'generated', self.root / 'covers',
                        provider_factory=Mock(return_value=provider))
        provider.fc2.assert_called_once()
        kwargs = provider.fc2.call_args.kwargs
        self.assertNotIn('fc2', kwargs['route'])
        self.assertEqual(kwargs['known'], [product])
        rows = {row['field']: json.loads(row['candidates_json'])
                for row in read_rows(self.root / 'generated/library-metadata-field-candidates.csv')}
        self.assertEqual([(entry['source'], entry['display_value']) for entry in rows['performers']],
                         [('fc2cmadb', '梨奈')])

    def test_a_pending_candidate_skips_only_the_source_that_gave_it(self):
        """演员栏只有 fc2cmadb 一条待批候选：重跑时照样去问演员，只是不再问 fc2cmadb。

        待批候选不是账本的值，免复核要两家一致；把它当成「已有着落」，FC2PPV-DB 就一次都轮不到。
        """
        media = self.root / 'media'
        media.mkdir()
        (media / 'FC2-PPV-2851534.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.fc2.return_value = [
            ('fc2', {'id': 'FC2-PPV-2851534', 'title': 'キュートなバニーメイド', 'maker': 'rina_vlog',
                     'release_date': '2022-04-28', 'actresses': [], 'source_url': 'https://adult.contents.fc2.com/'}),
            ('fc2cmadb', {'id': 'FC2-PPV-2851534', 'actresses': [{'japanese_name': '梨奈'}],
                          'source_url': 'https://fc2cmadb.com/articles/2851534'})]
        provider.cover.return_value = False
        run = lambda: process_library(config, db, self.root / 'generated', self.root / 'covers',
                                      provider_factory=Mock(return_value=provider))
        run()
        provider.fc2.return_value = [('fc2ppvdb', {'id': 'FC2-PPV-2851534', 'actresses': [{'japanese_name': '梨奈'}],
                                                   'source_url': 'https://fc2ppvdb.com/articles/2851534'})]
        run()
        kwargs = provider.fc2.call_args.kwargs
        self.assertIn('performers', kwargs['required'])
        self.assertEqual(kwargs['route'], ('fc2ppvdb', 'javten', 'javarchive'))
        rows = {row['field']: json.loads(row['candidates_json'])
                for row in read_rows(self.root / 'generated/library-metadata-field-candidates.csv')}
        self.assertEqual([entry['source'] for entry in rows['performers']], ['fc2cmadb', 'fc2ppvdb'])
        self.assertEqual([entry['source'] for entry in rows['title']], ['fc2'], '同一家不重复产候选')

    def test_the_cover_step_reuses_the_r18_answer_the_metadata_step_just_fetched(self):
        """资料那一步刚取回 r18.dev 的作品 JSON，封面那一步拿里面的原图地址直接量，不再问 r18.dev。

        处理链里 `best_cover` 手上没有缓存目录，每个非 FC2 番号都要再问一遍 r18.dev；
        快照交下去之后，这一问省掉了，装上的是同一张图。
        """
        from peach.library_processing import LibraryMetadataProvider
        buffer = io.BytesIO()
        Image.new('RGB', (800, 538), 'gray').save(buffer, format='JPEG')
        picture = buffer.getvalue()
        raw = {'content_id': 'ipx00060', 'images': {'jacket_image': {
            'large': 'https://pics.dmm.co.jp/digital/video/ipx00060/ipx00060pl.jpg'}}}
        asked = {}
        for label, snapshots in (('without', ()), ('with', [('r18dev', {'id': 'IPX-060', 'raw': raw})])):
            hits = asked.setdefault(label, [])

            def transport(request, timeout, limit, hits=hits):
                hits.append(request.url)
                if 'r18.dev' in request.url:
                    return HttpResponse(200, {}, json.dumps(raw).encode(), request.url)
                return HttpResponse(200, {}, picture, request.url)

            provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
            provider.transport = transport
            provider.community = Mock(side_effect=NotFound('社区来源都没有这个番号'))
            covers = self.root / label
            self.assertTrue(provider.cover('IPX-060', covers, snapshots=snapshots))
            with Image.open(covers / 'IPX-060.jpg') as installed:
                self.assertEqual(installed.size, (800, 538))
        self.assertEqual(sum('r18.dev' in url for url in asked['without']), 1)
        self.assertEqual(sum('r18.dev' in url for url in asked['with']), 0)
        self.assertLess(len(asked['with']), len(asked['without']))

    def test_the_cover_step_skips_r18_where_the_route_never_asks_it(self):
        """r18.dev 不在这个番号的链上（无码、判不准的番号），或一周内说过没有：封面那一步也不问它。"""
        from peach.library_processing import _official_evidence
        self.assertIsNone(_official_evidence([]))
        self.assertEqual(_official_evidence([], {'r18dev'}).sources, frozenset({'r18dev'}))
        self.assertIsNone(_official_evidence([('r18dev', {'id': 'X-1'})]), '没有作品 JSON 也没有图址的快照不算证据')

    def test_maker_snapshot_supplies_its_own_cover_candidate(self):
        from peach.library_processing import _official_evidence
        url = 'https://cdn.up-timely.com/image/30/content/68732/cover.jpg'
        evidence = _official_evidence([('makers', {
            'source_url': 'https://moodyz.com/works/detail/midv377',
            'cover_urls': [url], 'title': '作品', 'genres': ['Blu-ray（ブルーレイ）'],
        }), ('javdb', {'cover_urls': ['https://c0.jdbstatic.com/covers/x.jpg']})])
        self.assertIsNotNone(evidence)
        self.assertEqual([candidate.url for candidate in evidence.candidates], [url])

    def test_fc2_snapshots_supply_only_product_storage_originals(self):
        from peach.library_processing import _official_evidence
        original = 'https://storage12000.contents.fc2.com/file/342/34141418/1554539118.7.jpg'
        evidence = _official_evidence([('javten', {'cover_urls': [original]}),
            ('javarchive', {'cover_urls': ['https://img.javstore.net/a.jpg']}),
            ('javdb', {'cover_urls': ['https://c0.jdbstatic.com/a.jpg']})])
        self.assertEqual([candidate.url for candidate in evidence.candidates], [original])

    def test_community_cover_is_eligible_for_official_replacement(self):
        from peach.library_processing import cover_settled
        target = self.root / 'MIDV-377.jpg'
        Image.new('RGB', (800, 438)).save(target)
        target.with_suffix('.scraping.json').write_text(json.dumps({
            'source': 'c0.jdbstatic.com', 'source_url': 'https://c0.jdbstatic.com/covers/x.jpg',
        }), encoding='utf-8')
        self.assertFalse(cover_settled(target))

    def test_official_cover_can_replace_a_larger_community_copy(self):
        from peach.jav_cover_fetch import Candidate
        from peach.library_processing import LibraryMetadataProvider
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        provider._official_candidates = Mock(return_value=())
        covers = self.root / 'covers'
        covers.mkdir()
        target = covers / 'MIDV-377.jpg'
        Image.new('RGB', (2000, 1100), 'gray').save(target)
        target.with_suffix('.scraping.json').write_text(json.dumps({
            'source_url': 'https://c0.jdbstatic.com/covers/x.jpg',
        }), encoding='utf-8')
        data = io.BytesIO()
        Image.new('RGB', (1600, 1200), 'blue').save(data, 'JPEG')
        official = (Candidate('awsimgsrc.dmm.com', 'https://awsimgsrc.dmm.com/dig/cover.jpg'),
                    (1600, 1200), data.getvalue())
        with patch('peach.jav_cover_fetch.best_cover', return_value=official):
            self.assertTrue(provider.cover('MIDV-377', covers, snapshots=[('makers', {
                'title': '作品', 'genres': ['Blu-ray（ブルーレイ）'],
            })]))
        installed = json.loads(target.with_suffix('.scraping.json').read_text(encoding='utf-8'))
        self.assertEqual(installed['source'], 'awsimgsrc.dmm.com')
        self.assertEqual(installed['title'], '作品 Blu-ray')

    def test_a_source_held_by_its_cooldown_is_reported_as_not_yet_reached(self):
        """冷却里的来源说的是「本趟没轮到」，不是「没取到」：社区那一档与封面那一步都按它分档。

        自写来源撞上验证页或限流时，来源层已经把那一站写进冷却（`SourceFailure.cooldown_action`），
        与传输层的 `SourcePaused` 同一档。
        """
        from peach.jav_cover_fetch import Unavailable
        from peach.library_processing import LibraryMetadataProvider
        from peach.scraping_access import SourcePaused
        from peach.sources.base import FailureReason, SourceFailure
        provider = LibraryMetadataProvider.__new__(LibraryMetadataProvider)
        provider.transport = Mock()
        answers = {'avbase': SourcePaused('来源正在冷却，请稍后重试'), 'javbus': NotFound('没有'),
                   'javdb': SourceFailure(FailureReason.CLOUDFLARE_CHALLENGE, 'javdb 撞上了验证页')}

        def site(source, code, **_):
            raise answers[source]

        provider.site = site
        route = ('avbase', 'javbus', 'javdb')
        with self.assertRaises(SourcePaused):
            provider.community('ORETD-701', route=route)
        answers['javbus'] = Unavailable('HTTP 503')
        with self.assertRaises(Unavailable):
            provider.community('ORETD-702', route=route)

        provider._official_candidates = Mock(return_value=())
        provider.community = Mock(side_effect=SourcePaused('javdb：来源正在冷却'))
        with patch('peach.jav_cover_fetch.best_cover', side_effect=SourcePaused('本趟采集次数已用完')), \
                self.assertRaisesRegex(SourcePaused, '^本趟采集次数已用完；javdb：来源正在冷却$'):
            provider.cover('ORETD-703', self.root / 'covers')
        with patch('peach.jav_cover_fetch.best_cover', side_effect=Unavailable('HTTP 503')), \
                self.assertRaises(Unavailable):
            provider.cover('ORETD-704', self.root / 'covers')

    def test_a_challenge_on_a_source_of_its_own_is_listed_as_not_yet_reached(self):
        """r18.dev 撞上验证页、其余几档说没有：这一行在问题清单里是「本趟没轮到」，不是失败。"""
        from peach.sources.base import FailureReason, SourceFailure
        media = self.root / 'media'
        media.mkdir()
        (media / 'DASS-468.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()

        def answer(code, source='r18dev', **_):
            if source == 'dmm':
                raise NotFound('HTTP 404')
            raise SourceFailure(FailureReason.CLOUDFLARE_CHALLENGE, '撞上了验证页')

        provider.query.side_effect = answer
        provider.cover.return_value = False
        state = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                provider_factory=Mock(return_value=provider))
        self.assertEqual([(row['message'], row['severity']) for row in state['issue_preview']],
                         [('外部资料本趟没轮到：r18.dev：撞上了验证页', 'paused')])
        self.assertEqual(state['paused_count'], 1)

    def test_a_route_override_decides_who_gets_asked(self):
        """用户把有码那条链换成只问综合索引，r18.dev 就一次都不问。"""
        media = self.root / 'media'
        media.mkdir()
        (media / 'DASS-468.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        provider = stub_provider()
        provider.community.side_effect = None
        provider.community.return_value = [('javdb', {
            'id': 'DASS-468', 'title': '甘やかされて', 'maker': 'Das', 'release_date': '2024-09-10',
            'actresses': [{'japanese_name': '胡桃さくら'}], 'source_url': 'https://javdb.com/v/x'})]
        provider.cover.return_value = False
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=Mock(return_value=provider),
                                 route_overrides='censored=javdb')
        provider.query.assert_not_called()
        self.assertEqual(provider.community.call_args.kwargs['route'], ('javdb',))
        self.assertEqual((result['status'], result['issue_count']), ('complete', 0))

    def test_a_new_site_clears_only_the_memories_whose_lineup_it_joined(self):
        """接上一站只让链上有它的那几条「封面没有」失效，别的站说过的「没有」照旧作数。

        2026-09-21 接上 FC2 商品页与 fc2cmadb 时，430 个 FC2 番号手上压着一条
        「封面没有」：答案没变，能问的人变了。有码番号的链上没有这两站，它们的记忆不该跟着作废，
        javdb 对某个番号说过的「没有」也还是 javdb 的答复。
        """
        from peach.library_processing import _MissCache
        path = self.root / 'misses.json'
        clock = [1000.0]
        now = lambda: clock[0]
        before = _MissCache(path, now=now, sites=('fc2', 'javdb', 'r18dev'))
        before.record('cover', 'FC2-PPV-3189161')
        before.record('cover', 'DASS-468')
        before.record('javdb', 'FC2-PPV-3189161')

        clock[0] = 2000.0
        widened = _MissCache(path, now=now, sites=('fc2', 'fc2cmadb', 'javdb', 'r18dev'))
        self.assertFalse(widened.fresh('cover', 'FC2-PPV-3189161', ('fc2', 'fc2cmadb', 'javdb')))
        self.assertTrue(widened.fresh('cover', 'DASS-468', ('r18dev', 'javdb')))
        self.assertTrue(widened.fresh('javdb', 'FC2-PPV-3189161'))

        clock[0] = 3000.0
        widened.record('r18dev', 'DASS-468')
        again = _MissCache(path, now=now, sites=('fc2', 'fc2cmadb', 'javdb', 'r18dev'))
        self.assertFalse(again.fresh('cover', 'FC2-PPV-3189161', ('fc2', 'fc2cmadb', 'javdb')),
                         '接入时刻落了盘，重开之后那条旧记忆仍不作数')
        clock[0] = 4000.0
        again.record('cover', 'FC2-PPV-3189161')
        self.assertTrue(again.fresh('cover', 'FC2-PPV-3189161', ('fc2', 'fc2cmadb', 'javdb')),
                        '新站接入之后记下的「没有」作数')

    def test_a_memory_kept_per_stage_trusts_only_the_single_site_stages(self):
        """按档记的文件：单站成档的键就是那一站的答复，合档的键说不清是哪一站，丢掉；
        不带来源目录指纹的更早写法无从判断，一律重问。"""
        from peach.library_processing import _legacy_fingerprint, _MissCache
        path = self.root / 'legacy.json'
        stamp = time.time()
        path.write_text(json.dumps({'sources': _legacy_fingerprint(), 'misses': {
            'r18dev': {'STP-26232': stamp}, 'community': {'STP-26232': stamp},
            'cover': {'STP-26232': stamp}, 'fc2cmadb-cast': {'FC2-PPV-1': stamp}}}), encoding='utf-8')
        cache = _MissCache(path)
        self.assertTrue(cache.fresh('r18dev', 'STP-26232'))
        self.assertFalse(cache.fresh('cover', 'STP-26232', ('mgstage', 'javdb', 'r18dev')))
        self.assertTrue(cache.fresh('fc2cmadb-cast', 'FC2-PPV-1'), 'FC2 演员复核脚本记的键照旧作数')
        self.assertFalse(cache.fresh('community', 'STP-26232'))

        path.write_text(json.dumps({'r18dev': {'STP-26232': stamp}}), encoding='utf-8')
        self.assertFalse(_MissCache(path).fresh('r18dev', 'STP-26232'))

    def test_official_cover_catalog_misses_use_the_current_rule_generation(self):
        from peach import upgrade_rules
        from peach.library_processing import MISS_FORMAT, _MissCache
        path = self.root / 'cover-misses.json'
        old = {'format': MISS_FORMAT, 'sites': ['dmm', 'r18dev', 'fc2'], 'joined': {},
               'misses': {'cover': {'SSIS-057': 1000.0, 'FC2-PPV-1': 1000.0},
                          'dmm': {'SSIS-057': 1000.0}, 'r18dev': {'SSIS-057': 1000.0}}}
        for generation in (None, upgrade_rules.OFFICIAL_COVER_CATALOG_MISSES - 1):
            with self.subTest(generation=generation):
                path.write_text(json.dumps({**old, 'cover_catalog_rules': generation}), encoding='utf-8')
                cache = _MissCache(path, now=lambda: 1100.0)
                self.assertFalse(cache.fresh('cover', 'SSIS-057'))
                self.assertTrue(cache.fresh('cover', 'FC2-PPV-1'))
                self.assertTrue(cache.fresh('dmm', 'SSIS-057'))
                self.assertTrue(cache.fresh('r18dev', 'SSIS-057'))
                self.assertEqual(json.loads(path.read_text(encoding='utf-8'))['misses'], old['misses'])
                cache.record('cover', 'SSIS-057')
                restored = _MissCache(path, now=lambda: 1200.0)
                self.assertTrue(restored.fresh('cover', 'SSIS-057'))
                self.assertTrue(restored.fresh('cover', 'FC2-PPV-1'))
                self.assertTrue(restored.fresh('dmm', 'SSIS-057'))
                saved = json.loads(path.read_text(encoding='utf-8'))
                self.assertEqual(saved['cover_catalog_rules'], upgrade_rules.OFFICIAL_COVER_CATALOG_MISSES)

    def test_a_stage_asks_only_the_sites_that_have_not_said_no(self):
        """综合索引那一档里 AVBase 与 JavBus 说过没有，javdb 没说过：这一档只问 javdb。"""
        from peach.library_processing import _MissCache, misses_path
        media = self.root / 'media'
        media.mkdir()
        (media / 'DASS-468.mp4').write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = drive_config(self.root)
        register_media(db, media)
        misses = _MissCache(misses_path(config))
        for site in ('avbase', 'javbus'):
            misses.record(site, 'DASS-468')
        provider = stub_provider()
        provider.query.side_effect = NotFound('HTTP 404')
        provider.cover.return_value = False
        process_library(config, db, self.root / 'generated', self.root / 'covers',
                        provider_factory=Mock(return_value=provider))
        self.assertEqual(provider.community.call_args.kwargs['route'], ('javdb',))
        self.assertTrue(_MissCache(misses_path(config)).fresh('javdb', 'DASS-468'))

    def test_management_controls_keep_credentials_and_empty_sections_visible(self):
        root = Path(__file__).resolve().parents[1]
        # 关注管理那一屏在 React 里：能加来源的站才进候选，缺必填凭据的那一行默认展开，
        # 一个站都没配也照样把整块列出来（空清单不等于这块不存在）。
        follow = root / 'frontend/src/react/follow-manage'
        add = (follow / 'add-source.tsx').read_text(encoding='utf-8')
        creds = (follow / 'credentials.tsx').read_text(encoding='utf-8')
        self.assertIn('const rows = (credentials.providers || []).filter((row) => row.followable);', add)
        self.assertIn("defaultOpen={row.requirement === 'required' && !credentialDone(row)}>", creds)
        self.assertIn('const rows = data.providers || [];', creds)
        configuration = (root / 'frontend/src/react/settings/configuration-page.tsx').read_text(encoding='utf-8')
        self.assertNotIn("'/api/library-processing'", configuration)


class LibraryStatePersistenceTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.path = self.root / 'state/library-processing.json'
        self.path.parent.mkdir()
        self.previous = {'status': 'running', 'job_id': 'one', 'title': '处理进度'}
        self.path.write_text(json.dumps(self.previous, ensure_ascii=False), encoding='utf-8')

    def test_state_save_retries_temporary_replace_denial(self):
        replace = os.replace
        attempts = []
        current = {**self.previous, 'processed': 2}

        def busy_reader(source, destination):
            attempts.append(source)
            if len(attempts) <= 2:
                self.assertEqual(json.loads(self.path.read_text(encoding='utf-8')), self.previous)
                self.assertEqual(json.loads(Path(source).read_text(encoding='utf-8')), current)
                raise PermissionError(13, '目标文件正在读取', str(destination))
            return replace(source, destination)

        with patch('os.replace', side_effect=busy_reader):
            _save(self.path, current)
        self.assertEqual(len(attempts), 3)
        self.assertEqual(json.loads(self.path.read_text(encoding='utf-8')), current)
        self.assertEqual(list(self.path.parent.iterdir()), [self.path])

    def test_state_save_reports_persistent_denial_and_cleans_staging(self):
        denied = PermissionError(13, '目标文件不可替换', str(self.path))
        with patch('os.replace', side_effect=denied), patch('peach.fsutil.READER_WAIT', 0):
            with self.assertRaises(PermissionError) as raised:
                _save(self.path, {**self.previous, 'processed': 2})
        self.assertIs(raised.exception, denied)
        self.assertEqual(json.loads(self.path.read_text(encoding='utf-8')), self.previous)
        self.assertEqual(list(self.path.parent.iterdir()), [self.path])

    def test_concurrent_state_saves_publish_complete_payloads(self):
        replace = os.replace
        ready = threading.Barrier(2)
        writer = threading.local()
        staging = []
        payloads = [{**self.previous, 'processed': index, 'details': '进度' * 1024} for index in (1, 2)]

        def interleaved_replace(source, destination):
            if not getattr(writer, 'ready', False):
                staging.append(Path(source))
                writer.ready = True
                ready.wait(timeout=5)
            return replace(source, destination)

        with patch('os.replace', side_effect=interleaved_replace), ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(_save, self.path, payload) for payload in payloads]
            for future in futures:
                future.result(timeout=10)
        self.assertEqual(len(set(staging)), 2)
        self.assertTrue(all(path.parent == self.path.parent for path in staging))
        self.assertIn(json.loads(self.path.read_text(encoding='utf-8')), payloads)
        self.assertEqual(list(self.path.parent.iterdir()), [self.path])


    @unittest.skipUnless(os.name == 'nt', '需要 Windows 文件共享语义')
    def test_state_save_waits_for_a_windows_reader_to_close(self):
        from peach.library_processing import _save
        replace = os.replace
        reader = self.path.open(encoding='utf-8')
        self.addCleanup(reader.close)
        blocked = []
        def replace_while_reading(source, destination):
            try:
                return replace(source, destination)
            except PermissionError as error:
                blocked.append(error)
                reader.close()
                raise
        current = {**self.previous, 'processed':2}
        with patch('os.replace', side_effect=replace_while_reading):
            _save(self.path, current)
        self.assertEqual(len(blocked),1)
        self.assertIn(blocked[0].winerror,(5,32))
        self.assertEqual(json.loads(self.path.read_text(encoding='utf-8')),current)
        self.assertEqual(list(self.path.parent.iterdir()),[self.path])


class LibraryWatchdogTests(unittest.TestCase):
    """扫描与采集任务的进度心跳、卡住提示、预算与失败项重试。"""

    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()

    def _config(self, media):
        return drive_config(self.root)

    def _provider(self):
        provider = stub_provider()
        provider.query.return_value = {'id': 'code', 'maker': 'Studio', 'source_url': ''}
        provider.cover.return_value = False
        return provider

    def test_library_selection_limits_collection_and_completion(self):
        from peach.media_libraries import libraries
        config = drive_config(self.root, 'root-1', 'root-2')
        library_id = libraries(config)[0]['id']
        db = fresh_ledger(self.root)
        provider = self._provider()
        register_assets(db, 'ABW-204.mp4', root='root-1')
        register_assets(db, 'ABW-205.mp4', root='root-2')
        collected = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                    stage='collect', library_id=library_id, provider_factory=lambda: provider)
        self.assertEqual(collected['total'], 1)
        self.assertEqual(collected['library_id'], library_id)
        with self.assertRaisesRegex(ValueError, '媒体库'):
            process_library(config, db, self.root / 'generated', self.root / 'covers', library_id='missing')

    def test_empty_incremental_sync_completes_without_metadata_queries(self):
        db = fresh_ledger(self.root)
        provider = self._provider()
        result = process_library(self._config(self.root), db, self.root / 'generated', self.root / 'covers',
                                 incremental=True, provider_factory=lambda: provider)
        self.assertEqual(result['status'], 'complete')
        self.assertFalse(result['asset_ids'])
        provider.query.assert_not_called()

    def test_state_save_waits_for_a_reader_holding_the_file(self):
        # 进度条轮询读状态时，Windows 上替换被占着的目标会报 WinError 5，任务随之中断。
        config = self._config(self.root / 'media')
        path = state_path(config)
        _save(path, {'status': 'running', 'checked': 1})
        reader = path.open(encoding='utf-8')
        release = threading.Timer(0.5, reader.close)
        release.start()
        self.addCleanup(release.cancel)
        self.addCleanup(reader.close)
        _save(path, {'status': 'running', 'checked': 2})
        self.assertEqual(json.loads(path.read_text(encoding='utf-8'))['checked'], 2)
        self.assertEqual(sorted(item.name for item in path.parent.iterdir()), [path.name])

    def test_reports_carry_current_asset_action_and_rising_sequence(self):
        media = self.root / 'media'
        media.mkdir()
        for name in ('ABW-001.mp4', 'ABW-002.mp4'):
            (media / name).write_bytes(b'video')
        db = fresh_ledger(self.root)
        config = self._config(media)
        register_media(db, media)
        reports = []
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=lambda: self._provider(), report=reports.append)
        actions = [row['current_action'] for row in reports]
        names = {row['current_asset_name'] for row in reports if row['current_asset_name']}
        self.assertEqual(names, {'ABW-001.mp4', 'ABW-002.mp4'})
        self.assertIn('querying_metadata', actions)
        self.assertIn('fetching_cover', actions)
        sequences = [row['progress_seq'] for row in reports]
        self.assertEqual(sequences, sorted(sequences))
        self.assertEqual(len(set(sequences)), len(sequences))
        self.assertEqual(result['status'], 'complete')
        self.assertIsNone(result['current_asset_id'])
        self.assertEqual(result['current_action'], '')

    def test_status_read_recovers_the_log_path_left_by_an_earlier_job(self):
        """上一趟任务的状态文件里没有这个字段，它那份完整清单却还在磁盘上。"""
        from peach.web_library_processing import q_library_processing
        config = self._config(self.root / 'media')
        log = issues_path(config, 'old')
        log.parent.mkdir(parents=True, exist_ok=True)
        log.write_text(json.dumps({'asset_id': 1, 'message': '未识别到番号'}) + '\n', encoding='utf-8')
        state_path(config).write_text(json.dumps({'status': 'failed', 'job_id': 'old', 'issue_count': 1}),
                                      encoding='utf-8')
        contract = Mock()
        contract.db_path = self.root / 'database/ledger.db'
        contract.library_processing_job.snapshot.return_value = None
        from peach.repository import LedgerDatabase
        contract.db_path.parent.mkdir()
        fresh_ledger(contract.db_path.parent)
        contract.database = LedgerDatabase(contract.db_path)
        with patch('peach.web_library_processing.settings_file.active', return_value=config):
            self.assertEqual(q_library_processing(contract, {})['issues_log'], str(log))

    def test_status_responses_leave_resume_fields_and_media_paths_on_the_server(self):
        """状态文件里续跑用的大字段（含完整媒体路径）不随每 10 秒一次的轮询发给页面。"""
        from peach.web_library_processing import q_library_processing, w_library_processing
        config = self._config(self.root / 'media')
        state = {'status': 'failed', 'job_id': 'old', 'requested_stage': 'all', 'checked': 2,
                 'retryable_asset_ids': [7], 'asset_ids': [7, 8], 'completed_metadata': ['8:R:\\media\\b.mp4'],
                 'local_metadata': {'7': {'path': 'R:\\media\\secret\\a.mp4'}}, 'progress_seq': 3}
        state_path(config).parent.mkdir(parents=True, exist_ok=True)
        state_path(config).write_text(json.dumps(state), encoding='utf-8')
        contract = Mock()
        contract.db_path = self.root / 'database/ledger.db'
        contract.library_processing_job.snapshot.return_value = None
        from peach.repository import LedgerDatabase
        contract.db_path.parent.mkdir(exist_ok=True)
        fresh_ledger(contract.db_path.parent)
        contract.database = LedgerDatabase(contract.db_path)
        with contract.database.write_transaction() as connection:
            connection.execute("INSERT INTO asset(id,location,path,name,medium) "
                               "VALUES(7,'local','R:\\media\\a.mp4','a.mp4','video')")
        with patch('peach.web_library_processing.settings_file.active', return_value=config):
            read = q_library_processing(contract, {})
            # 正在跑时再点一次开始，回的是当前任务，同样只回投影。
            contract.library_processing_job.snapshot.return_value = {**state, 'status': 'running'}
            again = w_library_processing(contract, {})
        self.assertEqual((read['status'], read['checked'], read['retryable_asset_ids']), ('failed', 2, [7]))
        self.assertEqual((again['status'], again['requested_stage']), ('running', 'all'))
        for response in (read, again):
            for field in ('asset_ids', 'completed_metadata', 'local_metadata', 'progress_seq'):
                self.assertNotIn(field, response)
            self.assertNotIn('secret', json.dumps(response))

    def test_stalled_warning_never_flips_a_live_task_to_failed(self):
        config = self._config(self.root / 'media')
        path = state_path(config)
        path.parent.mkdir(parents=True, exist_ok=True)
        old = time.time() - (STALL_AFTER_SECONDS + 30)
        path.write_text(json.dumps({'status': 'running', 'job_id': 'one', 'started_at': old,
                                    'last_progress_at': old, 'current_started_at': old,
                                    'current_action': 'reading_local'}), encoding='utf-8')
        with FileLock(str(path) + '.lock', timeout=0):
            live = snapshot(config)
        self.assertEqual(live['status'], 'running')
        self.assertTrue(live['stalled'])
        dead = snapshot(config)
        self.assertEqual(dead['status'], 'failed')
        self.assertIn('中断', dead['error'])
        self.assertEqual(json.loads(path.read_text(encoding='utf-8'))['status'], 'failed')
        # 另一个读取者正好占着锁时读到的也是同一个结论，不会跳回「运行中」。
        with FileLock(str(path) + '.lock', timeout=0):
            again = snapshot(config)
        self.assertEqual(again['status'], 'failed')
        self.assertNotIn('stalled', again)

    def test_deadline_within_budget_is_running_and_expired_is_stalled(self):
        now = time.time()
        within = decorate({'status': 'running', 'last_progress_at': now - 300,
                           'current_deadline_at': now + 30}, now=now)
        expired = decorate({'status': 'running', 'last_progress_at': now - 300,
                            'current_deadline_at': now - 1}, now=now)
        self.assertFalse(within['stalled'])
        self.assertTrue(expired['stalled'])

    def test_stalled_read_hides_stale_eta_without_mutating_worker_state(self):
        state = dict(status='running', last_progress_at=100, current_started_at=100,
                     eta_seconds_min=63, eta_seconds_max=94, eta_kind='measured')
        waiting = decorate(state, now=100 + STALL_AFTER_SECONDS + 1)
        self.assertTrue(waiting['stalled'])
        self.assertIsNone(waiting['eta_seconds_min'])
        self.assertIsNone(waiting['eta_seconds_max'])
        self.assertEqual(state['eta_seconds_max'], 94)
        resumed = decorate({**state, 'last_progress_at': 1000}, now=1001)
        self.assertFalse(resumed['stalled'])
        self.assertEqual(resumed['eta_seconds_max'], 94)

    def test_starting_a_job_keeps_the_previous_issue_log(self):
        from peach.library_processing import _processing_issue_log
        config = self._config(self.root / 'media')
        path = state_path(config)
        path.parent.mkdir(parents=True, exist_ok=True)
        previous = issues_path(config, 'previous')
        previous.write_text('previous evidence\n', encoding='utf-8')
        current = _processing_issue_log(config, path, 'current', False)
        self.assertEqual(current, issues_path(config, 'current'))
        self.assertEqual(previous.read_text(encoding='utf-8'), 'previous evidence\n')

    def test_legacy_issue_list_projects_into_count_and_preview(self):
        legacy = [{'asset_id': index, 'message': '未识别到番号'} for index in range(1, 26)]
        state = decorate({'status': 'failed', 'job_id': 'old', 'issues': legacy})
        self.assertNotIn('issues', state)
        self.assertEqual(state['issue_count'], 25)
        self.assertEqual(len(state['issue_preview']), 20)
        self.assertEqual(state['issue_preview'][0],
                         {'asset_id': 1, 'title': '', 'path': '', 'message': '未识别到番号'})
        self.assertTrue(state['issues_truncated'])

    def test_finished_issues_and_interruption_have_distinct_outcomes(self):
        finished = dict(status='failed', stage='处理结束', completed_at=123,
                        issue_count=14, retryable_asset_ids=[1, 2])
        self.assertEqual(decorate(finished)['outcome'], 'partial')
        self.assertNotIn('outcome', finished)
        for state in ({**finished, 'stage': '生成预览图'},
                      {**finished, 'outcome': 'interrupted'},
                      {**finished, 'completed_at': None}):
            self.assertEqual(decorate(state)['outcome'], 'interrupted')
        from peach.web_library_processing import public_state
        self.assertEqual(public_state(decorate(finished))['outcome'], 'partial')
        legacy = dict(status='failed', stage='处理结束', completed_at=123,
                      issues=[{'asset_id': 1, 'message': '视频抽帧超时'}])
        self.assertEqual(decorate(legacy)['outcome'], 'partial')

    def test_deadline_skips_one_asset_and_keeps_processing(self):
        from peach.jav_cover_fetch import DeadlineExceeded
        db = fresh_ledger(self.root)
        config = self._config(self.root)
        register_assets(db, 'ABW-101.mp4', 'ABW-102.mp4')
        provider = self._provider()
        # ABW-101 在 r18.dev 那一问就用尽预算；ABW-102 的 r18.dev 只答厂牌，接着问 DMM 兜底。
        provider.query.side_effect = [DeadlineExceeded('预算'), provider.query.return_value, NotFound('HTTP 404')]
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 provider_factory=lambda: provider)
        with closing(sqlite3.connect(db)) as connection:
            ids = {name: row_id for name, row_id in connection.execute('SELECT name, id FROM asset')}
        self.assertEqual(result['retryable_asset_ids'], [ids['ABW-101.mp4']])
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['outcome'], 'partial')
        self.assertEqual([item.args for item in provider.query.call_args_list],
                         [('ABW-101', 'r18dev'), ('ABW-102', 'r18dev'), ('ABW-102', 'dmm')])
        self.assertEqual(provider.reset.call_count, 1)

    def test_retry_touches_only_listed_assets(self):
        db = fresh_ledger(self.root)
        config = self._config(self.root)
        register_assets(db, 'ABW-201.mp4', 'ABW-202.mp4')
        provider = self._provider()
        first = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                provider_factory=lambda: provider)
        self.assertEqual(first['total'], 2)
        with closing(sqlite3.connect(db)) as connection:
            ids = {name: row_id for name, row_id in connection.execute('SELECT name, id FROM asset')}
        provider.reset_mock()
        retried = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                  retry_ids=[ids['ABW-202.mp4']],
                                  provider_factory=lambda: provider)
        self.assertEqual(retried['total'], 1)
        self.assertEqual(retried['checked'], 1)
        self.assertEqual(retried['status'], 'complete')

    def test_candidates_are_written_once_for_a_short_batch_not_once_per_asset(self):
        """候选 CSV 按时间节流落盘，结束时写全；三条资产不该重写三遍整份文件。"""
        from peach import review_csv
        db = fresh_ledger(self.root)
        register_assets(db, 'ABW-209.mp4', 'ABW-210.mp4', 'ABW-211.mp4')
        provider = self._provider()
        with patch('peach.library_processing.time', wraps=time) as clock, \
                patch('peach.library_processing.write_rows', wraps=review_csv.write_rows) as written:
            clock.monotonic.return_value = 100.0
            state = process_library(self._config(self.root), db, self.root / 'generated', self.root / 'covers',
                                    provider_factory=lambda: provider)
        self.assertEqual(state['status'], 'complete')
        self.assertEqual(written.call_count, 1)
        rows = read_rows(self.root / 'generated' / 'library-metadata-field-candidates.csv')
        self.assertEqual(len({row['asset_id'] for row in rows}), 3)

    def test_metadata_refresh_rechecks_existing_fields_without_fetching_a_cover(self):
        db = fresh_ledger(self.root)
        register_assets(db, 'ABW-358.mp4')
        with closing(sqlite3.connect(db)) as connection, connection:
            connection.execute("UPDATE asset SET code='ABW-358', catalog_title='旧标题' WHERE id=1")
        provider = self._provider()
        provider.query.return_value = {'id': 'ABW-358', 'title': '新标题'}
        config = drive_config(self.root)
        result = process_library(config, db, self.root / 'generated', self.root / 'covers',
                                 stage='metadata', asset_ids=[1], refresh_metadata=True,
                                 provider_factory=lambda: provider)
        self.assertFalse(provider.cover.called)
        self.assertTrue((self.root / 'generated/library-metadata-field-candidates.csv').is_file(),
                        result.get('issue_preview'))
        title = next(row for row in read_rows(
            self.root / 'generated/library-metadata-field-candidates.csv') if row['field'] == 'title')
        fresh = next(choice for choice in json.loads(title['candidates_json'])
                     if choice['display_value'] == '新标题')
        self.assertTrue(fresh['requires_review'])

    def test_rematch_reopens_only_the_asset_key_decision(self):
        from peach.repository import LedgerDatabase
        from peach.web_contract import WebContract
        from peach.web_library_processing import _reopen_metadata_reviews
        db = fresh_ledger(self.root)
        with closing(sqlite3.connect(db)) as connection, connection:
            connection.execute(
                "INSERT INTO asset(id,path,name,location,medium,code) "
                "VALUES(1,'/media/ABW-358.mp4','ABW-358.mp4','local','video','ABW-358')")
            connection.executemany(
                "INSERT INTO review_decision(category,item_key,status,note,updated_at) "
                "VALUES('metadata_fields',?,?,?, '2026-10-25T00:00:00Z')",
                [('asset:1:title', 'approved', '{"candidate_key":"one"}'),
                 ('ABW-358:title', 'approved', '{"candidate_key":"two"}'),
                 ('ABW-358:tags', 'rejected', 'keep'),
                 ('other:title', 'approved', 'keep')])
        contract = WebContract(db, candidate_root=self.root / 'generated',
                               database=LedgerDatabase(db))
        _reopen_metadata_reviews(contract, 1)
        with closing(sqlite3.connect(db)) as connection:
            rows = dict(connection.execute(
                "SELECT item_key,status FROM review_decision WHERE category='metadata_fields'"))
        self.assertEqual(rows['asset:1:title'], 'skipped')
        self.assertEqual(rows['ABW-358:title'], 'approved')
        self.assertEqual(rows['ABW-358:tags'], 'rejected')
        self.assertEqual(rows['other:title'], 'approved')

    def test_the_stage_asked_for_is_the_stage_that_runs(self):
        """页面点哪一段就跑哪一段，不认识的段数拒绝掉。

        段名要一路传到管线里。只拿它换一句提示文字的话，按钮看着分了工、跑起来
        全是同一件事，而且页面上看不出区别。
        """
        from peach.web_library_processing import w_library_processing
        contract = SimpleNamespace(
            db_path=Path(self.root / 'database' / 'ledger.db'),
            candidate_root=self.root / 'generated', cover_root=self.root / 'covers',
            cache_bust=lambda: None, database=Mock(),
            library_processing_job=SimpleNamespace(
                snapshot=lambda: None,
                start=lambda work, restart, initial, recovery: (work('job'), initial)[1],
                update=lambda job_id, **values: None))
        media = self.root / 'media'
        media.mkdir()
        (self.root / 'database').mkdir(exist_ok=True)
        fresh_ledger(self.root / 'database')
        config = self._config(media)
        with patch('peach.web_library_processing.settings_file.active', return_value=config), \
             patch('peach.web_library_processing.process_library') as run:
            run.return_value = {'job_id': 'job', 'status': 'complete'}
            initial = w_library_processing(contract, {'stage': 'collect'})
            self.assertEqual(run.call_args.kwargs['stage'], 'collect')
            self.assertEqual(initial['requested_stage'], 'collect')
            self.assertEqual(initial['stage'], '准备采集资料')
            w_library_processing(contract, {})
            self.assertEqual(run.call_args.kwargs['stage'], 'all')
            w_library_processing(contract, {'incremental':True})
            self.assertTrue(run.call_args.kwargs['incremental'])
            from peach.media_libraries import libraries
            library_id = libraries(config)[0]['id']
            initial = w_library_processing(contract, {'library_id': library_id, 'incremental': True})
            self.assertEqual(run.call_args.kwargs['library_id'], library_id)
            self.assertEqual(initial['library_id'], library_id)
            with self.assertRaisesRegex(ValueError, '媒体库'):
                w_library_processing(contract, {'library_id': 'missing'})
            with self.assertRaisesRegex(ValueError, '开关值'):
                w_library_processing(contract, {'incremental':'true'})
            with self.assertRaises(ValueError):
                w_library_processing(contract, {'stage': 'metadata', 'incremental': True, 'asset_ids': [1]})
            with self.assertRaises(ValueError):
                w_library_processing(contract, {'stage': 'thumbnails'})

    def test_rematch_request_passes_refresh_to_one_asset(self):
        from peach.web_library_processing import w_library_processing
        media = self.root / 'media'
        media.mkdir()
        video = media / 'ABW-358.mp4'
        video.write_bytes(b'video')
        database = self.root / 'database'
        database.mkdir()
        db = fresh_ledger(database)
        with closing(sqlite3.connect(db)) as connection, connection:
            connection.execute(
                "INSERT INTO asset(id,path,name,location,medium,code) "
                "VALUES(1,?,?,'local','video','ABW-358')", (str(video), video.name))
        contract = SimpleNamespace(
            db_path=db, database=Mock(), candidate_root=self.root / 'generated',
            cover_root=self.root / 'covers', cache_bust=lambda: None,
            library_processing_job=SimpleNamespace(
                snapshot=lambda: None, update=lambda *_args, **_kwargs: None,
                start=lambda work, restart, initial, recovery: (work('job'), initial)[1]))
        config = self._config(media)
        with patch('peach.web_library_processing.settings_file.active', return_value=config), \
                patch('peach.web_library_processing.process_library',
                      return_value={'status': 'complete'}) as run, \
                patch('peach.web_library_processing._reopen_metadata_reviews') as reopen:
            result = w_library_processing(contract, {
                'stage': 'metadata', 'asset_ids': [1], 'refresh': True})
            self.assertTrue(run.call_args.kwargs['refresh_metadata'])
            self.assertIsNone(run.call_args.kwargs['database'])
            reopen.assert_called_once_with(contract, 1)
            self.assertTrue(result['refresh_metadata'])
            with self.assertRaises(ValueError):
                w_library_processing(contract, {'stage': 'metadata', 'refresh': True})
            with self.assertRaises(ValueError):
                w_library_processing(contract, {'stage': 'collect', 'asset_ids': [1], 'refresh': True})

    def test_retry_request_accepts_only_the_previous_failure_set(self):
        from peach.web_library_processing import _retry_ids
        previous = {'job_id': 'one', 'retryable_asset_ids': [130, 131]}
        self.assertIsNone(_retry_ids(previous, {}))
        self.assertEqual(_retry_ids(previous, {'job_id': 'one', 'retry': [130]}), [130])
        self.assertEqual(_retry_ids(previous, {'job_id': 'one', 'retry': []}), [130, 131])
        with self.assertRaises(ValueError):
            _retry_ids(previous, {'job_id': 'old', 'retry': [130]})
        with self.assertRaises(ValueError):
            _retry_ids(previous, {'job_id': 'one', 'retry': [999]})
        with self.assertRaises(ValueError):
            _retry_ids(previous, {'job_id': 'one', 'retry': 'all'})

    def test_fetch_refuses_to_start_after_its_budget_is_gone(self):
        from peach.jav_cover_fetch import DeadlineExceeded, _fetch
        transport = Mock()
        with self.assertRaises(DeadlineExceeded):
            _fetch(transport, 'https://example.com/a.jpg', referer='https://example.com/',
                   limit=100, deadline=time.monotonic() - 1)
        transport.assert_not_called()

    def test_fetch_clamps_each_attempt_to_the_remaining_budget(self):
        from peach.jav_cover_fetch import _fetch
        transport = Mock()
        transport.return_value = Mock(status=200, body=b'x')
        _fetch(transport, 'https://example.com/a.jpg', referer='https://example.com/',
               limit=100, deadline=time.monotonic() + 5)
        timeout = transport.call_args.args[1]
        self.assertGreater(timeout, 4)
        self.assertLessEqual(timeout, 5)

class ProcessingLockTests(unittest.TestCase):
    """全库处理锁：用户发起的处理等锁，后台定向任务让路而不是报错。"""

    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.config = drive_config(self.root)
        self.enterContext(patch('peach.settings_file.active', return_value=self.config))
        self.db = fresh_ledger(self.root)
        self.database = LedgerDatabase(self.db)
        register_assets(self.db, 'ABW-358.mp4', 'ABW-359.mp4')
        with self.database.write_transaction() as connection:
            for aid, code in ((1, 'ABW-358'), (2, 'ABW-359')):
                connection.execute('UPDATE asset SET code=? WHERE id=?', (code, aid))

    def test_a_user_can_cancel_while_waiting_for_the_processing_lock(self):
        stopped = threading.Event()
        errors = []
        provider = stub_provider()
        holder = FileLock(str(state_path(self.config)) + '.lock', timeout=0)
        holder.acquire()

        def user_run():
            try:
                process_library(self.config, self.db, self.root / 'generated', self.root / 'covers',
                                provider_factory=lambda: provider, database=self.database,
                                active=lambda: not stopped.is_set())
            except Exception as error:
                errors.append(error)

        with patch('peach.library_processing.LOCK_RETRY_SECONDS', 0.01):
            thread = threading.Thread(target=user_run)
            thread.start()
            try:
                deadline = time.monotonic() + 10
                while not library_processing._foreground_waiting() and time.monotonic() < deadline:
                    time.sleep(0.01)
                self.assertTrue(library_processing._foreground_waiting())
                stopped.set()
                thread.join(10)
                self.assertFalse(thread.is_alive())
            finally:
                stopped.set()
                holder.release()
                thread.join(10)
        self.assertEqual(len(errors), 1)
        self.assertIsInstance(errors[0], InterruptedError)
        self.assertFalse(library_processing._foreground_waiting())
        provider.query.assert_not_called()

    def test_a_background_collection_steps_aside_while_the_processing_lock_is_held(self):
        config, db, database = self.config, self.db, self.database
        provider = stub_provider()
        provider.query.return_value = {}
        output = self.root / 'state/upgrade-repairs/1.json'
        holder = FileLock(str(state_path(config)) + '.lock', timeout=0)
        holder.acquire()
        try:
            with self.assertRaises(ProcessingBusy) as caught:
                process_library(config, db, self.root / 'generated', self.root / 'covers', asset_ids=[1],
                                stage='collect', state_file=output, provider_factory=lambda: provider,
                                database=database)
            self.assertFalse(caught.exception.ready())
        finally:
            holder.release()
        self.assertTrue(caught.exception.ready())
        provider.query.assert_not_called()

    def test_a_user_run_waits_for_the_processing_lock_and_holds_background_work_back(self):
        config, db, database = self.config, self.db, self.database
        provider = stub_provider()
        provider.query.return_value = {}
        holder = FileLock(str(state_path(config)) + '.lock', timeout=0)
        holder.acquire()
        results, errors = [], []

        def user_run():
            try:
                results.append(process_library(config, db, self.root / 'generated', self.root / 'covers',
                                               provider_factory=lambda: provider, database=database))
            except Exception as error:
                errors.append(error)

        with patch('peach.library_processing.LOCK_RETRY_SECONDS', 0.01), \
                patch('peach.library_processing._enrich_finished_performers',
                      return_value={'aliases': 0, 'avatars': 0, 'conflicts': 0, 'failed': 0}):
            thread = threading.Thread(target=user_run)
            thread.start()
            try:
                deadline = time.monotonic() + 10
                while not library_processing._foreground_waiting() and time.monotonic() < deadline:
                    time.sleep(0.01)
                self.assertTrue(library_processing._foreground_waiting())
                with self.assertRaises(ProcessingBusy):
                    process_library(config, db, self.root / 'generated', self.root / 'covers', asset_ids=[1],
                                    stage='collect', state_file=self.root / 'state/upgrade-repairs/1.json',
                                    provider_factory=lambda: provider, database=database)
            finally:
                holder.release()
                thread.join(30)
        self.assertEqual(errors, [])
        self.assertNotEqual(results[0].get('outcome'), 'interrupted')
        self.assertEqual(sorted({call.args[0] for call in provider.query.call_args_list}), ['ABW-358', 'ABW-359'])
        self.assertFalse(library_processing._foreground_waiting())

    def test_a_running_background_collection_yields_to_a_user_run_at_its_next_checkpoint(self):
        config, db, database = self.config, self.db, self.database
        entered, proceed = threading.Event(), threading.Event()
        stopping = threading.Event()

        processing_lock = library_processing._processing_lock

        @contextmanager
        def pause_background(config, *, background, active):
            with processing_lock(config, background=background, active=active) as locked_active:
                if background:
                    entered.set()
                    proceed.wait()
                yield locked_active

        provider = stub_provider()
        provider.query.return_value = {}
        background, user = [], []

        def run(sink, **options):
            try:
                sink.append(process_library(config, db, self.root / 'generated', self.root / 'covers',
                                            provider_factory=lambda: provider, database=database,
                                            active=lambda: not stopping.is_set(), **options))
            except Exception as error:
                sink.append(error)

        with patch('peach.library_processing.LOCK_RETRY_SECONDS', 0.01), \
                patch('peach.library_processing._processing_lock', pause_background), \
                patch('peach.library_processing._enrich_finished_performers',
                      return_value={'aliases': 0, 'avatars': 0, 'conflicts': 0, 'failed': 0}):
            first = threading.Thread(target=run, args=(background,), kwargs=dict(
                asset_ids=[1, 2], stage='collect', state_file=self.root / 'state/upgrade-repairs/1.json'))
            threads = [first]
            first.start()
            try:
                self.assertTrue(entered.wait(10), f'后台处理尚未取得锁，实际结果：{background!r}')
                second = threading.Thread(target=run, args=(user,))
                second.start()
                threads.append(second)
                deadline = time.monotonic() + 10
                while not library_processing._foreground_waiting() and time.monotonic() < deadline:
                    time.sleep(0.01)
                self.assertTrue(library_processing._foreground_waiting())
                proceed.set()
                for thread in threads:
                    thread.join(30)
                    self.assertFalse(thread.is_alive())
            finally:
                stopping.set()
                proceed.set()
                for thread in threads:
                    thread.join()
        self.assertIsInstance(background[0], ProcessingBusy)
        self.assertIsInstance(user[0], dict)
        self.assertNotEqual(user[0].get('outcome'), 'interrupted')
