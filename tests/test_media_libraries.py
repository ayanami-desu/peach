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
        self.assertEqual(rows[0]['roots'], [{'location': 'gdrive', 'root': 'root-1', 'root_id': 'root-1'}])

    def test_unknown_source_is_ignored(self):
        rows = media_libraries.libraries(config(drive_roots={'115': ('b1',), 'gdrive': ('root-1',)}))
        self.assertEqual([row['id'] for row in rows], ['gdrive:root-1'])

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


if __name__ == '__main__':
    unittest.main()
