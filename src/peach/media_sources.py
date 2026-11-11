"""网盘来源能力：来源清单。

来源清单在 `resources/media-sources.json`。
"""
from dataclasses import dataclass
import json

from .settings_file import PROJECT_ROOT


@dataclass(frozen=True)
class MediaSource:
    id: str
    name: str
    label: str
    cloud: bool
    icon: str


SOURCE_REGISTRY = tuple(MediaSource(**row) for row in json.loads(
    (PROJECT_ROOT / "resources" / "media-sources.json").read_text(encoding="utf-8")))
SOURCES = {source.id: source for source in SOURCE_REGISTRY}
SOURCE_OPTIONS = tuple((source.id, source.label) for source in SOURCE_REGISTRY)
SCANNABLE_LOCATIONS = tuple(SOURCES)
CLOUD_LOCATIONS = frozenset(source.id for source in SOURCE_REGISTRY if source.cloud)
