"""标签身份归一、合并与隐藏的事务回归。"""
import json
import sqlite3
import runpy
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from support.ledger import fresh_ledger
from peach.catalog_rules import current_tags
from peach.entities import upsert_asset_entity
from peach.repository import LedgerDatabase
from peach.tag_management import apply_plan, duplicate_groups, preview, tag_rows
from peach.web_catalog import con_tags, tag_not_hidden
from peach.web_tags import q_tag_management, w_tag_management
from peach.web_entity import q_index
from peach.web_contract import WebContract


class TagManagementTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.db = fresh_ledger(Path(self.tmp.name).resolve())
        self.database = LedgerDatabase(self.db)
        self.c = self.database.connect(write=True)
        self.addCleanup(self.c.close)
        self.c.executemany("INSERT INTO asset(id,location,path,name,medium) VALUES(?,'local',?,?,'video')",
                           [(i, f'R:\\demo\\{i}.mp4', f'{i}.mp4') for i in range(1, 5)])
        self.c.commit()

    def tag(self, name, assets=(1,), source='web-user'):
        entity_id = None
        for aid in assets:
            self.c.execute('INSERT OR IGNORE INTO asset_tag(asset_id,tag,confidence,source) VALUES(?,?,1,?)', (aid, name, source))
            entity_id = upsert_asset_entity(self.c, kind='tag', name=name, asset_id=aid, role='tag', source=source)
        return entity_id

    def execute(self, operation, ids, **fields):
        body = dict(operation=operation, ids=ids, **fields)
        plan = preview(self.c, body)
        return apply_plan(self.c, dict(body, token=plan['token']))

    def management_contract(self):
        root = Path(self.tmp.name).resolve()
        contract = WebContract(self.db, sources_root=root / 'sources', secrets_root=root / 'secrets',
            state_root=root / 'state')
        self.addCleanup(contract.stop_background_jobs)
        contract.followups.stop()
        return contract

    def test_management_pages_filter_aliases_width_categories_and_state_before_slicing(self):
        original = self.tag('Original', (1, 2))
        self.execute('rename', [original], name='Alpha')
        self.tag('Beta')
        self.tag('gamma', (1, 2, 3))
        self.tag('眼镜')
        hidden = self.tag('Dormant')
        self.execute('hide', [hidden])
        self.c.commit()
        contract = self.management_contract()
        first = q_tag_management(contract, dict(limit='2'))
        second = q_tag_management(contract, dict(limit='2', offset='2'))
        self.assertEqual([row['k'] for row in first['items']], ['gamma', 'Alpha'])
        self.assertEqual([row['k'] for row in second['items']], ['Beta', '眼镜'])
        self.assertEqual((first['total'], first['has_more'], first['limit'], first['offset']), (4, True, 2, 0))
        self.assertEqual((second['total'], second['has_more']), (4, False))
        alphabet = q_tag_management(contract, dict(limit='2', view='alphabet'))
        self.assertEqual([row['k'] for row in alphabet['items']], ['Alpha', 'Beta'])
        found = q_tag_management(contract, dict(limit='20', q='ＯＲＩＧＩＮＡＬ'))
        self.assertEqual([row['k'] for row in found['items']], ['Alpha'])
        self.assertEqual((found['total'], found['categories']), (1, {'general': 1}))
        category = q_tag_management(contract, dict(limit='1', category='appearance'))
        self.assertEqual([row['k'] for row in category['items']], ['眼镜'])
        self.assertEqual((category['total'], category['categories']), (1, {'general': 3, 'appearance': 1}))
        hidden_page = q_tag_management(contract, dict(limit='20', state='hidden'))
        self.assertEqual([row['k'] for row in hidden_page['items']], ['Dormant'])
        self.assertEqual(q_tag_management(contract, dict(limit='20', state='blocked'))['total'], 0)
        past_end = q_tag_management(contract, dict(limit='2', offset='99'))
        self.assertEqual((past_end['items'], past_end['total'], past_end['has_more']), ([], 4, False))
        complete = q_tag_management(contract, dict(q='不存在', state='active'))
        self.assertEqual(set(complete), {'items', 'duplicate_groups'})
        self.assertEqual(len(complete['items']), 5)

    def test_management_page_limits_duplicate_groups_and_cache_invalidation(self):
        self.tag('眼镜')
        self.c.execute("INSERT INTO entity(kind,canonical_name,normalized_name,created_at,updated_at) VALUES('tag','眼镜娘','眼镜娘','now','now')")
        self.c.commit()
        contract = self.management_contract()
        with patch('peach.web_tags.tag_rows', wraps=tag_rows) as inventory:
            complete = q_tag_management(contract, {})
            self.assertEqual(len(complete['duplicate_groups']), 1)
            for raw, expected in [('invalid', 20), ('0', 1), ('-5', 1), ('99999', 600)]:
                page = q_tag_management(contract, dict(limit=raw, offset='invalid', q='不存在'))
                self.assertEqual((page['limit'], page['offset'], page['total']), (expected, 0, 0))
                self.assertEqual(page['duplicate_groups'], complete['duplicate_groups'])
            self.assertEqual(inventory.call_count, 1)
            complete['items'][0]['k'] = '客户端临时值'
            self.assertNotIn('客户端临时值', [row['k'] for row in q_tag_management(contract, {})['items']])
            contract.cache_bust()
            q_tag_management(contract, dict(limit='1'))
            self.assertEqual(inventory.call_count, 2)
            self.tag('新标签')
            self.c.commit()
            self.assertEqual(q_tag_management(contract, dict(limit='20'))['total'], 3)
            self.assertEqual(inventory.call_count, 3)
        for args in [dict(limit='20', state='unknown'), dict(limit='20', view='unknown')]:
            with self.subTest(args=args), self.assertRaisesRegex(ValueError, '未知的标签'):
                q_tag_management(contract, args)

    def test_local_browse_tag_total_counts_filtered_rows_on_every_page(self):
        self.tag('Alpha')
        self.tag('Beta')
        self.tag('眼镜')
        self.c.commit()
        contract = self.management_contract()
        first = q_index(contract, 'tags', limit=1)
        self.assertEqual((len(first['items']), first['total'], first['has_more']), (1, 3, True))
        category = q_index(contract, 'tags', limit=1, category='general', offset=20)
        self.assertEqual((category['items'], category['total'], category['has_more']), ([], 2, False))
        searched = q_index(contract, 'tags', q='Alpha', limit=1)
        self.assertEqual((len(searched['items']), searched['total']), (1, 1))
        self.assertNotIn('total', q_index(contract, 'performers', limit=1))

    def test_rename_preserves_unrelated_historical_reference_violations(self):
        entity_id = self.tag('眼镜')
        self.c.commit()
        self.c.execute('PRAGMA foreign_keys=OFF')
        self.c.execute('CREATE TABLE historical_parent(id INTEGER PRIMARY KEY)')
        self.c.execute('CREATE TABLE historical_reference(id INTEGER PRIMARY KEY,parent_id REFERENCES historical_parent(id))')
        self.c.execute('INSERT INTO historical_reference VALUES(1,999)')
        self.c.commit()
        self.c.execute('PRAGMA foreign_keys=ON')
        historical = list(map(tuple, self.c.execute('PRAGMA foreign_key_check')))
        self.execute('rename', [entity_id], name='我的眼镜')
        self.assertEqual(list(map(tuple, self.c.execute('PRAGMA foreign_key_check'))), historical)
        self.assertEqual(self.c.execute('SELECT canonical_name FROM entity WHERE id=?', (entity_id,)).fetchone()[0], '我的眼镜')

    def test_tag_operation_rejects_new_foreign_key_violations(self):
        entity_id = self.tag('眼镜')
        self.c.commit()
        self.c.execute('PRAGMA foreign_keys=OFF')
        self.c.execute('CREATE TABLE tag_reference(entity_id REFERENCES entity(id))')
        self.c.execute('CREATE TRIGGER bad_tag_reference AFTER UPDATE OF canonical_name ON entity BEGIN INSERT INTO tag_reference VALUES(-1); END')
        self.c.commit()
        with self.assertRaisesRegex(ValueError, '外键检查'):
            self.execute('rename', [entity_id], name='我的眼镜')
        self.c.rollback()
        self.assertEqual(self.c.execute('SELECT canonical_name FROM entity WHERE id=?', (entity_id,)).fetchone()[0], '眼镜')
        self.assertEqual(self.c.execute('SELECT count(*) FROM tag_reference').fetchone()[0], 0)

    def test_display_spellings_and_width_share_one_identity(self):
        self.assertEqual(current_tags(['眼镜娘', '眼镜', '３Ｐ', '3P多人', 'ＶＲ', 'vr']), ['眼镜', '3P多人', 'VR'])
        first = self.tag('眼镜')
        self.assertEqual(self.tag('眼镜娘', (2,)), first)
        self.assertEqual([row[0] for row in self.c.execute('SELECT DISTINCT tag FROM asset_tag')], ['眼镜'])

    def test_renamed_tag_accepts_old_names_and_keeps_hidden_decision(self):
        entity_id = self.tag('自定义标签')
        self.execute('rename', [entity_id], name='我的标签')
        self.execute('hide', [entity_id])
        self.assertEqual(self.tag('自定义标签', (2,), source='javinizer:javdb:tag'), entity_id)
        row = self.c.execute('SELECT canonical_name,metadata_json FROM entity WHERE id=?', (entity_id,)).fetchone()
        self.assertEqual(row[0], '我的标签')
        self.assertEqual(json.loads(row[1])['user_tag_hidden'], 1)
        self.assertEqual([row[0] for row in self.c.execute('SELECT DISTINCT tag FROM asset_tag')], ['我的标签'])

    def test_merge_keeps_source_assertions_preferences_and_genre_mapping(self):
        first = self.tag('甲', (1, 2), source='javinizer:javdb:tag')
        second = self.tag('乙', (1, 3), source='filename')
        self.c.execute("INSERT INTO asset_tag_preference VALUES('local-default',2,'甲',1,'now')")
        self.c.execute("INSERT INTO genre_decision VALUES('source','source','甲','now')")
        body = dict(operation='merge', ids=[first, second], target_id=second)
        plan = preview(self.c, body)
        self.assertEqual((plan['assets'], plan['overlap']), (3, 1))
        apply_plan(self.c, dict(body, token=plan['token']))
        self.assertEqual(self.c.execute('SELECT count(*) FROM entity').fetchone()[0], 1)
        self.assertEqual(self.c.execute('SELECT count(DISTINCT asset_id) FROM asset_entity WHERE entity_id=?', (second,)).fetchone()[0], 3)
        self.assertEqual(self.c.execute('SELECT normalized_tag FROM asset_tag_preference').fetchone()[0], '乙')
        self.assertEqual(self.c.execute('SELECT peach_tag FROM genre_decision').fetchone()[0], '乙')
        self.assertEqual(self.c.execute('SELECT source FROM asset_tag WHERE asset_id=1').fetchone()[0], 'javinizer:javdb:tag')
        self.assertEqual(self.tag('甲', (4,)), second)
        self.assertEqual(list(self.c.execute('PRAGMA foreign_key_check')), [])

    def test_rename_conflict_requires_explicit_merge(self):
        first = self.tag('甲')
        self.tag('乙')
        with self.assertRaisesRegex(ValueError, '请使用合并'):
            preview(self.c, dict(operation='rename', ids=[first], name='乙'))

    def test_stale_plan_does_not_apply(self):
        entity_id = self.tag('甲')
        body = dict(operation='rename', ids=[entity_id], name='乙')
        plan = preview(self.c, body)
        self.tag('甲', (2,))
        with self.assertRaisesRegex(ValueError, '重新预览'):
            apply_plan(self.c, dict(body, token=plan['token']))
        self.assertEqual(self.c.execute('SELECT canonical_name FROM entity').fetchone()[0], '甲')

    def test_hidden_tag_can_be_restored_for_all_assets(self):
        entity_id = self.tag('甲', (1, 2))
        self.execute('hide', [entity_id])
        sql = 'SELECT ae.asset_id FROM asset_entity ae JOIN entity e ON e.id=ae.entity_id WHERE ' + tag_not_hidden('ae.asset_id', 'e.normalized_name')
        self.assertEqual(list(self.c.execute(sql)), [])
        self.execute('restore', [entity_id])
        self.assertEqual(len(list(self.c.execute(sql))), 2)

    def test_raw_source_spelling_obeys_hidden_tag_and_keeps_its_evidence(self):
        entity_id = self.tag('眼镜娘', source='pixiv_tag')
        self.execute('hide', [entity_id])
        self.c.commit()
        contract = SimpleNamespace(read_connection=self.database.read_connection)
        self.assertEqual(con_tags(contract, [1], '?'), [])
        self.assertEqual(self.c.execute('SELECT tag,source FROM asset_tag').fetchone()[:], ('眼镜娘', 'pixiv_tag'))
        self.execute('restore', [entity_id])
        self.c.commit()
        self.assertEqual(len(con_tags(contract, [1], '?')), 1)

    def test_repair_unifies_registered_spellings_and_is_idempotent(self):
        first = self.tag('眼镜')
        self.c.execute("INSERT INTO entity(kind,canonical_name,normalized_name,created_at,updated_at) VALUES('tag','眼镜娘','眼镜娘','now','now')")
        second = self.c.execute('SELECT last_insert_rowid()').fetchone()[0]
        self.c.execute("INSERT INTO asset_entity(asset_id,entity_id,role,source) VALUES(2,?,'tag','legacy')", (second,))
        self.c.execute("INSERT INTO asset_tag VALUES(2,'眼镜娘',1,'legacy')")
        self.assertEqual(len(duplicate_groups(tag_rows(self.c))), 1)
        self.execute('repair', [])
        self.assertEqual([row['entity_id'] for row in tag_rows(self.c)], [first])
        self.assertEqual(duplicate_groups(tag_rows(self.c)), [])
        self.execute('repair', [])

    def test_http_write_creates_a_sqlite_backup_and_commits(self):
        entity_id = self.tag('甲')
        body = dict(operation='rename', ids=[entity_id], name='乙')
        body['token'] = preview(self.c, body)['token']
        self.c.commit()
        contract = SimpleNamespace(db_path=self.db, read_connection=self.database.read_connection,
            write_transaction=self.database.write_transaction, cache_bust=Mock())
        self.assertTrue(w_tag_management(contract, body)['ok'])
        backups = list(self.db.parent.glob('ledger.pre-tag-management-*.db'))
        self.assertEqual(len(backups), 1)
        with closing(sqlite3.connect(backups[0])) as backup:
            self.assertEqual(backup.execute('SELECT canonical_name FROM entity').fetchone()[0], '甲')
        self.assertEqual(self.c.execute('SELECT canonical_name FROM entity').fetchone()[0], '乙')

    def test_maintenance_script_previews_and_requires_backup_for_apply(self):
        self.tag('眼镜')
        self.c.execute("INSERT INTO entity(kind,canonical_name,normalized_name,created_at,updated_at) VALUES('tag','眼镜娘','眼镜娘','now','now')")
        self.c.commit()
        script = runpy.run_path(str(Path(__file__).resolve().parents[1] / 'scripts' / 'repair_duplicate_tags.py'))
        report = self.db.parent / 'review.csv'
        parser = script['build_parser']()
        options = ['--db', str(self.db), '--review-csv', str(report)]
        self.assertEqual(script['run'](parser.parse_args(options)), 0)
        self.assertIn('眼镜娘', report.read_text(encoding='utf-8'))
        self.assertEqual(len(tag_rows(self.c)), 2)
        with self.assertRaises(SystemExit):
            script['run'](parser.parse_args([*options, '--apply']))
        backup = self.db.parent / 'before.db'
        self.assertEqual(script['run'](parser.parse_args([*options, '--apply', '--backup', str(backup)])), 0)
        self.assertTrue(backup.exists())
        self.assertEqual(len(tag_rows(self.c)), 1)
