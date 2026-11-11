"""按模板整理：模板渲染、逃逸防护、计划生成、网盘改名与回滚（ADR-0039）。"""
from __future__ import annotations

import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from dataclasses import replace
from pathlib import Path
from unittest import mock

from peach import organize
from peach.drive_provider import DriveEntry, DriveNotFound
from peach.organize_templates import (
    TemplateError, render, sanitise_component, validate_template, clean_filename,
)
from support.ledger import fresh_ledger

SOURCE = "gdrive"

VALUES = {
    "code": "ABC-123", "title": "标题", "studio": "厂牌", "series": "系列",
    "year": "2024", "actors": "甲、乙", "cd": "2", "mosaic": "无码",
    "definition": "1080p",
}


class TemplateRenderTests(unittest.TestCase):
    CASES = [
        # (模板, 取值覆盖, 期望)
        ("{code}", {}, "ABC-123"),
        ("{code}[ {title}]", {}, "ABC-123 标题"),
        ("{number}", {}, "ABC-123"),
        ("{number} {title}", {}, "ABC-123 标题"),
        ("{number}[ {title}]", {"title": ""}, "ABC-123"),
        ("{number}[ {title}]", {}, "ABC-123 标题"),
        ("{number}[ CD{cd}]", {"cd": ""}, "ABC-123"),
        ("{number}[ CD{cd}]", {}, "ABC-123 CD2"),
        ("[{mosaic} ]{number}", {"mosaic": ""}, "ABC-123"),
        ("[{studio} ][{series} ]{number}", {"series": ""}, "厂牌 ABC-123"),
        ("{number} [{definition}]", {}, "ABC-123 1080p"),
        # 方括号是分组记号，不进结果；一个占位符都没有的分组就是一段普通字面量。
        ("{number} [完整版]", {}, "ABC-123 完整版"),
        # 转义写法给出字面的括号。
        ("{number} {{x}}", {}, "ABC-123 {x}"),
        ("{number} [[x]]", {}, "ABC-123 [x]"),
        # 出演者与年份是最常见的两组可选信息。
        ("{number}[ ({year})][ {actors}]", {"year": ""}, "ABC-123 甲、乙"),
    ]

    def test_render_table(self):
        for template, overrides, expected in self.CASES:
            with self.subTest(template=template, overrides=overrides):
                values = {**VALUES, **overrides}
                text, _missing = render(template, values)
                self.assertEqual(text, expected)

    def test_missing_required_field_is_reported(self):
        text, missing = render("{number} {title}", {**VALUES, "title": ""})
        self.assertEqual(missing, frozenset({"title"}))
        self.assertEqual(text, "ABC-123")

    def test_optional_field_is_not_required(self):
        _text, missing = render("{number}[ {title}]", {**VALUES, "title": ""})
        self.assertEqual(missing, frozenset())

    def test_directory_template_keeps_layers(self):
        text, _missing = render("{studio}/{number}", VALUES, directory=True)
        self.assertEqual(text, "厂牌/ABC-123")

    def test_presets_render_the_displayed_example_path(self):
        for preset in organize.PRESETS:
            with self.subTest(preset=preset["label"]):
                filename, missing = render(preset["file"], VALUES)
                directory, directory_missing = render(preset["dir"], VALUES, directory=True)
                self.assertFalse(missing | directory_missing)
                self.assertEqual("/".join(filter(None, (directory, filename + ".mp4"))), preset["example"])


class SanitiseTests(unittest.TestCase):
    def test_filename_symbols_and_invalid_unicode_are_removed(self):
        cases = {
            '01_First Part⧹⧹Second Part⧹⧹Last Scene.mp4':
                '01_First Part Second Part Last Scene.mp4',
            '★ 标题💎👑✨ → 片段 �.mp4': '标题 片段.mp4',
            '标题＼＼片段﹨补充／附录.mp4': '标题 片段 补充 附录.mp4',
            '标题\ue519\u200b\ufeff\x00片段.mp4': '标题片段.mp4',
            '👩🏽\u200d💻标题❤️\ufe0f.mp4': '标题.mp4',
            '【中日文】 café ガール 168㎝ 1920×1080 (2).mp4':
                '【中日文】 café ガール 168㎝ 1920×1080 (2).mp4',
            '★💎.mp4': '★💎.mp4',
            '★CON.mp4': '_CON.mp4',
        }
        for original, expected in cases.items():
            with self.subTest(original=original):
                self.assertEqual(clean_filename(original), expected)
                self.assertEqual(clean_filename(expected), expected)

    def test_illegal_characters_become_underscore(self):
        self.assertEqual(sanitise_component('a<b>c:d"e/f\\g|h?i*j'),
                         "a_b_c_d_e_f_g_h_i_j")

    def test_trailing_dot_and_space_are_dropped(self):
        self.assertEqual(sanitise_component("名字. "), "名字")

    def test_reserved_device_name_is_prefixed(self):
        self.assertEqual(sanitise_component("CON"), "_CON")
        self.assertEqual(sanitise_component("nul.mp4"), "_nul.mp4")

    def test_long_value_is_truncated_from_the_middle(self):
        value = sanitise_component("甲" * 400)
        self.assertLessEqual(len(value), 120)
        self.assertIn("…", value)


class TemplateEscapeTests(unittest.TestCase):
    REJECTED = [
        "..\\{number}",
        "../{number}",
        "C:\\{number}",
        "/{number}",
        "{number}/{title}",          # 文件名模板不带分隔符
        "{unknown}",
        "{number",
        "{number}]",
        "[{number}",
    ]

    def test_escaping_templates_are_rejected(self):
        for template in self.REJECTED:
            with self.subTest(template=template):
                with self.assertRaises(TemplateError):
                    validate_template(template)

    def test_directory_template_may_layer_but_not_escape(self):
        self.assertEqual(validate_template("{studio}\\{number}", directory=True),
                         "{studio}/{number}")
        with self.assertRaises(TemplateError):
            validate_template("{studio}/../{number}", directory=True)

    def test_value_cannot_introduce_a_layer(self):
        text, _missing = render("{title}", {"title": "a/../b"})
        self.assertEqual(text, "a_.._b")



class FakeProvider:
    """整理只用到三个方法：列目录、问条目、改名移动。"""

    def __init__(self, entries):
        self.entries = {entry.remote_id: entry for entry in entries}
        self.moves: list[tuple[str, str, str]] = []

    def list_folder(self, parent_id, cursor=None):
        page = [entry for entry in self.entries.values() if entry.parent_id == parent_id]
        return sorted(page, key=lambda entry: entry.remote_id), None

    def entry(self, remote_id):
        if remote_id not in self.entries:
            raise DriveNotFound(remote_id)
        return self.entries[remote_id]

    def move(self, remote_id, parent_id, name=None):
        entry = self.entries[remote_id]
        moved = replace(entry, parent_id=parent_id, name=name or entry.name)
        self.entries[remote_id] = moved
        self.moves.append((remote_id, parent_id, moved.name))
        return moved


class FakeDrive:
    """`DriveConnections` 里整理与设置页用到的那几项。"""

    def __init__(self, provider, roots=("ROOT",)):
        self._provider = provider
        self._roots = tuple(roots)

    def provider(self, _location):
        return self._provider

    def roots(self, _location):
        return self._roots

    def connection(self, location):
        return {"location": location, "label": "Google Drive", "configured": True,
                "connected": True, "email": "peach@example.com",
                "roots": [{"remote_id": remote,
                           "name": self._provider.entry(remote).name} for remote in self._roots]}

    def snapshot(self):
        return {"public_url": "https://peach.example.com",
                "locations": [self.connection(SOURCE)]}


def _entries(folders=(), files=()):
    """搭一棵小目录树：起点 `夹` 下若干目录，每个目录里若干文件。"""
    entries = [DriveEntry(remote_id="ROOT", name="夹", parent_id="", folder=True)]
    for remote_id, name, parent in folders:
        entries.append(DriveEntry(remote_id=remote_id, name=name, parent_id=parent, folder=True))
    for remote_id, name, parent in files:
        entries.append(DriveEntry(remote_id=remote_id, name=name, parent_id=parent, folder=False))
    return entries


def _seed(db_path: Path, rows: list[dict]) -> None:
    with closing(sqlite3.connect(db_path)) as connection:
        for row in rows:
            connection.execute(
                "INSERT INTO asset(id,location,path,name,medium,code,catalog_title,"
                "studio,series,release_date,width,height,remote_id) "
                "VALUES(:id,:location,:path,:name,'video',:code,:title,:studio,NULL,"
                ":release_date,:width,:height,:remote_id)",
                {"location": SOURCE, "series": None, "code": None, "title": None,
                 "studio": None, "release_date": None, "width": None, "height": None,
                 "remote_id": None, **row})
        connection.commit()


def _plan(db_path: Path, **kwargs) -> dict:
    with closing(sqlite3.connect(db_path)) as connection:
        return organize.build_plan(connection, location=SOURCE, **kwargs)


class PlanTests(unittest.TestCase):
    def setUp(self):
        self.holder = Path(tempfile.mkdtemp(prefix="peach-organize-")).resolve()
        self.addCleanup(lambda: __import__("shutil").rmtree(self.holder, ignore_errors=True))
        self.db_path = fresh_ledger(self.holder)

    def test_rename_in_place_and_move_into_template_directory(self):
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/旧/[site.com]abc123.mp4",
             "name": "[site.com]abc123.mp4", "code": "ABC-123", "title": "标题",
             "studio": "厂牌"},
        ])
        plan = _plan(self.db_path, file_template="{number}[ {title}]")
        self.assertEqual(plan["counts"]["change"], 1)
        self.assertEqual(plan["rows"][0]["action"], "rename")
        self.assertEqual(plan["rows"][0]["target_path"], "gdrive:/夹/旧/ABC-123 标题.mp4")

        plan = _plan(self.db_path, file_template="{number}", dir_template="{studio}")
        self.assertEqual(plan["rows"][0]["action"], "move")
        self.assertEqual(plan["rows"][0]["target_path"], "gdrive:/夹/厂牌/ABC-123.mp4")

    def test_directory_scope_includes_descendants_and_excludes_prefix_siblings(self):
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/合集/a.mp4", "name": "a.mp4", "code": "ABC-001"},
            {"id": 2, "path": "gdrive:/夹/合集/子目录/b.mp4", "name": "b.mp4", "code": "ABC-002"},
            {"id": 3, "path": "gdrive:/夹/合集2/c.mp4", "name": "c.mp4", "code": "ABC-003"},
        ])
        plan = _plan(self.db_path, file_template="{number}",
                     path=organize.scope_path(SOURCE, "gdrive:/夹/合集/"))
        self.assertEqual([row["asset_id"] for row in plan["rows"]], [1, 2])
        self.assertEqual(plan["counts"]["total"], 2)
        self.assertEqual(_plan(self.db_path, file_template="{number}")["counts"]["total"], 3)

    def test_scope_rejects_relative_foreign_and_parent_paths(self):
        for path in ("合集", "onedrive:/夹", "gdrive:/夹/../其它"):
            with self.subTest(path=path), self.assertRaisesRegex(organize.OrganizeError, "路径"):
                organize.scope_path(SOURCE, path)
        with self.assertRaisesRegex(organize.OrganizeError, "整理路径"):
            organize.scope_path(SOURCE, ["gdrive:/夹"])

    def test_directory_template_uses_scope_as_base_and_checks_outside_scope_collisions(self):
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/合集/旧/a.mp4", "name": "a.mp4",
             "code": "ABC-001", "studio": "厂牌"},
            {"id": 2, "path": "gdrive:/夹/合集/厂牌/ABC-001.mp4", "name": "ABC-001.mp4",
             "code": "ABC-001"},
        ])
        plan = _plan(self.db_path, file_template="{number}", dir_template="{studio}",
                     path="gdrive:/夹/合集", asset_ids=[1])
        self.assertEqual(plan["counts"]["skip"], 1)
        self.assertEqual(plan["rows"][0]["reason"], organize.SKIP_TARGET_EXISTS)
        self.assertEqual(plan["rows"][0]["target_path"], "gdrive:/夹/合集/厂牌/ABC-001.mp4")

    def test_filename_cleanup_needs_no_template_or_metadata(self):
        _seed(self.db_path, [{"id": 1, "path": "gdrive:/夹/★标题⧹⧹片段.mp4",
                              "name": "★标题⧹⧹片段.mp4"}])
        plan = _plan(self.db_path)
        self.assertEqual(plan["rows"][0]["target_path"], "gdrive:/夹/标题 片段.mp4")

    def test_template_values_share_filename_symbol_cleanup(self):
        _seed(self.db_path, [{"id": 1, "path": "gdrive:/夹/old.mp4", "name": "old.mp4",
                              "code": "ABC-123", "title": "★标题💎"}])
        plan = _plan(self.db_path, file_template="{number} {title}")
        self.assertEqual(plan["rows"][0]["target_path"], "gdrive:/夹/ABC-123 标题.mp4")

    def test_row_already_named_as_asked_is_not_listed(self):
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/ABC-123.mp4", "name": "ABC-123.mp4",
             "code": "ABC-123"},
        ])
        plan = _plan(self.db_path, file_template="{number}")
        self.assertEqual(plan["counts"]["unchanged"], 1)
        self.assertEqual(plan["rows"], [])

    def test_missing_field_skips_the_row(self):
        _seed(self.db_path, [{"id": 1, "path": "gdrive:/夹/x.mp4", "name": "x.mp4", "code": None}])
        plan = _plan(self.db_path, file_template="{number}")
        self.assertEqual(plan["rows"][0]["action"], "skip")
        self.assertEqual(plan["rows"][0]["reason"], organize.SKIP_MISSING_FIELD)

    def test_two_rows_landing_on_one_name_keep_the_first(self):
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/a.mp4", "name": "a.mp4", "code": "ABC-123"},
            {"id": 2, "path": "gdrive:/夹/b.mp4", "name": "b.mp4", "code": "ABC-123"},
        ])
        plan = _plan(self.db_path, file_template="{number}")
        self.assertEqual(plan["counts"]["change"], 1)
        skipped = [row for row in plan["rows"] if row["action"] == "skip"]
        self.assertEqual(skipped[0]["reason"], organize.SKIP_TARGET_EXISTS)

    def test_scoped_plan_only_contains_requested_assets(self):
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/a.mp4", "name": "a.mp4", "code": "ABC-123"},
            {"id": 2, "path": "gdrive:/夹/b.mp4", "name": "b.mp4", "code": "DEF-456"},
        ])
        plan = _plan(self.db_path, file_template="{number}", asset_ids=[2])
        self.assertEqual(plan["counts"], {"total": 1, "unchanged": 0, "change": 1, "skip": 0})
        self.assertEqual([row["asset_id"] for row in plan["rows"]], [2])

    def test_a_source_that_is_not_connected_skips_every_row(self):
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/a.mp4", "name": "a.mp4", "code": "ABC-123"},
        ])
        plan = _plan(self.db_path, connected=False, file_template="{number}")
        self.assertEqual(plan["counts"]["skip"], 1)
        self.assertEqual(plan["reasons"], {organize.SKIP_NOT_CONNECTED: 1})

    def test_a_path_without_the_source_prefix_is_skipped(self):
        _seed(self.db_path, [
            {"id": 1, "path": "B:\\其它\\a.mp4", "name": "a.mp4", "code": "ABC-123"},
        ])
        plan = _plan(self.db_path, file_template="{number}")
        self.assertEqual(plan["rows"][0]["reason"], organize.SKIP_OUTSIDE_SCOPE)

    def test_plan_csv_carries_every_column(self):
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/a.mp4", "name": "a.mp4", "code": "ABC-123"},
        ])
        plan = _plan(self.db_path, file_template="{number}")
        path = organize.write_plan(self.holder / "plan.csv", plan["rows"])
        header = path.read_text(encoding="utf-8-sig").splitlines()[0]
        self.assertEqual(header.split(","), organize.PLAN_FIELDS)


class ApplyTests(unittest.TestCase):
    """执行与回滚都只动网盘那棵树与账本：假 provider 记下每一次改名。"""

    def setUp(self):
        self.holder = Path(tempfile.mkdtemp(prefix="peach-organize-apply-")).resolve()
        self.addCleanup(lambda: __import__("shutil").rmtree(self.holder, ignore_errors=True))
        self.db_path = fresh_ledger(self.holder)
        self.provider = FakeProvider(_entries(
            folders=(("OLD", "旧", "ROOT"),),
            files=(("FILE1", "1.mp4", "OLD"), ("FILE2", "2.mp4", "OLD"))))
        self.drive = FakeDrive(self.provider)
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/旧/1.mp4", "name": "1.mp4",
             "code": "ABC-001", "remote_id": "FILE1"},
            {"id": 2, "path": "gdrive:/夹/旧/2.mp4", "name": "2.mp4",
             "code": "ABC-002", "remote_id": "FILE2"},
        ])

    def _plan(self, **kwargs):
        return _plan(self.db_path, **kwargs)

    def _ledger_path(self, asset_id: int) -> str:
        with closing(sqlite3.connect(self.db_path)) as connection:
            return connection.execute("SELECT path FROM asset WHERE id=?", (asset_id,)).fetchone()[0]

    def _apply(self, plan, **kwargs):
        with closing(sqlite3.connect(self.db_path)) as connection:
            result = organize.apply_plan(self.drive, connection, plan["rows"],
                                        generated_root=self.holder, **kwargs)
        return result

    def test_apply_renames_on_the_drive_and_updates_the_ledger(self):
        plan = self._plan(file_template="{number}")
        result = self._apply(plan)
        self.assertEqual((result["moved"], result["failed"]), (2, 0))
        self.assertEqual(self.provider.moves,
                         [("FILE1", "OLD", "ABC-001.mp4"), ("FILE2", "OLD", "ABC-002.mp4")])
        self.assertEqual(self._ledger_path(1), "gdrive:/夹/旧/ABC-001.mp4")
        journal = json.loads(Path(result["log_path"]).read_text(encoding="utf-8"))
        self.assertEqual([entry["asset_id"] for entry in journal["entries"]], [1, 2])
        self.assertEqual(len(list(organize.batch_log_dir(self.holder).glob("*.json"))), 1)

    def test_an_interrupted_batch_resumes_without_renaming_twice(self):
        plan = self._plan(file_template="{number}")

        def stop(**_fields):
            if len(self.provider.moves) == 1:
                raise InterruptedError("模拟整理中断")
        with self.assertRaises(InterruptedError):
            self._apply(plan, stamp="resume", progress=stop)
        self.assertEqual(len(self.provider.moves), 1)
        result = self._apply(plan, stamp="resume")
        self.assertEqual((result["moved"], result["failed"]), (2, 0))
        self.assertEqual(len(self.provider.moves), 2)
        self.assertEqual(self._ledger_path(1), "gdrive:/夹/旧/ABC-001.mp4")

    def test_rollback_puts_every_name_back(self):
        plan = self._plan(file_template="{number}")
        applied = self._apply(plan)
        with closing(sqlite3.connect(self.db_path)) as connection:
            result = organize.rollback_batch(self.drive, connection, applied["log_path"])
        self.assertEqual((result["restored"], result["failed"]), (2, 0))
        self.assertEqual(self._ledger_path(1), "gdrive:/夹/旧/1.mp4")
        self.assertEqual(self._ledger_path(2), "gdrive:/夹/旧/2.mp4")
        self.assertFalse(Path(applied["log_path"]).exists())

    def test_a_disposed_asset_in_a_saved_plan_is_left_alone(self):
        plan = self._plan(file_template="{number}")
        with closing(sqlite3.connect(self.db_path)) as connection:
            connection.execute("UPDATE asset SET disposal='trash' WHERE id=1")
            connection.commit()
        result = self._apply(plan)
        self.assertEqual((result["moved"], result["failed"]), (1, 1))
        self.assertEqual(result["failures"][0]["reason"], "资产已不在馆藏，未执行整理")
        self.assertEqual(self._ledger_path(1), "gdrive:/夹/旧/1.mp4")

    def test_a_target_folder_missing_from_the_drive_is_reported(self):
        with closing(sqlite3.connect(self.db_path)) as connection:
            connection.execute("UPDATE asset SET studio='厂牌'")
            connection.commit()
        plan = self._plan(file_template="{number}", dir_template="{studio}")
        self.assertEqual(plan["rows"][0]["action"], "move")
        result = self._apply(plan)
        self.assertEqual(result["failed"], 2)
        self.assertEqual(result["failures"][0]["reason"], organize.SKIP_TARGET_FOLDER)
        self.assertEqual(self.provider.moves, [])

    def test_a_name_taken_on_the_drive_by_another_file_is_refused(self):
        self.provider.entries["FILE3"] = DriveEntry(
            remote_id="FILE3", name="ABC-001.mp4", parent_id="OLD", folder=False)
        plan = self._plan(file_template="{number}")
        result = self._apply(plan)
        reasons = {failure["asset_id"]: failure["reason"] for failure in result["failures"]}
        self.assertEqual(reasons, {1: organize.SKIP_TARGET_EXISTS})
        self.assertEqual(self._ledger_path(1), "gdrive:/夹/旧/1.mp4")
        self.assertEqual(self._ledger_path(2), "gdrive:/夹/旧/ABC-002.mp4")

    def test_an_asset_without_a_remote_id_is_reported(self):
        with closing(sqlite3.connect(self.db_path)) as connection:
            connection.execute("UPDATE asset SET remote_id=NULL WHERE id=1")
            connection.commit()
        result = self._apply(self._plan(file_template="{number}"))
        reasons = {failure["asset_id"]: failure["reason"] for failure in result["failures"]}
        self.assertEqual(reasons[1], organize.SKIP_NO_REMOTE_ID)

    def test_a_failed_ledger_write_puts_the_name_back(self):
        plan = self._plan(file_template="{number}")
        with mock.patch.object(organize, "_update_row", return_value=0):
            result = self._apply(plan)
        self.assertEqual(result["failed"], 2)
        self.assertIn("数据库写入失败，已改回原名", result["failures"][0]["reason"])
        self.assertEqual([move[2] for move in self.provider.moves],
                         ["ABC-001.mp4", "1.mp4", "ABC-002.mp4", "2.mp4"])


class EndpointTests(unittest.TestCase):
    """整理端点：预览只读、执行要确认、模板跟着账本走。"""

    def setUp(self):
        from peach.web_state import WebContract

        self.holder = Path(tempfile.mkdtemp(prefix="peach-organize-web-")).resolve()
        self.addCleanup(lambda: __import__("shutil").rmtree(self.holder, ignore_errors=True))
        self.db_path = fresh_ledger(self.holder)
        _seed(self.db_path, [
            {"id": 1, "path": "gdrive:/夹/旧/abc123.mp4", "name": "abc123.mp4",
             "code": "ABC-123", "title": "标题", "remote_id": "FILE1"},
        ])
        self.provider = FakeProvider(_entries(
            folders=(("OLD", "旧", "ROOT"),), files=(("FILE1", "abc123.mp4", "OLD"),)))
        self.contract = WebContract(self.db_path, candidate_root=self.holder)
        self.contract.drive = FakeDrive(self.provider)

    def test_preview_writes_a_plan_and_counts_changes(self):
        from peach.web_organize import w_organize_preview

        result = w_organize_preview(self.contract, {
            "location": SOURCE, "file_template": "{number}[ {title}]"})
        self.assertEqual(result["counts"]["change"], 1)
        self.assertEqual(result["rows"][0]["target_path"], "gdrive:/夹/旧/ABC-123 标题.mp4")
        self.assertTrue(Path(result["plan_csv"]).is_file())

    def test_write_reports_existing_foreign_keys_and_rejects_new_violations(self):
        from peach.web_organize import _run_write
        with closing(sqlite3.connect(self.db_path)) as connection:
            connection.execute("INSERT INTO media_binding(asset_id,backend,external_id) VALUES(99999,'test','old')")
            connection.commit()
        self.assertEqual(_run_write(self.contract, 'test', lambda _: {})['existing_foreign_keys'], 1)

        def introduce(connection):
            connection.execute("INSERT INTO media_binding(asset_id,backend,external_id) VALUES(99998,'test','new')")
            connection.commit()
            return {}
        with self.assertRaisesRegex(RuntimeError, 'new_foreign_keys=1'):
            _run_write(self.contract, 'test-new', introduce)

    def test_apply_without_confirmation_is_refused(self):
        from peach.web_organize import w_organize_apply

        with self.assertRaises(ValueError):
            w_organize_apply(self.contract, {"location": SOURCE, "file_template": "{number}"})

    def test_preview_and_apply_share_validated_scope_and_recovery_parameters(self):
        from peach.web_organize import w_organize_apply, w_organize_preview

        request = {'location': SOURCE, 'path': 'gdrive:/夹/旧', 'file_template': '{number}',
                   'dir_template': ''}
        plan = w_organize_preview(self.contract, request)
        self.assertEqual(plan['path'], request['path'])
        self.assertEqual(plan['counts']['total'], 1)
        with mock.patch.object(self.contract.organize_job, 'start',
                               return_value={'status': 'running'}) as start:
            w_organize_apply(self.contract, {**request, 'confirm': True})
        self.assertEqual(start.call_args.kwargs['recovery']['path'], request['path'])
        self.assertEqual(start.call_args.kwargs['initial']['path'], request['path'])
        for body in ({**request, 'path': 'onedrive:/别处'}, {**request, 'path': ['gdrive:/夹']}):
            with self.subTest(body=body), self.assertRaisesRegex(organize.OrganizeError, '路径'):
                w_organize_preview(self.contract, body)
            with self.subTest(body=body), self.assertRaisesRegex(organize.OrganizeError, '路径'):
                w_organize_apply(self.contract, {**body, 'confirm': True})

    def test_apply_on_a_source_that_is_not_connected_is_refused(self):
        from peach.web_organize import w_organize_apply

        self.contract.drive = FakeDrive(self.provider)
        self.contract.drive.connection = lambda location: {"connected": False}
        with self.assertRaisesRegex(ValueError, "还没有授权"):
            w_organize_apply(self.contract, {"location": SOURCE, "confirm": True,
                                             "file_template": "{number}"})

    def test_apply_without_a_drive_is_refused(self):
        from peach.web_organize import w_organize_apply

        del self.contract.drive
        with self.assertRaisesRegex(ValueError, "还没有接入网盘"):
            w_organize_apply(self.contract, {"location": SOURCE, "confirm": True,
                                             "file_template": "{number}"})

    def test_rollback_without_a_batch_is_refused(self):
        from peach.web_organize import w_organize_rollback

        with self.assertRaises(ValueError):
            w_organize_rollback(self.contract, {"confirm": True})

    def test_templates_round_trip_through_the_ledger(self):
        from peach.web_settings import organize_templates, w_settings

        w_settings(self.contract, {"organizeTemplates": {
            "gdrive": {"file": "{number}[ {title}]", "dir": "{studio}"}}})
        self.assertEqual(organize_templates(self.contract),
                         {"gdrive": {"file": "{number}[ {title}]", "dir": "{studio}"}})

    def test_escaping_template_is_refused_on_save(self):
        from peach.web_settings import w_settings

        with self.assertRaises(TemplateError):
            w_settings(self.contract, {"organizeTemplates": {
                "gdrive": {"file": "{number}", "dir": "../{studio}"}}})

    def test_status_lists_connected_sources_placeholders_and_presets(self):
        from peach.web_organize import q_organize

        payload = q_organize(self.contract)
        self.assertEqual(payload["status"], "idle")
        self.assertTrue(payload["presets"])
        self.assertEqual([item["location"] for item in payload["locations"]], [SOURCE])
        self.assertEqual(payload["locations"][0]["roots"], ["夹"])
        self.assertIn("code", [item["key"] for item in payload["placeholders"]])
        self.assertNotIn("number", [item["key"] for item in payload["placeholders"]])

    def test_custom_template_example_uses_the_registered_read_route(self):
        from peach.web_router import dispatch_api_get

        output = dispatch_api_get(None, "/api/organize/example", {
            "file_template": "自定义_{code}[_{definition}]", "dir_template": "{year}/{studio}"})
        self.assertEqual(output, {"ok": True, "example": "2024/厂牌/自定义_ABC-123_1080p.mp4"})
        invalid = dispatch_api_get(None, "/api/organize/example", {"file_template": "{code"})
        self.assertFalse(invalid["ok"])
        self.assertEqual(invalid["field"], "file")
        self.assertIn("没有配对", invalid["error"])


if __name__ == "__main__":
    unittest.main()
