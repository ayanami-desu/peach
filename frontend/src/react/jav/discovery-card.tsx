import { useState, useSyncExternalStore } from 'react';
import { entityPath } from '@peach/legacy/core';
import { RiExternalLinkLine } from '@remixicon/react';
import { Button, ButtonLink } from '@/components/base/buttons/button';
import { gaugeHtml } from '@peach/legacy/ui';
import { relayoutCovers } from '../../card-art/framing';
import { textLang } from '../../core/text-lang';
import { ArtSlot } from '../components/art-slot';
import { useAction } from '../settings/use-action';
import { DiscoveryFaces } from './discovery-faces';
import { coverArrived, coverFetching, discoveryArtwork, fetchCoverNow, type Discovery } from './jav';

const COVER_BOX = 'relative inline-grid place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default';

/** 还没有封面的那一格：当场取的时候画不定进度圆环，取过没取到的给「立即重试」，
 *  都是当场取这一部（`fetchCoverNow`），取到就把卡换成本机那张。 */
function CoverWait({ item, readOnly }: { item: Discovery; readOnly: boolean }) {
  const action = useAction();
  const [reason, setReason] = useState('');
  useSyncExternalStore(coverFetching.subscribe, coverFetching.revision);
  if (coverFetching.has(item.code)) return <span data-cover-state="fetching" className="flex max-w-full flex-col items-center gap-1.5 px-4 text-center">
    <span dangerouslySetInnerHTML={{ __html: gaugeHtml('正在取封面', 0, 1, { indeterminate: true }) }} />
    <span data-media-nopic="">抓取中</span>
  </span>;
  const retry = () => { void action.run('cover', signal => fetchCoverNow(item.code, signal), result => {
    if (result.has_cover) coverArrived(item.code, result); else setReason(result.message || '没有找到可用的官方封面');
  }) };
  const why = action.error || reason;
  return <div data-cover-state="missing" className="flex max-w-full flex-col items-center gap-1.5 px-4 text-center">
    <span data-media-nopic="">无封面</span>
    {why ? <span className="line-clamp-3 text-caption-1-regular text-text-secondary" title={why}>{why}</span> : null}
    {readOnly ? null : <Button size="small" variant="secondary" className="mt-1" onClick={retry}>
      立即重试</Button>}
  </div>;
}

/** 馆藏探索的卡片：封面、出演、发行日、标签与作品来源。 */
export function DiscoveryCard({ item, layout, javImage, readOnly, navigate, tag, onTag }: {
  item: Discovery; layout: 'big' | 'small'; javImage: unknown; readOnly: boolean; navigate(path: string): void;
  tag: string; onTag(tag: string): void;
}) {
  const performers = item.performer_refs?.length ? item.performer_refs.map(person => person.name).join('、') : item.performers;
  const artwork = discoveryArtwork(item, layout, javImage);
  const href = item.asset_id ? `/assets/${item.asset_id}` : `/works/${encodeURIComponent(item.code)}`;
  return <article data-media-card="" data-jav-card="" onClick={event => {
    if (!(event.target as HTMLElement).closest('a,button,input')) navigate(href);
  }}>
    {artwork ? <a href={href} aria-label={`查看 ${item.code} 详情`}
      onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) { event.preventDefault(); navigate(href) } }}
      data-media-pic="" data-jav-cover-box="" className={COVER_BOX}>
      <ArtSlot artwork={{ kind: 'cover', html: artwork }} identity={discoveryArtwork(item, 'small', javImage)}
        relayout={root => relayoutCovers(root, layout)} />
    </a>
      // 没有图时这一格放状态与动作键，不能是链接：键放在 `<a>` 里一按就跟着跳进详情。点空处仍由卡片自己进详情。
      : <div data-media-pic="" data-jav-cover-box="" className={COVER_BOX}><CoverWait item={item} readOnly={readOnly} /></div>}
    <div data-media-meta="">
      <DiscoveryFaces item={item} />
      <div data-media-text="">
        <h3 data-jav-title="" data-media-title="" title={`${item.code} · ${item.title || '标题未取得'}`}><b>{item.code}</b> {item.title ? <span lang={textLang(item.title)}>{item.title}</span> : '标题未取得'}</h3>
        <div data-media-byline="">
          {item.performer_refs?.[0]?.id ? <a data-media-who="" href={entityPath('performer', item.performer_refs[0].name)} title={performers}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-user-round" /></svg><span>{item.performer_refs[0].name}</span></a>
            : <span data-media-who="" title={performers}><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-user-round" /></svg><span>{item.performer_refs?.[0]?.name || performers}</span></span>}
          {(item.performer_refs?.length || 0) > 1 ? <span data-media-who-more="">等 {item.performer_refs!.length} 人</span> : null}
          {item.release_date ? <span data-media-facts=""><time data-media-release="" dateTime={item.release_date}><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-calendar" /></svg>{item.release_date}</time></span> : null}
        </div>
        <div data-jav-tags="" data-media-tags="">
          {(item.tags || []).slice(0, 4).map(name =>
            <button type="button" data-media-tag="" key={name} aria-pressed={tag === name} onClick={() => onTag(tag === name ? '' : name)}>{name}</button>)}
        </div>
      </div>
    </div>
    {item.link ? <div data-jav-actions="" data-has-source="" className="flex flex-wrap gap-2">
      <ButtonLink data-button-link="" data-jav-source="" variant="secondary" size="medium"
        aria-label="作品来源" title="作品来源" trailingIcon={RiExternalLinkLine}
        href={item.link} target="_blank" rel="noopener noreferrer">作品来源</ButtonLink>
    </div> : null}
  </article>;
}
