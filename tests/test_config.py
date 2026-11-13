import importlib
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from peach import config, settings_file
from peach.settings_file import SettingsFileError


class TempTree:
    """`<tmp>/peach-data` 加一个并列的 `<tmp>/app` 当项目根。

    临时目录一律先 `.resolve()`：CI runner 的临时路径都是别名（macOS `/var` 软链到
    `/private/var`，Windows 短名 `RUNNER~1` 展开成 `runneradmin`），不 resolve 的路径
    在开发机上过、在 CI 上红。
    """

    def __init__(self, with_data_root: bool = True):
        self._temp = tempfile.TemporaryDirectory()
        self.root = Path(self._temp.name).resolve()
        self.project = self.root / "app"
        self.project.mkdir()
        self.data_root = self.root / "peach-data"
        if with_data_root:
            self.data_root.mkdir()

    def write(self, text: str) -> Path:
        path = self.data_root / settings_file.SETTINGS_FILENAME
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path

    def load(self, environ: dict[str, str] | None = None, **kwargs):
        return settings_file.load_config(
            project_root=self.project, environ=environ or {}, **kwargs)

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self._temp.cleanup()


class ProjectRootTests(unittest.TestCase):
    def test_project_root_uses_pyinstaller_resource_directory_without_a_src_layer(self):
        # 锚点必须在当前平台上真的是绝对路径。`C:/repo` 在 POSIX 上是**相对**路径，
        # `_project_root` 里的 `.resolve()` 会给它前置 cwd，断言于是只在 Windows 成立。
        root = Path(tempfile.gettempdir()).resolve() / "repo"
        source = root / "src" / "peach" / "settings_file.py"
        self.assertEqual(settings_file._project_root(str(source)), root)
        # bundle_root 不经过 resolve，原样构造，两个平台比较结果一致。
        self.assertEqual(
            settings_file._project_root(str(source), "C:/bundle/_MEI123"),
            Path("C:/bundle/_MEI123"),
        )


class DataRootDiscoveryTests(unittest.TestCase):
    def test_saved_data_root_locations_reject_invalid_and_cyclic_paths(self):
        with TempTree() as tree:
            state = tree.data_root / "state"
            state.mkdir()
            locator = state / settings_file.DATA_ROOT_LOCATION
            for destination in ("", "relative", str(tree.data_root)):
                with self.subTest(destination=destination):
                    locator.write_text(destination, encoding="utf-8")
                    with self.assertRaises(SettingsFileError):
                        tree.load()

    def test_a_missing_selected_root_stays_selected(self):
        with TempTree() as tree:
            selected = tree.root / "custom-data"
            state = tree.data_root / "state"
            state.mkdir()
            (state / settings_file.DATA_ROOT_LOCATION).write_text(str(selected), encoding="utf-8")
            loaded = tree.load()
            self.assertEqual(loaded.data_root, selected)
            self.assertFalse(loaded.present)

    def test_environment_variable_wins_over_the_sibling_directory(self):
        with TempTree() as tree:
            elsewhere = tree.root / "elsewhere"
            found = settings_file.discover_data_root(
                tree.project, {"PEACH_DATA_ROOT": str(elsewhere)})
            self.assertEqual(found, (elsewhere, True))

    def test_sibling_peach_data_is_found_from_the_project_root(self):
        with TempTree() as tree:
            self.assertEqual(
                settings_file.discover_data_root(tree.project, {}),
                (tree.data_root, True),
            )

    def test_nested_checkout_still_finds_the_shared_data_root(self):
        """隔离工作树和打包产物都比项目根深一层以上，向上找必须仍然命中。"""
        with TempTree() as tree:
            nested = tree.root / "worktrees" / "task"
            nested.mkdir(parents=True)
            self.assertEqual(
                settings_file.discover_data_root(nested, {}), (tree.data_root, True))

    def test_frozen_build_searches_from_the_executable_directory(self):
        """单文件包的 `_MEIPASS` 是临时目录，起点必须是 EXE 所在目录才找得到 Peach 数据目录。"""
        with TempTree() as tree:
            executable = tree.project / "dist" / "Peach" / "Peach.exe"
            executable.parent.mkdir(parents=True)
            executable.write_bytes(b"")
            anchor = settings_file._search_anchor(
                tree.root / "temp" / "_MEI123", frozen=True, executable=str(executable))
            self.assertEqual(anchor, executable.parent)
            self.assertEqual(
                settings_file.discover_data_root(anchor, {}), (tree.data_root, True))

    def test_source_tree_searches_from_the_project_root(self):
        with TempTree() as tree:
            anchor = settings_file._search_anchor(
                tree.project, frozen=False, executable=str(tree.root / "python.exe"))
            self.assertEqual(anchor, tree.project)

    def test_missing_data_root_is_an_explicit_unconfigured_state(self):
        with TempTree(with_data_root=False) as tree:
            path, found = settings_file.discover_data_root(tree.project, {})
            self.assertFalse(found)
            # 找不到也要给出落点：`peach init` 按它建目录，页面按它显示提示。
            self.assertEqual(path, tree.root / "peach-data")


class DefaultsAreGenericTests(unittest.TestCase):
    """内建默认必须对一个全新用户成立，不能是某台机器的坐标。"""

    def test_fresh_machine_gets_neutral_defaults(self):
        with TempTree() as tree:
            loaded = tree.load()
        self.assertEqual(loaded.server.host, "127.0.0.1")
        self.assertEqual(loaded.server.port, 8900)
        # 一台新机器既没接网盘，也没声明媒体库：媒体只从网盘来（ADR-0157）。
        self.assertEqual(loaded.drive_public_url, "")
        self.assertEqual(loaded.drive_clients, {})
        self.assertEqual(loaded.drive_roots, {})
        self.assertEqual(loaded.library_names, {})
        self.assertEqual(loaded.library_icons, {})
        self.assertEqual(loaded.library_catalog, {})
        self.assertEqual(loaded.directories, {})

    def test_directories_default_to_their_own_names_under_the_data_root(self):
        with TempTree() as tree:
            loaded = tree.load()
            for key in settings_file.DIRECTORY_KEYS:
                self.assertEqual(loaded.directory(key), tree.data_root / key)

    def test_absolute_directory_moves_that_data_out_of_the_data_root(self):
        with TempTree() as tree:
            other = tree.root / "elsewhere" / "db"
            tree.write(f"[directories]\ndatabase = '{other.as_posix()}'\n")
            loaded = tree.load()
        self.assertEqual(loaded.directory("database"), other)
        self.assertEqual(loaded.directory("state"), tree.data_root / "state")


class PriorityTests(unittest.TestCase):
    """环境变量 > 设置文件 > 内建默认。三层都要有断言，不然改错顺序没人发现。

    环境变量只剩 `PEACH_DATA_ROOT` 一项，它换的是整份设置文件的位置；其余取值一律
    来自那份文件或内建默认。
    """

    FILE = """
[server]
port = 9100
[drive]
public_url = 'https://from-file.example.com'
"""

    def test_file_overrides_builtin_defaults(self):
        with TempTree() as tree:
            tree.write(self.FILE)
            loaded = tree.load()
        self.assertEqual(loaded.server.port, 9100)
        self.assertEqual(loaded.drive_public_url, "https://from-file.example.com")
        # 文件里没写的项仍然取内建默认，不会因为文件存在就变空。
        self.assertEqual(loaded.server.host, "127.0.0.1")

    def test_environment_variable_moves_the_whole_settings_file(self):
        with TempTree() as tree:
            beside = tree.write(self.FILE)
            elsewhere = tree.root / "elsewhere"
            elsewhere.mkdir()
            (elsewhere / settings_file.SETTINGS_FILENAME).write_text(
                "[server]\nport = 9200\n", encoding="utf-8")
            loaded = tree.load({"PEACH_DATA_ROOT": str(elsewhere)})
            self.assertEqual(loaded.data_root, elsewhere)
            self.assertEqual(loaded.path, elsewhere / settings_file.SETTINGS_FILENAME)
            self.assertEqual(loaded.server.port, 9200)
            # 旁边那份设置文件没被读，也没被动过。
            self.assertEqual(beside.read_text(encoding="utf-8"), self.FILE)


class BadFileTests(unittest.TestCase):
    def test_syntax_error_names_the_file_and_the_line(self):
        with TempTree() as tree:
            path = tree.write("[server]\nport = = 3\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        message = str(caught.exception)
        self.assertIn(str(path), message)
        # tomllib 的消息自带行号；没有行号的报错等于让人在几十行里自己找。
        self.assertIn("line 2", message)

    def test_wrong_type_names_the_key(self):
        with TempTree() as tree:
            tree.write("[server]\nport = 'eight thousand'\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        self.assertIn("server.port", str(caught.exception))

    def test_boolean_is_not_accepted_as_a_port(self):
        with TempTree() as tree:
            tree.write("[server]\nport = true\n")
            with self.assertRaises(SettingsFileError):
                tree.load()

    def test_non_table_section_is_rejected(self):
        with TempTree() as tree:
            tree.write("server = 5\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        self.assertIn("[server]", str(caught.exception))

    def test_unknown_directory_key_is_rejected_instead_of_ignored(self):
        # 打错一个键名却静默忽略，等于那份数据默默落回默认目录。
        with TempTree() as tree:
            tree.write("[directories]\ndatabses = 'db'\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        self.assertIn("databses", str(caught.exception))

    def test_lenient_load_falls_back_to_builtin_defaults(self):
        """坏文件不能让进程连 Peach 数据目录都不知道——发现顺序不看文件内容。"""
        with TempTree() as tree:
            tree.write("nonsense = =\n")
            loaded = tree.load(strict=False)
        self.assertEqual(loaded.data_root, tree.data_root)
        self.assertEqual(loaded.server.port, 8900)
        self.assertFalse(loaded.present)

    def test_lenient_load_also_survives_a_merge_time_rejection(self):
        """语法没错、内容被拒的文件同样得退得下来。

        `peach init --force` 是坏文件的唯一自救入口，它走的就是 `strict=False`。
        合并期的拒绝漏在退路之外的话，`[media] R = ...` 这种写法会把自救入口
        本身打崩——语法完全正确，抛错的是键空间校验。
        """
        for text in ("[media]\nR = '/mnt/res'\n",
                     "[drive.roots]\ngdrive = 'root-id'\n",
                     "[directories]\ndatabses = 'db'\n"):
            with self.subTest(text=text):
                with TempTree() as tree:
                    tree.write(text)
                    with self.assertRaises(SettingsFileError):
                        tree.load()
                    loaded = tree.load(strict=False)
                self.assertEqual(loaded.data_root, tree.data_root)
                self.assertEqual(loaded.server.port, 8900)
                self.assertEqual(loaded.drive_roots, {})
                self.assertEqual(loaded.library_names, {})
                self.assertFalse(loaded.present)


class DriveSettingsTests(unittest.TestCase):
    """`[drive]` 是 OAuth 回调基址与网盘凭据的唯一去处；缺一项就不发起授权。"""

    ACCOUNT = ("[drive.accounts.gdrive]\n"
               "client_id = 'id.apps.googleusercontent.com'\n"
               "client_secret = 'sekrit'\n")

    def test_public_url_must_be_https_with_a_host(self):
        for url in ("http://peach.example.com", "https://", "peach.example.com"):
            with self.subTest(url=url):
                with TempTree() as tree:
                    tree.write(f"[drive]\npublic_url = '{url}'\n")
                    with self.assertRaises(SettingsFileError) as caught:
                        tree.load()
                self.assertIn("https", str(caught.exception))

    def test_public_url_is_trimmed(self):
        with TempTree() as tree:
            tree.write("[drive]\npublic_url = '  https://peach.example.com  '\n")
            loaded = tree.load()
        self.assertEqual(loaded.drive_public_url, "https://peach.example.com")

    def test_unknown_drive_key_is_rejected(self):
        with TempTree() as tree:
            tree.write("[drive]\npublic_uri = 'https://peach.example.com'\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        self.assertIn("public_uri", str(caught.exception))

    def test_account_needs_both_client_credentials(self):
        for text in ("[drive.accounts.gdrive]\nclient_id = 'id'\n",
                     "[drive.accounts.gdrive]\nclient_secret = 'sekrit'\n"):
            with self.subTest(text=text):
                with TempTree() as tree:
                    tree.write(text)
                    with self.assertRaises(SettingsFileError) as caught:
                        tree.load()
                message = str(caught.exception)
                self.assertIn("drive.accounts.gdrive", message)
                self.assertIn("client_secret", message)

    def test_account_with_an_unknown_key_is_rejected(self):
        # `client_secrets` 这类拼写错误必须报出来：少一个字段就是授权不起来。
        with TempTree() as tree:
            tree.write("[drive.accounts.gdrive]\nclient_id = 'id'\n"
                       "client_secrets = 'sekrit'\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        self.assertIn("client_secrets", str(caught.exception))

    def test_unknown_drive_location_is_rejected(self):
        with TempTree() as tree:
            tree.write("[drive.accounts.dropbox]\nclient_id = 'id'\nclient_secret = 'sekrit'\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        message = str(caught.exception)
        self.assertIn("dropbox", message)
        self.assertIn("gdrive", message)
        self.assertIn("onedrive", message)

    def test_roots_require_a_configured_account(self):
        # 没有凭据就配了扫描起点，等于给一个永远授权不上的网盘许愿。
        with TempTree() as tree:
            tree.write("[drive.roots]\ngdrive = 'root-id'\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        message = str(caught.exception)
        self.assertIn("gdrive", message)
        self.assertIn("[drive.accounts]", message)

    def test_a_root_is_a_string_or_a_string_array(self):
        for value in ("42", "[3]", "['root-id', 7]"):
            with self.subTest(value=value):
                with TempTree() as tree:
                    tree.write(self.ACCOUNT + f"[drive.roots]\ngdrive = {value}\n")
                    with self.assertRaises(SettingsFileError) as caught:
                        tree.load()
                self.assertIn("drive.roots.gdrive", str(caught.exception))

    def test_root_array_rejects_empty_and_duplicate_ids(self):
        with TempTree() as tree:
            tree.write(self.ACCOUNT + "[drive.roots]\ngdrive = ['a', '']\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        self.assertIn("空串", str(caught.exception))
        with TempTree() as tree:
            tree.write(self.ACCOUNT + "[drive.roots]\ngdrive = ['a', 'a']\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        self.assertIn("重复", str(caught.exception))

    def test_empty_root_means_the_account_root(self):
        with TempTree() as tree:
            tree.write(self.ACCOUNT + "[drive.roots]\ngdrive = ''\n")
            loaded = tree.load()
        self.assertEqual(loaded.drive_roots, {"gdrive": ()})

    def test_accounts_and_roots_are_loaded(self):
        with TempTree() as tree:
            tree.write(
                self.ACCOUNT
                + "[drive.accounts.onedrive]\nclient_id = 'oid'\nclient_secret = 'osekrit'\n"
                + "[drive.roots]\ngdrive = 'root-id'\nonedrive = ['a', 'b']\n")
            loaded = tree.load()
        self.assertEqual(loaded.drive_clients, {
            "gdrive": ("id.apps.googleusercontent.com", "sekrit"),
            "onedrive": ("oid", "osekrit"),
        })
        self.assertEqual(loaded.drive_roots, {"gdrive": ("root-id",), "onedrive": ("a", "b")})


class MediaTableTests(unittest.TestCase):
    """`[media]` 只剩媒体库的名字、图标与目录；本机路径与挂载点已经不存在了。"""

    def test_only_the_three_library_keys_are_accepted(self):
        with TempTree() as tree:
            tree.write("[media]\nlocations = 'D:\\Videos'\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        message = str(caught.exception)
        self.assertIn("locations", message)
        self.assertIn("libraries", message)
        self.assertIn("library_icons", message)
        self.assertIn("library_catalog", message)

    def test_phase_one_drive_letter_keys_are_rejected(self):
        """第一阶段的 `[media] R = ...` 是盘符键；静默忽略等于那台机器的媒体安静消失。"""
        with TempTree() as tree:
            tree.write("[media]\nR = '/Volumes/Media'\n")
            with self.assertRaises(SettingsFileError) as caught:
                tree.load()
        message = str(caught.exception)
        self.assertIn("R", message)
        self.assertIn("libraries", message)

    def test_libraries_icons_and_catalog_are_loaded(self):
        with TempTree() as tree:
            tree.write("[media.libraries]\n'115' = 'Cloud'\nlocal = '本机'\n"
                       "[media.library_icons]\n'115' = 'hard-drive'\n"
                       "[media.library_catalog.local]\nsource = 'local'\n")
            loaded = tree.load()
        self.assertEqual(loaded.library_names, {"115": "Cloud", "local": "本机"})
        self.assertEqual(loaded.library_icons, {"115": "hard-drive"})
        self.assertEqual(loaded.library_catalog, {"local": {"source": "local"}})

    def test_library_value_must_be_a_string(self):
        for text in ("[media.libraries]\nlocal = 5\n",
                     "[media.library_icons]\nlocal = 5\n",
                     "[media.library_catalog.local]\nsource = 5\n"):
            with self.subTest(text=text):
                with TempTree() as tree:
                    tree.write(text)
                    with self.assertRaises(SettingsFileError) as caught:
                        tree.load()
                self.assertIn("media.", str(caught.exception))

    def test_a_catalog_entry_must_be_a_table(self):
        """`[media.library_catalog.local]` 是表；写成裸值要报设置错误，而不是冒 Python 异常。"""
        for text in ("[media.library_catalog]\nlocal = 'x'\n",
                     "[media.library_catalog]\nlocal = 5\n"):
            with self.subTest(text=text):
                with TempTree() as tree:
                    tree.write(text)
                    with self.assertRaises(SettingsFileError) as caught:
                        tree.load()
                    self.assertIn("media.library_catalog.local", str(caught.exception))
                    loaded = tree.load(strict=False)
                self.assertEqual(loaded.library_catalog, {})


class ConfiguredStateTests(unittest.TestCase):
    def test_existing_data_root_counts_as_configured_without_a_settings_file(self):
        # 现有部署还没生成过设置文件，但它们的账本在跑，不能被判成「未配置」。
        with TempTree() as tree:
            loaded = tree.load()
        self.assertFalse(loaded.present)
        self.assertTrue(loaded.configured)

    def test_fresh_clone_is_unconfigured(self):
        with TempTree(with_data_root=False) as tree:
            loaded = tree.load()
        self.assertFalse(loaded.configured)
        self.assertEqual(loaded.path.name, settings_file.SETTINGS_FILENAME)


class SerialisationTests(unittest.TestCase):
    def test_render_then_load_returns_the_same_values(self):
        with TempTree() as tree:
            tree.write(
                "[directories]\ndatabase = 'db'\nlogs = 'C:\\peach\\logs'\n"
                "[drive]\npublic_url = 'https://peach.example.com'\n"
                "[drive.accounts.gdrive]\nclient_id = 'id.apps.googleusercontent.com'\n"
                "client_secret = 'sekrit'\n"
                "[drive.accounts.onedrive]\nclient_id = 'oid'\nclient_secret = 'osekrit'\n"
                "[drive.roots]\ngdrive = 'root-id'\nonedrive = ['a', 'b']\n"
                "[media.libraries]\n'115' = 'Cloud'\nlocal = '本机'\n"
                "[media.library_icons]\nlocal = 'hard-drive'\n"
                "[media.library_catalog.local]\nsource = 'local'\n"
                "[server]\nhost = '0.0.0.0'\nport = 9443\n")
            captured = tree.load()
            settings_file.write(captured, force=True)
            reloaded = tree.load()
        self.assertEqual(reloaded.server, captured.server)
        self.assertEqual(reloaded.directories, captured.directories)
        self.assertEqual(reloaded.drive_public_url, captured.drive_public_url)
        self.assertEqual(reloaded.drive_clients, captured.drive_clients)
        self.assertEqual(reloaded.drive_roots, captured.drive_roots)
        self.assertEqual(reloaded.library_names, captured.library_names)
        self.assertEqual(reloaded.library_icons, captured.library_icons)
        self.assertEqual(reloaded.library_catalog, captured.library_catalog)
        self.assertTrue(reloaded.present)

    def test_values_with_quotes_survive_the_round_trip(self):
        # 字面量字符串装不下单引号，序列化器要退回基本字符串；往返后必须原样回来。
        with TempTree() as tree:
            tree.write("[media.libraries]\nlocal = \"it's me\"\n"
                       "[drive.accounts.gdrive]\nclient_id = 'id'\n"
                       "client_secret = \"it's 'a' \\\"key\\\"\"\n")
            captured = tree.load()
            settings_file.write(captured, force=True)
            reloaded = tree.load()
        self.assertEqual(reloaded.library_names, {"local": "it's me"})
        self.assertEqual(reloaded.drive_clients["gdrive"], ("id", "it's 'a' \"key\""))

    def test_empty_drive_and_media_tables_survive_the_roundtrip(self):
        with TempTree() as tree:
            settings_file.write(tree.load(), force=True)
            reloaded = tree.load()
        self.assertTrue(reloaded.present)
        self.assertEqual(reloaded.drive_public_url, "")
        self.assertEqual(reloaded.drive_clients, {})
        self.assertEqual(reloaded.drive_roots, {})
        self.assertEqual(reloaded.library_names, {})
        self.assertEqual(reloaded.library_catalog, {})

    def test_write_refuses_to_overwrite_without_force(self):
        with TempTree() as tree:
            loaded = tree.load()
            settings_file.write(loaded)
            with self.assertRaises(SettingsFileError):
                settings_file.write(loaded)
            self.assertEqual(settings_file.write(loaded, force=True), loaded.path)

    def test_a_write_is_visible_to_the_next_active_read(self):
        with TempTree() as tree:
            loaded = tree.load()
            settings_file.reset_cache()
            with patch.object(settings_file, "load_config", return_value=loaded) as load:
                settings_file.active()
                settings_file.active()
                self.assertEqual(load.call_count, 1)
                settings_file.write(loaded, force=True)
                settings_file.active()
            self.assertEqual(load.call_count, 2)


class ModuleConstantTests(unittest.TestCase):
    """`config` 的模块常量被大量 import；名字和相对关系都是契约。"""

    def test_drive_settings_project_into_module_constants(self):
        with TempTree() as tree:
            tree.write("[drive]\npublic_url = 'https://peach.example.com'\n"
                       "[drive.accounts.gdrive]\nclient_id = 'id'\nclient_secret = 'sekrit'\n"
                       "[drive.roots]\ngdrive = ['a', 'b']\n")
            try:
                with patch.dict(os.environ, {"PEACH_DATA_ROOT": str(tree.data_root)}):
                    settings_file.reset_cache()
                    reloaded = importlib.reload(config)
                    self.assertEqual(reloaded.DRIVE_PUBLIC_URL, "https://peach.example.com")
                    self.assertEqual(reloaded.DRIVE_CLIENTS, {"gdrive": ("id", "sekrit")})
                    self.assertEqual(reloaded.DRIVE_ROOTS, {"gdrive": ("a", "b")})
            finally:
                settings_file.reset_cache()
                importlib.reload(config)

    def test_settings_dataclass_reports_the_configured_state(self):
        from peach.config import PeachSettings

        self.assertEqual(PeachSettings().configured, config.CONFIGURED)


if __name__ == "__main__":
    unittest.main()
