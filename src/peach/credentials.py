"""本机凭据读取。

凭据只从 `peach-data/secrets/follow/<provider>.json` 读，永不进 Git、URL、日志或 ledger。
本模块不打印凭据值，`describe()` 只报告字段是否存在。
"""
from __future__ import annotations

import json
import os
import stat
from dataclasses import dataclass
from pathlib import Path

from .fsutil import atomic_write_text


class CredentialError(RuntimeError):
    pass


@dataclass(frozen=True)
class Credential:
    provider: str
    values: dict[str, str]

    def require(self, *names: str) -> tuple[str, ...]:
        missing = [name for name in names if not self.values.get(name)]
        if missing:
            raise CredentialError(
                f"{self.provider} 凭据缺少字段：{', '.join(missing)}"
            )
        return tuple(str(self.values[name]) for name in names)


class CredentialStore:
    """按 provider 读取凭据文件；缺失是正常状态，不是错误。"""

    def __init__(self, secrets_root: Path):
        self.root = Path(secrets_root) / "follow"

    def path_for(self, provider: str) -> Path:
        if not provider or "/" in provider or "\\" in provider or provider.startswith("."):
            raise CredentialError("provider 名称非法")
        return self.root / f"{provider}.json"

    def _read(self, provider: str) -> dict[str, str]:
        try:
            payload = json.loads(self.path_for(provider).read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise CredentialError(f"{provider} 凭据文件无法解析") from exc
        if not isinstance(payload, dict):
            raise CredentialError(f"{provider} 凭据文件必须是 JSON 对象")
        return {
            str(key): str(value) for key, value in payload.items()
            if value is not None and not isinstance(value, (dict, list))
        }

    def load(self, provider: str) -> Credential | None:
        path = self.path_for(provider)
        if not path.is_file():
            return None
        values = self._read(provider)
        return Credential(provider, values) if values else None

    def describe(self, provider: str) -> dict[str, object]:
        """只报告存在性与权限，绝不返回凭据值。

        `world_readable` 只在 POSIX 上有意义：NTFS 的访问控制走 ACL，`st_mode` 里的
        组/其他读位是 Python 合成出来的常量，恒为真——拿它当判据会在 Windows 上
        对每个凭据文件都报「权限过宽」。那里报 `None`（未知），不假装知道。
        """
        path = self.path_for(provider)
        values = self._read(provider) if path.is_file() else {}
        if not values:
            return {"provider": provider, "present": False, "fields": [], "world_readable": False}
        return {"provider": provider, "present": True, "fields": sorted(values),
                "world_readable": self._world_readable(path)}

    def save(self, provider: str, values: dict[str, str]) -> None:
        """整份覆盖写。

        先写同目录的临时文件再替换，写到一半断电不会留下半截 JSON；POSIX 上收紧到 0600。
        """
        payload = {str(key): str(value) for key, value in values.items() if value not in (None, "")}
        atomic_write_text(self.path_for(provider),
                          json.dumps(payload, ensure_ascii=False, indent=2) + "\n", mode=0o600)

    def clear(self, provider: str) -> dict[str, object]:
        path = self.path_for(provider)
        removed = path.is_file()
        path.unlink(missing_ok=True)
        return {"local_removed": removed}

    @staticmethod
    def _world_readable(path: Path) -> bool | None:
        if os.name == "nt":
            return None
        mode = stat.S_IMODE(os.stat(path).st_mode)
        return bool(mode & (stat.S_IRGRP | stat.S_IROTH))
