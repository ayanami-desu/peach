/* 「账本备份」：本机留着的自动备份与手动备份，逐份可恢复。
 *
 * 数据来自 `GET /api/configuration/ledger-backups`（`backups` + 两个任务快照 + 上次恢复的结论）。
 * 备份与恢复都在后台线程里跑，跑着的时候每 1500ms 重取一次，停下就停轮询。
 * 恢复会覆盖当前账本且不可撤销：先过 `confirmModal`，提交时带 `confirm: true`，服务端只认这一个值。 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmModal } from '@peach/legacy/ui';
import { fmtSize } from '@peach/legacy/core';

import { Button } from '@/components/base/buttons/button';

import { apiGet, apiSend, errorMessage } from '../../api';
import { t } from '../../i18n';
import { LoadingDots } from '../components/loading-dots';
import { Note } from '../components/note';
import { Progress } from '../components/progress';
import { ErrorText, Footer, Help, Rows, Section, Stack, TaskCenterLink } from './section';
import { busyProps, useAction } from './use-action';

const LEDGER_URL = '/api/configuration/ledger-backups';
const LEDGER_KEY = ['configuration-ledger-backups'] as const;
/** 备份要拷贝整份账本、恢复要校验完整性，都按这个间隔把进度读回来。 */
const POLL_MS = 1500;

export interface LedgerBackup { id: string; name: string; bytes: number; modified_at: number; source: 'manual' | 'auto'; purpose?: string | null }
export interface LedgerJob {
  status: 'idle' | 'running' | 'complete';
  stage?: string | null;
  done?: number;
  total?: number | null;
  name?: string | null;
  message?: string | null;
}
export interface LedgerRestore { state: string; outcome?: string | null; message?: string | null; backup?: string | null; finished_at?: number }
export interface LedgerBackupsState { backups: LedgerBackup[]; backup: LedgerJob; restore: LedgerJob; last_restore?: LedgerRestore | null }

const timeOf = (seconds: number | null | undefined) =>
  seconds ? new Date(seconds * 1000).toLocaleString() : '—';

/** 假服务端会回成空对象：缺的字段都按「没有」算，不按运行中算。 */
const jobOf = (state: LedgerBackupsState | undefined, key: 'backup' | 'restore'): LedgerJob | undefined => state?.[key];

export function LedgerBackupSettings({ receipt }: { receipt(message: string): void }) {
  const queries = useQueryClient();
  const action = useAction();
  const snapshot = useQuery({
    queryKey: LEDGER_KEY, refetchOnMount: 'always',
    queryFn: ({ signal }) => apiGet<LedgerBackupsState>(LEDGER_URL, signal),
    refetchInterval: query => (jobOf(query.state.data, 'backup')?.status === 'running'
      || jobOf(query.state.data, 'restore')?.status === 'running' ? POLL_MS : false),
  });
  const apply = (next: LedgerBackupsState) => { queries.setQueryData(LEDGER_KEY, next); };
  if (snapshot.error) {
    return <Section guide="data" title={t('settings:ledgerBackup.title')}>
      <Stack><ErrorText>{errorMessage(snapshot.error)}</ErrorText></Stack>
      <Footer>
        <Button variant="secondary" onClick={() => { void snapshot.refetch(); }} {...busyProps(snapshot.isFetching)}>
          {t('settings:ledgerBackup.reload')}
        </Button>
      </Footer>
    </Section>;
  }
  const state = snapshot.data;
  if (!state) {
    return <Section guide="data" title={t('settings:ledgerBackup.title')}>
      <Stack><Help role="status">{t('settings:ledgerBackup.loading')}</Help></Stack>
    </Section>;
  }

  const backup = jobOf(state, 'backup');
  const restore = jobOf(state, 'restore');
  const busy = backup?.status === 'running' || restore?.status === 'running';
  const backups = state.backups ?? [];
  const now = () => {
    void action.run('backup', signal => apiSend<LedgerBackupsState>(`${LEDGER_URL}/backup`, {}, 'POST', signal), (next) => {
      apply(next);
      receipt(t('settings:ledgerBackup.backedUp'));
    });
  };
  const recover = (row: LedgerBackup) => void confirmModal({
    title: t('settings:ledgerBackup.restoreTitle'),
    body: t('settings:ledgerBackup.restoreBody', { name: row.name, time: timeOf(row.modified_at) }),
    confirmLabel: t('settings:ledgerBackup.restoreConfirm'),
    onConfirm: async () => {
      const next = await apiSend<LedgerBackupsState>(`${LEDGER_URL}/restore`, { confirm: true, id: row.id });
      apply(next);
      receipt(t('settings:ledgerBackup.restored'));
    },
  });

  return <Section guide="data" title={t('settings:ledgerBackup.title')}>
    <Stack>
      <Help>{t('settings:ledgerBackup.help')}</Help>
      {state.last_restore
        ? <Note tone={state.last_restore.state === 'error' ? 'error' : 'success'}
            title={t('settings:ledgerBackup.lastRestore')}>
            {state.last_restore.message
              || t('settings:ledgerBackup.lastRestoreAt', { time: timeOf(state.last_restore.finished_at) })}
          </Note>
        : null}
    </Stack>
    {backups.length
      ? <Rows>
          {backups.map(row => <BackupRow key={row.id} row={row} disabled={busy} onRestore={() => recover(row)} />)}
        </Rows>
      : <Stack><Help>{t('settings:ledgerBackup.empty')}</Help></Stack>}
    {busy
      ? <Stack divided>
          <JobProgress job={backup?.status === 'running' ? backup : restore}
            label={backup?.status === 'running' ? t('settings:ledgerBackup.backupRunning') : t('settings:ledgerBackup.restoreRunning')} />
          {(backup?.status === 'running' ? backup.stage : restore?.stage)
            ? <Help role="status">{backup?.status === 'running' ? backup.stage : restore?.stage}</Help>
            : null}
        </Stack>
      : null}
    {action.error ? <Stack divided><ErrorText>{action.error}</ErrorText></Stack> : null}
    <Footer status={busy ? t('settings:ledgerBackup.busyHint') : null}>
      <TaskCenterLink />
      <Button onClick={now} disabled={busy} {...busyProps(action.busy === 'backup')}>
        {t('settings:ledgerBackup.backupNow')}
      </Button>
    </Footer>
  </Section>;
}

/** 一份备份一行：文件名与时间、来源、占用，右侧「恢复」。 */
function BackupRow({ row, disabled, onRestore }: {
  row: LedgerBackup; disabled: boolean; onRestore(): void;
}) {
  return <div className="flex items-center gap-3 border-b border-separator-border py-2.5 pr-3 last:border-b-0">
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p className="text-body-regular wrap-anywhere text-text-primary">{row.name}</p>
      <p className="text-body-2-regular text-text-secondary">
        {t('settings:ledgerBackup.modifiedAt', {
          time: timeOf(row.modified_at),
          size: fmtSize(row.bytes),
          source: row.source === 'manual'
            ? t('settings:ledgerBackup.sourceManual')
            : t('settings:ledgerBackup.sourceAuto', { purpose: row.purpose || '—' }),
        })}
      </p>
    </div>
    <Button size="small" variant="secondary" disabled={disabled}
      aria-label={`${t('settings:ledgerBackup.restore')} ${row.name}`} onClick={onRestore}>
      {t('settings:ledgerBackup.restore')}
    </Button>
  </div>;
}

/** 有总量就画进度条，没有只报走过多少。 */
function JobProgress({ job, label }: { job: LedgerJob | undefined; label: string }) {
  if (job?.total && job.total > 0) {
    return <Progress label={label} value={job.done ?? 0} max={job.total} />;
  }
  return <LoadingDots label={label} />;
}
