/* 网盘连接：媒体只在网盘上，Peach 只读目录清单与播放所需的字节（ADR-0157）。
 *
 * 一张卡对一个来源，状态全来自 `GET /api/drive`：`configured` 是这台机器有没有该网盘的 OAuth 客户端凭据，
 * `connected` 是有没有授权过的账号。没有账号时只给「开始授权」：点了整窗跳到网盘同意页，回跳落在 `/settings#drives`。
 * 扫描起点决定同步从哪些目录开始，用 `GET /api/drive/{location}/folders` 逐层列目录挑，挑完整条换掉
 * （`POST /api/drive/{location}/roots`）；一个都不选就是从账号根目录开始。
 * 「立即刷新」让下一轮同步先做这个来源（`POST /api/drive/{location}/refresh`）。
 * 取字节方式两种都要（`POST /api/drive/{location}/mode`）：`redirect` 让浏览器直接跟网盘的预授权地址走，
 * 不占服务器流量；`proxy` 由 Peach 带 Range 转发，浏览器只跟 Peach 说话。能带鉴权取的来源只能选后者。
 * 「断开」只忘掉账号与扫描起点（`DELETE /api/drive/{location}`），已经登记进馆藏的条目不动。 */
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmModal } from '@peach/legacy/ui';

import { SettingsRow } from '@/components/application/settings/settings-rows';
import { Button } from '@/components/base/buttons/button';

import { DRIVE_KEY, DRIVE_URL, fetchDrives, type DriveConnection, type DriveRoot } from '@peach/query';

import { apiGet, apiSend, errorMessage } from '../../api';
import { t } from '../../i18n';
import { Note } from '../components/note';
import { ErrorText, Fact, FactList, Footer, Help, Rows, Section, Stack } from './section';
import { busyProps, useAction } from './use-action';

/** 取字节方式的两句话说法。服务端只认 `redirect` 与 `proxy` 两个值。 */
const MODE_LABELS: Record<string, { label: string; help: string }> = {
  redirect: {
    label: t('settings:drive.mode.redirect'),
    help: t('settings:drive.mode.redirectHelp'),
  },
  proxy: {
    label: t('settings:drive.mode.proxy'),
    help: t('settings:drive.mode.proxyHelp'),
  },
};

const modeLabel = (mode: string) => MODE_LABELS[mode]?.label ?? mode;

export function DriveSettings({ receipt }: { receipt(message: string): void }) {
  const queries = useQueryClient();
  const snapshot = useQuery({
    queryKey: DRIVE_KEY, refetchOnMount: 'always',
    queryFn: ({ signal }) => fetchDrives(signal),
  });
  if (snapshot.error) {
    return <Section guide="drives" title="网盘">
      <Stack><ErrorText>{errorMessage(snapshot.error)}</ErrorText></Stack>
      <Footer>
        <Button variant="secondary" onClick={() => { void snapshot.refetch(); }} {...busyProps(snapshot.isFetching)}>重新读取</Button>
      </Footer>
    </Section>;
  }
  const data = snapshot.data;
  if (!data) {
    return <Section guide="drives" title="网盘"><Stack><Help role="status">正在读取网盘状态…</Help></Stack></Section>;
  }
  const reloaded = () => { void queries.invalidateQueries({ queryKey: DRIVE_KEY }); };
  return <>{data.locations.map(connection => (
    <DriveCard key={connection.location} connection={connection} publicUrl={data.public_url}
      receipt={receipt} reloaded={reloaded} />
  ))}</>;
}

function DriveCard({ connection, publicUrl, receipt, reloaded }: {
  connection: DriveConnection; publicUrl: string; receipt(message: string): void; reloaded(): void;
}) {
  const [state, setState] = useState(connection);
  useEffect(() => setState(connection), [connection]);
  const action = useAction();
  const [picking, setPicking] = useState(false);
  const base = `${DRIVE_URL}/${state.location}`;
  const callback = publicUrl ? `${publicUrl.replace(/\/+$/, '')}/oauth/${state.location}/callback` : '';

  const authorize = () => void action.run('authorize',
    (signal) => apiSend<{ url: string }>(`${base}/authorize`, {}, 'POST', signal),
    ({ url }) => { window.location.assign(url); });
  const refresh = () => void action.run('refresh',
    (signal) => apiSend<DriveConnection>(`${base}/refresh`, {}, 'POST', signal),
    (next) => { setState(next); receipt(`已安排刷新 ${next.label}，下一轮同步先做这个来源`); });
  const saveRoots = (roots: DriveRoot[]) => void action.run('roots',
    (signal) => apiSend<{ location: string; roots: string[] }>(`${base}/roots`, { roots }, 'POST', signal),
    () => { setPicking(false); receipt('已保存扫描起点'); reloaded(); });
  const saveMode = (mode: string) => void action.run('mode',
    (signal) => apiSend<{ location: string; mode: string }>(`${base}/mode`, { mode }, 'POST', signal),
    ({ mode: saved }) => {
      setState({ ...state, mode: saved });
      receipt(t('settings:drive.mode.switched', { label: state.label, mode: modeLabel(saved) }));
    });
  const forget = () => void confirmModal({
    title: `断开 ${state.label}`,
    body: `Peach 会忘掉 ${state.email || state.display_name || '这个网盘'} 的账号与扫描起点，之后不再同步它。`
      + '已经登记进馆藏的条目不动；重新授权后可以接着同步。',
    confirmLabel: '断开',
    danger: true,
    onConfirm: async () => {
      await apiSend<{ forgotten: string }>(base, {}, 'DELETE');
      receipt(`已断开 ${state.label}`);
      reloaded();
    },
  });

  return (
    <Section guide="account" title={state.label}>
      <Stack>
        {state.configured ? null : (
          <Note tone="warning" title={`${state.label} 还没有接入`}>
            {`在设置文件的 [drive.accounts.${state.location}] 段填好 client_id 与 client_secret，`
              + '并在 [drive] 段的 public_url 填上这台 Peach 的 https 地址，保存后回到这一页授权。'}
          </Note>
        )}
        {state.configured && !state.connected && !callback ? (
          <Note tone="warning" title="没有配置回调基址">
            {`网盘授权要回到这台 Peach：先在设置文件的 [drive] 段填好 public_url（https 地址），`
              + `网盘后台登记的回调地址是 public_url 加上 /oauth/${state.location}/callback。`}
          </Note>
        ) : null}
        <FactList>
          <Fact term="账号">
            {state.connected ? state.email || state.display_name || '已授权' : '未授权'}
          </Fact>
          <Fact term="扫描起点">{state.roots.length ? `${state.roots.length} 个目录` : '账号根目录'}</Fact>
          <Fact term="上次同步">{state.synced_at || '还没有同步过'}</Fact>
          <Fact term={t('settings:drive.mode.term')}>{modeLabel(state.mode)}</Fact>
        </FactList>
        {state.last_error ? <Note tone="warning" title="上次同步失败">{state.last_error}</Note> : null}
        {action.error ? <ErrorText>{action.error}</ErrorText> : null}
      </Stack>
      {state.roots.length ? (
        <Rows>
          {state.roots.map(root => (
            <SettingsRow key={root.remote_id} label={root.name} description={root.remote_id}>
              <Button size="small" variant="secondary" aria-label={`移除扫描起点 ${root.name}`}
                onClick={() => saveRoots(state.roots.filter(item => item.remote_id !== root.remote_id))}
                {...busyProps(action.busy === 'roots')}>移除</Button>
            </SettingsRow>
          ))}
        </Rows>
      ) : null}
      {state.modes.length > 1 ? (
        <Rows>
          {state.modes.map(mode => (
            <SettingsRow key={mode} label={modeLabel(mode)} description={MODE_LABELS[mode]?.help ?? mode}>
              <Button size="small" variant={mode === state.mode ? 'primary' : 'secondary'}
                aria-pressed={mode === state.mode}
                disabled={mode === state.mode}
                aria-label={`${t('settings:drive.mode.switchTo')} ${modeLabel(mode)}`}
                onClick={() => saveMode(mode)}
                {...busyProps(action.busy === 'mode')}>
                {mode === state.mode ? t('settings:drive.mode.inUse') : t('settings:drive.mode.switchTo')}
              </Button>
            </SettingsRow>
          ))}
        </Rows>
      ) : null}
      {picking && state.connected
        ? <RootPicker connection={state} receipt={receipt} onClose={() => setPicking(false)}
            onSaved={() => { setPicking(false); reloaded(); }} />
        : null}
      <Footer status={state.connected ? null : `回调地址 ${callback || '未配置'}`}>
        {state.connected
          ? <Button variant="secondary" onClick={() => setPicking(!picking)}>{picking ? '收起目录' : '选择扫描起点'}</Button>
          : null}
        {state.connected
          ? <Button variant="secondary" onClick={forget}>断开</Button>
          : null}
        {state.connected
          ? <Button variant="secondary" onClick={refresh} {...busyProps(action.busy === 'refresh')}>立即刷新</Button>
          : null}
        {state.configured
          ? <Button onClick={authorize} disabled={!callback} {...busyProps(action.busy === 'authorize')}>
              {state.connected ? '重新授权' : '开始授权'}
            </Button>
          : null}
      </Footer>
    </Section>
  );
}

/* 逐层列远端目录：只出子目录，点「打开」进一层，「上一级」退回去，当前这层可以直接设成扫描起点。 */
function RootPicker({ connection, receipt, onSaved, onClose }: {
  connection: DriveConnection; receipt(message: string): void; onSaved(): void; onClose(): void;
}) {
  const [path, setPath] = useState<DriveRoot[]>([]);
  const current = path[path.length - 1];
  const folders = useQuery({
    queryKey: ['drive-folders', connection.location, current?.remote_id ?? ''],
    refetchOnMount: 'always',
    queryFn: ({ signal }) => apiGet<{ parent_id: string; folders: DriveRoot[] }>(
      `${DRIVE_URL}/${connection.location}/folders?parent_id=${encodeURIComponent(current?.remote_id ?? '')}`, signal),
  });
  const action = useAction();
  const picked = Boolean(current && connection.roots.some(root => root.remote_id === current.remote_id));
  /* 不给 parent_id 时服务端从第一个扫描起点那一层开始，没设过就是账号根目录；带回的 parent_id 说明到底落在哪。 */
  const head = folders.data?.parent_id;
  const start = head ? connection.roots.find(root => root.remote_id === head)?.name ?? head : '账号根目录';
  const trail = [start, ...path.map(folder => folder.name)].join(' / ');

  return (
    <>
      <Stack divided>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Help role="status">{trail}</Help>
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" disabled={!path.length}
              onClick={() => setPath(path.slice(0, -1))}>上一级</Button>
            <Button size="small" variant="secondary" onClick={onClose}>收起</Button>
          </div>
        </div>
        {folders.error ? <ErrorText>{errorMessage(folders.error)}</ErrorText> : null}
        {folders.data && !folders.data.folders.length ? <Help>这个目录里没有子目录。</Help> : null}
      </Stack>
      {folders.data?.folders.length ? (
        <Rows>
          {folders.data.folders.map(folder => (
            <SettingsRow key={folder.remote_id} label={folder.name}>
              <Button size="small" variant="secondary" aria-label={`打开目录 ${folder.name}`}
                onClick={() => setPath([...path, folder])}>打开</Button>
            </SettingsRow>
          ))}
        </Rows>
      ) : null}
      <Stack divided>
        {current ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Help>设为扫描起点后，这一层的子目录都会同步。</Help>
            <Button disabled={picked} onClick={() => {
              if (!current) return;
              const rows = [...connection.roots, current].map(({ remote_id, name }) => ({ remote_id, name }));
              void action.run('save', (signal) => apiSend<{ location: string; roots: string[] }>(
                `${DRIVE_URL}/${connection.location}/roots`, { roots: rows }, 'POST', signal),
                () => { receipt(`已把「${current.name}」设为扫描起点`); onSaved(); });
            }} {...busyProps(action.busy === 'save')}>
              {picked ? '这一层已经是扫描起点' : `设为扫描起点：${current.name}`}
            </Button>
          </div>
        ) : <Help>打开要用的目录，再把它设为扫描起点。一个都不设时，同步从账号根目录开始。</Help>}
        {action.error ? <ErrorText>{action.error}</ErrorText> : null}
      </Stack>
    </>
  );
}
