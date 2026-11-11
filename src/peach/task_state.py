"""后台任务状态文件所在的目录。"""
from pathlib import Path


def state_root(db) -> Path:
    """账本同级的 `state` 目录：任务状态文件都写在这里。"""
    return Path(db).resolve().parent / 'state'
