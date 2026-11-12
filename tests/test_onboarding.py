"""`peach.onboarding`：首次运行问答的题目、校验与落盘，纯逻辑、可注入。

CLI 与设置页共用这一层，所以这里只用脚本化答案驱动，不碰 stdin。首次设置只问四件事：
数据目录、谁可以访问、端口、网盘授权的回调基址。媒体来源与网盘根目录在设置完成之后
到设置页里接（ADR-0157），首启也不请求扫描：没有根目录就没有可扫的东西。
"""
from __future__ import annotations

import importlib.util
import io
import os
import sqlite3
import tempfile
import unittest
from contextlib import contextmanager
from dataclasses import replace
from pathlib import Path
from unittest import mock

from peach import onboarding, settings_file
from peach.web_entry import runtime_fact_entries

HAS_HTTP_DEPS = all(importlib.util.find_spec(name) for name in ("fastapi", "httpx"))


def scripted(*answers: str):
    """按顺序吐答案，并把每一题的题目与默认值记下来。"""
    queue = list(answers)
    seen: list[tuple[str, str]] = []

    def ask(prompt: str, default: str) -> str:
        seen.append((prompt, default))
        return queue.pop(0)

    ask.seen = seen  # type: ignore[attr-defined]
    return ask


class _Case(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.data_root = self.root / "peach-data"
        self.config = settings_file.load_config(
            project_root=self.root / "app", environ={"PEACH_DATA_ROOT": str(self.data_root)})

    def _answers(self, **overrides) -> onboarding.Answers:
        values: dict = dict(data_root=self.data_root, host=onboarding.LOOPBACK_HOST, port=8900)
        values.update(overrides)
        return onboarding.Answers(**values)


class QuestionTests(_Case):
    def test_the_first_run_asks_four_things_in_a_fixed_order(self):
        questions = onboarding.questions(self.config)
        self.assertEqual([question.key for question in questions],
                         ["data_root", "host", "port", "drive_public_url"])
        self.assertEqual([question.default for question in questions],
                         [str(self.data_root), "2", "8900", ""])
        self.assertEqual([question.prompt for question in questions], [
            "数据目录（Peach 数据库、缓存和设置文件都放在这里）",
            "谁可以访问：1 = 只有这台机器，2 = 对外提供（0.0.0.0）",
            "端口",
            "网盘授权的回调基址（例如 https://peach.example.com，回车先跳过）",
        ])


class ValidatorTests(_Case):
    def test_host_accepts_the_two_choices_in_their_spellings(self):
        for raw in ("1", "本机", "127.0.0.1"):
            self.assertEqual(onboarding.validate_host(raw), onboarding.LOOPBACK_HOST)
        for raw in ("2", "对外", "0.0.0.0"):
            self.assertEqual(onboarding.validate_host(raw), onboarding.PUBLIC_HOST)
        for raw in ("", "3", "局域网"):
            with self.assertRaises(ValueError) as raised:
                onboarding.validate_host(raw)
            self.assertEqual(str(raised.exception), "填 1（只有这台机器）或 2（对外提供）")

    def test_port_is_an_integer_between_one_and_65535(self):
        self.assertEqual(onboarding.validate_port("8900"), 8900)
        self.assertEqual(onboarding.validate_port(" 1 "), 1)
        self.assertEqual(onboarding.validate_port("65535"), 65535)
        for raw in ("", "0", "65536", "http", "89 00", "-1"):
            with self.assertRaises(ValueError) as raised:
                onboarding.validate_port(raw)
            self.assertEqual(str(raised.exception), "端口要是 1 到 65535 之间的整数")

    def test_yes_no_defaults_to_yes(self):
        for raw in ("", "y", "yes", "是", " Y "):
            self.assertTrue(onboarding.validate_yes_no(raw))
        for raw in ("n", "no", "否", " N "):
            self.assertFalse(onboarding.validate_yes_no(raw))
        with self.assertRaises(ValueError) as raised:
            onboarding.validate_yes_no("maybe")
        self.assertEqual(str(raised.exception), "填 y 或 n")

    def test_the_data_root_may_not_exist_yet_but_may_not_be_a_file(self):
        self.assertEqual(onboarding.validate_data_root(str(self.data_root)), self.data_root)
        self.assertEqual(onboarding.validate_data_root(f"  {self.data_root}  "), self.data_root)
        file = self.root / "not-a-dir"
        file.write_text("x", encoding="utf-8")
        with self.assertRaises(ValueError) as raised:
            onboarding.validate_data_root(str(file))
        self.assertEqual(str(raised.exception), f"{file} 是一个文件，Peach 数据目录要是目录")
        with self.assertRaises(ValueError) as raised:
            onboarding.validate_data_root("   ")
        self.assertEqual(str(raised.exception), "Peach 数据目录不能为空")

    def test_the_drive_callback_base_url_must_be_https_or_empty(self):
        self.assertEqual(onboarding.validate_public_url(""), "")
        self.assertEqual(onboarding.validate_public_url("   "), "")
        self.assertEqual(onboarding.validate_public_url("  https://peach.example.com/  "),
                         "https://peach.example.com")
        https_only = "填 https:// 开头的地址，例如 https://peach.example.com"
        needs_host = "地址里要有主机名，例如 https://peach.example.com"
        for raw, message in (("http://peach.example.com", https_only),
                             ("peach.example.com", https_only),
                             ("https:// peach.example.com", needs_host),
                             ("https:///media", needs_host)):
            with self.assertRaises(ValueError) as raised:
                onboarding.validate_public_url(raw)
            self.assertEqual(str(raised.exception), message)


class AskUntilValidTests(_Case):
    def setUp(self):
        super().setUp()
        self.question = onboarding.Question("port", "端口", "8900", onboarding.validate_port)

    def test_an_empty_answer_takes_the_default(self):
        self.assertEqual(
            onboarding.ask_until_valid(self.question, scripted(""), report=self.fail), 8900)

    def test_a_bad_answer_is_reported_with_the_remaining_attempts(self):
        reported: list[str] = []
        self.assertEqual(
            onboarding.ask_until_valid(self.question, scripted("不是端口", "8900"),
                                       report=reported.append),
            8900)
        self.assertEqual(reported, ["  端口要是 1 到 65535 之间的整数（还可以再试 2 次）"])

    def test_three_bad_answers_abort_with_the_question_in_the_message(self):
        reported: list[str] = []
        with self.assertRaises(onboarding.OnboardingAborted) as raised:
            onboarding.ask_until_valid(self.question, scripted("x", "y", "z"),
                                       report=reported.append)
        self.assertEqual(str(raised.exception), "「端口」连续 3 次没有拿到有效值。")
        self.assertEqual(reported, [
            "  端口要是 1 到 65535 之间的整数（还可以再试 2 次）",
            "  端口要是 1 到 65535 之间的整数（还可以再试 1 次）",
            "  端口要是 1 到 65535 之间的整数",
        ])


class ConfigureTests(_Case):
    def test_only_the_asked_settings_change(self):
        prepared = onboarding.configure(self.config, self._answers(
            host=onboarding.PUBLIC_HOST, port=9443, drive_public_url="https://peach.example.com"))
        self.assertTrue(prepared.present)
        self.assertEqual((prepared.server.host, prepared.server.port), ("0.0.0.0", 9443))
        self.assertEqual(prepared.drive_public_url, "https://peach.example.com")
        self.assertEqual(prepared.data_root, self.data_root)

    def test_every_directory_key_is_written_out_explicitly(self):
        prepared = onboarding.configure(self.config, self._answers())
        self.assertEqual(set(prepared.directories), set(settings_file.DIRECTORY_KEYS))
        for key in settings_file.DIRECTORY_KEYS:
            self.assertEqual(prepared.directory(key), self.data_root / key)

    def test_an_empty_public_url_keeps_the_one_already_configured(self):
        config = replace(self.config, drive_public_url="https://peach.example.com")
        self.assertEqual(onboarding.configure(config, self._answers()).drive_public_url,
                         "https://peach.example.com")
        self.assertEqual(onboarding.configure(config, self._answers(
            drive_public_url="https://other.example.com")).drive_public_url,
            "https://other.example.com")

    def test_the_written_file_reads_back(self):
        prepared = onboarding.configure(self.config, self._answers(
            host=onboarding.PUBLIC_HOST, port=9443, drive_public_url="https://peach.example.com"))
        settings_file.write(prepared)
        loaded = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(self.data_root)})
        self.assertTrue(loaded.present)
        self.assertEqual(loaded.data_root, self.data_root)
        self.assertEqual((loaded.server.host, loaded.server.port), ("0.0.0.0", 9443))
        self.assertEqual(loaded.drive_public_url, "https://peach.example.com")


class InterviewTests(_Case):
    def test_scripted_answers_walk_the_four_questions(self):
        ask = scripted("", "", "9443", "https://peach.example.com/")
        answers = onboarding.interview(self.config, ask, report=self.fail)
        self.assertEqual(answers, onboarding.Answers(
            data_root=self.data_root, host=onboarding.PUBLIC_HOST, port=9443,
            drive_public_url="https://peach.example.com"))
        questions = onboarding.questions(self.config)
        self.assertEqual(ask.seen, [(question.prompt, question.default) for question in questions])

    def test_console_ask_shows_the_default_or_marks_the_field_required(self):
        with mock.patch("builtins.input", return_value="x") as prompt:
            self.assertEqual(onboarding.console_ask("端口", "8900"), "x")
        prompt.assert_called_once_with("端口 [8900]: ")
        with mock.patch("builtins.input", return_value="") as prompt:
            self.assertEqual(onboarding.console_ask("网盘授权回调基址", ""), "")
        prompt.assert_called_once_with("网盘授权回调基址（必填）: ")
        with mock.patch("builtins.input", side_effect=EOFError):
            with self.assertRaises(onboarding.OnboardingAborted) as raised:
                onboarding.console_ask("端口", "8900")
        self.assertEqual(str(raised.exception), "输入已结束。")

    def test_is_interactive_follows_the_tty_flag(self):
        class Tty(io.StringIO):
            def isatty(self) -> bool:
                return True

        self.assertFalse(onboarding.is_interactive(io.StringIO()))
        self.assertFalse(onboarding.is_interactive(None))
        self.assertTrue(onboarding.is_interactive(Tty()))


class ApplyTests(_Case):
    """`apply()` 是 `peach init` 与设置页共用的落盘入口：目录、账本、口令、设置文件。"""

    def test_apply_builds_the_whole_tree(self):
        applied = onboarding.apply(self.config, self._answers())
        self.assertEqual(applied.settings_path, self.data_root / settings_file.SETTINGS_FILENAME)
        for key in settings_file.DIRECTORY_KEYS:
            self.assertTrue((self.data_root / key).is_dir(), key)
        tree = applied.tree
        self.assertEqual(tree.data_root, self.data_root)
        self.assertEqual(tree.database, self.data_root / "database" / "ledger.db")
        self.assertFalse(tree.ledger_existed)
        self.assertGreater(tree.migrations, 0)
        self.assertTrue(tree.token_path.is_file())
        self.assertTrue(tree.token_created)
        with sqlite3.connect(tree.database) as connection:
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM asset").fetchone(), (0,))
        loaded = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(self.data_root)})
        self.assertTrue(loaded.present)
        self.assertEqual((loaded.server.host, loaded.server.port),
                         (onboarding.LOOPBACK_HOST, 8900))

    def test_an_existing_ledger_is_left_alone(self):
        first = onboarding.apply(self.config, self._answers())
        stamp = first.tree.database.stat().st_mtime_ns
        again = onboarding.create_data_tree(onboarding.configure(self.config, self._answers()))
        self.assertTrue(again.ledger_existed)
        self.assertEqual(again.migrations, 0)
        self.assertEqual(again.database, first.tree.database)
        self.assertEqual(again.database.stat().st_mtime_ns, stamp)
        self.assertEqual(again.token_path, first.tree.token_path)
        self.assertFalse(again.token_created)

    def test_an_empty_password_leaves_the_service_open(self):
        from peach import access
        onboarding.apply(self.config, self._answers())
        self.assertEqual(access.load(self.data_root / "secrets" / "access.json")["mode"], "open")

    def test_the_access_password_is_written_once_and_never_replaced(self):
        from peach import access
        first = onboarding.apply(self.config, self._answers(), access_password="correct-password")
        path = self.data_root / "secrets" / "access.json"
        policy = access.load(path)
        self.assertEqual(policy["mode"], "password")
        self.assertTrue(access.verify(policy, "correct-password"))
        before = path.read_bytes()
        onboarding.apply(first.config, self._answers(), access_password="other-password", force=True)
        self.assertEqual(path.read_bytes(), before)
        self.assertTrue(access.verify(access.load(path), "correct-password"))

    def test_writing_over_an_existing_settings_file_needs_force(self):
        onboarding.apply(self.config, self._answers(port=8901))
        existing, broken = onboarding.resolve_config(self.data_root)
        self.assertIsNone(broken)
        with self.assertRaises(settings_file.SettingsFileError):
            onboarding.apply(existing, self._answers(port=8902))
        loaded = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(self.data_root)})
        self.assertEqual(loaded.server.port, 8901)
        onboarding.apply(existing, self._answers(port=8902), force=True)
        loaded = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(self.data_root)})
        self.assertEqual(loaded.server.port, 8902)

    def test_the_first_scan_marker_is_consumed_exactly_once(self):
        config = onboarding.configure(self.config, self._answers())
        self.assertEqual(onboarding.scan_request_path(config),
                         self.data_root / "state" / onboarding.SCAN_REQUEST_NAME)
        onboarding.request_first_scan(config)
        self.assertEqual(onboarding.take_first_scan_request(config), "configured")
        self.assertIsNone(onboarding.take_first_scan_request(config))

    def test_resolve_config_follows_the_given_data_root(self):
        other = self.root / "elsewhere"
        config, broken = onboarding.resolve_config(other, environ={})
        self.assertIsNone(broken)
        self.assertEqual(config.data_root, other)
        self.assertFalse(config.present)

    def test_a_broken_settings_file_falls_back_and_hands_over_the_error(self):
        self.data_root.mkdir(parents=True, exist_ok=True)
        (self.data_root / settings_file.SETTINGS_FILENAME).write_text("not = [toml", encoding="utf-8")
        config, broken = onboarding.resolve_config(self.data_root, environ={})
        self.assertIsInstance(broken, settings_file.SettingsFileError)
        self.assertEqual(config.data_root, self.data_root)


class _SetupHttpCase(_Case):
    """首启服务的 HTTP 夹具：临时数据目录、没有口令的应用。"""

    QUESTIONS = "/api/setup/questions"
    SUBMIT = "/api/setup"
    RESTORE = "/api/setup/restore"

    def setUp(self):
        super().setUp()
        active = mock.patch.object(settings_file, "active", lambda: self.config)
        active.start()
        self.addCleanup(active.stop)

    def _client(self, *, configured: bool = False, client=("127.0.0.1", 12345),
                base_url="http://127.0.0.1:8900"):
        import httpx

        from peach.api import create_app
        from peach.config import PeachSettings

        app = create_app(PeachSettings(
            db_path=self.data_root / "database" / "ledger.db",
            configured=configured, token=""))
        return httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app, client=client), base_url=base_url)

    def _send(self, method, path, *, headers=None, json=None, **kwargs):
        import asyncio

        async def run():
            async with self._client(**kwargs) as client:
                return await client.request(method, path, headers=headers, json=json)

        return asyncio.run(run())

    def _get(self, path, **kwargs):
        return self._send("GET", path, **kwargs)

    def _loaded(self):
        return settings_file.load_config(environ={"PEACH_DATA_ROOT": str(self.data_root)})

    def _body(self, **overrides) -> dict:
        body = {"data_root": str(self.data_root), "host": "1", "port": "8900",
                "drive_public_url": ""}
        body.update(overrides)
        return {key: value for key, value in body.items() if value is not None}

    def _errors(self, **overrides) -> dict:
        response = self._send("POST", self.SUBMIT, json=self._body(**overrides))
        self.assertEqual(response.status_code, 400, response.text)
        data = response.json()
        self.assertEqual(data["error"], "有几项需要修改")
        return data["errors"]


@unittest.skipUnless(HAS_HTTP_DEPS, "需要 fastapi 与 httpx")
class SetupJsonContractTests(_SetupHttpCase):
    """首启的 JSON 契约：`GET /api/setup/questions`、`POST /api/setup` 与接回已有数据目录。

    这一层和 `peach init` 的问答共用 `peach.onboarding`，所以断言的是「端点给出的字段和
    `questions()` 同名同序、默认值一致」，而不是另抄一份字段清单去比对。页面怎么画见
    vitest 与 e2e。
    """

    def test_the_first_run_page_is_a_shell_around_the_pages_bundle(self):
        response = self._get("/")
        self.assertEqual(response.status_code, 200, response.text)
        page = response.text
        self.assertIn("<title>Peach · 首次运行</title>", page)
        # 答卷草稿存在浏览器里，刷新一次不会被服务端的已存值盖掉。
        self.assertLess(page.index('localStorage.getItem("peach.settings.v1")'),
                        page.index("/dist/peach-pages.css"))
        for symbol in ("i-folder-search", "i-hard-drive", "i-database"):
            self.assertIn(f'<symbol id="{symbol}"', page)
        self.assertNotIn("/dist/peach-entry.js", page)
        self.assertNotIn("<form", page)
        for asset in ("/dist/peach-pages.js", "/dist/peach-pages.css",
                      "/vendor/inter/5.3.0/index.css",
                      "/peach-logo.png", "/peach-logo-64.png", "/peach-logo-128.png"):
            self.assertEqual(self._get(asset).status_code, 200, asset)

    def test_the_questions_are_the_ones_the_cli_asks(self):
        response = self._get(self.QUESTIONS)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.headers["cache-control"], "no-store")
        data = response.json()
        asked = onboarding.questions(self.config)
        questions = data["questions"]
        self.assertEqual([item["key"] for item in questions], [question.key for question in asked])
        self.assertEqual([item["default"] for item in questions],
                         [question.default for question in asked])
        self.assertEqual([item["label"] for item in questions],
                         ["数据目录", "谁可以访问", "端口", "网盘授权回调基址"])
        self.assertEqual([item["required"] for item in questions], [True, False, True, True])
        self.assertEqual([item["advanced"] for item in questions], [False, False, True, True])
        by_key = {item["key"]: item for item in questions}
        self.assertEqual(by_key["data_root"]["input"], "folder")
        self.assertEqual(by_key["host"]["input"], "choice")
        self.assertEqual(by_key["host"]["options"], [
            {"value": "2", "label": "对外提供（0.0.0.0）"},
            {"value": "1", "label": "只有这台机器"},
        ])
        self.assertEqual((by_key["port"]["input"], by_key["port"]["prefix"]),
                         ("number", "localhost:"))
        self.assertEqual(by_key["drive_public_url"]["input"], "text")
        self.assertEqual(by_key["drive_public_url"]["prefix"], "")
        self.assertEqual(by_key["drive_public_url"]["suffix"], "")
        self.assertTrue(by_key["drive_public_url"]["help"])
        self.assertFalse(data["docker"])
        self.assertIsNone(data["data_root"])
        self.assertTrue(data["access_enabled"], "对外是默认选项，访问密码开关因此默认开")
        self.assertFalse(data["access_preset"])

    def test_the_questions_are_guarded_like_a_local_page(self):
        cases = (
            ({"configured": True}, 404, "not found"),
            ({"client": ("198.51.100.7", 51000)}, 403, "setup is loopback-only"),
            ({"base_url": "http://peach.local:8900"}, 403, "请使用本机地址打开设置"),
        )
        for kwargs, status, error in cases:
            with self.subTest(kwargs=kwargs):
                response = self._send("GET", self.QUESTIONS, headers={"Accept": "text/html"},
                                      **kwargs)
                self.assertEqual((response.status_code, response.json()),
                                 (status, {"error": error}))
        allowed = self._send("GET", self.QUESTIONS, headers={"Origin": "http://elsewhere.example"})
        self.assertEqual(allowed.status_code, 200, "读题不看 Origin")

    def test_the_submission_is_loopback_only_and_same_origin(self):
        cases = (
            ({"configured": True}, 404, "not found"),
            ({"client": ("198.51.100.7", 51000)}, 403, "setup is loopback-only"),
            ({"base_url": "http://peach.local:8900"}, 403, "请使用本机地址打开设置"),
        )
        for kwargs, status, error in cases:
            with self.subTest(kwargs=kwargs):
                response = self._send("POST", self.SUBMIT, json=self._body(), **kwargs)
                self.assertEqual((response.status_code, response.json()),
                                 (status, {"error": error}))
        crossed = self._send("POST", self.SUBMIT, headers={"Origin": "http://elsewhere.example"},
                             json=self._body())
        self.assertEqual((crossed.status_code, crossed.json()),
                         (403, {"error": "请从 Peach 设置页提交"}))
        not_an_object = self._send("POST", self.SUBMIT, json=[])
        self.assertEqual((not_an_object.status_code, not_an_object.json()),
                         (400, {"error": "请求正文要是 JSON 对象"}))
        self.assertFalse(self.data_root.exists())

    def test_the_submission_trusts_the_browser_asserted_origin(self):
        for headers in ({"Origin": "http://127.0.0.1:8900", "Sec-Fetch-Site": "cross-site"},
                        {"Origin": "http://elsewhere.example", "Sec-Fetch-Site": "same-site"}):
            with self.subTest(headers=headers):
                response = self._send("POST", self.SUBMIT, headers=headers, json=self._body())
                self.assertEqual((response.status_code, response.json()["error"]),
                                 (403, "请从 Peach 设置页提交"))
        self.assertFalse(self.data_root.exists())
        accepted = self._send("POST", self.SUBMIT,
                              headers={"Origin": "null", "Sec-Fetch-Site": "same-origin"},
                              json=self._body())
        self.assertEqual(accepted.status_code, 200, accepted.text)

    def test_a_second_submission_refuses_to_overwrite_the_settings_file(self):
        first = self._send("POST", self.SUBMIT, headers={"Origin": "http://127.0.0.1:8900"},
                           json=self._body(port="9443"))
        self.assertEqual(first.status_code, 200, first.text)
        again = self._send("POST", self.SUBMIT, headers={"Origin": "http://127.0.0.1:8900"},
                           json=self._body(port="9444"))
        self.assertEqual((again.status_code, again.json()),
                         (409, {"error": "settings file already exists"}))
        self.assertEqual(self._loaded().server.port, 9443)

    def test_each_wrong_answer_comes_back_under_its_own_key(self):
        file = self.root / "not-a-dir"
        file.write_text("x", encoding="utf-8")
        cases = (
            ({"port": "0"}, "port", "端口要是 1 到 65535 之间的整数"),
            ({"host": "3"}, "host", "填 1（只有这台机器）或 2（对外提供）"),
            ({"drive_public_url": "http://peach.example.com"}, "drive_public_url",
             "填 https:// 开头的地址，例如 https://peach.example.com"),
            ({"data_root": str(file)}, "data_root",
             f"{file} 是一个文件，Peach 数据目录要是目录"),
        )
        for overrides, key, message in cases:
            with self.subTest(key=key):
                self.assertEqual(self._errors(**overrides), {key: message})
        self.assertEqual(self._errors(port="0", drive_public_url="http://peach.example.com"), {
            "port": "端口要是 1 到 65535 之间的整数",
            "drive_public_url": "填 https:// 开头的地址，例如 https://peach.example.com",
        })
        self.assertFalse(self.data_root.exists(), "校验不过不建目录")

    def test_the_password_switch_asks_for_a_password_and_a_matching_confirmation(self):
        self.assertEqual(self._errors(access_enabled=True), {"access_password": "请输入访问密码"})
        mismatched = self._errors(access_enabled=True, access_password="correct-password",
                                  access_confirm="other-password")
        self.assertEqual(list(mismatched), ["access_password"])
        self.assertIn("不一致", mismatched["access_password"])
        self.assertFalse(self.data_root.exists())

    def test_password_fields_are_ignored_while_the_switch_is_off(self):
        from peach import access

        response = self._send("POST", self.SUBMIT, json=self._body(
            access_enabled=False, access_password="should-not-be-used",
            access_confirm="should-not-be-used"))
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(access.load(self.data_root / "secrets" / "access.json")["mode"], "open")

    def test_a_valid_submission_builds_the_tree_and_saves_the_answers(self):
        response = self._send("POST", self.SUBMIT, json=self._body(
            host="2", port="9443", drive_public_url="https://peach.example.com/"))
        self.assertEqual(response.status_code, 200, response.text)
        for key in settings_file.DIRECTORY_KEYS:
            self.assertTrue((self.data_root / key).is_dir(), key)
        self.assertTrue((self.data_root / "database" / "ledger.db").is_file())
        saved = self._loaded()
        self.assertTrue(saved.present)
        self.assertEqual((saved.server.host, saved.server.port), ("0.0.0.0", 9443))
        self.assertEqual(saved.drive_public_url, "https://peach.example.com")

    def test_a_valid_submission_returns_the_entry_address_and_runtime_facts(self):
        from peach import access

        response = self._send("POST", self.SUBMIT, json=self._body(
            access_enabled=True, access_password="correct-password",
            access_confirm="correct-password"))
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.headers["cache-control"], "no-store")
        data = response.json()
        self.assertEqual((data["url"], data["restored"], data["redirect"]),
                         ("http://127.0.0.1:8900/?onboarding=1", False, None))
        self.assertEqual([row["term"] for row in data["facts"]],
                         [row["term"] for row in runtime_fact_entries(self._loaded())])
        policy = access.load(self.data_root / "secrets" / "access.json")
        self.assertEqual(policy["mode"], "password")
        self.assertTrue(access.verify(policy, "correct-password"))
        self.assertNotIn("correct-password", response.text)
        self.assertFalse((self.data_root / "state" / onboarding.SCAN_REQUEST_NAME).exists(),
                         "首启不请求扫描：网盘还没接上，没有可扫的根目录")

    def test_a_failed_apply_is_reported_on_the_data_root(self):
        with mock.patch.object(onboarding, "apply", side_effect=OSError("数据目录写不进去")):
            self.assertEqual(self._errors(), {"data_root": "数据目录写不进去"})

    def test_restore_adopts_an_existing_data_directory(self):
        self.assertEqual(self._send("POST", self.SUBMIT, json=self._body()).status_code, 200)
        locator = self.data_root / "state" / settings_file.DATA_ROOT_LOCATION
        if locator.exists():
            locator.unlink()
        before = (self.data_root / settings_file.SETTINGS_FILENAME).read_bytes()
        response = self._send("POST", self.RESTORE, json={"data_root": str(self.data_root)})
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()
        self.assertEqual((data["restored"], data["url"], data["redirect"]),
                         (True, "http://127.0.0.1:8900/", None))
        self.assertEqual(self._loaded().data_root, self.data_root)
        self.assertEqual((self.data_root / settings_file.SETTINGS_FILENAME).read_bytes(), before)

    def test_restore_refuses_directories_that_are_not_a_peach_data_directory(self):
        for raw in (None, "relative", str(self.root / "missing")):
            with self.subTest(raw=raw):
                response = self._send("POST", self.RESTORE, json={"data_root": raw})
                self.assertEqual(response.status_code, 400, response.text)
                data = response.json()
                self.assertEqual(data["error"], "无法使用此数据目录")
                self.assertIn("data_root", data["errors"])
        self.assertEqual(self._send("POST", self.SUBMIT, json=self._body()).status_code, 200)
        (self.data_root / "database" / "ledger.db").unlink()
        missing_ledger = self._send("POST", self.RESTORE,
                                    json={"data_root": str(self.data_root)})
        self.assertEqual(missing_ledger.status_code, 400)
        self.assertIn("没有数据库", missing_ledger.json()["errors"]["data_root"])

    def test_restore_is_guarded_like_the_submission(self):
        cases = (
            ({"configured": True}, 404, "not found"),
            ({"client": ("198.51.100.7", 1)}, 403, "setup is loopback-only"),
        )
        for kwargs, status, error in cases:
            with self.subTest(kwargs=kwargs):
                response = self._send("POST", self.RESTORE,
                                      json={"data_root": str(self.data_root)}, **kwargs)
                self.assertEqual((response.status_code, response.json()),
                                 (status, {"error": error}))
        crossed = self._send("POST", self.RESTORE,
                             headers={"Origin": "http://elsewhere.example"},
                             json={"data_root": str(self.data_root)})
        self.assertEqual((crossed.status_code, crossed.json()),
                         (403, {"error": "请从 Peach 设置页提交"}))


@unittest.skipUnless(HAS_HTTP_DEPS, "需要 fastapi 与 httpx")
class DockerFirstSetupTests(_SetupHttpCase):
    """全新 Docker 走同一张首次设置页：只有网盘回调基址要问，数据目录是卷挂载点。"""

    LAN = ("192.0.2.20", 51000)

    def setUp(self):
        super().setUp()
        environment = mock.patch.dict(os.environ, {"PEACH_DISTRIBUTION": "docker",
                                                   "PEACH_HEADLESS_MANAGED": "1"})
        environment.start()
        self.addCleanup(environment.stop)

    def _body(self, **overrides) -> dict:
        body = {"drive_public_url": "", "access_enabled": True,
                "access_password": "correct-password", "access_confirm": "correct-password"}
        body.update(overrides)
        return {key: value for key, value in body.items() if value is not None}

    def test_lan_peers_get_only_the_drive_question(self):
        data = self._send("GET", self.QUESTIONS, client=self.LAN).json()
        self.assertTrue(data["docker"])
        self.assertEqual([item["key"] for item in data["questions"]], ["drive_public_url"])
        self.assertEqual(data["data_root"], str(self.data_root))
        self.assertTrue(data["access_enabled"], "Docker 对局域网开放，访问密码默认开")
        self.assertFalse(data["access_preset"])

    def test_a_public_peer_cannot_reach_the_setup_endpoints(self):
        for method, path in (("GET", self.QUESTIONS), ("POST", self.SUBMIT)):
            with self.subTest(method=method):
                response = self._send(method, path, client=("8.8.8.8", 51001),
                                      headers={"Origin": "http://127.0.0.1:8900"}, json=self._body())
                self.assertEqual((response.status_code, response.json()["error"]),
                                 (403, "请从部署这台 Peach 的机器或局域网打开设置"))
        self.assertFalse(self.data_root.exists())

    def test_a_foreign_page_cannot_submit_the_form(self):
        response = self._send("POST", self.SUBMIT, client=self.LAN,
                              headers={"Origin": "http://elsewhere.example"}, json=self._body())
        self.assertEqual((response.status_code, response.json()["error"]),
                         (403, "请从 Peach 设置页提交"))
        self.assertFalse(self.data_root.exists())

    def test_the_lan_submission_adopts_the_volume_and_ignores_fixed_fields(self):
        response = self._send("POST", self.SUBMIT, client=self.LAN, json=self._body(
            data_root=str(self.root / "elsewhere"), host="1", port="7000"))
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()
        self.assertEqual((data["url"], data["redirect"]), ("/?onboarding=1", "/?onboarding=1"))
        saved = self._loaded()
        self.assertEqual(saved.data_root, self.data_root)
        self.assertEqual((saved.server.host, saved.server.port), ("0.0.0.0", 8900))
        self.assertTrue((self.data_root / "database" / "ledger.db").is_file())
        self.assertFalse((self.root / "elsewhere").exists(), "容器里的数据目录不可换")
        self.assertIsNone(onboarding.take_first_scan_request(saved), "首启不写扫描请求")

    def test_the_password_can_be_switched_off(self):
        from peach import access

        response = self._send("POST", self.SUBMIT, client=self.LAN,
                              json=self._body(access_enabled=False, access_password=None,
                                              access_confirm=None))
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(access.load(self.data_root / "secrets" / "access.json")["mode"], "open")

    def test_the_container_password_from_the_environment_is_not_asked_again(self):
        from peach import access

        policy = self.config.directory("secrets") / "access.json"
        access.save(policy, "container-secret")
        data = self._send("GET", self.QUESTIONS, client=self.LAN).json()
        self.assertTrue(data["access_preset"])
        response = self._send("POST", self.SUBMIT, client=self.LAN,
                              json=self._body(access_enabled=False, access_password=None,
                                              access_confirm=None))
        self.assertEqual(response.status_code, 200, response.text)
        self.assertTrue(access.verify(access.load(self.data_root / "secrets" / "access.json"),
                                      "container-secret"))

    def test_healthz_reports_a_ready_container_after_setup(self):
        self.assertEqual(self._send("POST", self.SUBMIT, client=self.LAN,
                                    json=self._body()).status_code, 200)
        response = self._send("GET", "/healthz?ready=1", client=self.LAN)
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()
        self.assertTrue(data["ready"])
        self.assertTrue(data["setup"])
        with mock.patch.dict(os.environ, {"PEACH_DISTRIBUTION": "source"}):
            self.assertEqual(self._send("GET", "/healthz?ready=1", client=self.LAN).status_code, 503)

    def test_restore_is_not_offered_in_docker(self):
        response = self._send("POST", self.RESTORE, client=self.LAN,
                              json={"data_root": str(self.root)})
        self.assertEqual(response.status_code, 404)


@unittest.skipUnless(HAS_HTTP_DEPS, "需要 fastapi 与 httpx")
class ConfigurationSurfaceTests(_Case):
    """设置页背后的配置面：本机开发、来源守卫、错误页与文件夹对话框。"""

    def setUp(self):
        super().setUp()
        self.config = replace(self.config, present=True,
                              server=settings_file.ServerSettings(port=9123))
        settings_file.write(self.config)
        loaded = mock.patch.object(settings_file, "load_config", lambda **kwargs: self.config)
        loaded.start()
        self.addCleanup(loaded.stop)

    @contextmanager
    def client(self, *, token="test-token", address="127.0.0.1", base_url="http://localhost",
               scheme=None):
        from fastapi.testclient import TestClient

        from peach.api import create_app
        from peach.config import PeachSettings

        app = create_app(PeachSettings(
            configured=True, token=token,
            access_path=self.config.directory("secrets") / "access.json",
            state_root=self.root / "state",
            db_path=self.config.directory("database") / "ledger.db"))
        if scheme:
            @app.middleware("http")
            async def connection_scheme(request, call_next):
                request.scope["scheme"] = scheme
                return await call_next(request)
        with TestClient(app, client=(address, 12345), base_url=base_url) as client:
            yield client

    def test_a_browser_session_can_read_configuration(self):
        """配好访问密码之后，浏览器登录换来的会话和 `X-Token` 一样能读这条工作面。"""
        from peach import access
        from peach.routes_configuration import revision

        access.save(self.config.directory("secrets") / "access.json", "correct-password")
        with self.client() as client:
            self.assertEqual(client.get("/api/configuration").status_code, 401)
            login = client.post("/login", data={"token": "correct-password"},
                                follow_redirects=False)
            self.assertEqual(login.status_code, 303, login.text)
            response = client.get("/api/configuration")
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(response.json()["revision"], revision(self.config))

    def test_settings_writes_reject_unauthenticated_cross_origin_and_unknown_libraries(self):
        before = self.config.path.read_bytes()
        with self.client() as client:
            self.assertEqual(client.get("/configuration", follow_redirects=False).status_code, 303)
            self.assertEqual(client.get("/api/configuration").status_code, 401)
            crossed = client.post("/api/libraries/gdrive%3Amissing", json={"name": "改名"},
                                  headers={"X-Token": "test-token",
                                           "Origin": "https://example.org"})
            self.assertEqual(crossed.status_code, 403)
            missing = client.post("/api/libraries/gdrive%3Amissing", json={"name": "改名"},
                                  headers={"X-Token": "test-token"})
            self.assertEqual(missing.status_code, 404)
            self.assertEqual(missing.json()["error"], "没有这个媒体库")
        with self.client(address="192.0.2.1") as client:
            self.assertEqual(client.get("/api/configuration").status_code, 401)
            self.assertEqual(client.post("/api/libraries/gdrive%3Amissing",
                                         json={"name": "改名"}).status_code, 401)
        self.assertEqual(before, self.config.path.read_bytes())

    def test_browser_navigations_get_an_error_page_instead_of_raw_json(self):
        from fastapi import HTTPException
        from fastapi.testclient import TestClient

        from peach.api import create_app
        from peach.config import PeachSettings

        details = {403: "请在运行 Peach 的电脑上打开配置", 409: "请先完成首次设置"}

        async def refuse(status: int):
            raise HTTPException(status_code=status, detail=details.get(status, "服务出错"))

        app = create_app(PeachSettings(configured=True, token="test-token",
                                       db_path=self.config.directory("database") / "ledger.db"))
        app.add_api_route("/refuse/{status}", refuse)
        app.router.routes.insert(0, app.router.routes.pop())
        with TestClient(app, base_url="http://localhost") as client:
            for status, detail in details.items():
                self.assertEqual(client.get(f"/refuse/{status}").json(), {"error": detail})
                page = client.get(f"/refuse/{status}",
                                  headers={"Accept": "text/html,application/xhtml+xml"})
                self.assertEqual(page.status_code, status)
                self.assertIn("text/html", page.headers["content-type"])
                self.assertIn(f'<div id="peach-page" data-page="error" data-status="{status}" '
                              f'data-detail="{detail}"></div>', page.text)
                self.assertIn('<script type="module" src="/dist/peach-pages.js"></script>', page.text)
                self.assertNotIn("/dist/peach-entry.js", page.text)
                self.assertNotIn("<style", page.text)
            missing = client.get("/no-such-page", headers={"Accept": "text/html"})
            self.assertEqual(missing.status_code, 404)
            self.assertIn('data-detail="这个地址下没有页面。"', missing.text)
            api = client.get("/api/configuration", headers={"Accept": "text/html"})
            self.assertEqual(api.status_code, 401)
            self.assertEqual(api.headers["content-type"], "application/json")

    def test_the_folder_dialog_is_opened_by_this_machine(self):
        from peach import folder_picker

        headers = {"X-Token": "test-token"}
        picked = str(self.root / "picked")
        with mock.patch("peach.folder_picker.pick_folder", return_value=picked) as picker:
            with self.client() as client:
                response = client.post("/api/pick-folder", headers=headers, json={"initial": ""})
                self.assertEqual(response.status_code, 200, response.text)
                self.assertEqual(response.json(), {"path": picked})
                picker.assert_called_once_with(None)
                crossed = client.post("/api/pick-folder", json={},
                                      headers={**headers, "Origin": "https://example.org"})
                self.assertEqual(crossed.status_code, 403)
                self.assertEqual(client.post("/api/pick-folder", json={}).status_code, 401)
            with self.client(address="192.0.2.1") as client:
                self.assertEqual(client.post("/api/pick-folder", headers=headers,
                                             json={}).status_code, 200)
            self.assertEqual(picker.call_count, 2)
        with mock.patch("peach.folder_picker.pick_folder",
                        side_effect=folder_picker.PickerUnavailable(
                            "这个系统上没有可用的文件夹对话框")):
            with self.client() as client:
                response = client.post("/api/pick-folder", headers=headers, json={})
        self.assertEqual(response.status_code, 501)
        self.assertEqual(response.json()["error"], "这个系统上没有可用的文件夹对话框")
        busy = folder_picker.PickerBusy("已经有一个选择文件夹的窗口开着")
        with mock.patch("peach.folder_picker.pick_folder", side_effect=busy):
            with self.client() as client:
                self.assertEqual(client.post("/api/pick-folder", headers=headers,
                                             json={}).status_code, 409)
