"""来源注册表与流量口径：只剩 Google Drive 与 OneDrive 两条路。"""
import sqlite3
import unittest
from types import SimpleNamespace

from peach import media_sources


class SourceRegistryTests(unittest.TestCase):
    def test_registry_lists_the_two_drives(self):
        self.assertEqual([source.id for source in media_sources.SOURCE_REGISTRY], ['gdrive', 'onedrive'])
        self.assertEqual([label for _, label in media_sources.SOURCE_OPTIONS], ['Google Drive', 'OneDrive'])
        self.assertEqual(set(media_sources.CLOUD_LOCATIONS), {'gdrive', 'onedrive'})

    def test_everything_defaults_to_metered(self):
        for location in ('gdrive', 'onedrive'):
            with self.subTest(location=location):
                self.assertEqual(media_sources.cost_for(location), 'metered')
        self.assertEqual(media_sources.cost_for('115'), 'metered')
        self.assertEqual(media_sources.cost_for(''), 'metered')


class CostSqlTests(unittest.TestCase):
    def evaluate(self, expression, parameters, rows):
        with sqlite3.connect(':memory:') as connection:
            connection.execute('CREATE TABLE a (location TEXT)')
            connection.executemany('INSERT INTO a VALUES (?)', [(row,) for row in rows])
            return [row[0] for row in connection.execute(f'SELECT {expression} FROM a', parameters)]

    def test_expression_agrees_with_cost_for(self):
        expression, parameters = media_sources.cost_sql('a.location', 'a.path')
        rows = ['gdrive', 'onedrive', 'local', 'unknown']
        self.assertEqual(self.evaluate(expression, parameters, rows),
                         [media_sources.cost_for(row) for row in rows])

    def test_expression_ignores_configuration(self):
        config = SimpleNamespace(drive_roots={'gdrive': ('root-1',)})
        first, first_parameters = media_sources.cost_sql('a.location', 'a.path', config=config)
        second, second_parameters = media_sources.cost_sql('a.location', 'a.path')
        self.assertEqual((first, first_parameters), (second, second_parameters))

    def test_column_names_must_look_like_columns(self):
        for bad in ('location; DROP TABLE asset', 'a.location) OR 1=1 --', ''):
            with self.subTest(bad=bad), self.assertRaisesRegex(ValueError, '列名'):
                media_sources.cost_sql(bad, 'path')


if __name__ == '__main__':
    unittest.main()
