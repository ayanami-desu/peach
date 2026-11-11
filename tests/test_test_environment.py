from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from scripts import test_environment
from support.gitrepo import seed_repository


class TestEnvironmentTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.folder = Path(temporary.name).resolve()
        self.main = self.folder / "main"
        self.worker = self.folder / "worker"
        for root in (self.main, self.worker):
            root.mkdir()
            (root / "uv.lock").write_text("version = 1\n", encoding="utf-8")
        self.python = (self.main / ".venv" / ("Scripts" if os.name == "nt" else "bin")
                       / ("python.exe" if os.name == "nt" else "python"))
        self.python.parent.mkdir(parents=True)
        self.python.write_text("", encoding="utf-8")

    def prepare(self, root, run, *, which=lambda name: "uv",
                environ=None, **kwargs):
        if environ is None:
            environ = {"VIRTUAL_ENV": str(self.main / ".venv"),
                       "UV_PROJECT_ENVIRONMENT": str(self.main / ".venv")}
        return test_environment.prepare(root, self.main, run=run, which=which,
                                        environ=environ, **kwargs)

    def test_worktree_sync_creates_its_own_environment_and_ignores_external_overrides(self):
        def install(command, **kwargs):
            destination = Path(command[command.index("--project") + 1])
            (destination / ".venv").mkdir()
            (destination / ".venv" / "installed").touch()
            self.assertNotIn("VIRTUAL_ENV", kwargs["env"])
            self.assertNotIn("UV_PROJECT_ENVIRONMENT", kwargs["env"])
            self.assertIn("--locked", command)
            self.assertIn("--all-extras", command)
            self.assertIn("--no-install-project", command)
            self.assertEqual(kwargs["cwd"], str(self.worker.resolve()))
            return subprocess.CompletedProcess(command, 0)
        self.prepare(self.worker, install)
        self.assertTrue((self.worker / ".venv" / "installed").is_file())
        self.assertFalse((self.main / ".venv" / "installed").exists())

    def test_main_checkout_is_read_only_and_never_syncs_or_installs(self):
        run = mock.Mock()
        # 主检出的 .venv 是部署与本地服务共用的那一份：只确认它能跑，绝不同步。
        self.prepare(self.main, run, which=lambda name: self.fail("主检出不该去找 uv"))
        run.assert_not_called()
        self.assertEqual(self.python.read_text(encoding="utf-8"), "")

    def test_main_checkout_without_its_environment_stops_before_any_sync(self):
        run = mock.Mock()
        self.python.unlink()
        with self.assertRaisesRegex(RuntimeError, "主检出依赖未就绪"):
            self.prepare(self.main, run)
        run.assert_not_called()

    def test_failed_sync_does_not_report_ready(self):
        run = mock.Mock(return_value=subprocess.CompletedProcess([], 2))
        with self.assertRaisesRegex(RuntimeError, "依赖同步失败"):
            self.prepare(self.worker, run)

    def test_missing_lock_or_uv_stops_before_starting_tests(self):
        run = mock.Mock()
        lock = self.worker / "uv.lock"
        lock.unlink()
        with self.assertRaisesRegex(RuntimeError, "uv.lock"):
            self.prepare(self.worker, run)
        lock.write_text("version = 1\n", encoding="utf-8")
        with self.assertRaisesRegex(RuntimeError, "未取得 uv"):
            self.prepare(self.worker, run, which=lambda name: None, environ={})
        run.assert_not_called()
        # Windows 上 uv 常常只有 WinGet 的链接目录里有。
        winget = self.folder / "winget"
        (winget / "Microsoft" / "WinGet" / "Links").mkdir(parents=True)
        (winget / "Microsoft" / "WinGet" / "Links" / "uv.exe").write_text("", encoding="utf-8")
        self.assertEqual(test_environment.find_uv(which=lambda name: None,
                                                  environ={"LOCALAPPDATA": str(winget)}),
                         str(winget / "Microsoft" / "WinGet" / "Links" / "uv.exe"))
        self.assertIsNone(test_environment.find_uv(which=lambda name: None, environ={}))

    def test_entrypoint_requires_successful_preparation_before_loading_the_runner(self):
        shell = shutil.which("pwsh" if os.name == "nt" else "bash")
        if shell is None:
            self.skipTest("本机未取得测试入口所需 shell")
        root = seed_repository(self.folder / "entry", {
            "src/peach/__init__.py": "",
            "scripts/test_environment.py": (
                "from pathlib import Path\n"
                "Path('prepared').touch()\n"
                "raise SystemExit(int(Path('prepare-exit').read_text()))\n"),
            "scripts/test_runner.py": (
                "import json, os, sys\nfrom pathlib import Path\n"
                "assert Path('prepared').exists()\n"
                "Path('runner-args').write_text(json.dumps(sys.argv[1:]))\n"
                "Path('runner-env').write_text(json.dumps({\n"
                "    'executable': sys.executable, 'pythonpath': os.environ.get('PYTHONPATH'),\n"
                "    'encoding': os.environ.get('PYTHONIOENCODING')}))\n"),
        }, "seed")
        subprocess.run([sys.executable, "-m", "venv", "--without-pip", str(root / ".venv")],
                       check=True, capture_output=True, text=True, encoding="utf-8")
        script = "test.ps1" if os.name == "nt" else "test.sh"
        shutil.copy2(test_environment.ROOT / "scripts" / script, root / "scripts" / script)
        command = ([shell, "-NoProfile", "-File", str(root / "scripts" / script),
                    "-Scope", "checks", "-Base", "branch with space", "-Jobs", "1"]
                   if os.name == "nt" else
                   [shell, str(root / "scripts" / script), "checks", "--base", "branch with space",
                    "--jobs", "1"])
        for code in (3, 0):
            with self.subTest(preparation_exit=code):
                (root / "prepare-exit").write_text(str(code), encoding="utf-8")
                result = subprocess.run(command, cwd=root, capture_output=True, text=True,
                                        encoding="utf-8", check=False)
                self.assertEqual(result.returncode, code, result.stdout + result.stderr)
                if code:
                    self.assertFalse((root / "runner-args").exists())
                else:
                    arguments = json.loads((root / "runner-args").read_text())
                    self.assertEqual(arguments[arguments.index("--base") + 1], "branch with space")
                    self.assertEqual(arguments[arguments.index("--scope") + 1], "checks")
                    # 运行器用本工作树的 venv、只认本工作树的 src，输出按 UTF-8 编码。
                    seen = json.loads((root / "runner-env").read_text())
                    venv_bin = root / ".venv" / ("Scripts" if os.name == "nt" else "bin")
                    self.assertEqual(os.path.realpath(os.path.dirname(seen["executable"])),
                                     os.path.realpath(venv_bin))
                    self.assertEqual(os.path.realpath(seen["pythonpath"]),
                                     os.path.realpath(root / "src"))
                    self.assertEqual(seen["encoding"], "utf-8")

    def test_worktree_environment_cannot_resolve_to_the_production_environment(self):
        # 路径解析也覆盖 Windows junction；不要求运行测试的账户能建立符号链接。
        resolve = Path.resolve
        shared = self.main / ".venv"
        def resolved(path, *args, **kwargs):
            return shared if path == self.worker / ".venv" else resolve(path, *args, **kwargs)
        run = mock.Mock()
        with mock.patch.object(Path, "resolve", resolved):
            with self.assertRaisesRegex(RuntimeError, "主检出"):
                self.prepare(self.worker, run)
        run.assert_not_called()
