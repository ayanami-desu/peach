"""网盘连接的运行期门面：授权、令牌、扫描根与驱动实例。

路由与扫描都从这里取东西，谁也不直接读设置文件或账号文件。一个部署可以接多个账号，
同一个来源（Google Drive、OneDrive）底下也可以有多个账号：账号名叫 `[drive.accounts]`
的键，来源类型写在它的 `location` 里，缺省时账号名就是来源名。账号令牌在
`drive_accounts`，扫描根按账号名存在设置文件里（`[drive.roots]`），这里只做两者的
合并视图。
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
    DriveError,
    DriveProvider,
    DriveUnavailable,
    modes_for,
    playback_mode,
)

LOGGER = logging.getLogger(__name__)

#: 驱动实例造出来就要探一次账号资料，没授权的账号不造。
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
    """按账号提供驱动、账号视图与授权流程。"""

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
        #: `Accounts` 需要一个按账号分派的刷新入口；驱动实例在 `_build` 里才造得出来。
        self.accounts = Accounts(self.store, self._refresh, clock=clock)
        #: 扫描进度与错误由扫描服务写进账本，这里只留一个读口给 `GET /api/drive`。
        self.sync_state: Callable[[str], dict] = lambda key: {}
        #: 「立即刷新」按钮的落点，由 `api.py` 接上扫描服务。
        self.refresh_hook: Callable[[str], None] = lambda key: None
        self._build()

    # -- 装配 ---------------------------------------------------------------

    def location_of(self, key: str) -> str:
        """账号属于哪个来源。账号名就是来源名时两者相同。"""
        return self.settings.drive_locations.get(key, key)

    def keys(self) -> tuple[str, ...]:
        """配了凭据的账号名。没配凭据的账号连驱动都造不出来，不在其中。"""
        return tuple(self.settings.drive_clients)

    def keys_for(self, location: str) -> tuple[str, ...]:
        return tuple(key for key in self.keys() if self.location_of(key) == location)

    def _build(self) -> None:
        public_url = self.settings.drive_public_url.rstrip("/")
        for key in self.keys():
            pair = self.settings.drive_clients.get(key)
            if not pair or len(pair) != 2 or not all(pair):
                continue
            location = self.location_of(key)
            client_id, client_secret = pair
            # 回调基址只给授权用：`authorize` 自己会拒绝没有基址的发起。读、扫描、取流都不需要它，
            # 所以没填也不能把驱动拦在门外——那样处理链里的预览与探测会静默地什么都做不了。
            redirect_uri = f"{public_url}/oauth/{key}/callback" if public_url else ""
            # Google 只能带票转发，方式对它没有意义，只有 OneDrive 接这个参数。
            options = ({"mode": playback_mode(self.settings.drive_modes, location)}
                       if location == ONEDRIVE else {})
            factory = build_google if location == GOOGLE else build_onedrive
            try:
                self._providers[key] = factory(
                    self.accounts, self._client, client_id=client_id,
                    client_secret=client_secret, redirect_uri=redirect_uri,
                    key=key, **options)
            except Exception:
                # 账号还没授权、令牌过期读不出来，都只说明这个账号这一刻不能用；
                # 设置页照样要能打开。
                LOGGER.info("%s（%s）驱动未能建立", LABELS.get(location, location), key,
                            exc_info=True)

    def _refresh(self, account: StoredAccount) -> tuple[str, int, str]:
        """换票只看设置里的客户端凭据。

        驱动实例本身就可能是「票过期」才没造出来，所以这里不能再依赖 `self._providers`：
        授权被撤销之后要能重新点授权，也得走这条。"""
        key = account.key or account.location
        pair = self.settings.drive_clients.get(key)
        refresher = REFRESHERS.get(account.location)
        if not refresher or not pair or len(pair) != 2 or not all(pair):
            raise DriveAuthRequired(key)
        return refresher(self._client(), client_id=pair[0], client_secret=pair[1],
                         refresh_token=account.refresh_token)

    # -- 视图 ---------------------------------------------------------------

    @property
    def providers(self) -> dict[str, DriveProvider]:
        return dict(self._providers)

    def provider(self, key: str) -> DriveProvider:
        provider = self._providers.get(key)
        if provider is None:
            location = self.location_of(key)
            label = LABELS.get(location, key)
            name = label if key == location else f"{label}（{key}）"
            raise DriveUnavailable(f"{name} 还没有接入")
        return provider

    def key_for(self, location: str, drive_root: str = "") -> str:
        """哪本账：先按文件所属的扫描根找，找不到退回这个来源的第一个账号。"""
        if drive_root:
            for key, points in self.roots_map().items():
                if drive_root in points and self._providers.get(key) is not None:
                    return key
        for key in self.keys_for(location):
            if self._providers.get(key) is not None:
                return key
        raise DriveUnavailable(f"{LABELS.get(location, location)} 还没有接入")

    def provider_for(self, location: str, drive_root: str) -> DriveProvider:
        """取流与探测用：按文件所属的扫描根找到那个账号，找不到就退回该来源的第一个账号。"""
        return self.provider(self.key_for(location, drive_root))

    def account(self, key: str) -> StoredAccount | None:
        try:
            return self.store.load(key)
        except DriveUnavailable:
            return None

    def roots(self, key: str) -> tuple[str, ...]:
        """这个账号下的媒体库目录；一个都没建时就什么都不扫。"""
        return tuple(self.settings.drive_roots.get(key) or ())

    def roots_map(self) -> dict[str, tuple[str, ...]]:
        """每个账号的扫描起点，给扫描服务用。没有起点的账号不进表。"""
        roots = {}
        for key in self._providers:
            points = self.roots(key)
            if points:
                roots[key] = points
        return roots

    def connection(self, location: str) -> dict:
        """一个来源的合并视图：它底下的账号、合并后的扫描根与同步时间。"""
        label = LABELS.get(location, location or "网盘")
        rows = []
        roots: list[dict] = []
        synced_at = None
        last_error = ""
        for key in self.keys_for(location):
            account = self.account(key)
            state = self.sync_state(key) or {}
            points = self._root_rows(key)
            rows.append({
                "key": key,
                "configured": key in self._providers,
                "connected": account is not None,
                "email": account.email if account else "",
                "display_name": account.display_name if account else "",
                "synced_at": state.get("synced_at"),
                "last_error": state.get("last_error") or "",
                "roots": points,
            })
            roots.extend(points)
            stamp = state.get("synced_at")
            if stamp and (synced_at is None or stamp > synced_at):
                synced_at = stamp
            if not last_error and state.get("last_error"):
                last_error = state["last_error"]
        first = rows[0] if rows else {}
        return {
            "location": location,
            "label": label,
            "configured": any(row["configured"] for row in rows),
            "connected": any(row["connected"] for row in rows),
            "email": first.get("email", ""),
            "display_name": first.get("display_name", ""),
            "accounts": rows,
            "roots": roots,
            "mode": playback_mode(self.settings.drive_modes, location),
            "modes": list(modes_for(location)),
            "synced_at": synced_at,
            "last_error": last_error,
        }

    def status(self) -> dict:
        """不联网的接入状态：谁授权了、上次同步什么时候、最近一次错误。

        诊断只能看这些（扫描根的名字要问网盘，`_root_rows` 会发请求），所以这里不带 `roots`：
        `snapshot()` 是给页面看的，`status()` 是给诊断与健康检查看的。
        """
        rows = []
        for source in LOCATIONS:
            accounts = []
            synced_at = None
            last_error = ""
            for key in self.keys_for(source):
                account = self.account(key)
                state = self.sync_state(key) or {}
                accounts.append({
                    "key": key,
                    "configured": key in self._providers,
                    "connected": account is not None,
                    "email": account.email if account else "",
                    "display_name": account.display_name if account else "",
                    "synced_at": state.get("synced_at"),
                    "last_error": state.get("last_error") or "",
                })
                stamp = state.get("synced_at")
                if stamp and (synced_at is None or stamp > synced_at):
                    synced_at = stamp
                if not last_error and state.get("last_error"):
                    last_error = state["last_error"]
            first = accounts[0] if accounts else {}
            rows.append({
                "location": source,
                "label": LABELS.get(source, source),
                "configured": any(row["configured"] for row in accounts),
                "connected": any(row["connected"] for row in accounts),
                "email": first.get("email", ""),
                "display_name": first.get("display_name", ""),
                "accounts": accounts,
                "synced_at": synced_at,
                "last_error": last_error,
            })
        return {"public_url": self.settings.drive_public_url, "locations": rows}

    def _root_rows(self, key: str) -> list[dict]:
        rows = []
        provider = self._providers.get(key)
        for remote_id in self.settings.drive_roots.get(key) or ():
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
        names = {f"{self.location_of(key)}:{row['remote_id']}": row["name"]
                 for key in self.keys() for row in self._root_rows(key)}
        self._root_names, self._root_names_at = names, now
        return dict(names)

    def snapshot(self) -> dict:
        return {
            "public_url": self.settings.drive_public_url,
            "locations": [self.connection(source) for source in LOCATIONS],
        }

    # -- 授权 ---------------------------------------------------------------

    def authorize(self, key: str) -> str:
        provider = self.provider(key)
        if not self.settings.drive_public_url:
            raise DriveUnavailable("没有配置回调基址，先填 [drive] public_url")
        state = secrets.token_urlsafe(16)
        self._states[state] = (key, self._clock() + STATE_TTL_SECONDS)
        return provider.authorize_url(state)

    def accept(self, key: str, code: str, state: str) -> StoredAccount:
        expected = self._states.pop(state or "", None)
        if expected is None or expected[0] != key or expected[1] < self._clock():
            raise DriveUnavailable("授权回执已过期，回到设置页重新发起授权")
        if not code:
            raise DriveUnavailable("授权回执里没有 code")
        account = self.provider(key).exchange(code)
        # `exchange` 已经把令牌写进账号文件；这里只把账号视图换成新的。
        account.key = key
        self.store.save(account)
        return account

    def set_credentials(self, key: str, *, client_id: str, client_secret: str,
                        refresh_token: str, root: str = "",
                        location: str = "") -> StoredAccount:
        """直接填认证信息接上一个账号，不必走浏览器授权。

        先拿这三样换一次票确认它们配套，再落设置与账号文件；`root` 给了就把这个目录
        当成它唯一的媒体库（目录路径或远端 id），解析不出来只报错，已有目录不动。
        """
        source = (location or self.location_of(key) or key).strip()
        if source not in LOCATIONS:
            raise DriveUnavailable(f"没有这个网盘：{source}")
        client_id, client_secret, refresh_token = (client_id.strip(), client_secret.strip(),
                                                   refresh_token.strip())
        if not all((client_id, client_secret, refresh_token)):
            raise DriveUnavailable("客户端 ID、客户端密钥和 refresh token 都要填")
        refresher = REFRESHERS[source]
        access_token, expires_at, renewed = refresher(
            self._client(), client_id=client_id, client_secret=client_secret,
            refresh_token=refresh_token)
        stored = StoredAccount(location=source, account_id="", email="", display_name="",
                               root_id="", refresh_token=renewed or refresh_token,
                               access_token=access_token, expires_at=expires_at, key=key)
        self.accounts.store.save(stored)
        clients = dict(self.settings.drive_clients)
        clients[key] = (client_id, client_secret)
        locations = dict(self.settings.drive_locations)
        locations[key] = source
        self.settings = dataclasses.replace(
            self.settings, drive_clients=clients, drive_locations=locations)
        self._persist_clients(clients, locations)
        self._providers.pop(key, None)
        self._build()
        provider = self.provider(key)
        try:
            stored.account_id, stored.email, stored.display_name, stored.root_id = (
                provider.identify(access_token))
        except DriveError:
            # 换票已经成功，凭据是好的；账号视图只是给人看的，问不到就先留空。
            LOGGER.warning("%s（%s）的账号信息没问到", LABELS.get(source, source), key,
                           exc_info=True)
        else:
            self.accounts.store.save(stored)
        if root.strip():
            self._save_roots(key, (self._root_id(provider, stored.root_id, root),))
        self._root_names = {}
        return stored

    def _root_id(self, provider: DriveProvider, start: str, text: str) -> str:
        """把 `AV/示例合集` 这样的路径解析成远端目录 id；也接受直接给 id。"""
        parts = [part.strip() for part in text.replace("\\", "/").split("/") if part.strip()]
        if not parts:
            return start
        if len(parts) == 1:
            try:
                entry = provider.entry(parts[0])
            except DriveError:
                entry = None
            if entry is not None and entry.folder:
                return entry.remote_id
        current = start
        for part in parts:
            entries, _cursor = provider.list_folder(current)
            candidates = [entry for entry in entries if entry.folder]
            found = (next((entry for entry in candidates if entry.name == part), None)
                     or next((entry for entry in candidates
                              if entry.name.casefold() == part.casefold()), None))
            if found is None:
                raise DriveUnavailable(f"没找到目录：{part}")
            current = found.remote_id
        return current

    def set_public_url(self, public_url: str) -> str:
        """记下浏览器授权的回调基址，即 `[drive] public_url`；空串表示不走浏览器授权。

        它只用来拼 `redirect_uri` 与发起授权，读、扫描、取流都不看它，所以改完只重建驱动实例。
        """
        text = public_url.strip().rstrip("/")
        if text and not (text.startswith("https://") and len(text) > len("https://")):
            raise DriveUnavailable("回调基址要写成 https 地址，例如 https://peach.example.com")
        if text == self.settings.drive_public_url:
            return text
        self.settings = dataclasses.replace(self.settings, drive_public_url=text)
        settings_file.write(dataclasses.replace(settings_file.active(), drive_public_url=text),
                            force=True)
        self._build()
        return text

    def _persist_clients(self, clients: Mapping[str, tuple[str, str]],
                         locations: Mapping[str, str] | None = None) -> None:
        config = settings_file.active()
        changes = {"drive_clients": dict(clients)}
        if locations is not None:
            changes["drive_locations"] = dict(locations)
        settings_file.write(dataclasses.replace(config, **changes), force=True)

    # -- 扫描根 -------------------------------------------------------------

    def add_root(self, key: str, remote_id: str) -> tuple[str, ...]:
        """把一个远端目录加成媒体库：它同时就是这台账号的扫描根之一。

        重复添加是空操作——媒体库只是一层映射，加两遍和加一遍的下场必须一样。
        """
        remote_id = str(remote_id or "").strip()
        if not remote_id:
            raise DriveUnavailable("请选择要作为媒体库的目录")
        current = self.roots(key)
        if remote_id in current:
            return current
        provider = self.provider(key)
        entry = provider.entry(remote_id)
        if not entry.folder:
            raise DriveUnavailable(f"{entry.name or remote_id} 不是目录")
        return self._save_roots(key, (*current, remote_id))

    def remove_root(self, key: str, remote_id: str) -> tuple[str, ...]:
        """把一个目录从这台账号的媒体库里去掉：只改配置，账本里的行原样留着。

        已经不在里面时同样是空操作。
        """
        current = self.roots(key)
        if remote_id not in current:
            return current
        return self._save_roots(key, tuple(item for item in current if item != remote_id))

    def move_root(self, key: str, remote_id: str, target: str) -> tuple[str, ...]:
        """把一个扫描根换成另一个目录：一次写入完成替换，账本里的行原样留着。

        换成自己时是空操作；目标目录已经在这台账号的媒体库里时也空操作——同一个目录只挂一个库，
        免得两条库指向同一批行。目标必须是目录。
        """
        remote_id, target = str(remote_id or "").strip(), str(target or "").strip()
        if not target:
            raise DriveUnavailable("请选择要作为媒体库的目录")
        current = self.roots(key)
        if remote_id == target:
            return current
        provider = self.provider(key)
        entry = provider.entry(target)
        if not entry.folder:
            raise DriveUnavailable(f"{entry.name or target} 不是目录")
        if target in current:
            return current
        replaced = tuple(target if item == remote_id else item for item in current)
        if remote_id not in current:
            replaced = (*current, target)
        return self._save_roots(key, replaced)

    def _save_roots(self, key: str, ids: tuple[str, ...]) -> tuple[str, ...]:
        self.settings = dataclasses.replace(
            self.settings,
            drive_roots={**self.settings.drive_roots, key: ids})
        self._persist_roots(key, ids)
        self._root_names = {}
        return ids

    def _persist_roots(self, key: str, ids: tuple[str, ...]) -> None:
        config = settings_file.active()
        roots = dict(config.drive_roots)
        if ids:
            roots[key] = ids
        else:
            roots.pop(key, None)
        settings_file.write(dataclasses.replace(config, drive_roots=roots), force=True)

    def forget(self, key: str) -> None:
        self.store.drop(key)
        self._providers.pop(key, None)
        self.settings = dataclasses.replace(
            self.settings,
            drive_roots={**self.settings.drive_roots, key: ()})
        self._persist_roots(key, ())

    # -- 取字节方式 ---------------------------------------------------------

    def set_mode(self, location: str, mode: str) -> str:
        """换这个来源的取字节方式，并重建驱动实例让它生效。"""
        if not self.keys_for(location):
            raise DriveUnavailable(f"{LABELS.get(location, location)} 还没有接入")
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

    def refresh(self, key: str) -> None:
        self.provider(key)
        self.refresh_hook(key)
