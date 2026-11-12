import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PICK_FOLDER_URL } from '../../src/configuration-endpoints';
import { SetupPage } from '../../src/react/pages/setup/setup-page';
import { SETUP_QUESTIONS_URL, SETUP_URL, type SetupDone, type SetupQuestions } from '../../src/react/pages/setup/setup-api';
import { RESTART_REDIRECT_MS } from '../../src/react/restart-redirect';
import { FIRST_ACCESS_DENIED } from '../../src/react/pages/first-access';
import { buttonNamed, click, mount, settle, switches, type } from './render';
import '../../src/copy-editor-core.js';

const questions = (over: Partial<SetupQuestions> = {}): SetupQuestions => ({
  docker: false,
  access_enabled: true,
  questions: [
    { key: 'data_root', label: '数据目录', help: ['Peach 数据库、缓存和设置文件都放在这里。'], default: 'C:\\peach-data',
      required: true, advanced: false, input: 'folder', prefix: '', suffix: '' },
    { key: 'host', label: '谁可以访问', help: [], default: '2', required: false, advanced: false, input: 'choice',
      prefix: '', suffix: '', options: [{ value: '2', label: '同一局域网的设备' }, { value: '1', label: '只有这台电脑' }] },
    { key: 'port', label: '端口', help: ['浏览器地址里冒号后面的数字，一般不用改。'], default: '8900',
      required: true, advanced: true, input: 'number', prefix: 'localhost:', suffix: '' },
    { key: 'mdns_name', label: '局域网访问地址', help: [], default: 'peach', required: true, advanced: true,
      input: 'text', prefix: 'https://', suffix: '.local', visible_when: { host: '2' } },
    { key: 'drive_public_url', label: '网盘授权回调基址', help: ['网盘授权完成后跳回这里的地址。'], default: '',
      required: false, advanced: true, input: 'text', prefix: '', suffix: '' },
  ],
  ...over,
});

const done = (over: Partial<SetupDone> = {}): SetupDone => ({
  url: 'http://127.0.0.1:8900/?onboarding=1', redirect: null,
  facts: [{ term: '版本', value: '0.9.0' }, { term: '数据目录', value: 'C:\\peach-data' }], ...over,
});

type Reply = { status: number; body: unknown };
/** 按地址回话的假 fetch：同一地址可以排几次回话，最后一次一直重复。 */
function server(routes: Record<string, Reply | Reply[]>) {
  const queues = new Map(Object.entries(routes).map(([url, reply]) => [url, Array.isArray(reply) ? [...reply] : [reply]]));
  const fetcher = vi.fn(async (url: string, _init?: RequestInit) => {
    const queue = queues.get(url);
    if (!queue?.length) throw new Error(`没有为 ${url} 准备回话`);
    const reply = queue.length > 1 ? queue.shift()! : queue[0]!;
    return { ok: reply.status < 400, status: reply.status, json: async () => reply.body };
  });
  vi.stubGlobal('fetch', fetcher);
  const sent = (url: string, index = 0) =>
    JSON.parse(String(fetcher.mock.calls.filter(([called]) => called === url)[index]?.[1]?.body));
  return { fetcher, sent };
}

async function open(over: Partial<SetupQuestions> = {}, routes: Record<string, Reply | Reply[]> = {}) {
  const api = server({ [SETUP_QUESTIONS_URL]: { status: 200, body: questions(over) }, ...routes });
  const host = await mount(<SetupPage />);
  await settle();
  return { host, ...api };
}

const field = (root: ParentNode, key: string) => root.querySelector<HTMLInputElement>(`#f-${key}`);
const radio = (root: ParentNode, label: string) =>
  [...root.querySelectorAll('label')].find((node) => node.textContent?.trim() === label);
const advanced = (root: ParentNode) => [...root.querySelectorAll('summary')].find((node) => node.textContent === '高级设置');
const submitForm = async (root: ParentNode) => {
  for (let count = 0; count < 3 && !buttonNamed('完成设置', root); count++) {
    await click(buttonNamed('开始设置', root) || buttonNamed('继续', root));
    await settle();
  }
  await click(buttonNamed('完成设置', root)); await settle();
};
const alertsWith = (root: ParentNode, message: string) =>
  [...root.querySelectorAll('[role="alert"]')].filter((node) => node.textContent?.includes(message));
const occurrences = (root: HTMLElement, message: string) => (root.textContent ?? '').split(message).length - 1;

it('分步设置返回后保留数据目录，确认前不提交配置', async () => {
  const { host, fetcher } = await open();
  await click(buttonNamed('开始设置', host));
  await type(field(host, 'data_root'), 'F:\\peach-data');
  await click(buttonNamed('继续', host));
  expect(host.querySelector('h1')?.textContent).toBe('在哪里使用 Peach？');
  await click(buttonNamed('返回', host));
  expect(field(host, 'data_root')?.value).toBe('F:\\peach-data');
  expect(fetcher.mock.calls.filter(([url]) => url === SETUP_URL)).toHaveLength(0);
});

it('编辑草稿随步骤匹配场景标题、说明和操作文字', async () => {
  const { host } = await open();
  const core = (globalThis as unknown as { PeachCopyEditorCore: {
    applyDrafts(root: Node, edits: Record<string, string>, originals: WeakMap<Node, string>): void;
  } }).PeachCopyEditorCore;
  const originals = new WeakMap<Node, string>();
  const edits = {
    '你的私人媒体空间。': '私人馆藏。',
    '把喜欢的内容，整理成自己的收藏。': '整理你的收藏。',
    '开始设置': '开始整理', '继续': '下一步', '完成设置': '保存设置',
  };
  const apply = () => core.applyDrafts(host, edits, originals);
  const caption = () => [...host.querySelectorAll('[data-setup-scene-caption] p')].map(node => node.textContent);
  apply();
  expect(caption()).toEqual(['私人馆藏。', '整理你的收藏。']);
  await click(buttonNamed('开始整理', host));
  apply();
  await click(buttonNamed('下一步', host));
  apply();
  await click(buttonNamed('下一步', host));
  apply();
  expect(buttonNamed('保存设置', host)).not.toBeNull();
  for (let count = 0; count < 3; count++) { await click(buttonNamed('返回', host)); apply(); }
  expect(caption()).toEqual(['私人馆藏。', '整理你的收藏。']);
  expect(buttonNamed('开始整理', host)).not.toBeNull();
});

/** 这句错误在页面上只有一份，落在一个 `role="alert"` 里，并由框的 `aria-describedby` 指到。 */
function expectAnnounced(root: HTMLElement, input: Element | null | undefined, message: string) {
  const alerts = alertsWith(root, message);
  expect(alerts).toHaveLength(1);
  expect(occurrences(root, message)).toBe(1);
  const described = (input?.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  expect(described.some((id) => document.getElementById(id)?.contains(alerts[0]!))).toBe(true);
  return alerts[0]!;
}

it('数据目录与访问范围直接显示，回调基址和端口按需展开', async () => {
  const { host } = await open();
  expect(host.querySelector('h1')?.textContent).toBe('欢迎使用 Peach');
  await click(buttonNamed('开始设置', host));
  expect(field(host, 'data_root')?.value).toBe('C:\\peach-data');
  await click(buttonNamed('继续', host));
  expect(advanced(host)?.getAttribute('aria-expanded')).toBe('false');
  expect(field(host, 'port')?.value).toBe('8900');
  expect(host.textContent).toContain('localhost:');
  // 「谁可以访问」是两段式单选，局域网在左边并且默认选中。
  const group = host.querySelector('[role="radiogroup"]')!;
  expect(group.closest('details')).toBeNull();
  expect([...group.querySelectorAll('input[type="radio"]')].map((input) => [
    (input as HTMLInputElement).value, (input as HTMLInputElement).checked])).toEqual([['2', true], ['1', false]]);
});

it('数据目录的按钮让这台电脑弹对话框，选中的路径填回那一格', async () => {
  const { host, sent } = await open({}, { [PICK_FOLDER_URL]: { status: 200, body: { path: 'F:\\Picked' } } });
  await click(buttonNamed('开始设置', host));
  await click(host.querySelector('[aria-label="选择数据目录"]')!);
  await settle();
  expect(sent(PICK_FOLDER_URL)).toEqual({ initial: 'C:\\peach-data' });
  expect(field(host, 'data_root')?.value).toBe('F:\\Picked');
});

it('选「只有这台电脑」时局域网地址整项消失，也不随提交发出去', async () => {
  const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
  await click(buttonNamed('开始设置', host));
  await click(buttonNamed('继续', host));
  expect(field(host, 'mdns_name')).not.toBeNull();
  await click(radio(host, '只有这台电脑'));
  expect(field(host, 'mdns_name')).toBeNull();
  await submitForm(host);
  const body = sent(SETUP_URL);
  expect(body.host).toBe('1');
  expect('mdns_name' in body).toBe(false);
  expect(body.port).toBe('8900');
  expect(body.data_root).toBe('C:\\peach-data');
});

describe('访问密码', () => {
  it('切换访问范围保留已填写的密码，访问地址跟随表单值', async () => {
    const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    await click(buttonNamed('开始设置', host));
    await click(buttonNamed('继续', host));
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'secret-password');
    await type(host.querySelector<HTMLInputElement>('#access-confirm'), 'secret-password');
    await click(radio(host, '只有这台电脑'));
    expect(host.textContent).toContain('http://127.0.0.1:8900/');
    await click(radio(host, '同一局域网的设备'));
    expect(host.textContent).toContain('https://peach.local/');
    await submitForm(host);
    expect(sent(SETUP_URL)).toMatchObject({ access_password: 'secret-password', access_confirm: 'secret-password' });
  });

  it('开关初始按读题接口；关掉后两框收起，提交不带密码', async () => {
    const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    await click(buttonNamed('开始设置', host));
    await click(buttonNamed('继续', host));
    expect(host.querySelector('#access-password')).not.toBeNull();
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'secret-password');
    await click(switches(host)[0]);
    expect(host.querySelector('#access-password')).toBeNull();
    await submitForm(host);
    const body = sent(SETUP_URL);
    expect(body.access_enabled).toBe(false);
    expect('access_password' in body || 'access_confirm' in body).toBe(false);
  });

  it('只在本机访问时开关默认关着，打开后提交两次输入', async () => {
    const { host, sent } = await open({ access_enabled: false }, { [SETUP_URL]: { status: 200, body: done() } });
    await click(buttonNamed('开始设置', host));
    await click(buttonNamed('继续', host));
    expect(host.querySelector('#access-password')).toBeNull();
    await click(switches(host)[0]);
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'correct-password');
    await type(host.querySelector<HTMLInputElement>('#access-confirm'), 'correct-password');
    await submitForm(host);
    expect(sent(SETUP_URL)).toMatchObject({
      access_enabled: true, access_password: 'correct-password', access_confirm: 'correct-password' });
  });
});

describe('填错时原位标错', () => {
  it('数据目录与高级设置里的错误各自标在原位，折叠被展开，已填的都留着', async () => {
    const { host } = await open({}, { [SETUP_URL]: { status: 400, body: {
      error: '有几项需要修改', errors: { data_root: '目录不可写：D:\\Nope', port: '端口要是 1 到 65535 之间的整数' } } } });
    await click(buttonNamed('开始设置', host));
    await type(field(host, 'data_root'), 'D:\\Nope');
    await click(buttonNamed('继续', host));
    await type(field(host, 'port'), '70000');
    await submitForm(host);
    await act(() => new Promise((resume) => requestAnimationFrame(() => resume(null))));
    expect(host.querySelector('h1')?.textContent).toBe('数据目录放在哪里？');
    expect(field(host, 'data_root')?.value).toBe('D:\\Nope');
    expect(field(host, 'data_root')?.getAttribute('aria-invalid')).toBe('true');
    expectAnnounced(host, field(host, 'data_root'), '目录不可写：D:\\Nope');
    await click(buttonNamed('继续', host));
    expect(advanced(host)?.getAttribute('aria-expanded')).toBe('true');
    expect(field(host, 'port')?.value).toBe('70000');
    expect(field(host, 'port')?.getAttribute('aria-invalid')).toBe('true');
    expectAnnounced(host, field(host, 'port'), '端口要是 1 到 65535 之间的整数');
  });

  it('密码的错误挂在密码框下，开关保持打开', async () => {
    const { host } = await open({}, { [SETUP_URL]: { status: 400, body: {
      error: '有几项需要修改', errors: { access_password: '两次输入的访问密码不一致' } } } });
    await click(buttonNamed('开始设置', host));
    await click(buttonNamed('继续', host));
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'first-password');
    await submitForm(host);
    expect(switches(host)[0]!.checked).toBe(true);
    expect(host.querySelector('#access-password')?.getAttribute('aria-invalid')).toBe('true');
    expect(host.querySelector<HTMLInputElement>('#access-password')?.value).toBe('first-password');
    const first = expectAnnounced(host, host.querySelector('#access-password'), '两次输入的访问密码不一致');
    // 同一句错误再提交一次：提示换成新节点，读屏重新播报，页面上仍只有一份。
    await submitForm(host);
    const second = expectAnnounced(host, host.querySelector('#access-password'), '两次输入的访问密码不一致');
    expect(second).not.toBe(first);
  });
});

describe('完成态', () => {
  it('成功后同一页换成完成态：入口链接与运行信息默认收起', async () => {
    const { host } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    await submitForm(host);
    expect(host.querySelector('h1')?.textContent).toBe('可以开始使用了');
    expect(host.textContent).toContain('设置已保存，之后可以在配置页里改。');
    const entry = [...host.querySelectorAll('a')].find((link) => link.textContent === '进入 Peach');
    expect(entry?.getAttribute('href')).toBe('http://127.0.0.1:8900/?onboarding=1');
    expect(document.activeElement).toBe(entry);
    const facts = [...host.querySelectorAll('summary')].find((node) => node.textContent === '运行信息');
    expect(facts?.getAttribute('aria-expanded')).toBe('false');
    expect(document.title).toBe('Peach · 设置完成');
  });

  it('Docker 部署给了跳转地址：等满与配置页同一个时长再跳', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const { host } = await open({}, { [SETUP_URL]: { status: 200, body: done({
      redirect: 'http://127.0.0.1:8900/?onboarding=1' }) } });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await submitForm(host);
    await act(async () => { vi.advanceTimersByTime(RESTART_REDIRECT_MS - 1) });
    expect(assign).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(1) });
    expect(assign).toHaveBeenCalledWith('http://127.0.0.1:8900/?onboarding=1');
  });

  it('源码部署不给跳转地址，页面不自己跳', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const { host } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await submitForm(host);
    await act(async () => { vi.advanceTimersByTime(RESTART_REDIRECT_MS * 2) });
    expect(assign).not.toHaveBeenCalled();
  });
});

describe('Docker', () => {
  const docker = (over: Partial<SetupQuestions> = {}) => ({
    docker: true, data_root: '/data', access_preset: false, questions: [], ...over,
  });

  it('只问访问密码，数据目录与监听地址都不出题，也不提供接回已有数据', async () => {
    const { host, sent } = await open(docker(), { [SETUP_URL]: { status: 200, body: done({ url: '/?onboarding=1' }) } });
    expect(buttonNamed('使用已有数据', host)).toBeNull();
    expect(host.querySelector('[aria-label^="首次设置"]')?.getAttribute('aria-label')).toBe('首次设置，第 1 步，共 4 步');
    await click(buttonNamed('开始设置', host)); await settle();
    expect(field(host, 'data_root')).toBeNull();
    await click(buttonNamed('继续', host)); await settle();
    expect(host.querySelector('h1')?.textContent).toBe('访问与网络');
    expect(radio(host, '只有这台电脑')).toBeUndefined();
    expect(advanced(host)).toBeUndefined();
    expect(host.textContent).not.toContain('访问地址：');
    expect(host.querySelector('#access-password')).not.toBeNull();
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'correct-password');
    await type(host.querySelector<HTMLInputElement>('#access-confirm'), 'correct-password');
    await click(buttonNamed('继续', host)); await settle();
    expect(host.textContent).toContain('/data');
    expect(host.textContent).toContain('按 Compose 端口映射 · 使用访问密码');
    await click(buttonNamed('完成设置', host)); await settle();
    const body = sent(SETUP_URL);
    expect(body).toMatchObject({ access_enabled: true, access_password: 'correct-password' });
    expect(['data_root', 'host', 'port', 'mdns_name'].filter((key) => key in body)).toEqual([]);
  });

  it('已按 PEACH_ACCESS_PASSWORD 设好访问密码时只标明已设置，提交不带密码', async () => {
    const { host, sent } = await open(docker({ access_preset: true }), { [SETUP_URL]: { status: 200, body: done() } });
    await click(buttonNamed('开始设置', host)); await settle();
    await click(buttonNamed('继续', host)); await settle();
    expect(switches(host)).toHaveLength(0);
    expect(host.querySelector('#access-password')).toBeNull();
    expect(host.textContent).toContain('已按 PEACH_ACCESS_PASSWORD 设置访问密码');
    await submitForm(host);
    const body = sent(SETUP_URL);
    expect(body.access_enabled).toBe(false);
    expect('access_password' in body).toBe(false);
  });

  it('来源不是部署机器或局域网时说清楚去哪里打开，或用 PEACH_ACCESS_PASSWORD', async () => {
    server({ [SETUP_QUESTIONS_URL]: { status: 403, body: { error: FIRST_ACCESS_DENIED, docker: true } } });
    const host = await mount(<SetupPage />);
    await settle();
    expect(host.querySelector('form')).toBeNull();
    expect(host.querySelector('[role="alert"]')?.textContent).toBe(FIRST_ACCESS_DENIED);
  });
});

it('别的设备打开时读题接口回 403，只说去哪里打开、不画表单', async () => {
  server({ [SETUP_QUESTIONS_URL]: { status: 403, body: { error: 'setup is loopback-only' } } });
  const host = await mount(<SetupPage />);
  await settle();
  expect(host.querySelector('form')).toBeNull();
  expect(host.querySelector('[role="alert"]')?.textContent).toBe('请在运行 Peach 的服务器上打开设置。');
});

it('读题失败时给原因和重试', async () => {
  const { fetcher } = server({ [SETUP_QUESTIONS_URL]: [
    { status: 500, body: { error: '服务出错了' } }, { status: 200, body: questions() }] });
  const host = await mount(<SetupPage />);
  await settle();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('服务出错了');
  await click(buttonNamed('立即重试', host));
  await settle();
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(host.querySelector('form')).not.toBeNull();
});
