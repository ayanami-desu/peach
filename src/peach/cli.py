from __future__ import annotations

import argparse
import sys
from datetime import datetime
from pathlib import Path

from . import auth, distribution, ledger_backups, onboarding, settings_file
from .api import create_app
from .config import (
    CONFIGURED,
    DATABASE_PATH,
    MIGRATIONS_DIR,
    SERVE_HOST,
    SERVE_PORT,
    SETTINGS_ERROR,
    PeachSettings,
)
from .migrations import plan, upgrade
from .scripting import open_readonly


DEFAULT_DB = DATABASE_PATH

#: 只监听这些地址时，服务只对运行它的这台机器可达。
_LOOPBACK_HOSTS = frozenset({"127.0.0.1", "localhost", "::1", "[::1]"})


def _is_loopback(host: str) -> bool:
    return (host or "").strip().lower() in _LOOPBACK_HOSTS


def _require_readable_settings() -> None:
    """设置文件在但读不出来时，明确拒绝。

    这种情况下 `config` 里那份是退回的内建默认——Peach 数据目录仍然对（发现顺序不看文件内容），
    但端口、网盘授权全是通用值。拿它启动会得到一个「看起来正常」的服务，比直接失败难查得多。
    """
    if SETTINGS_ERROR is not None:
        raise SystemExit(
            f"{SETTINGS_ERROR}\n修好这个文件，或者用 `peach init --force` 重新生成。")


def _run_uvicorn(app, **options) -> None:
    """与单进程的 `uvicorn.run` 相同，只是先在 uvicorn 的事件循环上装好 Peach 的 asyncio 处理器。

    处理器拿着 Server：客户端在 accept 完成前断开时，标准库会关掉监听套接字，
    `error_reporting.asyncio_handler` 靠它按原地址重新监听。
    """
    import asyncio
    import functools

    import uvicorn

    from .error_reporting import asyncio_handler
    config = uvicorn.Config(app, workers=1, **options)
    server = uvicorn.Server(config)

    async def serve():
        asyncio.get_running_loop().set_exception_handler(
            functools.partial(asyncio_handler, uvicorn_server=server))
        await server.serve()

    try:
        asyncio.run(serve(), loop_factory=config.get_loop_factory())
    except KeyboardInterrupt:
        pass
    if not server.started:
        raise SystemExit(uvicorn.config.STARTUP_FAILURE)


def _serve(args: argparse.Namespace) -> int:
    _require_readable_settings()
    if distribution.docker():
        # 容器里没有别的东西管日志：半年保留、按月切段与空进程日志清理在这里做。
        import logging
        from . import log_retention
        try:
            log_retention.sweep(settings_file.active().directory("logs"))
        except Exception:
            logging.getLogger(__name__).warning("日志整理失败", exc_info=True)
    # `--setup` 是首次设置的引导服务：只提供首次运行表单，不要口令、也报未配置。
    # 口令刻意置空而不是读文件——表单一提交就会生成一份口令，那之后要是有人重启这条
    # 引导服务，读到新口令的它会把还没看到口令的用户关在门外。
    token = "" if args.setup else _serve_token(args)
    secrets_dir = settings_file.active().directory("secrets")
    settings = PeachSettings(
        db_path=args.db,
        host=args.host,
        port=args.port,
        token=token,
        token_file=auth.token_file(args.token, secrets_dir) if token else None,
        access_path=secrets_dir / "access.json",
        configured=CONFIGURED and not args.setup,
        docs_enabled=args.docs,
    )
    _run_uvicorn(create_app(settings), host=args.host, port=args.port, proxy_headers=False)
    return 0


def _serve_token(args: argparse.Namespace) -> str:
    """取这次启动要用的口令，并在对外可达却没有口令时拒绝启动。

    拒绝而不是告警：服务是公网部署的，告警不会有人看见，服务却已经把整个馆藏和写接口
    摆在外部地址上。回环地址不拦——那时只有本机进程够得着，与文件系统同级。

    `--no-auth` 让本机开发跳过登录页，同一条回环判据照样拦：它只影响这次启动，
    不读也不改口令文件，所以部署里的那份服务仍然要口令。
    """
    if getattr(args, "no_auth", False):
        if not _is_loopback(args.host):
            raise SystemExit(
                f"拒绝启动：--no-auth 仅允许监听本机地址时使用，而 --host {args.host} 不是。\n"
                f"在对外地址上关掉登录，等于把整个馆藏和写接口交给任何够得着这台服务的人。"
            )
        return ""
    secrets_dir = settings_file.active().directory("secrets")
    token = auth.resolve_token(args.token, secrets_dir)
    if token or _is_loopback(args.host):
        return token
    raise SystemExit(
        f"拒绝启动：--host {args.host} 允许其他机器访问，而这台机器还没有访问口令。\n"
        f"这样起服务，任何够得着它的人都能读整个馆藏并调用写接口。\n"
        f"先跑 `peach token` 生成并查看口令（存在 {auth.token_path(secrets_dir)}），"
        f"再重新启动；只给本机用就改成 --host 127.0.0.1。"
    )


def _migrate(args: argparse.Namespace) -> int:
    _require_readable_settings()
    # 上次从备份恢复如果被中断，账本可能不在或不是一份。先把标记处理掉再谈迁移：
    # 否则这里会被当成新装，建出一个空账本。
    ledger_backups.recover(args.db)
    all_migrations, pending = plan(args.db, MIGRATIONS_DIR)
    print(f"database: {args.db}")
    print(f"migrations: {len(all_migrations)}, pending: {len(pending)}")
    for migration in pending:
        print(f"PENDING {migration.version} {migration.name}")
    if args.action == "status" or not pending:
        return 0
    if args.db.resolve() == DEFAULT_DB.resolve() and not args.yes:
        raise SystemExit("refusing to modify the real ledger without --yes")
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = args.db.with_name(f"{args.db.stem}.pre-migrate-{stamp}{args.db.suffix}")
    done = upgrade(args.db, MIGRATIONS_DIR, backup)
    print(f"backup: {backup}")
    print("applied: " + ", ".join(item.version for item in done))
    return 0


#: 「加工进度」的分母：能落到本机的视频。在线资产没有文件，探测和九宫格对它们
#: 不适用，混进分母只会让每一行的百分比永远到不了 100。
_PROCESSED_SCOPE = "medium='video' AND location!='online'"
_PROCESSED_MEASURES = (
    ("有时长 (ffprobe)", "duration IS NOT NULL"),
    ("有九宫格", "snapshot_path IS NOT NULL"),
    ("有哈希", "hash IS NOT NULL"),
    ("有创作者归属", "creator IS NOT NULL AND creator!=''"),
    ("有消费记录", "play_count>0 OR rating IS NOT NULL"),
)


def _status(args: argparse.Namespace) -> int:
    """一屏看完账本与迁移状态。只读，随时可跑。

    这里刻意不报后台任务：进程名和日志 mtime 都不是存活判据（长跑批处理各自持有
    pid 锁与进度文件），`scripts/job_status.py` 才是那件事的正式表面。
    """
    _require_readable_settings()
    if not args.db.is_file():
        print(f"数据库不存在：{args.db}")
        if not args.db.parent.is_dir():
            print("这台机器还没初始化过，先跑 `peach init`。")
        return 4
    connection = open_readonly(args.db)
    try:
        one = lambda sql: connection.execute(sql).fetchone()[0]      # noqa: E731
        print(f"数据库 {args.db}")
        for location, count, size in connection.execute(
                "SELECT location,COUNT(*),COALESCE(SUM(size),0) FROM asset "
                "GROUP BY 1 ORDER BY 3 DESC"):
            print(f"  {location or '?':<10}{count:>9,} 条{size / 1024 ** 4:>10.2f} TB")
        print(f"  {'合计':<10}{one('SELECT COUNT(*) FROM asset'):>9,} 条"
              f"{one('SELECT COALESCE(SUM(size),0) FROM asset') / 1024 ** 4:>10.2f} TB")

        print("\n  媒介构成：")
        for medium, count, size in connection.execute(
                "SELECT medium,COUNT(*),COALESCE(SUM(size),0) FROM asset "
                "GROUP BY 1 ORDER BY 2 DESC"):
            print(f"    {medium or '?':<14}{count:>8,}{size / 1024 ** 3:>11.1f} GB")

        total = one(f"SELECT COUNT(*) FROM asset WHERE {_PROCESSED_SCOPE}")
        print(f"\n  加工进度（本机视频 {total:,} 条）：")
        for label, condition in _PROCESSED_MEASURES:
            done = one(f"SELECT COUNT(*) FROM asset WHERE {_PROCESSED_SCOPE} "
                       f"AND ({condition})")
            percent = done / total * 100 if total else 0.0
            print(f"    {label:<18}{done:>8,} / {total:,}  {percent:5.1f}%  "
                  f"{'█' * int(percent / 4)}")

        print("\n  情境层：")
        for column, label in (("ctx_length", "时长档"), ("ctx_orient", "屏向"),
                              ("ctx_quality", "画质")):
            rows = connection.execute(
                f"SELECT {column},COUNT(*) FROM asset WHERE {column} IS NOT NULL "
                "GROUP BY 1 ORDER BY 2 DESC").fetchall()
            if rows:
                print(f"    {label:<8}"
                      + "  ".join(f"{key}={value:,}" for key, value in rows))
    finally:
        connection.close()

    all_migrations, pending = plan(args.db, MIGRATIONS_DIR)
    print(f"\n  迁移：共 {len(all_migrations)} 个，待应用 {len(pending)} 个")
    for migration in pending:
        print(f"    PENDING {migration.version} {migration.name}")
    return 0


def _resolved_config(
    data_root: Path | None,
) -> tuple[settings_file.PeachConfig, settings_file.SettingsFileError | None]:
    """按当前环境解析一份配置，外加「旧文件读不出来」时的原始错误。

    `--data-root` 走和运行期同一条发现路径，不另开分支。读取用 `strict=False`
    （`init --force` 是坏文件的唯一自救入口），但错误必须留下来：静默退回内建默认
    再写回去，等于把旧文件里的坐标悄悄抹平。
    """
    return onboarding.resolve_config(data_root)


def _init(args: argparse.Namespace) -> int:
    """首次运行：建目录、建库、写设置文件、生成访问口令。

    一个参数都没给、stdin 又是终端时进问答（`_init_interactive`）；给了任何参数、
    加了 `--no-input` 或 stdin 不是终端，都走下面这条非交互路径——它只落已知的坐标，
    网盘凭据留给网页上的授权流程。
    """
    if _wants_interview(args):
        return _init_interactive()
    config, broken = _resolved_config(args.data_root)
    if config.path.exists() and not args.force:
        print(f"设置文件已存在：{config.path}")
        print("要重新生成就加 --force；它会覆盖这个文件，不动数据。")
        return 3
    if broken is not None:
        print(f"注意：{broken}")
        print("下面这份是按内建默认重建的，**没有**继承旧文件里的值。")
        print("旧文件里自定义过的坐标要在这次命令里用对应参数重新给一遍。")
    prepared = settings_file.PeachConfig(
        data_root=config.data_root,
        path=config.path,
        present=True,
        data_root_found=config.data_root_found,
        # 目录键一次写全：设置文件是给人读的，省略掉的那些反而要人去猜默认规则。
        directories={key: config.directories.get(key, key)
                     for key in settings_file.DIRECTORY_KEYS},
        library_names=config.library_names,
        library_icons=config.library_icons,
        library_catalog=config.library_catalog,
        server=settings_file.ServerSettings(
            host=args.host or config.server.host,
            port=args.port or config.server.port,
        ),
        drive_public_url=args.public_url or config.drive_public_url,
        drive_clients=config.drive_clients,
        drive_locations=config.drive_locations,
        drive_roots=config.drive_roots,
    )
    _create_data_tree(prepared)
    path = settings_file.write(prepared, force=args.force)
    print(f"设置文件：{path}")
    _print_next_steps(prepared)
    return 0


def _wants_interview(args: argparse.Namespace) -> bool:
    """`peach init` 不带任何参数、stdin 是终端，才进问答。

    「不带任何参数」按 parser 的默认值判，不另抄一份参数名：加一个开关就多一处要同步。
    `--no-input` 本身就是一个参数，所以它天然落到非交互路径。
    """
    bare = build_parser().parse_args(["init"])
    return vars(args) == vars(bare) and onboarding.is_interactive(sys.stdin)


def _init_interactive(ask: onboarding.Ask = onboarding.console_ask) -> int:
    """首次运行问答。题目、校验与落盘全在 `peach.onboarding`，这里只是终端前端。

    `ask` 可注入：测试用脚本化答案驱动，不碰真实 stdin。
    """
    config, _broken = _resolved_config(None)
    print("首次运行问答：每一题直接回车就接受方括号里的默认值。")
    collected: dict[str, object] = {}
    try:
        for index, (key, value) in enumerate(onboarding.collect(config, ask)):
            collected[key] = value
            if index == 0:
                # Peach 数据目录定了，设置文件在哪也就定了。这一题之后就判，别让人把剩下的
                # 题答完才听到「文件已存在」——那些答案会被整份丢掉。
                config, _broken = _resolved_config(collected["data_root"])
                if config.path.exists():
                    print(f"设置文件已存在：{config.path}")
                    print("要重新生成就跑 `peach init --force`；它会覆盖这个文件，不动数据。")
                    return 3
    except onboarding.OnboardingAborted as exc:
        raise SystemExit(f"{exc}已退出，没有写任何文件。") from None
    answers = onboarding.Answers(**collected)  # type: ignore[arg-type]
    applied = onboarding.apply(config, answers)
    prepared = applied.config
    print(f"Peach 数据目录：{prepared.data_root}")
    _report_data_tree(applied.tree)
    print(f"设置文件：{applied.settings_path}")
    _print_next_steps(prepared)
    return 0


def _print_next_steps(config: settings_file.PeachConfig) -> None:
    """首次设置之后必须做的事：起服务，然后在网页上完成网盘授权。"""
    print("\n下一步：")
    print(f"  1. peach serve --host {config.server.host} --port {config.server.port}")
    print(f"  2. 浏览器打开 http://127.0.0.1:{config.server.port}/ 确认页面可用。")
    public = config.drive_public_url or "https://<公网地址>"
    print(f"  3. 网盘授权：后台登记的回调地址填 {public}/oauth/gdrive/callback 或")
    print(f"     {public}/oauth/onedrive/callback；授权完成后在配置页选择要扫描的目录。")


def _processing_line(state: dict) -> str:
    """一行进度，口径同页面的 `processingLine`：总量已知写完成数，扫描目录时写已发现的文件数。"""
    if state.get('total'):
        return f"{state['stage']}：{state.get('checked', 0)}/{state['total']}"
    if state.get('current_action') == 'scanning_files' or state.get('stage') == '扫描文件':
        return f"{state['stage']}：已发现 {state.get('scanned', 0):,} 个文件"
    return str(state['stage'])


def _processing_printer():
    """资料处理的进度回调：流量、问题等回报也会走这里，和上一行相同就不再打印。"""
    last = None
    def report(state):
        nonlocal last
        line = _processing_line(state)
        if line != last:
            print(line, flush=True)
            last = line
    return report


def _process_library(args: argparse.Namespace) -> int:
    """命令行跑资料处理，和网页那一轮一样记进任务中心、结算时派发声明的后继。

    后继写成 `pending` 行，由服务的后继通道执行：服务下次派发后继或重启时会领走。
    """
    from .library_processing import process_library
    from .repository import LedgerDatabase
    from .task_runs import cli_run, declared_rows
    _require_readable_settings()
    config = settings_file.active()
    with cli_run('library-processing', args.db, label='资料处理') as handle:
        from .jobs import JobCancelled
        try:
            result = process_library(config, args.db, config.directory('generated'),
                                     config.directory('generated') / 'covers', location=args.location,
                                     database=LedgerDatabase(args.db), report=_processing_printer())
        except JobCancelled:
            handle.finish('cancelled', error='用户停止任务')
            print('任务已取消，已保存结果保留。')
            return 130
        rows = declared_rows(result.get('followups'))
        queued = handle.store.enqueue_followups(handle.run_id, rows)
        if rows:
            print(f"后继：声明 {len(rows)} 条，入队 {len(queued['queued'])} 条，"
                  f"已在排队 {queued['duplicates']} 条", flush=True)
        complete = result['status'] == 'complete'
        handle.finish('succeeded' if complete else 'failed',
                      summary={'followups': len(queued['queued'])},
                      error='' if complete else str(result.get('error') or '资料处理未完成'))
    return 0 if complete else 1


def _create_data_tree(config: settings_file.PeachConfig) -> None:
    """建目录、把库迁到最新、生成访问口令。事情由 `onboarding.create_data_tree` 做，
    这里只把它做过的事说出来——网页上的首次设置调同一个函数，两条前端不会各做一套。
    """
    print(f"Peach 数据目录：{config.data_root}")
    _report_data_tree(onboarding.create_data_tree(config))


def _report_data_tree(tree: onboarding.DataTree) -> None:
    if tree.ledger_existed:
        print(f"数据库已存在，跳过建库：{tree.database}")
    else:
        print(f"数据库：{tree.database}（已应用 {tree.migrations} 个迁移）")
    _report_token(tree)


def _report_token(tree: onboarding.DataTree) -> None:
    """口令文件的路径。口令本身不打印，用 `peach token` 单独看。

    终端输出会进日志、截图和 issue，口令不该顺着这条路走出去。
    """
    print(f"访问口令：{tree.token_path}" + ("" if tree.token_created else "（沿用已有的那份）"))
    print("对外提供服务的进程必须读得到它，`peach token` 看内容。")


def _token(args: argparse.Namespace) -> int:
    """`peach token` 打印口令，没有就补一份；`--rotate` 换一个。

    手机和别的设备第一次访问会跳登录页，把这里打印的那串贴进去，之后走 cookie。
    """
    _require_readable_settings()
    secrets_dir = settings_file.active().directory("secrets")
    if args.rotate:
        token, fresh = auth.write_token(secrets_dir), True
    else:
        token, fresh = auth.ensure_token(secrets_dir)
    print(f"口令文件：{auth.token_path(secrets_dir)}")
    print(f"口令：{token}")
    if fresh:
        print("已经登录过的浏览器要再登录一次；正在跑的服务要重启才会读到这份口令。")
    return 0


def _check_sources(args: argparse.Namespace) -> int:
    import json
    from .source_preflight import check_sources

    result = check_sources(settings_file.active().directory("secrets"), args.source)
    if args.json:
        print(json.dumps(result, ensure_ascii=False))
    else:
        print("检查来源页面与图片 CDN；连通不代表作品资料或登录会话已验证。")
        for source in result["sources"]:
            for target in source["results"]:
                print(f"{source['label']} / {target['label']} [{target['outcome_label']}] {target.get('message', '')}")
    return 0 if result["ok"] else 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="peach")
    commands = parser.add_subparsers(dest="command", required=True)

    init = commands.add_parser(
        "init", help="首次运行：不带参数在终端里问答；带任何参数或 --no-input 走非交互")
    init.add_argument("--no-input", action="store_true",
                      help="不进入问答，按参数与内建默认直接生成")
    init.add_argument("--data-root", type=Path, help="Peach 数据目录；默认沿用当前发现结果")
    init.add_argument("--force", action="store_true", help="覆盖已存在的设置文件")
    init.add_argument("--host", help="服务监听地址")
    init.add_argument("--port", type=int, help="服务端口")
    init.add_argument("--public-url", help="网盘授权的回调基址，例如 https://peach.example.com")
    init.set_defaults(handler=_init)

    serve = commands.add_parser("serve", help="运行 Peach 服务")
    serve.add_argument("--host", default=SERVE_HOST)
    serve.add_argument("--port", type=int, default=SERVE_PORT)
    serve.add_argument("--db", type=Path, default=DEFAULT_DB)
    serve.add_argument("--token", default="")
    serve.add_argument("--docs", action="store_true")
    serve.add_argument("--setup", action="store_true",
                       help="只提供首次设置页：不要口令，报告未配置")
    serve.add_argument("--no-auth", action="store_true",
                       help="跳过登录页；仅允许本机访问时可用，不读取或修改口令文件")
    serve.set_defaults(handler=_serve)

    process_parser = commands.add_parser('process', help='扫描网盘并补全馆藏资料')
    process_parser.add_argument('location', nargs='?', default='configured')
    process_parser.add_argument('--db', type=Path, default=DEFAULT_DB)
    process_parser.set_defaults(handler=_process_library)

    token = commands.add_parser("token", help="查看访问口令，没有就生成一份")
    token.add_argument("--rotate", action="store_true",
                       help="换一个新口令，已签发的 cookie 立即失效")
    token.set_defaults(handler=_token)

    migrate = commands.add_parser("migrate", help="查看或应用 SQLite 迁移")
    migrate.add_argument("action", choices=("status", "upgrade"), nargs="?", default="status")
    migrate.add_argument("--db", type=Path, default=DEFAULT_DB)
    migrate.add_argument("--yes", action="store_true")
    migrate.set_defaults(handler=_migrate)

    status = commands.add_parser("status", help="只读查看账本与迁移状态")
    status.add_argument("--db", type=Path, default=DEFAULT_DB)
    status.set_defaults(handler=_status)

    sources = commands.add_parser("check-sources", help="有界检测外部资料源与图片 CDN，不读取影片")
    sources.add_argument("--source", action="append", help="只检查指定来源 ID；可重复指定，默认检查全部资料源")
    sources.add_argument("--json", action="store_true", help="输出不含凭据的 JSON 结果")
    sources.set_defaults(handler=_check_sources)

    return parser


def subcommands() -> frozenset[str]:
    """`peach` 现有的子命令名，从 parser 现算。

    不能在别处抄一份常量：抄过一次，结果是某个子命令在别处一直不可达，而且不报错。
    `_subparsers` 是 argparse 私有属性，argparse 没有公开的「列出子命令」接口；私有
    访问只留在这一处。
    """
    names: set[str] = set()
    container = build_parser()._subparsers
    for action in getattr(container, "_group_actions", ()):
        names.update(getattr(action, "choices", ()) or ())
    return frozenset(names)


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.handler(args)
