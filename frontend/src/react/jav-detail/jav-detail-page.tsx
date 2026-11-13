import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RiExternalLinkLine } from '@remixicon/react';
import { entityPath, icon } from '@peach/legacy/core';
import { tagLabel } from '@peach/legacy/tags';
import { errorMessage } from '../../api';
import { textLang } from '../../core/text-lang';
import { Button, ButtonLink } from '@/components/base/buttons/button';
import { Note } from '../components/note';
import { RetryNote } from '../components/grid-reveal';
import { IdentityCell, IdentitySeries } from '../components/identity-cell';
import { SourceAvatar } from '../components/source-avatar';
import { SourcePicture as JavPicture } from '../components/source-picture';
import { MediaCarousel } from '../components/media-carousel';
import { RatingStars } from '../components/rating-stars';
import { CollapseChevron } from '../components/collapse-region';
import { useFoldedTitle } from '../components/folded-title';
import { busyProps } from '../settings/use-action';
import { queryClient } from '../query';
import { fetchJavDetail, javDetailKey, type JavDetail, type JavDetailProps, type JavEntityRef } from './jav-detail';

export function JavDetailPage(props: JavDetailProps) {
  const refresh = useRef(false);
  const result = useQuery({ queryKey: javDetailKey(props.code), queryFn: ({ signal }) => {
    const forced = refresh.current;
    refresh.current = false;
    return fetchJavDetail(props.code, signal, forced);
  }, staleTime: 6 * 3600_000 });
  const retry = () => { refresh.current = true; void result.refetch() };
  return <div data-jav-detail="" data-item-detail="" data-stage-grid="">
    {result.data ? <Work key={props.code} {...props} item={result.data} retry={retry} retrying={result.isFetching} /> : <div data-jav-failure="">
      <Close close={props.actions.close} />
      {result.error ? <RetryNote message={errorMessage(result.error)} onRetry={retry} /> : null}
    </div>}
  </div>;
}

const Close = ({ close }: { close(): void }) => <button type="button" data-stage-close="" id="closeStage"
  aria-label="关闭" title="关闭" onClick={close} dangerouslySetInnerHTML={{ __html: icon('x') }} />;

function Work({ item, actions, retry, retrying }: JavDetailProps & { item: JavDetail; retry(): void; retrying: boolean }) {
  useEffect(() => { actions.canonicalCode?.(item.code) }, [actions, item.code]);
  useEffect(() => { if (item.state === 'ready') void queryClient.invalidateQueries({ queryKey: ['jav-discoveries'] }) }, [item.code, item.state]);
  const [preview, setPreview] = useState(-1);
  const media = [{ index: -1, label: '封面' }, ...Array.from({ length: item.preview_count }, (_, index) => ({ index, label: `预览 ${index + 1}` }))];
  return <>
    <div data-stage-media="" data-jav-art="">
      <Close close={actions.close} />
      <JavPicture key={item.code} item={item} image={preview === -1 ? 'cover' : String(preview)} />
      <MediaCarousel items={media} position={Math.max(0, media.findIndex(entry => entry.index === preview))} onSelect={setPreview}
        below renderThumbnail={entry => <JavPicture item={item} image={entry.index < 0 ? 'cover' : String(entry.index)} thumbnail />} />
    </div>
    <aside data-stage-side=""><div data-stage-side-content="" data-jav-info="">
      <JavTitle item={item} />
      {Number(item.score) > 0 ? <SourceRating score={Number(item.score)} /> : null}
      <div className="mono" data-stage-meta="" data-reveal-line="">
        <Spec glyph="calendar" label="发行日期" value={item.release_date} />
        <Spec glyph="clock" label="时长" value={item.duration ? `${item.duration} 分钟` : undefined} />
      </div>
      <JavIdentity item={item} navigate={actions.navigate} />
      <div data-jav-facts="">
        <Spec glyph="briefcase" label="发行商" value={item.publisher} />
        <Spec glyph="clapperboard" label="导演" value={item.director} />
      </div>
      {(item.tag_refs?.length ?? item.tags.length) > 0 ? <div data-stage-tags="" data-detail-tags="" data-jav-tags="">{(item.tag_refs || item.tags.map(name => ({ name, category: 'general', source_name: name }))).map(tag =>
        <span data-detail-tag="" data-tag-cat={tag.category} key={tag.name}><button type="button" data-tag={tag.name}
          title={tagLabel(tag.name)} onClick={() => actions.openTag(tag.name)}>{tagLabel(tag.name)}</button></span>)}</div> : null}
      {item.summary ? <p data-jav-summary="" data-long-text="" lang={textLang(item.summary)}>{item.summary}</p> : null}
      {item.message ? <Note tone="neutral" action={<Button variant="secondary" {...busyProps(retrying)} onClick={retry}>立即重试</Button>}>{item.message}</Note> : null}
      <div data-jav-actions="">
        {item.source_url ? <ButtonLink data-button-link="" variant="secondary" trailingIcon={RiExternalLinkLine}
          href={item.source_url} target="_blank" rel="noopener noreferrer">作品来源</ButtonLink> : null}
      </div>
    </div></aside>
  </>;
}

const Glyph = ({ name }: { name: string }) => <span className="contents" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon(name) }} />;
const Spec = ({ glyph, label, value }: { glyph: string; label: string; value?: string }) => value ? <span data-spec-item="" title={label}><Glyph name={glyph} /><span>{value}</span></span> : null;

function JavTitle({ item }: { item: JavDetail }) {
  const { text, expanded, foldable, toggle } = useFoldedTitle(item.title);
  const title = item.title === item.code ? '' : item.title;
  return <div data-item-title=""><h1 data-stage-title="" data-title-line="" data-reveal-line=""><span ref={text} data-detail-title=""
    data-expanded={expanded ? '' : undefined} data-foldable={foldable ? '' : undefined}
    onClick={() => { if (foldable && !String(getSelection() || '')) toggle() }}><b>{item.code}</b>{title ? <>{' '}<span lang={textLang(title)}>{title}</span></> : null}</span></h1>
    <span data-title-tools=""><button type="button" data-title-fold="" hidden={!foldable} aria-expanded={expanded}
      aria-label={expanded ? '收起标题' : '展开标题'} title={expanded ? '收起标题' : '展开完整标题'} onClick={toggle}><CollapseChevron /></button></span>
  </div>;
}

function SourceRating({ score }: { score: number }) {
  return <div data-item-rating="" data-jav-rating="" role="img" aria-label={`JavDB 评分 ${score} / 5`}>
    <RatingStars value={score} />
    <span data-rating-value="">{score.toFixed(1)} / 5</span>
  </div>;
}

function JavIdentity({ item, navigate }: { item: JavDetail; navigate(path: string): void }) {
  const onOpen = (kind: string, name: string) => navigate(entityPath(kind, name));
  const group = (kind: string, label: string, refs: JavEntityRef[], gender?: string) => refs.length ? <section data-id-group={kind} data-id-gender={gender}>
    <h5 data-id-label="">{label}</h5><div data-id-row="">{refs.map(person => <IdentityCell key={person.name} kind={kind}
      person={{ ...person, id: person.id ?? null }} onOpen={onOpen}
      face={kind === 'performer' && !person.has_image && !person.has_avatar && person.source_avatar && person.source_actor_id
        ? <SourceAvatar code={item.code} person={person} detail /> : undefined} />)}</div>
  </section> : null;
  return <div data-item-identity=""><div data-identity-primary="">
    {group('performer', '女优', item.performer_refs.filter(person => person.gender === 'female'), 'female')}
    {group('performer', '出演者', item.performer_refs.filter(person => !person.gender || person.gender === 'unknown'), 'unknown')}
    {group('studio', '厂牌', item.studio_refs)}</div>
    <IdentitySeries people={item.series_refs.map(person => ({ ...person, id: person.id ?? null }))} onOpen={onOpen} /></div>;
}

