"""按账本里的虚拟路径浏览目录：路径形如 `gdrive:/Movies/2024/a.mp4`。

目录树完全由账本里的 `path` 拼出来，不访问网盘、也不需要挂载：第一段是扫描根的名字，
后面每一段是远端目录名。同名目录按来源分开，路径比较不分大小写。
"""
from __future__ import annotations

from hashlib import sha256

from . import media_libraries
from .media_sources import SOURCE_REGISTRY

_SOURCE_LABELS = {source.id: source.label for source in SOURCE_REGISTRY}


def folder_id(location: str, path: str) -> str:
    return sha256((location + '\0' + path.casefold()).encode('utf-8')).hexdigest()[:24]


def within(path: str, directory: str, recursive: bool = True) -> bool:
    parent = path.rsplit('/', 1)[0] if '/' in path else ''
    root = directory.rstrip('/')
    return parent == root or (recursive and parent.startswith(root + '/'))


def path_predicate(location: str, path: str, recursive: bool = True, alias: str = 'a'):
    """按完整目录组件匹配，目录名里的 SQL 通配符保持字面含义。"""
    prefix = path.rstrip('/') + '/'
    clause = f'({alias}.location=? AND substr({alias}.path,1,?)=? COLLATE NOCASE'
    params: list = [location, len(prefix), prefix]
    if not recursive:
        clause += ' AND instr(substr(' + alias + '.path,?),char(47))=0'
        params.append(len(prefix) + 1)
    return clause + ')', params


def directory_index(connection, config, *, locations: str = '', library: str = '') -> dict[str, dict]:
    """列出已登记的目录及其下面的视频数；`library` 只留这一个扫描根。"""
    allowed = {item for item in locations.split(',') if item} if locations else None
    held: set[tuple[str, str]] | None = None
    if library:
        row = next((item for item in media_libraries.libraries(config) if item['id'] == library), None)
        held = {(root['location'], root['root_id']) for root in row['roots']} if row else set()
    result: dict[str, dict] = {}

    def add(location, path, parent):
        identifier = folder_id(location, path)
        node = result.get(identifier)
        if node is None:
            name = path.rsplit('/', 1)[-1] or path
            # 第一段是 `gdrive:` 这样的来源标记，显示成来源名字比显示 id 有用。
            node = result[identifier] = {'id': identifier, 'location': location, 'path': path,
                                         'name': _SOURCE_LABELS.get(name[:-1], name) if name.endswith(':') else name,
                                         'parent': parent,
                                         'videos': 0, 'files': 0, 'has_children': False}
        return node

    rows = connection.execute(
        "SELECT location,path,medium,drive_root FROM asset WHERE path IS NOT NULL AND path<>'' "
        "AND COALESCE(disposal,'') NOT IN ('trash','vanished') ORDER BY id")
    chains: dict[tuple[str, str], list[dict] | None] = {}
    for location, path, medium, drive_root in rows:
        if allowed is not None and location not in allowed:
            continue
        if held is not None and (location, drive_root) not in held:
            continue
        parts = path.split('/')
        directory = '/'.join(parts[:-1])
        if directory in chains:
            chain = chains[directory]
        else:
            chain = None
            if len(parts) > 1:
                node = None
                built = []
                partial = ''
                for segment in parts[:-1]:
                    partial = f'{partial}/{segment}' if partial else segment
                    parent = node['id'] if node else None
                    node = add(location, partial, parent)
                    if parent:
                        result[parent]['has_children'] = True
                    built.append(node)
                chain = built
            chains[directory] = chain
        if not chain:
            continue
        for node in chain:
            node['files'] += 1
            node['videos'] += medium == 'video'
    return result


def browse(index: dict[str, dict], key: str = '', search: str = '') -> dict:
    selected = index.get(key)
    if key and selected is None:
        raise ValueError('目录不存在或已移出媒体库')
    ancestors = []
    node = selected
    while node:
        ancestors.insert(0, node)
        node = index.get(node['parent'])
    order = lambda row: (row['name'].casefold(), row['location'], row['path'].casefold())
    roots = sorted((row for row in index.values() if row['parent'] is None), key=order)
    children = sorted((row for row in index.values() if row['parent'] == (key or None)), key=order)
    matches = sorted((row for row in index.values() if search.casefold() in row['name'].casefold()), key=order)[:100] if search else []
    return {'roots': roots, 'children': children, 'ancestors': ancestors,
            'selected': selected, 'matches': matches}
