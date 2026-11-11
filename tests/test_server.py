"""无桌面入口的进程退出与现有数据保护。"""
import subprocess
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

from peach import server, settings_file


class ServerTests(unittest.TestCase):
    def test_cli_serve_never_trusts_forwarded_headers(self):
        """对外地址由部署侧的端口映射与反代决定，服务的同源判定只认物理连接。"""
        from peach import cli
        with patch.object(cli, "_require_readable_settings"), \
                patch.object(cli, "_serve_token", return_value="test"), \
                patch.object(cli, "create_app"), patch.object(cli, "_run_uvicorn") as run:
            self.assertEqual(cli.main(["serve", "--host", "0.0.0.0", "--port", "8900"]), 0)
        self.assertEqual(run.call_args.kwargs, {"host": "0.0.0.0", "port": 8900, "proxy_headers": False})

    def test_every_served_listener_gets_the_handler_that_can_listen_again(self):
        """客户端在 accept 完成前断开、监听被标准库关掉时，处理器要拿着 uvicorn 的 Server 才能重新监听。"""
        import asyncio
        from peach import cli, error_reporting
        handlers = []
        for arguments in (["serve", "--host", "0.0.0.0"],
                          ["serve", "--host", "0.0.0.0", "--port", "80"]):
            handlers.clear()
            with self.subTest(arguments=arguments), \
                    patch.object(cli, "_require_readable_settings"), \
                    patch.object(cli, "_serve_token", return_value="test"), \
                    patch.object(cli, "create_app"), \
                    patch("uvicorn.Config") as config, patch("uvicorn.Server") as uvicorn_server:
                config.return_value.get_loop_factory.return_value = None
                uvicorn_server.return_value.serve = AsyncMock(
                    side_effect=lambda: handlers.append(asyncio.get_running_loop().get_exception_handler()))
                self.assertEqual(cli.main(arguments), 0)
                handler, = handlers
                self.assertIs(handler.func, error_reporting.asyncio_handler)
                self.assertEqual(handler.keywords, {"uvicorn_server": uvicorn_server.return_value})

    def test_initialization_preserves_existing_configuration(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            config = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(root)})
            settings_file.write(config)
            config.directory('database').mkdir()
            config.directory('database').joinpath('ledger.db').touch()
            existing = config.path.read_bytes()
            with patch.object(server.settings_file, "load_config", return_value=settings_file.load_config(
                    environ={"PEACH_DATA_ROOT": str(root)})), patch.object(server, "launch") as launch:
                launch.return_value.wait.return_value = 0
                server.initialize()
            launch.assert_called_once_with('migrate', 'upgrade', '--yes', '--db', str(config.directory('database') / 'ledger.db'))
            self.assertEqual(config.path.read_bytes(), existing)

    def test_initialization_rejects_database_without_configuration(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            config = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(root)})
            config.directory("database").mkdir()
            config.directory("database").joinpath("ledger.db").write_bytes(b"existing")
            with patch.object(server.settings_file, "load_config", return_value=config), \
                    patch.object(server, "launch") as launch:
                with self.assertRaisesRegex(RuntimeError, "已有数据库"):
                    server.initialize()
            launch.assert_not_called()

    def test_stop_waits_for_child_exit(self):
        process = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(60)"],
                                   stdin=subprocess.DEVNULL)
        try:
            server.stop_process(process)
            self.assertIsNotNone(process.poll())
        finally:
            server.stop_process(process)

    def test_service_failure_exits_supervisor(self):
        with tempfile.TemporaryDirectory() as directory:
            config = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(Path(directory).resolve())})
            process = subprocess.Popen([sys.executable, "-c", "raise SystemExit(17)"],
                                       stdin=subprocess.DEVNULL)
            process.wait(timeout=15)
            with patch.object(server.settings_file, "load_config", return_value=config), \
                    patch.object(server, "launch", return_value=process):
                self.assertEqual(server.supervise("127.0.0.1", 8900, threading.Event()), 17)

    def test_a_fresh_docker_volume_starts_unconfigured_without_init(self):
        with tempfile.TemporaryDirectory() as directory:
            config = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(Path(directory).resolve())})
            with patch.dict(server.os.environ, {"PEACH_DISTRIBUTION": "docker"}), \
                    patch.object(server.settings_file, "load_config", return_value=config), \
                    patch.object(server, "launch") as launch:
                server.initialize()
                launch.assert_not_called()
                self.assertFalse(config.path.exists())
                config.directory("database").mkdir(parents=True)
                config.directory("database").joinpath("ledger.db").write_bytes(b"existing")
                with self.assertRaisesRegex(RuntimeError, "已有数据库"):
                    server.initialize()
            launch.assert_not_called()

    def test_the_setup_service_is_replaced_once_the_settings_file_appears(self):
        from dataclasses import replace
        from unittest.mock import Mock
        with tempfile.TemporaryDirectory() as directory:
            absent = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(Path(directory).resolve())})
            present = replace(absent, present=True)
            state = {"configured": False}
            stopping = threading.Event()
            launched = []

            def start(*arguments):
                launched.append(arguments)
                if len(launched) == 1:
                    state["configured"] = True  # 首次设置提交，设置文件写好了
                else:
                    stopping.set()
                return Mock(poll=Mock(return_value=None))

            with patch.object(server.settings_file, "load_config",
                              side_effect=lambda: present if state["configured"] else absent), \
                    patch.object(server, "launch", side_effect=start):
                self.assertEqual(server.supervise("0.0.0.0", 8900, stopping), 0)
        self.assertEqual([arguments[:2] for arguments in launched], [("serve", "--setup"), ("serve", "--host")])

    def test_access_password_from_the_environment_is_written_once_and_never_echoed(self):
        from peach import access
        with tempfile.TemporaryDirectory() as directory:
            config = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(Path(directory).resolve())})
            path = config.directory("secrets") / "access.json"
            with patch.dict(server.os.environ, {server.ACCESS_PASSWORD_ENV: "short"}):
                message = server.seed_access_password(config)
                self.assertNotIn(server.ACCESS_PASSWORD_ENV, server.os.environ)
            self.assertIn("8–256", message)
            self.assertFalse(path.exists())
            with patch.dict(server.os.environ, {server.ACCESS_PASSWORD_ENV: "container-secret"}):
                message = server.seed_access_password(config)
                self.assertNotIn(server.ACCESS_PASSWORD_ENV, server.os.environ, "不传给服务子进程")
            self.assertNotIn("container-secret", message)
            policy = access.load(path)
            self.assertEqual(policy["mode"], "password")
            self.assertTrue(access.verify(policy, "container-secret"))
            self.assertNotIn("container-secret", path.read_text(encoding="utf-8"))
            with patch.dict(server.os.environ, {server.ACCESS_PASSWORD_ENV: "another-secret"}):
                message = server.seed_access_password(config)
            self.assertIn("忽略", message)
            self.assertNotIn("another-secret", message)
            self.assertEqual(access.load(path)["revision"], policy["revision"])
            with patch.dict(server.os.environ, {}, clear=False):
                server.os.environ.pop(server.ACCESS_PASSWORD_ENV, None)
                self.assertEqual(server.seed_access_password(config), "")
