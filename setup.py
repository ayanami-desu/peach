"""将运行时资源装入 wheel，源码树仍是资源的唯一维护位置。"""
from pathlib import Path
import runpy
import shutil
import subprocess

from setuptools import setup
from setuptools.command.build_py import build_py

_REQUIRED_DIST_FILES = ("peach-app.js", "peach-app.css", "peach-pages.js", "peach-pages.css")


class BuildWithResources(build_py):
    def run(self):
        super().run()
        root = Path(__file__).resolve().parent
        npm = shutil.which("npm")
        if npm is not None and (root / "frontend" / "node_modules" / "vite").is_dir():
            subprocess.run([npm, "--prefix", str(root / "frontend"), "run", "build"],
                           cwd=str(root), check=True)
        dist = root / "web" / "dist"
        missing = [name for name in _REQUIRED_DIST_FILES if not (dist / name).is_file()]
        if missing:
            raise FileNotFoundError(
                f"缺少前端构建产物：{', '.join(missing)}；请先执行 npm --prefix frontend ci && npm --prefix frontend run build")
        destination = Path(self.build_lib) / "peach" / "_resources"
        manifest = runpy.run_path(str(root / 'src/peach/bundle_resources.py'))
        for source, target in manifest['data_files'](root):
            output = destination / target
            if source.is_dir():
                self.copy_tree(str(source), str(output))
            else:
                output.mkdir(parents=True, exist_ok=True)
                self.copy_file(str(source), str(output / source.name))


setup(cmdclass={"build_py": BuildWithResources})
