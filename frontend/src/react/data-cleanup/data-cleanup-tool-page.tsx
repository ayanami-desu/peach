import type { CleanupToolKey } from '../../cleanup-tools';
import type { DataCleanupProps } from '../bundle';
import { Page } from '../components/page';
import { LinkManager } from './link-manager';
import { OrganizeCard } from './organize-card';
import { OrphanRecordsCard } from './orphan-records-card';
import { PerformerDeleteCard } from './performer-delete-card';

export function DataCleanupToolPage({ tool, toast, failure }: {
  tool: CleanupToolKey;
} & Pick<DataCleanupProps, 'toast' | 'failure'>) {
  let content;
  switch (tool) {
    case 'organize': content = <OrganizeCard toast={toast} failure={failure} />; break;
    case 'orphan-records': content = <OrphanRecordsCard toast={toast} />; break;
    case 'links': content = <LinkManager />; break;
    case 'batch-delete': content = <PerformerDeleteCard toast={toast} />; break;
  }
  return <Page>{content}</Page>;
}
