# -*- coding: utf-8 -*-
"""真浏览器冒烟：临时 Peach 数据根上的一套演示库，交给 `frontend/e2e` 的 playwright-core 用例。

页面源断言守不住布局之后才成立的事实（横向溢出、等待态卡住、控制台报错、失败请求），
靠手动开浏览器逐轮重测既费时又不稳定。Python 这一侧准备数据与服务，Node 那一侧只认
`PEACH_E2E_ORIGIN`、`PEACH_E2E_ITEM` 与 `PEACH_E2E_FFMPEG`；实例带访问口令时另给
`PEACH_E2E_TOKEN`，夹具给每个请求加 `X-Token`，管理接口才不 401。

数据全在临时目录：`scripts/demo_dataset.py` 造 SFW 合成库，短片是 FFmpeg 真编码的片段
（详情页播放器会预加载源，占位字节只会让 `/stream` 返回 503）。馆藏不再落本地，所以
演示库挂在假网盘驱动后面：它按 `DriveProvider` 协议列目录、取条目，播放走 302 到同一个
进程里的小文件服务，带 Range。

每个浏览器文件单独起一次 Node，限时 600 秒，完整 TAP 写进
`build/agent-verification/browser/e2e-<文件名>.tap`；一处红了也接着跑完其余文件，
最后一起报，一轮全量只跑一次就看得见全部失败。并发数按 `PEACH_E2E_CONCURRENCY` 走，
不写时 CI 为 1、本机按 CPU 数推导，测动画中间帧的几个文件始终单独串行。
`PEACH_E2E_ONLY=canonical-routes,catalog-list`（逗号分隔，可带通配）只跑选中的文件。

缺 Node、`playwright-core`、ffmpeg 或本机 Chrome 时本机跳过；CI（`GITHUB_ACTIONS=true`）
判失败。浏览器不另外下载，`PEACH_E2E_CHROME` 可以指定可执行文件。
"""
from __future__ import annotations

import asyncio
import fnmatch
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading
import time
import unittest
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import closing
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
BROWSER_LOGS = ROOT / "build" / "agent-verification" / "browser"
SERVER_START_SECONDS = 60
FILE_SECONDS = 600
#: 浏览器文件的预计秒数，与 CI 浏览器矩阵共用同一份实测；没测过的文件按 30 秒算。
E2E_TIMINGS = ROOT / "scripts" / "ci-browser-timings.json"
E2E_DEFAULT_SECONDS = 30.0
#: 测量动画中间帧与等待态替换的文件：取值时刻经不起别的浏览器抢 CPU，始终串行。
TIMING_SENSITIVE = frozenset({
    "e2e/sidebar-motion.test.ts",
    "e2e/sidebar.test.ts",
    "e2e/design-cards.test.ts",
})

sys.path.insert(0, str(ROOT / "src"))

#: 这套用例的数据根。`PEACH_DATA_ROOT` 必须在 import `peach.config` 之前生效：那个模块在
#: import 期就把设置文件里的目录固化进 `DATABASE_PATH`、`GENERATED_DIR` 等常量。落不到
#: 临时目录，用例就会写进真实的 Peach 数据目录。
DATA_ROOT = Path(tempfile.mkdtemp(prefix="peach-e2e-data-"))
os.environ["PEACH_DATA_ROOT"] = str(DATA_ROOT)
unittest.addModuleCleanup(shutil.rmtree, DATA_ROOT, True)

from peach import api, drive_connections  # noqa: E402
from peach.config import PeachSettings  # noqa: E402
from peach.drive_provider import (  # noqa: E402
    GOOGLE,
    Change,
    DownloadTarget,
    DriveAccount,
    DriveEntry,
    DriveNotFound,
)
from scripts import test_history  # noqa: E402
from support.ledger import fresh_ledger  # noqa: E402

#: 假网盘的扫描起点 id。
ROOT_ID = "e2e-root"
#: 这套实例的访问口令。管理接口（浏览器错误上报等）要有效凭据，而浏览器不会自己带口令；
#: `PEACH_E2E_TOKEN` 让夹具给每个请求加 `X-Token`，与脚本调用 API 的方式一致。
ACCESS_TOKEN = "peach-e2e-token"


def _chrome() -> str:
    explicit = os.environ.get("PEACH_E2E_CHROME")
    if explicit and Path(explicit).exists():
        return explicit
    candidates = (
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        shutil.which("google-chrome") or "",
        shutil.which("chromium") or "",
        shutil.which("microsoft-edge") or "",
    )
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return candidate
    return ""


class _MediaHandler(BaseHTTPRequestHandler):
    """按 Range 发片：播放器要 seek，整段发回去会先卡住再报错。

    文件按 id 现读，不预先读进内存：`blobs` 只放 id 到磁盘路径。"""

    def do_HEAD(self) -> None:  # noqa: N802 - 基类的命名
        self._send(body=False)

    def do_GET(self) -> None:  # noqa: N802
        self._send(body=True)

    def _send(self, *, body: bool) -> None:
        key = self.path.rsplit("/", 1)[-1].split("?")[0]
        path = self.server.blobs.get(key)  # type: ignore[attr-defined]
        if path is None or not path.exists():
            self.send_error(404)
            return
        start, end = 0, path.stat().st_size - 1
        header = self.headers.get("Range") or ""
        if header.startswith("bytes="):
            span = header[len("bytes="):].split(",")[0]
            first, _, last = span.partition("-")
            if first:
                start = int(first)
            if last:
                end = min(int(last), end)
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{path.stat().st_size}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", "video/mp4")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        if not body:
            return
        with path.open("rb") as handle:
            handle.seek(start)
            remaining = end - start + 1
            while remaining > 0:
                chunk = handle.read(min(65536, remaining))
                if not chunk:
                    break
                self.wfile.write(chunk)
                remaining -= len(chunk)

    def log_message(self, *args: object) -> None:
        pass


class FakeDrive:
    """把演示库目录当成一个已授权的 Google Drive 账号。

    只实现扫描与取字节要走的那几个方法：列目录、取条目、给直链、增量、移动。文件内容不进
    内存，取字节时按 id 从磁盘读。"""

    location = GOOGLE
    #: 文件服务的基址，起服务前由驱动填。
    origin = ""

    def __init__(self, media: Path):
        self.account = DriveAccount(GOOGLE, "e2e", "e2e@example.com", "演示账号", ROOT_ID)
        self._entries: dict[str, DriveEntry] = {}
        self._paths: dict[str, Path] = {}
        self._children: dict[str, list[str]] = {}
        self._next = 0
        self._add_folder(ROOT_ID, "演示库", "")
        for item in sorted(media.iterdir()):
            self._add(item, ROOT_ID)

    def _identity(self) -> str:
        self._next += 1
        return f"e2e-{self._next}"

    def _add_folder(self, remote_id: str, name: str, parent: str) -> None:
        self._entries[remote_id] = DriveEntry(remote_id, name, parent, True)
        self._children.setdefault(parent, []).append(remote_id)

    def _add(self, path: Path, parent: str) -> None:
        if path.is_dir():
            remote_id = self._identity()
            self._add_folder(remote_id, path.name, parent)
            for item in sorted(path.iterdir()):
                self._add(item, remote_id)
            return
        if path.suffix.lower() not in (".mp4", ".m4v", ".webm"):
            return
        remote_id = self._identity()
        stat = path.stat()
        entry = DriveEntry(remote_id, path.name, parent, False, size=stat.st_size,
                           modified=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(stat.st_mtime)),
                           mime="video/mp4", duration=2.0, width=320, height=240)
        self._entries[remote_id] = entry
        self._paths[remote_id] = path
        self._children.setdefault(parent, []).append(remote_id)

    def list_folder(self, parent_id: str, cursor: str | None = None):
        return [self._entries[remote_id] for remote_id in self._children.get(parent_id, [])], None

    def entry(self, remote_id: str) -> DriveEntry:
        entry = self._entries.get(remote_id)
        if entry is None:
            raise DriveNotFound(remote_id)
        return entry

    def download_target(self, remote_id: str) -> DownloadTarget:
        self.entry(remote_id)
        return DownloadTarget("redirect", f"{self.origin}/media/{remote_id}")

    def move(self, remote_id: str, parent_id: str, name: str | None = None) -> DriveEntry:
        entry = self.entry(remote_id)
        moved = DriveEntry(remote_id, name or entry.name, parent_id, entry.folder, entry.size,
                           entry.modified, entry.mime, entry.duration, entry.width, entry.height)
        self._children.get(entry.parent_id, []).remove(remote_id)
        self._entries[remote_id] = moved
        self._children.setdefault(parent_id, []).append(remote_id)
        return moved

    def changes(self, cursor: str | None):
        return [Change(remote_id, removed=False, entry=entry) for remote_id, entry in self._entries.items()], "e2e-cursor"

    def media_paths(self) -> dict[str, Path]:
        """文件服务要发的 id → 磁盘路径。"""
        return dict(self._paths)


class _Served:
    """uvicorn 在线程里跑的实例。端口交给系统分配，起监听后再问它要实际端口。"""

    def __init__(self, app):
        import uvicorn

        self._config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="warning",
                                      access_log=False)
        self.server = uvicorn.Server(self._config)
        self.thread = threading.Thread(target=self.server.run, daemon=True)

    def __enter__(self) -> str:
        self.thread.start()
        deadline = time.monotonic() + SERVER_START_SECONDS
        while time.monotonic() < deadline:
            if self.server.started:
                port = self.server.servers[0].sockets[0].getsockname()[1]
                return f"http://127.0.0.1:{port}"
            time.sleep(0.05)
        raise RuntimeError(f"Peach 没能在 {SERVER_START_SECONDS} 秒内起监听")

    def __exit__(self, *exc: object) -> None:
        self.server.should_exit = True
        self.thread.join(timeout=20)


def suite_files() -> tuple[str, ...]:
    """`frontend/e2e` 下由 WebE2ETests 起的浏览器文件，按路径排序。

    `setup.test.ts` 只在首启服务上跑；这里没有那套服务，文件会整组 skip，
    没有 `# pass` 行，不能混进成功判据。
    """
    return tuple(sorted(path.relative_to(FRONTEND).as_posix()
                        for path in (FRONTEND / "e2e").rglob("*.test.ts")
                        if path.name != "setup.test.ts"))


def selected_files(only: str) -> tuple[str, ...]:
    """`PEACH_E2E_ONLY` 的逗号清单（可带通配）换成文件；空清单就是全套。"""
    files = suite_files()
    terms = [term.strip() for term in only.split(",") if term.strip()]
    if not terms:
        return files
    picked: list[str] = []
    for term in terms:
        name = term.removeprefix("e2e/")
        literal = name if name.endswith(".test.ts") else f"{name}.test.ts"
        matched = [path for path in files if path == f"e2e/{literal}"]
        if not matched and "*" in literal:
            matched = [path for path in files if fnmatch.fnmatchcase(path.removeprefix("e2e/"), literal)]
        if not matched:
            raise SystemExit(f"PEACH_E2E_ONLY 里的 {term} 没有对上任何用例")
        picked.extend(path for path in matched if path not in picked)
    return tuple(path for path in files if path in picked)


def concurrency() -> int:
    """同时跑几个浏览器文件：`PEACH_E2E_CONCURRENCY` 优先，CI 为 1，本机按 CPU 数推导、上限 4。"""
    override = os.environ.get("PEACH_E2E_CONCURRENCY", "").strip()
    if override:
        if not override.isdecimal() or int(override) < 1:
            raise SystemExit("PEACH_E2E_CONCURRENCY 必须是正整数")
        return int(override)
    if os.environ.get("GITHUB_ACTIONS") == "true":
        return 1
    return max(1, min(4, (os.cpu_count() or 1) // 4))


def expected_seconds() -> dict[str, float]:
    """`frontend/e2e/x.test.ts` → 实测秒数；表缺失时为空，按默认值排队。"""
    try:
        seconds = json.loads(E2E_TIMINGS.read_text(encoding="utf-8"))["seconds"]
    except (OSError, ValueError, KeyError, TypeError):
        return {}
    return {name.removeprefix("frontend/"): float(value) for name, value in seconds.items()}


def pools(files: tuple[str, ...], lanes: int) -> tuple[tuple[tuple[str, ...], int], ...]:
    """排成依次执行的池：并发池先长后短排，测动画中间帧的文件在它之后单独串行。

    并发为 1 时按设计决定、交互回归、路由冒烟的顺序逐个执行，失败信息读起来有次序。"""
    if lanes == 1:
        design = tuple(path for path in files if path.startswith("e2e/design-"))
        routes = tuple(path for path in files if path == "e2e/smoke.test.ts")
        rest = tuple(path for path in files if path not in design + routes)
        return ((design + rest + routes, 1),)
    seconds = expected_seconds()
    sensitive = tuple(path for path in files if path in TIMING_SENSITIVE)
    shared = tuple(sorted((path for path in files if path not in sensitive),
                         key=lambda path: (-seconds.get(path, E2E_DEFAULT_SECONDS), path)))
    return tuple((group, count) for group, count in ((shared, lanes), (sensitive, 1)) if group)


def log_name(path: str) -> str:
    """`e2e/nested/feature.test.ts` → `e2e-nested-feature.tap`。"""
    return "e2e-" + path.removeprefix("e2e/").removesuffix(".test.ts").replace("/", "-") + ".tap"


@unittest.skipUnless(os.environ.get("PEACH_E2E") == "1",
                     "浏览器套件要显式开启：PEACH_E2E=1")
@unittest.skipUnless((FRONTEND / "node_modules" / "playwright-core").exists(),
                     "前端依赖没装，跑不了真浏览器用例")
class WebE2ETests(unittest.TestCase):
    """起一套临时实例，逐个文件跑 `frontend/e2e`。"""

    @classmethod
    def setUpClass(cls) -> None:
        chrome = _chrome()
        if not chrome:
            if os.environ.get("GITHUB_ACTIONS"):
                raise RuntimeError("PEACH_E2E_CHROME 未设置，也找不到本机 Chrome")
            raise unittest.SkipTest("本机没有 Chrome，跳真浏览器用例")
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            raise unittest.SkipTest("本机没有 ffmpeg，造不出能解码的演示短片")
        cls.chrome, cls.ffmpeg = chrome, ffmpeg
        cls.root = DATA_ROOT
        media = cls.root / "demo"
        subprocess.run([sys.executable, "-X", "utf8", str(ROOT / "scripts" / "demo_dataset.py"),
                        "--output", str(media), "--count", "12", "--art", "synthetic",
                        "--video", "ffmpeg", "--duration", "2", "--ffmpeg", ffmpeg],
                       check=True, capture_output=True)
        cls.drive = FakeDrive(media)
        handler = type("Handler", (_MediaHandler,), {})
        cls.media_server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.media_server.blobs = cls.drive.media_paths()  # type: ignore[attr-defined]
        threading.Thread(target=cls.media_server.serve_forever, daemon=True).start()
        cls.addClassCleanup(cls.media_server.shutdown)
        cls.drive.origin = f"http://127.0.0.1:{cls.media_server.server_address[1]}"
        # 账本必须落在 `<数据根>/database/ledger.db`：处理链按数据根拼这个路径，
        # 换到别处就报「当前馆藏与媒体配置不一致」。
        (cls.root / "database").mkdir(parents=True, exist_ok=True)
        cls.db = fresh_ledger(cls.root / "database")
        # 有设置文件（`present`）配置页才不是「请先完成首次设置」，扫描起点也只从这里读。
        (cls.root / "config.toml").write_text(
            "[drive.accounts.gdrive]\n"
            'client_id = "e2e-client"\n'
            'client_secret = "e2e-secret"\n\n'
            "[drive.roots]\n"
            f'gdrive = "{ROOT_ID}"\n', encoding="utf-8")
        # 账本结构落后于程序时，服务起监听也会把依赖账本的后台任务整个停掉（日志里是
        # 「数据库未就绪…结构：pending」），页面因此永远等不到热好的聚合。迁移走发布时
        # 那条命令行，让这套用例跑在用户升级之后的那份结构上。
        subprocess.run([sys.executable, "-m", "peach", "migrate", "upgrade",
                        "--db", str(cls.db), "--yes"],
                       check=True, capture_output=True, cwd=ROOT,
                       env={**os.environ, "PYTHONPATH": os.pathsep.join(
                           [str(ROOT / "src"), os.environ.get("PYTHONPATH", "")])})
        # 首启导览已移除，页面本身不再需要遮罩处理。
        # 生成的根目录用 `PeachSettings` 的默认值（数据根下的 `generated/*`）：处理链按
        # `config.directory('generated')` 写预览图，接口只认落在 `snapshot_root` 之下的路径，
        # 两边不一致时卡片恒显示「预览未取得」。
        settings = PeachSettings(
            db_path=cls.db, host="127.0.0.1", port=0, token=ACCESS_TOKEN, configured=True,
            drive_public_url=cls.drive.origin,
            drive_clients={GOOGLE: ("e2e-client", "e2e-secret")},
            drive_roots={GOOGLE: (ROOT_ID,)},
        )
        with mock.patch.object(drive_connections, "build_google", lambda *a, **k: cls.drive):
            cls.app = api.create_app(settings)
        # 定时重扫关掉：假网盘每轮增量都把整棵树当「有变更」报回来，改写账本会顶掉缓存的
        # 聚合，用例读到的是热完又冷掉的中间态。要的种子数据由下面这一次全量扫描给。
        async def _idle(stop: asyncio.Event) -> None:
            await stop.wait()

        cls.app.state.drive_sync.run = _idle  # type: ignore[method-assign]
        cls.app.state.scan.full_sync(GOOGLE)
        cls.served = _Served(cls.app)
        cls.origin = cls.served.__enter__()
        cls.addClassCleanup(cls.served.__exit__, None, None, None)
        deadline = time.monotonic() + SERVER_START_SECONDS
        while time.monotonic() < deadline:
            try:
                with urllib.request.urlopen(f"{cls.origin}/healthz", timeout=2) as response:
                    if response.status == 200:
                        break
            except OSError:
                time.sleep(0.1)
        else:
            raise RuntimeError(f"Peach 起来后 /healthz 不是 200：{cls.origin}")
        with closing(sqlite3.connect(cls.db)) as connection:
            row = connection.execute(
                "SELECT id FROM asset WHERE medium='video' ORDER BY id LIMIT 1").fetchone()
        if row is None:
            raise RuntimeError("演示库扫描之后数据库里没有视频")
        cls.item = row[0]

    def test_every_browser_file_passes(self) -> None:
        """`PEACH_E2E_ONLY` 收窄到指定文件，默认整套；一处的失败不影响其余文件跑完。"""
        only = os.environ.get("PEACH_E2E_ONLY", "").strip()
        files = selected_files(only)
        lanes = concurrency()
        env = {**os.environ, "PEACH_E2E_ORIGIN": self.origin, "PEACH_E2E_ITEM": str(self.item),
               "PEACH_E2E_FFMPEG": self.ffmpeg, "PEACH_E2E_CHROME": self.chrome,
               "PEACH_E2E_TOKEN": ACCESS_TOKEN}
        env.pop("PEACH_E2E_FILES", None)
        BROWSER_LOGS.mkdir(parents=True, exist_ok=True)
        for stale in BROWSER_LOGS.glob("e2e-*.tap"):
            stale.unlink()
        self.addClassCleanup(lambda: None)
        started = time.monotonic()
        failures: list[str] = []
        finished = 0
        for group, count in pools(files, lanes):
            print(f"浏览器文件 {len(group)} 个、同时 {count} 个：{', '.join(group)}", flush=True)
            with ThreadPoolExecutor(max_workers=count) as pool:
                running = [pool.submit(self._run_file, env, path) for path in group]
                for done in as_completed(running):
                    path, seconds, failure = done.result()
                    finished += 1
                    print(f"浏览器文件 {finished}/{len(files)} {'失败' if failure else '通过'}"
                          f"（{seconds:.1f}s）：{path}", flush=True)
                    if failure:
                        failures.append(failure)
        elapsed = time.monotonic() - started
        print(f"浏览器文件 {len(files)} 个跑完，耗时 {elapsed:.0f} 秒；失败 {len(failures)} 个", flush=True)
        if failures:
            self.fail("\n\n".join(failures))

    def _run_file(self, env: dict, path: str) -> tuple[str, float, str | None]:
        """单独起一次 Node 跑一个浏览器文件，完整 TAP 写到它自己的日志；返回失败说明或 None。"""
        log = BROWSER_LOGS / log_name(path)
        started = time.monotonic()
        command = [shutil.which("node") or "node", "--test", "--test-concurrency=1",
                   "--test-reporter=tap", path]
        try:
            completed = subprocess.run(command, cwd=FRONTEND, env=env, timeout=FILE_SECONDS,
                                       capture_output=True, text=True, encoding="utf-8",
                                       errors="replace")
        except subprocess.TimeoutExpired as expired:
            partial = expired.stdout or ""
            if isinstance(partial, bytes):
                partial = partial.decode("utf-8", errors="replace")
            log.write_text(partial, encoding="utf-8")
            return path, time.monotonic() - started, (
                f"{path} 在 {FILE_SECONDS} 秒内没跑完，完整日志：{log}\n{partial[-4000:]}")
        output = f"{completed.stdout}\n{completed.stderr}"
        log.write_text(output, encoding="utf-8")
        success = (completed.returncode == 0 and re.search(r"# pass [1-9]\d*", output) is not None
                   and re.search(r"# fail 0\b", output) is not None)
        test_history.record_external(test_history.tap_rows(path, completed.stdout))
        test_history.record_external(
            [test_history.file_result("e2e", path, bool(success), time.monotonic() - started)])
        if success:
            return path, time.monotonic() - started, None
        not_ok = [line.strip() for line in completed.stdout.splitlines()
                  if line.startswith("not ok ") or line.startswith("    not ok ")]
        return path, time.monotonic() - started, (
            f"{path} 退出码 {completed.returncode}，日志：{log}\n"
            + "\n".join(not_ok[:40]) + "\n" + output[-6000:])


if __name__ == "__main__":
    unittest.main()
