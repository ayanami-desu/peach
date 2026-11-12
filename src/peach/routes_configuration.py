"""设置页的 JSON 契约：口令与登录方式、网盘、媒体库分组、播放与流量策略、诊断导出。

页面整个是 `frontend/src/react/settings/` 下的 React 子树（入口 `configuration-page.tsx`），
挂在主站的 `/settings` 路由里；这里只回数据。所有写接口都要求有效登录凭据与同源请求，
不看来源 IP 或代理头：Peach 是个服务端程序，谁能登录谁就能改。
"""
from __future__ import annotations

from collections import deque
from dataclasses import replace
import hashlib
import json
import os
import threading
import time
import uuid
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, Response
from filelock import FileLock, Timeout

from . import access, auth, data_storage, folder_picker, ledger_backups, settings_file
from .drive_provider import LOCATIONS, DriveError
from .jobs import JobAlreadyRunning
from .routes_auth import (
    login_mode,
    origin_allowed,
    require_auth,
    require_authenticated_client,
    safe_next,
    same_origin,
    set_auth_cookie,
    sessions as access_sessions,
)
from .web_drives import drive_failure
from .web_entry import runtime_fact_entries

router = APIRouter()
#: 设置文件不归 Peach 写的部署，设置页只读，改由运维编辑那份文件。
FILE_MANAGED_NOTICE = "这个部署由配置文件管理服务；请在部署机器上编辑设置文件。"


def revision(config) -> str:
    return hashlib.sha256(config.path.read_bytes()).hexdigest()


def managed_configuration() -> bool:
    """设置文件是不是由 Peach 自己写：Docker 镜像里是，页面因此可保存。

    源码部署的设置文件由 `peach` 命令行与首次设置页生成，设置页只读。
    """
    from . import distribution
    return distribution.docker()


# --------------------------------------------------------------------------- 诊断


@router.get("/api/diagnostics")
def system_diagnostics(request: Request, args: dict[str, str] = Depends(require_auth)):
    """本机诊断与 doctor JSON 共用报告；网盘只看接入状态与上次同步，不在请求里问网盘要目录名。
    """
    from . import diagnostics
    same_origin(request)
    return diagnostics.report(request.app.state.settings, _drive_status(request))


def _drive_status(request: Request) -> dict:
    """诊断用的网盘快照：只读账号文件与同步表，不联网。"""
    drive = getattr(request.app.state, "drive", None)
    return drive.status() if drive is not None else {}


@router.get("/api/diagnostics/bundle")
def diagnostic_bundle(request: Request, args: dict[str, str] = Depends(require_auth)):
    from . import diagnostic_context, diagnostics, support_bundle
    same_origin(request)
    try:
        report = diagnostics.report(request.app.state.settings, _drive_status(request))
    except Exception as error:
        from .error_reporting import event
        event("diagnostics-report", error)
        report = None
    browser = diagnostic_context.browser_header(request.headers.get('x-peach-browser-diagnostics', ''),
                                                 user_agent=request.headers.get('user-agent', ''))
    from .error_reporting import local_event
    local_event('browser-context', browser=browser, user_agent=browser.get('user_agent', ''))
    return Response(support_bundle.bundle_bytes(report=report, browser=browser, include_scraping=False),
                    media_type="application/zip",
                    headers={"Content-Disposition": 'attachment; filename="peach-support.zip"',
                             "Cache-Control": "no-store"})


@router.get('/api/diagnostics/exports')
def diagnostic_export_status(request: Request, _args=Depends(require_auth)):
    from .diagnostic_exports import manager
    return manager(request).snapshot()


@router.post('/api/diagnostics/exports')
def diagnostic_export_start(request: Request, body: dict = Body(default_factory=dict),
                            _args=Depends(require_auth)):
    from . import diagnostic_context, diagnostic_exports, diagnostics
    same_origin(request)
    kind, codes = body.get('kind'), body.get('codes', '')
    if not isinstance(codes, str):
        raise HTTPException(400, '请填写有效番号')
    browser = diagnostic_context.browser_header(request.headers.get('x-peach-browser-diagnostics', ''),
                                                 user_agent=request.headers.get('user-agent', ''))
    try:
        return diagnostic_exports.manager(request).start(
            kind, codes, browser=browser,
            report=lambda: diagnostics.report(request.app.state.settings, _drive_status(request)))
    except ValueError as error:
        raise HTTPException(400, str(error)) from error


@router.post('/api/diagnostics/exports/{identity}/cancel')
def diagnostic_export_cancel(request: Request, identity: str, _args=Depends(require_auth)):
    from .diagnostic_exports import manager
    same_origin(request)
    try:
        return manager(request).cancel(identity)
    except ValueError as error:
        raise HTTPException(409, str(error)) from error


@router.get('/api/diagnostics/exports/{identity}/download')
def diagnostic_export_download(request: Request, identity: str, _args=Depends(require_auth)):
    from .diagnostic_exports import manager
    try:
        path, name = manager(request).download(identity)
    except FileNotFoundError as error:
        raise HTTPException(404, str(error)) from error
    return FileResponse(path, filename=name, media_type='application/zip',
                        headers={'Cache-Control': 'no-store'})


_CLIENT_ERROR_LOCK = threading.Lock()


def _client_error_budget(request: Request) -> None:
    with _CLIENT_ERROR_LOCK:
        recent = getattr(request.app.state, 'client_error_times', deque(maxlen=20))
        request.app.state.client_error_times = recent
        now = time.monotonic()
        while recent and now - recent[0] >= 60:
            recent.popleft()
        if len(recent) >= 20:
            raise HTTPException(429, '错误记录过于频繁')
        recent.append(now)


def _record_browser_context(request: Request, context: dict) -> bool:
    """同一份环境每分钟保留一次，环境快照独立于错误记录预算。"""
    from .error_reporting import local_event
    key = hashlib.sha256(json.dumps(context, sort_keys=True).encode()).hexdigest()
    with _CLIENT_ERROR_LOCK:
        recent = getattr(request.app.state, 'client_context_times', deque(maxlen=64))
        request.app.state.client_context_times = recent
        now = time.monotonic()
        while recent and now - recent[0][0] >= 60:
            recent.popleft()
        if any(saved == key for _, saved in recent):
            return False
        if local_event('browser-context', **context) is None:
            raise HTTPException(503, '错误日志无法写入')
        recent.append((now, key))
    return True


@router.post("/api/diagnostics/client-error")
async def client_error(request: Request):
    """浏览器错误取证；登录页与首启页报上来的也要能落到日志里，所以要有效登录凭据。

    登录之前发生的错误没有会话，页面自己把日志留在浏览器里。
    """
    from . import error_reporting
    same_origin(request)
    require_authenticated_client(request)
    body = bytearray()
    async for part in request.stream():
        body.extend(part)
        if len(body) > 16 * 1024:
            raise HTTPException(413, "错误记录过长")
    try:
        data = json.loads(body)
    except (ValueError, UnicodeError):
        raise HTTPException(400, "错误记录格式无效") from None
    if not isinstance(data, dict) or not isinstance(data.get("message"), str):
        raise HTTPException(400, "错误记录缺少原因")
    fields = {key: value[:6000] for key in ("message", "stack", "kind", "page", "source_file", "error_name")
              if isinstance(value := data.get(key), str)}
    fields.update({key: value for key in ('line', 'column')
                   if type(value := data.get(key)) is int and value >= 0})
    identities = data.get('bundle_debug_ids')
    if isinstance(identities, dict):
        from .diagnostic_browser import shipped
        fields['bundle_debug_ids'] = {key: value for key, value in identities.items()
            if shipped(key) and isinstance(value, str) and len(value) == 36}
    fields['user_agent'] = request.headers.get('user-agent', '')[:512]
    from . import diagnostic_context
    context = {'browser': diagnostic_context.browser(data.get('browser'), user_agent=fields['user_agent'])}
    if data.get('kind') == 'context':
        return {'recorded': _record_browser_context(request, context)}
    _client_error_budget(request)
    if isinstance(data.get('playback'), dict):
        context['playback'] = diagnostic_context.playback(data['playback'])
        recorded = error_reporting.local_event('browser', **fields, **context)
    else:
        recorded = error_reporting.event('browser', **fields)
        error_reporting.local_event('browser-context', **context)
    if recorded is None:
        raise HTTPException(503, "错误日志无法写入")
    return {"recorded": True}


# --------------------------------------------------------------------------- 设置首屏


def _read_section(result: dict, key: str, title: str, reader) -> None:
    """各配置区域独立读取；故障留痕并提供重试信息。"""
    try:
        result[key] = reader()
    except Exception as error:
        error_id = uuid.uuid4().hex
        result.setdefault("section_errors", {})[key] = {
            "title": f"{title}未取得", "message": "请重新读取；持续失败时导出诊断报告。",
            "error_id": error_id,
        }
        from . import error_reporting
        error_reporting.event("logging", error, logger=__name__, level="ERROR",
                              message=f"配置区域 {key} 读取失败", section=key, error_id=error_id)


def snapshot(config) -> dict[str, Any]:
    """配置页首屏要的一切：当前值、修订号、可写与否，以及这台机器的运行信息。

    媒体库分组与网盘状态各走自己的端点：网盘一卡住，整个设置区不该跟着停在加载。
    """
    editable = managed_configuration()
    result = {
        "editable": editable,
        "notice": "" if editable else FILE_MANAGED_NOTICE,
        "revision": revision(config),
        "windows": os.name == "nt",
        "facts": [],
    }
    readers = (
        ("storage", "存储空间", lambda: data_storage.snapshot(config)),
        ("access", "访问设置", lambda: access.public(access.load(config.directory("secrets") / "access.json"))),
        ("facts", "运行信息", lambda: runtime_fact_entries(config)),
    )
    for key, title, reader in readers:
        _read_section(result, key, title, reader)
    return result


@router.get("/api/configuration")
def read_configuration(request: Request, _args=Depends(require_authenticated_client)):
    config = settings_file.load_config()
    if not config.present:
        raise HTTPException(409, "请先完成首次设置")
    result = snapshot(config)
    _read_section(result, "api_token", "访问口令", lambda: api_token_payload(request))
    return result



# --------------------------------------------------------------------------- 口令与登录方式


@router.post("/api/configuration/access")
def save_access(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                _args=Depends(require_authenticated_client)):
    path = request.app.state.settings.access_path
    if not request.app.state.settings.configured or path is None:
        raise HTTPException(409, "请先完成首次设置")
    if any(not isinstance(body.get(key, ""), str) for key in ("password", "confirmation", "current_password")):
        raise HTTPException(400, "密码需要是文字")
    password = body.get("password", "")
    if body.get("action") not in {"set", "disable"}:
        raise HTTPException(400, "请选择设置或关闭密码")
    if body["action"] == "set" and not password:
        raise HTTPException(400, {"message": "请输入访问密码", "errors": {"password": "请输入访问密码"}})
    if body["action"] == "disable" and body.get("confirm_disable") is not True:
        raise HTTPException(400, "关闭访问密码前先勾选确认")
    try:
        try:
            access.validate_password(password, body.get("confirmation", ""))
        except ValueError as exc:
            field = "confirmation" if password != body.get("confirmation", "") else "password"
            raise HTTPException(400, {"message": str(exc), "errors": {field: str(exc)}}) from exc
        path.parent.mkdir(parents=True, exist_ok=True)
        with FileLock(str(path.with_suffix(".lock")), timeout=0):
            policy = access.load(path)
            if body.get("revision") != policy["revision"]:
                raise HTTPException(409, "访问设置已变更，请刷新后再保存")
            if policy["mode"] == "locked":
                raise HTTPException(409, "访问设置无法读取，请检查配置文件")
            if policy["mode"] == "password" and not access.verify(policy, body.get("current_password", "")):
                raise HTTPException(400, {"message": "当前访问密码不正确",
                                          "errors": {"current_password": "当前访问密码不正确"}})
            policy = access.save(path, password if body["action"] == "set" else "")
    except Timeout:
        raise HTTPException(409, "访问设置正在保存，请稍后重试") from None
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    payload = access.public(policy)
    response = JSONResponse(payload, headers={"Cache-Control": "no-store"})
    response.delete_cookie("tok", path="/")
    response.delete_cookie(access.COOKIE, path="/")
    if policy["mode"] == "password":
        set_auth_cookie(response, request, login=True)
    return response


@router.post("/api/configuration/access/first")
def first_access(request: Request, body: dict[str, Any] = Body(default_factory=dict)):
    """Docker 首次访问设置：已经配置过、还没有访问策略的部署设访问密码或明确选择免登录。

    这时没有登录可言，边界只剩来源：提交必须来自 Peach 自己的页面（`origin_allowed`），
    文件锁里再看一次策略，两台设备同时提交时后到的收 409。设了密码就给这个浏览器签发会话。
    """
    path = request.app.state.settings.access_path
    from . import distribution
    if not distribution.docker() or path is None:
        raise HTTPException(404, "not found")
    if login_mode(request) == "password":
        raise HTTPException(409, "访问设置已完成，请刷新页面")
    if not origin_allowed(request, guard="first-access"):
        raise HTTPException(403, "请从 Peach 访问设置页提交")
    if any(not isinstance(body.get(key, ""), str) for key in ("password", "confirmation", "next")):
        raise HTTPException(400, "密码需要是文字")
    choice, password = body.get("mode"), body.get("password", "")
    if choice not in {"password", "open"}:
        raise HTTPException(400, "请选择设置访问密码或免登录")
    if choice == "password":
        if not password:
            raise HTTPException(400, {"message": "请输入访问密码", "errors": {"password": "请输入访问密码"}})
        try:
            access.validate_password(password, body.get("confirmation", ""))
        except ValueError as exc:
            field = "confirmation" if password != body.get("confirmation", "") else "password"
            raise HTTPException(400, {"message": str(exc), "errors": {field: str(exc)}}) from exc
    try:
        with FileLock(str(path.with_suffix(".lock")), timeout=0):
            if access.load(path)["mode"] != "legacy":
                raise HTTPException(409, "访问设置已完成，请刷新页面")
            policy = access.save(path, password if choice == "password" else "")
    except Timeout:
        raise HTTPException(409, "访问设置正在保存，请稍后重试") from None
    response = JSONResponse({"url": safe_next(body.get("next", "/"))}, headers={"Cache-Control": "no-store"})
    response.delete_cookie("tok", path="/")
    if policy["mode"] == "password":
        try:
            set_auth_cookie(response, request, login=True)
        except OSError:
            pass  # 密码已经写下；设备记录写不进去时这个浏览器转到登录页，用刚设的密码登录即可。
    return response


def _access_sessions(request: Request) -> dict[str, Any]:
    """登录过的设备，本机这一行排第一。"""
    path = request.app.state.settings.access_path
    policy = access.load(path)
    store = access_sessions(request)
    rows = (store.rows(policy["revision"], access.digest(request.cookies.get(access.COOKIE, "")))
            if store is not None and policy["mode"] in {"password", "legacy"} else [])
    return {"revision": policy["revision"], "sessions": rows, "manageable": True}


@router.get("/api/configuration/access/sessions")
def access_session_list(request: Request, _args=Depends(require_auth)):
    return JSONResponse(_access_sessions(request), headers={"Cache-Control": "no-store"})


@router.post("/api/configuration/access/sessions/revoke")
def revoke_access_sessions(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                           _args=Depends(require_auth)):
    """撤销一台（`id`）或除本机以外的全部（`scope: "others"`）。本机这一行不在这里撤。"""
    same_origin(request)
    store = access_sessions(request)
    session_id, others = body.get("id"), body.get("scope") == "others"
    if store is None or (not others and not isinstance(session_id, str)) or (others and session_id is not None):
        raise HTTPException(400, "请选择要撤销的设备")
    policy = access.load(request.app.state.settings.access_path)
    if body.get("revision") != policy["revision"]:
        raise HTTPException(409, "访问设置已变更，请刷新后再操作")
    current = access.digest(request.cookies.get(access.COOKIE, ""))
    if not others and any(row["id"] == session_id and row["current"] for row in store.rows(policy["revision"], current)):
        raise HTTPException(400, "不能在这里撤销本机")
    try:
        removed = store.revoke(policy["revision"], session_id="" if others else session_id, keep=current)
    except Timeout:
        raise HTTPException(409, "设备记录正在写入，请稍后重试") from None
    if not others and not removed:
        raise HTTPException(404, "这台设备已经不在列表里了")
    return JSONResponse({**_access_sessions(request), "removed": removed}, headers={"Cache-Control": "no-store"})


_TOKEN_LOCK = threading.Lock()


def api_token_payload(request: Request) -> dict[str, Any]:
    """访问口令能不能在这里换。口令本身不回给页面，只在换的那一次响应里给新值。"""
    settings = request.app.state.settings
    if not settings.token:
        reason = "这次启动没有使用访问口令。"
    elif settings.token_file is None:
        reason = "口令由启动参数 --token 或环境变量 PEACH_TOKEN 指定，请在那里更换。"
    else:
        reason = ""
    return {"rotatable": not reason, "reason": reason}


@router.post("/api/configuration/access/token/rotate")
def rotate_api_token(request: Request, _args=Depends(require_auth)):
    """换访问口令，运行中的服务当场改用新口令，不用重启。

    用访问密码登录的浏览器签名用的是 `access.json` 里的密钥，与口令无关，一台也不登出。
    还没设访问密码的老部署拿口令当会话签名密钥：换口令等于全部浏览器退出，本机这台当场补签。
    """
    same_origin(request)
    state = api_token_payload(request)
    if not state["rotatable"]:
        raise HTTPException(409, state["reason"])
    settings = request.app.state.settings
    policy = access.load(settings.access_path)
    if policy["mode"] == "locked":
        raise HTTPException(409, "访问设置无法读取，请检查配置文件")
    store = access_sessions(request)
    current = access.digest(request.cookies.get(access.COOKIE, ""))
    signed_out = (sum(not row["current"] for row in store.rows(policy["revision"], current))
                  if policy["mode"] == "legacy" and store is not None else 0)
    with _TOKEN_LOCK:
        token = auth.write_token(settings.token_file.parent)
        request.app.state.settings = replace(request.app.state.settings, token=token)
    payload = {**state, "token": token, "mode": policy["mode"], "signed_out": signed_out}
    response = JSONResponse(payload, headers={"Cache-Control": "no-store"})
    response.delete_cookie("tok", path="/")
    if policy["mode"] == "legacy":
        try:
            if store is not None:
                store.reset("legacy")
            set_auth_cookie(response, request, login=True)
        except OSError:
            # 口令已经换了，这时报错会让新口令丢在半路；本机重新登录一次即可。
            payload["relogin"] = True
            response = JSONResponse(payload, headers={"Cache-Control": "no-store"})
            response.delete_cookie("tok", path="/")
    return response


# --------------------------------------------------------------------------- 网盘


def _drive(request: Request):
    """网盘连接管理器，由 `api.py` 在启动时挂在 `app.state.drive` 上。"""
    return request.app.state.drive


def _scan(request: Request):
    """扫描服务，由 `api.py` 在启动时挂在 `app.state.scan` 上。"""
    return request.app.state.scan


def _drive_location(location: str) -> str:
    """来源类型（`gdrive`/`onedrive`）：取字节方式这类设置按它存。"""
    if location not in LOCATIONS:
        raise HTTPException(404, "没有这个网盘")
    return location


def _drive_key(drive, key: str) -> str:
    """账号名（`[drive.accounts]` 的键）。

    还没填凭据的来源名也算账号：它是「要以这个名字接上」的起点，报错交给下面按来源
    说明（例如还没接入），而不是当成一个不存在的账号。
    """
    if key not in drive.keys() and key not in LOCATIONS:
        raise HTTPException(404, "没有这个网盘账号")
    return key


@router.get("/api/drive")
def read_drives(request: Request, _args=Depends(require_auth)):
    """两个网盘各自的账号、媒体库与上次同步结果，外加授权回调要用的基址。"""
    return _drive(request).snapshot()


@router.post("/api/drive/{key}/authorize")
def drive_authorize(request: Request, key: str, _args=Depends(require_auth)):
    """发起授权：回一个远端同意页地址，页面整窗跳过去。"""
    same_origin(request)
    try:
        return {"url": _drive(request).authorize(_drive_key(_drive(request), key))}
    except DriveError as error:
        raise drive_failure(error) from error


@router.get("/oauth/{key}/callback")
def drive_callback(request: Request, key: str, code: str = "", state: str = "", error: str = ""):
    """网盘授权回执：把 code 换成令牌，然后回到设置页的网盘分区。

    这条是网盘跳回浏览器的那一步，没有会话保证，所以不查登录凭据；边界是本次授权开始时
    服务端记下的 `state`，重放与过期的回执都换不到令牌。
    """
    if error:
        return JSONResponse({"error": f"授权未完成：{error}"}, status_code=400)
    try:
        _drive(request).accept(key, code, state)
        # 换了账号，旧游标指的是别人的盘：不清掉就永远只追增量。
        _scan(request).restart(key)
    except DriveError as failure:
        return JSONResponse({"error": str(failure)}, status_code=400)
    response = RedirectResponse("/settings#drives", status_code=302)
    response.headers["Cache-Control"] = "no-store"
    return response


@router.post("/api/drive/public-url")
def save_drive_public_url(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                          _args=Depends(require_auth)):
    """记下浏览器授权的回调基址（`[drive] public_url`）；空串表示不走浏览器授权。"""
    same_origin(request)
    value = body.get("public_url", "")
    if not isinstance(value, str):
        raise HTTPException(400, "public_url 要是字符串")
    try:
        saved = _drive(request).set_public_url(value)
    except DriveError as error:
        raise drive_failure(error) from error
    return {"public_url": saved}


@router.post("/api/drive/{location}/mode")
def save_drive_mode(request: Request, location: str, body: dict[str, Any] = Body(default_factory=dict),
                    _args=Depends(require_auth)):
    """换这个网盘的取字节方式：直连让浏览器跟预授权地址走，转发由 Peach 带 Range 去取。"""
    same_origin(request)
    mode = body.get("mode")
    if not isinstance(mode, str):
        raise HTTPException(400, "mode 要是字符串")
    try:
        saved = _drive(request).set_mode(_drive_location(location), mode.strip())
    except DriveError as error:
        raise drive_failure(error) from error
    return {"location": location, "mode": saved}


@router.post("/api/drive/{key}/credentials")
def save_drive_credentials(request: Request, key: str,
                           body: dict[str, Any] = Body(default_factory=dict),
                           _args=Depends(require_auth)):
    """直接填认证信息接上一个网盘账号：客户端 ID、密钥、refresh token，可带媒体库目录。

    新账号还没接上，所以 `key` 允许是没登记过的名字——那样必须在 `location` 里说清它是
    哪个网盘；已接上的账号只改凭据时 `location` 可省。
    """
    same_origin(request)
    fields = {}
    for name in ("client_id", "client_secret", "refresh_token", "root", "location"):
        value = body.get(name)
        if value is None:
            value = ""
        if not isinstance(value, str):
            raise HTTPException(400, f"{name} 要是字符串")
        fields[name] = value
    drive = _drive(request)
    source = fields["location"] or drive.location_of(key)
    if key not in drive.keys() and source not in LOCATIONS:
        raise HTTPException(404, "没有这个网盘")
    try:
        drive.set_credentials(key, client_id=fields["client_id"],
                              client_secret=fields["client_secret"],
                              refresh_token=fields["refresh_token"], root=fields["root"],
                              location=source)
    except DriveError as error:
        raise drive_failure(error) from error
    # 凭证换了可能就是换了账号：旧游标指的是别人的盘。
    _scan(request).restart(key)
    return drive.connection(source)


@router.get("/api/drive/{key}/folders")
def drive_folders(request: Request, key: str, parent_id: str = "",
                  _args=Depends(require_auth)):
    """挑媒体库目录用的列表，只列文件夹；不给 `parent_id` 就从账号根目录开始。"""
    drive = _drive(request)
    _drive_key(drive, key)
    account = drive.account(key)
    parent = parent_id or (account.root_id if account else "")
    try:
        entries, _cursor = drive.provider(key).list_folder(parent)
    except DriveError as error:
        raise drive_failure(error) from error
    return {"parent_id": parent,
            "folders": [{"remote_id": entry.remote_id, "name": entry.name}
                        for entry in entries if entry.folder]}


@router.delete("/api/drive/{key}")
def forget_drive(request: Request, key: str, _args=Depends(require_auth)):
    """断开一个网盘账号：删掉账号，它底下的媒体库跟着消失，账本里的行不动。"""
    same_origin(request)
    try:
        _drive(request).forget(_drive_key(_drive(request), key))
    except DriveError as error:
        raise drive_failure(error) from error
    return {"forgotten": key}


@router.post("/api/drive/{key}/refresh")
def refresh_drive(request: Request, key: str, _args=Depends(require_auth)):
    """立刻增量同步一次这个账号。"""
    same_origin(request)
    drive = _drive(request)
    _drive_key(drive, key)
    try:
        drive.refresh(key)
    except DriveError as error:
        raise drive_failure(error) from error
    return drive.connection(drive.location_of(key))


# --------------------------------------------------------------------------- 存储与流量


def _storage_config():
    config = settings_file.load_config()
    if not config.present:
        raise HTTPException(409, "请先完成首次设置")
    return config


@router.get("/api/configuration/storage")
def read_storage(request: Request, _args=Depends(require_auth)):
    """「存储空间」：数据目录位置、磁盘余量、上次统计的分类占用与迁移状态。"""
    return data_storage.snapshot(_storage_config())


@router.post("/api/configuration/storage/measure")
def measure_storage(request: Request, _args=Depends(require_auth)):
    same_origin(request)
    config = _storage_config()
    try:
        data_storage.JOBS.start(config, "measure")
    except RuntimeError as exc:
        raise HTTPException(409, str(exc)) from exc
    return data_storage.snapshot(config)


@router.post("/api/configuration/storage/policy")
def save_storage_policy(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                        _args=Depends(require_auth)):
    from . import storage_budget
    same_origin(request)
    config = _storage_config()
    try:
        storage_budget.save_policy(config, body)
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    except OSError as error:
        raise HTTPException(500, f'容量设置保存失败：{error}') from error
    return data_storage.snapshot(config)


@router.post("/api/configuration/storage/clean")
def clean_storage(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                  _args=Depends(require_auth)):
    same_origin(request)
    config = _storage_config()
    # 勾选几类一起清理时传 `categories`；单清一类的旧写法 `category` 照收。
    raw = body.get("categories", [body.get("category")])
    categories = raw if isinstance(raw, list) else []
    if not categories or any(not isinstance(key, str) or key not in data_storage.CLEANABLE for key in categories):
        raise HTTPException(400, "这一类不能在这里清理")
    try:
        data_storage.JOBS.start(config, categories)
    except RuntimeError as exc:
        raise HTTPException(409, str(exc)) from exc
    return data_storage.snapshot(config)


def _ledger_backups(request: Request):
    _storage_config()
    return ledger_backups.manager(request)


@router.get("/api/configuration/ledger-backups")
def read_ledger_backups(request: Request, _args=Depends(require_auth)):
    """「账本备份」：可恢复的备份列表、立即备份与恢复两个任务的状态、上次恢复的结果。"""
    return _ledger_backups(request).snapshot()


@router.post("/api/configuration/ledger-backups/backup")
def backup_ledger(request: Request, _args=Depends(require_auth)):
    same_origin(request)
    try:
        return _ledger_backups(request).start_backup()
    except (ValueError, JobAlreadyRunning) as exc:
        raise HTTPException(409, str(exc)) from exc


@router.post("/api/configuration/ledger-backups/restore")
def restore_ledger(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                   _args=Depends(require_auth)):
    """用选中的备份替换当前账本；页面二次确认后才发，`confirm` 必须为真。"""
    same_origin(request)
    if body.get("confirm") is not True:
        raise HTTPException(400, "恢复会替换当前账本，请先确认")
    try:
        return _ledger_backups(request).start_restore(body.get("id"))
    except (ValueError, JobAlreadyRunning) as exc:
        raise HTTPException(409, str(exc)) from exc


@router.post("/api/pick-folder")
def pick_folder(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                _args=Depends(require_auth)):
    """在运行 Peach 的这台电脑上弹系统文件夹对话框，选中的绝对路径交回页面。

    只对数据目录迁移这种本机操作有用：对话框显示在服务器那台机器上，人不在机器前时
    用不了。对话框是模态的，一次只开一个；用户取消时 `path` 为 None。
    """
    same_origin(request)
    initial = body.get("initial")
    try:
        path = folder_picker.pick_folder(initial if isinstance(initial, str) and initial else None)
    except folder_picker.PickerBusy as exc:
        raise HTTPException(409, str(exc)) from exc
    except folder_picker.PickerUnavailable as exc:
        raise HTTPException(501, str(exc)) from exc
    return {"path": path}
