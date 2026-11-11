"""标签管理的读取、预览与事务写入端点。"""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4

from .catalog_rules import clean_tag_name
from .migrations import sqlite_backup
from .tag_management import apply_plan, duplicate_groups, preview, tag_rows


def q_tag_management(contract, args):
    def read():
        with contract.read_connection() as connection:
            rows = tag_rows(connection)
            return {'items': rows, 'duplicate_groups': duplicate_groups(rows)}
    inventory = contract.cached('tag-management', read,
                                version=contract.ledger_revision(('entity', 'entity_alias', 'asset_entity')))
    if 'limit' not in args:
        return deepcopy(inventory)
    return _tag_page(inventory, args)


def _name_key(value):
    return clean_tag_name(value).casefold()


def _tag_page(inventory, args):
    state = str(args.get('state') or 'active').strip().casefold()
    view = str(args.get('view') or 'cloud').strip().casefold()
    if state not in ('active', 'hidden', 'blocked'):
        raise ValueError('未知的标签状态')
    if view not in ('cloud', 'alphabet'):
        raise ValueError('未知的标签视图')
    try:
        limit = min(max(int(args.get('limit') or 20), 1), 600)
    except (TypeError, ValueError):
        limit = 20
    try:
        offset = max(int(args.get('offset') or 0), 0)
    except (TypeError, ValueError):
        offset = 0
    query = _name_key(args.get('q') or '')
    rows = [row for row in inventory['items']
            if _tag_state(row) == state and (not query or any(
                query in _name_key(name) for name in [row['k'], *row.get('aliases', [])]))]
    categories: dict[str, int] = {}
    for row in rows:
        categories[row['cat']] = categories.get(row['cat'], 0) + 1
    category = str(args.get('category') or '')
    if category and category != 'all':
        rows = [row for row in rows if row['cat'] == category]
    def order(row):
        name = (_name_key(row['k']), row['k'], str(row.get('entity_id', row.get('id'))))
        return (-row['n'], *name) if view == 'cloud' else name
    rows.sort(key=order)
    return {'items': deepcopy(rows[offset:offset + limit]), 'total': len(rows),
            'has_more': offset + limit < len(rows), 'limit': limit, 'offset': offset,
            'categories': categories, 'duplicate_groups': deepcopy(inventory['duplicate_groups'])}


def _tag_state(row):
    return 'blocked' if row.get('blocked') else 'hidden' if row.get('hidden') else 'active'


def w_tag_preview(contract, body):
    with contract.read_connection() as connection:
        return preview(connection, body)


def w_tag_management(contract, body):
    with contract.write_transaction() as connection:
        connection.execute('BEGIN IMMEDIATE')
        plan = preview(connection, body)
        if plan['token'] != body.get('token'):
            raise ValueError('标签已变化，请重新预览操作范围')
        stamp = datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')
        backup = contract.db_path.with_name(f'ledger.pre-tag-management-{stamp}-{uuid4().hex[:8]}.db')
        sqlite_backup(contract.db_path, backup)
        result = apply_plan(connection, body)
    contract.cache_bust()
    return result
