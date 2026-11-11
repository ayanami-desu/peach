"""视频的时长、分辨率与编码：ffprobe 读一次远端文件头，写回 `asset`。

网盘在列目录时一般自带时长与宽高（Google 的 `videoMediaMetadata`、OneDrive 的 `video`），
扫描就顺手写进账本，不必再回源。只有元数据缺了的那几行才需要 ffprobe：它按 HTTP Range
读文件头，不落本地文件，走的是同一个 `DriveStreamer`。

拿不到时长写 -1，不写 0，也不留 NULL。0 会同时躲过 `duration IS NULL` 的待办和抽帧的
`duration>2` 门槛，永久卡住；留 NULL 的话，每轮都会把同一个坏文件再探一遍。
"""
from __future__ import annotations

import json
import os
import sqlite3
import subprocess
from contextlib import closing
from fractions import Fraction
from typing import Sequence

from .media import MediaEngine, MediaUnavailable

#: 一次探测最多等多久。ffprobe 只读文件头，远端实测一两秒。
TIMEOUT_SECONDS = 20.0

#: 探测写的列。
PROBED_COLUMNS = ("duration", "width", "height", "vcodec", "fps", "has_audio",
                  "ctx_length", "ctx_orient", "ctx_quality")
UPDATE = f"UPDATE asset SET {','.join(f'{column}=?' for column in PROBED_COLUMNS)} WHERE id=?"

#: 缺时长的视频。
_MISSING = "medium='video' AND duration IS NULL AND remote_id IS NOT NULL"


def context_fields(width: int, height: int, duration: float) -> tuple[str | None, str | None, str | None]:
    orientation = quality = length = None
    if width and height:
        orientation = "竖屏" if height > width else "横屏"
        longest = max(width, height)
        quality = (
            "4K" if longest >= 3000 else "2K" if longest >= 1900
            else "1080P" if longest >= 1300 else "720P" if longest >= 900
            else "低画质"
        )
    if duration and duration > 0:
        length = "速食" if duration < 300 else "短" if duration < 900 else "中" if duration < 2400 else "长"
    return length, orientation, quality


def display_dimensions(stream: dict) -> tuple[int, int]:
    """将编码尺寸换算成方形像素下的显示尺寸。未知比例沿用编码尺寸。"""
    width, height = int(stream.get('width') or 0), int(stream.get('height') or 0)
    if width <= 0 or height <= 0:
        return width, height
    for field, base in (('sample_aspect_ratio', width), ('display_aspect_ratio', height)):
        try:
            ratio = Fraction(str(stream.get(field) or '').replace(':', '/'))
            if ratio > 0:
                return max(1, round(base * ratio)), height
        except (ValueError, ZeroDivisionError):
            pass
    return width, height


def _headers_argument(headers: dict[str, str]) -> list[str]:
    """FFmpeg 的 `-headers` 要一整块文本，多行以 CRLF 连接、末尾也要换行。"""
    if not headers:
        return []
    block = "".join(f"{key}: {value}\r\n" for key, value in headers.items())
    return ["-headers", block]


def probe(ffprobe: str, url: str, headers: dict[str, str] | None = None,
          timeout: float = TIMEOUT_SECONDS) -> tuple:
    """读一次远端文件头，返回 (时长, 宽, 高, 编码, 帧率, 是否有音轨)。"""
    result = subprocess.run(
        [
            ffprobe, "-v", "error", "-rw_timeout", "8000000",
            *_headers_argument(headers or {}),
            "-select_streams", "v:0", "-show_entries",
            "format=duration:stream=width,height,sample_aspect_ratio,display_aspect_ratio,codec_name,avg_frame_rate",
            "-of", "json", url,
        ],
        capture_output=True,
        timeout=timeout,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
    )
    if result.returncode:
        raise subprocess.CalledProcessError(result.returncode, 'ffprobe', stderr=result.stderr)
    payload = json.loads(result.stdout or b"{}")
    duration = float((payload.get("format") or {}).get("duration") or 0)
    if duration <= 0:
        duration = -1.0
    stream = (payload.get("streams") or [{}])[0]
    fps = 0.0
    try:
        numerator, denominator = (stream.get("avg_frame_rate") or "0/1").split("/")
        fps = float(numerator) / float(denominator) if float(denominator) else 0.0
    except (TypeError, ValueError, ZeroDivisionError):
        pass
    return (
        duration,
        *display_dimensions(stream),
        stream.get("codec_name"),
        fps,
        None,
    )


def measure(ffprobe: str, asset_id: int, url: str, headers: dict[str, str] | None = None,
            timeout: float = TIMEOUT_SECONDS) -> tuple:
    """这一行的 `UPDATE` 参数。探不出来的一律是 -1 那一行，不抛。"""
    try:
        duration, width, height, codec, fps, audio = probe(ffprobe, url, headers, timeout)
    except InterruptedError:
        raise
    except Exception as error:  # 超时、地址过期、输出不是 JSON：对这一行都是「没拿到」
        from .error_reporting import subprocess_failure
        subprocess_failure('media-probe', tool=ffprobe, error=error, asset_id=asset_id,
                           returncode=getattr(error, 'returncode', None), timeout_seconds=timeout)
        return (-1, 0, 0, None, 0, 0, None, None, None, asset_id)
    if duration <= 0:
        from .error_reporting import event
        event('media-probe', asset_id=asset_id, reason='duration_unavailable')
    return (duration, width, height, codec, fps, audio,
            *context_fields(width, height, duration), asset_id)


def probe_missing(db_path, engine: MediaEngine, ffprobe: str | None, *,
                  asset_ids: Sequence[int] | None = None, limit: int = 20,
                  timeout: float = TIMEOUT_SECONDS) -> int:
    """把还缺时长的行探一遍，返回探成了几个。

    `asset_ids` 给了就只探这些（播放页顺手补一条），不给就按 id 顺序补一批。远端地址过期、
    文件读不到都算「没拿到」，写 -1 之后不再重复探。
    """
    if not ffprobe:
        return 0
    with closing(sqlite3.connect(db_path, timeout=30)) as connection:
        sql = f"SELECT id FROM asset WHERE {_MISSING}"
        parameters: tuple = ()
        if asset_ids is not None:
            if not asset_ids:
                return 0
            sql += " AND id IN (SELECT value FROM json_each(?))"
            parameters = (json.dumps(list(asset_ids)),)
        sql += " ORDER BY id LIMIT ?"
        parameters += (limit,)
        rows = [int(row[0]) for row in connection.execute(sql, parameters)]
    done = 0
    for asset_id in rows:
        try:
            url, headers = engine.ffmpeg_input(asset_id)
        except MediaUnavailable:
            continue
        measured = measure(ffprobe, asset_id, url, headers, timeout)
        with closing(sqlite3.connect(db_path, timeout=120)) as connection:
            connection.execute(UPDATE, measured)
            connection.commit()
        done += 1
    return done
