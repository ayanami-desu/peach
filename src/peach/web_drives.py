"""网盘错误到 HTTP 状态码的映射。

设置页与媒体库页都要把同一个 `DriveError` 换成状态码；放在 `routes_*` 里会让两条路由互相
依赖，所以单独搁在 web 层。
"""
from __future__ import annotations

from fastapi import HTTPException

from .drive_provider import DriveAuthRequired, DriveError, DriveForbidden, DriveNotFound


def drive_failure(error: DriveError) -> HTTPException:
    """网盘错误换成的状态码：授权失效 401、越权 403、找不到 404，其余可重试的报 409。"""
    if isinstance(error, DriveAuthRequired):
        return HTTPException(401, str(error))
    if isinstance(error, DriveForbidden):
        return HTTPException(403, str(error))
    if isinstance(error, DriveNotFound):
        return HTTPException(404, str(error))
    return HTTPException(409, str(error))
