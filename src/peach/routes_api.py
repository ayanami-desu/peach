"""JSON 契约的 HTTP 出口。

绝大多数端点不在这里逐个声明：`/api/{route:path}` 把路径交给 `web_router` 的两张
处理器表，加一个 API 只需要在那里注册。这里只留必须自己声明的一条：探测类（providers）。

注册顺序有意义。`/api/{route:path}` 是 catch-all，`api.py` 必须最后 include 这个
router；同理本模块内部的 catch-all 写在文件末尾，具名端点写在前面。
`/api/stream-plan` 在 `routes_media` 里，那个 router 也要先 include。
"""
from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, Body, Depends, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from . import web_contract, web_tasks
from .field_owners import RevisionConflict
from .folder_rules import FolderRuleConflict
from .jobs import TaskRunConflict
from .providers import ProviderUnavailable
from .routes_auth import require_auth
from .task_runs import task_label
from .task_control import Cancelled as TaskCancelled

router = APIRouter()

LOGGER = logging.getLogger(__name__)


@router.get("/api/providers")
def provider_health(request: Request, args: dict[str, str] = Depends(require_auth)):
    return request.app.state.providers.health()


@router.get("/api/libraries")
def media_library_list(request: Request, args: dict[str, str] = Depends(require_auth)):
    from . import media_libraries, settings_file
    from .media_sources import cost_for
    config = settings_file.active()
    return {"libraries": [{"id": row["id"], "name": row["name"], "icon": row["icon"], "folders": len(row["roots"]),
                           "color": row["color"], "policy": row["policy"], "stages": row["stages"],
                           "roots": [{"root_id": root["root_id"], "location": root["location"]} for root in row["roots"]],
                           "metered": any(cost_for(root['location'], root['root'], config) == 'metered'
                                          for root in row['roots'])}
                          for row in media_libraries.libraries(config)]}


@router.get("/api/providers/opencode-go/models")
def opencode_go_models(request: Request, args: dict[str, str] = Depends(require_auth)):
    try:
        models = request.app.state.opencode_go.list_models()
    except ProviderUnavailable:
        return JSONResponse({"error": "provider unavailable"}, status_code=502)
    return {"ok": True, "provider": "opencode-go", "models": models}


@router.get("/api/tasks/{run_id}")
def task_run_detail(request: Request, run_id: int,
                    _args: dict[str, str] = Depends(require_auth)):
    """任务中心里的某一轮。带路径参数，所以进不了 `web_router` 那两张精确匹配的表。"""
    try:
        return web_tasks.q_task(request.app.state.web_contract, run_id)
    except KeyError as exc:
        # `str(KeyError(...))` 会把消息连引号一起带出来，取 args 才是那句话本身。
        return JSONResponse({"error": str(exc.args[0])}, status_code=404)


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
