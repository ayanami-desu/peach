/* 轮询的共同节律：失败退避、恢复后回到常规间隔。 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryObserver } from '@tanstack/query-core';

import { backoffMs, failureStreak, withBackoff } from '../src/polling';

afterEach(() => { vi.useRealTimers() });

describe('退避间隔', () => {
  it('连着失败按 4、8、16 秒拉长，封顶 30 秒', () => {
    expect([1, 2, 3, 4, 5, 9].map(backoffMs)).toEqual([4000, 8000, 16_000, 30_000, 30_000, 30_000]);
  });

  it('Query 的连续失败次数按上一次成功起算，成功一次就归零', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
    let fail = true;
    const query = () => client.getQueryCache().find({ queryKey: ['x'] })!;
    const fetchOnce = () => client.fetchQuery({ queryKey: ['x'], staleTime: 0,
      queryFn: async () => { if (fail) throw new Error('down'); return 1 } }).catch(() => undefined);
    await fetchOnce();
    expect(failureStreak(query())).toBe(1);
    await fetchOnce();
    await fetchOnce();
    expect(failureStreak(query())).toBe(3);
    fail = false;
    await fetchOnce();
    expect(failureStreak(query())).toBe(0);
    fail = true;
    await fetchOnce();
    expect(failureStreak(query()), '恢复后的下一次失败从 1 数起').toBe(1);
  });

  it('`withBackoff` 不查时照旧不查；要查时失败退避，成功回到常规间隔', () => {
    const interval = withBackoff<{ busy: boolean }>((data) => (data?.busy ? 5000 : false));
    const at = (state: object) => interval({ state } as never);
    expect(at({ data: { busy: false }, status: 'success' })).toBe(false);
    expect(at({ data: { busy: true }, status: 'success' })).toBe(5000);
    expect(at({ data: { busy: true }, status: 'error', errorUpdateCount: 2 })).toBe(8000);
    expect(at({ data: { busy: false }, status: 'error', errorUpdateCount: 2 })).toBe(false);
  });

  it('TanStack 观察者按退避间隔重取，读到了回到常规间隔', async () => {
    vi.useFakeTimers();
    const client = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
    let fail = true;
    const read = vi.fn(async () => { if (fail) throw new Error('down'); return { busy: true } });
    const observer = new QueryObserver(client, { queryKey: ['y'], queryFn: read,
      refetchInterval: withBackoff<{ busy: boolean }>(() => 2000) });
    const stop = observer.subscribe(() => {});
    await vi.advanceTimersByTimeAsync(0);
    expect(read).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(4000);
    expect(read).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(8000);
    expect(read).toHaveBeenCalledTimes(3);
    fail = false;
    await vi.advanceTimersByTimeAsync(16_000);
    expect(read).toHaveBeenCalledTimes(4);
    await vi.advanceTimersByTimeAsync(2000);
    expect(read, '恢复后回到两秒').toHaveBeenCalledTimes(5);
    stop();
  });
});
