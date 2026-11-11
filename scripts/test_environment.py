"""正式测试入口的依赖准备，只在隔离工作树自动同步环境。

主检出的 `.venv` 是部署与本地服务共用的那一份，测试只读检查它是否就绪，不动它；
隔离工作树各自有一份 `.venv`，进来前按 `uv.lock` 同步一次，避免拿旧依赖跑新代码。
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "src") not in sys.path:
    sys.path.insert(0, str(ROOT / "src"))

#: 判据与动作共用的参数：锁文件为准、带上全部 extra、不重装 editable 的 peach 自身。
UV_SYNC = ("sync", "--locked", "--all-extras", "--no-install-project")


def find_uv(*, which=shutil.which, environ=None) -> str | None:
    """定位 uv：先看 PATH，再看 Windows 的 WinGet 安装目录。"""
    found = which("uv")
    if found:
        return found
    environment = os.environ if environ is None else environ
    for name in ("LOCALAPPDATA", "USERPROFILE"):
        root = environment.get(name)
        if not root:
            continue
        candidate = Path(root) / "Microsoft" / "WinGet" / "Links" / "uv.exe"
        if candidate.is_file():
            return str(candidate)
    return None


def prepare(root: Path, main: Path, *, run=subprocess.run, which=shutil.which,
            environ=None) -> None:
    """准备完成才允许加载测试运行器；主检出依赖只做只读检查。"""
    root, main = root.resolve(), main.resolve()
    if not (root / "uv.lock").is_file():
        raise RuntimeError(f"未取得测试依赖锁文件：{root / 'uv.lock'}")
    environment = dict(os.environ if environ is None else environ)
    for name in ("VIRTUAL_ENV", "UV_PROJECT_ENVIRONMENT"):
        environment.pop(name, None)
    python = root / ".venv" / "bin" / "python"
    if not python.is_file():
        python = root / ".venv" / "Scripts" / "python.exe"
    if root == main:
        if not python.is_file():
            raise RuntimeError(f"主检出依赖未就绪：{python} 不存在；请在隔离工作树测试。")
        print(f"主检出依赖按只读处理：{python}", flush=True)
        return
    if (root / ".venv").resolve() != root / ".venv":
        raise RuntimeError("工作树 .venv 指向外部目录；不能同步主检出或其他工作树的环境。")
    uv = find_uv(which=which, environ=environment)
    if uv is None:
        raise RuntimeError("未取得 uv：PATH 与 WinGet 安装目录里都没有。")
    print(f"按 uv.lock 同步测试环境：{root / '.venv'}", flush=True)
    result = run([uv, *UV_SYNC, "--python", sys.executable, "--project", str(root)],
                 cwd=str(root), env=environment, check=False)
    if result.returncode:
        raise RuntimeError(f"测试依赖同步失败（退出码 {result.returncode}）；未启动测试。")


def main(argv=None) -> int:
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path)
    parser.add_argument("main_root", type=Path)
    args = parser.parse_args(argv)
    try:
        prepare(args.root, args.main_root)
    except (RuntimeError, OSError) as error:
        print(str(error), file=sys.stderr, flush=True)
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
