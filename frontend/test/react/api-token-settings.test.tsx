/* 访问口令分区：换口令先说清谁要重新登录，新口令只显示这一次。
 * 外观由预览与 e2e 量。 */
import { notifyManager, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import * as legacyUi from '@peach/legacy/ui';

import { queryClient } from '../../src/react/query';
import { ApiTokenSettings, rotationEffect } from '../../src/react/settings/api-token-settings';
import { buttonNamed, click, mount, section, settle } from './render';

notifyManager.setScheduler(notify => notify());
afterEach(() => { queryClient.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals() });

type Confirmation = Parameters<typeof legacyUi.confirmModal>[0];
function confirmWith(answer: boolean) {
  const seen: Confirmation[] = [];
  vi.spyOn(legacyUi, 'confirmModal').mockImplementation((async (options: Confirmation) => {
    seen.push(options);
    if (answer) await options.onConfirm?.();
    return { confirmed: answer };
  }) as typeof legacyUi.confirmModal);
  return seen;
}

function serve(body: unknown) {
  const fetcher = vi.fn(async () => ({ ok: true, status: 200, json: async () => body }));
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}

const rotatable = { rotatable: true, reason: '', paired: false };
const render = (node: ReactNode) => mount(<QueryClientProvider client={queryClient}>{node}</QueryClientProvider>);

it('确认文案按访问方式说清谁要重新登录', () => {
  expect(rotationEffect('password', false)).toContain('用访问密码登录的浏览器不受影响');
  expect(rotationEffect('legacy', false)).toContain('其他浏览器现在用这串口令登录，会全部退出');
  expect(rotationEffect('open', false)).toContain('浏览器不需要登录，不受影响');
  expect(rotationEffect('password', true)).toContain('另一台电脑要换成同一份口令文件');
  for (const mode of ['password', 'legacy', 'open'] as const) {
    expect(rotationEffect(mode, false)).toContain('用旧口令的脚本和 API 调用会立即失效');
  }
});

it('取消确认就不发请求，确认后显示新口令一次', async () => {
  const fetcher = serve({ ...rotatable, token: 'new-token-value', mode: 'legacy', signed_out: 2 });
  const receipt = vi.fn();
  const seen = confirmWith(false);
  const host = await render(<ApiTokenSettings initial={rotatable} mode="legacy" receipt={receipt} />);
  await click(buttonNamed('更换口令', host)!);
  expect(seen[0]!.body).toBe(rotationEffect('legacy', false));
  expect(fetcher).not.toHaveBeenCalled();

  vi.restoreAllMocks();
  confirmWith(true);
  await click(buttonNamed('更换口令', host)!);
  await settle();
  expect(fetcher).toHaveBeenCalledWith('/api/configuration/access/token/rotate', expect.objectContaining({ method: 'POST' }));
  const card = section(host, '访问口令')!;
  expect(card.querySelector<HTMLInputElement>('input[readonly]')!.value).toBe('new-token-value');
  expect(card.textContent).toContain('新口令只显示这一次');
  expect(receipt).toHaveBeenCalledWith('已更换访问口令，2 台设备需要重新登录');
});

it('口令被启动参数覆盖时只写原因，不给更换键', async () => {
  const host = await render(<ApiTokenSettings initial={{ rotatable: false, reason: '口令由启动参数指定。', paired: false }}
    mode="password" receipt={vi.fn()} />);
  expect(buttonNamed('更换口令', host)).toBeNull();
  expect(section(host, '访问口令')!.textContent).toContain('口令由启动参数指定。');
});
