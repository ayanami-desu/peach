"""网盘来源能力：来源清单与代理流量口径。

来源清单在 `resources/media-sources.json`，直接连网盘之后每个来源只剩一个默认成本：
Google Drive 与 OneDrive 都算「按流量计费」，取字节要过流量保护。
"""
from dataclasses import dataclass
import json
import re

from .settings_file import PROJECT_ROOT


@dataclass(frozen=True)
class MediaSource:
    id: str
    name: str
    label: str
    default_cost: str
    cloud: bool
    icon: str


SOURCE_REGISTRY = tuple(MediaSource(**row) for row in json.loads(
    (PROJECT_ROOT / "resources" / "media-sources.json").read_text(encoding="utf-8")))
SOURCES = {source.id: source for source in SOURCE_REGISTRY}
SOURCE_OPTIONS = tuple((source.id, source.label) for source in SOURCE_REGISTRY)
SOURCE_COSTS = {source.id: source.default_cost for source in SOURCE_REGISTRY}
SCANNABLE_LOCATIONS = tuple(SOURCES)
CLOUD_LOCATIONS = frozenset(source.id for source in SOURCE_REGISTRY if source.cloud)


def cost_for(location: str, path: str | None = "", config=None) -> str:
    """来源的流量口径；`path` 只为兼容旧调用点保留，不再按目录覆盖。"""
    return SOURCE_COSTS.get(location, "metered")


def cost_sql(location_column: str = "location", path_column: str = "path", *, config=None) -> tuple[str, tuple]:
    """返回求值为 free/metered 的参数化 CASE。"""
    for column in (location_column, path_column):
        if not re.fullmatch(r"[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?", column, flags=re.ASCII):
            raise ValueError("成本查询列名不正确")
    clauses, parameters = [], []
    for location, cost in SOURCE_COSTS.items():
        clauses.append(f"WHEN {location_column}=? THEN ?")
        parameters.extend((location, cost))
    return "CASE " + " ".join(clauses) + " ELSE 'metered' END", tuple(parameters)
