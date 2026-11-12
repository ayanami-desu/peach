/* 网盘连接：媒体只在网盘上，Peach 只读目录清单与播放所需的字节（ADR-0157）。
 *
 * 一张卡对一个来源，卡里按账号列：同一个来源可以接多个账号（设置文件里的 `[drive.accounts.<账号名>]`，
 * 名字不同而 `location` 相同）。状态全来自 `GET /api/drive`：`configured` 是这台机器有没有该账号的
 * OAuth 客户端凭据，`connected` 是有没有授权过的令牌。没有账号时只给「添加账号」与「开始授权」：
 * 授权整窗跳到网盘同意页，回跳落在 `/settings#drives`。
 * 扫描起点这一层概念收在媒体库一页：一个媒体库就是一个远端目录，加删都在那里做
 * （`POST /api/libraries`、`DELETE /api/libraries/{库}`），这一页只管账号、凭据与取流方式。
 * 「立即刷新」让下一轮同步先做这个账号（`POST /api/drive/{账号}/refresh`）。
 * 取字节方式按来源（`POST /api/drive/{location}/mode`）：`redirect` 让浏览器直接跟网盘的预授权地址走，
 * 不占服务器流量；`proxy` 由 Peach 带 Range 转发，浏览器只跟 Peach 说话。能带鉴权取的来源只能选后者。
 * 「断开」只忘掉这个账号（`DELETE /api/drive/{账号}`），它底下的媒体库跟着消失，已经登记进馆藏的条目不动。
 * 不想开公网回调时可以在这一页直接填客户端 ID、密钥与 refresh token（`POST /api/drive/{账号}/credentials`），
 * Peach 用它们自己换票；顺手填的目录会解析成该账号唯一的媒体库。 */
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmModal } from '@peach/legacy/ui';

import { SettingsRow } from '@/components/application/settings/settings-rows';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';

import {
  DRIVE_KEY, DRIVE_URL, fetchDrives,
  type DriveAccount, type DriveConnection,
} from '@peach/query';

import { apiSend, errorMessage } from '../../api';
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

/** 账号在页面上的称呼：授权过就报邮箱，没授权就报账号名。 */
const accountName = (account: DriveAccount) => account.email || account.display_name || account.key;

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
  return <>
    <CallbackSection publicUrl={data.public_url} receipt={receipt} reloaded={reloaded} />
    {data.locations.map(connection => (
      <DriveCard key={connection.location} connection={connection} publicUrl={data.public_url}
        receipt={receipt} reloaded={reloaded} />
    ))}
  </>;
}

/** 「开始授权」要用的回调基址：写进 `[drive] public_url`，只走手动填认证信息时可以留空。 */
function CallbackSection({ publicUrl, receipt, reloaded }: {
  publicUrl: string; receipt(message: string): void; reloaded(): void;
}) {
  const action = useAction();
  const [value, setValue] = useState(publicUrl);
  useEffect(() => setValue(publicUrl), [publicUrl]);
  const save = () => {
    void action.run('callback', signal => apiSend<{ public_url: string }>(
      `${DRIVE_URL}/public-url`, { public_url: value }, 'POST', signal),
    ({ public_url: saved }) => {
      setValue(saved);
      receipt(saved ? t('settings:drive.callback.saved', { url: saved }) : t('settings:drive.callback.cleared'));
      reloaded();
    });
  };
  return <Section title={t('settings:drive.callback.title')}>
    <Stack>
      <Help>{t('settings:drive.callback.help')}</Help>
      <Input id="drive-public-url" label={t('settings:drive.callback.label')} value={value}
        placeholder={t('settings:drive.callback.placeholder')}
        onChange={next => setValue(next)} />
    </Stack>
    <Footer>
      <Button onClick={save} {...busyProps(action.busy === 'callback')}>
        {t('settings:drive.callback.save')}
      </Button>
    </Footer>
  </Section>;
}

/** 一个来源的卡：取字节方式按来源，账号逐个列。 */
function DriveCard({ connection, publicUrl, receipt, reloaded }: {
  connection: DriveConnection; publicUrl: string; receipt(message: string): void; reloaded(): void;
}) {
  const [state, setState] = useState(connection);
  useEffect(() => setState(connection), [connection]);
  const action = useAction();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    key: '', client_id: '', client_secret: '', refresh_token: '', root: '',
  });

  const field = (name: keyof typeof form) => ({
    id: `drive-${state.location}-${name}`,
    name,
    value: form[name],
    autoComplete: 'off',
    onChange: (value: string) => setForm(current => ({ ...current, [name]: value })),
  });
  const reset = () => setForm({ key: '', client_id: '', client_secret: '', refresh_token: '', root: '' });
  const addAccount = () => {
    const key = form.key.trim() || state.location;
    void action.run('credentials',
      signal => apiSend<DriveConnection>(`${DRIVE_URL}/${encodeURIComponent(key)}/credentials`, {
        client_id: form.client_id,
        client_secret: form.client_secret,
        refresh_token: form.refresh_token,
        root: form.root,
        location: state.location,
      }, 'POST', signal),
      (next) => {
        setState(next);
        setAdding(false);
        reset();
        receipt(t('settings:drive.account.added', { name: key }));
        reloaded();
      });
  };
  const saveMode = (mode: string) => void action.run('mode',
    (signal) => apiSend<{ location: string; mode: string }>(`${DRIVE_URL}/${state.location}/mode`, { mode }, 'POST', signal),
    ({ mode: saved }) => {
      setState({ ...state, mode: saved });
      receipt(t('settings:drive.mode.switched', { label: state.label, mode: modeLabel(saved) }));
    });

  return (
    <Section guide="account" title={state.label}>
      <Stack>
        {state.configured ? null : (
          <Note tone="warning" title={`${state.label} 还没有接入`}>
            {`在下面「添加账号」里填 client_id、client_secret 与 refresh token 就能接上，名字会写进设置文件的 [drive.accounts.<账号名>]；`
              + '要走浏览器授权，还得在 [drive] 段填上这台 Peach 的 https 地址 public_url。'}
          </Note>
        )}
        {state.accounts.length ? null : <Help>{t('settings:drive.account.empty')}</Help>}
        {state.last_error ? <Note tone="warning" title="上次同步失败">{state.last_error}</Note> : null}
        {action.error ? <ErrorText>{action.error}</ErrorText> : null}
      </Stack>
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
      {state.accounts.map(account => (
        <AccountBlock key={account.key} account={account} publicUrl={publicUrl}
          apply={next => setState(next)} receipt={receipt} reloaded={reloaded} />
      ))}
      {adding ? (
        <Stack>
          <Help>{t('settings:drive.manual.help')}</Help>
          <Input label={t('settings:drive.account.name')} hint={t('settings:drive.account.nameHelp')}
            {...field('key')} />
          <Input label={t('settings:drive.manual.clientId')} {...field('client_id')} />
          <Input type="password" label={t('settings:drive.manual.clientSecret')} {...field('client_secret')} />
          <Input type="password" label={t('settings:drive.manual.refreshToken')} {...field('refresh_token')} />
          <Input label={t('settings:drive.manual.root')} hint={t('settings:drive.manual.rootHelp')}
            {...field('root')} />
          <Button onClick={addAccount} {...busyProps(action.busy === 'credentials')}>
            {t('settings:drive.manual.submit')}
          </Button>
        </Stack>
      ) : null}
      <Footer>
        <Button variant="secondary" onClick={() => setAdding(!adding)}>
          {adding ? t('settings:drive.manual.hide') : t('settings:drive.account.add')}
        </Button>
      </Footer>
    </Section>
  );
}

/** 一个账号：扫描起点、同步状态与它自己的授权/断开入口。 */
function AccountBlock({ account, publicUrl, apply, receipt, reloaded }: {
  account: DriveAccount; publicUrl: string; apply(next: DriveConnection): void;
  receipt(message: string): void; reloaded(): void;
}) {
  const action = useAction();
  const base = `${DRIVE_URL}/${encodeURIComponent(account.key)}`;
  const callback = publicUrl ? `${publicUrl.replace(/\/+$/, '')}/oauth/${account.key}/callback` : '';
  const name = accountName(account);

  const refresh = () => void action.run('refresh',
    (signal) => apiSend<DriveConnection>(`${base}/refresh`, {}, 'POST', signal),
    (next) => { apply(next); receipt(t('settings:drive.account.refreshed', { name })); });
  const authorize = () => void action.run('authorize',
    (signal) => apiSend<{ url: string }>(`${base}/authorize`, {}, 'POST', signal),
    ({ url }) => { window.location.assign(url); });
  const forget = () => void confirmModal({
    title: t('settings:drive.account.forgetTitle', { name }),
    body: t('settings:drive.account.forgetBody', { name }),
    confirmLabel: t('settings:drive.account.disconnect'),
    danger: true,
    onConfirm: async () => {
      await apiSend<{ forgotten: string }>(base, {}, 'DELETE');
      receipt(t('settings:drive.account.forgotten', { name }));
      reloaded();
    },
  });

  return (
    <Section title={name} nested>
      <Stack>
        <FactList>
          <Fact term={t('settings:drive.account.name')}>{account.key}</Fact>
          <Fact term="账号">
            {account.connected ? account.email || account.display_name || '已授权' : '未授权'}
          </Fact>
          <Fact term="媒体库">{account.roots.length ? `${account.roots.length} 个目录` : '还没建媒体库'}</Fact>
          <Fact term="上次同步">{account.synced_at || '还没有同步过'}</Fact>
        </FactList>
        {account.last_error ? <Note tone="warning" title="上次同步失败">{account.last_error}</Note> : null}
        {account.configured && !account.connected && !callback ? (
          <Note tone="warning" title="没有配置回调基址">
            {`浏览器授权要回到这台 Peach：先在 [drive] 段填好 public_url（https 地址），`
              + `网盘后台登记的回调地址是 public_url 加上 /oauth/${account.key}/callback。不想开公网回调就直接填认证信息，那条路不用 public_url。`}
          </Note>
        ) : null}
        {action.error ? <ErrorText>{action.error}</ErrorText> : null}
      </Stack>
      <Footer nested status={account.connected ? null : t('settings:drive.account.callback', { url: callback || '未配置' })}>
        {account.connected
          ? <Button variant="secondary" onClick={refresh} {...busyProps(action.busy === 'refresh')}>
              {t('settings:drive.account.refresh')}
            </Button>
          : null}
        {account.connected
          ? <Button variant="secondary" onClick={forget}>{t('settings:drive.account.disconnect')}</Button>
          : null}
        {account.configured
          ? <Button onClick={authorize} disabled={!callback} {...busyProps(action.busy === 'authorize')}>
              {account.connected ? t('settings:drive.account.reauthorize') : t('settings:drive.account.authorize')}
            </Button>
          : null}
      </Footer>
    </Section>
  );
}


