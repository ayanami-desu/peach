"""首次运行问答：问什么、怎么校验、写出什么样的设置文件。

这里只有纯逻辑，不碰终端：`peach init` 的命令行问答是它的第一个前端，浏览器里的
首次设置页（`routes_pages`）是第二个，两边都调同一组函数——`questions()` 给出题目、
默认值和校验器，`interview()` 用注入的 `ask` 把题目走一遍，`configure()` 把答案落成
`PeachConfig`，`apply()` 把它变成一台能直接起服务的机器（目录、账本、口令、设置文件）。
前端只负责把字串送进来、把结果和错误显示出去。

问答只收本机的坐标：Peach 数据目录、监听地址与端口、网盘授权的回调基址。媒体本身在
网盘上，授权与扫描目录都要在浏览器里完成——授权码换来的令牌落在 `secrets/` 下，
命令行问答不该要求人在这里粘贴它。
"""
from __future__ import annotations

import os
from collections.abc import Callable, Iterator
from dataclasses import dataclass, replace
from pathlib import Path

from . import auth, settings_file
from .migrations import upgrade
from .settings_file import PeachConfig

#: 提问函数：(题目, 默认值) -> 用户输入的原文。空串表示接受默认值。
Ask = Callable[[str, str], str]

LOOPBACK_HOST = "127.0.0.1"
#: 对外监听所有网卡。公网可达性由部署侧的端口映射与反向代理决定。
PUBLIC_HOST = "0.0.0.0"
#: 每题最多问几次。三次都不是有效值就放弃，不能让人困在一个死循环里。
MAX_ATTEMPTS = 3
#: 迁移随代码走，不随数据走。这里不 import `peach.config`：那个模块的常量在进程启动
#: 那一刻就定型了，而首次设置正是要改变它们指向的 Peach 数据目录。
MIGRATIONS_DIR = settings_file.PROJECT_ROOT / "migrations"
#: 「现在处理」的一次性标记，落在 `<Peach 数据目录>/state/`。设置页写它，看守进程消费它：
#: 设置页所在的那次启动里未必有网盘令牌，扫描不能跑在前端的进程里。
SCAN_REQUEST_NAME = "first-scan.request"
RELOAD_NAME = "configuration-reload.request"

#: 监听范围的两个选项：(提交值, 说明)。题目文本和设置页的下拉都由它生成，
#: 所以两处永远是同一批选项，改一个不会漏掉另一个。
HOST_OPTIONS = (("1", "只有这台机器"), ("2", "对外提供（0.0.0.0）"))

_HOST_CHOICES = {
    "1": LOOPBACK_HOST, "本机": LOOPBACK_HOST, LOOPBACK_HOST: LOOPBACK_HOST,
    "2": PUBLIC_HOST, "对外": PUBLIC_HOST, PUBLIC_HOST: PUBLIC_HOST,
}
_YES = {"", "y", "yes", "是"}
_NO = {"n", "no", "否"}


class OnboardingAborted(RuntimeError):
    """一题没有问出有效答案：连续给错、或者输入结束。消息以句号结尾，前端接着说后果。"""


@dataclass(frozen=True)
class Question:
    key: str
    prompt: str
    default: str
    #: 原文 -> 规范值；不合格就抛 `ValueError`，消息直接给人看。
    validate: Callable[[str], object]


@dataclass(frozen=True)
class Answers:
    data_root: Path
    host: str
    port: int
    #: 网盘授权的回调基址，例如 `https://peach.example.com`；可以留空，稍后在配置页填。
    drive_public_url: str = ""


# --------------------------------------------------------------------------- 校验

def validate_data_root(raw: str) -> Path:
    text = raw.strip()
    if not text:
        raise ValueError("Peach 数据目录不能为空")
    path = Path(text).expanduser()
    if path.is_file():
        raise ValueError(f"{path} 是一个文件，Peach 数据目录要是目录")
    return path


def validate_host(raw: str) -> str:
    key = raw.strip().lower()
    try:
        return _HOST_CHOICES[key]
    except KeyError:
        raise ValueError("填 1（只有这台机器）或 2（对外提供）") from None


def validate_port(raw: str) -> int:
    text = raw.strip()
    if not text.isdigit() or not 1 <= int(text) <= 65535:
        raise ValueError("端口要是 1 到 65535 之间的整数")
    return int(text)


def validate_public_url(raw: str) -> str:
    """网盘授权的回调基址。留空表示稍后在配置页填，非空就必须是 https 地址。

    网盘后台登记的回调地址是 `https://`，运营商与浏览器也只在 https 下把授权页
    当成安全上下文；填一个 http 地址换来的只是授权到一半被拒。
    """
    text = raw.strip().rstrip("/")
    if not text:
        return ""
    if not text.startswith("https://"):
        raise ValueError("填 https:// 开头的地址，例如 https://peach.example.com")
    host = text[len("https://"):].split("/", 1)[0]
    if not host or " " in host:
        raise ValueError("地址里要有主机名，例如 https://peach.example.com")
    return text


def validate_yes_no(raw: str) -> bool:
    key = raw.strip().lower()
    if key in _YES:
        return True
    if key in _NO:
        return False
    raise ValueError("填 y 或 n")


# --------------------------------------------------------------------------- 题目

def questions(config: PeachConfig) -> tuple[Question, ...]:
    """按顺序给出全部题目。默认值来自当前解析到的配置，和非交互 `peach init` 同一口径。"""
    return (
        Question("data_root", "数据目录（Peach 数据库、缓存和设置文件都放在这里）",
                 str(config.data_root), validate_data_root),
        Question("host",
                 "谁可以访问：" + "，".join(f"{value} = {label}" for value, label in HOST_OPTIONS),
                 "2", validate_host),
        Question("port", "端口", str(config.server.port), validate_port),
        Question("drive_public_url",
                 "网盘授权的回调基址（例如 https://peach.example.com，回车先跳过）",
                 config.drive_public_url, validate_public_url),
    )


def ask_until_valid(
    question: Question, ask: Ask, *, report: Callable[[str], None] = print,
    max_attempts: int = MAX_ATTEMPTS,
) -> object:
    """问到拿到合格答案为止，最多 `max_attempts` 次；空输入取默认值。"""
    for attempt in range(1, max_attempts + 1):
        raw = ask(question.prompt, question.default)
        candidate = raw if raw.strip() else question.default
        try:
            return question.validate(candidate)
        except ValueError as exc:
            remaining = max_attempts - attempt
            report(f"  {exc}" + (f"（还可以再试 {remaining} 次）" if remaining else ""))
    raise OnboardingAborted(f"「{question.prompt}」连续 {max_attempts} 次没有拿到有效值。")


def collect(
    config: PeachConfig, ask: Ask, *, report: Callable[[str], None] = print,
    max_attempts: int = MAX_ATTEMPTS,
) -> Iterator[tuple[str, object]]:
    """逐题产出 `(Answers 的字段名, 值)`。`ask` 由前端注入，测试用脚本化答案驱动。

    做成生成器是为了让命令行在 Peach 数据目录那一题之后就能判「设置文件已存在」并退出，
    不必等剩下的题答完。
    """
    for question in questions(config):
        yield question.key, ask_until_valid(
            question, ask, report=report, max_attempts=max_attempts)


def interview(
    config: PeachConfig, ask: Ask, *,
    report: Callable[[str], None] = print, max_attempts: int = MAX_ATTEMPTS,
) -> Answers:
    """把全部题目走一遍，落成 `Answers`。"""
    return Answers(**dict(collect(  # type: ignore[arg-type]
        config, ask, report=report, max_attempts=max_attempts)))


# --------------------------------------------------------------------------- 落盘

def configure(config: PeachConfig, answers: Answers) -> PeachConfig:
    """把答案落成一份可写回的设置。`config` 要按 `answers.data_root` 重新解析过。

    目录键全部落成显式值、设置文件标成已配置；网盘凭据与扫描起点沿用 `config` 里已有的
    那份——它们只能在浏览器里授权之后才有，问答不碰。
    """
    return replace(
        config,
        present=True,
        directories={key: config.directories.get(key, key)
                     for key in settings_file.DIRECTORY_KEYS},
        server=replace(config.server, host=answers.host, port=answers.port),
        drive_public_url=answers.drive_public_url or config.drive_public_url,
    )


@dataclass(frozen=True)
class DataTree:
    """`create_data_tree()` 做了什么。前端自己决定这些事实怎么说出来。"""

    data_root: Path
    database: Path
    #: 这次应用了几个迁移。账本本来就在时是 0。
    migrations: int
    ledger_existed: bool
    token_path: Path
    token_created: bool


@dataclass(frozen=True)
class Applied:
    """一次完整的首次设置：目录、账本、口令、设置文件都已落盘。"""

    config: PeachConfig
    settings_path: Path
    tree: DataTree


def resolve_config(
    data_root: Path | None = None, environ: dict[str, str] | None = None,
) -> tuple[PeachConfig, settings_file.SettingsFileError | None]:
    """按给定 Peach 数据目录重新解析设置；文件坏了就退回内建默认并把错误一并交出。

    `peach init` 与设置页都要在拿到 Peach 数据目录之后重新解析一次：Peach 数据目录决定设置文件在哪，
    而进程启动时那一份是按发现顺序算的，用户完全可以填一个别的目录。
    """
    environ = dict(os.environ if environ is None else environ)
    if data_root is not None:
        environ["PEACH_DATA_ROOT"] = str(data_root)
    try:
        return settings_file.load_config(environ=environ), None
    except settings_file.SettingsFileError as exc:
        return settings_file.load_config(environ=environ, strict=False), exc


def create_data_tree(config: PeachConfig) -> DataTree:
    """建目录、把库迁到最新、确保口令存在。已经有账本就不碰它。

    只做事、不打印：`peach init` 把结果写到终端，设置页把同一批结果写进成功页。
    """
    for key in settings_file.DIRECTORY_KEYS:
        config.directory(key).mkdir(parents=True, exist_ok=True)

    database = config.directory("database") / "ledger.db"
    existed = database.is_file()
    # 已有账本却在跑全新 init：不迁移、不备份、不覆盖，让人自己决定。
    applied = 0 if existed else len(upgrade(database, MIGRATIONS_DIR))

    secrets_dir = config.directory("secrets")
    _token, created = auth.ensure_token(secrets_dir)
    return DataTree(
        data_root=config.data_root, database=database, migrations=applied,
        ledger_existed=existed, token_path=auth.token_path(secrets_dir),
        token_created=created,
    )


def apply(
    config: PeachConfig, answers: Answers, *, force: bool = False,
    access_password: str = "", peach_proxy_values: dict | None = None,
) -> Applied:
    """把答案变成一台可以直接起服务的机器：目录、账本、口令、设置文件。

    `config` 要按 `answers.data_root` 重新解析过（`resolve_config`）。CLI 问答和设置页
    都只调这一个函数，两条前端因此不可能在「首次运行到底做了什么」上分叉。
    """
    prepared = configure(config, answers)
    tree = create_data_tree(prepared)
    from . import access
    access_path = prepared.directory("secrets") / "access.json"
    if not config.present and not access_path.exists():
        access.save(access_path, access_password)
    if peach_proxy_values is not None:
        from . import peach_proxy
        peach_proxy.save(prepared.directory("secrets"), peach_proxy_values)
    path = settings_file.write(prepared, force=force)
    return Applied(config=prepared, settings_path=path, tree=tree)


def scan_request_path(config: PeachConfig) -> Path:
    return config.directory("state") / SCAN_REQUEST_NAME


def request_first_scan(config: PeachConfig, location: str = "configured") -> Path:
    """记下「用户要求处理馆藏」。内容是来源 ID，看守进程据此拉起 `peach process <来源>`。"""
    path = scan_request_path(config)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(location, encoding="utf-8")
    return path


def take_first_scan_request(config: PeachConfig) -> str | None:
    """读走处理标记并删掉它，没有就返回 None。只消费一次：删除在读取之后立刻发生，
    看守进程每秒轮询一轮，留着它等于每一轮都再跑一遍整个扫描。
    """
    path = scan_request_path(config)
    try:
        location = path.read_text(encoding="utf-8").strip()
    except OSError:
        return None
    try:
        path.unlink()
    except OSError:
        return None
    return location or None


def console_ask(prompt: str, default: str) -> str:
    """终端前端：把默认值放在方括号里，回车即接受；输入结束视为放弃。"""
    suffix = f" [{default}]" if default else "（必填）"
    try:
        return input(f"{prompt}{suffix}: ")
    except EOFError:
        raise OnboardingAborted("输入已结束。") from None


def is_interactive(stdin) -> bool:
    """stdin 是不是一个真的终端。管道、重定向和没有 stdin 的打包进程都不是。"""
    try:
        return bool(stdin is not None and stdin.isatty())
    except (AttributeError, ValueError, OSError):
        return False
