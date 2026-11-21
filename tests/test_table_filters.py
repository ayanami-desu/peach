import json
import unittest

from peach.table_filters import MEDIA_RANGE_READERS, column_filters, filter_rows, in_range, range_limits


class TableFilterTests(unittest.TestCase):
    def test_multiselect_keeps_empty_includes_and_deduplicates_values(self):
        selected = column_filters(
            '{"people":{"exclude":["owner:none","owner:none","creator:Alice:Studio"]},"tags":[]}',
            {"people", "tags"},
        )
        self.assertEqual(selected, {"people": {"exclude": ["owner:none", "creator:Alice:Studio"]}, "tags": []})
        self.assertEqual(column_filters(None, ()), {})
        self.assertEqual(column_filters("", ()), {})

    def test_invalid_filters_raise_value_error(self):
        for value in (
            "{", "null", "[]", '{"unsupported":[]}', '{"people":["Alice"]}',
            '{"people":["owner:other"]}', '{"people":["creator:"]}',
            '{"tags":[" "]}', '{"tags":[1]}', '{"tags":{"include":[]}}',
            '{"tags":{"range":{"min":1}}}', '{"size":["1"]}', '{"size":{"range":{"min":-1}}}',
            '{"size":{"range":{"min":true}}}', '{"size":{"range":{"min":NaN}}}', '{"size":{"range":{"min":Infinity}}}',
            '{"size":{"range":{"max":9007199254740992}}}', '{"size":{"range":{"min":4,"max":3}}}',
            '{"size":{"range":{}}}', '{"size":{"min":1}}', '{"released":{"range":{"min":"2025-02-29"}}}',
            '{"released":{"range":{"min":"20240101"}}}', '{"seen":{"range":{"min":0,"max":0}}}',
        ):
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, "invalid column filters"):
                column_filters(value, {"people", "tags"}, {"size": "number", "seen": "timestamp", "released": "date"})

    def test_range_limits_match_bounds_used_for_rows(self):
        for kind, minimum, maximum in (("number", 0, 20), ("date", "2024-02-29", "2024-03-01"),
                                        ("timestamp", -60, 0)):
            bounds = {"min": minimum, "max": maximum}
            self.assertEqual(column_filters(json.dumps({"x": {"range": bounds}}), (), {"x": kind}), {"x": {"range": bounds}})
            self.assertTrue(in_range(minimum, bounds, kind))
            self.assertEqual(in_range(maximum, bounds, kind), kind != "timestamp")
            self.assertEqual(range_limits(bounds, kind), [(">=", minimum), ("<" if kind == "timestamp" else "<=", maximum)])
            self.assertFalse(in_range(None, bounds, kind))

    def test_facets_exclude_only_their_own_filter_and_ignore_duplicate_options(self):
        rows = [
            {"tags": ["a", "a", "b"], "duration": 20, "size": 10},
            {"tags": [], "duration": 0, "size": 10},
            {"tags": ["a"], "duration": 20, "size": None},
            {"tags": ["b"], "duration": 20, "size": 10},
        ]
        columns = {"tags": lambda row: row["tags"]}
        matched, facets = filter_rows(rows, '{"tags":{"exclude":["b"]},"dur":{"range":{"min":0}},"size":{"range":{"max":10}}}',
                                     columns, ranges=MEDIA_RANGE_READERS)
        self.assertEqual(matched, [])
        self.assertEqual(facets, {"tags": [{"id": "a", "count": 1}, {"id": "b", "count": 2}]})
        matched, facets = filter_rows(rows, '{"tags":["none"]}', columns)
        self.assertEqual(matched, [rows[1]])
        self.assertEqual(facets["tags"], [{"id": "a", "count": 2}, {"id": "b", "count": 2}, {"id": "none", "count": 1}])
