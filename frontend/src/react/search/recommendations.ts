import { cardIdentity, entityAvatar, type FaceRef, type IdentityItem } from '@peach/card-art';
import { entityDisplayName } from '../../core/entity-names';
import type { Discovery } from '../jav/jav';
import type { Recommendations, SuggestCard, SuggestGroup, SuggestItem } from './search';

type Request = (url: string) => Promise<any>;
type Latest = { id: number; code: string; release_date: string };

/** 推荐栏的分组与次序固定：还没取到的那组照样占着位置（`pending`），取到一组填一组，栏不改版式。
 *  `size` 是一页摆几条：人三行、作品一排五格。 */
const GROUPS = [
  { kind: 'performer', label: '艺人与新作', href: '/performers', action: '全部艺人', size: 3 },
  { kind: 'asset', label: '作品推荐', href: '/', action: '全部作品', size: 5 },
  { kind: 'jav', label: 'JAV 推荐', href: '/jav', action: '探索 JAV', size: 5 },
] as const;

/** 一组都还没取到时的推荐栏：版式与取齐之后相同。 */
export function pendingRecommendations(): SuggestGroup[] {
  return GROUPS.map(group => ({ ...group, items: [], pending: true }));
}

/** 今年的日期去掉年份，往年的留着，同作品卡上的写法。 */
const day = (date: string) => date.startsWith(String(new Date().getFullYear())) ? date.slice(5, 10) : date.slice(0, 10);

/** 署名只写第一位，共演再给总人数，同作品卡。 */
const byline = (names: string[], total = names.length) => total > 1 ? `${names[0]} 等 ${total} 人` : names[0] || '';

/** 空搜索那一栏：一个请求取齐（`/api/search/recommendations`），在这里照各组的口径拼。某一份服务端
 *  没取到就是 null，只缺那一组。 */
export async function searchRecommendations(request: Request): Promise<Recommendations> {
  const bundle = await request('/api/search/recommendations') as {
    items?: { items?: SuggestCard[] } | null; jav?: { items?: Discovery[] } | null;
    latest?: Record<string, Latest>; words?: string[];
  };
  const work = (card: SuggestCard, href: string | undefined, who: string, whoAvatarHtml = ''): SuggestItem => ({
    value: String(card.code || card.display_title || card.title || card.name || '未命名作品'),
    id: card.id, code: card.code, title: String(card.display_title || card.title || ''),
    who, whoAvatarHtml, card, href,
  });
  const library = (card: SuggestCard) => {
    const { kind, name, coStarred, refs, total } = cardIdentity(card as IdentityItem);
    if (!kind) return work(card, undefined, '');
    const ref = kind === 'performer' ? refs[0] : (card as IdentityItem).creator_entity;
    const shown = entityDisplayName(kind, name, ref?.id);
    return work(card, undefined, coStarred ? byline([shown], total) : shown, entityAvatar(name, ref ?? null, kind));
  };
  const discovered = (card: Discovery, href: string) => {
    const refs = card.performer_refs || [];
    const names = refs.length ? refs.map(ref => ref.name)
      : String(card.performers || '').split(/[,，、;/]/).map(name => name.trim()).filter(Boolean);
    const avatar = names[0] ? entityAvatar(names[0], (refs[0] as FaceRef | undefined) ?? null, 'performer') : '';
    return work(card as unknown as SuggestCard, href, byline(names), avatar);
  };
  const pools: Record<string, SuggestItem[] | null> = {};
  pools.asset = bundle.items ? (bundle.items.items || []).map(library) : null;

  const jav: Discovery[] | null = bundle.jav ? bundle.jav.items || [] : null;
  pools.jav = jav && jav.map(card => discovered(card, `/assets/${card.asset_id || card.id}`));
  const people = new Map<string, SuggestItem>();
  for (const card of jav || []) {
    for (const ref of card.performer_refs || []) {
      if (!ref.id || people.has(ref.name)) continue;
      const found = bundle.latest?.[String(ref.id)];
      people.set(ref.name, { value: ref.name, entity_id: ref.id, has_image: ref.has_image,
        href: `/performers/${ref.id}`,
        image_version: ref.image_version, avatar_focus: ref.avatar_focus, rep: ref.has_avatar ? ref.rep : null,
        works: [card as unknown as SuggestCard],
        subtitle: found ? `最新作 ${found.code || '无番号'} · ${day(found.release_date)}` : '最新作未取得',
      });
    }
  }
  pools.performer = jav && [...people.values()];

  const groups = GROUPS.map(group => {
    const pool = pools[group.kind] ?? [];
    return { ...group, items: pool.slice(0, group.size), pool, offset: 0 };
  });
  return { groups, words: (bundle.words || []).map(String) };
}
