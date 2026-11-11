"""网盘连接的运行期门面：授权、令牌、扫描根与驱动实例。

路由与扫描都从这里取东西，谁也不直接读设置文件或账号文件。一个部署最多接两个
来源（Google Drive、OneDrive），每个来源一份账号；账号令牌在 `drive_accounts`，
扫描根在设置文件里（`[drive.roots.<location>]`），这里只做两者的合并视图。
"""
from __future__ import annotations

import dataclasses
import logging
import secrets
import time
from typing import Callable, Mapping

from . import settings_file
from .config import PeachSettings
from .drive_accounts import Accounts, StoredAccount, TokenStore
from .drive_google import build as build_google, refresh_access as refresh_google
from .drive_onedrive import build as build_onedrive, refresh_access as refresh_onedrive
from .drive_provider import (
    GOOGLE,
    LOCATIONS,
    ONEDRIVE,
    DriveAuthRequired,
    DriveProvider,
    DriveUnavailable,
    modes_for,
    playback_mode,
)

LOGGER = logging.getLogger(__name__)

#: 驱动实例造出来就要探一次账号资料，没授权的来源不造。
LABELS: Mapping[str, str] = {GOOGLE: "Google Drive", ONEDRIVE: "OneDrive"}

#: 授权状态串的存活时间。回调必须落在同一个进程里，重启后重新点一次授权即可。
STATE_TTL_SECONDS = 900

#: 扫描根目录名的缓存时间：媒体库下拉框每页都要名字，问网盘一次够用五分钟。
ROOT_NAME_TTL_SECONDS = 300

#: 每个来源换票的入口。挂在模块上而不是驱动实例上：实例建不出来的原因常常就是票过期。
REFRESHERS: Mapping[str, Callable[..., tuple[str, int, str]]] = {
    GOOGLE: refresh_google, ONEDRIVE: refresh_onedrive,
}


class DriveConnections:
    """按来源提供驱动、账号视图与授权流程。"""

    def __init__(self, settings: PeachSettings, client: Callable[[], object],
                 *, clock: Callable[[], float] = time.time):
        self.settings = settings
        self._client = client
        self._clock = clock
        self.store = TokenStore(settings.secrets_root)
        self._providers: dict[str, DriveProvider] = {}
        self._states: dict[str, tuple[str, float]] = {}
        self._root_names: dict[str, str] = {}
        self._root_names_at = 0.0
        #: `Accounts` 需要一个按来源分派的刷新入口；驱动实例在 `_build` 里才造得出来。
        self.accounts = Accounts(self.store, self._refresh, clock=clock)
        #: 扫描进度与错误由扫描服务写进账本，这里只留一个读口给 `GET /api/drive`。
        self.sync_state: Callable[[str], dict] = lambda location: {}
        #: 「立即刷新」按钮的落点，由 `api.py` 接上扫描服务。
        self.refresh_hook: Callable[[str], None] = lambda location: None
        self._build()

    # -- 装配 ---------------------------------------------------------------

    def _build(self) -> None:
        public_url = self.settings.drive_public_url.rstrip("/")
        for location in LOCATIONS:
            pair = self.settings.drive_clients.get(location)
            if not pair or len(pair) != 2 or not all(pair):
                continue
            client_id, client_secret = pair
            # 回调基址只给授权用：`authorize` 自己会拒绝没有基址的发起。读、扫描、取流都不需要它，
            # 所以没填也不能把驱动拦在门外——那样处理链里的预览与探测会静默地什么都做不了。
            redirect_uri = f"{public_url}/oauth/{location}/callback" if public_url else ""
            # Google 只能带票转发，方式对它没有意义，只有 OneDrive 接这个参数。
            options = ({"mode": playback_mode(self.settings.drive_modes, location)}
                       if location == ONEDRIVE else {})
            factory = build_google if location == GOOGLE else build_onedrive
            try:
                self._providers[location] = factory(
                    self.accounts, self._client, client_id=client_id,
                    client_secret=client_secret, redirect_uri=redirect_uri, **options)
            except Exception:
                # 账号还没授权、令牌过期读不出来，都只说明这个来源这一刻不能用；
                # 设置页照样要能打开。
                LOGGER.info("%s 驱动未能建立", LABELS.get(location, location), exc_info=True)

    def _refresh(self, account: StoredAccount) -> tuple[str, int, str]:
        """换票只看设置里的客户端凭据。

        驱动实例本身就可能是「票过期」才没造出来，所以这里不能再依赖 `self._providers`：
        授权被撤销之后要能重新点授权，也得走这条。"""
        pair = self.settings.drive_clients.get(account.location)
        refresher = REFRESHERS.get(account.location)
        if not refresher or not pair or len(pair) != 2 or not all(pair):
            raise DriveAuthRequired(account.location)
        return refresher(self._client(), client_id=pair[0], client_secret=pair[1],
                         refresh_token=account.refresh_token)

    # -- 视图 ---------------------------------------------------------------

    @property
    def providers(self) -> dict[str, DriveProvider]:
        return dict(self._providers)

    def provider(self, location: str) -> DriveProvider:
        provider = self._providers.get(location)
        if provider is None:
            raise DriveUnavailable(f"{LABELS.get(location, location)} 还没有接入")
        return provider

    def account(self, location: str) -> StoredAccount | None:
        try:
            return self.store.load(location)
        except DriveUnavailable:
            return None

    def roots(self, location: str) -> tuple[str, ...]:
        """扫描起点：设置里选过就用选的，没选过扫账号根目录。"""
        configured = self.settings.drive_roots.get(location) or ()
        if configured:
            return configured
        account = self.account(location)
        return (account.root_id,) if account and account.root_id else ()

    def roots_map(self) -> dict[str, tuple[str, ...]]:
        """每个已授权来源的扫描起点，给扫描服务用。没有起点的来源不进表。"""
        roots = {}
        for location in self._providers:
            points = self.roots(location)
            if points:
                roots[location] = points
        return roots

    def connection(self, location: str) -> dict:
        label = LABELS.get(location, location or "网盘")
        account = self.account(location)
        state = self.sync_state(location) or {}
        return {
            "location": location,
            "label": label,
            "configured": location in self._providers,
            "connected": account is not None,
            "email": account.email if account else "",
            "display_name": account.display_name if account else "",
            "roots": self._root_rows(location),
            "mode": playback_mode(self.settings.drive_modes, location),
            "modes": list(modes_for(location)),
            "synced_at": state.get("synced_at"),
            "last_error": state.get("last_error") or "",
        }

    def status(self) -> dict:
        """不联网的接入状态：谁授权了、上次同步什么时候、最近一次错误。

        诊断只能看这些（扫描根的名字要问网盘，`_root_rows` 会发请求），所以这里不带 `roots`：
        `snapshot()` 是给页面看的，`status()` 是给诊断与健康检查看的。
        """
        rows = []
        for location in LOCATIONS:
            account = self.account(location)
            state = self.sync_state(location) or {}
            rows.append({
                "location": location,
                "label": LABELS.get(location, location or "网盘"),
                "configured": location in self._providers,
                "connected": account is not None,
                "email": account.email if account else "",
                "display_name": account.display_name if account else "",
                "synced_at": state.get("synced_at"),
                "last_error": state.get("last_error") or "",
            })
        return {"public_url": self.settings.drive_public_url, "locations": rows}

    def _root_rows(self, location: str) -> list[dict]:
        rows = []
        provider = self._providers.get(location)
        for remote_id in self.settings.drive_roots.get(location) or ():
            name = remote_id
            if provider is not None:
                try:
                    name = provider.entry(remote_id).name or remote_id
                except Exception:
                    name = remote_id
            rows.append({"remote_id": remote_id, "name": name})
        return rows

    def root_names(self) -> dict[str, str]:
        """扫描根的目录名，按媒体库 id（`来源:远端 id`）索引；取不到名字时退回远端 id。

        名字要问网盘，而媒体库下拉框几乎每页都要一次，所以留五分钟：改目录名不必立刻
        跟上，扫一次就够。
        """
        now = self._clock()
        if self._root_names and self._root_names_at + ROOT_NAME_TTL_SECONDS > now:
            return dict(self._root_names)
        names = {f"{location}:{row['remote_id']}": row["name"]
                 for location in LOCATIONS for row in self._root_rows(location)}
        self._root_names, self._root_names_at = names, now
        return dict(names)

    def snapshot(self) -> dict:
        return {
            "public_url": self.settings.drive_public_url,
            "locations": [self.connection(location) for location in LOCATIONS],
        }

    # -- 授权 ---------------------------------------------------------------

    def authorize(self, location: str) -> str:
        provider = self.provider(location)
        if not self.settings.drive_public_url:
            raise DriveUnavailable("没有配置回调基址，先填 [drive] public_url")
        state = secrets.token_urlsafe(16)
        self._states[state] = (location, self._clock() + STATE_TTL_SECONDS)
        return provider.authorize_url(state)

    def accept(self, location: str, code: str, state: str) -> StoredAccount:
        expected = self._states.pop(state or "", None)
        if expected is None or expected[0] != location or expected[1] < self._clock():
            raise DriveUnavailable("授权回执已过期，回到设置页重新发起授权")
        if not code:
            raise DriveUnavailable("授权回执里没有 code")
        account = self.provider(location).exchange(code)
        # `exchange` 已经把令牌写进账号文件；这里只把账号视图换成新的。
        account.location = location
        self.store.save(account)
        return account

    # -- 扫描根 -------------------------------------------------------------

    def set_roots(self, location: str, rows: list[dict]) -> tuple[str, ...]:
        self.provider(location)
        ids = tuple(str(row.get("remote_id") or "").strip() for row in rows)
        ids = tuple(remote_id for remote_id in ids if remote_id)
        self.settings = dataclasses.replace(
            self.settings,
            drive_roots={**self.settings.drive_roots, location: ids})
        self._persist_roots(location, ids)
        self._root_names = {}
        return ids

    def _persist_roots(self, location: str, ids: tuple[str, ...]) -> None:
        config = settings_file.active()
        roots = dict(config.drive_roots)
        if ids:
            roots[location] = ids
        else:
            roots.pop(location, None)
        settings_file.write(dataclasses.replace(config, drive_roots=roots), force=True)

    def forget(self, location: str) -> None:
        self.store.drop(location)
        self._providers.pop(location, None)
        self.settings = dataclasses.replace(
            self.settings,
            drive_roots={**self.settings.drive_roots, location: ()})
        self._persist_roots(location, ())

    # -- 取字节方式 ---------------------------------------------------------

    def set_mode(self, location: str, mode: str) -> str:
        """换这个来源的取字节方式，并重建驱动实例让它生效。"""
        self.provider(location)
        if mode not in modes_for(location):
            raise DriveUnavailable(f"{LABELS.get(location, location)} 不能选这种方式：{mode}")
        modes = dict(self.settings.drive_modes)
        if mode == playback_mode({}, location):
            # 与默认值一致就不写进文件：换回默认值等于这一项没配过。
            modes.pop(location, None)
        else:
            modes[location] = mode
        self.settings = dataclasses.replace(self.settings, drive_modes=modes)
        self._persist_modes(modes)
        self._build()
        return mode

    def _persist_modes(self, modes: Mapping[str, str]) -> None:
        config = settings_file.active()
        settings_file.write(dataclasses.replace(config, drive_modes=dict(modes)), force=True)

    def refresh(self, location: str) -> None:
        self.provider(location)
        self.refresh_hook(location)
