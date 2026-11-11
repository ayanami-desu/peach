import asyncio
import importlib.util
import sqlite3
import tempfile
import threading
import unittest
from contextlib import asynccontextmanager, closing
from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

from support.ledger import fresh_ledger


ROOT = Path(__file__).resolve().parents[1]


class MediaResponseSecurityTests(unittest.IsolatedAsyncioTestCase):
    async def test_media_policy_clears_only_old_cache_once_and_isolates_images(self):
        from starlette.applications import Starlette
        from starlette.responses import HTMLResponse, Response
        from starlette.routing import Route
        from peach.api import ResponseHeadersMiddleware
        from peach.routes_media import _image_response
        import httpx

        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'image.svg'
            path.write_text('<svg xmlns="http://www.w3.org/2000/svg"/>',encoding='utf-8')
            async def endpoint(request):
                if request.url.path=='/page':
                    return HTMLResponse('<html>test</html>')
                if request.url.path=='/image':
                    return _image_response(request,path,'image/svg+xml')
                return Response(status_code=204)
            app=ResponseHeadersMiddleware(Starlette(routes=[Route('/{path}',endpoint)]))
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='https://test') as client:
                client.cookies.set('peach_session','keep')
                first=await client.get('/page')
                self.assertEqual(first.headers['clear-site-data'],'"cache"')
                self.assertIn('httponly',first.headers['set-cookie'].lower())
                second=await client.get('/page')
                self.assertNotIn('clear-site-data',second.headers)
                self.assertEqual(client.cookies.get('peach_session'),'keep')
                image=await client.get('/image')
                cached=await client.get('/image',headers={'If-None-Match':image.headers['etag']})
                self.assertEqual(cached.status_code,304)
                for response in (image,cached):
                    self.assertIn('sandbox',response.headers['content-security-policy'])
                    self.assertEqual(response.headers['x-content-type-options'],'nosniff')


HAS_DEPS = all(importlib.util.find_spec(name) for name in ("fastapi", "httpx"))
if HAS_DEPS:
    import httpx
    from fastapi.routing import APIRoute
    from starlette.routing import Mount
    from peach import access
    from peach import routes_auth
    from peach.api import create_app
    from peach.config import PeachSettings
    from peach.media import MediaEngine


BASE_SCHEMA = """
CREATE TABLE asset(
  id INTEGER PRIMARY KEY, location TEXT NOT NULL, path TEXT NOT NULL, name TEXT,
  medium TEXT, size INTEGER, creator TEXT, studio TEXT, series TEXT, code TEXT, release_date TEXT,
  catalog_title TEXT, original_title TEXT,
  duration REAL, width INTEGER, height INTEGER, ctx_length TEXT, ctx_orient TEXT,
  ctx_quality TEXT, play_count INTEGER DEFAULT 0, last_played TEXT, rating INTEGER,
  o_count INTEGER, watch_ratio REAL, stash_scene_id INTEGER, snapshot_path TEXT, first_seen TEXT,
  feedback TEXT, disposal TEXT, disposal_reason TEXT, leave_ratio REAL, play_seconds REAL,
  feedback_at REAL, seek_count INTEGER, max_reached REAL,
  field_owners TEXT, mutation_revision INTEGER NOT NULL DEFAULT 0, region TEXT,
  UNIQUE(location,path));
CREATE TABLE asset_tag(asset_id INTEGER,tag TEXT,confidence REAL DEFAULT 1.0,source TEXT,
                       UNIQUE(asset_id,tag));
CREATE TABLE entity(
  id INTEGER PRIMARY KEY,kind TEXT,canonical_name TEXT,normalized_name TEXT,
  metadata_json TEXT DEFAULT '{}',created_at TEXT,updated_at TEXT,region TEXT,
  UNIQUE(kind,normalized_name));
CREATE TABLE entity_redirect(old_id INTEGER PRIMARY KEY,target_id INTEGER,source TEXT,merged_at TEXT);
CREATE TABLE entity_alias(
  entity_id INTEGER,alias TEXT,normalized_alias TEXT,source TEXT,confidence REAL DEFAULT 1.0);
CREATE TABLE entity_external_ref(
  entity_id INTEGER,provider TEXT,external_kind TEXT,external_id TEXT,
  metadata_json TEXT DEFAULT '{}',last_synced_at TEXT);
CREATE TABLE entity_link(
  id INTEGER PRIMARY KEY,entity_id INTEGER,link_kind TEXT,label TEXT,url TEXT,
  hostname TEXT,is_sensitive INTEGER DEFAULT 0,metadata_json TEXT DEFAULT '{}',
  created_at TEXT,updated_at TEXT);
CREATE TABLE entity_search_term(
  entity_id INTEGER,term TEXT,purpose TEXT,source TEXT,created_at TEXT);
CREATE TABLE asset_entity(
  asset_id INTEGER,entity_id INTEGER,role TEXT,source TEXT,confidence REAL,
  metadata_json TEXT DEFAULT '{}',first_seen_at TEXT,last_seen_at TEXT,
  UNIQUE(asset_id,entity_id,role,source));
CREATE TABLE entity_membership(
  member_id INTEGER PRIMARY KEY,agency_id INTEGER,source TEXT,
  confidence REAL DEFAULT 1.0,checked_at TEXT);
CREATE TABLE label_maker(
  label_id INTEGER PRIMARY KEY,maker_id INTEGER,source TEXT,
  confidence REAL DEFAULT 1.0,checked_at TEXT);
CREATE TABLE performer_profile(entity_id INTEGER PRIMARY KEY,source TEXT,
  raw_json TEXT DEFAULT '{}',tags_json TEXT DEFAULT '[]',source_url TEXT DEFAULT '');
CREATE TABLE watch_queue(profile_id TEXT,asset_id INTEGER,added_at TEXT,source TEXT,
  PRIMARY KEY(profile_id,asset_id));
CREATE TABLE playlist(
  id INTEGER PRIMARY KEY,profile_id TEXT,name TEXT,source_kind TEXT,
  source_seed_asset_id INTEGER,current_asset_id INTEGER,created_at TEXT,updated_at TEXT);
CREATE TABLE playlist_item(
  playlist_id INTEGER,asset_id INTEGER,position INTEGER,added_at TEXT,
  PRIMARY KEY(playlist_id,asset_id),UNIQUE(playlist_id,position));
CREATE TABLE asset_preference(profile_id TEXT,asset_id INTEGER,liked INTEGER,reason TEXT,
  source TEXT,updated_at TEXT,PRIMARY KEY(profile_id,asset_id));
CREATE TABLE asset_quality_goal(profile_id TEXT,asset_id INTEGER,wanted INTEGER,reason TEXT,
  updated_at TEXT,PRIMARY KEY(profile_id,asset_id));
CREATE TABLE asset_tag_preference(profile_id TEXT,asset_id INTEGER,normalized_tag TEXT,
  hidden INTEGER,updated_at TEXT,PRIMARY KEY(profile_id,asset_id,normalized_tag));
CREATE TABLE media_binding(
  asset_id INTEGER,backend TEXT,external_id TEXT,metadata_json TEXT,last_synced_at TEXT,
  PRIMARY KEY(asset_id,backend),UNIQUE(backend,external_id));
CREATE TABLE activity_event(id INTEGER PRIMARY KEY,asset_id INTEGER,kind TEXT,created_at TEXT);
CREATE TABLE asset_subtitle(
  id INTEGER PRIMARY KEY,asset_id INTEGER,location TEXT NOT NULL,path TEXT NOT NULL,
  name TEXT NOT NULL,language TEXT NOT NULL DEFAULT '',format TEXT NOT NULL,
  size INTEGER,mtime TEXT,pairing TEXT NOT NULL,first_seen TEXT NOT NULL,last_seen TEXT NOT NULL,
  UNIQUE(location,path));
CREATE TABLE search_history(
  query TEXT PRIMARY KEY, used_count INTEGER NOT NULL DEFAULT 1, last_used_at TEXT NOT NULL);
CREATE TABLE review_decision(
  category TEXT NOT NULL,item_key TEXT NOT NULL,status TEXT NOT NULL,
  reviewer TEXT NOT NULL DEFAULT 'local-default',note TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL,
  PRIMARY KEY(category,item_key));
CREATE TABLE download_task(
  id INTEGER PRIMARY KEY, code TEXT, state TEXT NOT NULL, ledger_path TEXT, asset_id INTEGER,
  display_name TEXT NOT NULL DEFAULT '', remote_name TEXT);
CREATE TABLE genre_decision(
  source_genre TEXT PRIMARY KEY, raw_genre TEXT NOT NULL, peach_tag TEXT, decided_at TEXT NOT NULL,
  CHECK(peach_tag IS NULL OR length(trim(peach_tag))>0));
CREATE TABLE profile(
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, is_default INTEGER NOT NULL DEFAULT 0,
  settings_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
INSERT INTO profile(id,user_id,name,is_default,settings_json,created_at,updated_at)
VALUES('local-default','local','Default',1,'{}','2026-08-14T12:17:23Z','2026-08-14T12:17:23Z');
"""


def tiny_jpeg(tone: int, width: int = 64, height: int = 48) -> bytes:
    """一张真的能解开的小图。

    题材圆标那条路径会把取回的封面解开缩一次，喂假字节只能让 OpenCV 在测试输出里
    刷一屏解码错误——那时验的也不再是这段代码。
    """
    import cv2
    import numpy

    canvas = numpy.full((height, width, 3), tone, dtype=numpy.uint8)
    return bytes(cv2.imencode(".jpg", canvas)[1])


class MediaCacheHeaderTests(unittest.TestCase):
    """生成物的缓存时长只许在一处写死。

    这条断言扫的是媒体路由真正所在的模块。钉死扫 `api.py` 的话，媒体路由拆到
    `routes_media.py` 之后它会永远绿——那里已经一条媒体路由都没有了。门槛跟着
    实现走，不跟着文件名走。
    """

    def test_no_media_endpoint_hardcodes_a_day(self):
        source = (ROOT / "src" / "peach" / "routes_media.py").read_text(encoding="utf-8")
        self.assertIn("MEDIA_CACHE_SECONDS", source, "媒体路由不在这个文件里了，门槛已空转")
        self.assertNotIn("max-age=86400", source, "媒体端点不该再写死一天")
        # `immutable` 只许出现在 /vendor/ 那条中间件里，它留在 api.py。这里不查
        # 字面量：常量上方那段注释正是在解释「为什么不加 immutable」。
        self.assertNotIn('"public, max-age=31536000, immutable"', source)


@unittest.skipUnless(HAS_DEPS, "FastAPI/httpx 尚未安装")
class ContractJsonTests(unittest.TestCase):
    def test_contract_reads_encode_to_the_same_bytes_as_the_framework_default(self):
        from dataclasses import dataclass
        from datetime import datetime, timezone
        from fastapi.encoders import jsonable_encoder
        from fastapi.responses import JSONResponse
        from peach.routes_api import _json

        @dataclass
        class Point:
            x: int

        payload = {"ok": True, 3: "整数键", "path": Path("covers") / "ABC-001.jpg",
                   "at": datetime(2026, 11, 6, 4, 0, tzinfo=timezone.utc), "set": {"甲"},
                   "tuple": (1, 2.5, None), "point": Point(4), "nested": [{"名": "值"}]}
        response = _json(payload)
        self.assertEqual(response.body, JSONResponse(jsonable_encoder(payload)).body)
        self.assertEqual(response.media_type, "application/json")
        with self.assertRaises(ValueError):
            _json({"nan": float("nan")})

    def test_contract_reads_preserve_framework_encoding_for_non_string_keys(self):
        from datetime import date
        from enum import Enum
        from fastapi.encoders import jsonable_encoder
        from fastapi.responses import JSONResponse
        from peach.routes_api import _json

        class Key(Enum):
            DAY = "day"

        payload = {date(2026, 11, 6): {Path("covers"): {Key.DAY: "今天"}}}
        self.assertEqual(_json(payload).body, JSONResponse(jsonable_encoder(payload)).body)


@unittest.skipUnless(HAS_DEPS, "FastAPI/httpx 尚未安装")
class RobotsTests(unittest.IsolatedAsyncioTestCase):
    """整站不进搜索引擎。

    响应头覆盖每一个响应，`/robots.txt` 与两页 `<meta>` 覆盖爬虫会主动去读的位置。
    公网入口一开，这个站就在互联网上，收录了就再也收不回来，所以不按部署开关。
    """

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        root = Path(cls.tmp.name).resolve()
        # 账本要真的建出来：`/api/items` 走只读连接（`mode=ro`），文件不存在就打不开，
        # 响应变成 500 并往日志里吐一整段回溯，用例却因为响应头照样在而通过。
        cls.app = create_app(PeachSettings(
            configured=True, db_path=fresh_ledger(root), follow_state_root=root / "state"))

    @classmethod
    def tearDownClass(cls):
        cls.app.state.http_transport.close()
        cls.tmp.cleanup()

    def client(self):
        return httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app), base_url="http://testserver")

    async def test_robots_txt_is_readable_without_signing_in(self):
        async with self.client() as client:
            response = await client.get("/robots.txt")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text, "User-agent: *\nDisallow: /\n")

    async def test_every_response_carries_the_robots_header(self):
        async with self.client() as client:
            for path in ("/robots.txt", "/healthz", "/login", "/favicon.ico", "/api/items"):
                with self.subTest(path=path):
                    response = await client.get(path)
                    self.assertLess(response.status_code, 500,
                                    "夹具坏了也带着响应头，5xx 说明测的不是正常响应")
                    self.assertEqual(
                        response.headers["x-robots-tag"], "noindex, nofollow, noarchive")

    def test_the_login_page_and_the_app_shell_declare_noindex(self):
        # 这份服务没有口令，`/login` 会直接跳回首页；声明本身在页面源里。
        self.assertIn('<meta name="robots" content="noindex, nofollow">',
                      routes_auth.login_html("/"))
        shell = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        self.assertIn('<meta name="robots" content="noindex, nofollow">', shell)


PAGE_HTML = """<!doctype html>
<html lang="zh"><head><meta charset="utf-8"><title>Peach test</title></head>
<body><main>ready</main></body></html>
"""

PNG_BYTES = bytes.fromhex("89504e470d0a1a0a0000000d4948445200000001000000010806000000"
                          "1f15c4890000000a49444154789c6300010000050001")


class FakeStreamer:
    """网盘侧的替身：按 `drive_stream` 的代理分支回 206 分片，不连网络。

    `/stream` 的口径只剩标准 HTTP Range（ADR-0157），所以替身只要认 content-range
    就能把路由和 `MediaEngine` 之间的契约钉住。
    """

    def __init__(self, body: bytes = bytes(range(32)) * 8) -> None:
        self.body = body
        self.calls: list[tuple] = []

    def open(self, location: str, remote_id: str):
        self.calls.append(("open", location, remote_id))
        return httpx.Response(200, content=self.body)

    def read(self, location: str, remote_id: str, offset: int, length: int, timeout: float = 60):
        self.calls.append(("read", location, remote_id, offset, length))
        return self.body[offset:offset + length]

    def input_url(self, location: str, remote_id: str) -> str:
        return f"{location}://{remote_id}"

    def response(self, request, location: str, remote_id: str, mime_type: str, *, download: bool = False):
        from starlette.responses import Response

        self.calls.append(("response", location, remote_id, mime_type, download))
        start, last = self.bounds(request.headers.get("range"), len(self.body))
        return Response(self.body[start:last + 1], status_code=206, media_type=mime_type,
                        headers={"content-range": f"bytes {start}-{last}/{len(self.body)}",
                                 "accept-ranges": "bytes"})

    def bounds(self, header: str | None, size: int) -> tuple[int, int]:
        if not header or not header.startswith("bytes="):
            return 0, size - 1
        first, _, last = header[len("bytes="):].partition("-")
        start = int(first)
        end = int(last) if last else size - 1
        return start, min(end, size - 1)


class FastApiContractTests(unittest.IsolatedAsyncioTestCase):
    """HTTP 契约：直连网盘的装配下，路由该怎么答就怎么答。"""

    async def asyncSetUp(self) -> None:
        from peach import settings_file

        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

        self.web_root = self.root / "web"
        (self.web_root / "dist").mkdir(parents=True)
        (self.web_root / "index.html").write_text(PAGE_HTML, encoding="utf-8")
        # `/app.css` 是把 `web/css/` 的分区拼一份，`/board.css` 与 index.html 同目录。
        (self.web_root / "css").mkdir()
        (self.web_root / "css" / "10-base.css").write_text("body{margin:0;}", encoding="utf-8")
        (self.web_root / "board.css").write_text(".board{margin:0;}", encoding="utf-8")
        for name in ("peach-app.js", "peach-app.css", "peach-pages.js", "peach-pages.css"):
            (self.web_root / "dist" / name).write_text(f"/* {name} */", encoding="utf-8")

        self.vendor_root = self.root / "vendor"
        (self.vendor_root / "inter" / "5.3.0").mkdir(parents=True)
        (self.vendor_root / "inter" / "5.3.0" / "index.css").write_text(".x{}", encoding="utf-8")
        (self.vendor_root / "player.js").write_text("window.vendorReady=true;", encoding="utf-8")

        self.snapshot_root = self._directory("snapshots")
        self.poster_root = self._directory("posters")
        self.timeline_root = self._directory("timelines")
        self.avatar_root = self._directory("avatars")
        self.logo_root = self._directory("logos")
        self.cover_root = self._directory("covers")
        self.photo_root = self._directory("photos")
        self.candidate_root = self._directory("candidates")
        self.secrets_root = self._directory("secrets")
        self.follow_state_root = self._directory("follow-state")
        self.entry_links_root = self._directory("entry-links")

        self.access_path = self.root / "access.json"
        access.save(self.access_path, "entry-password")

        (self.root / "agentation.js").write_text("// agentation", encoding="utf-8")

        # 设置文件是另一条读路径（`/api/libraries`、`/api/configuration`、网盘都读它），
        # 测试里必须换成临时配置，否则会读到真机器上的 Peach 数据目录。
        self.data_root = self.root / "peach-data"
        for key in ("database", "generated", "sources", "state", "secrets", "logs", "tools", "review"):
            (self.data_root / key).mkdir(parents=True, exist_ok=True)
        self.config_path = self.data_root / "config.toml"
        self.config_path.write_text('[drive]\npublic_url = ""\n', encoding="utf-8")
        self.config = replace(
            settings_file.load_config(self.root, {"PEACH_DATA_ROOT": str(self.data_root)}),
            library_catalog={"gdrive:root-1": {"name": "Google Drive"}},
            drive_roots={"gdrive": ("root-1",)},
        )
        for target, attribute, value in (
            (settings_file, "active", lambda: self.config),
            (settings_file, "load_config", lambda *a, **k: self.config),
        ):
            patcher = patch.object(target, attribute, value)
            patcher.start()
            self.addCleanup(patcher.stop)
        settings_file.reset_cache()

        self.defaults = dict(
            configured=True,
            token="secret",
            access_path=self.access_path,
            db_path=fresh_ledger(self.root, "ledger.db"),
            page_path=self.web_root / "index.html",
            vendor_path=self.vendor_root,
            agentation_path=self.root / "agentation.js",
            snapshot_root=self.snapshot_root,
            poster_root=self.poster_root,
            timeline_root=self.timeline_root,
            avatar_root=self.avatar_root,
            logo_root=self.logo_root,
            cover_root=self.cover_root,
            photo_root=self.photo_root,
            candidate_root=self.candidate_root,
            secrets_root=self.secrets_root,
            follow_state_root=self.follow_state_root,
            entry_links_root=self.entry_links_root,
        )
        self.settings = PeachSettings(**self.defaults)
        self._write_ledger(self.settings.db_path)
        self.app, self.client = await self.start()

        # `/stream` 只走网盘，替身接管掉所有出网请求。
        self.streamer = FakeStreamer()
        self.app.state.media_engine = MediaEngine(self.app.state.repository, self.streamer,
                                                  cache_root=self.root / "media-cache")

    # -- 夹具 ---------------------------------------------------------------

    def _directory(self, name: str) -> Path:
        path = self.root / name
        path.mkdir(parents=True, exist_ok=True)
        return path

    def _write_ledger(self, path: Path) -> None:
        snapshot = (self.snapshot_root / "cloud" / "local" / "one.jpg").resolve()
        snapshot.parent.mkdir(parents=True)
        snapshot.write_bytes(tiny_jpeg(40))
        with sqlite3.connect(path) as connection:
            connection.executemany(
                "INSERT INTO asset(id, location, path, name, medium, duration, size,"
                " remote_id, drive_root, snapshot_path) VALUES(?,?,?,?,?,?,?,?,?,?)",
                [
                    (1, "gdrive", "gdrive:/Media/one.mp4", "one.mp4", "video", 95.0, 256,
                     "file-1", "root-1", str(snapshot)),
                    (2, "gdrive", "gdrive:/Media/two.mkv", "two.mkv", "video", 30.0, 64,
                     "file-2", "root-1", ""),
                    (3, "onedrive", "onedrive:/Media/three.mp4", "three.mp4", "video", 12.0, 32,
                     None, "root-2", ""),
                ],
            )
            connection.commit()

    async def start(self, **overrides):
        """再起一套装配。换网盘凭据、换设置面时用它，不动主夹具。"""
        options = dict(self.defaults)
        options.update(overrides)
        app = create_app(PeachSettings(**options))
        self.addCleanup(app.state.http_transport.close)
        client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")
        self.addAsyncCleanup(client.aclose)
        return app, client

    async def browser(self, password: str = "entry-password"):
        """带会话 cookie 的浏览器，不影响主客户端的匿名身份。"""
        client = httpx.AsyncClient(transport=httpx.ASGITransport(app=self.app), base_url="http://test")
        self.addAsyncCleanup(client.aclose)
        answer = await client.post("/login", data={"token": password, "next": "/"})
        self.assertLess(answer.status_code, 400, answer.text)
        return client

    def remember_poster(self, asset_id: int = 1, cell: int = 4, tone: int = 90) -> Path:
        from peach import artifact_rules, upgrade_rules

        path = self.poster_root / f"{asset_id}_{cell}.jpg"
        path.write_bytes(tiny_jpeg(tone))
        artifact_rules.remember(path, upgrade_rules.LOCAL_POSTERS)
        return path

    # -- 页面与打包产物 -----------------------------------------------------

    async def test_the_page_asks_for_a_login_first(self) -> None:
        answer = await self.client.get("/", follow_redirects=False)
        self.assertEqual(answer.status_code, 303)
        self.assertTrue(answer.headers["location"].startswith("/login?next="))

    async def test_a_logged_in_browser_gets_the_page(self) -> None:
        client = await self.browser()
        answer = await client.get("/")
        self.assertEqual(answer.status_code, 200)
        self.assertIn("text/html", answer.headers["content-type"])
        self.assertIn("Peach test", answer.text)

    async def test_a_wrong_password_does_not_hand_out_a_session(self) -> None:
        answer = await self.client.post("/login", data={"token": "wrong", "next": "/"})
        self.assertNotEqual(answer.status_code, 303)
        self.assertNotIn("peach_session", answer.cookies)

    async def test_the_page_token_hands_out_a_session_cookie(self) -> None:
        answer = await self.client.get("/", params={"t": "secret"}, follow_redirects=False)
        self.assertEqual(answer.status_code, 303)
        self.assertEqual(answer.headers["location"], "/")
        self.assertIn("peach_session", answer.cookies)

    async def test_the_page_token_is_stripped_from_a_client_route(self) -> None:
        answer = await self.client.get("/assets/1", params={"t": "secret"}, follow_redirects=False)
        self.assertEqual(answer.status_code, 303)
        self.assertEqual(answer.headers["location"], "/assets/1")

    async def test_client_routes_serve_the_shell(self) -> None:
        client = await self.browser()
        for path in ("/settings/appearance", "/settings/drives", "/assets/1", "/posts/1", "/review"):
            answer = await client.get(path)
            self.assertEqual(answer.status_code, 200, path)
            self.assertIn("Peach test", answer.text)

    async def test_an_unknown_settings_section_is_missing(self) -> None:
        client = await self.browser()
        answer = await client.get("/settings/nope")
        self.assertEqual(answer.status_code, 404)

    async def test_pages_carry_the_security_headers(self) -> None:
        answer = await self.client.get("/login")
        self.assertEqual(answer.status_code, 200)
        self.assertEqual(answer.headers["x-content-type-options"], "nosniff")
        self.assertEqual(answer.headers["referrer-policy"], "same-origin")
        self.assertIn("noindex", answer.headers["x-robots-tag"])
        self.assertEqual(answer.headers["cache-control"], "no-store")

    async def test_the_vendored_frontend_is_served_immutable(self) -> None:
        answer = await self.client.get("/vendor/player.js")
        self.assertEqual(answer.status_code, 200)
        self.assertEqual(answer.text, "window.vendorReady=true;")
        self.assertIn("immutable", answer.headers["cache-control"])

    async def test_the_page_bundle_is_public_and_the_app_bundle_is_not(self) -> None:
        public = await self.client.get("/dist/peach-pages.js")
        self.assertEqual(public.status_code, 200)
        self.assertIn("javascript", public.headers["content-type"])
        guarded = await self.client.get("/dist/peach-app.js")
        self.assertEqual(guarded.status_code, 401)

    async def test_the_page_shell_assets_need_the_token(self) -> None:
        for path in ("/app.css", "/board.css"):
            self.assertEqual((await self.client.get(path)).status_code, 401, path)
            served = await self.client.get(path, params={"t": "secret"})
            self.assertEqual(served.status_code, 200, path)
            self.assertIn("text/css", served.headers["content-type"])

    async def test_the_bundle_route_refuses_names_outside_the_allowlist(self) -> None:
        answer = await self.client.get("/dist/..%2Findex.html", params={"t": "secret"})
        self.assertEqual(answer.status_code, 404)

    # -- 登录与口令 ---------------------------------------------------------

    async def test_the_api_needs_the_token(self) -> None:
        self.assertEqual((await self.client.get("/api/items")).status_code, 401)
        self.assertEqual((await self.client.get("/api/items", params={"t": "nope"})).status_code, 401)
        self.assertEqual((await self.client.get("/api/items", params={"t": "secret"})).status_code, 200)

    async def test_writes_need_the_token(self) -> None:
        denied = await self.client.post("/api/feedback", json={"id": 1, "value": "love"})
        self.assertEqual(denied.status_code, 401)

    async def test_configuration_management_needs_a_login(self) -> None:
        self.assertEqual((await self.client.get("/api/configuration")).status_code, 401)

    # -- 图片类端点 ---------------------------------------------------------

    async def test_the_poster_route_serves_a_remembered_preview(self) -> None:
        self.remember_poster(1)
        answer = await self.client.get("/poster", params={"id": 1, "t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertIn("image/jpeg", answer.headers["content-type"])
        self.assertEqual(answer.headers["cache-control"], "private, no-cache")
        self.assertEqual(answer.headers["x-content-type-options"], "nosniff")
        again = await self.client.get("/poster", params={"id": 1, "t": "secret"},
                                      headers={"if-none-match": answer.headers["etag"]})
        self.assertEqual(again.status_code, 304)

    async def test_the_poster_route_has_nothing_for_an_unpreviewed_asset(self) -> None:
        answer = await self.client.get("/poster", params={"id": 2, "t": "secret"})
        self.assertEqual(answer.status_code, 404)

    async def test_the_logo_route_reads_the_studio_file(self) -> None:
        (self.logo_root / "Studio_A.img").write_bytes(PNG_BYTES)
        (self.logo_root / "Studio_A.img.ct").write_text("image/png", encoding="utf-8")
        answer = await self.client.get("/logo", params={"studio": "Studio A", "t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertIn("image/png", answer.headers["content-type"])
        missing = await self.client.get("/logo", params={"studio": "Nobody", "t": "secret"})
        self.assertEqual(missing.status_code, 404)

    async def test_the_entity_image_route_serves_cached_files(self) -> None:
        (self.avatar_root / "performer-7.img").write_bytes(PNG_BYTES)
        answer = await self.client.get("/entity-image",
                                       params={"kind": "performer", "id": 7, "t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertIn("image/jpeg", answer.headers["content-type"])
        unknown = await self.client.get("/entity-image",
                                        params={"kind": "nonsense", "id": 7, "t": "secret"})
        self.assertEqual(unknown.status_code, 404)

    async def test_the_avatar_route_reports_a_missing_preview(self) -> None:
        answer = await self.client.get("/avatar", params={"id": 2, "t": "secret"})
        self.assertEqual(answer.status_code, 404)

    async def test_the_site_icon_route_is_an_allowlist(self) -> None:
        served = await self.client.get("/site-icon/javten.png", params={"t": "secret"})
        self.assertEqual(served.status_code, 200)
        self.assertIn("image/png", served.headers["content-type"])
        refused = await self.client.get("/site-icon/..%2F..%2Fconfig.toml", params={"t": "secret"})
        self.assertEqual(refused.status_code, 404)

    async def test_the_site_mark_route_serves_bundled_marks(self) -> None:
        served = await self.client.get("/site-mark", params={"source": "dmm", "t": "secret"})
        self.assertEqual(served.status_code, 200, served.text)
        unknown = await self.client.get("/site-mark", params={"source": "nope", "t": "secret"})
        self.assertEqual(unknown.status_code, 404)

    async def test_the_source_icon_route_serves_bundled_marks(self) -> None:
        served = await self.client.get("/source-icon", params={"provider": "f95zone", "t": "secret"})
        self.assertEqual(served.status_code, 200, served.text)
        self.assertIn("image/png", served.headers["content-type"])
        unknown = await self.client.get("/source-icon", params={"provider": "nope", "t": "secret"})
        self.assertEqual(unknown.status_code, 404)

    async def test_the_cover_route_serves_the_stored_artwork(self) -> None:
        from peach.web_state import normalise_code_key

        (self.cover_root / f"{normalise_code_key('ABC-123')}.jpg").write_bytes(tiny_jpeg(70))
        served = await self.client.get("/cover", params={"code": "ABC-123", "t": "secret"})
        self.assertEqual(served.status_code, 200, served.text)
        self.assertIn("image/jpeg", served.headers["content-type"])
        missing = await self.client.get("/cover", params={"code": "NOPE-001", "t": "secret"})
        self.assertEqual(missing.status_code, 404)

    async def test_the_timeline_route_serves_a_laid_out_sheet(self) -> None:
        from peach.timeline_sheets import sheet_path

        sheet = sheet_path(self.timeline_root, 1, 0)
        sheet.parent.mkdir(parents=True, exist_ok=True)
        sheet.write_bytes(tiny_jpeg(50))
        served = await self.client.get("/timeline", params={"id": 1, "s": 0, "t": "secret"})
        self.assertEqual(served.status_code, 200, served.text)
        beyond = await self.client.get("/timeline", params={"id": 1, "s": 9, "t": "secret"})
        self.assertEqual(beyond.status_code, 404)

    async def test_the_photo_thumb_route_reads_the_original_once(self) -> None:
        # 图片只能读原图缩，所以这条路是真的取一次字节再落一张缩略图。
        self.app.state.media_engine = MediaEngine(self.app.state.repository,
                                                  FakeStreamer(body=tiny_jpeg(60)),
                                                  cache_root=self.photo_root.parent / "downloads")
        answer = await self.client.get("/photo-thumb", params={"id": 1, "t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertIn("image/jpeg", answer.headers["content-type"])

    async def test_the_follow_avatar_route_hides_unknown_sources(self) -> None:
        answer = await self.client.get("/follow-avatar",
                                       params={"provider": "nope", "ref": "x", "t": "secret"})
        self.assertEqual(answer.status_code, 404)
        # 头像后面还有一条兜底链，所以这里不带占位图。
        self.assertEqual(answer.content, b"")

    async def test_the_work_icon_route_has_nothing_for_an_unknown_work(self) -> None:
        answer = await self.client.get("/work-icon", params={"work": "nonsense", "t": "secret"})
        self.assertEqual(answer.status_code, 404)

    # -- 健康检查与诊断 -----------------------------------------------------

    async def test_healthz_reports_the_assembly(self) -> None:
        answer = await self.client.get("/healthz")
        self.assertEqual(answer.status_code, 200)
        body = answer.json()
        self.assertTrue(body["ok"])
        self.assertEqual(body["service"], "peach-api")
        self.assertTrue(body["configured"])
        self.assertEqual(body["db"], "available")
        self.assertEqual(set(body["checks"]), {"database", "schema", "configured", "drives", "security", "ffmpeg"})
        self.assertEqual(body["drive"], {})

    async def test_ready_counts_the_background_services_only_when_it_knows(self) -> None:
        # 测试用的是 ASGITransport，lifespan 没跑，没人报过后台状态，就绪只看库和页面。
        answer = await self.client.get("/healthz", params={"ready": "1"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertTrue(answer.json()["ready"])
        self.assertNotIn("background", answer.json()["checks"])

        self.app.state.ledger_background_ready = False
        waiting = await self.client.get("/healthz", params={"ready": "1"})
        self.assertEqual(waiting.status_code, 503)
        self.assertFalse(waiting.json()["checks"]["background"])

        self.app.state.ledger_background_ready = True
        ready = await self.client.get("/healthz", params={"ready": "1"})
        self.assertEqual(ready.status_code, 200, ready.text)

    async def test_diagnostics_lists_the_checks(self) -> None:
        answer = await self.client.get("/api/diagnostics", params={"t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertEqual(set(answer.json()["checks"]),
                         {"database", "schema", "configured", "drives", "security", "ffmpeg",
                          "data_root", "port", "tasks", "version"})

    async def test_background_issues_come_back_as_a_list(self) -> None:
        answer = await self.client.get("/api/background-issues", params={"t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        issues = answer.json()["issues"]
        self.assertIsInstance(issues, list)
        for issue in issues:
            self.assertIsInstance(issue, dict)

    # -- 复核与标签 ---------------------------------------------------------

    async def test_review_counts_start_at_zero(self) -> None:
        answer = await self.client.get("/api/review", params={"counts": "1", "t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertIsInstance(answer.json(), dict)

    async def test_tag_management_answers_on_an_empty_ledger(self) -> None:
        answer = await self.client.get("/api/tag-management", params={"t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertIsInstance(answer.json(), dict)

    async def test_the_aggregate_endpoints_answer(self) -> None:
        for path in ("/api/items", "/api/stats", "/api/entity/shapes", "/api/tasks",
                     "/api/settings", "/api/follow", "/api/feeds"):
            answer = await self.client.get(path, params={"t": "secret"})
            self.assertEqual(answer.status_code, 200, f"{path}: {answer.text}")
            self.assertIsInstance(answer.json(), (dict, list))

    # -- 媒体库与配置 -------------------------------------------------------

    async def test_libraries_lists_one_library_per_scan_root(self) -> None:
        answer = await self.client.get("/api/libraries", params={"t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        libraries = answer.json()["libraries"]
        self.assertEqual([row["id"] for row in libraries], ["gdrive:root-1"])
        self.assertEqual(libraries[0]["folders"], 1)
        self.assertEqual(libraries[0]["roots"], [{"root_id": "root-1", "location": "gdrive"}])

    async def test_configuration_refuses_a_stale_revision(self) -> None:
        with patch("peach.routes_configuration.managed_configuration", lambda: True):
            answer = await self.client.post(
                "/api/configuration", params={"t": "secret"},
                json={"revision": "stale", "libraries": [self._library_row()]})
        self.assertEqual(answer.status_code, 409, answer.text)

    async def test_configuration_saves_library_names(self) -> None:
        with patch("peach.routes_configuration.managed_configuration", lambda: True):
            current = await self.client.get("/api/configuration", params={"t": "secret"})
            self.assertEqual(current.status_code, 200, current.text)
            answer = await self.client.post(
                "/api/configuration", params={"t": "secret"},
                json={"revision": current.json()["revision"],
                      "libraries": [self._library_row(name="主库")]})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertTrue(answer.json()["saved"])
        self.assertIn("主库", self.config_path.read_text(encoding="utf-8"))

    async def test_configuration_refuses_an_unknown_library(self) -> None:
        with patch("peach.routes_configuration.managed_configuration", lambda: True):
            current = await self.client.get("/api/configuration", params={"t": "secret"})
            answer = await self.client.post(
                "/api/configuration", params={"t": "secret"},
                json={"revision": current.json()["revision"],
                      "libraries": [self._library_row(key="gdrive:missing")]})
        self.assertEqual(answer.status_code, 400, answer.text)

    def _library_row(self, name: str = "主库", key: str = "gdrive:root-1") -> dict:
        return {"id": key, "name": name, "icon": "database", "color": "blue",
                "policy": "auto", "stages": ""}

    # -- 网盘设置面 ---------------------------------------------------------

    async def test_drive_snapshot_lists_both_locations(self) -> None:
        answer = await self.client.get("/api/drive", params={"t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        body = answer.json()
        self.assertEqual(body["public_url"], "")
        self.assertEqual([row["location"] for row in body["locations"]], ["gdrive", "onedrive"])
        for row in body["locations"]:
            self.assertFalse(row["configured"], row)
            self.assertFalse(row["connected"], row)
        self.assertEqual(body["locations"][0]["label"], "Google Drive")

    async def test_authorizing_a_drive_without_credentials_explains_itself(self) -> None:
        answer = await self.client.post("/api/drive/gdrive/authorize", params={"t": "secret"})
        self.assertEqual(answer.status_code, 409, answer.text)
        self.assertEqual(answer.json()["error"], "Google Drive 还没有接入")

    async def test_authorizing_a_configured_drive_returns_the_consent_url(self) -> None:
        # 回调基址和客户端凭据都齐了才建得出驱动；缺一样只说明这个来源这一刻不能用。
        app, client = await self.start(drive_clients={"gdrive": ("client-id", "client-secret")},
                                       drive_public_url="https://peach.example.com")
        answer = await client.post("/api/drive/gdrive/authorize", params={"t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        url = answer.json()["url"]
        self.assertTrue(url.startswith("https://accounts.google.com/"), url)
        self.assertIn("client_id=client-id", url)
        snapshot = await client.get("/api/drive", params={"t": "secret"})
        row = snapshot.json()["locations"][0]
        self.assertTrue(row["configured"])
        self.assertFalse(row["connected"])

    async def test_the_oauth_callback_rejects_a_made_up_state(self) -> None:
        answer = await self.client.get("/oauth/gdrive/callback",
                                       params={"code": "abc", "state": "nobody-issued-this"})
        self.assertEqual(answer.status_code, 400, answer.text)
        self.assertIn("授权回执已过期", answer.json()["error"])

    async def test_the_oauth_callback_reports_a_denied_grant(self) -> None:
        answer = await self.client.get("/oauth/gdrive/callback", params={"error": "access_denied"})
        self.assertEqual(answer.status_code, 400, answer.text)
        self.assertIn("access_denied", answer.json()["error"])

    async def test_scan_roots_must_be_a_list(self) -> None:
        answer = await self.client.post("/api/drive/gdrive/roots", params={"t": "secret"},
                                        json={"roots": "root-1"})
        self.assertEqual(answer.status_code, 400, answer.text)
        self.assertIn("roots", answer.json()["error"])

    async def test_forgetting_a_drive_clears_the_configured_roots(self) -> None:
        answer = await self.client.delete("/api/drive/gdrive", params={"t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertEqual(answer.json(), {"forgotten": "gdrive"})
        import tomllib

        document = tomllib.loads(self.config_path.read_text(encoding="utf-8"))
        self.assertEqual(document.get("drive", {}).get("roots", {}), {})

    async def test_an_unknown_drive_location_is_missing(self) -> None:
        answer = await self.client.get("/api/drive/ftp/folders", params={"t": "secret"})
        self.assertEqual(answer.status_code, 404)
        self.assertEqual(answer.json()["error"], "没有这个网盘")

    async def test_drive_management_needs_the_token(self) -> None:
        self.assertEqual((await self.client.post("/api/drive/gdrive/authorize")).status_code, 401)
        self.assertEqual((await self.client.delete("/api/drive/gdrive")).status_code, 401)

    # -- 视频播放（标准 Range，直连网盘） -----------------------------------

    async def test_the_stream_route_answers_a_range_request(self) -> None:
        answer = await self.client.get("/stream", params={"id": 1, "t": "secret"},
                                       headers={"range": "bytes=8-15"})
        self.assertEqual(answer.status_code, 206, answer.text)
        self.assertEqual(answer.headers["content-range"], "bytes 8-15/256")
        self.assertEqual(answer.headers["accept-ranges"], "bytes")
        self.assertIn("video/mp4", answer.headers["content-type"])
        self.assertEqual(answer.headers["cache-control"], "no-store")
        # 路由在这个响应上设了 no-referrer，头部中间件只补没有设过的头，不覆盖它。
        self.assertEqual(answer.headers["referrer-policy"], "no-referrer")
        self.assertEqual(answer.headers["x-content-type-options"], "nosniff")
        self.assertEqual(self.streamer.calls[0], ("response", "gdrive", "file-1", "video/mp4", False))

    async def test_the_stream_route_serves_the_whole_file_without_a_range(self) -> None:
        answer = await self.client.get("/stream", params={"id": 1, "t": "secret"})
        self.assertEqual(answer.status_code, 206)
        self.assertEqual(answer.headers["content-range"], "bytes 0-255/256")

    async def test_the_stream_route_refuses_an_extension_browsers_cannot_play(self) -> None:
        answer = await self.client.get("/stream", params={"id": 2, "t": "secret"})
        self.assertEqual(answer.status_code, 404)
        self.assertEqual(answer.json()["error"], "unavailable")

    async def test_the_stream_route_refuses_an_asset_without_a_remote_id(self) -> None:
        answer = await self.client.get("/stream", params={"id": 3, "t": "secret"})
        self.assertEqual(answer.status_code, 404)
        self.assertEqual(answer.json()["error"], "unavailable")

    async def test_the_stream_route_reports_an_unknown_asset(self) -> None:
        answer = await self.client.get("/stream", params={"id": 999, "t": "secret"})
        self.assertEqual(answer.status_code, 404)
        self.assertEqual(answer.json()["error"], "no such id")

    async def test_stream_plan_describes_the_range_protocol(self) -> None:
        answer = await self.client.get("/api/stream-plan", params={"id": 1, "t": "secret"})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertEqual(answer.json(), {"id": 1, "protocol": "range", "mime_type": "video/mp4",
                                         "duration": 95.0, "src": "/stream?id=1",
                                         "reason": "drive-range"})

    async def test_stream_plan_refuses_an_unplayable_asset(self) -> None:
        self.assertEqual((await self.client.get("/api/stream-plan",
                                                params={"id": 2, "t": "secret"})).status_code, 404)

    async def test_the_external_stream_refuses_a_ticket_it_did_not_issue(self) -> None:
        forged = {"ticket": "forged", "origin": "http://test"}
        stream = await self.client.get("/external-stream/1", params=forged)
        self.assertEqual(stream.status_code, 401)
        self.assertIn("播放链接已失效", stream.text)
        playlist = await self.client.get("/external-playlist/1.m3u", params=forged)
        self.assertEqual(playlist.status_code, 401)


class UnconfiguredMachineTests(unittest.IsolatedAsyncioTestCase):
    """还没跑过 `peach init` 的机器：服务照常起，页面告诉人下一步做什么。

    「未配置」是显式状态，不是崩溃：数据目录不存在、数据库不存在、什么来源都没挂，
    这些都不该让 `serve` 起不来——起不来的服务连提示都没法给。
    """

    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        missing = Path(self.tmp.name).resolve() / "nothing-here"
        self.settings = PeachSettings(
            configured=False,
            db_path=missing / "database" / "ledger.db",
            page_path=missing / "web" / "index.html",
            vendor_path=missing / "web" / "vendor",
            snapshot_root=missing / "snapshots",
            poster_root=missing / "posters", avatar_root=missing / "avatars",
            logo_root=missing / "logos", cover_root=missing / "covers",
            photo_root=missing / "photos",
            ffmpeg_root=missing / "ffmpeg",
            candidate_root=missing,
            secrets_root=missing / "secrets",
            follow_state_root=missing / "state",
            entry_links_root=missing / "entry-links",
        )
        self.app = create_app(self.settings)
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app), base_url="http://test")
        self.addAsyncCleanup(self.client.aclose)

    async def test_health_reports_the_unconfigured_state_instead_of_failing(self):
        response = await self.client.get("/healthz")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["ok"])
        self.assertFalse(body["configured"])
        self.assertEqual(body["db"], "missing")

    async def test_setup_lifespan_keeps_ledger_workers_stopped(self):
        async with self.app.router.lifespan_context(self.app):
            self.assertFalse(self.app.state.ledger_background_ready)
            self.assertFalse(self.app.state.follow_scheduler._started)
            self.assertFalse(self.app.state.web_contract.feed_scheduler._started)
            response = await self.client.get("/healthz")
            self.assertEqual(response.status_code, 200)
            self.assertFalse(response.json()["configured"])
            self.assertFalse(self.settings.db_path.exists())

    @asynccontextmanager
    async def ledger_client(self, database):
        from peach import settings_file
        config = settings_file.load_config(environ={"PEACH_DATA_ROOT": str(database.parent.parent)})
        config = replace(config, drive_roots={})
        settings = replace(self.settings, configured=True, db_path=database,
                           page_path=ROOT / "web/index.html", secrets_root=database.parent / "secrets")
        with patch("peach.settings_file.load_config", return_value=config), \
                patch("peach.routes_configuration.managed_configuration", return_value=True), \
                self.assertNoLogs("peach", level="ERROR"):
            app = create_app(settings)
            async with app.router.lifespan_context(app), httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app), base_url="http://test",
            ) as client:
                yield app, client

    async def test_unready_ledgers_keep_background_workers_stopped_without_creating_or_migrating_data(self):
        parent = self.settings.db_path.parent
        parent.mkdir(parents=True)
        for state in ("missing", "empty", "corrupt", "pending", "mismatch"):
            with self.subTest(state=state):
                database = parent / f"{state}.db"
                if state == "empty":
                    with closing(sqlite3.connect(database)):
                        pass
                elif state == "corrupt":
                    database.write_bytes(b"not a sqlite database")
                elif state in {"pending", "mismatch"}:
                    fresh_ledger(parent, database.name)
                    with closing(sqlite3.connect(database)) as connection, connection:
                        if state == "pending":
                            connection.execute("DELETE FROM schema_migration WHERE version=(SELECT MAX(version) FROM schema_migration)")
                        else:
                            connection.execute("UPDATE schema_migration SET checksum='wrong' WHERE version=(SELECT MAX(version) FROM schema_migration)")
                original = database.read_bytes() if database.exists() else None
                with self.assertLogs("peach.api", level="WARNING") as captured:
                    async with self.ledger_client(database) as (app, client):
                        self.assertFalse(app.state.ledger_background_ready)
                        self.assertFalse(app.state.follow_scheduler._started)
                        self.assertFalse(app.state.web_contract.feed_scheduler._started)
                        self.assertEqual((await client.get("/healthz")).status_code, 200)
                        ready = await client.get("/healthz?ready=1")
                        self.assertEqual(ready.status_code, 503)
                        self.assertFalse(ready.json()["ready"])
                        for path in ('/', '/settings/drives'):
                            page = await client.get(path)
                            self.assertEqual(page.status_code, 200)
                            self.assertIn('id="tutorialBtn"', page.text)
                self.assertEqual([record.levelname for record in captured.records], ["WARNING"])
                self.assertIn("数据库准备完成后重启服务", captured.output[0])
                self.assertNotIn(str(database), captured.output[0])
                self.assertEqual(database.read_bytes() if database.exists() else None, original)

    async def test_current_ledger_starts_background_workers_and_stops_them_with_the_service(self):
        parent = self.settings.db_path.parent
        parent.mkdir(parents=True)
        database = fresh_ledger(parent)
        async with self.ledger_client(database) as (app, client):
            self.assertTrue(app.state.ledger_background_ready)
            self.assertTrue(app.state.follow_scheduler._started)
            self.assertTrue(app.state.web_contract.feed_scheduler._started)
            ready = await client.get('/healthz?ready=1')
            self.assertEqual(ready.status_code, 200)
            self.assertTrue(ready.json()['ready'])
        self.assertFalse(app.state.ledger_background_ready)
        self.assertFalse(app.state.follow_scheduler._started)
        self.assertFalse(app.state.web_contract.feed_scheduler._started)

    async def test_preparing_the_ledger_requires_a_service_restart_to_resume_background_work(self):
        parent = self.settings.db_path.parent
        parent.mkdir(parents=True)
        database = parent / "ledger.db"
        async with self.ledger_client(database) as (app, client):
            self.assertFalse(app.state.ledger_background_ready)
            fresh_ledger(parent)
            response = await client.get("/healthz?ready=1")
            self.assertEqual(response.status_code, 503)
            self.assertFalse(response.json()["checks"]["background"])
        async with self.ledger_client(database) as (app, client):
            response = await client.get("/healthz?ready=1")
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json()["checks"]["background"])
            self.assertTrue(app.state.ledger_background_ready)

    async def test_shutdown_joins_the_active_aggregate_before_releasing_the_ledger(self):
        parent = self.settings.db_path.parent
        parent.mkdir(parents=True)
        database = fresh_ledger(parent)
        opened, release, closed = threading.Event(), threading.Event(), threading.Event()
        calls = []

        def query(contract, path, args):
            calls.append(path)
            with closing(sqlite3.connect(database)) as connection:
                connection.execute("SELECT id FROM asset LIMIT 1").fetchone()
                opened.set()
                release.wait(5)
            closed.set()

        context = self.ledger_client(database)
        shutdown = None
        with patch("peach.api.web_contract.dispatch_api_get", side_effect=query):
            try:
                app, _client = await context.__aenter__()
                self.assertTrue(await asyncio.to_thread(opened.wait, 5))
                shutdown = asyncio.create_task(context.__aexit__(None, None, None))
                while app.state.ledger_background_ready and not shutdown.done():
                    await asyncio.sleep(0)
                self.assertFalse(shutdown.done(), "服务退出须等待预热查询释放数据库")
                release.set()
                await shutdown
                self.assertTrue(closed.is_set())
                # 只走到预热清单的第一项：关机等它释放账本，后面的不再起。
                from peach.api import WARM_AGGREGATES
                self.assertEqual(calls, [WARM_AGGREGATES[0][0]])
            finally:
                release.set()
                if shutdown is not None:
                    await shutdown
                else:
                    await context.__aexit__(None, None, None)
                await asyncio.to_thread(closed.wait, 5)

    async def test_the_page_serves_the_first_run_shell(self):
        response = await self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response.headers["content-type"])
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertIn('<div id="peach-page" data-page="setup">', response.text)
        self.assertIn('src="/dist/peach-pages.js"', response.text)

    async def test_deep_links_land_on_the_same_shell(self):
        # 前端路由全部落到 `index`，未配置时不该只有首页能看。
        response = await self.client.get("/tags")
        self.assertEqual(response.status_code, 200)
        self.assertIn('data-page="setup"', response.text)

    async def test_a_configured_machine_still_reports_true(self):
        app = create_app(PeachSettings(configured=True, db_path=self.settings.db_path))
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test",
        ) as client:
            self.assertTrue((await client.get("/healthz")).json()["configured"])


#: 不挂鉴权依赖的路由，以及每一条为什么必须公开。每一项都逐条核实过，新加的路由
#: 默认要带鉴权：漏挂时在这里红，而不是等有人从局域网外面发现它。
#: 键是 `(方法集合, 路径)`，方法也要对上——同一条路径的 GET 公开不等于 POST 也公开。
PUBLIC_ROUTES = {
    # 健康检查。托盘与 uptime 工具要在没有口令时探到服务活着，返回里只有本机
    # 运行态，没有任何媒体内容或馆藏数据。
    ("GET,HEAD", "/healthz"),
    # 登录页自己。要口令才能打开输入口令的那一页，就没有人能登录了。
    ("GET", "/login"),
    ("POST", "/login"),
    # 首次运行页的读题与提交。这台机器那时还没有口令可验；两条共用
    # `routes_pages._setup_guard`：已配置过就 404、非回环调用方 403、独立包的非回环
    # 主机名 403；提交再看 Origin（403）与设置文件已存在（409）。配置完成后读题也是 404，
    # 平台、打包形态与挂载软件这些运行事实不外露。
    ("GET", "/api/setup/questions"),
    ("POST", "/api/setup"),
    ("POST", "/api/setup/restore"),
    # Docker 首次访问设置的提交（ADR-0149）。这时还没有访问策略，没有密码可验；只在 Docker 且
    # 没有策略时收，来源须是本机或私有网络、不带代理转发头（403），再看 Origin（403）；已有策略
    # 就 409，非 Docker 是 404。
    ("POST", "/api/configuration/access/first"),
    # 首启与登录页的浏览器尚无会话；此接口仅向本机同源开放，限流、限长后只写脱敏错误日志。
    ("POST", "/api/diagnostics/client-error"),
    # 登录页在拿到会话之前就要出图，书签与历史记录也从这三个固定路径取图标。
    # 它们发的是随仓库分发的品牌资源，不读账本。
    ("GET,HEAD", "/favicon.ico"),
    ("GET,HEAD", "/favicon.svg"),
    ("GET,HEAD", "/peach-logo.png"),
    ("GET,HEAD", "/peach-logo-64.png"),
    ("GET,HEAD", "/peach-logo-128.png"),
    # 入口页的页面包（ADR-0094）。登录页在拿到会话之前就要画出来，首启、登录与错误三页都由它画。
    # 只放这两个文件：它们提交进 Git、随仓库分发，不读账本、不含配置与凭据，内容不随登录与否
    # 变化，也不 import 别的产物；其余 `/dist/*` 仍走要会话的 `/dist/{name}`。
    ("GET,HEAD", "/dist/peach-pages.js"),
    ("GET,HEAD", "/dist/peach-pages.css"),
    # 网盘授权的回执地址。浏览器从 Google/微软跳回来时还没有 Peach 的会话，凭据是
    # 发起授权时签发、一刻钟内有效的一次性 `state`；处理函数自己核这个串。
    ("GET", "/oauth/{location}/callback"),
    # 拒绝收录的声明。爬虫没有会话，被 401 挡住等于这份声明根本没被读到。
    ("GET,HEAD", "/robots.txt"),
    # 外部播放器没有浏览器会话；两条路由各自验证进程密钥签发的限时 HMAC，
    # 绑定单个资产与公开 Origin，验证后仍逐次检查媒体根目录。
    ("GET,HEAD", "/external-stream/{id}"),
    ("GET", "/external-playlist/{id}.m3u"),
}


def _api_routes(routes):
    """铺平 FastAPI 的路由表。

    FastAPI 0.141 起 `include_router` 往 `app.routes` 里放的是一个包装对象，
    真正的路由在它的 `original_router` 上；只遍历 `app.routes` 会看见一条
    `/healthz` 就以为全站只有一个端点。
    """
    for route in routes:
        if isinstance(route, APIRoute):
            yield route
        elif hasattr(route, "original_router"):
            yield from _api_routes(route.original_router.routes)
        elif hasattr(route, "routes"):
            yield from _api_routes(route.routes)


@unittest.skipUnless(HAS_DEPS, "fastapi/httpx not installed")
class RouteAuthContractTests(unittest.TestCase):
    """每条路由都要挂上鉴权依赖，例外只能出自上面那张逐条核实过的白名单。

    Peach 的闸门是依赖注入（`routes_auth` 的 `require_*`），不是中间件：新加
    一条路由时忘记写 `Depends(require_auth)`，服务照常起、测试照常绿，那条路径就
    此对局域网敞开。这是「只改了自己测试的那条路径」在鉴权面上的形态。
    """

    GUARD_NAMES = ("require_auth", "require_page_auth", "require_asset_auth", "require_authenticated_client")

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        root = Path(cls.tmp.name).resolve()
        cls.app = create_app(PeachSettings(
            configured=True, db_path=root / "ledger.db",
            follow_state_root=root / "state"))
        cls.guards = {getattr(routes_auth, name) for name in cls.GUARD_NAMES}
        cls.routes = {(",".join(sorted(route.methods)), route.path):
                      {dependency.call for dependency in route.dependant.dependencies}
                      for route in _api_routes(cls.app.routes)}

    @classmethod
    def tearDownClass(cls):
        cls.app.state.http_transport.close()
        cls.tmp.cleanup()

    def test_the_route_table_is_actually_visible_to_this_test(self):
        """铺平失败时这个契约会静默变成空断言，所以先钉住「看得见路由」。"""
        self.assertGreater(len(self.routes), 60, "没有遍历到路由表，下面的断言全是空的")
        self.assertIn(("GET,HEAD", "/healthz"), self.routes)

    def test_every_route_is_gated_unless_it_is_on_the_public_list(self):
        unguarded = sorted(key for key, dependencies in self.routes.items()
                           if not dependencies & self.guards and key not in PUBLIC_ROUTES)
        self.assertEqual(unguarded, [],
                         "新路由没挂 routes_auth 的 require_* 依赖；确实该公开就写进 "
                         "PUBLIC_ROUTES 并注明理由")

    def test_the_public_list_has_no_entry_that_stopped_existing(self):
        """路径改名或删掉时白名单要跟着收，否则它会一直替一条不存在的路由背书。"""
        stale = sorted(key for key in PUBLIC_ROUTES if key not in self.routes)
        self.assertEqual(stale, [])
        still_gated = sorted(key for key in PUBLIC_ROUTES
                             if self.routes.get(key, set()) & self.guards)
        self.assertEqual(still_gated, [], "这些路由已经挂上鉴权了，从白名单里删掉")

    def test_the_only_unguarded_mount_is_the_vendored_frontend(self):
        """挂载不是路由，遍历看不到它；再挂一个就必须有人重新判断它该不该公开。"""
        self.assertEqual(
            sorted(route.path for route in self.app.routes if isinstance(route, Mount)),
            ["/vendor"])


@unittest.skipUnless(HAS_DEPS, "fastapi/httpx not installed")
class LoginPageWithoutSessionTests(unittest.IsolatedAsyncioTestCase):
    """设了访问密码的实例上，没有会话也画得出登录页：它要的资源都能取，别的产物照旧要会话。"""

    PAGE_ASSETS = ("/dist/peach-pages.css", "/dist/peach-pages.js", "/vendor/inter/5.3.0/index.css",
                   "/peach-logo.png", "/peach-logo-64.png", "/peach-logo-128.png", "/favicon.ico")
    SESSION_ASSETS = ("/dist/peach-app.js", "/dist/peach-app.css", "/app.css", "/board.css")

    async def asyncSetUp(self):
        from peach import access
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        root = Path(tmp.name).resolve()
        access_path = root / "access.json"
        access.save(access_path, "entry-password")
        app = create_app(PeachSettings(configured=True, token="entry-token", access_path=access_path,
                                       db_path=fresh_ledger(root), follow_state_root=root / "state"))
        self.addCleanup(app.state.http_transport.close)
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver")
        self.addAsyncCleanup(self.client.aclose)
        routes_auth._ATTEMPTS.clear()

    async def test_the_login_page_and_everything_it_loads_need_no_session(self):
        home = await self.client.get("/")
        self.assertEqual(home.status_code, 303)
        self.assertEqual(home.headers["location"], "/login?next=/")
        page = await self.client.get("/login")
        self.assertEqual(page.status_code, 200)
        self.assertIn('data-page="login"', page.text)
        for path in self.PAGE_ASSETS:
            with self.subTest(path):
                response = await self.client.get(path)
                self.assertEqual(response.status_code, 200)
        for path in self.PAGE_ASSETS[:2]:
            with self.subTest(path):
                response = await self.client.head(path)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers["cache-control"], "no-cache")
                again = await self.client.get(path, headers={"If-None-Match": response.headers["etag"]})
                self.assertEqual(again.status_code, 304)

    async def test_the_other_bundles_and_modules_still_need_a_session(self):
        for path in self.SESSION_ASSETS:
            with self.subTest(path):
                self.assertEqual((await self.client.get(path)).status_code, 401)
        login = await self.client.post("/login", data={"token": "entry-password", "next": "/"})
        self.assertEqual(login.status_code, 303)
        for path in self.SESSION_ASSETS + self.PAGE_ASSETS:
            with self.subTest(path):
                self.assertEqual((await self.client.get(path)).status_code, 200)

    async def test_a_missing_bundle_opened_in_the_browser_is_the_error_page(self):
        login = await self.client.post("/login", data={"token": "entry-password", "next": "/"})
        self.assertEqual(login.status_code, 303)
        page = await self.client.get("/dist/no-such.js", headers={"Accept": "text/html"})
        self.assertEqual(page.status_code, 404)
        self.assertIn('data-page="error" data-status="404" data-detail="这个地址下没有页面。"', page.text)
        script = await self.client.get("/dist/no-such.js")
        self.assertEqual(script.status_code, 404)
        self.assertEqual(script.json(), {"error": "这个地址下没有页面。"})


if __name__ == "__main__":
    unittest.main()
