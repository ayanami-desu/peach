import { useMemo } from 'react';
import { useLibraryTints } from './library-tint';
import { SourceMark } from '../settings/section';
import { t } from '../../i18n';
import type { ColumnFilterOption } from './table-column-filter';

/** 选项直接读取侧栏已经取得的媒体库，不另发状态探测请求。 */
export function useLibraryFilterOptions(enabled = true): ReadonlyMap<string, ColumnFilterOption> {
  const libraries = useLibraryTints({ names: enabled });
  return useMemo(() => {
    const options = new Map<string, ColumnFilterOption>();
    if (enabled) {
      for (const library of libraries.values()) {
        if (library.name) options.set(library.id, { id: library.id, label: library.name, leading: <SourceMark mark={library.icon} /> });
      }
      options.set('none', { id: 'none', label: t('catalog:columnFilter.unassignedLibrary') });
    }
    return options;
  }, [enabled, libraries]);
}
