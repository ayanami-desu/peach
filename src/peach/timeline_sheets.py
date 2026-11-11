"""时间轴预览：每隔固定秒数一帧，按 10×10 拼成接触印相，供悬停扫画面用。

悬停扫的九宫格取的是全片九个等分点：一部两小时的片子，格与格之间隔着十几分钟，
想看某一段里有什么，扫过去的九张都对不上。这里换成按时间取——每 10 秒或 30 秒一帧，
帧在图上的位置就是它在片子里的位置。

两个口径都固定，前端据此换算格子位置，不必为每部片子多取一份索引：一张图 10 列
10 行共 100 帧，帧宽 320。间隔由用户在设置里选，和图一起写进 `meta.json`。

只按需生成：第一次打开播放页时给这一部现做一套，之后命中 `meta.json`。整库预生成
取消了——两万部按每 10 秒一帧算，每帧都要从网盘拉一段远端读取，流量按 TB 计。
"""
from __future__ import annotations

import json
import shutil
import tempfile
import time
from pathlib import Path

from .frame_capture import capture_with_retry, tile_frames
from .fsutil import atomic_path

#: 两档密度，值就是秒数。名字进接口也进设置页，改这里就是改契约。
INTERVALS = {"precise": 10, "coarse": 30}
OFF = "off"
MODES = (OFF, *INTERVALS)

#: 一张图的格子数与帧宽。换算在前端也有一份，这三个数是两边的共同约定。
COLUMNS = 10
ROWS = 10
FRAMES_PER_SHEET = COLUMNS * ROWS
FRAME_WIDTH = 320

#: 头尾各让开一点：片头的黑场和片尾的字幕板扫过去什么都看不出来。
EDGE_MARGIN = 0.01


class _TileFailed(RuntimeError):
    """拼图这一步没出成图。只在本模块内部用来跳出 `atomic_path`。"""


def _fill_gaps(directory: Path, count: int) -> int:
    """把抽失败的格子用邻近那一帧补上，返回补完后连续的帧数。

    两件事都要这么做才成立。一是 `image2` 按连续序号读，中间缺一号它就在那里停下；
    二是这套图的全部意义在于「第 n 格就是第 n 个采样点」，缺一帧让后面全体前移一格，
    图还是满的，位置却整体错开——而错开多少取决于哪几帧解不出来，事后看不出来。
    补进去的是旁边那一帧，画面重复一格，位置不动。
    """
    slots = [directory / f"s{index:03d}.jpg" for index in range(count)]
    present = [index for index, path in enumerate(slots) if path.is_file()]
    if not present:
        return 0
    for index, path in enumerate(slots):
        if path.is_file():
            continue
        nearest = min(present, key=lambda good: (abs(good - index), good))
        shutil.copyfile(slots[nearest], path)
    return count


def sheet_dir(root: Path, asset_id: int) -> Path:
    """按 id 末两位分桶。一层平铺的话，本机这三千部就是几千个文件挤在一个目录里，
    Windows 上列目录会变慢，而这个目录正好是清理产物时要逐个看的那个。"""
    return Path(root) / f"{int(asset_id) % 100:02d}" / str(int(asset_id))


def meta_path(root: Path, asset_id: int) -> Path:
    return sheet_dir(root, asset_id) / "meta.json"


def sheet_path(root: Path, asset_id: int, index: int) -> Path:
    return sheet_dir(root, asset_id) / f"{int(index):03d}.jpg"


def frame_count(duration: float, interval: int) -> int:
    """这部片子按这个间隔有多少帧。至少两帧才谈得上扫。"""
    if not duration or duration <= 0 or interval <= 0:
        return 0
    return max(0, min(FRAMES_PER_SHEET * 999, int(duration // interval)))


def read_meta(root: Path, asset_id: int) -> dict | None:
    """已经生成过什么。读不出来当作没有：坏掉的 meta 重生成一次就好，
    比让整条链在一个残缺的 JSON 上崩掉划算。"""
    path = meta_path(root, asset_id)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    return data if isinstance(data, dict) and data.get("frames") else None


def is_current(root: Path, asset_id: int, interval: int) -> bool:
    """这部片子已经按这个间隔做好了，且每一张图都还在。

    只看 meta 不看图的话，用户手工清过产物目录之后，任务会把它们全部当成做好的跳过，
    页面上则是一片取不到的图。
    """
    meta = read_meta(root, asset_id)
    if not meta or int(meta.get("interval") or 0) != int(interval):
        return False
    return all(sheet_path(root, asset_id, index).is_file()
               for index in range(int(meta.get("sheets") or 0)))


def build(ffmpeg: str, source: str, duration: float, root: Path, asset_id: int,
          interval: int, *, headers: dict[str, str] | None = None,
          active=lambda: True) -> dict:
    """给一部片子生成整套时间轴图，返回写进 `meta.json` 的那份。

    `source` 是网盘给的预授权地址，`headers` 是它要求的请求头：每抽一帧都要带。

    `active` 每帧问一次：一部三小时的片子有上千帧，中途按停就该停在这里，而不是
    等这一部跑完。半路停下不写 meta——没有 meta 就是没做过，下一趟从头来，不会
    留下一份「说有 700 帧、实际只有 300 帧」的索引。
    """
    total = frame_count(duration, interval)
    if total < 2:
        return {}
    sheets = (total + FRAMES_PER_SHEET - 1) // FRAMES_PER_SHEET
    directory = sheet_dir(root, asset_id)
    # 整套重做，所以先清干净。换档位时新的一套通常比旧的少几张，只覆盖不清理的话，
    # 多出来的那几张留在盘上，`is_current` 又不看它们，于是永远没人删。
    discard(root, asset_id)
    directory.mkdir(parents=True, exist_ok=True)
    made = 0
    produced = 0
    for index in range(sheets):
        first = index * FRAMES_PER_SHEET
        count = min(FRAMES_PER_SHEET, total - first)
        temporary = Path(tempfile.mkdtemp(prefix="timeline_"))
        try:
            slots = 0
            for offset in range(count):
                if not active():
                    return {}
                # 帧号乘间隔就是它在片子里的秒数，前端按同一条式子反算。头尾各让开
                # 一点，靠 EDGE_MARGIN 把采样点往里推，不改这条对应关系的斜率。
                timestamp = (first + offset) * interval + duration * EDGE_MARGIN
                if timestamp >= duration:
                    break
                slots = offset + 1
                capture_with_retry(ffmpeg, source, timestamp,
                                   temporary / f"s{offset:03d}.jpg", headers=headers,
                                   width=FRAME_WIDTH, timeout=20)
            captured = _fill_gaps(temporary, slots)
            if captured < 2:
                # 末张可能一格都排不进（`EDGE_MARGIN` 把最后一个采样点推过了片尾）。
                # 前面已经出了图就到此为止，别把整套连同已成的几十张一起作废。
                if produced:
                    break
                return {}
            rows = (captured + COLUMNS - 1) // COLUMNS
            try:
                with atomic_path(sheet_path(root, asset_id, index)) as destination:
                    if not tile_frames(ffmpeg, str(temporary / "s%03d.jpg"),
                                       COLUMNS, rows, destination):
                        # 拼不出来就让 `atomic_path` 按异常路径收尾：正常退出它会去
                        # 替换目标，而这时那个临时文件要么不存在要么是半张。
                        raise _TileFailed
            except _TileFailed:
                return {}
            made += captured
            produced += 1
        finally:
            shutil.rmtree(temporary, ignore_errors=True)
    # `frames` 是连续的格子数，末张的行数由它反算（`ceil(余数 / columns)`）：那一张
    # 通常不满 10 行，按 `rows` 去算格子位置会在图外面取到空白。
    meta = {"interval": int(interval), "frames": made, "sheets": produced,
            "columns": COLUMNS, "rows": ROWS, "frame_width": FRAME_WIDTH,
            "made_at": time.time()}
    with atomic_path(meta_path(root, asset_id)) as destination:
        destination.write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")
    return meta


def ensure(ffmpeg: str, engine, asset, duration: float, interval: int, root: Path,
           *, active=None) -> Path | None:
    """这一部的时间轴图：已经按这个间隔做好就直接用，没有就现做一套。

    `asset` 是资产 id 或 `MediaAsset`；地址与请求头由 `engine.ffmpeg_input` 给。
    网盘侧拿不到字节（授权失效、文件被删、限流）就没有图，返回 None，不抛——
    播放本身照常走，页面退回九宫格。
    """
    from .media import MediaUnavailable
    asset_id = int(asset) if isinstance(asset, int) else int(asset.id)
    if is_current(root, asset_id, interval):
        return sheet_path(root, asset_id, 0)
    record = engine.asset(asset_id) if isinstance(asset, int) else asset
    duration = float(duration or getattr(record, 'duration', 0) or 0)
    if frame_count(duration, interval) < 2:
        return None
    try:
        url, headers = engine.ffmpeg_input(record)
    except MediaUnavailable:
        return None
    if not build(ffmpeg, url, duration, root, asset_id, interval,
                 headers=headers, active=active or (lambda: True)):
        return None
    return sheet_path(root, asset_id, 0)


def discard(root: Path, asset_id: int) -> None:
    """删掉一部片子的整套图。关掉采集时按它清退，产物不留在盘上。"""
    shutil.rmtree(sheet_dir(root, asset_id), ignore_errors=True)
