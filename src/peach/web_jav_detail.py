"""库外 JAV 作品详情的只读投影，来源资料不构成 ledger 断言。"""
from __future__ import annotations

import re
import json
import base64
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path

from . import entities, web_catalog
from .catalog_rules import normalise_code_key, tag_cat
from .genre_decisions import load_genre_decisions
from .genre_taxonomy import resolve_genre
from .javdb_public import (PUBLIC_API, PublicSourceUnavailable,
                          PublicIdentityAmbiguous, actor_gender, preview_video_url, public_image_url,
                          public_cache_scope, cache_error)
from .sources.javdb import maker_writing
from .remote_media_cache import AVATAR_REFRESH_SECONDS, cache_for
from .preview_cache import PreviewCache

#: 详情页「重新匹配封面」的预算：人在弹层里等着，挑不出来就报原因。
COVER_SECONDS = 60.0


def detail_code(args) -> str:
    raw = str(args.get("code") or "").strip()
    if not re.fullmatch(r"[A-Za-z0-9_-]{2,64}", raw):
        raise ValueError("需要有效的作品番号")
    return normalise_code_key(raw)


def discovery_cover_url(item, source) -> str:
    """卡片只显示 `/cover-image` 能代理的官方封面地址。"""
    from .jav_cover_fetch import proxyable_cover_url
    for value in (item.get('cover_url'), source.get('cover_url')):
        if proxyable_cover_url(value):
            return value
    return ''


def stored_cover_url(contract, code) -> str:
    """`/cover-image` 按番号取的上游地址；只读已缓存的来源资料，不联网。
    官方只回占位图的那几部没有地址：代理缓存里存着的那张占位图也就不再给出去。"""
    from .javdb_public import PUBLIC_API
    return discovery_cover_url({}, PUBLIC_API.peek_movie(code) or {})


def _refs(contract, connection, kind, names):
    refs = []
    for name in dict.fromkeys(str(name or "").strip() for name in names):
        if not name:
            continue
        lookup = maker_writing(name) if kind == "studio" else name
        entity = entities.resolve_entity(connection, kind, lookup)
        if entity is None and kind == "studio":
            matches = connection.execute(
                "SELECT DISTINCT e.* FROM entity e LEFT JOIN entity_alias a ON a.entity_id=e.id "
                "WHERE e.kind='studio' AND (e.canonical_name=? COLLATE NOCASE OR a.alias=? COLLATE NOCASE) "
                "ORDER BY e.id LIMIT 2", (lookup, lookup)).fetchall()
            entity = matches[0] if len(matches) == 1 else None
        refs.append(web_catalog.entity_ref(contract, kind, entity["id"], entity["canonical_name"])
                    if entity else {"id": None, "name": name, "has_image": False})
    return refs


def _source_cache(handler):
    @wraps(handler)
    def read(contract, args):
        with public_cache_scope(contract.cover_root.parent / 'jav-public') as reads:
            payload = handler(contract, args)
            prefix = ('movie:',)
            selected = [row for row in reads if row['key'].startswith(prefix)]
            if selected:
                payload['checked_at'] = datetime.fromtimestamp(min(row['saved'] for row in selected), timezone.utc).isoformat()
            errors = list(dict.fromkeys(row['error'] for row in reads if row['error']))
            if errors:
                payload['cache_stale'] = True
                payload['message'] = '；'.join(errors)
                if 'warnings' in payload:
                    payload['warnings'].extend(errors)
            return payload
    return read


@_source_cache
def q_jav_detail(contract, args) -> dict:
    code = detail_code(args)
    item: dict = {}
    source = None
    message = ""
    ambiguous = False
    try:
        source = PUBLIC_API.movie(code, refresh=True) if args.get('refresh') == '1' else PUBLIC_API.movie(code)
    except PublicSourceUnavailable as error:
        message = str(error)
        ambiguous = isinstance(error, PublicIdentityAmbiguous)
    if source:
        item.update(title=source.get("origin_title") or source.get("title") or item.get("title"),
                    release_date=source.get("release_date") or item.get("release_date"),
                    studio=source.get("maker_name") or item.get("studio"))
    payload = {"ok": True, "state": "ready" if source else "partial", "message": message,
               "code": code, "title": item.get("title") or code,
               "release_date": item.get("release_date"), "studio": item.get("studio")}
    with contract.database.read_connection() as connection:
        decisions = load_genre_decisions(connection)
    payload.update(_source_fields(source or {}, decisions))
    payload.update(_artwork_fields(contract, code, item, source or {}, refresh=args.get('refresh') == '1',
                                   ambiguous=ambiguous))
    if payload.get('preview_message'):
        payload['message'] = '；'.join(filter(None, (payload['message'], payload['preview_message'])))
    payload.update(_identity_fields(contract, code, item, source or {}))
    return payload


def visible_actors(connection, source, excluded=None):
    """来源演员资料保持完整，使用时排除明确登记的男优。"""
    excluded = entities.male_performer_ids(connection) if excluded is None else excluded
    actors = []
    for actor in source.get('actors') or []:
        if not isinstance(actor, dict) or not actor.get('name') or actor_gender(actor) == 'male':
            continue
        entity = entities.resolve_entity(connection, 'performer', actor['name'])
        if entity is None or entity['id'] not in excluded:
            actors.append(actor)
    return actors


def _identity_fields(contract, code, item, source):
    with contract.database.read_connection() as connection:
        actors = visible_actors(connection, source)
        if 'actors' not in source:
            actors = [{'name': name} for name in re.split(r"[、,，]", str(item.get('performers') or ''))]
        performer_refs = source_performer_refs(contract, connection, actors)
        studio_refs = _refs(contract, connection, "studio", [item.get("studio")])
        for ref in studio_refs:
            ref["has_logo"] = contract.has_logo(ref["name"])
            ref["logo_version"] = contract.logo_version(ref["name"])
        series_refs = _refs(contract, connection, "series", [(source or {}).get("series_name")])
    return {"performers": "、".join(ref["name"] for ref in performer_refs),
            "performer_refs": performer_refs, "studio_refs": studio_refs, "series_refs": series_refs}


def source_performer_refs(contract, connection, actors):
    """详情与发现共用来源身份；头像是否可取不保存签名地址。"""
    refs = []
    for actor in actors:
        matched = _refs(contract, connection, 'performer', [actor.get('name')])
        if not matched:
            continue
        ref = matched[0]
        gender = actor_gender(actor)
        if gender == 'unknown' and ref.get('id'):
            local = connection.execute('SELECT metadata_json FROM entity WHERE id=?', (ref['id'],)).fetchone()
            try:
                metadata = json.loads(local[0] or '{}') if local else {}
                gender = actor_gender(metadata) if isinstance(metadata, dict) else 'unknown'
            except (ValueError, TypeError):
                pass
        if gender == 'male' or any(person['name'] == ref['name'] for person in refs):
            continue
        ref['gender'] = gender
        actor_id = str(actor.get('id') or '')
        if re.fullmatch(r'[A-Za-z0-9]{1,64}', actor_id):
            ref['source_actor_id'] = actor_id
            ref['source_avatar'] = (bool(actor['has_avatar']) if 'has_avatar' in actor
                                    else public_image_url(actor.get('avatar_url')) if 'avatar_url' in actor else True)
        refs.append(ref)
    return refs


def _artwork_fields(contract, code, item, source, *, refresh=False, ambiguous=False):
    from .jav_cover_fetch import is_javdb_image
    source_cover = (source or {}).get('cover_url') or (source or {}).get('thumb_url')
    return {"has_cover": not ambiguous and contract.has_cover(code), "cover_version": contract.cover_version(code),
            "cover_url": '' if ambiguous else discovery_cover_url(item, source or {}),
            "source_image": bool(source_cover and not is_javdb_image(source_cover)),
            "preview_count": min(len(source.get("preview_images") or []), 30),
            **({'preview_video_url': '', 'preview_state': 'unavailable'} if ambiguous else
               _preview_fields(contract, code, source, refresh=refresh)),
            "source_url": '' if ambiguous else "https://javdb.com/v/" + str(source["id"]) if source else item.get("link") or ""}


def _source_fields(source, decisions):
    tags = [str(tag.get("name") or "") if isinstance(tag, dict) else str(tag)
            for tag in source.get("tags", [])]
    tag_refs = []
    for raw in tags:
        label = resolve_genre(raw, decisions)
        if label is None:
            continue
        label = label or raw
        if label and all(ref["name"] != label for ref in tag_refs):
            tag_refs.append({"name": label, "category": tag_cat(label), "source_name": raw})
    return {"duration": source.get("duration"), "score": source.get("score"),
            "summary": source.get("summary") or "", "director": source.get("director_name") or "",
            "publisher": source.get("publisher_name") or "", "tags": [tag for tag in tags if tag],
            "tag_refs": tag_refs,
            "comments_count": int(source.get("comments_count") or 0)}


def w_jav_cover(contract, body) -> dict:
    """详情页「重新匹配封面」：按番号问官方渠道，取到最大一张装进本机封面目录。

    只写封面目录与取景边车，不写账本；同步等到取完，`COVER_SECONDS` 封顶。
    取不到时 `message` 是给人看的原因，不带来源地址。
    """
    from .catalog_rules import is_korean_mib_code
    from .cover_artwork import install_cover
    from .jav_cover_fetch import (
        MIB_NOT_JAV, DeadlineExceeded, NotFound, Unavailable, official_cover,
    )

    code = detail_code(body)
    message = ''
    covered = contract.has_cover(code)
    if is_korean_mib_code(code):
        message = MIB_NOT_JAV
    else:
        try:
            candidate, size, data = official_cover(contract, code, seconds=COVER_SECONDS)
            install_cover(Path(contract.cover_root) / f'{code}.jpg', code, data, size,
                          evidence={"source_url": candidate.url, "source": candidate.source})
            covered = True
        except NotFound:
            message = '官方渠道没有这个番号的封面'
        except Unavailable as error:
            message = f'取不到这个番号的封面：{error}'
        except DeadlineExceeded:
            message = f'{COVER_SECONDS} 秒内没取到这个番号的封面，稍后再试'
        except OSError as error:
            message = f'封面写入失败：{error}'
    contract.cache_bust()
    return {"ok": True, "code": code, "has_cover": covered, "cover_version": contract.cover_version(code),
            "cover_frame": contract.cover_frame(code), "poster_box": contract.poster_box(code),
            "message": '' if covered else message or '没有找到可用的官方封面'}


def w_jav_samples(contract, body) -> dict:
    """详情页「重新匹配样张」：当场按番号问官方站，再退到 javdb，取到就落账本。

    与补样张后继同一条路，只是不排队、不看旧记录；已经有样张的番号不重复联网。
    """
    from . import sample_followup
    code = detail_code(body)
    return sample_followup.refresh_code(contract, code)


#: 来源图片在浏览器里留多久。样张与来源封面落盘后不再刷新；来源头像在服务端按
#: `AVATAR_REFRESH_SECONDS` 换新，浏览器只留一天，换过的图第二天就看得到。
JAV_IMAGE_MAX_AGE = 30 * 86400
JAV_ACTOR_IMAGE_MAX_AGE = 86400


def jav_image(contract, args) -> tuple[bytes, int]:
    """来源图片（样张、来源封面、来源头像）的字节，以及浏览器可以缓存的秒数。

    取过一次就落进远程媒体缓存，再取不出网。取不到抛 `PublicSourceUnavailable` 或
    `RemoteMediaUnavailable`；番号或图号不合法抛 `ValueError`，都在联网之前。
    """
    code = detail_code(args)
    index = str(args.get("image") or "cover")
    if (index != "cover" and not re.fullmatch(r"actor:[A-Za-z0-9]{1,64}", index)
            and (not index.isdigit() or not 0 <= int(index) < 30)):
        raise ValueError("预览图不存在")
    actor = index.startswith("actor:")
    with public_cache_scope(contract.cover_root.parent / 'jav-public'):
        movie = None
        if not actor:
            movie = PUBLIC_API.movie(code)
        key = f"jav:actor:{index.removeprefix('actor:')}" if actor else f"jav:{code}:{movie['id']}:image:{index}"
        body = cache_for(contract).bytes(key,
            lambda: base64.b64decode(_fetch_image(contract, code, index, movie=movie).partition(',')[2], validate=True),
            ttl=AVATAR_REFRESH_SECONDS if actor else None)
    return body, JAV_ACTOR_IMAGE_MAX_AGE if actor else JAV_IMAGE_MAX_AGE


def _fetch_image(contract, code, index, *, movie=None):
    if index.startswith('actor:'):
        stored = PUBLIC_API.peek_movie(code) or {}
        actor = next((person for person in stored.get('actors', [])
                      if isinstance(person, dict) and str(person.get('id')) == index.removeprefix('actor:')), {})
        if public_image_url(actor.get('avatar_image')):
            return PUBLIC_API.image_from_url(actor['avatar_image'])
    return PUBLIC_API.image(code, index, movie=movie)


def _preview_fields(contract, code, source, *, refresh=False):
    from .jav_official_preview import dmm_preview, javdb_preview, prestige_preview

    prestige = ('prestige' in str(source.get('maker_name') or '').casefold()
                or 'プレステージ' in str(source.get('maker_name') or ''))
    provider = 'prestige' if prestige else 'dmm'
    fetch = (lambda: prestige_preview(code, contract.secrets_root)) if prestige else (
        lambda: dmm_preview(code, contract.secrets_root))
    sources = [(provider, fetch), ('javdb', lambda: javdb_preview(code, source.get('id'), contract.secrets_root))]
    url, errors = '', []
    for provider, fetch in sources:
        try:
            result = PUBLIC_API.official_preview(code, fetch, released=source.get('release_date'),
                                                 refresh=refresh, provider=provider,
                                                 **({'source_id': source.get('id')} if provider == 'javdb' else {}))
            url = result['url']
            failure = cache_error(f'preview:{provider}:' + code)
            if failure and not url:
                raise PublicSourceUnavailable(failure)
        except PublicSourceUnavailable as error:
            errors.append(str(error))
        if url:
            break
    if not url:
        url = preview_video_url(source)
        if url and '?' in url:
            try:
                url = preview_video_url(PUBLIC_API.media_movie(code, movie=source)) or url
            except PublicSourceUnavailable as error:
                errors.append(str(error))
    if not url:
        return {'preview_video_url': '', 'preview_state': 'unavailable' if errors else 'missing',
                **({'preview_message': '；'.join(dict.fromkeys(errors))} if errors else {})}
    playlist = url.endswith('.m3u8') or '.m3u8?' in url
    ref = PreviewCache(cache_for(contract)).register(code, url, playlist=playlist,
                                                     media_type='' if playlist else 'video/mp4')
    return {'preview_video_url': f"/jav-preview/{code}/{ref}{'.m3u8' if playlist else ''}", 'preview_state': 'ready'}
