/* 高清版目标页：数据库里标记为「还该有更好一版」的那些作品。
 *
 * 一屏回答两件事：还欠多少部、每一部欠在哪里。所以卡片上除了标题就只有来源、时长、
 * 体积和判定原因——决定要不要去找更好一版，看的就是这几项。
 *
 * 番号标题与来源徽标由遗留层以 HTML 字符串传进来：它们是全站语义契约的唯一实现，
 * 在这里重写一份就会漂。时长、体积、来源名走 `src/core/index.ts` 同一套格式化口径，同理。 */
import { RiSparklingLine } from '@remixicon/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { LOC, fmtDur, fmtSize } from '@peach/legacy/core';

import { Button } from '@/components/base/buttons/button';

import { errorMessage } from '../../api';
import { t } from '../../i18n';
import type { QualityGoalsProps } from '../bundle';
import { useCatalogView } from '../catalog-grid/catalog-view';
import { CatalogViewToggle } from '../catalog-grid/catalog-view-toggle';
import { cardClass } from '../components/card';
import { CollectionSummary } from '../components/collection-summary';
import { ColumnFilterChips } from '../components/column-filter-chips';
import { DataTable, type DataColumn } from '../components/data-table';
import { EmptyState } from '../components/empty-state';
import { useLibraryFilterOptions } from '../components/library-filter-options';
import { LoadingDots } from '../components/loading-dots';
import { Note } from '../components/note';
import { Page } from '../components/page';
import { providerIcon } from '../components/source-label';
import type { TableFilters } from '../components/use-table-filters';
import {
  fetchQualityGoals, previewUrl, QUALITY_GOALS_KEY, type QualityGoal,
} from './quality-goals';

/** 一部待升级的作品一张卡。 */
function GoalCard({ item, openItem, javTitleHtml, javDisplayName, srcBadge }: { item: QualityGoal } & QualityGoalsProps) {
  const open = () => openItem(item.id);
  return (
    <li data-goal-id={item.id}
      className={cardClass({ padding: 'none', className: 'flex flex-col gap-3 p-3' })}>
      <div className="flex min-w-0 gap-4">
        {/* 居中那句占位文字用 `inline-grid`：旧样式表里 `.grid` 是海报墙那条带列宽和
            间距的规则，排在 `peach-app.css` 后面会赢。这颗按钮是 flex 子项，行内格
            会被块级化，算出来仍是 `display:grid`。 */}
        <button type="button" onClick={open} aria-label={`打开 ${javDisplayName(item)}`}
          className="relative inline-grid w-card-cover shrink-0 self-start aspect-card-cover cursor-pointer place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default">
          {/* 图片取不到时（onError 把 img 摘掉）露出来的就是这句。 */}
          <span className="text-caption-1-regular text-text-secondary">暂无预览</span>
          <img src={previewUrl(item)} alt="" loading="lazy"
            onError={(event) => event.currentTarget.remove()}
            className="absolute inset-0 size-full object-contain" />
        </button>
        <div className="flex min-w-0 flex-col gap-1.5">
          {/* 标题从番号读起，长了折到第二行再截尾：中段截断会把番号和片名一起切掉。 */}
          <h3 className="text-headline-medium text-text-primary">
            <button type="button" onClick={open} title={javDisplayName(item)}
              className="line-clamp-2 w-full cursor-pointer text-left wrap-anywhere"
              dangerouslySetInnerHTML={{ __html: javTitleHtml(item) }} />
          </h3>
          <p className="flex flex-wrap items-center gap-2 text-body-2-regular text-text-secondary">
            {/* 插原始 HTML 要有个宿主元素，而来源徽标在遗留版本里是这个 flex 容器的直接
                子项。`contents` 让宿主从布局里消失，徽标的对齐与间距保持不变。 */}
            <span className="contents" dangerouslySetInnerHTML={{ __html: srcBadge(item.location) }} />
            <span>{LOC[item.location] ?? item.location}</span>
            <span>{fmtDur(item.duration)}</span>
            <span>{Number(item.size) > 0 ? fmtSize(Number(item.size)) : '大小未知'}</span>
          </p>
          {item.reason
            ? <p className="border-t border-separator-border pt-3 text-body-2-regular text-text-secondary wrap-anywhere">
                {item.reason}
              </p>
            : null}
        </div>
      </div>
      <footer className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" size="small" onClick={open}>{t('cleanup:qualityGoals.viewVersions')}</Button>
      </footer>
    </li>
  );
}

export function QualityGoalsPage(props: QualityGoalsProps) {
  const view = useCatalogView();
  const [filters, setFilters] = useState<TableFilters>({});
  const encoded = JSON.stringify(filters);
  const filtering = encoded !== '{}';
  const goals = useQuery({
    queryKey: filtering ? [...QUALITY_GOALS_KEY, encoded] : QUALITY_GOALS_KEY,
    queryFn: ({ signal }) => fetchQualityGoals(signal, filtering ? filters : undefined),
    placeholderData: previous => previous,
  });
  const libraries = useLibraryFilterOptions(view === 'list' || filters.library !== undefined);
  const data = goals.data;
  if (!data && !filtering && view !== 'list') {
    return (
      <Page>
        <Note tone="error" title="高清版目标读取失败">{goals.error ? errorMessage(goals.error) : '未取得高清版目标，请刷新页面重试。'}</Note>
      </Page>
    );
  }
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const title = t('cleanup:qualityGoals.summary');
  if (data && !goals.isPlaceholderData && !items.length && view === 'cards' && !filtering) {
    return (
      <Page>
        <EmptyState icon={RiSparklingLine} title="没有标记中的高清版目标">
          现有版本都已满足条件，或还没有加入追踪。
        </EmptyState>
      </Page>
    );
  }
  const facetLabel = (column: string, id: string) => {
    if (id === 'none') return t('cleanup:shared.none');
    if (column === 'library') return libraries.get(id)?.label || id;
    if (column === 'source') return LOC[id] ?? id;
    return id;
  };
  const columns: DataColumn<QualityGoal>[] = view === 'list' || filtering ? [
    { id: 'name', label: t('cleanup:shared.video'), width: 300, min: 240,
      render: item => <button type="button" title={props.javDisplayName(item)}
        className="line-clamp-2 w-full cursor-pointer text-left wrap-anywhere"
        onClick={() => props.openItem(item.id)} dangerouslySetInnerHTML={{ __html: props.javTitleHtml(item) }} /> },
    { id: 'library', label: t('cleanup:shared.library'), width: 112,
      filter: { values: item => item.library_id || 'none',
        option: id => libraries.get(id) ?? { label: facetLabel('library', id) } },
      render: item => facetLabel('library', item.library_id || 'none') },
    { id: 'source', label: t('cleanup:shared.storage'), width: 112,
      filter: { values: item => item.location || 'none', option: id => {
        const ProviderIcon = providerIcon(id);
        return { label: facetLabel('source', id), leading: id !== 'none' && <ProviderIcon /> };
      } },
      render: item => facetLabel('source', item.location || 'none') },
    { id: 'dur', label: t('cleanup:shared.duration'), width: 112, value: item => item.duration ?? 0,
      filter: { range: 'duration', value: item => item.duration || null },
      render: item => fmtDur(item.duration) },
    { id: 'size', label: t('cleanup:shared.size'), width: 112, value: item => item.size ?? 0,
      filter: { range: 'size', value: item => item.size },
      render: item => Number(item.size) > 0 ? fmtSize(Number(item.size)) : t('cleanup:junk.unknownSize') },
    { id: 'reason', label: t('cleanup:qualityGoals.listReason'), width: 180, min: 140,
      filter: { values: item => (item.reason || '').split('/').map(tag => tag.trim()).filter(Boolean),
        option: id => ({ label: facetLabel('reason', id) }) },
      render: item => item.reason || t('cleanup:shared.none') },
    { id: 'actions', label: t('cleanup:shared.actions'), width: 128,
      render: item => <Button variant="secondary" size="small" onClick={() => props.openItem(item.id)}>
        {t('cleanup:qualityGoals.viewVersions')}
      </Button> },
  ] : [];
  return (
    <Page>
      {/* 总数取服务端的 `total` 而不是这一页的条数：`limit` 截断时两者不是一个数，
          而这一行要回答的是「一共还欠多少部」。 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {data ? <CollectionSummary label={title} figure={t('cleanup:qualityGoals.count', { count: total })} flush /> : null}
        <CatalogViewToggle />
      </div>
      {view === 'cards' && filtering ? <div className="mb-4"><ColumnFilterChips filters={filters}
        columns={columns.map(({ id, label, filter }) => ({ id, label, range: filter && 'range' in filter ? filter.range : undefined }))}
        valueLabel={facetLabel} onRemove={id => setFilters(current => ({ ...current, [id]: undefined }))} /></div> : null}
      {goals.isError ? <Note tone="error"
        action={<Button variant="secondary" size="small" onClick={() => void goals.refetch()}>{t('cleanup:shared.retry')}</Button>}>
        {errorMessage(goals.error)}
      </Note> : null}
      {view === 'list'
        ? <DataTable label={title} items={items} columns={columns} rowId={item => String(item.id)} rowLabel={props.javDisplayName}
          panel={false} busy={goals.isFetching} filters={{ values: filters, facets: data?.column_facets ?? {}, onChange: setFilters }} />
        : goals.isPlaceholderData ? <LoadingDots label={t('cleanup:shared.loadingTable')} />
          : data && !items.length ? <EmptyState icon={RiSparklingLine} title={t('cleanup:shared.noMatches')}>
              {t('cleanup:shared.clearFiltersHint')}
            </EmptyState>
            : <ul className="card-grid-cover gap-5">
              {items.map((item) => <GoalCard key={item.id} item={item} {...props} />)}
            </ul>}
      {/* 列表只取前 200 部；总数比这多时说清楚这一页不是全部。 */}
      {!goals.isPlaceholderData && total > items.length
        ? <p className="mt-6 text-center text-caption-1-regular text-text-secondary">
            {`显示前 ${items.length.toLocaleString()} 部，共 ${total.toLocaleString()} 部。`}
          </p>
        : null}
    </Page>
  );
}
