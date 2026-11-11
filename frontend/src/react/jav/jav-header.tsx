import type { ReactNode } from 'react';
import { JAV_TABS, javPath } from './jav';
import { SortableBoardTabs } from '../components/navigation-order';

/** 页头一行：标题、分区自己的筛选框（同名册页的 `IndexSearch`，靠右）。馆藏用目录顶栏的搜索，不传。 */
export function JavHeader({ tab, navigate, search }: {
  tab: string; navigate(path: string): void; search?: ReactNode;
}) {
  return <div className="flex w-full flex-col gap-4">
    <div className="flex min-w-0 flex-wrap items-center gap-3 max-board-narrow:gap-x-2">
      <h2 data-page-title="" className="text-display-4-medium text-text-primary max-board-narrow:text-title-1-medium">JAV</h2>
      {search}
    </div>
    <SortableBoardTabs group="jav" tabs={JAV_TABS.map(([value, label]) => ({ value, label }))} value={tab}
      label="JAV 分区" className="" onChange={key => navigate(javPath(key))} />
  </div>;
}

/** 馆藏沿用目录的网格、筛选和搜索，分区导航放在目录页头。 */
export function JavLibraryHeader({ navigate }: { navigate(path: string): void }) {
  return <JavHeader tab="library" navigate={navigate} />;
}
