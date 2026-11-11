"""网盘账号的授权与令牌保管：OAuth 换码、刷新、掉线判定。

令牌只落 `secrets_root`，文件权限 0600，不进账本也不进设置文件。刷新失败一律抛
`DriveAuthRequired`，由路由转成「需要重新授权」，不把 401 当成网络错误重试。
"""
from __future__ import annotations

import json
import os
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Callable

from .drive_provider import DriveAuthRequired, DriveUnavailable

#: 提前 60 秒换票，避免把只剩几秒的令牌发给远端。
REFRESH_MARGIN_SECONDS = 60


@dataclass
class StoredAccount:
    location: str
    account_id: str
    email: str
    display_name: str
    root_id: str
    refresh_token: str
    access_token: str = ""
    expires_at: int = 0
    scope: str = ""

    def usable(self, now: float) -> bool:
        return bool(self.access_token) and self.expires_at > now + REFRESH_MARGIN_SECONDS


class TokenStore:
    """一份 JSON 文件装全部账号。文件名带来源，写入用整文件原子替换。"""

    def __init__(self, root: Path):
        self.path = Path(root) / "drive-accounts.json"

    def _read(self) -> dict[str, dict]:
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except FileNotFoundError:
            return {}
        except (OSError, ValueError) as exc:
            raise DriveUnavailable(f"账号文件读不出来：{exc}") from None
        return raw if isinstance(raw, dict) else {}

    def _write(self, rows: dict[str, dict]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.path.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
        os.chmod(temporary, 0o600)
        os.replace(temporary, self.path)

    def load(self, location: str) -> StoredAccount | None:
        row = self._read().get(location)
        if not isinstance(row, dict):
            return None
        try:
            return StoredAccount(**row)
        except TypeError:
            return None

    def save(self, account: StoredAccount) -> None:
        rows = self._read()
        rows[account.location] = asdict(account)
        self._write(rows)

    def drop(self, location: str) -> None:
        rows = self._read()
        if rows.pop(location, None) is not None:
            self._write(rows)


class Accounts:
    """按来源取一个能用的访问令牌，必要时刷新。

    `token_endpoint` 与 `refresh` 由具体驱动注入：Google 走 `oauth2.googleapis.com/token`，
    OneDrive 走 `login.microsoftonline.com`，两边请求体都是 `grant_type=refresh_token`。
    """

    def __init__(self, store: TokenStore, refresh: Callable[[StoredAccount], tuple[str, int, str]],
                 clock: Callable[[], float] = time.time):
        self.store = store
        self._refresh = refresh
        self.clock = clock

    def token(self, location: str) -> tuple[str, StoredAccount]:
        account = self.store.load(location)
        if account is None:
            raise DriveAuthRequired(location)
        if account.usable(self.clock()):
            return account.access_token, account
        if not account.refresh_token:
            raise DriveAuthRequired(location)
        access_token, expires_at, refresh_token = self._refresh(account)
        account.access_token = access_token
        account.expires_at = expires_at
        if refresh_token:
            account.refresh_token = refresh_token
        self.store.save(account)
        return account.access_token, account
