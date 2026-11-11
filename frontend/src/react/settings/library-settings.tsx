/* 媒体库：一个远端目录就是一个库，媒体只留在网盘上（ADR-0157）。
 *
 * 媒体库只是账本的一层映射：新增只记「这个目录要扫」，删除只把映射去掉，
 * 已经扫进来的行原样留着；加减都不碰网盘上的文件，重复加、重复删都是空操作。
 * 前端这一页只做三件事：列出现有库（`GET /api/libraries` 连同可选图标与处理步骤）、
 * 逐张卡改属性（`POST /api/libraries/{库}`）、在某个账号下挑目录新建（`POST /api/libraries`）。
 * 目录怎么挑也属于网盘那一侧的事，所以浏览组件与网盘页共用 `FolderPicker`。 */
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmModal } from '@peach/legacy/ui';

import { SettingsRow } from '@/components/application/settings/settings-rows';
import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import { Select, SelectItem } from '@/components/base/select/select';

import { ACCENT_CHOICES } from '@peach/appearance';
import { DRIVE_KEY, fetchDrives, type DriveSnapshot } from '@peach/query';

import { apiGet, apiSend, errorMessage } from '../../api';
import { t } from '../../i18n';
import { ErrorText, Fact, FactList, Footer, Help, Rows, Section, Stack } from './section';
import { FolderPicker } from './folder-picker';
import { busyProps, useAction } from './use-action';

export const LIBRARIES_URL = '/api/libraries';
export const LIBRARIES_KEY = ['libraries'] as const;

/** 一张媒体库卡片：可改的属性、它挂在哪个账号的哪个目录，以及在库的行数。 */
export interface LibraryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  policy: string;
  stages: string;
  account: string;
  location: string;
  root_id: string;
  root_name: string;
  videos: number;
  missing: number;
  synced_at: string;
  metered: boolean;
  folders: number;
}

export interface LibraryData {
  libraries: LibraryRow[];
  options: { icons: string[]; policies: string[]; stages: string[] };
}

const POLICY_LABELS: Record<string, string> = {
  auto: t('settings:library.policyAuto'),
  custom: t('settings:library.policyCustom'),
};

const STAGE_LABELS: Record<string, string> = {
  probe: t('settings:library.stageProbe'),
  metadata: t('settings:library.stageMetadata'),
  cover: t('settings:library.stageCover'),
  people: t('settings:library.stagePeople'),
  preview: t('settings:library.stagePreview'),
};

const ICON_NONE = 'none';

const splitStages = (stages: string) => stages.split(',').map(item => item.trim()).filter(Boolean);

const colorLabel = (key: string) => {
  const match = ACCENT_CHOICES.find(choice => choice[0] === key);
  return match ? String(match[1]) : key;
};

export function LibrarySettings({ receipt }: { receipt(message: string): void }) {
  const queries = useQueryClient();
  const snapshot = useQuery({
    queryKey: LIBRARIES_KEY, refetchOnMount: 'always',
    queryFn: ({ signal }) => apiGet<LibraryData>(LIBRARIES_URL, signal),
  });
  const [adding, setAdding] = useState(false);
  const reload = () => { void queries.invalidateQueries({ queryKey: LIBRARIES_KEY }) };

  if (snapshot.error) {
    return <Section guide="libraries" title={t('settings:library.title')}>
      <Stack><ErrorText>{errorMessage(snapshot.error)}</ErrorText></Stack>
    </Section>;
  }
  const data = snapshot.data;
  if (!data) {
    return <Section guide="libraries" title={t('settings:library.title')}>
      <Stack><Help role="status">{t('settings:library.loading')}</Help></Stack>
    </Section>;
  }

  return (
    <>
      <Section guide="libraries" title={t('settings:library.title')}>
        <Stack><Help>{t('settings:library.intro')}</Help></Stack>
        {data.libraries.length ? null : <Stack><Help role="status">{t('settings:library.empty')}</Help></Stack>}
      </Section>
      {data.libraries.map(library => (
        <LibraryCard key={library.id} library={library} options={data.options}
          onSaved={next => {
            void queries.setQueryData<LibraryData>(LIBRARIES_KEY, current => current
              ? { ...current, libraries: current.libraries.map(item => item.id === next.id ? next : item) }
              : current);
            receipt(t('settings:library.saved', { name: next.name }));
          }}
          onDeleted={() => { reload(); receipt(t('settings:library.removed', { name: library.name })); }}
          onMoved={next => { reload(); receipt(t('settings:library.moved', { name: next.name })); }} />
      ))}
      <Section title={t('settings:library.add.title')}>
        {adding
          ? <AddLibrary onClose={() => setAdding(false)}
              onAdded={name => { setAdding(false); reload(); receipt(t('settings:library.added', { name })); }} />
          : null}
        <Footer>
          <Button variant="secondary" onClick={() => setAdding(!adding)}>
            {adding ? t('settings:library.add.collapse') : t('settings:library.add.open')}
          </Button>
        </Footer>
      </Section>
    </>
  );
}

function LibraryCard({ library, options, onSaved, onDeleted, onMoved }: {
  library: LibraryRow; options: LibraryData['options'];
  onSaved(next: LibraryRow): void; onDeleted(): void; onMoved(next: LibraryRow): void;
}) {
  const action = useAction();
  const [moving, setMoving] = useState(false);
  const [form, setForm] = useState(() => ({
    name: library.name, icon: library.icon || ICON_NONE,
    color: library.color, policy: library.policy, stages: splitStages(library.stages),
  }));
  const custom = form.policy === 'custom';
  const save = () => void action.run('save',
    (signal) => apiSend<LibraryRow>(`${LIBRARIES_URL}/${encodeURIComponent(library.id)}`, {
      name: form.name, icon: form.icon === ICON_NONE ? '' : form.icon,
      color: form.color, policy: form.policy, stages: custom ? form.stages.join(',') : '',
    }, 'POST', signal),
    (next) => {
      setForm(current => ({ ...current, name: next.name, icon: next.icon || ICON_NONE,
        color: next.color, policy: next.policy, stages: splitStages(next.stages) }));
      onSaved(next);
    });
  const remove = () => void confirmModal({
    title: t('settings:library.removeTitle', { name: library.name }),
    body: t('settings:library.removeBody'),
    confirmLabel: t('settings:library.removeConfirm'),
    danger: true,
    onConfirm: async () => {
      await apiSend<{ deleted: string }>(`${LIBRARIES_URL}/${encodeURIComponent(library.id)}`, {}, 'DELETE');
      onDeleted();
    },
  });

  const toggleStage = (stage: string, on: boolean) => setForm(current => ({
    ...current,
    stages: on ? [...current.stages, stage] : current.stages.filter(item => item !== stage),
  }));

  return (
    <Section title={library.name}>
      <Stack>
        <FactList>
          <Fact term={t('settings:library.videos')}>{`${library.videos}`}</Fact>
          <Fact term={t('settings:library.missing')}>{`${library.missing}`}</Fact>
          <Fact term={t('settings:library.synced')}>{library.synced_at || t('settings:library.never')}</Fact>
          <Fact term={t('settings:library.root')}>
            <span title={library.root_id}>{`${library.account} · ${library.root_name}`}</span>
            {library.metered ? t('settings:library.metered') : ''}
          </Fact>
        </FactList>
      </Stack>
      <Rows>
        <SettingsRow label={t('settings:library.name')} description={t('settings:library.nameHelp')}>
          <Input aria-label={t('settings:library.nameLabel')} value={form.name}
            onChange={value => setForm({ ...form, name: value })} />
        </SettingsRow>
        <SettingsRow label={t('settings:library.icon')} description={t('settings:library.iconHelp')}>
          <Select aria-label={t('settings:library.icon')} selectedKey={form.icon}
            onSelectionChange={(key) => { if (key !== null) setForm({ ...form, icon: String(key) }) }}>
            <SelectItem id={ICON_NONE}>{t('settings:library.iconNone')}</SelectItem>
            {options.icons.map(icon => <SelectItem key={icon} id={icon}>{icon}</SelectItem>)}
          </Select>
        </SettingsRow>
        <SettingsRow label={t('settings:library.color')} description={t('settings:library.colorHelp')}>
          <Select aria-label={t('settings:library.color')} selectedKey={form.color || ICON_NONE}
            onSelectionChange={(key) => {
              if (key === null) return;
              setForm({ ...form, color: String(key) === ICON_NONE ? '' : String(key) });
            }}>
            <SelectItem id={ICON_NONE}>{t('settings:library.colorNone')}</SelectItem>
            {ACCENT_CHOICES.map(choice => (
              <SelectItem key={String(choice[0])} id={String(choice[0])}>{colorLabel(String(choice[0]))}</SelectItem>
            ))}
          </Select>
        </SettingsRow>
        <SettingsRow label={t('settings:library.policy')} description={t('settings:library.policyHelp')}>
          <Select aria-label={t('settings:library.policy')} selectedKey={form.policy}
            onSelectionChange={(key) => { if (key !== null) setForm({ ...form, policy: String(key) }) }}>
            {options.policies.map(policy => (
              <SelectItem key={policy} id={policy}>{POLICY_LABELS[policy] ?? policy}</SelectItem>
            ))}
          </Select>
        </SettingsRow>
        {custom ? (
          <SettingsRow label={t('settings:library.stages')} description={t('settings:library.stagesHelp')}>
            <div className="flex flex-wrap gap-3">
              {options.stages.map(stage => (
                <Checkbox key={stage} size="sm" isSelected={form.stages.includes(stage)}
                  onChange={on => toggleStage(stage, on)}>{STAGE_LABELS[stage] ?? stage}</Checkbox>
              ))}
            </div>
          </SettingsRow>
        ) : null}
      </Rows>
      {action.error ? <Stack divided><ErrorText>{action.error}</ErrorText></Stack> : null}
      {moving ? (
        <FolderPicker account={library.account} onClose={() => setMoving(false)}
          onPick={folder => void action.run('move',
            (signal) => apiSend<LibraryRow>(`${LIBRARIES_URL}/${encodeURIComponent(library.id)}/move`,
              { remote_id: folder.remote_id }, 'POST', signal),
            (next) => { setMoving(false); onMoved(next); })} />
      ) : null}
      <Footer status={library.folders > 1
        ? t('settings:library.foldersMore', { count: library.folders - 1 }) : null}>
        <Button onClick={save} {...busyProps(action.busy === 'save')}>{t('settings:library.save')}</Button>
        <Button variant="secondary" onClick={() => setMoving(!moving)} {...busyProps(action.busy === 'move')}>
          {moving ? t('settings:library.movePicking') : t('settings:library.move')}
        </Button>
        <Button variant="secondary" onClick={remove}>{t('settings:library.remove')}</Button>
      </Footer>
    </Section>
  );
}

function AddLibrary({ onAdded, onClose }: { onAdded(name: string): void; onClose(): void }) {
  const drives = useQuery({
    queryKey: DRIVE_KEY, refetchOnMount: 'always',
    queryFn: ({ signal }) => fetchDrives(signal),
  });
  const accounts = usableAccounts(drives.data);
  const [account, setAccount] = useState('');
  const [picking, setPicking] = useState(false);
  const action = useAction();
  const chosen = account || accounts[0]?.key || '';

  if (!accounts.length) {
    return <Stack><Help role="status">{t('settings:library.add.noAccount')}</Help></Stack>;
  }

  return (
    <>
      <Rows>
        <SettingsRow label={t('settings:library.add.account')} description={t('settings:library.add.accountHelp')}>
          <Select aria-label={t('settings:library.add.accountLabel')} selectedKey={chosen}
            onSelectionChange={(key) => { if (key !== null) { setAccount(String(key)); setPicking(false) } }}>
            {accounts.map(item => <SelectItem key={item.key} id={item.key}>{item.label}</SelectItem>)}
          </Select>
        </SettingsRow>
      </Rows>
      {picking ? (
        <FolderPicker account={chosen} onClose={() => setPicking(false)}
          onPick={folder => void action.run('add',
            (signal) => apiSend<LibraryRow>(LIBRARIES_URL,
              { account: chosen, remote_id: folder.remote_id }, 'POST', signal),
            (row) => onAdded(row.name || folder.name))} />
      ) : null}
      {action.error ? <Stack divided><ErrorText>{action.error}</ErrorText></Stack> : null}
      <Footer>
        <Button onClick={() => setPicking(!picking)} disabled={!chosen} {...busyProps(action.busy === 'add')}>
          {picking ? t('settings:library.add.picking') : t('settings:library.add.pick')}
        </Button>
        <Button variant="secondary" onClick={onClose}>{t('settings:library.add.cancel')}</Button>
      </Footer>
      <Stack><Help>{t('settings:library.add.idempotent')}</Help></Stack>
    </>
  );
}

/** 已经授权过的账号：没授权的挑不了目录。 */
function usableAccounts(data: DriveSnapshot | undefined): { key: string; label: string }[] {
  return (data?.locations ?? []).flatMap(connection => connection.accounts
    .filter(account => account.connected)
    .map(account => ({
      key: account.key,
      label: `${connection.label} · ${account.email || account.display_name || account.key}`,
    })));
}
