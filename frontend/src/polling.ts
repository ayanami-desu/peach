/* 进度轮询的共同节律：要查才查的间隔由页面给，读失败按连续失败次数退避，成功一次回到常规间隔。
 *
 * TanStack 的 `refetchInterval` 不区分成功与失败，读失败的查询照样按常规间隔重发；服务端重启、
 * 网盘断开时，一屏几处进度轮询会一起每次重试。这里只改间隔，不碰页面自己的「有事才查」判断。 */

export const BACKOFF_BASE_MS = 2000;
export const BACKOFF_MAX_MS = 30_000;

/** 连着失败第 `failures` 次之后多久再问：4、8、16 秒，之后封顶 30 秒。 */
export const backoffMs = (failures: number): number =>
  Math.min(BACKOFF_BASE_MS * 2 ** Math.min(Math.max(failures, 1), 4), BACKOFF_MAX_MS);

interface PolledState<T> {
  data?: T | undefined;
  status?: string;
  errorUpdateCount?: number;
}

/* Query 每发一次请求就把 `fetchFailureCount` 归零（`retry: 0` 时它只会是 0 或 1），数不出连着
   失败了几次；这里记下最近一次成功时的 `errorUpdateCount`，差值就是这一段连续失败的次数。
   没有数据时重取期间状态回到 `pending`，那不算成功，不归零。 */
const settledErrors = new WeakMap<object, number>();

/** 这个查询从上一次成功算起连着失败了几次；最近一次是成功时为 0。 */
export function failureStreak(query: { state: PolledState<unknown> }): number {
  const { errorUpdateCount = 0, status } = query.state;
  if (status === 'success') {
    settledErrors.set(query, errorUpdateCount);
    return 0;
  }
  if (status !== 'error') return 0;
  return Math.max(1, errorUpdateCount - (settledErrors.get(query) ?? 0));
}

/** 给 TanStack `refetchInterval`：`regular` 按上一份数据给常规间隔（`false` 是不查）；
 *  要查而上一次失败了，按连续失败次数退避，成功一次就回到 `regular`。 */
export function withBackoff<T>(regular: (data: T | undefined) => number | false) {
  return (query: { state: PolledState<T> }): number | false => {
    const interval = regular(query.state.data);
    if (interval === false) return false;
    const failures = failureStreak(query);
    return failures ? backoffMs(failures) : interval;
  };
}
