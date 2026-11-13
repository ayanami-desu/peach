/* 配置页（`/settings`，八格页签各自有 `/settings/<键>`）：这台运行 Peach 的电脑上的这几格表单。
 * 媒体不放在 Peach 上（ADR-0157），所以前两格是网盘与媒体库：网盘管账号、凭据与取流方式（`GET /api/drive`），
 * 媒体库管「扫哪些远端目录」（`GET /api/libraries`）；一个媒体库只是一层映射，加删都不碰已扫进来的行。
 * 每个分区各占一格页签，一次只摆一组；本机配置权限与写入条件由服务端判定。
 *
 * `.ui-configpage` 的第一层：最前面是页签条（`.ui-board-local-nav`），后面每组一个 `h2.ui-configgroup` 小标题
 * 紧跟这一组的根节点，根节点就是那一格页签面板。小标题在样式里不显示，它的字已经写在页签上；
 * 没有内容的组连标题与页签一起省略。页签条第一帧就在，和整页同一次提交画出来。
 *
 * 选中哪一格写在地址的锚点上（`#drives`、`#access`……）：网盘授权回跳落在这里，刷新也回到同一格。
 * 同一次打开里换格只改锚点、不重开路由——重开会把表单里的输入一并丢掉。 */
import { useQuery } from '@tanstack/react-query';
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactElement } from 'react';

import { errorMessage } from '../../api';
import { t } from '../../i18n';
import { Button } from '@/components/base/buttons/button';
import type { ConfigurationData, ConfigurationPanel, ConfigurationProps } from '../bundle';
import { Note } from '../components/note';
import { SortableBoardTabs } from '../components/navigation-order';
import { AccessSettings } from './access-settings';
import { ApiTokenSettings } from './api-token-settings';
import { CONFIGURATION_KEY, fetchConfiguration } from './configuration';
import { groupRoot } from './configuration-panel';
import { DeviceSessions } from './device-sessions';
import { DriveSettings } from './drive-settings';
import { LedgerBackupSettings } from './ledger-backup-settings';
import { LibrarySettings } from './library-settings';
import { TaskSpeedSettings } from './service-preferences';
import { StorageSettings } from './storage-settings';
import { busyProps } from './use-action';

/* 页签的次序、锚点与标题：锚点进地址，标题与 `section` 参数（壳按标题要求打开某一格）对得上。 */
/* 深链按标题认格（`configurationSection` 给的是这一串汉字），标题必须与它逐字相同，不能换成 t()。 */
const DATA_TITLE = '存储与备份';
const SECTIONS = [
  { id: 'drives', title: '网盘' },
  { id: 'libraries', title: '媒体库' },
  { id: 'data', title: DATA_TITLE },
  { id: 'access', title: '访问与安全' },
  { id: 'token', title: 'API 令牌' },
  { id: 'devices', title: '设备会话' },
  { id: 'speed', title: '任务速度' },
  { id: 'diagnostics', title: '系统诊断' },
] as const;

/* 地址上的锚点指的是哪一格；手写的、认不出的锚点当作没写（`get` 给 undefined）。 */
const ANCHORED = new Map<string, string>(SECTIONS.map(({ id, title }) => [`#${id}`, title]));

export function ConfigurationPage({ receipt, section = '', diagnostics }: ConfigurationProps & { diagnostics?: ReactElement }) {
  const config = useQuery({
    queryKey: CONFIGURATION_KEY, queryFn: ({ signal }) => fetchConfiguration(signal),
  });
  const data = config.data;
  if (!data) {
    return (
      <div className="ui-configpage">
        <Note tone="error" title={t('settings:configuration.loadFailedTitle')}>
          {config.error ? errorMessage(config.error) : t('settings:configuration.loadFailedBody')}
        </Note>
      </div>
    );
  }
  return <ConfigurationGroups data={data} receipt={receipt} section={section} diagnostics={diagnostics}
    refreshing={config.isFetching} reload={() => { void config.refetch({ cancelRefetch: false }); }} />;
}

function ConfigurationIssues({ data, sections, reload, refreshing }: {
  data: ConfigurationData; sections: string[]; reload(): void; refreshing: boolean;
}) {
  return <>{sections.map(key => {
    const issue = data.section_errors?.[key];
    return issue ? <Note key={key} tone="error" title={issue.title}
      action={<Button variant="secondary" size="small" onClick={reload} {...busyProps(refreshing)}>重新读取</Button>}>{issue.message}</Note> : null;
  })}</>;
}

interface Group { id: string; title: string; body(panel: ConfigurationPanel): ReactElement }

interface GroupsProps {
  data: ConfigurationData;
  receipt(message: string): void;
  section: string;
  diagnostics?: ReactElement;
  reload(): void;
  refreshing: boolean;
}

/* 页签与面板的 id 前缀按页签条计数：每画出一条新的页签条领一个号。 */
let tabSequence = 0;

/* 页签条是一个 tablist，方向键在整排里走、首尾相接，Home／End 到两头，挪到哪一格就选中哪一格、焦点跟过去。
   锚点与选中项同步，表单保持挂载。 */
function ConfigurationGroups({ data, receipt, section, diagnostics, reload, refreshing }: GroupsProps) {
  const [prefix] = useState(() => `board-tabs-${++tabSequence}`);
  const [chosen, setChosen] = useState(() => ANCHORED.get(window.location.hash) ?? section);
  const workspace = useRef<HTMLDivElement>(null);
  const previous = useRef(chosen);
  useEffect(() => { setChosen(ANCHORED.get(window.location.hash) ?? section) }, [section]);
  useEffect(() => {
    const sync = () => {
      const title = ANCHORED.get(window.location.hash);
      if (title) setChosen(title);
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  useLayoutEffect(() => {
    if (previous.current === chosen) return;
    previous.current = chosen;
    const nav = workspace.current?.querySelector<HTMLElement>('.ui-board-local-nav');
    const panel = workspace.current?.querySelector<HTMLElement>('.ui-board-group-active');
    if (!nav || !panel) return;
    const boundary = parseFloat(getComputedStyle(nav).top);
    if (!Number.isFinite(boundary) || nav.getBoundingClientRect().top > boundary + 1) return;
    const top = matchMedia('(max-width:900px)').matches ? nav.getBoundingClientRect().bottom + 8 : boundary;
    window.scrollTo(0, Math.max(0, window.scrollY + panel.getBoundingClientRect().top - top));
  }, [chosen]);
  const choose = (title: string) => {
    setChosen(title);
    const id = SECTIONS.find(item => item.title === title)?.id;
    if (id && window.location.hash !== `#${id}`) window.history.replaceState(window.history.state, '', `#${id}`);
  };
  const [narrow, setNarrow] = useState(() => matchMedia('(max-width:900px)').matches);
  useEffect(() => {
    const media = matchMedia('(max-width:900px)');
    const changed = () => setNarrow(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  const issues = (sections: string[]) => <ConfigurationIssues data={data} sections={sections} reload={reload} refreshing={refreshing} />;
  /* 访问密码一改，已登录设备的修订号跟着换：保存后重读这份配置，设备那一格才不会拿旧修订号去撤销。 */
  const saveAccess = (message: string) => { receipt(message); reload(); };
  const access = data.access;
  const token = data.api_token;
  const groups: Group[] = [
    { id: 'drives', title: '网盘', body: (panel) => <div {...groupRoot(panel)} data-guide-target="drives">
      <DriveSettings receipt={receipt} />
    </div> },
    { id: 'libraries', title: '媒体库', body: (panel) => <div {...groupRoot(panel)} data-guide-target="libraries">
      <LibrarySettings receipt={receipt} />
    </div> },
    { id: 'data', title: DATA_TITLE, body: (panel) => <div {...groupRoot(panel)} data-guide-target="data">
      <StorageSettings receipt={receipt} />
      <LedgerBackupSettings receipt={receipt} />
    </div> },
    ...(access ? [{
      id: 'access', title: '访问与安全',
      body: (panel: ConfigurationPanel) => <div {...groupRoot(panel)} data-guide-target="access">
        {issues(['access'])}
        <AccessSettings initial={access} receipt={saveAccess} />
      </div>,
    }, ...(token ? [{
      id: 'token', title: 'API 令牌',
      body: (panel: ConfigurationPanel) => <div {...groupRoot(panel)} data-guide-target="token">
        {issues(['api_token'])}
        <ApiTokenSettings initial={token} mode={access.mode} receipt={receipt} />
      </div>,
    }] : []), {
      id: 'devices', title: '设备会话',
      body: (panel: ConfigurationPanel) => <div {...groupRoot(panel)} data-guide-target="devices">
        <DeviceSessions revision={access.revision} receipt={receipt} />
      </div>,
    }] : []),
    { id: 'speed', title: '任务速度', body: (panel) => <div {...groupRoot(panel)} data-guide-target="speed">
      <TaskSpeedSettings receipt={receipt} />
    </div> },
    { id: 'diagnostics', title: '系统诊断', body: panel => <div {...groupRoot(panel)} data-guide-target="diagnostics">{panel.active ? diagnostics : null}</div> },
  ];
  const at = Math.max(0, groups.findIndex((item) => item.title === chosen));
  return (
    <div ref={workspace} className="ui-configpage">
      <div className="ui-board-local-nav" data-section-nav="">
        <SortableBoardTabs group="configuration" label="配置分区" value={groups[at].id}
          tabs={groups.map(({ id, title }) => ({ value: id, label: title }))} sectionItems panelPrefix={prefix}
          orientation={narrow ? 'horizontal' : 'vertical'} className=""
          onChange={id => choose(groups.find(group => group.id === id)!.title)} />
      </div>
      {groups.map(({ id, title, body }, i) => (
        <Fragment key={title}>
          <h2 className="ui-configgroup">{title}</h2>
          {body({ index: i, id: `${prefix}-panel-${id}`, labelledBy: `${prefix}-tab-${id}`, active: i === at })}
        </Fragment>
      ))}
    </div>
  );
}
