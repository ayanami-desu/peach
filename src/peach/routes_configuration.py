"""设置页的 JSON 契约：口令与登录方式、网盘、媒体库分组、播放与流量策略、诊断导出。

页面整个是 `frontend/src/react/settings/` 下的 React 子树（入口 `configuration-page.tsx`），
挂在主站的 `/settings` 路由里；这里只回数据。所有写接口都要求有效登录凭据与同源请求，
不看来源 IP 或代理头：Peach 是个服务端程序，谁能登录谁就能改。
`/healthz` 的 `configurable` 只控制入口显隐；这里负责实际访问检查。
"""
from __future__ import annotations

from collections import deque
from dataclasses import replace
import hashlib
import json
import os
import re
import threading
import time
import uuid
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, Response
from filelock import FileLock, Timeout

from . import access, auth, data_storage, folder_picker, ledger_backups, onboarding, settings_file
from .drive_provider import (
    LOCATIONS,
    DriveAuthRequired,
    DriveError,
    DriveForbidden,
    DriveNotFound,
)
from .jobs import JobAlreadyRunning
from .media_libraries import POLICIES as MEDIA_POLICIES, STAGES as MEDIA_STAGES
from .media_libraries import LIBRARY_ICONS
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
from .web_entry import runtime_fact_entries

router = APIRouter()
_SAVE_LOCK = threading.Lock()
RELOAD_NAME = onboarding.RELOAD_NAME
#: 设置文件不归 Peach 写的部署，设置页只读，改由运维编辑那份文件。
FILE_MANAGED_NOTICE = "这个部署由配置文件管理服务；请在部署机器上编辑设置文件。"
#: 媒体库的来源色取界面强调色的键名，具体色值由界面按键名取，这里只校验写法。
_LIBRARY_COLOR = re.compile(r"[a-z]{2,16}")


def dev_environment() -> bool:
    """调试用的裸 serve：`--no-auth` 启动时由 CLI 置上 `PEACH_DEV=1`。

    未过初始配置时，配置页不该再要求「先完成设置」那一层。这个标记只免掉配置完成那一条，
    登录凭据照样要：环境变量会被子进程继承，光凭它放行等于把配置写接口交给能连上端口的人。
    """
    return os.environ.get("PEACH_DEV") == "1"


def revision(config) -> str:
    return hashlib.sha256(config.path.read_bytes()).hexdigest()


def managed_configuration() -> bool:
    """设置文件是不是由 Peach 自己写：打包发行（独立包、Docker 镜像）里是，页面因此可保存。

    源码部署的设置文件由 `peach` 命令行与首次设置页生成，设置页只读。
    """
    from . import distribution
    return distribution.standalone() or distribution.docker()


def configurable(request: Request) -> bool:
    """入口显隐只反映部署的配置管理能力；API 独立校验登录凭据。"""
    return dev_environment() or (managed_configuration() and bool(request.app.state.settings.configured))


# --------------------------------------------------------------------------- 诊断


@router.get("/api/diagnostics")
def system_diagnostics(request: Request, args: dict[str, str] = Depends(require_auth)):
    """本机诊断与 doctor JSON 共用报告；网盘与磁盘只看启动时那次的判断，不在请求里探。
    """
    from . import diagnostics
    same_origin(request)
    return diagnostics.report(request.app.state.settings, {})


@router.get("/api/diagnostics/bundle")
def diagnostic_bundle(request: Request, args: dict[str, str] = Depends(require_auth)):
    from . import diagnostic_context, diagnostics, support_bundle
    same_origin(request)
    try:
        report = diagnostics.report(request.app.state.settings, {})
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
            report=lambda: diagnostics.report(request.app.state.settings, {}))
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


def _library_row(value: object) -> dict[str, str]:
    """一条媒体库分组：名称 1–80 个可见字符，图标、来源色与处理方式取自内置列表。"""
    if not isinstance(value, dict):
        raise ValueError("媒体库分组格式无效")
    name = value.get("name", "")
    if not isinstance(name, str) or not name.strip() or len(name) > 80 or any(ord(char) < 32 for char in name):
        raise ValueError("媒体库名称请使用 1 到 80 个可见字符")
    icon = value.get("icon", "")
    if icon not in ("", *LIBRARY_ICONS):
        raise ValueError("请选择列表中的媒体库图标")
    color = value.get("color", "")
    if color and not _LIBRARY_COLOR.fullmatch(str(color)):
        raise ValueError("请选择列表中的来源色")
    policy = value.get("policy", "")
    if policy not in ("", *MEDIA_POLICIES):
        raise ValueError("请选择列表中的处理方式")
    stages = [stage for stage in str(value.get("stages", "") or "").split(",") if stage]
    if any(stage not in MEDIA_STAGES for stage in stages) or (stages and policy != "custom"):
        raise ValueError("处理步骤无效")
    row = {"name": name.strip(), "icon": icon, "color": color, "policy": policy}
    if stages:
        row["stages"] = ",".join(stages)
    return row


@router.post("/api/configuration")
def save_configuration(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                       _args=Depends(require_authenticated_client)):
    """保存媒体库分组：具名媒体库的名称、图标、来源色与处理方式。

    分组本身按存储根目录的持久身份走，这里只改这些随人改的属性；身份 id 由扫描那一侧
    建立，页面拿到的也是它。
    """
    if not managed_configuration():
        raise HTTPException(409, "此部署通过配置文件管理服务")
    same_origin(request)
    with _SAVE_LOCK:
        config = settings_file.load_config()
        if not config.present:
            raise HTTPException(409, "请先完成首次设置")
        if body.get("revision") != revision(config):
            raise HTTPException(409, "配置已变更，请刷新后再保存")
        groups = body.get("libraries")
        if not isinstance(groups, list):
            raise HTTPException(400, {"message": "有几项需要修改",
                                      "errors": {"libraries": ["请提交媒体库分组"]}})
        catalog = {key: dict(value) for key, value in (config.library_catalog or {}).items()}
        errors = []
        for value in groups:
            key = str(value.get("id") or "") if isinstance(value, dict) else ""
            if key not in catalog:
                errors.append(f"媒体库 {key or '（缺少 id）'} 不存在")
                continue
            try:
                catalog[key] = {**catalog[key], **_library_row(value)}
            except ValueError as exc:
                errors.append(str(exc))
        if errors:
            raise HTTPException(400, {"message": "有几项需要修改", "errors": {"libraries": errors}})
        prepared = replace(config, library_catalog=catalog)
        try:
            settings_file.write(prepared, force=True)
            config.directory("state").mkdir(parents=True, exist_ok=True)
            (config.directory("state") / RELOAD_NAME).write_text("reload", encoding="utf-8")
        except OSError as exc:
            raise HTTPException(500, f"配置保存失败：{exc}") from exc
    return {"saved": True, "revision": revision(prepared)}


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


def _drive_location(location: str) -> str:
    if location not in LOCATIONS:
        raise HTTPException(404, "没有这个网盘")
    return location


def _drive_failure(error: DriveError) -> HTTPException:
    """网盘错误换成的状态码：授权失效 401、越权 403、找不到 404，其余可重试的报 409。"""
    if isinstance(error, DriveAuthRequired):
        return HTTPException(401, str(error))
    if isinstance(error, DriveForbidden):
        return HTTPException(403, str(error))
    if isinstance(error, DriveNotFound):
        return HTTPException(404, str(error))
    return HTTPException(409, str(error))


@router.get("/api/drive")
def read_drives(request: Request, _args=Depends(require_auth)):
    """两个网盘各自的账号、扫描起点与上次同步结果，外加授权回调要用的基址。"""
    return _drive(request).snapshot()


@router.post("/api/drive/{location}/authorize")
def drive_authorize(request: Request, location: str, _args=Depends(require_auth)):
    """发起授权：回一个远端同意页地址，页面整窗跳过去。"""
    same_origin(request)
    try:
        return {"url": _drive(request).authorize(_drive_location(location))}
    except DriveError as error:
        raise _drive_failure(error) from error


@router.get("/oauth/{location}/callback")
def drive_callback(request: Request, location: str, code: str = "", state: str = "", error: str = ""):
    """网盘授权回执：把 code 换成令牌，然后回到设置页的网盘分区。

    这条是网盘跳回浏览器的那一步，没有会话保证，所以不查登录凭据；边界是本次授权开始时
    服务端记下的 `state`，重放与过期的回执都换不到令牌。
    """
    if error:
        return JSONResponse({"error": f"授权未完成：{error}"}, status_code=400)
    try:
        _drive(request).accept(location, code, state)
    except DriveError as failure:
        return JSONResponse({"error": str(failure)}, status_code=400)
    response = RedirectResponse("/settings#drives", status_code=302)
    response.headers["Cache-Control"] = "no-store"
    return response


@router.post("/api/drive/{location}/roots")
def save_drive_roots(request: Request, location: str, body: dict[str, Any] = Body(default_factory=dict),
                     _args=Depends(require_auth)):
    """选定扫描起点：整条列表替换，空列表表示回到账号根目录。"""
    same_origin(request)
    rows = body.get("roots")
    if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
        raise HTTPException(400, "roots 要是对象数组")
    try:
        ids = _drive(request).set_roots(_drive_location(location), rows)
    except DriveError as error:
        raise _drive_failure(error) from error
    return {"location": location, "roots": list(ids)}


@router.get("/api/drive/{location}/folders")
def drive_folders(request: Request, location: str, parent_id: str = "",
                  _args=Depends(require_auth)):
    """挑扫描起点用的目录列表，只列文件夹；不给 `parent_id` 就从扫描起点那一层开始。"""
    _drive_location(location)
    drive = _drive(request)
    parent = parent_id or next(iter(drive.roots(location)), "")
    try:
        entries, _cursor = drive.provider(location).list_folder(parent)
    except DriveError as error:
        raise _drive_failure(error) from error
    return {"parent_id": parent,
            "folders": [{"remote_id": entry.remote_id, "name": entry.name}
                        for entry in entries if entry.folder]}


@router.delete("/api/drive/{location}")
def forget_drive(request: Request, location: str, _args=Depends(require_auth)):
    """断开一个网盘：删掉账号、清空它的扫描起点，账本里的行不动。"""
    same_origin(request)
    try:
        _drive(request).forget(_drive_location(location))
    except DriveError as error:
        raise _drive_failure(error) from error
    return {"forgotten": location}


@router.post("/api/drive/{location}/refresh")
def refresh_drive(request: Request, location: str, _args=Depends(require_auth)):
    """立刻增量同步一次这个网盘。"""
    same_origin(request)
    try:
        _drive(request).refresh(_drive_location(location))
    except DriveError as error:
        raise _drive_failure(error) from error
    return _drive(request).connection(location)


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
