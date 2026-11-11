import { act } from 'react';
import { QueryClientProvider, notifyManager, useQuery } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';

import { createResultRefresher } from '../../src/react/result-updates';
import { queryClient } from '../../src/react/query';
import { mount, pending } from './render';

notifyManager.setScheduler(notify => notify());
afterEach(() => queryClient.clear());

it('未显示页面的后台预取继续读取，不阻塞当前页面的版本处理', async () => {
  const old = pending<string>();
  const prefetched = queryClient.fetchQuery({ queryKey: ['item', 3], queryFn: () => old.answer });
  await createResultRefresher()({ catalog: '1' }, { catalog: '2' });
  expect(queryClient.getQueryState(['item', 3])?.fetchStatus).toBe('fetching');
  await old.release('预取内容');
  expect(await prefetched).toBe('预取内容');
});

it('版本到达前已发出的读取结束后再核查一次，旧响应不能盖住确认结果', async () => {
  const old = pending<string>();
  let reads = 0;
  function Item() {
    const item = useQuery({ queryKey: ['item', 2], queryFn: () => ++reads === 1 ? old.answer : Promise.resolve('确认结果') });
    return <p>{item.data}</p>;
  }
  const host = await mount(<QueryClientProvider client={queryClient}><Item /></QueryClientProvider>);
  const refresh = createResultRefresher();
  const completed = refresh({ catalog: '1' }, { catalog: '2' });
  await old.release('旧响应');
  await act(async () => { await completed; });
  expect(reads).toBe(2);
  expect(host.textContent).toBe('确认结果');
});

it('缓慢读取期间的下一项结果排队刷新，不取消读取且不遗漏新值', async () => {
  const first = pending<string>();
  let reads = 0;
  queryClient.setQueryData(['item', 1], '旧标题');
  function Item() {
    const item = useQuery({ queryKey: ['item', 1], queryFn: () => ++reads === 1 ? first.answer : Promise.resolve('最终标题') });
    return <p>{item.data}</p>;
  }
  const host = await mount(<QueryClientProvider client={queryClient}><Item /></QueryClientProvider>);
  const refresh = createResultRefresher();
  let completed: Promise<void>;
  await act(async () => {
    completed = refresh({ catalog: '1' }, { catalog: '2' });
    void refresh({ catalog: '2' }, { catalog: '3' });
  });
  expect(host.textContent).toBe('旧标题');
  await first.release('中间标题');
  await act(async () => { await completed!; });
  expect(reads).toBe(2);
  expect(host.textContent).toBe('最终标题');
});

it('入库通知：首轮只记基线；新到的逐部弹 toast 并可打开，一轮超过 3 部合成一条，服务重启后不补弹', async () => {
  const toaster = await import('../../src/react/toaster');
  const shown = vi.spyOn(toaster, 'showToast').mockImplementation(() => {});
  const go = vi.fn();
  const { announceIngests } = await import('../../src/react/result-updates');
  const notice = (id: number, kind: 'download' | 'discovered' = 'download', label = `SSIS-${id}`) =>
    ({ id, kind, asset_id: 100 + id, label, at: 0 });
  let seen = announceIngests(null, { epoch: 'a', items: [notice(1), notice(2)] }, go);
  expect(shown).not.toHaveBeenCalled();
  seen = announceIngests(seen, { epoch: 'a', items: [notice(1), notice(2), notice(3), notice(4, 'discovered', '<b>x</b>')] }, go);
  expect(shown.mock.calls.map(([, request]) => request.html)).toEqual(
    ['「SSIS-3」已入库并整理完成', '新文件已入库：「&#60;b&#62;x&#60;/b&#62;」']);
  shown.mock.calls[0]![1].action!.run(document.createElement('button'));
  expect(go).toHaveBeenCalledWith(103);
  shown.mockClear();
  seen = announceIngests(seen, { epoch: 'a', items: [5, 6, 7, 8].map(id => notice(id)) }, go);
  expect(shown.mock.calls.map(([, request]) => [request.html, request.action])).toEqual([['4 部作品已入库', null]]);
  shown.mockClear();
  announceIngests(seen, { epoch: 'b', items: [notice(1)] }, go);
  expect(shown).not.toHaveBeenCalled();
  shown.mockRestore();
});
