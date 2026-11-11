"""运行时配置：把设置层的合并结果投影成模块常量。

这里只做读取、合并与校验的投影，**不含任何一台具体机器的路径、主机名或账号名**
（ADR-0023）。默认值必须对一个全新用户成立；当前部署的那些值住在
`<Peach 数据目录>/config.toml` 里，由 `peach init` 生成。优先级见 `settings_file`：
设置文件 > 内建默认。

下面的模块常量被脚本和 web 层大量 import，名字保持稳定；变的只是它们的来源。
`tests/test_script_policy.py` 的路径闸门也认 `from peach.config import ...` 这个形状。
"""
from dataclasses import dataclass, field
from pathlib import Path

from . import settings_file
from .settings_file import PROJECT_ROOT, SettingsFileError

_SETTINGS = settings_file.active()

#: 设置文件的位置与状态。`CONFIGURED` 为 False 表示这台机器还没跑过 `peach init`：
#: 服务照常启动、`/healthz` 报 `configured=false`、页面提示去初始化，不因为缺目录崩。
#: `SETTINGS_ERROR` 非空表示文件在但读不出来（语法错、编码错、类型错），此时上面这份
#: 配置是退回的内建默认，CLI 必须拒绝提供服务而不是拿它去跑。
CONFIGURED: bool = _SETTINGS.configured
SETTINGS_ERROR: SettingsFileError | None = settings_file.error()

DATA_ROOT: Path = _SETTINGS.data_root
DATABASE_DIR: Path = _SETTINGS.directory("database")
DATABASE_PATH: Path = DATABASE_DIR / "ledger.db"
GENERATED_DIR: Path = _SETTINGS.directory("generated")
SOURCES_DIR: Path = _SETTINGS.directory("sources")
STATE_DIR: Path = _SETTINGS.directory("state")
SECRETS_DIR: Path = _SETTINGS.directory("secrets")
LOG_DIR: Path = _SETTINGS.directory("logs")
TOOLS_DIR: Path = _SETTINGS.directory("tools")
REVIEW_DIR: Path = _SETTINGS.directory("review")
FFMPEG_DIR: Path = TOOLS_DIR / "ffmpeg"
COVER_DIR: Path = GENERATED_DIR / "covers"
#: 迁移随代码走，不随数据走：它属于项目而不是某一份账本。
MIGRATIONS_DIR: Path = PROJECT_ROOT / "migrations"

SERVE_HOST: str = _SETTINGS.server.host
SERVE_PORT: int = _SETTINGS.server.port

#: 网盘授权的回调基址，例如 `https://peach.example.com`。空串表示还没填，
#: 此时授权入口拒绝发起——回调落不回这台服务。
DRIVE_PUBLIC_URL: str = _SETTINGS.drive_public_url
#: 账号名 -> (client_id, client_secret)。缺一项就说明那个账号还没接进来。
DRIVE_CLIENTS: dict[str, tuple[str, str]] = dict(_SETTINGS.drive_clients)
#: 账号名 -> 来源类型（`gdrive`／`onedrive`）。账号名就是来源名时两者相同。
DRIVE_LOCATIONS: dict[str, str] = dict(_SETTINGS.drive_locations)
#: 网盘来源 -> 扫描起点的远端目录 id。空元组表示扫该账号的根目录。
DRIVE_ROOTS: dict[str, tuple[str, ...]] = dict(_SETTINGS.drive_roots)
#: 网盘来源 -> 取字节方式（`redirect` 或 `proxy`）。没写的来源用驱动自己的默认值。
DRIVE_MODES: dict[str, str] = dict(_SETTINGS.drive_modes)


@dataclass(frozen=True)
class PeachSettings:
    db_path: Path = DATABASE_PATH
    host: str = SERVE_HOST
    port: int = SERVE_PORT
    page_path: Path = PROJECT_ROOT / "web" / "index.html"
    vendor_path: Path = PROJECT_ROOT / "web" / "vendor"
    #: 界面标注工具的本机构建产物，由 `/dev/agentation.js` 提供。落在 `build/` 而不是 `web/`：
    #: 这份第三方工具不该跟着前端产物一起发布（docs/FRONTEND.md「界面标注」）。
    agentation_path: Path = PROJECT_ROOT / "build" / "agentation" / "peach-agentation.js"
    token: str = ""
    #: 口令取自口令文件时是那份文件；被 `--token`、`PEACH_TOKEN` 覆盖或没有口令时是 None，
    #: 配置页据此决定能不能在运行中换口令。
    token_file: Path | None = None
    access_path: Path | None = None
    docs_enabled: bool = False
    #: 这台机器跑过 `peach init` 了没有。`/healthz` 与首页据此决定是否弹首次运行提示。
    configured: bool = CONFIGURED
    #: 网盘授权的回调基址；空串表示还没填，授权入口拒绝发起。
    drive_public_url: str = DRIVE_PUBLIC_URL
    drive_clients: dict[str, tuple[str, str]] = field(
        default_factory=lambda: dict(DRIVE_CLIENTS))
    drive_locations: dict[str, str] = field(
        default_factory=lambda: dict(DRIVE_LOCATIONS))
    drive_roots: dict[str, tuple[str, ...]] = field(
        default_factory=lambda: dict(DRIVE_ROOTS))
    drive_modes: dict[str, str] = field(
        default_factory=lambda: dict(DRIVE_MODES))
    snapshot_root: Path = GENERATED_DIR / "snapshots"
    poster_root: Path = GENERATED_DIR / "posters"
    # 时间轴预览的接触印相，由采集任务铺，悬停时整张取回来按格子换位置。
    timeline_root: Path = GENERATED_DIR / "timeline"
    avatar_root: Path = GENERATED_DIR / "avatars"
    logo_root: Path = GENERATED_DIR / "logos"
    # 图片资产的缓存缩略图。网盘原图一张就有几 MB，回源一次之后图片墙只读这里。
    photo_root: Path = GENERATED_DIR / "photo-thumbs"
    # 官方封套按番号存一份原图；4:3 与 16:9 两种版式共用同一文件，靠 CSS 取景。
    cover_root: Path = COVER_DIR
    # 推送发现的共享密钥住在这里。它和访问口令是两件事，轮换一份不影响另一份。
    secrets_root: Path = SECRETS_DIR
    ffmpeg_root: Path = FFMPEG_DIR
    # 复核候选 CSV 的目录。走 settings 而不是模块常量，测试才不会读到真实的 generated 目录。
    candidate_root: Path = GENERATED_DIR
    # 时间轴预览偏好等本机运行状态，不属于 ledger 真相。
    state_root: Path = STATE_DIR
    # 人物页外部入口的开关与镜像域名，同样是本机偏好。
    entry_links_root: Path = STATE_DIR


def drive_sources(config) -> tuple[str, ...]:
    """接了扫描根的账号映射回来源类型，去重保序。

    `drive_roots` 的键是账号名（`[drive.accounts]` 的键），而账本里 `asset.location` 只写
    来源类型：按来源筛资产的地方要先过这一步，否则同来源多账号时筛不到。
    """
    locations = getattr(config, "drive_locations", {}) or {}
    roots = getattr(config, "drive_roots", {}) or {}
    return tuple(dict.fromkeys(locations.get(key, key) for key in roots))
