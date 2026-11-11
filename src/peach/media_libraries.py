"""媒体库就是扫描根：一个网盘 + 一个远端目录。

库里显示的属性（名称、图标、来源色、处理方式）存设置文件的 `[media.library_catalog.<id>]`，
id 形如 `gdrive:1AbCdEf`。分组不再另建一层：选了哪些扫描根，就有哪些媒体库。
"""
from .drive_provider import LOCATIONS

LIBRARY_ICONS = frozenset({"hard-drive", "database", "heart", "star", "tags", "heart-hand", "flame", "cherry", "gem", "crown", "shirt", "footprints",
                         "flower", "venetian-mask", "hand", "bed-double", "moon", "sparkles", "camera", "video",
                         "lollipop", "candy", "banana", "droplets", "venus", "mars", "venus-and-mars",
                         "ribbon", "graduation-cap", "stethoscope", "glasses", "rabbit", "paw-print", "dumbbell",
                         "bath", "key-round", "wine", "cigarette", "film", "image", "gamepad-2"})

#: 处理方式与处理步骤的取值；设置页从这里取列表，`library_processing` 按它筛阶段。
POLICIES = ("auto", "local", "custom")
STAGES = ("probe", "metadata", "cover", "people", "preview")


def key(location: str, root_id: str) -> str:
    """扫描根在媒体库列表里的 id。"""
    return f"{location}:{root_id}"


def libraries(config, live_names: dict[str, str] | None = None):
    """按设置里的扫描根列出媒体库；属性缺省时按来源与默认值补齐。

    `live_names` 是网盘那边刚问到的目录名（`来源:远端 id` → 名字）。设置文件里没存名字时，
    显示目录名比显示一串远端 id 有用；问不到就退回远端 id。
    """
    catalog = getattr(config, "library_catalog", {}) or {}
    names = {**(live_names or {}), **(getattr(config, "library_names", {}) or {})}
    icons = getattr(config, "library_icons", {}) or {}
    rows = []
    for location, roots in (getattr(config, "drive_roots", {}) or {}).items():
        if location not in LOCATIONS:
            continue
        for root_id in roots:
            identifier = key(location, root_id)
            stored = catalog.get(identifier, {})
            stages = [part.strip() for part in str(stored.get("stages", "") or "").split(",")]
            stages = [stage for stage in stages if stage in STAGES]
            icon = stored.get("icon") or icons.get(identifier) or ""
            rows.append({
                "id": identifier,
                "name": stored.get("name") or names.get(identifier) or root_id,
                "icon": icon if icon in LIBRARY_ICONS else "database",
                "color": stored.get("color", ""),
                "policy": stored.get("policy", "") or "auto",
                "stages": stages or list(STAGES),
                "roots": [{"location": location, "root": root_id, "root_id": root_id}],
            })
    return rows


def predicate(config, library: str, alias: str = "a") -> tuple[str, list]:
    """按扫描根精确匹配：账本里 `drive_root` 就是这一列。未知库返回空集。"""
    roots = next((row["roots"] for row in libraries(config) if row["id"] == library), [])
    terms, params = [], []
    for item in roots:
        terms.append(f"({alias}.location=? AND {alias}.drive_root=?)")
        params.extend((item["location"], item["root_id"]))
    return ("(" + " OR ".join(terms) + ")" if terms else "0"), params


def stages_by_root(config) -> dict[str, frozenset]:
    """扫描根 → 这条库要跑的步骤；没单独限制的库用全部步骤。"""
    result: dict[str, frozenset] = {}
    for row in libraries(config):
        result[row["id"]] = frozenset(row["stages"] if row["policy"] == "custom" else STAGES)
    return result


def ownership(config, location: str | None, drive_root: str | None) -> dict:
    """卡片上的媒体库归属：来源 + 扫描根直接构成库的 id。"""
    identifier = key(location or "", drive_root or "")
    row = next((item for item in libraries(config) if item["id"] == identifier), None)
    if row is None:
        return {}
    return {"root_id": identifier, "library_id": identifier}
