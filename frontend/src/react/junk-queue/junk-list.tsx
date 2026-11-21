import { fmtSize } from '@peach/legacy/core';
import { t } from '../../i18n';
import { ColumnFilterChips } from '../components/column-filter-chips';
import { DataTable, type DataColumn } from '../components/data-table';
import { useLibraryFilterOptions } from '../components/library-filter-options';
import type { RemoteTableFilters } from '../components/use-table-filters';
import { JunkGlyph, JunkItemActions, junkPicking } from './junk-card';
import { junkKindMeta, type JunkItem, type JunkQueueProps } from './junk-queue';

export function JunkList({ items, props, list, busy, filters }: {
  items: JunkItem[];
  props: JunkQueueProps;
  list: boolean;
  busy: boolean;
  filters: RemoteTableFilters;
}) {
  const { actions, selectMode, selected, view } = props;
  const libraries = useLibraryFilterOptions(list || filters.values.library !== undefined);
  const filtered = Object.values(filters.values).some(value => value !== undefined);
  if (!list && !filtered) return null;
  const facetLabel = (column: string, id: string): string => {
    if (id === 'none') return t('cleanup:shared.none');
    if (column === 'library') return libraries.get(id)?.label ?? id;
    if (column === 'kind') return junkKindMeta({ id: 0, junk_kind: id })[0];
    if (column === 'why') {
      const reason: unknown = JSON.parse(id);
      if (reason && typeof reason === 'object' && 'text' in reason && typeof reason.text === 'string') return reason.text;
    }
    return id;
  };
  const columns: DataColumn<JunkItem>[] = [
    { id: 'name', label: t('cleanup:shared.files'), width: 300, min: 240, render: item => {
      const name = item.name || t('cleanup:junk.untitled');
      return item.junk_kind === 'video' || item.junk_kind === 'image' ? <button type="button" title={name} data-junk-open=""
        className="block min-w-0 max-w-full cursor-pointer truncate text-left"
        onClick={event => {
          if (junkPicking(selectMode, event)) actions.toggleSelection(item.id, event.shiftKey);
          else actions.open(item, event.currentTarget.closest('tr') ?? event.currentTarget);
        }}>{name}</button> : <span className="block truncate" title={name}>{name}</span>;
    } },
    { id: 'library', label: t('cleanup:shared.library'), width: 112,
      filter: { values: item => item.library_id || 'none',
        option: id => libraries.get(id) ?? { label: facetLabel('library', id) } },
      render: item => facetLabel('library', item.library_id || 'none') },
    { id: 'kind', label: t('cleanup:shared.type'), width: 112,
      filter: { values: item => item.junk_kind || 'other', option: id => {
        const [label, glyph] = junkKindMeta({ id: 0, junk_kind: id });
        return { label, leading: <span className="inline-flex size-4 shrink-0 [&>svg]:size-full [&>svg]:fill-none [&>svg]:stroke-current"><JunkGlyph name={glyph} /></span> };
      } },
      render: item => junkKindMeta(item)[0] },
    { id: 'why', label: t('cleanup:junk.listReason'), width: 220, min: 160,
      filter: { values: item => item.why_parts?.map(part => JSON.stringify(part)) ?? [],
        option: id => ({ label: facetLabel('why', id) }) },
      render: item => item.why || t('cleanup:shared.none') },
    { id: 'size', label: t('cleanup:shared.size'), width: 112, value: item => item.size ?? 0,
      filter: { range: 'size', value: item => item.size },
      render: item => Number(item.size) > 0 ? fmtSize(Number(item.size)) : t('cleanup:junk.unknownSize') },
    { id: 'actions', label: t('cleanup:shared.actions'), width: 320, min: 280,
      render: item => <JunkItemActions item={item} view={view} actions={actions} disabled={selectMode} compact /> },
  ];
  return <>
    {!list && filtered ? <div className="mb-4">
      <ColumnFilterChips filters={filters.values}
        columns={columns.map(({ id, label, filter }) => ({ id, label, range: filter && 'range' in filter ? filter.range : undefined }))}
        valueLabel={facetLabel} onRemove={id => filters.onChange({ ...filters.values, [id]: undefined })} />
    </div> : null}
    {list ? <div data-junk-list="" data-select-mode={selectMode ? '' : undefined}>
      <DataTable panel={false} label={t('cleanup:junk.categories')} items={items} columns={columns}
        rowId={item => String(item.id)} rowLabel={item => item.name || t('cleanup:junk.untitled')}
        rowAttributes={item => ({ 'data-catalog-row': '', 'data-id': item.id })}
        selected={selectMode ? Array.from(selected, String) : undefined} onSelected={selectMode ? ids => {
          const next = new Set(ids.map(Number));
          for (const item of items) if (next.has(item.id) !== selected.has(item.id)) actions.toggleSelection(item.id, false);
        } : undefined} filters={filters} busy={busy} />
    </div> : null}
  </>;
}
