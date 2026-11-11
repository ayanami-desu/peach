"""时间轴预览：按需生成、档位存在服务端。

整库预生成取消了：第一次打开播放页时给这一部现做一套，之后命中 `meta.json`。档位存在
服务端而不是浏览器里，因为生成开关是这台机器的策略，从另一台设备打开设置时要看到的是
这台机器的选择。
"""
import asyncio
import json
import logging
import threading
import time
from pathlib import Path

from . import timeline_sheets
from .config import STATE_DIR
from .ffmpeg import FFmpegResolver
from .fsutil import atomic_path
from .media_processing_policy import metadata_only

LOGGER = logging.getLogger(__name__)

MODE_PATH = STATE_DIR / 'timeline-thumbnails.json'


def _mode_file(path: Path | None = None) -> Path:
    return Path(path) if path is not None else MODE_PATH


def read_mode(path: Path | None = None) -> str:
    """当前档位。读不出来就是关着——这条链会读片子，不能靠猜来开。"""
    try:
        data = json.loads(_mode_file(path).read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return timeline_sheets.OFF
    mode = str((data or {}).get('mode') or timeline_sheets.OFF)
    return mode if mode in timeline_sheets.MODES else timeline_sheets.OFF


def write_mode(mode: str, path: Path | None = None) -> None:
    with atomic_path(_mode_file(path)) as destination:
        destination.write_text(json.dumps({'mode': mode, 'saved_at': time.time()}),
                               encoding='utf-8')


def q_media_processing(contract, _args):
    from .media_processing_policy import acceleration
    return {'video_previews': not metadata_only(contract.follow_state_root),
            'preview_acceleration': acceleration(contract.follow_state_root)}


def w_media_processing(contract, body):
    from .media_processing_policy import save_preferences
    body = body or {}
    patch = {}
    if 'video_previews' in body:
        patch['metadata_only'] = not bool(body['video_previews'])
    if 'preview_acceleration' in body:
        patch['preview_acceleration'] = body['preview_acceleration']
    save_preferences(contract.follow_state_root, patch)
    return q_media_processing(contract, {})


def q_timeline(contract, args):
    """一部片子的时间轴索引。没生成过就回空对象，页面据此决定要不要画这一层。

    单独一条而不是随列表下发：一页六十张卡里真正被悬停的是个位数，为此每行多读一份
    `meta.json` 是把六十次文件读摊到每一次翻页上。
    """
    asset_id = int((args or {}).get('id') or 0)
    if asset_id <= 0:
        return {}
    cached = timeline_sheets.read_meta(contract.timeline_root, asset_id)
    if cached:
        cached = {**cached, 'source': 'peach'}
    return cached or {}


#: 正在后台做的资产：同一个 id 连点几下只做一套。
_IN_FLIGHT: set[tuple[str, int]] = set()
_IN_FLIGHT_LOCK = threading.Lock()


def ensure_sheet(state, asset_id: int) -> bool:
    """没有这一部的时间轴图就在后台做一套，返回是否排上了活。

    档位是 `off` 就不生成。生成要抽上百帧、每帧都是一次远端读取，所以不占请求线程：
    交给线程池，页面先拿 404 退回九宫格，下一次翻回来就有图了。
    """
    mode = read_mode()
    if mode == timeline_sheets.OFF or int(asset_id) <= 0:
        return False
    interval = timeline_sheets.INTERVALS[mode]
    root = Path(state.settings.timeline_root)
    if timeline_sheets.is_current(root, int(asset_id), interval):
        return False
    key = (str(root), int(asset_id))
    with _IN_FLIGHT_LOCK:
        if key in _IN_FLIGHT:
            return False
        _IN_FLIGHT.add(key)

    def work():
        try:
            _emit(state, int(asset_id), interval, root)
        except Exception:
            LOGGER.warning('时间轴预览生成失败：asset=%s', asset_id, exc_info=True)
        finally:
            with _IN_FLIGHT_LOCK:
                _IN_FLIGHT.discard(key)

    try:
        asyncio.get_running_loop().run_in_executor(None, work)
    except RuntimeError:  # 没有事件循环（命令行、脚本）就自己起一个线程。
        threading.Thread(target=work, daemon=True).start()
    return True


def _emit(state, asset_id: int, interval: int, root: Path) -> None:
    """按当前档位给这一部生成一套。没有 ffmpeg 或拿不到字节就什么都不做。"""
    choice = FFmpegResolver(state.settings.ffmpeg_root).ffmpeg()
    if choice is None:
        return
    asset = state.media_engine.asset(asset_id)
    timeline_sheets.ensure(str(choice.path), state.media_engine, asset,
                           float(asset.duration or 0), interval, root)


def q_thumbnail_jobs(contract, _args):
    """时间轴的档位。生成是按需触发的，已经没有整库采集这一趟活。"""
    return {'mode': read_mode(), 'modes': list(timeline_sheets.MODES),
            'intervals': dict(timeline_sheets.INTERVALS)}


def w_thumbnail_jobs(contract, body):
    """选档位。选 `off` 只是不再按需生成，已经生成的图留在盘上——几 GB 的产物删不删
    是另一件事，走数据管理页那条清理链，不在切换开关时顺手做掉。"""
    mode = str((body or {}).get('mode') or timeline_sheets.OFF)
    if mode not in timeline_sheets.MODES:
        raise ValueError('采集密度无效')
    if mode != timeline_sheets.OFF and metadata_only(contract.follow_state_root):
        raise ValueError('视频预览生成已关闭，请先在媒体库设置中开启')
    write_mode(mode)
    return q_thumbnail_jobs(contract, {})
