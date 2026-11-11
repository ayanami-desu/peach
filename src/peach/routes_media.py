"""媒体字节的出口：播放、分片、字幕、缩图、封面、头像与外链圆标。

这一层只做取路径与拼响应头，不做媒体判断——能不能播、302 还是转发 Range，全在
`media`／`drive_stream` 里。两个媒体异常（`MediaNotFound`、`MediaUnavailable`）由
`api.py` 的异常处理器统一收口，路由里不要再手抄同一组 try/except。

有一条贯穿整层的规矩：**上游地址一律不外露**。`/stream`、`/cover-image`、
`/link-mark` 都只接受账本里的 id，自己去查地址；接受前端递过来的 URL 就等于开了一个
任意地址抓取的口子。
"""
from __future__ import annotations

import asyncio
import json
import logging
import re
import threading
from functools import partial
from pathlib import Path
from urllib.parse import quote, urlsplit

import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.responses import (
    FileResponse, JSONResponse, PlainTextResponse, RedirectResponse, Response,
)
from starlette.staticfiles import StaticFiles

from . import (
    avatar_face, avatar_picker, avatar_provider,
    images, jav_poster_crop, link_marks, link_status, scraping_access, site_icons,
    social_links, timeline_sheets, web_timeline_thumbnails,
)
from .config import GENERATED_DIR, PROJECT_ROOT
from .entities import resolve_entity_id
from .media import MediaUnavailable
from .upstream import UpstreamError, UpstreamTarget, open_upstream
from .previews import ENTITY_THUMB_TYPE, PreviewUnavailable, entity_image_key
from .remote_media_cache import AVATAR_REFRESH_SECONDS, FAVICON_REFRESH_SECONDS, cache_for
from .preview_cache import PreviewCache
from .routes_auth import require_auth
from .user_agent import USER_AGENT
from .remote_media_cache import MEDIA_SECURITY_HEADERS

router = APIRouter()

#: 下载文件名里不能出现的字符；正文其余部分原样保留。
_UNSAFE_FILENAME = re.compile('[\\/:*?"<>|]+|[\x00-\x1f]+')
LOGGER = logging.getLogger(__name__)

#: 生成物的缓存时长。这些端点按 asset id 取图：内容换了 id 也就换了
#: （封面重生成写的是新文件），所以一年也不嫌长。
#: 不加 immutable——那会让浏览器连刷新都不再回源，真要换图就只能干等过期。
MEDIA_CACHE_SECONDS = 365 * 24 * 3600

#: 头像单独短一档：id 不变但人会换头像，作者换得还挺勤。
AVATAR_CACHE_SECONDS = AVATAR_REFRESH_SECONDS


def _image_response(request: Request, path: Path, media_type: str | None = None):
    """固定图片 URL 使用私有缓存，并按文件 ETag 复验。"""
    response = FileResponse(path, media_type=media_type, stat_result=path.stat())
    response.headers.update(MEDIA_SECURITY_HEADERS)
    response.headers["Cache-Control"] = "private, no-cache"
    if StaticFiles().is_not_modified(response.headers, request.headers):
        return Response(status_code=304, headers={
            **MEDIA_SECURITY_HEADERS,
            "ETag": response.headers["etag"],
            "Cache-Control": response.headers["cache-control"],
        })
    return response


def _attachment_disposition(title: str, url: str) -> str:
    """按条目标题构造下载文件名，扩展名沿用上游地址的后缀。

    不回传上游地址：主机名和签名同样是不该外露的东西，和整层的边界一致。
    `filename*` 用 RFC 5987 编码，标题里的中文和日文才落得下来。
    """
    stem = _UNSAFE_FILENAME.sub(" ", str(title or "")).strip() or "peach-media"
    stem = " ".join(stem.split())[:120]
    suffix = Path(urlsplit(str(url or "")).path).suffix.lower()
    if not re.fullmatch(r"\.[a-z0-9]{2,5}", suffix):
        suffix = ".mp4"
    name = f"{stem}{suffix}"
    # 标题整条都是中日文时，ascii 回退会只剩空格和标点，浏览器落下来是个没名字的
    # 文件。回退名必须自己站得住，不能是「把非 ASCII 删掉之后剩下的」。
    ascii_stem = "".join(ch for ch in stem if ch.isascii() and (ch.isalnum() or ch in " -_[]().")).strip()
    ascii_name = f"{ascii_stem}{suffix}" if ascii_stem else f"peach-media{suffix}"
    return f"attachment; filename=\"{ascii_name}\"; filename*=UTF-8''{quote(name)}"


@router.post("/api/external-playback")
def external_playback(request: Request, id: int, args: dict[str, str] = Depends(require_auth)):
    from .external_playback import TTL_SECONDS, issue
    from .routes_auth import _origin_key
    from fastapi import HTTPException
    state = request.app.state
    state.media_engine.plan(id)
    supplied = request.headers.get('origin')
    raw = supplied or str(request.base_url)
    parsed = urlsplit(raw)
    if any(ord(char) <= 32 or ord(char) == 127 for char in raw) or parsed.username or parsed.password:
        raise HTTPException(400, '播放地址无效')
    key = _origin_key(raw)
    if key is None:
        raise HTTPException(400, '播放地址无效')
    scheme, host, port = key
    host = f'[{host}]' if ':' in host else host
    origin = f'{scheme}://{host}' + (f':{port}' if port is not None else '')
    ticket = issue(state.external_playback_key, id, origin=origin)
    query = f"ticket={ticket}&origin={quote(origin, safe='')}"
    path = f"/external-stream/{id}?{query}"
    playlist = f"/external-playlist/{id}.m3u?{query}"
    return JSONResponse({"url": path, "playlist": playlist, "expires_in": TTL_SECONDS},
                        headers={"Cache-Control": "no-store"})


def _external_asset(request: Request, asset_id: int, ticket: str, origin: str):
    from .external_playback import valid
    from fastapi import HTTPException
    state = request.app.state
    if not origin or not valid(state.external_playback_key, asset_id, ticket, origin=origin):
        raise HTTPException(401, "播放链接已失效，请在作品详情重新打开")
    return state.media_engine.asset(asset_id)


@router.api_route("/external-stream/{id}", methods=["GET", "HEAD"])
def external_stream(request: Request, id: int, ticket: str, origin: str = ''):
    asset = _external_asset(request, id, ticket, origin)
    return request.app.state.media_engine.response(request, asset)


@router.get("/external-playlist/{id}.m3u")
def external_playlist(request: Request, id: int, ticket: str, origin: str = ''):
    _external_asset(request, id, ticket, origin)
    url = origin + f"/external-stream/{id}?ticket={ticket}&origin={quote(origin, safe='')}"
    return PlainTextResponse(f"#EXTM3U\n#EXTINF:-1,Peach {id}\n{url}\n", media_type="audio/x-mpegurl",
                             headers={"Content-Disposition": f'attachment; filename="peach-{id}.m3u"',
                                      "Cache-Control": "no-store", "Referrer-Policy": "no-referrer"})


@router.api_route("/stream", methods=["GET", "HEAD"])
def stream(request: Request, id: int, session: str = "", args: dict[str, str] = Depends(require_auth)):
    """播放出口：能 302 的交给浏览器直连网盘，必须带鉴权的由 Peach 转发 Range。

    `session` 只用于前端把这次播放和活动记录对上，取字节不需要它。
    """
    state = request.app.state
    from .error_reporting import local_event
    local_event('playback-request', asset_id=id, method=request.method,
                range=request.headers.get('range', '')[:80], user_agent=request.headers.get('user-agent', '')[:512])
    asset = state.media_engine.asset(id)
    response = state.media_engine.response(request, asset)
    response.headers.update(MEDIA_SECURITY_HEADERS)
    response.headers["Cache-Control"] = "no-store"
    response.headers["Referrer-Policy"] = "no-referrer"
    local_event('playback-source', asset_id=id, mime_type=response.headers.get('content-type', ''))
    return response


@router.get("/api/stream-plan")
def stream_plan(request: Request, id: int, session: str = "", args: dict[str, str] = Depends(require_auth)):
    """播放计划：`protocol` 是 `redirect` 或 `proxy`，`src` 永远是 `/stream`。

    预授权地址不在此处下发：一次播放期间它会过期，而 `/stream` 每次重新问一次。
    """
    state = request.app.state
    asset = state.media_engine.asset(id)
    plan = state.media_engine.plan(id)
    from .error_reporting import local_event
    source = f"/stream?id={id}"
    if session:
        source += f"&session={quote(session, safe='')}"
    payload = {"id": id, "protocol": plan.protocol, "mime_type": plan.mime_type,
               "duration": asset.duration, "src": source, "reason": plan.reason}
    try:
        local_event('playback-plan', asset_id=id,
                    plan={key: payload.get(key) for key in ('protocol', 'mime_type', 'duration', 'reason')})
    except Exception:
        LOGGER.debug('播放诊断未取得', exc_info=True)
    return payload


@router.api_route("/thumb", methods=["GET", "HEAD"])
def thumbnail(request: Request, id: int, args: dict[str, str] = Depends(require_auth)):
    path = request.app.state.media_engine.file_for(id, thumbnail=True)
    return _image_response(request, path)


@router.api_route("/photo", methods=["GET", "HEAD"])
def photo(request: Request, id: int, args: dict[str, str] = Depends(require_auth)):
    """图片资产原图。灯箱看大图用这条，图片墙一律走 `/photo-thumb`。"""
    path = request.app.state.media_engine.file_for(id)
    return _image_response(request, path)


@router.api_route("/photo-thumb", methods=["GET", "HEAD"])
def photo_thumb(request: Request, id: int, args: dict[str, str] = Depends(require_auth)):
    """图片墙的缩略图。缓存复用前核对源文件代际。

    本地文件用保存的来源签名检查；网络资源由媒体层解析后核对。来源发生变化时生成对应缩略图。
    """
    state = request.app.state
    path = state.photo_service.cached(id)
    if path is None:
        try:
            path = state.photo_service.thumbnail(id, state.media_engine.file_for(id))
        except MediaUnavailable:
            path = state.photo_service.cached(id, offline=True)
            if path is None:
                raise
        except PreviewUnavailable:
            return JSONResponse({"error": "unavailable"}, status_code=404)
    return _image_response(request, path, media_type="image/jpeg")


def _sample_response(request: Request, code: str, n: int, *, thumb: bool):
    """番号样张的一张图（ADR-0068）。先问缓存；没有才按账本里那条地址下载一次。

    只接受番号与序号，地址由服务端从账本查：页面递不进上游地址。取不到一律 404，页面
    显示占位；下载失败在缓存里记一个标记，一天内不再为这一张出网。
    """
    from . import sample_images

    state = request.app.state
    cache = state.sample_cache
    path = cache.cached(code, n, thumb=thumb)
    if path is None:
        contract = state.web_contract
        with contract.read_connection() as connection:
            url = sample_images.sample_url(connection, code, n)
        if url is not None and not cache.failed_recently(code, n):
            path = cache.fetch(code, n, url, sample_images.downloader(contract.secrets_root),
                               thumb=thumb)
    if path is None:
        return JSONResponse({"error": "unavailable"}, status_code=404)
    return _image_response(request, path, media_type="image/jpeg")


@router.api_route("/sample-thumb", methods=["GET", "HEAD"])
def sample_thumb(request: Request, code: str = "", n: int = 0,
                 args: dict[str, str] = Depends(require_auth)):
    """照片墙上那一档样张缩略图，宽度与 `/photo-thumb` 相同。"""
    return _sample_response(request, code, n, thumb=True)


@router.api_route("/sample-image", methods=["GET", "HEAD"])
def sample_image(request: Request, code: str = "", n: int = 0,
                 args: dict[str, str] = Depends(require_auth)):
    """灯箱里看的样张原图。"""
    return _sample_response(request, code, n, thumb=False)


@router.api_route("/poster", methods=["GET", "HEAD"])
def poster(request: Request, id: int, c: int = 4, args: dict[str, str] = Depends(require_auth)):
    """作品卡的预览格。取不到时 `reason` 交出卡在哪一步，卡片据此写原因、决定给哪颗按钮。"""
    try:
        path = request.app.state.preview_service.poster(id, c)
    except PreviewUnavailable as exc:
        return JSONResponse({"error": "unavailable", "reason": str(exc)}, status_code=404)
    return _image_response(request, path, media_type="image/jpeg")


@router.api_route("/timeline", methods=["GET", "HEAD"])
def timeline(request: Request, id: int, s: int = 0, args: dict[str, str] = Depends(require_auth)):
    """时间轴预览的一张接触印相。只发已经铺好的，没铺到就排一趟后台生成。

    `/poster` 那条取不到会当场抽一帧，因为九宫格只要九张。这里一张图是一百帧，现抽要
    几分钟，悬停的人早走了；没铺到就回 404，页面退回九宫格，后台那次铺完再来就有。
    """
    contract = request.app.state.web_contract
    if id <= 0 or s < 0:
        return JSONResponse({"error": "unavailable"}, status_code=404)
    path = timeline_sheets.sheet_path(contract.timeline_root, id, s)
    if not path.is_file():
        web_timeline_thumbnails.ensure_sheet(request.app.state, id)
        return JSONResponse({"error": "unavailable"}, status_code=404)
    return _image_response(request, path, media_type="image/jpeg")


@router.api_route("/cover", methods=["GET", "HEAD"])
def cover(request: Request, code: str = "", thumb: int = 0,
          args: dict[str, str] = Depends(require_auth)):
    """官方封套原图。存原图不裁：4:3 与 16:9 两种版式在界面上按比例取景。

    `thumb` 是派生档的档次：`1` 是长边 1600 那一档（`COVER_THUMB_EDGE`），`2` 是卡片网格
    的起始档、长边 800（`COVER_SMALL_THUMB_EDGE`）；不带就是原件，详情与裁切取原件。
    档次而不是像素数，理由同 `/entity-image`：尺寸由服务端定死，页面只挑档。
    """
    path = request.app.state.web_contract.cover_path(code)
    if path is None:
        return JSONResponse({"error": "no cover"}, status_code=404)
    if thumb:
        state = request.app.state
        service = state.cover_small_thumb_service if thumb == 2 else state.cover_thumb_service
        derived = service.thumbnail(path.stem, path)
        if derived is not None:
            return _image_response(request, derived, media_type=ENTITY_THUMB_TYPE)
    return _image_response(request, path, media_type="image/jpeg")


@router.post("/api/cover-crop")
async def cover_crop(request: Request, args: dict[str, str] = Depends(require_auth)):
    """人自己框的正封那一块，或者把它撤掉换回算出来的那个。

    写的是封面旁边的 `.poster.json`，不生成第二张图片：正封本来就不是一张新图，
    而是一组坐标（`jav_poster_crop` 的约定）。所以封面原图一个字节都不动，撤掉
    手工框就是删掉这份 sidecar，下一次取景重新按折痕判据算。

    `box` 是源图像素的 `{x0,y0,x1,y1}`，右下开区间；`box` 为 null 表示恢复默认。
    读图、算折痕与写 sidecar 都在线程里做：这是异步端点，同步读写会停住整个服务的送流。
    """
    sent = await request.json()
    payload = sent if isinstance(sent, dict) else {}
    return await asyncio.to_thread(_apply_cover_crop, request.app.state.web_contract, payload)


def _apply_cover_crop(state, payload: dict):
    code = str(payload.get("code") or "")
    path = state.cover_path(code)
    if path is None:
        return JSONResponse({"error": "这个番号没有封面"}, status_code=404)
    size = images.measure_image_size(path.read_bytes())
    if size is None:
        return JSONResponse({"error": "这张封面读不出来"}, status_code=422)
    if payload.get("box") is None:
        # 恢复默认是当场按折痕判据重算一遍，不是删掉 sidecar：删掉之后没有人会
        # 再来算，页面拿到的是「这张图不该裁」，正封从此再也回不来。
        def read_evidence(suffix):
            try:
                value = json.loads(path.with_suffix(suffix).read_text(encoding='utf-8'))
                return value if isinstance(value, dict) else {}
            except (OSError, ValueError):
                return {}
        face = read_evidence('.face.json')
        current_face = face.get('px') == list(size)
        title = (jav_poster_crop.read_sidecar(path) or {}).get('title') or read_evidence('.scraping.json').get('title', '')
        record = jav_poster_crop.crop_record(
            code, size[0], size[1], jav_poster_crop.file_gradient(path), title=title,
            face=face.get('face') if current_face else None)
        if current_face and face.get('layout') == 'still':
            record['box'] = dict(x0=0, y0=0, x1=size[0], y1=size[1], method=jav_poster_crop.NONE)
    else:
        record = jav_poster_crop.manual_record(size[0], size[1], payload.get("box"))
    if record is None:
        return JSONResponse({"error": "框选的区域不成立"}, status_code=400)
    jav_poster_crop.write_sidecar(path, record)
    state.cache_bust()
    return JSONResponse({"ok": True, "code": code,
                         "poster_box": jav_poster_crop.projection(record)})


@router.api_route("/endcard-frame", methods=["GET", "HEAD"])
def endcard_frame(request: Request, id: int, name: str, args: dict[str, str] = Depends(require_auth)):
    """Serve only generated OCR evidence frames, never a client-provided path."""
    if (id <= 0 or not name.endswith(".png") or "/" in name or "\\" in name
            or name.startswith(".")):
        return JSONResponse({"error": "invalid frame"}, status_code=400)
    root = (request.app.state.settings.candidate_root
            / "endcard-evidence" / str(id)).resolve()
    path = (root / name).resolve()
    if path.parent != root or not path.is_file():
        return JSONResponse({"error": "no frame"}, status_code=404)
    response = FileResponse(path, media_type="image/png")
    response.headers["Cache-Control"] = f"private, max-age={MEDIA_CACHE_SECONDS}"
    return response


@router.api_route("/avatar", methods=["GET", "HEAD"])
def avatar(request: Request, id: int, args: dict[str, str] = Depends(require_auth)):
    try:
        path = request.app.state.preview_service.avatar(id)
    except PreviewUnavailable:
        return JSONResponse({"error": "unavailable"}, status_code=404)
    return _image_response(request, path, media_type="image/jpeg")



#: 人脸探针，题材头像与换头像按番号取的封面共用。YuNet 的模型是个 232 KB 的 ONNX，
#: 首次用到时才去取；取不到时回 None，圆标退回样式表里的默认取景、封面退回正封取景
#: ——没网不该等于这一排一张图都没有。取不到之后隔 `avatar_face.RETRY_SECONDS` 再试。
_WORK_FACE_PROBE = avatar_face.FaceProbe()


@router.api_route("/cover-image", methods=["GET", "HEAD"])
def cover_image(request: Request, code: str, args: dict[str, str] = Depends(require_auth)):
    """库外作品的官方封面：按番号在服务端查地址，经 Peach 的出网设置取图并落盘缓存。

    取不到一律回 404 且不缓存：卡片按 `data-drop` 换成占位，网络恢复后下一次加载重取。
    DMM 缺图时 302 到同一主机族上的「NOW PRINTING」占位图，跟到那一跳也算取不到。
    """
    from .jav_cover_fetch import COVER_PROXY_HOSTS, PLACEHOLDER, candidate_for
    from .web_jav_detail import detail_code, stored_cover_url
    state = request.app.state
    try:
        url = stored_cover_url(state.web_contract, detail_code({"code": code}))
        if not url:
            raise ValueError("封面未取得")
        cache = cache_for(state.web_contract)
        key = f"cover:{url}"
        hit = cache.response(key, request)
        if hit is not None:
            return hit
        target = UpstreamTarget(url, candidate_for(url).referer, allowed_hosts=COVER_PROXY_HOSTS)
        def fetch():
            upstream = open_upstream(state.http_transport.client, request.method, target, incoming=request.headers)
            if PLACEHOLDER.search(str(upstream.url)):
                upstream.close()
                raise UpstreamError("上游给的是「准备中」占位图")
            return upstream
        return cache.stream(key, request, fetch)
    except (ValueError, UpstreamError, OSError, httpx.HTTPError):
        return Response(status_code=404, headers={"cache-control": "no-store"})


#: 来源图片只按位图回给浏览器：同源下发 SVG 等于让来源在 Peach 的源里跑脚本。
_JAV_IMAGE_TYPES = frozenset({"image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"})


@router.api_route("/jav-image", methods=["GET", "HEAD"])
def jav_image(request: Request, code: str, image: str = "cover", args: dict[str, str] = Depends(require_auth)):
    """库外作品的来源图片（样张、来源封面、来源头像），以图片本身回给 `<img>`。

    字节来自远程媒体缓存，取过一次不再出网；带内容摘要的 ETag 与 `private, max-age`，
    再开同一部作品由浏览器缓存直接给。取不到回 404 且不缓存，页面换成「未取得」并可重试。
    """
    import hashlib
    from .images import sniff
    from .web_jav_detail import jav_image as source_image
    try:
        body, max_age = source_image(request.app.state.web_contract, {"code": code, "image": image})
    except (ValueError, OSError):
        return Response(status_code=404, headers={"cache-control": "no-store"})
    media_type = sniff(body)
    if media_type not in _JAV_IMAGE_TYPES:
        return Response(status_code=404, headers={"cache-control": "no-store"})
    headers = {"etag": f'"{hashlib.sha256(body).hexdigest()[:32]}"',
               "cache-control": f"private, max-age={max_age}"}
    if headers["etag"] in request.headers.get("if-none-match", ""):
        return Response(status_code=304, headers=headers)
    return Response(b"" if request.method == "HEAD" else body, media_type=media_type,
                    headers={**headers, "content-length": str(len(body))})


def _jav_preview_target(url: str) -> UpstreamTarget:
    """已验证的预览来源使用固定主机范围，其他 CDN 逐跳核对公网解析。"""
    return UpstreamTarget(url, allowed_hosts=("www.prestige-av.com", "jdforrepam.com", "cc3001.dmm.co.jp",
                                                  "ygp.blxr5es.com"), public_hosts=True)


@router.api_route("/jav-preview/{code}/{ref}", methods=["GET", "HEAD"])
def jav_preview(request: Request, code: str, ref: str, args: dict[str, str] = Depends(require_auth)):
    from .web_jav_detail import detail_code
    cache = cache_for(request.app.state.web_contract)
    previews = PreviewCache(cache)
    try:
        code = detail_code({"code": code})
        source = previews.source(code, ref)
        url = source["url"]
        target = _jav_preview_target(url)
        client = request.app.state.http_transport.client
        def upstream(method, target, incoming):
            return open_upstream(client, method, target, incoming=incoming)
        if source["playlist"]:
            def fetch(url):
                response = upstream("GET", _jav_preview_target(url), {})
                try:
                    chunks, size = [], 0
                    for chunk in response.iter_bytes():
                        size += len(chunk)
                        if size > 1024 * 1024:
                            raise ValueError("预览清单过大")
                        chunks.append(chunk)
                    return b"".join(chunks)
                finally:
                    response.close()
            body = previews.playlist(code, ref, fetch)
            return Response(b"" if request.method == "HEAD" else body, media_type="application/vnd.apple.mpegurl",
                            headers={"cache-control": "private, no-cache", "content-length": str(len(body))})
        def media():
            response = upstream(request.method, target, request.headers)
            if source.get('media_type') == 'video/mp4':
                kind = response.headers.get('content-type', '').split(';')[0].lower()
                if kind not in {'video/mp4', 'application/octet-stream', 'binary/octet-stream'}:
                    response.close()
                    raise UpstreamError('视频预览响应未取得')
                response.headers['content-type'] = 'video/mp4'
            return response
        return cache.stream(f"preview:{code}:{ref}", request, media)
    except (ValueError, OSError, UpstreamError, httpx.HTTPError):
        return Response(status_code=404, headers={"cache-control": "no-store"})


@router.api_route("/logo", methods=["GET", "HEAD"])
def logo(request: Request, studio: str = "", variant: str = "",
         args: dict[str, str] = Depends(require_auth)):
    try:
        path, content_type = request.app.state.preview_service.logo(studio, variant)
    except PreviewUnavailable:
        return JSONResponse({"error": "unavailable"}, status_code=404)
    response = FileResponse(path, media_type=content_type)
    # Logo 可以缓存，但文件会在人工批准或重新归一后原地替换。固定 URL 若缓存
    # 一整天，浏览器会继续显示旧图；no-cache 会复用本地副本并用 ETag 重验。
    response.headers["Cache-Control"] = "public, no-cache"
    return response


#: 站点圆标取不到后隔多久再试：断网时每个外链都会各等 8 秒，一小时够站点恢复。
SITE_MARK_RETRY_SECONDS = 3600


def _site_mark_response(state, url: str, root: Path):
    """站点圆标的取图、挑图、合成与缓存；调用方负责先把地址查出来。

    地址一律由服务端自己从某张表或账本解析，函数本身不判断来路——但它是唯一会
    真的去连对方站点的地方，所以每个调用方都得先说清自己的地址从哪来。

    取不到时留一个 `.failed` 标记，`SITE_MARK_RETRY_SECONDS` 内不再出网：一次
    取图要试首页、manifest 和几个候选，各等 8 秒，断网时资料页每枚外链都重跑一遍，
    图标区就一直卡着。标记期间有旧图发旧图，没有就 404 露出地球图标。
    """
    # 存档链接按快照保存的原站找图标，缓存也按原站存：缓存键只看主机，按存档地址存，
    # 所有存档链接就共用 web.archive.org 那一枚。
    page, locate = social_links.archive_view(url)
    cached = link_marks.cached_path(root, page)
    if cached is None:
        return JSONResponse({"error": "unavailable"}, status_code=404)
    marker = cached.with_suffix(".failed")
    if (not link_marks.is_fresh(cached, ttl=FAVICON_REFRESH_SECONDS)
            and not link_marks.is_fresh(marker, ttl=SITE_MARK_RETRY_SECONDS)):
        def fetch(target: str):
            try:
                upstream = state.http_transport.client.get(
                    locate(target), headers={"User-Agent": USER_AGENT},
                    timeout=8, follow_redirects=True)
            except (OSError, ValueError, httpx.HTTPError, httpx.InvalidURL):
                # 重定向到主机名过不了 IDNA 的地址时传输层抛 ValueError，地址本身不合法时
                # 抛 InvalidURL；两者都不是 HTTPError，同样算取不到。
                return None
            if upstream.status_code != 200 or not upstream.content:
                return None
            return upstream.content, upstream.headers.get("content-type", "")

        # 两条通道都不适用时退回原样缩图：糊一点也好过露出地球图标。存档链接例外：原站
        # 给不出合格的圆标就用存档站自己的图标，点过去本来就是存档。原站那张不合格的图
        # 原样缩进来是变形的：ONE'S DOUBLE 只留下 7:1 的横排字标。
        archived = page != url
        made = site_icons.best_mark(page, fetch, link_marks.render_mark,
                                    fallback=None if archived else link_marks.plain_mark)
        if made is None and archived:
            made = site_icons.best_mark(url, fetch, link_marks.render_mark,
                                        fallback=link_marks.plain_mark)
        root.mkdir(parents=True, exist_ok=True)
        if made:
            cached.write_bytes(made)
            marker.unlink(missing_ok=True)
        else:
            marker.write_bytes(b"")
    if not cached.exists():
        # 取不到就让前端露出下面的地球图标，不要留一个空白圆。
        return JSONResponse({"error": "unavailable"}, status_code=404)
    result = FileResponse(cached, media_type="image/png")
    result.headers["Cache-Control"] = "public, no-cache"
    return result


@router.api_route("/link-mark", methods=["GET", "HEAD"])
def link_mark(request: Request, id: int = 0, args: dict[str, str] = Depends(require_auth)):
    """资料页外链的圆标：站点自己最好的那份图标资产，能上色就上色。

    地址只从账本按链接 id 解析，绝不接受前端递过来的 URL——和 `/stream`
    同一条规矩，否则这就是一个任意地址抓取的口子。取哪一份交给 `site_icons`：
    先读首页声明的 apple-touch-icon / SVG / manifest，都没有才落到 favicon.ico。

    标记为失效的链接不取：那个域名多半已被停放，首页是一段跳转脚本，抓它只会让
    杀毒软件把 Peach 报成在访问跳转页。
    """
    state = request.app.state
    with state.database.read_connection() as connection:
        row = connection.execute(
            "SELECT url, metadata_json FROM entity_link WHERE id=?", (id,)).fetchone()
    if row is None or link_status.gone_mark(row["metadata_json"]) is not None:
        return JSONResponse({"error": "no such link"}, status_code=404)
    return _site_mark_response(state, row["url"], GENERATED_DIR / "link-marks")


@router.api_route("/site-mark", methods=["GET", "HEAD"])
def site_mark(request: Request, source: str = "",
              args: dict[str, str] = Depends(require_auth)):
    """采集来源的已核对 favicon。

    参数不是地址，是键：`source` 查 `scraping_access.SOURCES`，不在表里就是 404。
    和 `/link-mark` 同一条规矩——服务端只取自己已经知道的地址，绝不取前端递来的任意 URL。

    图标由服务端取有三样浏览器拿不到的东西：`site_icons` 会问站点自己声明的
    apple-touch-icon、SVG 和 manifest，而直连只够拿一枚 16px 的 `/favicon.ico`；
    要代理才通的站点在这里照样有图；浏览器不必向对方站点发请求，也就不必按站
    报出「在看哪些站」。
    """
    spec = scraping_access.SOURCES.get(source) if source else None
    if spec is None:
        return JSONResponse({"error": "no such source"}, status_code=404)
    # 来源身份使用已核对的原图，保留站点 favicon 的颜色和画布。
    icon = PROJECT_ROOT / "resources" / "site-marks" / f"{source}.png"
    if icon.is_file():
        result = FileResponse(icon, media_type="image/png")
        result.headers["Cache-Control"] = "public, no-cache"
        return result
    return _site_mark_response(request.app.state, spec["login"], GENERATED_DIR / "site-marks")


@router.api_route("/entity-image", methods=["GET", "HEAD"])
def entity_image(request: Request, kind: str, id: int, thumb: int = 0,
                 args: dict[str, str] = Depends(require_auth)):
    """实体图。`thumb=1` 要的是索引页那一档派生件，不带就是资料页用的原件。

    开关是布尔而不是像素数：尺寸由服务端一处定死，页面递多少像素进来就等于让每个
    调用点各存一份尺寸，改一次得追七处，而缓存目录里会长出一堆只差几十像素的派生件。
    """
    state = request.app.state
    try:
        path, content_type = state.preview_service.entity_image(kind, id)
    except PreviewUnavailable:
        # 并入别人的实体没有自己的图：按墓碑跳到现在那一条。只在取不到时查库，
        # 索引页一屏几百张图的常规路径不多一次查询。
        target = current_entity_id(state.web_contract, id)
        if target != id:
            # 只换 id，其余参数（缩略图开关、口令）原样带上；写相对地址，不依赖反代给的主机名。
            moved = request.url.include_query_params(id=target)
            return RedirectResponse(f"{moved.path}?{moved.query}", status_code=307)
        return JSONResponse({"error": "unavailable"}, status_code=404)
    if thumb:
        derived = state.entity_thumb_service.thumbnail(entity_image_key(kind, id), path)
        if derived is not None:
            path, content_type = derived, ENTITY_THUMB_TYPE
    return _image_response(request, path, media_type=content_type)


def current_entity_id(contract, entity_id: int) -> int:
    """页面递来的实体 id 按合并墓碑换成现在的实体；解析不到就原样返回，交给接口自己的判据。"""
    if entity_id <= 0:
        return entity_id
    with contract.read_connection() as connection:
        return resolve_entity_id(connection, entity_id) or entity_id


def _picker_roots(state) -> tuple[Path, Path]:
    """(候选缓存按来源分的根, 装头像的目录)。"""
    return (state.candidate_root / "provider-cache" / "performer-avatars",
            state.avatar_root)


def _picker_kind(kind: str) -> str:
    return kind if kind in {"performer", "creator"} else "performer"


_INDEX_REFRESHER_LOCK = threading.Lock()


def _index_refresher(app) -> avatar_picker.IndexRefresher:
    """这个应用的图库索引刷新器，第一次用到时建，之后一直是同一个。

    出网走采集统一出口：Peach 代理设置与按站冷却都在那里。
    """
    with _INDEX_REFRESHER_LOCK:
        refresher = getattr(app.state, "gfriends_index", None)
        if refresher is None:
            contract = app.state.web_contract

            refresher = avatar_picker.index_refresher(contract)
            app.state.gfriends_index = refresher
        return refresher


def _picker_artwork(request: Request) -> avatar_picker.ArtworkSource:
    """作品画面的取图口。九宫格没铺过就现抽一格，和 `/poster` 走同一条路。"""
    state = request.app.state

    def frame(asset_id: int, cell: int):
        try:
            return state.preview_service.poster(asset_id, cell)
        except PreviewUnavailable:
            return None

    return avatar_picker.ArtworkSource(
        cover_root=state.web_contract.cover_root, frame=frame)


def _remember_library(providers_root: Path, body: bytes, origin: dict,
                      inspected: avatar_provider.InspectedAvatar) -> None:
    """图库图取过一次就按地址留进缓存，翻第二遍、框它、装它都不再出网。"""
    if str(origin.get("provider")) == "gfriends":
        cache = avatar_provider.AvatarCandidateCache(
            providers_root / avatar_picker.GFRIENDS_CACHE)
        cache.store(str(origin.get("upstream_url") or ""), body, inspected)



@router.get("/api/avatar-choices")
def avatar_choices(request: Request, kind: str = "performer", id: int = 0,
                   args: dict[str, str] = Depends(require_auth)):
    """这个人还能换成哪些图。只读本地缓存，不等联网。

    图库索引缺失或过期时在后台刷新，返回刷新状态供当前窗口读取新候选。
    """
    state = request.app.state.web_contract
    providers_root, avatar_root = _picker_roots(state)
    id = current_entity_id(state, id)
    with state.read_connection() as connection:
        listing = avatar_picker.choices(
            connection, providers_root, avatar_root, _picker_kind(kind), id,
            cover_root=state.cover_root)
    refresher = _index_refresher(request.app)
    queued = refresher.request()
    listing["index_refreshing"] = bool(queued or refresher.refreshing or (
        listing["index_stale"] and not avatar_picker.gfriends.index_stale(refresher.cache_dir)))
    listing["index_error"] = refresher.error
    return JSONResponse(listing)


@router.api_route("/avatar-choice", methods=["GET", "HEAD"])
def avatar_choice(request: Request, kind: str = "performer", id: int = 0,
                  ref: str = "", args: dict[str, str] = Depends(require_auth)):
    """候选的预览图。

    页面只递 `ref`，地址由服务端按索引拼——这一层的规矩在文件开头：接受前端递过来的
    URL 就等于开了一个任意地址抓取的口子。取过一次就进内容寻址缓存，翻第二遍不出网。
    """
    state = request.app.state.web_contract
    providers_root, _ = _picker_roots(state)
    id = current_entity_id(state, id)
    with state.read_connection() as connection:
        try:
            body, origin = avatar_picker.resolve(
                ref, connection, providers_root, id,
                request.app.state.http_transport, _picker_artwork(request))
            body = avatar_picker.prepare_image(body)
        except avatar_picker.PickerError as error:
            return JSONResponse({"error": str(error)}, status_code=404)
    inspected = avatar_provider.inspect_avatar(body)
    if inspected is None:
        return JSONResponse({"error": "这不是一张能识别的图片"}, status_code=415)
    _remember_library(providers_root, body, origin, inspected)
    result = Response(b"" if request.method == "HEAD" else body,
                      media_type=inspected.mime_type)
    # 封面会原地替换，可以缓存这么久是因为它的地址带着 `v`（`Choice.version`）：封面一换，
    # 页面要的就是另一个地址。
    result.headers["Cache-Control"] = f"private, max-age={AVATAR_CACHE_SECONDS}"
    return result


async def _picker_request(request: Request) -> tuple[dict, bytes]:
    """换头像那几个端点的请求：JSON 一份参数，或者请求体是图片字节、参数走查询串。"""
    content_type = (request.headers.get("content-type") or "").split(";")[0].strip()
    if content_type == "application/json":
        sent = await request.json()
        return (sent if isinstance(sent, dict) else {}), b""
    return dict(request.query_params), await request.body()


def _picker_entity(state, payload: dict) -> int:
    """请求里的实体 id，换算成现在那一条；缺了或不成数是 0。"""
    try:
        entity_id = int(payload.get("id") or 0)
    except (TypeError, ValueError):
        return 0
    # 页面开着时实体被并入别人，换上的图要落到现在那一条名下，不留成孤立文件。
    return current_entity_id(state, entity_id) if entity_id > 0 else 0


def _picker_crop(raw: object) -> object:
    """请求里的框。JSON 给的是一个对象；本机文件那一路走查询串，写成 `x0,y0,x1,y1`。"""
    if isinstance(raw, str) and raw.count(",") == 3:
        return dict(zip(("x0", "y0", "x1", "y1"), raw.split(",")))
    return raw


@router.post("/api/avatar-frame")
async def avatar_frame(request: Request, args: dict[str, str] = Depends(require_auth)):
    """一张图进框选之前：量出转正后的尺寸，检出脸给默认框。不装。

    - `ref`：候选网格里的那一格。图库图还没取过就像预览那样取一次、留进缓存
    - `url`：手填的地址。过公网判据后取一次、按地址留进缓存，交回一格 `url:` 候选，
      框选、确认都读这一份
    - 请求体直接是图片字节：本机图片转换后留作预览候选，确认时浏览器提交原字节
    """
    state = request.app.state.web_contract
    providers_root, _ = _picker_roots(state)
    payload, body = await _picker_request(request)
    ref, url = str(payload.get("ref") or ""), str(payload.get("url") or "")
    probe = _WORK_FACE_PROBE.on_bytes
    transport = request.app.state.http_transport

    def library() -> avatar_picker.Choice:
        entity_id = _picker_entity(state, payload)
        with state.read_connection() as connection:
            found, origin = avatar_picker.resolve(
                ref, connection, providers_root, entity_id, transport,
                _picker_artwork(request))
        found = avatar_picker.prepare_image(found)
        _remember_library(providers_root, found, origin, avatar_picker.accept_image(found))
        return avatar_picker.framed(ref, found, probe, source="", label="")

    try:
        if ref:
            choice = await asyncio.to_thread(library)
        elif url:
            if not avatar_picker.allowed_source(url):
                return JSONResponse(
                    {"error": "只接受指向公网的 https 地址"}, status_code=400)
            choice = await asyncio.to_thread(
                avatar_picker.typed_address, url, providers_root,
                partial(avatar_picker.fetch_image, transport), probe)
        elif body:
            choice = await asyncio.to_thread(
                avatar_picker.uploaded, body, providers_root, probe,
                label=str(payload.get("name") or ""))
        else:
            return JSONResponse({"error": "没有可用的图片"}, status_code=400)
    except avatar_picker.PickerError as error:
        return JSONResponse({"error": str(error)}, status_code=400)
    return JSONResponse(choice.as_dict())


@router.post("/api/avatar-pick")
async def avatar_pick(request: Request, args: dict[str, str] = Depends(require_auth)):
    """换头像。几种来源共用这一个出口，区别只在字节从哪来。

    - `ref`：服务端自己列出来的候选（图库同名图、这个人取过的图、他作品里的画面），
      或经 `/api/avatar-frame` 取过、留在缓存里的番号封面与手填地址
    - 请求体直接是图片字节：用户从本机选的文件，浏览器原样发过来

    `crop` 是各路共用的一道可选工序：给了框就先按源图像素切一块再装。作品画面
    那一路必须给框——横图整张装进圆框只剩一块背景。被切的原图一个字节都不动。

    被顶下来的那张不删也不搬：它按内容哈希躺在候选缓存里，下次出现在候选列表的
    「用过的」那一组，换回去只是再装一次。
    """
    state = request.app.state.web_contract
    providers_root, avatar_root = _picker_roots(state)
    payload, body = await _picker_request(request)
    kind = _picker_kind(str(payload.get("kind") or "performer"))
    ref = str(payload.get("ref") or "")
    version = payload.get("version")
    box = _picker_crop(payload.get("crop"))
    def confirm():
        entity_id = _picker_entity(state, payload)
        if entity_id <= 0:
            raise avatar_picker.PickerError('缺少实体 id')
        selected = body
        if ref:
            with state.read_connection() as connection:
                selected, origin = avatar_picker.resolve(
                    ref, connection, providers_root, entity_id,
                    request.app.state.http_transport, _picker_artwork(request),
                    version=version if isinstance(version, str) else None)
            selected = avatar_picker.prepare_image(selected)
            _remember_library(providers_root, selected, origin, avatar_picker.accept_image(selected))
        elif selected:
            selected = avatar_picker.prepare_image(selected)
            origin = {"source": "avatar picker", "provider": "upload",
                      "external_id": str(payload.get("name") or "")}
        else:
            raise avatar_picker.PickerError('没有可用的图片')
        if box not in (None, ""):
            selected, cropped = avatar_picker.crop(selected, box)
            origin = {**origin, **cropped}
        origin = {**origin, "user_selected": True}
        result = avatar_picker.install(providers_root, avatar_root, kind,
                                       entity_id, selected, origin)
        return entity_id, result

    try:
        entity_id, result = await asyncio.to_thread(confirm)
    except avatar_picker.PickerError as error:
        return JSONResponse({"error": str(error)}, status_code=400)
    # 页面按这份索引决定「出 `<img>` 还是首字母垫底」，换完不失效就看不到新图。
    state.cache_bust()
    return JSONResponse({"ok": True, "kind": kind, "id": entity_id, **result})


#: 按番号去官方渠道取一张封面的预算。人在弹层里等着，挑不出就报原因，不能一直转。
CODE_COVER_SECONDS = 60


def _official_cover(contract, key: str) -> bytes:
    """官方渠道里这个番号最大的那张封面，和重探封面走同一个 `best_cover`。"""
    from .catalog_rules import is_korean_mib_code
    from .jav_cover_fetch import (
        MIB_NOT_JAV, DeadlineExceeded, NotFound, Unavailable, official_cover,
    )

    if is_korean_mib_code(key):
        raise avatar_picker.PickerError(MIB_NOT_JAV)
    try:
        _candidate, _size, data = official_cover(contract, key, seconds=CODE_COVER_SECONDS)
    except NotFound as error:
        raise avatar_picker.PickerError("官方渠道没有这个番号的封面") from error
    except Unavailable as error:
        raise avatar_picker.PickerError(f"取不到这个番号的封面：{error}") from error
    except DeadlineExceeded as error:
        raise avatar_picker.PickerError(
            f"{CODE_COVER_SECONDS} 秒内没取到这个番号的封面，稍后再试") from error
    return data


@router.post("/api/avatar-code-cover")
async def avatar_code_cover(request: Request, args: dict[str, str] = Depends(require_auth)):
    """按番号拿一张封面给换头像框选，番号不必在馆藏里。

    本机有就读本机，没有才去官方渠道取，取到的留在候选缓存里；这里只取图，装不装由
    框选之后的 `/api/avatar-pick` 决定。
    """
    from .metadata import validate_provider_code

    state = request.app.state.web_contract
    providers_root, _ = _picker_roots(state)
    sent = await request.json()
    payload = sent if isinstance(sent, dict) else {}
    try:
        code = validate_provider_code(str(payload.get("code") or ""))
    except ValueError:
        return JSONResponse({"error": "认不出这个番号"}, status_code=400)
    try:
        choice = await asyncio.to_thread(
            avatar_picker.code_cover, code, state.cover_root, providers_root,
            partial(_official_cover, state), _WORK_FACE_PROBE.on_bytes)
    except avatar_picker.PickerError as error:
        return JSONResponse({"error": str(error)}, status_code=400)
    return JSONResponse(choice.as_dict())
