/* 「存储空间」：数据目录、磁盘余量、上次统计的分类占用与容量保护。
 *
 * 数据全来自 `GET /api/configuration/storage`：统计或清理在跑时每 1500ms 重取一次，
 * 停下就停轮询（间隔按上一次拿到的 `job.state` 算，挂载与卸载交给 Query 的 signal 中止）。
 * 清理只对「能清理且确实有可释放字节」的类别开放，提交的是勾选的类别键（`POST /clean`）；
 * 「重新统计」是 `POST /measure`。容量保护整份策略由 `POST /policy` 写回，上限留 0 表示不管。
 * 每次任务结束后服务端回的是同一份快照，直接换掉缓存，不等下一轮。 */
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmModal } from '@peach/legacy/ui';
import { fmtSize } from '@peach/legacy/core';

import { SettingsRow } from '@/components/application/settings/settings-rows';
import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import { Switch } from '@/components/base/switch/switch';

import { apiGet, apiSend, errorMessage } from '../../api';
import { t } from '../../i18n';
import type { StorageCategory, StoragePolicy, StorageState } from '../bundle';
import { LoadingDots } from '../components/loading-dots';
import { Note } from '../components/note';
import { ConfigurationInput } from '../components/configuration-fields';
import { Progress } from '../components/progress';
import { ErrorText, Fact, FactList, Footer, Help, Rows, Section, Stack } from './section';
import { busyProps, useAction } from './use-action';

const STORAGE_URL = '/api/configuration/storage';
const STORAGE_KEY = ['configuration-storage'] as const;
/** 统计与清理在后台线程里跑，页面只负责按这个间隔把进度读回来。 */
const POLL_MS = 1500;

/** 还没保存过容量设置时的形状：全 0 表示不限，外部缓存留空不启用。 */
const DEFAULT_POLICY: StoragePolicy = {
  enabled: false, minimum_free_gib: 0, data_max_gib: 0, cache_max_gib: 0,
  auto_clean: false, external_cache_path: '', external_cache_max_gib: 0,
};

/** 快照里可能没有 `job`（后端没跑起来、或被假服务端回成空对象）：都按空闲算。 */
const jobState = (state: StorageState | undefined) => state?.job?.state ?? 'idle';
const running = (state: StorageState | undefined) => jobState(state) !== 'idle';

/** 表单里数字先按字符串存：清空一格时不会立刻变成 0，也不会把光标顶到末尾。 */
type PolicyForm = Record<'minimum_free_gib' | 'data_max_gib' | 'cache_max_gib' | 'external_cache_max_gib', string>
  & Pick<StoragePolicy, 'enabled' | 'auto_clean' | 'external_cache_path'>;

const formOf = (policy: StoragePolicy): PolicyForm => ({
  minimum_free_gib: String(policy.minimum_free_gib),
  data_max_gib: String(policy.data_max_gib),
  cache_max_gib: String(policy.cache_max_gib),
  external_cache_max_gib: String(policy.external_cache_max_gib),
  enabled: policy.enabled,
  auto_clean: policy.auto_clean,
  external_cache_path: policy.external_cache_path,
});

/** 空串与非数字都按 0（也就是不限）；负数是手滑，同样归 0。 */
const gib = (value: string) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const policyOf = (form: PolicyForm): StoragePolicy => ({
  enabled: form.enabled,
  auto_clean: form.auto_clean,
  minimum_free_gib: gib(form.minimum_free_gib),
  data_max_gib: gib(form.data_max_gib),
  cache_max_gib: gib(form.cache_max_gib),
  external_cache_max_gib: gib(form.external_cache_max_gib),
  external_cache_path: form.external_cache_path.trim(),
});

const timeOf = (seconds: number | null | undefined) =>
  seconds ? new Date(seconds * 1000).toLocaleString() : '—';

export function StorageSettings({ receipt }: { receipt(message: string): void }) {
  const queries = useQueryClient();
  const snapshot = useQuery({
    queryKey: STORAGE_KEY, refetchOnMount: 'always',
    queryFn: ({ signal }) => apiGet<StorageState>(STORAGE_URL, signal),
    refetchInterval: query => (running(query.state.data) ? POLL_MS : false),
  });
  const apply = (next: StorageState) => { queries.setQueryData(STORAGE_KEY, next); };
  if (snapshot.error) {
    return <Section guide="data" title={t('settings:storage.title')}>
      <Stack><ErrorText>{errorMessage(snapshot.error)}</ErrorText></Stack>
      <Footer>
        <Button variant="secondary" onClick={() => { void snapshot.refetch(); }} {...busyProps(snapshot.isFetching)}>
          {t('settings:storage.reload')}
        </Button>
      </Footer>
    </Section>;
  }
  const state = snapshot.data;
  if (!state) {
    return <Section guide="data" title={t('settings:storage.title')}>
      <Stack><Help role="status">{t('settings:storage.loading')}</Help></Stack>
    </Section>;
  }
  return <>
    <StorageUsage state={state} receipt={receipt} apply={apply} />
    <StoragePolicyForm state={state} receipt={receipt} apply={apply} />
  </>;
}

/** 第一张卡：目录与磁盘读数、上次统计的分类占用，以及两个任务键。 */
function StorageUsage({ state, receipt, apply }: {
  state: StorageState; receipt(message: string): void; apply(next: StorageState): void;
}) {
  const action = useAction();
  const usage = state.usage ?? null;
  const job = state.job;
  const busy = running(state);
  const categories = usage?.categories ?? [];
  const [picked, setPicked] = useState<string[]>([]);
  const selectable = categories.filter(item => item.cleanable && item.reclaimable > 0);
  /* 勾选只留当前仍可清理的：统计完份额归零的类别自动落选。 */
  const selected = picked.filter(key => selectable.some(item => item.key === key));
  const toggle = (key: string) => setPicked(current => current.includes(key)
    ? current.filter(item => item !== key) : [...current, key]);

  const measure = () => {
    void action.run('measure', signal => apiSend<StorageState>(`${STORAGE_URL}/measure`, {}, 'POST', signal), (next) => {
      apply(next);
      receipt(t('settings:storage.measured'));
    });
  };
  const clean = () => {
    const chosen = selectable.filter(item => selected.includes(item.key));
    if (!chosen.length) return;
    const freed = chosen.reduce((sum, item) => sum + item.reclaimable, 0);
    void confirmModal({
      title: t('settings:storage.cleanTitle'),
      body: t('settings:storage.cleanBody', {
        labels: chosen.map(item => item.label).join(t('settings:storage.listSeparator')),
        size: fmtSize(freed),
      }),
      confirmLabel: t('settings:storage.cleanConfirm'),
      onConfirm: async () => {
        const next = await apiSend<StorageState>(`${STORAGE_URL}/clean`, { categories: chosen.map(item => item.key) }, 'POST');
        apply(next);
        setPicked([]);
        receipt(t('settings:storage.cleaned'));
      },
    });
  };

  return <Section guide="data" title={t('settings:storage.title')}>
    <Stack>
      <FactList>
        <Fact term={t('settings:storage.dataRoot')}>{state.data_root || '—'}</Fact>
        <Fact term={t('settings:storage.disk')}>
          <span className="text-left">
            {t('settings:storage.diskFree', { free: fmtSize(state.free_bytes), total: fmtSize(state.total_bytes) })}
          </span>
        </Fact>
      </FactList>
      {state.system_drive ? <Help>{t('settings:storage.systemDrive')}</Help> : null}
      {usage?.capacity_error ? <Note tone="warning" title={t('settings:storage.capacityErrorTitle')}>
        {usage.capacity_error}
      </Note> : null}
      {usage
        ? <FactList>
            <Fact term={t('settings:storage.usageTotal')}>{fmtSize(usage.total_bytes)}</Fact>
            <Fact term={t('settings:storage.usageFiles')}>
              {t('settings:storage.usageFilesValue', { files: usage.total_files.toLocaleString() })}
            </Fact>
            <Fact term={t('settings:storage.usageMeasured')}>{timeOf(usage.measured_at)}</Fact>
          </FactList>
        : <Help>{t('settings:storage.usageEmpty')}</Help>}
    </Stack>
    {categories.length
      ? <Rows>
          {categories.map(item => <CategoryRow key={item.key} item={item} selected={selected.includes(item.key)}
            onToggle={() => toggle(item.key)} />)}
        </Rows>
      : null}
    {(busy || job?.error)
      ? <Stack divided>
          {busy ? <JobProgress state={state} /> : null}
          {job?.message && !job.error ? <Help role="status">{job.message}</Help> : null}
          {job?.error ? <ErrorText>{job.message}</ErrorText> : null}
        </Stack>
      : null}
    {action.error ? <Stack divided><ErrorText>{action.error}</ErrorText></Stack> : null}
    <Footer status={selected.length
      ? t('settings:storage.cleanStatus', { size: fmtSize(selectable
          .filter(item => selected.includes(item.key))
          .reduce((sum, item) => sum + item.reclaimable, 0)) })
      : null}>
      <Button variant="secondary" onClick={measure} disabled={busy} {...busyProps(action.busy === 'measure')}>
        {t('settings:storage.measure')}
      </Button>
      <Button variant="secondary" onClick={clean} disabled={busy || !selected.length}
        {...busyProps(action.busy === 'clean')}>
        {t('settings:storage.clean')}
      </Button>
    </Footer>
  </Section>;
}

/** 一类数据一行：勾选、名称与说明、占用与可释放。不能清理的类别写清原因。 */
function CategoryRow({ item, selected, onToggle }: { item: StorageCategory; selected: boolean; onToggle(): void }) {
  const usable = item.cleanable && item.reclaimable > 0;
  return <div className="flex items-start gap-3 border-b border-separator-border py-2.5 pr-3 last:border-b-0">
    <div className="pt-0.5">
      <Checkbox size="sm" aria-label={item.label} isSelected={selected} isDisabled={!usable} onChange={onToggle} />
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p className="text-body-regular text-text-primary">{item.label}</p>
      {item.description ? <p className="text-body-2-regular wrap-anywhere text-text-secondary">{item.description}</p> : null}
      {!item.cleanable && item.note
        ? <p className="text-caption-1-regular wrap-anywhere text-text-secondary">
            {t('settings:storage.cleanableReason', { note: item.note })}
          </p>
        : null}
    </div>
    <div className="shrink-0 text-right text-body-2-regular text-text-secondary">
      <p className="text-text-primary">{fmtSize(item.bytes)}</p>
      {item.reclaimable > 0
        ? <p>{t('settings:storage.reclaimable', { size: fmtSize(item.reclaimable) })}</p>
        : null}
    </div>
  </div>;
}

/** 统计有上次的总文件数就按它画进度，没有总量只报走过多少。 */
function JobProgress({ state }: { state: StorageState }) {
  const job = state.job;
  const label = job?.state === 'cleaning'
    ? t('settings:storage.cleaning')
    : t('settings:storage.measuring');
  const total = job?.state === 'measuring' ? job.expected_files : null;
  if (total && total > 0) {
    return <Progress label={label} value={job?.files ?? 0} max={total} />;
  }
  return <LoadingDots label={label} />;
}

/** 第二张卡：容量保护的开关与四类上限，整份策略一起提交。 */
function StoragePolicyForm({ state, receipt, apply }: {
  state: StorageState; receipt(message: string): void; apply(next: StorageState): void;
}) {
  const action = useAction();
  const budget = state.budget;
  const [form, setForm] = useState<PolicyForm>(() => formOf(budget?.policy ?? DEFAULT_POLICY));
  /* 服务端回的策略是这份表单的底稿；统计轮询每 1500ms 换一份新回话，策略内容没变就不动正在编辑的输入。 */
  const saved = budget?.policy ?? DEFAULT_POLICY;
  const savedKey = JSON.stringify(saved);
  useEffect(() => { setForm(formOf(saved)); }, [savedKey]);
  const field = (name: keyof PolicyForm, value: string | boolean) => setForm(current => ({ ...current, [name]: value }));
  const number = (name: 'minimum_free_gib' | 'data_max_gib' | 'cache_max_gib' | 'external_cache_max_gib') => ({
    id: `storage-policy-${name}`,
    type: 'number' as const,
    min: 0,
    step: 1,
    inputMode: 'numeric' as const,
    value: form[name],
    onChange: (value: string) => field(name, value),
  });
  const submit = () => {
    void action.run('policy', signal => apiSend<StorageState>(`${STORAGE_URL}/policy`, policyOf(form), 'POST', signal), (next) => {
      apply(next);
      receipt(t('settings:storage.policySaved'));
    });
  };

  return <Section guide="data" title={t('settings:storage.policyTitle')}>
    <Stack>
      <Help>{t('settings:storage.policyHelp')}</Help>
      <Rows>
        <SettingsRow label={t('settings:storage.policyEnabled')}>
          <Switch aria-label={t('settings:storage.policyEnabled')} isSelected={form.enabled}
            onChange={value => field('enabled', value)} />
        </SettingsRow>
        <SettingsRow label={t('settings:storage.policyAutoClean')}>
          <Switch aria-label={t('settings:storage.policyAutoClean')} isSelected={form.auto_clean}
            onChange={value => field('auto_clean', value)} />
        </SettingsRow>
      </Rows>
      <div className="flex flex-col gap-4">
        <ConfigurationInput label={t('settings:storage.policyMinimumFree')} unit="GiB" {...number('minimum_free_gib')} />
        <ConfigurationInput label={t('settings:storage.policyDataMax')} unit="GiB" {...number('data_max_gib')} />
        <ConfigurationInput label={t('settings:storage.policyCacheMax')} unit="GiB" {...number('cache_max_gib')} />
        <ConfigurationInput label={t('settings:storage.policyExternalMax')} unit="GiB" {...number('external_cache_max_gib')} />
        <div className="flex flex-col gap-1.5">
          <Input id="storage-policy-external-path" label={t('settings:storage.policyExternalPath')}
            value={form.external_cache_path} autoComplete="off"
            placeholder={t('settings:storage.policyExternalPathPlaceholder')}
            onChange={(value: string) => field('external_cache_path', value)} />
          <Help>{t('settings:storage.policyExternalPathHelp')}</Help>
        </div>
      </div>
      <BudgetReading budget={budget} />
    </Stack>
    {action.error ? <Stack divided><ErrorText>{action.error}</ErrorText></Stack> : null}
    <Footer status={budget?.last_check ? t('settings:storage.policyCheckedAt', {
      time: timeOf(budget.last_check.checked_at) }) : null}>
      <Button onClick={submit} {...busyProps(action.busy === 'policy')}>
        {t('settings:storage.policySave')}
      </Button>
    </Footer>
  </Section>;
}

/** 上次容量检查的结论：没有记录就不画。 */
function BudgetReading({ budget }: { budget: StorageState['budget'] }) {
  if (!budget) return null;
  const check = budget.last_check;
  return <>
    {budget.error ? <ErrorText>{t('settings:storage.policyError', { error: budget.error })}</ErrorText> : null}
    {check?.paused && check.reasons.length
      ? <Note tone="warning" title={t('settings:storage.policyPaused')}>
          {check.reasons.join(t('settings:storage.listSeparator'))}
        </Note>
      : null}
    {check && check.freed_bytes > 0
      ? <Help>{t('settings:storage.policyFreed', { size: fmtSize(check.freed_bytes) })}</Help>
      : null}
  </>;
}
