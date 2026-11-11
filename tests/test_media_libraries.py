"""媒体库就是扫描根：名称、图标、处理方式与筛选条件都从设置文件来。"""
import sqlite3
import unittest
from types import SimpleNamespace

from peach import media_libraries


def config(**overrides):
    values = {'drive_roots': {'gdrive': ('root-1', 'root-2'), 'onedrive': ('root-3',)},
              'library_names': {}, 'library_icons': {}, 'library_catalog': {}}
    values.update(overrides)
    return SimpleNamespace(**values)


class LibraryListTests(unittest.TestCase):
    def test_one_library_per_scan_root(self):
        rows = media_libraries.libraries(config())
        self.assertEqual([row['id'] for row in rows], ['gdrive:root-1', 'gdrive:root-2', 'onedrive:root-3'])
        self.assertEqual(rows[0]['roots'],
                         [{'account': 'gdrive', 'location': 'gdrive', 'root': 'root-1', 'root_id': 'root-1'}])

    def test_unknown_source_is_ignored(self):
        rows = media_libraries.libraries(config(drive_roots={'115': ('b1',), 'gdrive': ('root-1',)}))
        self.assertEqual([row['id'] for row in rows], ['gdrive:root-1'])

    def test_two_accounts_of_one_source_stay_two_libraries(self):
        rows = media_libraries.libraries(config(
            drive_roots={'onedrive-family': ('root-a',), 'onedrive-math': ('root-b',)},
            drive_locations={'onedrive-family': 'onedrive', 'onedrive-math': 'onedrive'}))
        self.assertEqual([row['id'] for row in rows], ['onedrive:root-a', 'onedrive:root-b'])
        self.assertEqual([row['roots'][0]['location'] for row in rows], ['onedrive', 'onedrive'])

    def test_display_fields_come_from_the_catalog_then_fall_back(self):
        catalog = {'gdrive:root-1': {'name': '电影', 'icon': 'heart', 'color': '#123456',
                                    'policy': 'custom', 'stages': 'probe, cover, unknown'}}
        rows = media_libraries.libraries(config(library_catalog=catalog))
        first, second = rows[0], rows[1]
        self.assertEqual((first['name'], first['icon'], first['color'], first['policy']),
                         ('电影', 'heart', '#123456', 'custom'))
        self.assertEqual(first['stages'], ['probe', 'cover'])
        self.assertEqual((second['name'], second['icon'], second['policy']), ('root-2', 'database', 'auto'))
        self.assertEqual(second['stages'], list(media_libraries.STAGES))

    def test_bad_icon_falls_back_to_database(self):
        rows = media_libraries.libraries(config(library_catalog={'gdrive:root-1': {'icon': '<script>'}}))
        self.assertEqual(rows[0]['icon'], 'database')

    def test_a_folder_name_from_the_drive_fills_in_unnamed_roots(self):
        rows = media_libraries.libraries(config(), {'gdrive:root-1': '示例目录', 'onedrive:root-3': '存档'})
        self.assertEqual([row['name'] for row in rows], ['示例目录', 'root-2', '存档'])

    def test_a_name_saved_in_the_settings_wins_over_the_folder_name(self):
        rows = media_libraries.libraries(
            config(library_names={'gdrive:root-1': '改过的名字'}), {'gdrive:root-1': '示例目录'})
        self.assertEqual(rows[0]['name'], '改过的名字')


class PredicateTests(unittest.TestCase):
    def test_missing_library_selects_nothing(self):
        self.assertEqual(media_libraries.predicate(config(), 'nope'), ('0', []))

    def test_predicate_matches_source_and_scan_root(self):
        with sqlite3.connect(':memory:') as connection:
            connection.execute('CREATE TABLE asset (location TEXT, drive_root TEXT, path TEXT)')
            connection.executemany('INSERT INTO asset VALUES (?,?,?)', [
                ('gdrive', 'root-1', 'gdrive:/A/a.mp4'), ('gdrive', 'root-2', 'gdrive:/B/b.mp4'),
                ('onedrive', 'root-3', 'onedrive:/C/c.mp4'), ('gdrive', None, 'gdrive:/legacy.mp4')])
            clause, parameters = media_libraries.predicate(config(), 'gdrive:root-1')
            rows = connection.execute('SELECT path FROM asset a WHERE ' + clause, parameters).fetchall()
        self.assertEqual([row[0] for row in rows], ['gdrive:/A/a.mp4'])

    def test_stages_by_root_and_ownership(self):
        catalog = {'gdrive:root-1': {'stages': 'metadata', 'policy': 'custom'}}
        settings = config(library_catalog=catalog)
        stages = media_libraries.stages_by_root(settings)
        self.assertEqual(stages['gdrive:root-1'], frozenset({'metadata'}))
        self.assertEqual(stages['onedrive:root-3'], frozenset(media_libraries.STAGES))
        self.assertEqual(media_libraries.ownership(settings, 'gdrive', 'root-1'),
                         {'root_id': 'gdrive:root-1', 'library_id': 'gdrive:root-1'})
        self.assertEqual(media_libraries.ownership(settings, 'gdrive', 'gone'), {})
        self.assertEqual(media_libraries.ownership(settings, None, None), {})


class RowTests(unittest.TestCase):
    """设置页交上来的那几个字段：合法值原样落库，越界的一律报出来。"""

    def test_a_valid_row_is_trimmed_and_kept(self):
        self.assertEqual(
            media_libraries.row({'name': ' 电影 ', 'icon': 'heart', 'color': 'red',
                                 'policy': 'custom', 'stages': 'probe,preview'}),
            {'name': '电影', 'icon': 'heart', 'color': 'red', 'policy': 'custom',
             'stages': 'probe,preview'})

    def test_stages_are_dropped_when_the_policy_is_not_custom(self):
        self.assertEqual(media_libraries.row({'name': 'AV', 'policy': 'auto', 'stages': ''}),
                         {'name': 'AV', 'icon': '', 'color': '', 'policy': 'auto'})

    def test_each_bad_field_is_refused_by_name(self):
        cases = (
            ({}, '媒体库名称请使用 1 到 80 个可见字符'),
            ({'name': 'x' * 81}, '媒体库名称请使用 1 到 80 个可见字符'),
            ({'name': 'AV', 'icon': '<script>'}, '请选择列表中的媒体库图标'),
            ({'name': 'AV', 'color': '#123456'}, '请选择列表中的来源色'),
            ({'name': 'AV', 'policy': 'local'}, '请选择列表中的处理方式'),
            ({'name': 'AV', 'policy': 'auto', 'stages': 'probe'}, '处理步骤无效'),
            ({'name': 'AV', 'policy': 'custom', 'stages': 'nope'}, '处理步骤无效'),
        )
        for value, message in cases:
            with self.subTest(value=value):
                with self.assertRaises(ValueError) as caught:
                    media_libraries.row(value)
                self.assertEqual(str(caught.exception), message)

    def test_a_non_mapping_is_refused(self):
        with self.assertRaises(ValueError):
            media_libraries.row(['AV'])


if __name__ == '__main__':
    unittest.main()
