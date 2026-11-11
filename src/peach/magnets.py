"""磁力链接与 infohash 的解析。

JavDB 的磁链区与评论正文都会给出磁力或裸 infohash，资源列表用同一把键去重，所以
infohash 必须先归一：BEP 9 允许 32 位 base32 写法，和 40 位十六进制是同一个种子。
"""

from __future__ import annotations

import base64
import binascii
import re
from dataclasses import dataclass
from urllib.parse import parse_qs, unquote, urlsplit


@dataclass(frozen=True)
class Magnet:
    info_hash: str
    uri: str
    name: str = ""


_HEX40 = re.compile(r"^[0-9a-f]{40}$")
_BASE32 = re.compile(r"^[a-z2-7]{32}$")


def normalise_info_hash(raw: str) -> str:
    """小写 40 位十六进制。32 位 base32 先换成十六进制，两种写法才是同一个键。"""
    text = str(raw or "").strip().lower()
    if _HEX40.match(text):
        return text
    if _BASE32.match(text):
        try:
            return base64.b32decode(text.upper()).hex()
        except binascii.Error:
            pass
    raise ValueError("磁力链接里的 infohash 不是 40 位十六进制或 32 位 base32")


_TRACKER = re.compile(r"^(?:udp|https?|wss?)://[A-Za-z0-9.\-]+(?::\d{1,5})?(?:/[!-~]*)?$")


def clean_magnet(text: str) -> str:
    """去掉解析不了的 tracker 参数，其余原样保留。

    有的来源给出的磁力里夹着一段打乱的 tracker（`exoduecnuonnaF2%9696A3%moc.cnysed.s`，
    倒过来是 `exodus.desync.com`），这类参数会让取流端把整条链接判为坏链接，只去掉这一段
    就恢复正常。
    """
    split = urlsplit(text)
    kept = []
    for part in split.query.split("&"):
        key, _, value = part.partition("=")
        if key == "tr":
            try:
                decoded = unquote(value, errors="strict")
            except UnicodeDecodeError:
                continue
            if not _TRACKER.match(decoded):
                continue
        if part:
            kept.append(part)
    return f"{split.scheme}:?{'&'.join(kept)}"


def parse_magnet(raw: str) -> Magnet:
    """解析磁力，或一个裸 infohash。只认 `urn:btih`，v2 的 `btmh` 不在幂等键口径内。"""
    text = str(raw or "").strip()
    if not text:
        raise ValueError("请粘贴磁力链接")
    if not text.casefold().startswith("magnet:"):
        info_hash = normalise_info_hash(text)
        return Magnet(info_hash, f"magnet:?xt=urn:btih:{info_hash}")
    query = parse_qs(urlsplit(text).query)
    for value in query.get("xt", []):
        if value.casefold().startswith("urn:btih:"):
            info_hash = normalise_info_hash(value[len("urn:btih:"):])
            name = (query.get("dn") or [""])[0].strip()
            return Magnet(info_hash, clean_magnet(text), name[:300])
    raise ValueError("磁力链接里没有 urn:btih，Peach 只接受 BitTorrent 磁力")


def magnet_info_hash(uri: str) -> str:
    """远端只回了原始链接时，从里面取 infohash；取不到返回空串。"""
    try:
        return parse_magnet(uri).info_hash
    except ValueError:
        return ""
