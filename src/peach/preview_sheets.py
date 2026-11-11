"""卡片接触印相：全片九个等分点各抽一帧，拼成一张 3×3。

`asset.snapshot_path` 指向的就是这张图：卡片封面取其中一格
（`previews.PreviewService.poster` 按 `cell % 3`、`cell // 3` 裁一块），悬停时前端按格
换位置，播放页的进度条预览也走它。它和 `timeline_sheets` 那套时间轴预览是两件事——
那套是 10×10、每 10 或 30 秒一帧，格子在图上的位置就是它在片子里的位置；这套只回答
「整部片大概长什么样」，九个点均分全片，没有秒数上的含义。

两张图都从网盘流里抽，代价却差一个数量级：这张九帧，那张一百帧，而每一帧都是一次
远端读取。所以时间轴预览只按需生成（见 `timeline_sheets` 的说明），这张在处理链跑完
采集之后给缺图的片子补——一部片子只做一次，往后靠 `snapshot_path` 认账。

产物按展示路径的 sha1 前两位分桶。分桶的理由和 `timeline_sheets` 一样：同一层目录里
几千张图平铺，目录本身就是瓶颈。用展示路径（`gdrive:/Movies/a.mp4`）而不是 id 算
digest，是因为 id 随账本重建而变，而展示路径换了本来就该换一张图——搬过的片子重抽，
比拿一张对不上号的旧图当封面强。
"""
from __future__ import annotations

import hashlib
import json
import shutil
import tempfile
from pathlib import Path

from PIL import Image

from . import artifact_rules, timeline_sheets
from .drive_provider import DriveError
from .frame_capture import capture_with_retry, tile_frames
from .fsutil import atomic_path
from .media import MediaUnavailable

#: 一张图的格子数。`previews.PreviewService.poster` 的裁切按 3×3 写死，改这里要一起改。
COLUMNS = ROWS = 3
CELLS = COLUMNS * ROWS

#: 帧宽取时间轴预览同一档：这一格到了卡片上只有一百来像素，再大只是多传字节。
CELL_WIDTH = timeline_sheets.FRAME_WIDTH

#: 单帧预算。网盘限流时一次远端 seek 要十几秒；45 秒是 `capture_with_retry` 的默认值，
#: 它遇到坏色彩元数据的文件还会再抽一次，所以一格最坏用掉 90 秒。九格全这样是十三分钟，
#: 已经超过「这部片先没有图」值得等的时间，所以不另设整张的总预算而是逐格封顶。
TIMEOUT_SECONDS = 45

#: 拼图只是本地 CPU 的活，比抽帧快得多；给足余量即可。
TILE_TIMEOUT_SECONDS = 60

#: 头尾各让开 3%：片头是黑场与厂标，片尾是字幕板，抽出来都是黑的。
_EDGE = 0.03
_SPAN = 0.94


def contact_path(root: Path, location: str, path: str) -> Path:
    """这张图的落盘位置：`root/location/前两位/digest.jpg`。"""
    digest = hashlib.sha1(str(path).encode('utf-8')).hexdigest()[:16]
    return root / location / digest[:2] / (digest + '.jpg')


def build(ffmpeg: str, source: str, duration: float, destination: Path, *,
          headers=None, active=lambda: True) -> bool:
    """抽九帧拼成一张图写到 `destination`；出不来就返回 False，不留半张。

    `source` 是网盘给 FFmpeg 的输入地址，`headers` 是它要的请求头——九帧是九个独立的
    请求，头漏在任何一帧上都是 401。抽不到的那一格用邻近那一帧补上
    （`timeline_sheets._fill_gaps`），位置不动、画面重复；补完连两帧都没有就整张作废：
    九格都是同一帧的图不是九宫格，还会让卡片封面永远是同一个画面。

    `active` 每抽一格问一次：用户按下停止之后还在往网盘要多帧是最难解释的一种表现。
    中途停掉同样不留半成品——`destination` 只在整个流程末尾由 `atomic_path` 换上。
    """
    if duration <= 0:
        return False
    workspace = Path(tempfile.mkdtemp(prefix='peach-contact-'))
    try:
        for index in range(CELLS):
            if not active():
                return False
            timestamp = duration * (_EDGE + _SPAN * (index + 0.5) / CELLS)
            capture_with_retry(ffmpeg, source, timestamp, workspace / f's{index:03d}.jpg',
                               headers=headers, width=CELL_WIDTH, timeout=TIMEOUT_SECONDS)
        landed = sum(1 for index in range(CELLS) if (workspace / f's{index:03d}.jpg').is_file())
        if landed < 2:
            return False
        timeline_sheets._fill_gaps(workspace, CELLS)
        try:
            with atomic_path(destination) as output:
                if not tile_frames(ffmpeg, str(workspace / 's%03d.jpg'), COLUMNS, ROWS, output,
                                   timeout=TILE_TIMEOUT_SECONDS):
                    raise _TileFailed
        except _TileFailed:
            return False
        if not _decodable(destination):
            return False
    finally:
        shutil.rmtree(workspace, ignore_errors=True)
    # 记下这张图是怎么来的：`current()` 认这条记录，`generate()` 才敢直接复用它。
    artifact_rules.remember(destination)
    return True


class _TileFailed(RuntimeError):
    """拼图这一步没出成图。只在本模块内部用来跳出 `atomic_path`。"""


def generate(engine, ffmpeg: str, asset, root: Path, *, active=None) -> Path | None:
    """给一部片子补一张接触印相，返回产物路径；拿不到画面就返回 None。

    `asset` 可以是 id，也可以是账本行（`MediaAsset`）。产物已经在、`artifact_rules` 认
    可、又解得开，就直接用它——重抽一遍是九次远端读取，而结果和原来一样。

    网盘侧的任何失败（授权过期、文件被删、限流）都只让这一部暂时没有图：卡片退回纯
    文字，播放与浏览照常。为一部片把整轮任务弄红，代价远大于一张封面。
    """
    record = engine.asset(int(asset)) if isinstance(asset, int) else asset
    destination = contact_path(root, record.location or '', record.path)
    if artifact_rules.current(destination) and _decodable(destination):
        # 图在盘上、账本这一行还空着：`pending()` 认的就是 `snapshot_path`，不写回去这一部
        # 每轮都会被重新排进来，卡片也永远没有封面。
        _record(engine, record, destination)
        return destination
    duration = float(record.duration or 0)
    if duration <= 0:
        # 没有片长就摊不开九个采样点。等扫描后的探测把时长补上，下一轮再抽。
        return None
    stop = active if active is not None else (lambda: True)
    try:
        url, headers = engine.ffmpeg_input(record)
    except (MediaUnavailable, DriveError):
        return None
    if not build(ffmpeg, url, duration, destination, headers=headers, active=stop):
        return None
    _record(engine, record, destination)
    return destination


def _record(engine, record, destination: Path) -> None:
    """把产物写进 `snapshot_path`。

    `path`/`location` 一路进条件：两次读之间这一行被改名或搬走时行数是 0，那一行已经
    不是这张图对应的那部片了。行数为 0 也不报错——图在盘上，下一次扫描之后会重新对上。
    """
    with engine.repository.database.write_transaction() as connection:
        connection.execute(
            "UPDATE asset SET snapshot_path=? WHERE id=? AND path=? AND location=? "
            "AND medium='video' AND disposal IS NULL",
            (str(destination), int(record.id), record.path, record.location))


def pending(connection, limit: int, *, asset_ids=None) -> list[int]:
    """还没有接触印相、又能抽帧的视频，按 id 升序。

    `remote_id IS NOT NULL` 是「能取到字节」的判据：挂载时代的旧行没有远端 id，
    现在既播不了也读不了，别把它们排进队列。`duration > 0` 同理——没有片长就摊不开
    采样点，等探测补上再说。

    `asset_ids` 把范围限到这一轮处理的那几部；不给就是全库，用于整库补齐。
    """
    query = ("SELECT id FROM asset WHERE medium='video' AND disposal IS NULL "
             "AND remote_id IS NOT NULL AND (snapshot_path IS NULL OR snapshot_path='') "
             "AND duration > 0")
    parameters: list[object] = []
    if asset_ids is not None:
        chosen = sorted({int(value) for value in asset_ids})
        if not chosen:
            return []
        query += ' AND id IN (SELECT value FROM json_each(?))'
        parameters.append(json.dumps(chosen))
    query += ' ORDER BY id LIMIT ?'
    parameters.append(int(limit))
    return [int(row[0]) for row in connection.execute(query, parameters)]


def _decodable(path: Path) -> bool:
    """PIL 能不能把这张图完整解开。

    `tile_frames` 已经验过一次，这里再验是给「文件在盘上但只写了一半」留的兜底：
    `snapshot_path` 一旦落库，这一部就再也不会重新生成，一张坏图会一直跟着它。
    """
    try:
        with Image.open(path) as image:
            image.load()
    except (OSError, ValueError, Image.DecompressionBombError):
        return False
    return True
