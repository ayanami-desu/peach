import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RiFileListLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { LinkButton } from '@/components/base/buttons/link-button';
import { fmtDur, fmtSize, LOC } from '@peach/legacy/core';
import { errorMessage } from '../../api';
import { t } from '../../i18n';
import { DataTable, type DataColumn } from '../components/data-table';
import { EmptyState } from '../components/empty-state';
import { useLibraryFilterOptions } from '../components/library-filter-options';
import { Note } from '../components/note';
import type { TableFilters } from '../components/use-table-filters';
import { Disclosure, Stack } from '../settings/section';
import { busyProps, useAction } from '../settings/use-action';
import { DIAGNOSTICS_KEY, fetchDiagnosticLibraryGroup, type LibraryGroup, type LibraryItem } from './diagnostics';

const identity = (item: LibraryItem) => item.title || item.name || item.code || `作品 #${item.id}`;
const listText = (items: LibraryItem[], libraryName: (item: LibraryItem) => string) => [
  ['作品', '番号', '文件名', '媒体库', '路径', '时长（秒）', '大小（字节）'],
  ...items.map(item => [identity(item), item.code ?? '', item.name, libraryName(item),
    item.path, item.duration ?? '', item.size ?? '']),
].map(row => row.map(value => String(value ?? '').replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');

export function HealthList({ group: original, groupKey, revision, openItem, receipt }: {
  group: LibraryGroup; groupKey: string; revision: number; openItem(id: number): void; receipt(message: string): void;
}) {
  const [filters, setFilters] = useState<TableFilters>({});
  const encoded = JSON.stringify(filters);
  const filtering = encoded !== '{}';
  const query = useQuery({
    queryKey: [...DIAGNOSTICS_KEY, 'library', groupKey, revision, encoded],
    queryFn: ({ signal }) => fetchDiagnosticLibraryGroup(groupKey, encoded, signal),
    enabled: filtering,
    placeholderData: previous => previous,
  });
  const group = (filtering ? query.data : undefined) ?? original;
  const items = filtering ? query.data?.items ?? [] : original.items;
  const busy = filtering && query.isFetching;
  const libraries = useLibraryFilterOptions(original.items.length > 0);
  const libraryName = (item: LibraryItem) =>
    libraries.get(item.library_id || '')?.label || LOC[item.location] || item.location;
  const action = useAction();
  const [selected, setSelected] = useState<string[]>([]);
  const copy = (items: LibraryItem[]) => void action.run('copy',
    () => navigator.clipboard.writeText(listText(items, libraryName)), () => receipt('已复制清单'));
  const columns: DataColumn<LibraryItem>[] = [
    { id: 'title', label: '作品', value: identity, render: item => <span className="flex min-w-0 flex-col gap-1">
      <LinkButton variant="primary" className="justify-start whitespace-normal text-left"
        onClick={() => openItem(item.id)}>{identity(item)}</LinkButton>
      {item.name && item.name !== identity(item)
        ? <span data-middle-truncate title={item.name} className="block min-w-0 text-caption-1-regular text-text-secondary">{item.name}</span> : null}
    </span> },
    { id: 'code', label: '番号', width: 144, value: item => item.code || '',
      render: item => <span className="whitespace-nowrap">{item.code || '未识别'}</span> },
    { id: 'location', label: t('cleanup:shared.library'), width: 128, value: libraryName,
      filter: { values: item => item.library_id || 'none',
        option: id => libraries.get(id) ?? { label: id === 'none' ? t('cleanup:shared.none') : id } },
      render: item => libraryName(item) || '未取得' },
    { id: 'path', label: '文件路径', width: 320, min: 180, value: item => item.path,
      render: item => <span data-middle-truncate title={item.path}
        className="block min-w-0 w-full text-body-2-regular text-text-secondary">{item.path || '未取得'}</span> },
    { id: 'duration', label: '时长', width: 112, value: item => item.duration ?? 0,
      filter: { range: 'duration', value: item => item.duration || null },
      render: item => item.duration && item.duration > 0 ? fmtDur(item.duration) : '未取得' },
    { id: 'size', label: '大小', width: 112, value: item => item.size ?? 0,
      filter: { range: 'size', value: item => item.size },
      render: item => item.size !== null ? fmtSize(item.size) : '未取得' },
  ];
  return <Disclosure summary={`${group.label} · ${group.count === null ? '未取得' : `${group.count.toLocaleString()} 项`}`}>
    {original.count === null ? <Note tone="neutral">清单未取得，请重新检查。</Note> : !original.items.length
      ? <EmptyState icon={RiFileListLine} title="清单为空" size="compact">没有需要处理的作品。</EmptyState>
      : <Stack>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {group.truncated && group.count !== null ? <span className="text-body-2-regular text-text-secondary">
            已载入 {group.items.length.toLocaleString()} / {group.count.toLocaleString()} 项
          </span> : null}
          <Button size="small" variant="secondary" disabled={busy || !items.length} {...busyProps(action.busy === 'copy')}
            onClick={() => copy(items)}>复制当前清单</Button>
        </div>
        {action.error ? <Note tone="error">{action.error}</Note> : null}
        {filtering && query.isError ? <Note tone="error"
          action={<Button size="small" variant="secondary" onClick={() => void query.refetch()}>{t('cleanup:shared.retry')}</Button>}>
          {errorMessage(query.error)}</Note> : null}
        <DataTable label={group.label} title="作品清单" unit="部作品" panel={false}
          items={items} columns={columns} rowId={item => String(item.id)} rowLabel={identity}
          busy={busy} filters={{ values: filters, facets: group.column_facets ?? {}, onChange: setFilters }}
          selected={selected} onSelected={setSelected}
          actions={items => <Button size="small" variant="secondary" {...busyProps(action.busy === 'copy')}
            onClick={() => copy(items)}>复制所选</Button>} />
      </Stack>}
  </Disclosure>;
}
