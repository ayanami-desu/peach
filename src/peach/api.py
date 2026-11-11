"""应用组装点：把依赖建好挂到 `app.state`，再按顺序把各 router include 进来。

路由按用途拆分，各自 import 需要的东西，运行期依赖一律从
`request.app.state` 取：

| 模块 | 管什么 |
| --- | --- |
| `routes_auth` | 口令闸门与登录页，三个 `require_*` 依赖 |
| `routes_pages` | 单页界面、静态资产与全部前端路由落点 |
| `routes_configuration` | 本机配置、网盘授权与媒体库分组 |
| `routes_media` | 播放取流、缩图、封面、头像、外链圆标 |
| `routes_api` | JSON 契约出口，含两条 `/api/{route:path}` catch-all |

`include_router` 的顺序是契约的一部分，不是排版：FastAPI 按注册顺序匹配，
`routes_api` 的两条 catch-all 会吃掉一切 `/api/...`，所以它必须最后。
`/api/stream-plan` 住在 `routes_media`，那个 router 也因此要排在 `routes_api` 前面。

留在本文件里的只有全应用一份的东西：依赖装配、`lifespan`、异常处理器、`/vendor`
挂载、响应头与压缩中间件和 `/healthz`。
"""
import asyncio
import logging
import secrets
import sqlite3
import uuid
from contextlib import asynccontextmanager, closing
from urllib.parse import quote

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.datastructures import MutableHeaders
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.gzip import DEFAULT_EXCLUDED_CONTENT_TYPES, GZipMiddleware

from . import __version__, feeds, ledger_backups, media_probe, record_rehome, wants, web_contract, web_feeds, web_follow
from . import routes_api, routes_auth, routes_configuration, routes_media, routes_pages
from .config import PeachSettings
from .drive_connections import DriveConnections
from .drive_sync import DriveSync
from .drive_stream import build as build_streamer
from .ffmpeg import FFmpegResolver
from .follow_covers import FollowCoverService
from .follow_faces import FollowFaceIndex
from .follow_scheduler import FEED_JOB_ID, FollowScheduleConfig, FollowUpdateScheduler
from .follow_stream import FollowMediaResolver
from .health import inspect_database
from .http import HttpxTransport
from .media import MediaEngine, MediaNotFound, MediaUnavailable
from .previews import (
    COVER_SMALL_THUMB_EDGE,
    COVER_SMALL_THUMB_QUALITY,
    COVER_THUMB_EDGE,
    COVER_THUMB_QUALITY,
    DerivedImageService,
    PhotoThumbnailService,
    PreviewService,
    cover_thumb_root,
    entity_thumb_root,
)
from .providers import OpenCodeGoClient, default_registry
from .remote_media_cache import MEDIA_SECURITY_HEADERS
from .repository import LedgerDatabase, LedgerRepository
from .scan import ScanService
from .routes_auth import AssetLoginRequired, PageLoginRequired
# 两档缓存时长的实现在 `routes_media`，这里再导出：它们是对外的缓存契约，
# tests/test_follow_web.py 按 `api.MEDIA_CACHE_SECONDS` 断言两者的关系。
from .routes_media import AVATAR_CACHE_SECONDS, MEDIA_CACHE_SECONDS  # noqa: F401
from .sample_images import SampleCache
from .sample_images import cache_root as sample_cache_root

LOGGER = logging.getLogger(__name__)

#: gzip 不碰的内容类型。Starlette 的默认名单已经排掉 `video/*`、`audio/*` 和各种
#: 已压缩的图片，这里再补两个它没排、而 Peach 会真的撞上的：
#: `application/octet-stream` 是通用字节流；`text/plain` 是 `FileResponse` 猜不出
#: 扩展名时的兜底值，`/stream` 与 `/photo` 都不传 media_type，一个没登记过扩展名的
#: 媒体文件会以 `text/plain` 出去——压它纯属烧 CPU。Peach 自己有意发的
#: `text/plain` 只有 "missing" 这类错误提示，本来就在 `minimum_size` 之下。
COMPRESSION_EXCLUDED_TYPES = (
    *DEFAULT_EXCLUDED_CONTENT_TYPES, "application/octet-stream", "text/plain",
)


class ResponseHeadersMiddleware:
    """在 ASGI 响应头阶段设置缓存与安全策略，原样传递连接和异常。"""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            await self.app(scope, receive, send)
            return

        async def send_headers(message):
            if message['type'] == 'http.response.start':
                headers = MutableHeaders(scope=message)
                if scope['path'].startswith('/vendor/'):
                    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
                elif 'cache-control' not in headers:
                    headers['Cache-Control'] = 'no-store'
                headers['X-Content-Type-Options'] = 'nosniff'
                kind = headers.get('content-type','').split(';',1)[0].strip().lower()
                if kind.startswith(('image/','video/','audio/')):
                    headers.update(MEDIA_SECURITY_HEADERS)
                if (message['status']==200 and kind=='text/html' and scope['method']=='GET'
                        and Request(scope).cookies.get('peach_media_policy')!='1'):
                    headers['Clear-Site-Data']='"cache"'
                    policy=Response()
                    policy.set_cookie('peach_media_policy','1',max_age=365*86400,httponly=True,
                                      secure=scope['scheme']=='https',samesite='strict')
                    headers.append('set-cookie',policy.headers['set-cookie'])
                if 'referrer-policy' not in headers:
                    headers['Referrer-Policy'] = 'same-origin'
                headers['X-Robots-Tag'] = routes_pages.ROBOTS_TAG
            await send(message)

        await self.app(scope, receive, send_headers)


#: Starlette 自己抛的那几种 HTTPException 带的是英文 detail，给人看之前换成中文。
_DEFAULT_DETAILS = {
    "Not Found": "这个地址下没有页面。",
    "Method Not Allowed": "这个地址不接受这种请求。",
}


def _restore_task_center(contract) -> None:
    """开机时收拾任务中心。

    上一次服务被强杀的话，表里会留下几行停在 `running` 的记录，它们还占着互斥键——不先
    收掉，这一次开机后那几类任务一按就是 409。判据是 pid 还在不在与心跳有没有过期，两样
    都不满足才算被打断。

    后继是例外：它重新排队而不判 `interrupted`，冻在终态就再也没有重试的机会
    （ADR-0040 第六条）。排着的那些也在这一步被叫醒，接着跑完。
    """
    recovered = contract.task_runs.recover_interrupted()
    if recovered:
        LOGGER.info("task center recovered %s interrupted run(s)", len(recovered))
    # 先接上再叫醒后继：排着的补头像后继一跑就可能去取人脸模型。
    from . import face_models
    face_models.attach(contract.task_runs)
    requeued = contract.task_runs.enabled and contract.followups.resume()
    if requeued:
        LOGGER.info("task center requeued %s followup(s)", len(requeued))


#: 开机在后台先算一遍的聚合：口味、复核、垃圾复核、关注的全部条目与筛选项各要几秒到
#: 十几秒，都按账本版本号缓存（`WebContract.cached_until_changed`），算好一次就一直用到
#: 账本或文件真的变了。排在前面的是每页都碰到的几份：形状名单、作品分组快照（目录、
#: 索引、筛选项都建在它上面）、统计与搜索推荐池，重启后第一个打开页面的人不再等它们一起冷算。
WARM_AGGREGATES = (("/api/entity/shapes", {}), ("/api/items", {"limit": "60"}), ("/api/stats", {}),
                   ("/api/search/recommendations", {}),
                   ("/api/review", {}), ("/api/ads", {}),
                   ("/api/follow", {}))


def _start_ledger_services(settings: PeachSettings, contract, services) -> bool:
    """只读核对当前账本后，恢复任务并启动依赖账本的后台服务。"""
    try:
        # 上次从备份恢复没走完：先把账本收拾到确定的状态，再判它能不能用（ADR-0138）。
        ledger_backups.recover(settings.db_path)
    except Exception:
        LOGGER.exception('账本恢复标记未能处理')
    status = inspect_database(settings.db_path)
    if not status["readable"] or status["schema"] != "current":
        LOGGER.warning("数据库未就绪，依赖数据库的后台任务保持停止（数据库：%s；结构：%s）；数据库准备完成后重启服务。",
                       status["database"], status["schema"])
        return False
    _restore_task_center(contract)
    from .web_job_recovery import restore
    if contract.task_runs.enabled:
        restore(contract)
    for service in services:
        service.start()
    return True


async def _warm_ledger_aggregates(ledger_ready: bool, contract, stopping: asyncio.Event) -> None:
    """走和真实请求同一条分派，缓存键一致，页面第一次打开就是现成的。"""
    if not ledger_ready:
        return
    for path, args in WARM_AGGREGATES:
        if stopping.is_set():
            return
        try:
            await asyncio.to_thread(web_contract.dispatch_api_get, contract, path, args)
        except Exception:
            # 预热失败不影响服务启动，这一页照旧在第一次打开时自己算。
            LOGGER.debug("aggregate warmup failed: %s", path, exc_info=True)


def _server_error_headers(request: Request, error: Exception, status_code=500):
    """服务错误按路由模板关联；请求参数、正文与鉴权头留在请求中。"""
    if status_code < 500:
        return {}
    from .error_reporting import event
    error_id = uuid.uuid4().hex
    event('http-request', error, error_id=error_id, method=request.method,
          route=getattr(request.scope.get('route'), 'path', '<unmatched>').lstrip('/'), status_code=status_code)
    return {'X-Peach-Error-ID': error_id, 'Cache-Control': 'no-store'}


class _LedgerActivation:
    """账本就绪后拉起依赖账本的后台服务；退出时等它们收尾。"""

    def __init__(self, app, settings, contract, services):
        self.app, self.settings, self.contract, self.services = app, settings, contract, services
        self.stopping = asyncio.Event()
        self.lock = asyncio.Lock()

    async def start(self) -> bool:
        self.app.state.ledger_background_ready = False
        if not self.settings.configured:
            return False
        return await self.resume()

    async def resume(self) -> bool:
        async with self.lock:
            if self.stopping.is_set() or self.app.state.ledger_background_ready:
                return self.app.state.ledger_background_ready
            ready = await asyncio.to_thread(_start_ledger_services, self.settings, self.contract, self.services)
            self.app.state.ledger_background_ready = ready
            return ready

    async def stop(self) -> None:
        self.stopping.set()


def create_app(settings: PeachSettings | None = None) -> FastAPI:
    """测试直接建 app 时也走这条路径：不传设置就用默认设置。"""
    settings = settings or PeachSettings()
    database = LedgerDatabase(settings.db_path)
    contract = web_contract.WebContract(
        settings.db_path, settings.snapshot_root,
        candidate_root=settings.candidate_root,
        cover_root=settings.cover_root,
        avatar_root=settings.avatar_root,
        logo_root=settings.logo_root,
        poster_root=settings.poster_root,
        timeline_root=settings.timeline_root,
        photo_root=settings.photo_root,
        follow_state_root=settings.follow_state_root,
        entry_links_root=settings.entry_links_root,
        database=database,
    )
    repository = LedgerRepository(database)
    resolver = FFmpegResolver(settings.ffmpeg_root)
    http_transport = HttpxTransport()
    follow_media_resolver = FollowMediaResolver(http_transport, state_root=settings.follow_state_root).with_credential_loader(
        lambda provider: web_follow._credential_store(contract).load(provider))
    # 订阅检查、浏览与画面签名的取图共用这一份按站冷却：同一个站被限流，几处都得停。
    contract.follow_media_resolver = follow_media_resolver
    follow_cover_service = FollowCoverService(
        resolver, follow_media_resolver, settings.poster_root / "follow")
    contract.follow_faces = FollowFaceIndex(
        settings.poster_root / "follow-faces", http_transport,
        cover_root=settings.poster_root / "follow", gate=follow_media_resolver)
    # 网盘连接、取流与媒体装配：资产不再落到本地，播放要么 302 要么由这里转发 Range。
    drive = DriveConnections(settings, lambda: http_transport.client)
    streamer = build_streamer(drive.providers, lambda: http_transport.client)
    media_engine = MediaEngine(repository, streamer, cache_root=settings.photo_root.parent / "media-cache")
    # 扫描与同步：扫描起点来自设置里的网盘根，增量按游标、每日一次全量核对。
    scan_service = ScanService(drive.providers, repository, drive.roots_map())

    def after_scan(location: str, result) -> None:
        """新登记的行要探时长、与「想要」对账、把消失作品的个人记录接回来。

        扫描只负责登记；这三件事都靠 `new_ids` 认对象，所以挂在同步之后一次做完。
        探测在前：接回的第二条判据要比时长。
        """
        ids = list(result.new_ids)
        if not ids:
            return
        choice = resolver.ffprobe()
        media_probe.probe_missing(database, media_engine, choice.path if choice else None,
                                  asset_ids=ids)
        with closing(sqlite3.connect(database, timeout=30)) as connection:
            connection.row_factory = sqlite3.Row
            wants.reconcile(connection, ids)
            connection.commit()
        record_rehome.reattach_in(database, ids)

    drive_sync = DriveSync(scan_service, after=after_scan)
    drive.sync_state = drive_sync.state
    drive.refresh_hook = drive_sync.request
    preview_service = PreviewService(
        repository, resolver, settings.snapshot_root, settings.poster_root,
        settings.avatar_root, settings.logo_root,
    )
    photo_service = PhotoThumbnailService(settings.photo_root)
    sample_cache = SampleCache(sample_cache_root(settings.photo_root))
    entity_thumb_service = DerivedImageService(entity_thumb_root(settings.avatar_root))
    cover_thumb_service = DerivedImageService(cover_thumb_root(settings.cover_root),
                                              edge=COVER_THUMB_EDGE, quality=COVER_THUMB_QUALITY)
    cover_small_thumb_service = DerivedImageService(cover_thumb_root(settings.cover_root),
                                                    edge=COVER_SMALL_THUMB_EDGE,
                                                    quality=COVER_SMALL_THUMB_QUALITY)
    providers = default_registry()
    opencode_go = OpenCodeGoClient(transport=http_transport)
    follow_scheduler = FollowUpdateScheduler(
        settings.follow_state_root,
        lambda: web_follow.w_follow_check(contract, {"automatic": True}),
        available=True,
    )
    contract.follow_scheduler = follow_scheduler
    # 订阅源拉取（ADR-0042）用同一个调度实现，只换 job id、状态文件与默认间隔。
    # 默认 6 小时：一位女优的 JavDB 演员页一天更新几条，比这更密只是把 JavDB 的配额
    # 花在一张没变的页面上。6 小时是每个源的周期；调度每半小时看一次谁到期，各源按
    # 自己的相位错开（ADR-0134）。
    feed_scheduler = FollowUpdateScheduler(
        settings.follow_state_root,
        lambda: web_feeds.w_feed_check(contract, {"automatic": True}),
        available=True,
        job_id=FEED_JOB_ID,
        filename="feed-schedule.json",
        default=FollowScheduleConfig(enabled=True,
                                     interval_minutes=feeds.DEFAULT_INTERVAL_MINUTES),
        tick_minutes=feeds.TICK_MINUTES,
        unavailable_message="订阅源拉取只在写入端可用",
    )
    contract.feed_scheduler = feed_scheduler
    from .web_job_recovery import RecoveryService
    recovery_service = RecoveryService(contract, available=True)
    contract.task_runs.enabled = contract.task_runs.available()

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        services = (follow_scheduler, feed_scheduler, recovery_service)
        activation = _LedgerActivation(_app, settings, contract, services)
        _app.state.ledger_activation = activation
        ledger_ready = await activation.start()
        aggregate_stop = asyncio.Event()
        aggregate_warmup = asyncio.create_task(_warm_ledger_aggregates(ledger_ready, contract, aggregate_stop))
        sync_stop = asyncio.Event()
        sync_loop = asyncio.create_task(drive_sync.run(sync_stop))
        try:
            yield
        finally:
            await activation.stop()
            _app.state.ledger_background_ready = False
            aggregate_stop.set()
            sync_stop.set()
            await sync_loop
            recovery_service.stop()
            follow_scheduler.stop()
            feed_scheduler.stop()
            # to_thread 的查询在线程内释放连接后才算结束。
            await aggregate_warmup
            # 死链检查和资源对账的后台线程是 daemon，本来挡不住进程退出；这里显式收
            # 一下，免得在途的那一轮在解释器拆卸期间还继续查库、往没人读的状态里写。
            contract.stop_background_jobs()
            from . import face_models
            face_models.detach(contract.task_runs)
            http_transport.close()
            follow_media_resolver.close()

    app = FastAPI(
        title="Peach API",
        version=__version__,
        lifespan=lifespan,
        docs_url="/docs" if settings.docs_enabled else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.docs_enabled else None,
    )
    app.state.settings = settings
    app.state.database = database
    app.state.web_contract = contract
    app.state.repository = repository
    app.state.drive = drive
    app.state.scan = scan_service
    app.state.drive_sync = drive_sync
    app.state.media_engine = media_engine
    app.state.preview_service = preview_service
    app.state.photo_service = photo_service
    app.state.sample_cache = sample_cache
    app.state.entity_thumb_service = entity_thumb_service
    app.state.cover_thumb_service = cover_thumb_service
    app.state.cover_small_thumb_service = cover_small_thumb_service
    app.state.providers = providers
    app.state.opencode_go = opencode_go
    app.state.http_transport = http_transport
    app.state.follow_media_resolver = follow_media_resolver
    app.state.follow_cover_service = follow_cover_service
    app.state.follow_scheduler = follow_scheduler
    from .background_issues import IssueLog
    app.state.background_issues = IssueLog()
    app.state.external_playback_key = secrets.token_bytes(32)

    # 媒体两异常的统一出口，路由里不再手抄同一组 try/except。
    @app.exception_handler(MediaNotFound)
    def _media_not_found_handler(request: Request, exc: MediaNotFound):
        return JSONResponse({"error": "no such id"}, status_code=404)

    @app.exception_handler(MediaUnavailable)
    def _media_unavailable_handler(request: Request, exc: MediaUnavailable):
        return JSONResponse({"error": "unavailable"}, status_code=404)

    # 401 有两种形态，按路由类分组保留（不许统一成一种）：页面路由跳登录页，
    # 页面资产返回 PlainText 提示，API 与媒体路由返回 JSON。
    @app.exception_handler(PageLoginRequired)
    def _page_login_required_handler(request: Request, exc: PageLoginRequired):
        return RedirectResponse(
            "/login?next=" + quote(exc.next_path or "/", safe="/"), status_code=303,
        )

    @app.exception_handler(AssetLoginRequired)
    def _asset_login_required_handler(request: Request, exc: AssetLoginRequired):
        return PlainTextResponse("需要 ?t=口令", status_code=401)

    # 挂在 Starlette 的基类上：路由没匹配到的 404 是它抛的，不是 FastAPI 子类，
    # 只挂子类的话地址栏敲错一个字母仍会看到一行 JSON。
    @app.exception_handler(StarletteHTTPException)
    def _http_exception_handler(request: Request, exc: StarletteHTTPException):
        headers = _server_error_headers(request, exc, exc.status_code)
        detail = exc.detail
        if isinstance(detail, dict):
            # 表单校验那种带字段明细的 4xx：`message` 是总话，其余键原样带给页面。
            body = {"error": str(detail.get("message", "")), **{k: v for k, v in detail.items() if k != "message"}}
        else:
            body = {"error": _DEFAULT_DETAILS.get(str(detail), str(detail))}
        # 浏览器地址栏直接打开一个页面路径撞上 403／404／409 时，给人看的是一页话，
        # 不是一行 JSON；`/api/` 与脚本取数（Accept 里没有 text/html）照旧回 JSON。
        navigation = (request.method in {"GET", "HEAD"} and not request.url.path.startswith("/api/")
                      and "text/html" in request.headers.get("accept", ""))
        if navigation:
            return HTMLResponse(routes_pages.error_page(exc.status_code, body["error"]),
                                status_code=exc.status_code, headers=headers)
        return JSONResponse(body, status_code=exc.status_code, headers=headers)

    @app.exception_handler(Exception)
    def _server_exception_handler(request: Request, exc: Exception):
        headers = _server_error_headers(request, exc)
        return JSONResponse({'error': '服务处理失败，请导出诊断报告',
                             'error_id': headers['X-Peach-Error-ID']}, status_code=500, headers=headers)

    # 第三方前端依赖固定版本并随 Peach 自托管；断网时仍可播放。
    app.mount(
        "/vendor",
        StaticFiles(directory=settings.vendor_path, check_dir=False),
        name="vendor",
    )

    app.add_middleware(ResponseHeadersMiddleware)

    # JSON 契约、页面脚本与样式是仅有的几类大文本响应，压下去省的字节最多：
    # `/api/items`、主界面 bundle 与样式都通过内容类型选择压缩。
    # `add_middleware` 是 `insert(0)`，最后加的在最外层，所以压缩看到的是上面
    # ResponseHeadersMiddleware 补完 Cache-Control 之后的最终响应头。
    # 自己写内容类型闸门的 ASGI 中间件是重复劳动：Starlette 这个已经按 Content-Type
    # 排除、跳过 206 与已编码响应、逐块流式压缩，还会把大块丢到工作线程去压，
    # 不占事件循环。只需要把它的排除名单补齐（见 COMPRESSION_EXCLUDED_TYPES）。
    app.add_middleware(
        GZipMiddleware, exclude_content_types=COMPRESSION_EXCLUDED_TYPES,
    )

    # 健康检查常被 HEAD 探测（`curl -I`、各种 uptime 工具）。本仓库其他公开端点
    # 都显式声明了 GET+HEAD，只有这个漏了，HEAD 会拿到 405。
    @app.api_route("/healthz", methods=["GET", "HEAD"])
    def healthz(request: Request, ready: bool = False):
        from .health import database_status, readiness
        if ready:
            result = readiness(settings, background_ready=getattr(request.app.state, "ledger_background_ready", None))
            return JSONResponse(result, status_code=200 if result["ready"] else 503,
                                headers={"Cache-Control": "no-store"})
        # 不探测网盘、迁移数据库或读媒体字节；健康检查必须无副作用。
        ffmpeg = resolver.ffmpeg()
        from .diagnostics import health_components
        components = health_components(settings, {})
        return {"ok": True, "service": "peach-api", "version": __version__,
                "checks": components,
                # 这台机器跑过 `peach init` 没有。未配置时服务照常起，只是没有数据。
                "configured": settings.configured,
                # 这次请求的发起方能不能改这台机器的配置。它随调用方变化，只决定管理菜单里
                # 「设置」显不显示；拒绝写入的判定在端点自己那里。
                "configurable": routes_configuration.configurable(request),
                "db": database_status(settings.db_path),
                "ffmpeg": ffmpeg.source if ffmpeg else "unavailable",
                "drive": {location: drive.connection(location)["connected"]
                          for location in drive.providers},
        }

    # 顺序即契约：catch-all 最后。`routes_media` 里有 `/api/stream-plan` 这条具名 API，
    # 所以它也要排在 `routes_api` 之前。
    app.include_router(routes_auth.router)
    app.include_router(routes_pages.router)
    app.include_router(routes_configuration.router)
    app.include_router(routes_media.router)
    app.include_router(routes_api.router)
    return app
