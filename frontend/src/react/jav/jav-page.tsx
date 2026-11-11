import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RiCompassLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { appSettingsStore, javLayout, storeJavLayout, JAV_LAYOUTS, cardRatio, gridLayout } from '@peach/appearance';
import { wireHorizontalScroller } from '../../ui-kit/scroll';
import { javContentSkeleton, javTagSkeleton, JAV_RECOMMENDATION_GRID } from '../../jav-skeleton';
import { errorMessage } from '../../api';
import { Note } from '../components/note';
import { EmptyState } from '../components/empty-state';
import { discoveryKey, fetchDiscoveries, writeJavQuery } from './jav';
import { DiscoveryCard } from './discovery-card';
import { JavHeader } from './jav-header';
import { IndexSearch } from '../index/index-search';
import { FilterGlassRows, FilterPill, GlassPill } from '../components/filter-glass';
import { LibraryShortcuts } from '../library-shortcuts/shortcut-controls';
import { Segments, SortKeys } from '../entity-filter/entity-filter-page';
import { DISCOVERY_SORTS, type DiscoverySort } from './discovery-sorts';

const SEARCH_LABEL = '筛选推荐';

export function JavPage({ readOnly, navigate }: {
  readOnly: boolean; navigate(path: string): void; receipt(message: string): void;
}) {
  const [text, changeText] = useState(() => new URLSearchParams(location.search).get('q') || '');
  const setText = (value: string) => { changeText(value); writeJavQuery({ q: value }) };
  return <div className="flex w-full flex-col gap-6">
    <JavHeader search={<IndexSearch label={SEARCH_LABEL} value={text} onQuery={setText} />} />
    <Explore query={text.trim()} navigate={navigate} clearText={() => setText('')} readOnly={readOnly} />
  </div>;
}

/** 馆藏探索：馆藏里还没看过的作品，按所选字段排序，可按标签与关键词筛。 */
function Explore({ query, navigate, clearText, readOnly }: {
  query: string; navigate(path: string): void; clearText(): void; readOnly: boolean;
}) {
  const params = new URLSearchParams(location.search);
  const [tag, changeTag] = useState(() => params.get('tag') || '');
  const [sort, changeSort] = useState<DiscoverySort>(() => DISCOVERY_SORTS.some(([key]) => key === params.get('sort'))
    ? params.get('sort') as DiscoverySort : 'release_date');
  const [ascending, changeAscending] = useState(() => params.get('dir') === 'asc');
  const setTag = (value: string) => { changeTag(value); writeJavQuery({ tag: value }) };
  const setSort = (value: DiscoverySort) => { changeSort(value); writeJavQuery({ sort: value === 'release_date' ? '' : value }) };
  const setAscending = (value: boolean) => { changeAscending(value); writeJavQuery({ dir: value ? 'asc' : '' }) };
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const rows = section.current?.querySelectorAll('[data-catalog-scroll],[data-catalog-tags],[data-filter-row="bottom"]');
    const scrollers = [...(rows || [])].map(row => wireHorizontalScroller(row, { drag: true }));
    return () => scrollers.forEach(scroller => scroller.destroy());
  }, []);
  const settings = appSettingsStore();
  useSyncExternalStore(settings.subscribe, settings.version, settings.version);
  const layout = javLayout();
  const ratio = cardRatio(gridLayout({ active: true, home: false, portrait: false }));
  const direction = ascending ? 'asc' : 'desc';
  const discoveries = useQuery({ queryKey: discoveryKey(sort, direction), retry: false, refetchOnWindowFocus: false,
    queryFn: ({ signal }) => fetchDiscoveries(signal, { sort, direction }) });
  const all = discoveries.data?.items || [];
  const tags = [...new Set(all.flatMap(item => item.tags || []))];
  const items = all.filter(item => (!tag || item.tags?.includes(tag)) &&
    (!query || [item.code, item.title, item.performers, item.studio, ...(item.tags || []), ...(item.performer_refs || []).map(ref => ref.name)].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  const waiting = discoveries.isPending;
  return <section ref={section} aria-label="馆藏探索" aria-busy={waiting} className="flex min-w-0 flex-col gap-4">
    <FilterGlassRows label="探索筛选与排序" topLabel="标签" attrs={{ 'data-filter-frame': '', 'data-jav-filter': '', 'data-catalog-frame': '' }}
      busy={waiting} topClassName="gap-1.5 overflow-visible" bottomClassName="min-h-12" top={<div data-catalog-scroll="">
      <div data-catalog-tags="" dangerouslySetInnerHTML={waiting ? { __html: javTagSkeleton() } : undefined}>
        {waiting ? null : tags.map(name => <FilterPill key={name} data-catalog-tag={name} data-entity-press="" pressed={tag === name} onPress={() => setTag(tag === name ? '' : name)}>
          {name}<span data-count-badge="">{all.filter(item => item.tags?.includes(name)).length}</span>
        </FilterPill>)}
      </div></div>} bottom={<>
        <span data-catalog-readout="">{waiting ? <span data-skeleton="count" aria-hidden className="relative inline-block h-3.5 w-37.5 rounded-md align-middle skeleton-sheen" /> : `${items.length} 部`}</span>
        <LibraryShortcuts currentHref={() => location.pathname + location.search} />
        {query || tag ? <GlassPill onPress={() => { setTag(''); clearText() }}>清除筛选</GlassPill> : null}
        <span data-entity-sorts="">
        <Segments label="JAV 卡片版式" value={layout} options={JAV_LAYOUTS} onChange={storeJavLayout} />
        <SortKeys sorts={DISCOVERY_SORTS.map(([key, label, ariaLabel]) => ({ key, label, ariaLabel,
          pressed: key === sort, dir: direction }))} onSort={key => {
          if (key === sort) setAscending(!ascending); else { setSort(key as DiscoverySort); setAscending(key === 'code') }
        }} /></span>
      </>} />
    {waiting ? <div role="status" aria-label="正在读取探索结果" dangerouslySetInnerHTML={{ __html: javContentSkeleton(layout) }} /> : null}
    {discoveries.error ? <Note tone="error" title="探索未取得">{errorMessage(discoveries.error)}</Note> : null}
    {!waiting && !discoveries.error && !items.length ? <EmptyState icon={RiCompassLine} title={query || tag ? '没有符合条件的作品' : '暂无待探索的作品'}
      actions={query || tag ? <Button variant="primary" size="small" onClick={() => { clearText(); changeTag(''); writeJavQuery({ q: '', tag: '' }) }}>清除筛选</Button> : null}>
      {query || tag ? '清除筛选后查看其他作品。' : '馆藏里还没有看过的作品会出现在这里。'}
    </EmptyState> : null}
    <div data-media-grid="" className={JAV_RECOMMENDATION_GRID} style={{ '--card-ratio': ratio } as CSSProperties}>
      {items.map(item => <DiscoveryCard key={item.id} item={item} layout={layout} javImage={settings.value.javImage} readOnly={readOnly}
        navigate={navigate} tag={tag} onTag={setTag} />)}
    </div>
  </section>;
}
