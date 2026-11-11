"""OneDrive 驱动：OAuth 换码、`children` 遍历、预授权直链、`delta` 增量。"""
from __future__ import annotations

import time
from typing import Callable, Sequence
from urllib.parse import quote, urlencode

import httpx

from .drive_accounts import Accounts, StoredAccount
from .drive_provider import (
    ONEDRIVE,
    REDIRECT,
    Change,
    DownloadTarget,
    DriveAccount,
    DriveAuthRequired,
    DriveEntry,
    DriveForbidden,
    DriveNotFound,
    DriveUnavailable,
)

AUTH_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
GRAPH = "https://graph.microsoft.com/v1.0"
#: 读文件、改名移动与增量同步都要；`offline_access` 才拿得到 refresh token。
SCOPE = "Files.ReadWrite.All offline_access"
#: 列表与单项共用的字段，含免费的视频元数据。
SELECT = "id,name,size,lastModifiedDateTime,file,folder,video,parentReference"
#: `delta` 比列表多一个 `deleted`，删除项只靠它认出来。
DELTA_SELECT = f"{SELECT},deleted"
PAGE_SIZE = 1000


def token_call(client: httpx.Client, payload: dict) -> dict:
    """令牌端点：408/429/5xx 算可重试，其余 4xx 是授权本身不成立了。"""
    response = client.post(TOKEN_ENDPOINT, data=payload, timeout=30)
    if response.status_code >= 400:
        if response.status_code in (408, 429) or response.status_code >= 500:
            raise DriveUnavailable(f"令牌端点返回 {response.status_code}")
        raise DriveAuthRequired(f"令牌端点返回 {response.status_code} {response.text[:200]}")
    return response.json()


def refresh_access(client: httpx.Client, *, client_id: str, client_secret: str,
                   refresh_token: str) -> tuple[str, int, str]:
    """用 refresh token 换一份访问票；驱动实例没造出来时也得能换，理由同 Google 那一侧。"""
    payload = token_call(client, {
        "grant_type": "refresh_token", "refresh_token": refresh_token,
        "client_id": client_id, "client_secret": client_secret, "scope": SCOPE,
    })
    expires_at = int(time.time()) + int(payload.get("expires_in", 0))
    return str(payload.get("access_token") or ""), expires_at, str(payload.get("refresh_token") or "")


def _entry(raw: dict, parent: str = "") -> DriveEntry:
    meta = raw.get("video") or {}
    size = raw.get("size")
    return DriveEntry(
        remote_id=str(raw["id"]),
        name=str(raw.get("name") or raw["id"]),
        parent_id=parent or str((raw.get("parentReference") or {}).get("id") or ""),
        folder="folder" in raw,
        size=int(size) if isinstance(size, int) else None,
        modified=raw.get("lastModifiedDateTime"),
        mime=(raw.get("file") or {}).get("mimeType"),
        duration=int(meta["duration"]) / 1000 if isinstance(meta.get("duration"), int) else None,
        width=meta.get("width"),
        height=meta.get("height"),
    )


def _item(remote_id: str) -> str:
    return "/me/drive/items/" + quote(remote_id, safe="")


class OneDrive:
    location = ONEDRIVE

    def __init__(self, accounts: Accounts, client: Callable[[], httpx.Client],
                 client_id: str = "", client_secret: str = "", redirect_uri: str = "",
                 mode: str = REDIRECT, key: str = ONEDRIVE):
        self.accounts = accounts
        self._client = client
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        #: 取字节方式，`redirect` 或 `proxy`，由设置里的 `[drive.modes]` 决定。
        self.mode = mode
        #: 账号名：同一个来源可以接多个账号，令牌与扫描根都按它的名字存。
        self.key = key
        self.account = self._profile()

    # -- 授权 ---------------------------------------------------------------

    def authorize_url(self, state: str) -> str:
        query = urlencode({
            "client_id": self.client_id, "response_type": "code",
            "redirect_uri": self.redirect_uri, "response_mode": "query",
            "scope": SCOPE, "state": state,
        })
        return f"{AUTH_ENDPOINT}?{query}"

    def exchange(self, code: str) -> StoredAccount:
        """换码并落盘。没有 refresh token 就当这次授权白做了。"""
        payload = self.token_call({
            "grant_type": "authorization_code", "code": code,
            "client_id": self.client_id, "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri, "scope": SCOPE,
        })
        refresh_token = payload.get("refresh_token", "")
        if not refresh_token:
            raise DriveUnavailable("授权响应里没有 refresh token，请重新授权")
        stored = StoredAccount(
            location=ONEDRIVE, account_id="", email="", display_name="", root_id="",
            refresh_token=refresh_token,
            access_token=payload.get("access_token", ""),
            expires_at=int(time.time()) + int(payload.get("expires_in", 0)),
            scope=payload.get("scope", ""), key=self.key,
        )
        stored.account_id, stored.email, stored.display_name, stored.root_id = self.identify(
            stored.access_token)
        self.accounts.store.save(stored)
        self._reload()
        return stored

    def token_call(self, payload: dict) -> dict:
        """令牌端点：408/429/5xx 算可重试，其余 4xx 是授权本身不成立了。"""
        return token_call(self._client(), payload)

    def refresh(self, account: StoredAccount) -> tuple[str, int, str]:
        return refresh_access(self._client(), client_id=self.client_id,
                              client_secret=self.client_secret,
                              refresh_token=account.refresh_token)

    def identify(self, token: str) -> tuple[str, str, str, str]:
        """只查 Drive 端点：`/me` 要 `User.Read`，只有文件权限的授权拿不到。"""
        drive = self._get("/me/drive", token=token, params={"$select": "id,owner"})
        owner = ((drive.get("owner") or {}).get("user") or {})
        root = self._get("/me/drive/root", token=token, params={"$select": "id"})
        return (str(drive.get("id", "")),
                str(owner.get("email") or ""),
                str(owner.get("displayName") or ""), str(root.get("id", "")))

    def _profile(self) -> DriveAccount:
        stored = self.accounts.store.load(self.key)
        if stored is None:
            return DriveAccount(ONEDRIVE, "", "", "", "")
        if not stored.account_id:
            stored.account_id, stored.email, stored.display_name, stored.root_id = self.identify(
                self.accounts.token(self.key)[0])
            self.accounts.store.save(stored)
        return DriveAccount(ONEDRIVE, stored.account_id, stored.email, stored.display_name,
                            stored.root_id)

    def _reload(self) -> None:
        self.account = self._profile()

    # -- 读取 ---------------------------------------------------------------

    def _request(self, method: str, url: str, params: dict | None = None, body: dict | None = None,
                 token: str | None = None) -> httpx.Response:
        """`url` 是路径时拼上 Graph 前缀；`nextLink`/`deltaLink` 本来就是绝对地址。"""
        access = token or self.accounts.token(self.key)[0]
        response = self._client().request(
            method, url if url.startswith("http") else GRAPH + url, params=params, json=body,
            timeout=60, headers={"Authorization": f"Bearer {access}"},
        )
        self._raise(response)
        return response

    def _get(self, url: str, params: dict | None = None, token: str | None = None) -> dict:
        return self._request("GET", url, params, token=token).json()

    @staticmethod
    def _raise(response: httpx.Response) -> None:
        if response.status_code < 400:
            return
        if response.status_code == 401:
            raise DriveAuthRequired(response.text[:200])
        if response.status_code == 403:
            raise DriveForbidden(response.text[:200])
        if response.status_code == 404:
            raise DriveNotFound(response.text[:200])
        raise DriveUnavailable(f"{response.status_code} {response.text[:200]}")

    def list_folder(self, parent_id: str, cursor: str | None = None,
                    ) -> tuple[Sequence[DriveEntry], str | None]:
        """游标是 `@odata.nextLink` 的整个绝对地址，翻页时原样再发一次。"""
        if cursor:
            body = self._get(cursor)
        else:
            body = self._get(_item(parent_id) + "/children",
                             {"$top": PAGE_SIZE, "$select": SELECT})
        return ([_entry(row, parent_id) for row in body.get("value", [])],
                body.get("@odata.nextLink"))

    def entry(self, remote_id: str) -> DriveEntry:
        return _entry(self._get(_item(remote_id), {"$select": SELECT}))

    def download_target(self, remote_id: str) -> DownloadTarget:
        """区别只在谁去取字节：直连让浏览器跟预授权地址走，转发由 Peach 带 Range 去取。

        `@microsoft.graph.downloadUrl` 自带授权，所以两种方式拿到的是同一个地址。
        """
        url = self._get(_item(remote_id)).get("@microsoft.graph.downloadUrl")
        if not url:
            raise DriveUnavailable(f"{remote_id} 没有预授权下载地址")
        return DownloadTarget(self.mode, str(url))

    def move(self, remote_id: str, parent_id: str, name: str | None = None) -> DriveEntry:
        body: dict = {"parentReference": {"id": parent_id}}
        if name:
            body["name"] = name
        response = self._request("PATCH", _item(remote_id), body=body)
        return _entry(response.json(), parent_id)

    def changes(self, cursor: str | None) -> tuple[Sequence[Change], str]:
        """增量变更。游标为 None 时从根开始，返回的 `deltaLink` 就是下一轮的游标。"""
        if cursor is None:
            body = self._get("/me/drive/root/delta", {"$select": DELTA_SELECT})
        else:
            body = self._get(cursor)
        rows: list[Change] = []
        for raw in body.get("value", []):
            remote_id = str(raw.get("id") or "")
            if "deleted" in raw:
                rows.append(Change(remote_id, True, None))
                continue
            # 根项与 OneNote 包既不是目录也没有字节，跳过。
            if "folder" not in raw and "file" not in raw:
                continue
            rows.append(Change(remote_id, False, _entry(raw)))
        return rows, str(body.get("@odata.deltaLink") or body.get("@odata.nextLink") or cursor or "")


def build(accounts: Accounts, client: Callable[[], httpx.Client], *, client_id: str,
          client_secret: str, redirect_uri: str, mode: str = REDIRECT,
          key: str = ONEDRIVE) -> OneDrive:
    return OneDrive(accounts, client, client_id=client_id, client_secret=client_secret,
                    redirect_uri=redirect_uri, mode=mode, key=key)
