"""JSON 契约的 HTTP 出口。

绝大多数端点不在这里逐个声明：`/api/{route:path}` 把路径交给 `web_router` 的两张
处理器表，加一个 API 只需要在那里注册。这边只放带路径参数、或者要自己处理查询参数的
那几条。

注册顺序有意义。`/api/{route:path}` 是 catch-all，`api.py` 必须最后 include 这个
router；同理本模块内部的 catch-all 写在文件末尾，具名端点写在前面。
`/api/stream-plan` 在 `routes_media` 里，那个 router 也要先 include。
"""
from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from . import web_contract, web_tasks
from .field_owners import RevisionConflict
from .folder_rules import FolderRuleConflict
from .jobs import TaskRunConflict
from .routes_auth import require_authenticated_client, require_auth, same_origin
from .task_runs import task_label
from .task_control import Cancelled as TaskCancelled

router = APIRouter()

LOGGER = logging.getLogger(__name__)


@router.get("/api/libraries")
def media_library_list(request: Request, args: dict[str, str] = Depends(require_auth)):
    from . import media_libraries, settings_file
    config = settings_file.active()
    live = getattr(request.app.state.drive, "root_names", lambda: {})()
    return {"libraries": [media_library_row(request, row, config, live)
                          for row in media_libraries.libraries(config, live)],
            "options": media_library_options()}


def media_library_options() -> dict[str, list[str]]:
    """可选的图标、处理方式与处理步骤：前端不另抄一份清单，省得两边各写一套。"""
    from . import media_libraries
    return {"icons": sorted(media_libraries.LIBRARY_ICONS),
            "policies": list(media_libraries.POLICIES),
            "stages": list(media_libraries.STAGES)}


def media_library_row(request: Request, row: dict, config, live: dict[str, str] | None = None) -> dict:
    """一张媒体库卡片：可改的属性、它挂在哪台账号的哪个目录，以及在库的行数。"""
    facts = library_facts(request).get(row["id"], {})
    account = row.get("account") or row["roots"][0]["account"]
    location = row["roots"][0]["location"]
    state = request.app.state.drive.sync_state(account) or {}
    stages = row["stages"]
    if isinstance(stages, str):
        stages = [part for part in stages.split(",") if part]
    return {"id": row["id"], "name": row["name"], "icon": row["icon"], "color": row["color"],
            "policy": row["policy"], "stages": ",".join(stages), "account": account,
            "location": location, "root_id": row["roots"][0]["root_id"],
            "root_name": row.get("root_name") or row["roots"][0]["root_id"],
            "videos": facts.get("videos", 0), "missing": facts.get("missing", 0),
            "synced_at": state.get("synced_at") or "",
            "folders": len(row["roots"])}


def library_facts(request: Request) -> dict[str, dict]:
    """每个媒体库在库的行数、待处理数：按 (来源, 扫描根) 在账本里数一遍。"""
    from . import media_libraries
    try:
        connection = request.app.state.database.connect()
    except Exception:
        return {}
    try:
        rows = connection.execute(
            "SELECT location, drive_root, COUNT(*) AS videos,"
            " SUM(duration IS NULL OR snapshot_path IS NULL) AS missing"
            " FROM asset WHERE disposal IS NULL AND medium='video' AND remote_id IS NOT NULL"
            " GROUP BY location, drive_root").fetchall()
    except Exception:
        return {}
    finally:
        connection.close()
    return {media_libraries.key(row["location"], row["drive_root"]):
            {"videos": int(row["videos"] or 0), "missing": int(row["missing"] or 0)}
            for row in rows}


def _library_or_404(request: Request, library_id: str) -> tuple[dict, Any]:
    from . import media_libraries, settings_file
    config = settings_file.active()
    live = getattr(request.app.state.drive, "root_names", lambda: {})()
    for row in media_libraries.libraries(config, live):
        if row["id"] == library_id:
            return row, config
    raise HTTPException(404, "没有这个媒体库")


@router.post("/api/libraries")
def add_media_library(request: Request, body: dict[str, Any] = Body(default_factory=dict),
                      _args=Depends(require_auth)):
    """新增媒体库：在某个账号底下选一个远端目录，它同时就是这台账号的扫描根。"""
    from . import media_libraries
    from .drive_provider import DriveError
    from .web_drives import drive_failure
    same_origin(request)
    account = str(body.get("account") or "").strip()
    remote_id = str(body.get("remote_id") or "").strip()
    drive = request.app.state.drive
    try:
        drive.add_root(account, remote_id)
    except DriveError as error:
        raise drive_failure(error) from error
    request.app.state.scan.restart(account)
    library_id = media_libraries.key(drive.location_of(account), remote_id)
    row, config = _library_or_404(request, library_id)
    return media_library_row(request, row, config)


@router.post("/api/libraries/{library_id}")
def save_media_library(request: Request, library_id: str,
                       body: dict[str, Any] = Body(default_factory=dict),
                       _args=Depends(require_authenticated_client)):
    """改一个媒体库的名称、图标、来源色与处理方式。"""
    from dataclasses import replace

    from . import media_libraries
    from .web_settings import persist_config
    same_origin(request)
    row, config = _library_or_404(request, library_id)
    try:
        fields = media_libraries.row(body)
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    catalog = {name: dict(value) for name, value in (config.library_catalog or {}).items()}
    catalog[library_id] = {**catalog.get(library_id, {}), **fields}
    persist_config(replace(config, library_catalog=catalog))
    row.update(fields)
    return media_library_row(request, row, replace(config, library_catalog=catalog))


@router.post("/api/libraries/{library_id}/move")
def move_media_library(request: Request, library_id: str,
                       body: dict[str, Any] = Body(default_factory=dict),
                       _args=Depends(require_authenticated_client)):
    """把一个媒体库换到另一个目录：名称、图标、来源色与处理方式跟着走，账本里的行不碰。"""
    from dataclasses import replace

    from . import media_libraries, settings_file
    from .drive_provider import DriveError
    from .web_drives import drive_failure
    from .web_settings import persist_config
    same_origin(request)
    row, _ = _library_or_404(request, library_id)
    account, old = row["account"], row["roots"][0]["root_id"]
    target = str(body.get("remote_id") or "").strip()
    if not target:
        raise HTTPException(400, "请选择要作为媒体库的目录")
    try:
        request.app.state.drive.move_root(account, old, target)
    except DriveError as error:
        raise drive_failure(error) from error
    new_id = media_libraries.key(row["roots"][0]["location"], target)
    if new_id != library_id:
        config = settings_file.active()

        def moved(table: dict[str, Any]) -> dict[str, Any]:
            table = {name: dict(value) if isinstance(value, dict) else value
                     for name, value in (table or {}).items()}
            if library_id in table:
                table[new_id] = table.pop(library_id)
            return table

        persist_config(replace(config, library_catalog=moved(config.library_catalog),
                               library_names=moved(config.library_names),
                               library_icons=moved(config.library_icons)))
        request.app.state.scan.restart(account)
    moved_row, config = _library_or_404(request, new_id)
    return media_library_row(request, moved_row, config)


@router.delete("/api/libraries/{library_id}")
def delete_media_library(request: Request, library_id: str,
                         _args=Depends(require_authenticated_client)):
    """删掉一个媒体库：只动配置，网盘上的文件与账本里的行都不碰。"""
    from dataclasses import replace

    from . import settings_file
    from .drive_provider import DriveError
    from .web_drives import drive_failure
    from .web_settings import persist_config
    same_origin(request)
    row, config = _library_or_404(request, library_id)
    account = row["account"]
    try:
        request.app.state.drive.remove_root(account, row["roots"][0]["root_id"])
    except DriveError as error:
        raise drive_failure(error) from error
    request.app.state.scan.restart(account)
    # `remove_root` 已经写过配置；用写后的设置重算目录，别拿删除前的快照把根写回来。
    config = settings_file.active()
    catalog = {name: dict(value) for name, value in (config.library_catalog or {}).items()}
    catalog.pop(library_id, None)
    persist_config(replace(config, library_catalog=catalog))
    return {"deleted": library_id}


@router.get("/api/tasks/{run_id}")
def task_run_detail(request: Request, run_id: int,
                    _args: dict[str, str] = Depends(require_auth)):
    """任务中心里的某一轮。带路径参数，所以进不了 `web_router` 那两张精确匹配的表。"""
    try:
        return web_tasks.q_task(request.app.state.web_contract, run_id)
    except KeyError as exc:
        # `str(KeyError(...))` 会把消息连引号一起带出来，取 args 才是那句话本身。
        return JSONResponse({"error": str(exc.args[0])}, status_code=404)


@router.post('/api/tasks/clear-finished')
def task_runs_clear_finished(request: Request,
                             _args: dict[str, str] = Depends(require_auth)):
    """清掉全部已结束的任务记录；在排或在跑的一轮不受影响。

    静态路径写在 `/api/tasks/{run_id}/control` 之前，免得被路径参数先吃掉。
    """
    try:
        removed = request.app.state.web_contract.task_runs.clear_finished()
    except PermissionError as exc:
        return JSONResponse({'error': str(exc)}, status_code=403)
    return {'deleted': removed}


@router.post('/api/tasks/{run_id}/control')
def task_run_control(request: Request, run_id: int, body: dict = Body(default_factory=dict),
                     _args: dict[str, str] = Depends(require_auth)):
    from . import task_control
    contract = request.app.state.web_contract
    try:
        run = contract.task_runs.get(run_id)
        if (run is not None and run.active and run.task_key == 'library-processing'
                and body.get('action') != 'set_speed'):
            from .web_library_processing import _active_run, _current, w_library_processing
            current = _current(contract)
            active = _active_run(contract, current)
            if active is None or active.id != run_id:
                raise ValueError('任务已变化，请刷新后重试')
            if not contract.task_runs.enabled or run.host != contract.task_runs.host:
                raise PermissionError('请在执行这轮任务的写入端操作')
            w_library_processing(contract, {'action': body.get('action'), 'job_id': current.get('job_id'),
                                             'speed_mode': body.get('speed_mode')})
        else:
            task_control.request(contract.task_runs, run_id, body.get('action'), mode=body.get('speed_mode'))
        contract.followups.wake()
        return web_tasks.q_task(contract, run_id)
    except KeyError as exc:
        return JSONResponse({'error': str(exc.args[0])}, status_code=404)
    except PermissionError as exc:
        return JSONResponse({'error': str(exc)}, status_code=403)
    except ValueError as exc:
        return JSONResponse({'error': str(exc)}, status_code=409)


@router.delete('/api/tasks/{run_id}')
def task_run_delete(request: Request, run_id: int,
                    _args: dict[str, str] = Depends(require_auth)):
    """删掉一条已结束的任务记录；仍在进行或排队的一轮拒绝。"""
    try:
        request.app.state.web_contract.task_runs.delete(run_id)
    except KeyError as exc:
        return JSONResponse({'error': str(exc.args[0])}, status_code=404)
    except PermissionError as exc:
        return JSONResponse({'error': str(exc)}, status_code=403)
    except ValueError as exc:
        return JSONResponse({'error': str(exc)}, status_code=409)
    return {'deleted': run_id}


@router.get("/api/background-issues")
def background_issues(request: Request, _args: dict[str, str] = Depends(require_auth)):
    """任务中心「需要处理」：各后台服务此刻存在的问题。只读，不出网，不启动任何服务。"""
    from . import settings_file
    state = request.app.state
    try:
        config = settings_file.load_config()
    except settings_file.SettingsFileError:
        # 设置文件本身坏了由配置页报；依赖它的几项这一次读不出来，其余照常。
        config = None
    if config is not None and not config.present:
        config = None
    return {"issues": state.background_issues.collect(state, state.web_contract, config)}


def _conflict(error: TaskRunConflict) -> JSONResponse:
    """手动触发撞上在跑的那一轮：409，并带上挡路那一轮的 id。

    不用 500 也不用 200：这不是故障，用户的请求也没有生效。前端拿 `blocking_run_id`
    直接跳到活动页上的那一行，比一句「已有任务在进行」有用得多。

    `message` 是给人看的那句话，所以在这里用 `task_label` 翻一次：异常自己住在 `jobs`
    里，那一层在 `task_runs` 下面，拿不到中文名表。
    """
    return JSONResponse(
        {"error": "task already running", "task_key": error.task_key,
         "blocking_run_id": error.blocking_run_id,
         "message": f"{task_label(error.task_key)}已有一轮在进行，等它跑完再试"},
        status_code=409)


def _json(payload) -> Response:
    """契约读接口的 JSON 响应，字节与 FastAPI 默认的那一份相同。

    FastAPI 默认先用 `jsonable_encoder` 把整份结果逐个值走一遍再交给 `json.dumps`；
    复核队列一份二十多 MB，光这一遍就要近五秒。契约结果本来就是 JSON 原生类型，只把
    认不出的值（路径、时间等）交给它。
    """
    if isinstance(payload, Response):
        return payload
    try:
        content = json.dumps(payload, ensure_ascii=False, allow_nan=False,
                             separators=(",", ":"), default=jsonable_encoder).encode("utf-8")
    except TypeError:
        # JSON 原生键之外的日期、路径等，沿用框架转换键和值的规则。
        return JSONResponse(jsonable_encoder(payload))
    return Response(content, media_type="application/json")


@router.get("/api/{route:path}")
def api_get(request: Request, route: str, args: dict[str, str] = Depends(require_auth)):
    state = request.app.state
    try:
        payload = web_contract.dispatch_api_get(
            state.web_contract, f"/api/{route}", args)
    except TaskRunConflict as exc:
        return _conflict(exc)
    except TaskCancelled:
        return JSONResponse({'error': '任务已取消，已保存的结果保留'}, status_code=409)
    except FolderRuleConflict as exc:
        return JSONResponse({'error': 'folder rule conflict', 'message': str(exc)}, status_code=409)
    except KeyError:
        return JSONResponse({"error": "not found"}, status_code=404)
    except (TypeError, ValueError) as exc:
        return JSONResponse({"error": f"{type(exc).__name__}: {exc}"}, status_code=400)
    except Exception:
        LOGGER.exception("unhandled GET contract error for /api/%s", route)
        return JSONResponse({"error": "internal server error"}, status_code=500)
    # 序列化留在 try 外：结果编码失败与以前一样是一个 500，不被上面翻成 400。
    return _json(payload)


@router.post("/api/{route:path}")
def api_post(
    request: Request,
    route: str,
    body: dict[str, Any] = Body(default_factory=dict),
    _args: dict[str, str] = Depends(require_auth),
):
    route_path = f"/api/{route}"
    try:
        return web_contract.dispatch_api_post(
            request.app.state.web_contract, route_path, body)
    except TaskCancelled:
        return JSONResponse({'error': '任务已取消，已保存的结果保留'}, status_code=409)
    except TaskRunConflict as exc:
        return _conflict(exc)
    except KeyError:
        return JSONResponse({"error": "not found"}, status_code=404)
    except RevisionConflict as exc:
        # 客户端手上的取值已经不是账本现在这一个。回 409 并带上现值，页面据此刷新
        # 再让人重判；当成 400 的话，「你填错了」和「有人先改了」读起来一模一样。
        return JSONResponse(
            {
                "error": "field revision conflict",
                "message": str(exc),
                "expected_revision": exc.expected,
                "revisions": {str(key): value for key, value in exc.revisions.items()},
            },
            status_code=409,
        )
    except (TypeError, ValueError) as exc:
        # 拒收原因只落本机错误日志，诊断包据此解释页面上的 400；4xx 不远程上报。
        from .error_reporting import event
        event('http-request', exc, method='POST', route=route_path.lstrip('/'), status_code=400)
        return JSONResponse({"error": f"{type(exc).__name__}: {exc}"}, status_code=400)
    except Exception:
        LOGGER.exception("unhandled POST contract error for /api/%s", route)
        return JSONResponse({"error": "internal server error"}, status_code=500)
