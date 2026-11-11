"""`peach` 顶层 CLI 的可达性与只读保证。

这里管 `init`/`serve`/`process`/`token`/`migrate`/`status`/`check-sources` 这一层，
以及打包后的 EXE 到底能不能调到它们——判据见 `scripts/build_app_entry.py`。
"""
from __future__ import annotations

import argparse
import importlib.util
import io
import os
import sqlite3
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock

from peach import cli, settings_file
from peach.migrations import plan
from support.ledger import fresh_ledger

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "migrations"


def load_script(name: str):
    path = ROOT / "scripts" / f"{name}.py"
    spec = importlib.util.spec_from_file_location(f"test_{name}", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class MigrateCommandTests(unittest.TestCase):
    """`peach migrate` 只读看状态，加 `upgrade` 才动账本。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.database = self.root / "ledger.db"
        sqlite3.connect(self.database).close()

    def _run(self, action):
        arguments = argparse.Namespace(db=self.database, action=action, yes=True)
        with mock.patch.object(cli, "SETTINGS_ERROR", None), \
                redirect_stdout(io.StringIO()) as output:
            code = cli._migrate(arguments)
        return code, output.getvalue()

    def test_status_never_writes_the_ledger_or_its_directory(self):
        before = self.database.read_bytes()
        code, output = self._run("status")
        self.assertEqual(code, 0)
        self.assertIn("pending:", output)
        self.assertEqual(self.database.read_bytes(), before)
        self.assertEqual(sorted(path.name for path in self.root.iterdir()),
                         [self.database.name])

    def test_upgrade_applies_every_pending_migration(self):
        self.assertTrue(plan(self.database, MIGRATIONS)[1])
        code, output = self._run("upgrade")
        self.assertEqual(code, 0)
        self.assertIn("applied:", output)
        self.assertEqual(plan(self.database, MIGRATIONS)[1], [])


class StatusCommandTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.db = fresh_ledger(self.root)
        connection = sqlite3.connect(self.db)
        connection.executemany(
            "INSERT INTO asset(location,path,name,medium,size,duration,snapshot_path,"
            "creator,ctx_length) VALUES(?,?,?,?,?,?,?,?,?)",
            [
                ("gdrive", "1a.mp4", "a.mp4", "video", 2 << 30, 1800.0,
                 "1a.jpg", "Someone", "中"),
                ("onedrive", "1b.mp4", "b.mp4", "video", 1 << 30, None, None,
                 None, None),
                ("online", "https://example.test/x", "x", "account", None, None, None,
                 "Handle", None),
            ])
        connection.commit()
        connection.close()

    def _run(self, argv):
        output = io.StringIO()
        with mock.patch.object(cli, "SETTINGS_ERROR", None), redirect_stdout(output):
            code = cli.main(argv)
        return code, output.getvalue()

    def test_status_reports_the_ledger_and_the_migration_state(self):
        code, output = self._run(["status", "--db", str(self.db)])
        self.assertEqual(code, 0)
        self.assertIn("合计", output)
        self.assertIn("加工进度（本机视频 2 条）", output)
        # 在线资产不进「加工进度」的分母，否则百分比永远到不了 100。
        self.assertIn("有时长 (ffprobe)", output)
        self.assertIn("1 / 2", output)
        self.assertIn("待应用 0 个", output)

    def test_status_never_writes_the_ledger(self):
        before = self.db.stat().st_mtime_ns, self.db.stat().st_size
        code, _ = self._run(["status", "--db", str(self.db)])
        self.assertEqual(code, 0)
        self.assertEqual((self.db.stat().st_mtime_ns, self.db.stat().st_size), before)

    def test_missing_ledger_is_reported_rather_than_created(self):
        missing = self.root / "nope.db"
        code, output = self._run(["status", "--db", str(missing)])
        self.assertEqual(code, 4)
        self.assertIn("数据库不存在", output)
        self.assertFalse(missing.exists())


class InitCommandTests(unittest.TestCase):
    """`peach init`：一台全新部署从零到能跑的唯一入口。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve() / "peach-data"

    def _run(self, argv):
        output = io.StringIO()
        with mock.patch.object(cli, "SETTINGS_ERROR", None), redirect_stdout(output):
            code = cli.main(argv)
        return code, output.getvalue()

    def _init(self, *extra):
        return self._run(["init", "--no-input", "--data-root", str(self.root), *extra])

    def _loaded(self):
        return settings_file.load_config(environ={"PEACH_DATA_ROOT": str(self.root)})

    def test_fresh_init_builds_a_runnable_data_root(self):
        code, output = self._init()
        self.assertEqual(code, 0)
        for key in settings_file.DIRECTORY_KEYS:
            self.assertTrue((self.root / key).is_dir(), key)
        database = self.root / "database" / "ledger.db"
        self.assertTrue(database.is_file())
        # 建完就必须是最新 schema，否则第一次 serve 就撞上待应用迁移。
        self.assertEqual(plan(database, MIGRATIONS)[1], [])
        self.assertIn("下一步", output)
        self.assertIn("/oauth/gdrive/callback", output)

    def test_the_listen_address_and_the_callback_base_are_written(self):
        self._init("--host", "0.0.0.0", "--port", "9443",
                   "--public-url", "https://peach.example.com")
        loaded = self._loaded()
        self.assertTrue(loaded.present)
        self.assertTrue(loaded.configured)
        self.assertEqual((loaded.server.host, loaded.server.port), ("0.0.0.0", 9443))
        self.assertEqual(loaded.drive_public_url, "https://peach.example.com")
        # 问答与非交互都不碰网盘凭据：那些只能在网页上授权之后才有。
        self.assertEqual((loaded.drive_clients, loaded.drive_roots), ({}, {}))

    def test_the_new_ledger_is_readable_by_status(self):
        self._init()
        code, output = self._run(
            ["status", "--db", str(self.root / "database" / "ledger.db")])
        self.assertEqual(code, 0)
        self.assertIn("待应用 0 个", output)

    def test_existing_settings_file_is_not_overwritten_without_force(self):
        self._init()
        stamp = (self.root / "config.toml").read_text(encoding="utf-8")
        code, output = self._init("--port", "9443")
        self.assertEqual(code, 3)
        self.assertIn("已存在", output)
        self.assertEqual((self.root / "config.toml").read_text(encoding="utf-8"), stamp)
        self.assertEqual(self._init("--port", "9443", "--force")[0], 0)
        self.assertNotEqual(
            (self.root / "config.toml").read_text(encoding="utf-8"), stamp)

    def test_an_existing_ledger_is_never_rebuilt_by_a_fresh_init(self):
        database = self.root / "database" / "ledger.db"
        database.parent.mkdir(parents=True)
        database.write_bytes(b"not really a database")
        code, output = self._init()
        self.assertEqual(code, 0)
        self.assertEqual(database.read_bytes(), b"not really a database")
        self.assertIn("跳过建库", output)

    def test_an_unreadable_settings_file_is_named_before_it_is_replaced(self):
        """`--force` 是坏文件的唯一自救入口，但它等于把旧文件整份丢掉，得先说出来。"""
        self.root.mkdir(parents=True)
        (self.root / "config.toml").write_text(
            "[media]\nR = '/Volumes/Media'\n", encoding="utf-8")
        code, output = self._init("--force")
        self.assertEqual(code, 0)
        self.assertIn("没有", output)
        self.assertIn("继承", output)


class InteractiveInitTests(unittest.TestCase):
    """`peach init` 不带参数、stdin 是终端时的问答流。答案一律脚本化。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.data_root = self.root / "peach-data"
        # 第一题的默认值要落在临时目录里，回车接受默认才不会碰真实 Peach 数据目录。
        env = mock.patch.dict(os.environ, {"PEACH_DATA_ROOT": str(self.data_root)})
        env.start()
        self.addCleanup(env.stop)

    def _run(self, answers):
        queue = list(answers)
        prompts: list[str] = []

        def ask(prompt: str, default: str) -> str:
            prompts.append(prompt)
            return queue.pop(0)

        output = io.StringIO()
        with redirect_stdout(output):
            code = cli._init_interactive(ask)
        return code, output.getvalue(), prompts

    def _loaded(self):
        return settings_file.load_config(environ={"PEACH_DATA_ROOT": str(self.data_root)})

    def test_every_default_can_be_accepted_with_a_bare_enter(self):
        code, output, prompts = self._run(["", "", "", ""])
        self.assertEqual(code, 0)
        self.assertEqual(len(prompts), 4)
        loaded = self._loaded()
        self.assertTrue(loaded.present)
        self.assertEqual((loaded.server.host, loaded.server.port, loaded.drive_public_url),
                         ("0.0.0.0", 8900, ""))
        for key in settings_file.DIRECTORY_KEYS:
            self.assertTrue((self.data_root / key).is_dir(), key)
        self.assertIn("下一步", output)

    def test_the_callback_base_is_trimmed_and_written(self):
        code, _, _ = self._run(["", "1", "9443", "https://peach.example.com/"])
        self.assertEqual(code, 0)
        loaded = self._loaded()
        self.assertEqual(loaded.drive_public_url, "https://peach.example.com")
        self.assertEqual((loaded.server.host, loaded.server.port), ("127.0.0.1", 9443))

    def test_a_plain_http_callback_base_is_asked_again(self):
        code, output, prompts = self._run(
            ["", "", "", "http://peach.example.com", "https://peach.example.com"])
        self.assertEqual(code, 0)
        self.assertEqual(
            prompts.count("网盘授权的回调基址（例如 https://peach.example.com，回车先跳过）"), 2)
        self.assertIn("https://", output)
        self.assertEqual(self._loaded().drive_public_url, "https://peach.example.com")

    def test_three_bad_answers_abort_before_anything_is_written(self):
        afile = self.root / "afile"
        afile.write_text("x", encoding="utf-8")
        with self.assertRaises(SystemExit) as caught:
            self._run([str(afile), str(afile), str(afile)])
        self.assertIn("3 次", str(caught.exception))
        self.assertIn("没有写任何文件", str(caught.exception))
        self.assertFalse(self.data_root.exists())

    def test_an_existing_settings_file_stops_the_interview_at_the_first_answer(self):
        self.data_root.mkdir()
        (self.data_root / "config.toml").write_text("[server]\nport = 9100\n", encoding="utf-8")
        code, output, prompts = self._run([""])
        self.assertEqual(code, 3)
        self.assertEqual(len(prompts), 1, "设置文件已存在就不该把剩下的题问完")
        self.assertIn("已存在", output)
        self.assertEqual((self.data_root / "config.toml").read_text(encoding="utf-8"),
                         "[server]\nport = 9100\n")


class InitDispatchTests(unittest.TestCase):
    """问答只在「不带任何参数且 stdin 是终端」时进入；其余一律走非交互路径。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve() / "peach-data"
        patcher = mock.patch.object(cli, "_init_interactive", return_value=0)
        self.interactive = patcher.start()
        self.addCleanup(patcher.stop)

    def _run(self, argv, *, tty):
        with mock.patch.object(cli.onboarding, "is_interactive", return_value=tty), \
                redirect_stdout(io.StringIO()):
            return cli.main(argv)

    def test_bare_init_on_a_terminal_enters_the_interview(self):
        self.assertEqual(self._run(["init"], tty=True), 0)
        self.interactive.assert_called_once_with()

    def test_bare_init_without_a_terminal_stays_non_interactive(self):
        with mock.patch.dict(os.environ, {"PEACH_DATA_ROOT": str(self.root)}):
            self.assertEqual(self._run(["init"], tty=False), 0)
        self.interactive.assert_not_called()
        self.assertTrue((self.root / "config.toml").is_file())

    def test_any_argument_or_no_input_stays_non_interactive(self):
        self.assertEqual(self._run(["init", "--data-root", str(self.root)], tty=True), 0)
        self.assertEqual(
            self._run(["init", "--data-root", str(self.root), "--no-input", "--force"], tty=True), 0)
        self.interactive.assert_not_called()
        loaded = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(self.root)})
        self.assertTrue(loaded.present)
        self.assertEqual(loaded.drive_public_url, "")


class ProcessCommandTests(unittest.TestCase):
    """`peach process` 和网页那一轮同一个处理函数，结算也要一样：声明的后继进任务中心。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.db = fresh_ledger(self.tmp.name)
        config = settings_file.load_config(environ={}, strict=False)
        for target in (mock.patch.object(settings_file, "active", lambda: config),
                       mock.patch.object(cli, "SETTINGS_ERROR", None)):
            target.start()
            self.addCleanup(target.stop)

    def _run(self, result):
        output = io.StringIO()
        with mock.patch("peach.library_processing.process_library", return_value=result), \
                redirect_stdout(output):
            code = cli.main(["process", "--db", str(self.db)])
        connection = sqlite3.connect(self.db)
        try:
            rows = connection.execute(
                "SELECT id,task_key,trigger,status,parent_run_id,followup_key FROM task_run "
                "ORDER BY id").fetchall()
        finally:
            connection.close()
        return code, output.getvalue(), rows

    def test_the_followups_a_run_declares_are_queued_under_it(self):
        declared = [{"key": "performer-alias:9378", "task_key": "performer-alias",
                     "label": "补女优别名：白川麻衣"}]
        code, output, rows = self._run({"status": "complete", "followups": declared})
        self.assertEqual(code, 0)
        parent, child = rows
        self.assertEqual(parent[1:4], ("library-processing", "cli", "succeeded"))
        self.assertEqual(child[1:], ("performer-alias", "cli", "pending", parent[0],
                                     "performer-alias:9378"))
        self.assertIn("入队 1 条", output)

    def test_an_unfinished_run_is_recorded_as_failed_and_still_queues_its_followups(self):
        declared = [{"key": "performer-alias:1", "task_key": "performer-alias", "label": ""}]
        code, _, rows = self._run({"status": "failed", "error": "网盘离线",
                                   "followups": declared})
        self.assertEqual(code, 1)
        self.assertEqual(rows[0][3], "failed")
        self.assertEqual(rows[1][3], "pending")

    def test_user_cancel_returns_a_cancelled_receipt_without_dispatching_followups(self):
        from contextlib import closing

        from peach.jobs import JobCancelled
        with mock.patch('peach.library_processing.process_library',
                        side_effect=JobCancelled('用户停止任务')), \
                redirect_stdout(io.StringIO()) as output:
            code = cli.main(['process', '--db', str(self.db)])
        with closing(sqlite3.connect(self.db)) as connection:
            rows = connection.execute('SELECT status,parent_run_id FROM task_run').fetchall()
        self.assertEqual(code, 130)
        self.assertEqual(rows, [('cancelled', None)])
        self.assertIn('已保存结果保留', output.getvalue())

    def test_progress_lines_show_files_found_while_scanning_and_skip_repeats(self):
        def process(*_args, report, **_kwargs):
            scanning = {"stage": "扫描文件", "checked": 0, "total": 0, "current_action": "scanning_files"}
            report({**scanning, "scanned": 0})
            report({**scanning, "scanned": 8096})
            report({**scanning, "scanned": 8096})
            report({"stage": "读取时长与分辨率", "checked": 12, "total": 40, "scanned": 8096})
            report({"stage": "整理结果", "checked": 0, "total": 0, "scanned": 8096})
            return {"status": "complete", "followups": []}
        with mock.patch("peach.library_processing.process_library", side_effect=process), \
                redirect_stdout(io.StringIO()) as output:
            code = cli.main(["process", "--db", str(self.db)])
        self.assertEqual(code, 0)
        self.assertEqual(output.getvalue().splitlines(), [
            "扫描文件：已发现 0 个文件", "扫描文件：已发现 8,096 个文件",
            "读取时长与分辨率：12/40", "整理结果"])


class BrokenSettingsTests(unittest.TestCase):
    """设置文件读不出来时，命令必须响亮地失败，而不是拿默认值跑出个假状态。"""

    def test_commands_refuse_to_run_and_name_the_file(self):
        broken = settings_file.SettingsFileError(
            "设置文件读不出来：/tmp/peach-data/config.toml：TOML 语法错误")
        with mock.patch.object(cli, "SETTINGS_ERROR", broken):
            with self.assertRaises(SystemExit) as caught:
                cli.main(["status", "--db", "/tmp/nope.db"])
        message = str(caught.exception)
        self.assertIn("config.toml", message)
        self.assertIn("peach init --force", message)


class SourceChecksCliTests(unittest.TestCase):
    def test_source_check_selection_json_and_failed_exit_status(self):
        result = {'ok': False, 'sources': [], 'elapsed_s': 0}
        with mock.patch('peach.source_preflight.check_sources', return_value=result) as check, \
                mock.patch('peach.cli.settings_file.active') as active, \
                redirect_stdout(io.StringIO()) as output:
            self.assertEqual(
                cli.main(['check-sources', '--source', 'dmm', '--source', 'javdb', '--json']), 1)
        check.assert_called_once_with(active.return_value.directory.return_value,
                                      ['dmm', 'javdb'])
        self.assertEqual(__import__('json').loads(output.getvalue()), result)


if __name__ == "__main__":
    unittest.main()
