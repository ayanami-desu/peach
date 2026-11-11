"""设置文件层：Peach 数据目录的发现，以及 `<Peach 数据目录>/config.toml` 的读取、合并与写回。

优先级固定为 **设置文件 > 内建默认**，`config.py` 只消费合并结果。唯一的环境变量是
`PEACH_DATA_ROOT`，它在数据目录发现阶段就用掉了。内建默认必须对一个全新用户成立，所以
这里（和 `config.py`）不许出现任何一台具体机器的路径、主机名或账号名（ADR-0023）。

Peach 数据目录的发现刻意**不**依赖设置文件内容——设置文件本身就住在 Peach 数据目录里面：

1. `PEACH_DATA_ROOT` 环境变量；
2. 从起点逐级向上，第一个存在的 `<上级目录>/peach-data`。起点在源码树里是项目根。
   ADR-0017 的顶层布局把 `peach-app` 与 `peach-data` 并列，向上找因此覆盖主检出和
   `peach-worktrees/<task>` 里的隔离工作树；
3. 都没有 → 未配置。此时仍然给出建议的数据目录（`peach init` 会去建它），但 `configured`
   为 False：服务照常启动，`/healthz` 报 `configured=false`，页面提示去跑 `peach init`。

读用标准库 `tomllib`（Python 3.11+ 只读），写用本模块自带的最小序列化器。设置文件里
出现的值只有字符串、布尔、整数和字符串表这四种，为这点需求引入 `tomli-w`／`tomlkit`
不值得——依赖策略要求每个外部模块都精确固定版本并有归属（`docs/REUSE.md`）。
"""
from __future__ import annotations

import os
import sys
import tomllib
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from . import distribution

#: 设置文件名。位置固定为 Peach 数据目录下，不做多候选路径搜索。
SETTINGS_FILENAME = "config.toml"
DATA_ROOT_ENV = "PEACH_DATA_ROOT"
DATA_ROOT_LOCATION = "data-root.txt"
#: ADR-0017 的顶层布局里这个目录名是固定的，不随机器变化。
DATA_ROOT_DIRNAME = "peach-data"

#: Peach 数据目录下的子目录键。设置文件里省略某项就取同名目录；写绝对路径可以搬出 Peach 数据目录。
DIRECTORY_KEYS = (
    "database", "generated", "sources", "state", "secrets", "logs", "tools", "review",
)

#: `[drive]` 段里除三张子表之外的键。`public_url` 是 OAuth 回调的基址。
_DRIVE_KEYS = frozenset({"public_url", "accounts", "roots", "modes"})


class SettingsFileError(RuntimeError):
    """设置文件存在但读不出来。

    消息必须带文件路径；`tomllib` 的语法错误自带行列号，一并转述。Peach 数据目录的发现不看
    文件内容，所以出错后仍然知道账本在哪：调用方退回内建默认并显式拒绝提供服务，
    而不是拿一份半生不熟的配置去跑。
    """


def _project_root(module_file: str = __file__, bundle_root: str | None = None) -> Path:
    """资源来自源码树、wheel 内的资源目录或 PyInstaller 的 `_MEIPASS`。"""
    packaged = Path(module_file).resolve().parent / "_resources"
    if bundle_root is None and packaged.is_dir():
        return packaged
    return (Path(bundle_root) if bundle_root is not None
            else Path(module_file).resolve().parents[2])


PROJECT_ROOT = _project_root(bundle_root=getattr(sys, "_MEIPASS", None))


def _search_anchor(
    project_root: Path = PROJECT_ROOT, *,
    frozen: bool = bool(getattr(sys, "frozen", False)), executable: str = sys.executable,
) -> Path:
    """向上找 Peach 数据目录的起点：源码树用项目根，打包产物用 EXE 所在目录。

    资源根和发现起点是两回事。PyInstaller 的资源在 `_MEIPASS`，单文件包把它解到
    `%TEMP%/_MEIxxxx`，从那里向上只会走到用户目录，一台配置好的机器会被判成首次运行
    并起 `serve --setup`。`sys.executable` 在两种形态里都是 EXE 本身。
    """
    if frozen:
        return Path(executable).resolve().parent
    return project_root


SEARCH_ANCHOR = _search_anchor()

#: 向上找几层。四层刚好覆盖最深的那种形态（`peach-app/dist/Peach` 里的 EXE 走三层
#: 回到 `peach/`，再留一层给更深的检出）。不做无界搜索：一路走到磁盘根会撞上碰巧同名的
#: 目录，而那种「找错 Peach 数据目录」的故障看起来完全像是数据丢了。
_SEARCH_DEPTH = 4


def _bootstrap_data_root(
    project_root: Path = SEARCH_ANCHOR, environ: dict[str, str] | None = None,
) -> tuple[Path, bool]:
    """返回 (Peach 数据目录, 是否真的找到了)。找不到时第一项是 `peach init` 的默认数据目录。

    `project_root` 是向上找的起点，默认取 `SEARCH_ANCHOR`。
    """
    environ = os.environ if environ is None else environ
    explicit = (environ.get(DATA_ROOT_ENV) or "").strip()
    if explicit:
        return Path(explicit), True
    if distribution.standalone():
        candidate = distribution.user_data_root(environ)
        return candidate, (candidate / SETTINGS_FILENAME).is_file()
    for parent in project_root.parents[:_SEARCH_DEPTH]:
        candidate = parent / DATA_ROOT_DIRNAME
        if candidate.is_dir():
            return candidate, True
    return project_root.parent / DATA_ROOT_DIRNAME, False


def _selected_data_root(root: Path) -> Path:
    """读取本机首次设置保存的位置；最多跟随八次，并拒绝循环与相对路径。"""
    visited = {root}
    for _ in range(9):
        locator = root / "state" / DATA_ROOT_LOCATION
        try:
            text = locator.read_text(encoding="utf-8").strip()
        except FileNotFoundError:
            return root
        except (OSError, UnicodeError) as exc:
            raise SettingsFileError(f"无法读取数据目录位置：{locator}：{exc}") from exc
        selected = Path(text)
        if not text or not selected.is_absolute() or selected in visited:
            raise SettingsFileError(f"数据目录位置无效或循环：{locator}")
        visited.add(selected)
        root = selected
    raise SettingsFileError("数据目录位置的跳转次数超过八次")


def discover_data_root(
    project_root: Path = SEARCH_ANCHOR, environ: dict[str, str] | None = None,
) -> tuple[Path, bool]:
    """从默认数据目录读取已保存的数据目录位置，返回实际 Peach 数据目录及发现状态。"""
    root, found = _bootstrap_data_root(project_root, environ)
    selected = _selected_data_root(root)
    return selected, found or (selected / SETTINGS_FILENAME).is_file()


def remember_data_root(bootstrap: PeachConfig, selected: PeachConfig) -> None:
    """将首次设置选定的位置原子记录在默认数据目录，不复制账本或其他数据。"""
    if bootstrap.data_root.resolve() == selected.data_root.resolve():
        return
    from .fsutil import atomic_write_text
    atomic_write_text(bootstrap.data_root / "state" / DATA_ROOT_LOCATION,
                      str(selected.data_root.resolve()))


@dataclass(frozen=True)
class ServerSettings:
    host: str = "127.0.0.1"
    port: int = 8900


@dataclass(frozen=True)
class PeachConfig:
    """一次合并的结果。`config.py` 把它投影成模块常量。"""

    data_root: Path
    #: 设置文件**应该**在哪。文件不存在时这个值照样有效，`present` 才是存在判据。
    path: Path
    present: bool = False
    #: Peach 数据目录是被找到的，还是只是一个建议使用的数据目录。
    data_root_found: bool = False
    directories: dict[str, str] = field(default_factory=dict)
    library_names: dict[str, str] = field(default_factory=dict)
    library_icons: dict[str, str] = field(default_factory=dict)
    library_catalog: dict[str, dict[str, str]] = field(default_factory=dict)
    server: ServerSettings = ServerSettings()
    #: 网盘授权的回调基址，形如 `https://peach.example.com`；空串表示还没填，
    #: 此时授权入口拒绝发起（回调落不回这台服务）。
    drive_public_url: str = ""
    #: 网盘来源 -> (client_id, client_secret)。缺一项就说明那个网盘还没接进来。
    drive_clients: dict[str, tuple[str, str]] = field(default_factory=dict)
    #: 网盘来源 -> 扫描起点的远端目录 id；网站点自己的选法，与账号根目录无关。
    drive_roots: dict[str, tuple[str, ...]] = field(default_factory=dict)
    #: 网盘来源 -> 取字节方式（`redirect` 或 `proxy`）。没写的来源用驱动自己的默认值。
    drive_modes: dict[str, str] = field(default_factory=dict)

    @property
    def configured(self) -> bool:
        """有设置文件，或者已经找到 Peach 数据目录，就算配置过。

        单独看设置文件会把所有现有部署判成「未配置」——它们的 Peach 数据目录真实存在、账本也在
        跑，只是还没生成过 config.toml。反过来，全新克隆两个条件都不成立，页面才应该
        弹首次运行提示。
        """
        return self.present or self.data_root_found

    def directory(self, key: str) -> Path:
        """Peach 数据目录下的子目录。相对路径按 Peach 数据目录解析，绝对路径原样使用。"""
        raw = (self.directories.get(key) or "").strip() or key
        candidate = Path(raw)
        return candidate if candidate.is_absolute() else self.data_root / candidate


# --------------------------------------------------------------------------- 读取

def _fail(path: Path, detail: str) -> SettingsFileError:
    return SettingsFileError(f"设置文件读不出来：{path}：{detail}")


def _read_document(path: Path) -> dict:
    try:
        raw = path.read_bytes()
    except OSError as exc:
        raise _fail(path, str(exc)) from exc
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise _fail(path, f"不是 UTF-8 编码（{exc}）") from exc
    try:
        return tomllib.loads(text)
    except tomllib.TOMLDecodeError as exc:
        # tomllib 的消息自带 `at line N, column M`，直接转述比自己数行可靠。
        raise _fail(path, f"TOML 语法错误：{exc}") from exc


def _table(document: dict, key: str, path: Path) -> dict:
    value = document.get(key, {})
    if not isinstance(value, dict):
        raise _fail(path, f"`{key}` 必须是一个表（[{key}]）")
    return value


def _string(table: dict, key: str, default: str, path: Path, prefix: str) -> str:
    value = table.get(key, default)
    if not isinstance(value, str):
        raise _fail(path, f"`{prefix}{key}` 必须是字符串")
    return value


def _integer(table: dict, key: str, default: int, path: Path, prefix: str) -> int:
    value = table.get(key, default)
    # bool 是 int 的子类，端口写成 true 必须报错而不是静默变成 1。
    if isinstance(value, bool) or not isinstance(value, int):
        raise _fail(path, f"`{prefix}{key}` 必须是整数")
    return value


def _string_map(table: dict, path: Path, prefix: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for key, value in table.items():
        if not isinstance(value, str):
            raise _fail(path, f"`{prefix}{key}` 必须是字符串")
        result[key] = value
    return result


def _root_map(table: dict, path: Path, prefix: str) -> dict[str, tuple[str, ...]]:
    """`[drive.roots.<来源>]` 的值：一个远端目录 id，或一个 id 数组。

    单个目录写成字符串最好读；多块共享盘加进来时改成数组即可。
    数组里不能有空串、不能重复——那两种写法都说不清用户想要什么。
    """
    result: dict[str, tuple[str, ...]] = {}
    for key, value in table.items():
        if isinstance(value, str):
            result[key] = (value,) if value else ()
            continue
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            raise _fail(path, f"`{prefix}{key}` 必须是字符串，或者字符串数组")
        if any(not item for item in value):
            raise _fail(path, f"`{prefix}{key}` 的数组里不能有空串")
        if len(set(value)) != len(value):
            raise _fail(path, f"`{prefix}{key}` 的数组里有重复的目录 id")
        result[key] = tuple(value)
    return result


def _mode_map(table: dict, path: Path, clients: dict[str, tuple[str, str]]) -> dict[str, str]:
    """`[drive.modes]`：每个来源用哪种取字节方式。

    只接受内置来源，且必须已经在 `[drive.accounts]` 里配过——一个没接进来的网盘谈
    「怎么取字节」没有意义。带鉴权才能取的来源（Google）只能写 `proxy`。
    """
    from .drive_provider import LOCATIONS, PLAYBACK_MODES, modes_for

    result: dict[str, str] = {}
    for key, value in table.items():
        if key not in LOCATIONS:
            raise _fail(path, f"`[drive.modes]` 里不认识的网盘：{key}")
        if key not in clients:
            raise _fail(path, f"`[drive.modes.{key}]` 对应的网盘没在 `[drive.accounts]` 里配置")
        if not isinstance(value, str):
            raise _fail(path, f"`[drive.modes.{key}]` 必须是字符串")
        mode = value.strip()
        if mode not in PLAYBACK_MODES:
            raise _fail(path, f"`[drive.modes.{key}]` 只能是 " + "、".join(PLAYBACK_MODES))
        if mode not in modes_for(key):
            raise _fail(path, f"`[drive.modes.{key}]` 只能用 " + "、".join(modes_for(key)))
        result[key] = mode
    return result


def _drive_clients(table: dict, path: Path) -> dict[str, tuple[str, str]]:
    """`[drive.accounts.<来源>]`：每个网盘一套 OAuth 客户端凭据。"""
    from .drive_provider import LOCATIONS
    result: dict[str, tuple[str, str]] = {}
    for key, value in table.items():
        if key not in LOCATIONS:
            raise _fail(path, f"`[drive.accounts]` 里不认识的网盘：{key}；"
                              f"只接受 {'、'.join(LOCATIONS)}")
        if not isinstance(value, dict):
            raise _fail(path, f"`[drive.accounts.{key}]` 必须是一张表")
        stray = sorted(set(value) - {"client_id", "client_secret"})
        if stray:
            raise _fail(path, f"`[drive.accounts.{key}]` 里有不认识的键：" + "、".join(stray))
        client_id = _string(value, "client_id", "", path, f"drive.accounts.{key}.")
        client_secret = _string(value, "client_secret", "", path, f"drive.accounts.{key}.")
        if not client_id or not client_secret:
            raise _fail(path, f"`[drive.accounts.{key}]` 的 client_id 与 client_secret 都要填")
        result[key] = (client_id, client_secret)
    return result


def _merge(
    data_root: Path, path: Path, present: bool, found: bool, document: dict,
) -> PeachConfig:
    directories = _string_map(
        _table(document, "directories", path), path, "directories.")
    unknown = sorted(set(directories) - set(DIRECTORY_KEYS))
    if unknown:
        raise _fail(path, "`directories` 里有不认识的键：" + "、".join(unknown))

    server_table = _table(document, "server", path)
    fallback = ServerSettings()
    server = ServerSettings(
        host=_string(server_table, "host", fallback.host, path, "server."),
        port=_integer(server_table, "port", fallback.port, path, "server."),
    )

    drive = _table(document, "drive", path)
    stray = sorted(set(drive) - _DRIVE_KEYS)
    if stray:
        raise _fail(path, "`[drive]` 里有不认识的键：" + "、".join(stray))
    public_url = _string(drive, "public_url", "", path, "drive.").strip()
    if public_url and not (public_url.startswith("https://") and len(public_url) > len("https://")):
        raise _fail(path, "`drive.public_url` 必须是 https 地址，例如 https://peach.example.com")
    drive_clients = _drive_clients(_table(drive, "accounts", path), path)
    drive_roots = _root_map(_table(drive, "roots", path), path, "drive.roots.")
    unknown_roots = sorted(set(drive_roots) - set(drive_clients))
    if unknown_roots:
        raise _fail(path, "`[drive.roots]` 里有没在 `[drive.accounts]` 配置过的网盘："
                          + "、".join(unknown_roots))
    drive_modes = _mode_map(_table(drive, "modes", path), path, drive_clients)

    media = _table(document, "media", path)
    stray = sorted(set(media) - {"libraries", "library_icons", "library_catalog"})
    if stray:
        raise _fail(path, "`[media]` 下只接受 libraries、library_icons、library_catalog："
                          + "、".join(stray))
    catalog_table = _table(media, "library_catalog", path)
    for key, value in catalog_table.items():
        if not isinstance(value, dict):
            raise _fail(path, f"`[media.library_catalog.{key}]` 必须是一张表")
    library_catalog = {key: _string_map(value, path, "media.library_catalog.")
                       for key, value in catalog_table.items()}
    return PeachConfig(
        data_root=data_root, path=path, present=present, data_root_found=found,
        directories=directories,
        library_names=_string_map(_table(media, "libraries", path), path, "media.libraries."),
        library_icons=_string_map(_table(media, "library_icons", path), path, "media.library_icons."),
        library_catalog=library_catalog,
        server=server,
        drive_public_url=public_url, drive_clients=drive_clients, drive_roots=drive_roots,
        drive_modes=drive_modes,
    )


def load_config(
    project_root: Path = SEARCH_ANCHOR, environ: dict[str, str] | None = None,
    *, strict: bool = True,
) -> PeachConfig:
    """读一次设置文件并合并。

    `strict=False` 时坏文件退回内建默认（Peach 数据目录仍然照发现顺序算），给 `peach init
    --force` 留一条自救路径；否则抛 `SettingsFileError`。

    「坏」包括语法读不出来和合并时被拒（未知目录键、`[drive]` 里不认识的网盘之类）。
    两者都要走同一条退路：`_merge` 的拒绝漏在 try 外面的话，自救入口自己也会崩。
    """
    environ = os.environ if environ is None else environ
    data_root, found = discover_data_root(project_root, environ)
    path = data_root / SETTINGS_FILENAME
    document: dict = {}
    present = False
    if path.is_file():
        try:
            document = _read_document(path)
            present = True
        except SettingsFileError:
            if strict:
                raise
    try:
        return _merge(data_root, path, present, found, document)
    except SettingsFileError:
        if strict:
            raise
        # 文件内容整份作废，只保留 Peach 数据目录的发现结果。
        return _merge(data_root, path, False, found, {})


@lru_cache(maxsize=1)
def _load_once() -> tuple[PeachConfig, SettingsFileError | None]:
    try:
        return load_config(), None
    except SettingsFileError as exc:
        return load_config(strict=False), exc


def active() -> PeachConfig:
    """当前生效的设置。文件坏了也返回一份可用的（内建默认），错误留在 `error()`。"""
    return _load_once()[0]


def error() -> SettingsFileError | None:
    """设置文件坏了时的原始错误。CLI 据此拒绝提供服务，而不是拿默认值糊过去。"""
    return _load_once()[1]


def reset_cache() -> None:
    """测试换过环境变量或文件之后调用。生产路径只在进程启动时读一次。"""
    _load_once.cache_clear()


# --------------------------------------------------------------------------- 写回

def _render_value(value: object) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    text = str(value)
    # Windows 路径里全是反斜杠。TOML 的字面量字符串不做转义，比 "R:\\media" 好读得多；
    # 只有值里本来就带单引号或换行时才退回基本字符串。
    if "'" not in text and "\n" not in text and "\r" not in text:
        return f"'{text}'"
    escaped = (text.replace("\\", "\\\\").replace('"', '\\"')
               .replace("\n", "\\n").replace("\r", "\\r"))
    return f'"{escaped}"'


def _render_roots(pairs: dict[str, tuple[str, ...]]) -> list[str]:
    """渲染网盘扫描起点：单个写成字符串，多个写成数组。"""
    rendered: dict[str, object] = {}
    for key, roots in pairs.items():
        if len(roots) == 1:
            rendered[key] = roots[0]
        elif not roots:
            rendered[key] = ""
        else:
            rendered[key] = "[" + ", ".join(_render_value(root) for root in roots) + "]"
    return [f"{_render_key(key)} = {value if isinstance(value, str) and value.startswith('[') else _render_value(value)}"
            for key, value in rendered.items()]


def _render_key(key: str) -> str:
    allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-")
    return key if key and set(key) <= allowed else _render_value(key)


def _render_pairs(pairs: dict[str, object]) -> list[str]:
    return [f"{_render_key(key)} = {_render_value(value)}" for key, value in pairs.items()]


def render(config: PeachConfig) -> str:
    """把设置渲染成带注释的 TOML。注释是给人读的，`load_config` 不依赖它们。"""
    lines = [
        "# Peach 设置文件。优先级：环境变量 > 本文件 > 程序默认值；手动修改后重启服务生效。",
        "# 本文件保存在 Peach 数据目录中；该目录由 PEACH_DATA_ROOT 或项目旁的 peach-data 决定。",
        "# Docker：本文件位于 /data/config.toml；将 /data 放在数据卷中，重建容器时保留该卷。",
        f"# 生成入口：peach init（Peach 数据目录：{config.data_root}）",
        "",
        "[directories]",
        "# Peach 数据目录下的子目录，例如 database、logs；省略时使用同名目录。",
        "# 也可填写绝对路径。Docker 中相对目录位于 /data 下；换到别处时要自己保证那份数据随容器保留。",
    ]
    lines += _render_pairs({key: config.directories[key]
                            for key in DIRECTORY_KEYS if key in config.directories})
    lines += [
        "",
        "[drive]",
        "# 网盘授权的回调基址，必须是 https 地址，例如 https://peach.example.com。",
        "# 网盘后台登记的回调地址是 <public_url>/oauth/<网盘>/callback；留空就只能是手动填认证信息，不能发起授权。",
    ]
    lines += _render_pairs({"public_url": config.drive_public_url})
    for key, (client_id, client_secret) in config.drive_clients.items():
        lines += [
            "",
            f"[drive.accounts.{_render_key(key)}]",
            "# 该网盘 OAuth 应用的凭据。client_secret 是钥匙，本文件是它唯一的存放处。",
            *_render_pairs({"client_id": client_id, "client_secret": client_secret}),
        ]
    lines += [
        "",
        "[drive.roots]",
        "# 网盘来源 -> 扫描起点的远端目录 id（不是路径）；留空表示扫该账号的根目录。",
        "# 一个来源扫多个目录时写成数组。",
    ]
    lines += _render_roots(dict(config.drive_roots))
    if config.drive_modes:
        lines += [
            "",
            "[drive.modes]",
            "# 网盘来源 -> 取字节方式：redirect 让浏览器直接跟网盘的预授权地址走（不占服务器流量），",
            "# proxy 由 Peach 带 Range 转发（浏览器只跟 Peach 说话）。只带鉴权才能取的来源只能写 proxy。",
        ]
        lines += [f"{_render_key(key)} = {_render_value(mode)}"
                  for key, mode in config.drive_modes.items()]
    lines += [
        "",
        "[media.libraries]",
        "# 媒体库 id -> 界面显示的媒体库名称。",
    ]
    lines += [f"{_render_value(key)} = {_render_value(name)}" for key, name in config.library_names.items()]
    lines += [
        "",
        "[media.library_icons]",
        "# 媒体库 id -> 媒体库图标。取值是 peach.media_libraries.LIBRARY_ICONS 里的图标名，",
        "# 不认识的值忽略：只含一个来源的馆藏回落到该来源的图标，跨来源的用 database。",
    ]
    lines += [f"{_render_value(key)} = {_render_value(icon)}" for key, icon in config.library_icons.items()]
    for key, value in config.library_catalog.items():
        lines += ["", f"[media.library_catalog.{_render_key(key)}]", *_render_pairs(value)]
    lines += [
        "",
        "[server]",
        "# Docker 服务固定监听 0.0.0.0:8900；宿主机访问地址与端口由 Compose 配置。",
        "# 此处 host、port 用于直接运行 peach serve；Docker 入口参数优先。",
    ]
    lines += _render_pairs({
        "host": config.server.host,
        "port": config.server.port,
    })
    return "\n".join(lines) + "\n"


def write(config: PeachConfig, *, force: bool = False) -> Path:
    """把设置写到 `config.path`。已存在且没给 `force` 就拒绝，不悄悄覆盖。"""
    path = config.path
    if path.exists() and not force:
        raise SettingsFileError(f"设置文件已存在，加 --force 才覆盖：{path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render(config), encoding="utf-8")
    return path
