"""Google Drive 驱动：OAuth 换码、`files.list` 遍历、`alt=media` 取字节、`changes` 增量。"""
from __future__ import annotations

import time
from typing import Callable, Sequence
from urllib.parse import urlencode

import httpx

from .drive_accounts import Accounts, StoredAccount
from .drive_provider import (
    GOOGLE,
    Change,
    DownloadTarget,
    DriveAccount,
    DriveAuthRequired,
    DriveForbidden,
    DriveNotFound,
    DriveUnavailable,
    DriveEntry,
)

AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
API = "https://www.googleapis.com/drive/v3"
#: 只读文件、列目录、改名移动与增量同步都要；`drive.file` 看不到用户自己上传的存量。
SCOPE = "https://www.googleapis.com/auth/drive"
FOLDER_MIME = "application/vnd.google-apps.folder"
#: 列表与增量共用的字段，含免费的视频元数据。
FILE_FIELDS = ("id,name,mimeType,size,modifiedTime,parents,trashed,"
               "videoMediaMetadata(width,height,durationMillis)")
PAGE_SIZE = 1000


def _entry(raw: dict, parent: str = "") -> DriveEntry:
    meta = raw.get("videoMediaMetadata") or {}
    duration = meta.get("durationMillis")
    return DriveEntry(
        remote_id=str(raw["id"]),
        name=str(raw.get("name") or raw["id"]),
        parent_id=parent or next(iter(raw.get("parents") or []), ""),
        folder=raw.get("mimeType") == FOLDER_MIME,
        size=int(raw["size"]) if str(raw.get("size", "")).isdigit() else None,
        modified=raw.get("modifiedTime"),
        mime=raw.get("mimeType"),
        duration=int(duration) / 1000 if str(duration or "").isdigit() else None,
        width=meta.get("width"),
        height=meta.get("height"),
    )


def _quote(remote_id: str) -> str:
    return "'" + remote_id.replace("\\", "\\\\").replace("'", "\\'") + "'"


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
    """用 refresh token 换一份访问票。

    驱动实例还没造出来时也得能换——票过期的账号建不出实例，实例又只有它能换票，
    把这段挂在类上就是这个先有鸡还是先有蛋的死结。"""
    payload = token_call(client, {
        "grant_type": "refresh_token", "refresh_token": refresh_token,
        "client_id": client_id, "client_secret": client_secret,
    })
    expires_at = int(time.time()) + int(payload.get("expires_in", 0))
    return str(payload.get("access_token") or ""), expires_at, str(payload.get("refresh_token") or "")


class GoogleDrive:
    location = GOOGLE

    def __init__(self, accounts: Accounts, client: Callable[[], httpx.Client],
                 client_id: str = "", client_secret: str = "", redirect_uri: str = "",
                 key: str = GOOGLE):
        self.accounts = accounts
        self._client = client
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        #: 账号名：同一个来源可以接多个账号，令牌与扫描根都按它的名字存。
        self.key = key
        self.account = self._profile()

    # -- 授权 ---------------------------------------------------------------

    def authorize_url(self, state: str) -> str:
        query = urlencode({
            "client_id": self.client_id, "redirect_uri": self.redirect_uri,
            "response_type": "code", "scope": SCOPE, "access_type": "offline",
            "prompt": "consent", "include_granted_scopes": "true", "state": state,
        })
        return f"{AUTH_ENDPOINT}?{query}"

    def exchange(self, code: str) -> StoredAccount:
        """换码并落盘。`refresh_token` 只在 `prompt=consent` 那次出现，缺了就当授权失败。"""
        payload = self.refresh_call({
            "grant_type": "authorization_code", "code": code,
            "client_id": self.client_id, "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
        })
        refresh_token = payload.get("refresh_token", "")
        if not refresh_token:
            raise DriveUnavailable("授权响应里没有 refresh token，请重新授权")
        stored = StoredAccount(
            location=GOOGLE, account_id="", email="", display_name="", root_id="",
            refresh_token=refresh_token,
            access_token=payload.get("access_token", ""),
            expires_at=int(time.time()) + int(payload.get("expires_in", 0)),
            scope=payload.get("scope", ""), key=self.key,
        )
        stored.account_id, stored.email, stored.display_name, stored.root_id = self.identify(stored.access_token)
        self.accounts.store.save(stored)
        self._reload()
        return stored

    def refresh_call(self, payload: dict) -> dict:
        return token_call(self._client(), payload)

    def refresh(self, account: StoredAccount) -> tuple[str, int, str]:
        return refresh_access(self._client(), client_id=self.client_id,
                              client_secret=self.client_secret,
                              refresh_token=account.refresh_token)

    def identify(self, token: str) -> tuple[str, str, str, str]:
        # `/about` 没有 `root` 这个字段，选了它整条请求 400；根目录 id 要另问一次。
        body = self._get("/about", {"fields": "user(displayName,emailAddress,permissionId)"})
        user = body.get("user") or {}
        root = self._get("/files/root", {"fields": "id"})
        return (str(user.get("permissionId", "")), str(user.get("emailAddress", "")),
                str(user.get("displayName", "")), str(root.get("id", "")))

    def _profile(self) -> DriveAccount:
        stored = self.accounts.store.load(self.key)
        if stored is None:
            return DriveAccount(GOOGLE, "", "", "", "")
        if not stored.account_id:
            stored.account_id, stored.email, stored.display_name, stored.root_id = self.identify(
                self.accounts.token(self.key)[0])
            self.accounts.store.save(stored)
        return DriveAccount(GOOGLE, stored.account_id, stored.email, stored.display_name, stored.root_id)

    def _reload(self) -> None:
        self.account = self._profile()

    # -- 读取 ---------------------------------------------------------------

    def _request(self, method: str, path: str, params: dict | None = None) -> httpx.Response:
        token, _ = self.accounts.token(self.key)
        response = self._client().request(
            method, API + path, params=params, timeout=60,
            headers={"Authorization": f"Bearer {token}"},
        )
        self._raise(response)
        return response

    def _get(self, path: str, params: dict | None = None) -> dict:
        return self._request("GET", path, params).json()

    @staticmethod
    def _raise(response: httpx.Response) -> None:
        if response.status_code < 400:
            return
        if response.status_code == 404:
            raise DriveNotFound(response.request.url.path)
        if response.status_code in (401, 403):
            raise DriveForbidden(response.text[:200])
        raise DriveUnavailable(f"{response.status_code} {response.text[:200]}")

    def list_folder(self, parent_id: str, cursor: str | None = None) -> tuple[Sequence[DriveEntry], str | None]:
        params = {
            "q": f"{_quote(parent_id)} in parents and trashed=false",
            "fields": f"nextPageToken,files({FILE_FIELDS})",
            "pageSize": PAGE_SIZE, "orderBy": "name_natural",
        }
        if cursor:
            params["pageToken"] = cursor
        body = self._get("/files", params)
        return ([_entry(row, parent_id) for row in body.get("files", [])], body.get("nextPageToken"))

    def entry(self, remote_id: str) -> DriveEntry:
        return _entry(self._get(f"/files/{remote_id}", {"fields": FILE_FIELDS}))

    def download_target(self, remote_id: str) -> DownloadTarget:
        # `alt=media` 必须带 Authorization，浏览器拿不走这份令牌，只能由 Peach 转发。
        token, _ = self.accounts.token(self.key)
        return DownloadTarget("proxy", f"{API}/files/{remote_id}?alt=media",
                              {"Authorization": f"Bearer {token}"})

    def move(self, remote_id: str, parent_id: str, name: str | None = None) -> DriveEntry:
        current = self._get(f"/files/{remote_id}", {"fields": "parents"})
        params = {"addParents": parent_id, "fields": FILE_FIELDS}
        removed = [p for p in (current.get("parents") or []) if p != parent_id]
        if removed:
            params["removeParents"] = ",".join(removed)
        body: dict = {"name": name} if name else {}
        response = self._request_with_body("PATCH", f"/files/{remote_id}", params, body)
        return _entry(response.json(), parent_id)

    def delete(self, remote_id: str) -> None:
        """`PATCH /files/{id}` 带 `trashed: true`，把文件移进回收站而不是直接销毁。"""
        self._request_with_body("PATCH", f"/files/{remote_id}", {"fields": "id"},
                                {"trashed": True})

    def _request_with_body(self, method: str, path: str, params: dict, body: dict) -> httpx.Response:
        token, _ = self.accounts.token(self.key)
        response = self._client().request(
            method, API + path, params=params, json=body, timeout=60,
            headers={"Authorization": f"Bearer {token}"},
        )
        self._raise(response)
        return response

    def changes(self, cursor: str | None) -> tuple[Sequence[Change], str]:
        """增量变更。游标为 None 时取当前起点，返回空变更与那个起点。"""
        if cursor is None:
            return (), str(self._get("/changes/startPageToken")["startPageToken"])
        params = {
            "pageToken": cursor, "includeRemoved": "true", "pageSize": PAGE_SIZE,
            "fields": f"nextPageToken,newStartPageToken,changes(fileId,removed,file({FILE_FIELDS}))",
        }
        rows: list[Change] = []
        # `nextPageToken` 只接着翻同一批变更，`newStartPageToken` 才是下一轮轮询的游标；
        # 把前一页的 token 存下来会在下一轮重放已经处理过的变更。
        while True:
            body = self._get("/changes", params)
            for change in body.get("changes", []):
                file = change.get("file") or {}
                remote_id = str(change.get("fileId") or file.get("id") or "")
                if change.get("removed") or not file or file.get("trashed"):
                    rows.append(Change(remote_id, True, None))
                    continue
                if file.get("mimeType", "").startswith("application/vnd.google-apps."):
                    continue
                rows.append(Change(str(file["id"]), False, _entry(file)))
            next_token = body.get("nextPageToken")
            if not next_token:
                return rows, str(body.get("newStartPageToken") or cursor)
            params["pageToken"] = next_token


def build(accounts: Accounts, client: Callable[[], httpx.Client], *, client_id: str,
          client_secret: str, redirect_uri: str, key: str = GOOGLE) -> GoogleDrive:
    return GoogleDrive(accounts, client, client_id=client_id,
                       client_secret=client_secret, redirect_uri=redirect_uri, key=key)
