/* 各页面的进度轮询：要查时读失败按连续失败次数退避，成功回到常规间隔，不查时照旧不查。 */
import { describe, expect, it } from 'vitest';

import { backoffMs } from '../../src/polling';
import { backgroundIssuesInterval } from '../../src/react/activity/background-issues';
import { choicesInterval } from '../../src/react/avatar-picker/avatar-picker';
import { pendingRefetch } from '../../src/react/components/pending-work';
import { exportInterval } from '../../src/react/diagnostics/scraping-export';

type Interval = (query: never) => number | false;
const at = (interval: Interval, state: object) => interval({ state } as never);

/** 每一处：[名字, 间隔函数, 在跑的数据, 常规间隔, 停了的数据]。 */
const SITES: [string, Interval, object, number, object | null][] = [
  ['换头像候选索引', choicesInterval as Interval, { index_refreshing: true }, 1000, { index_refreshing: false }],
  ['诊断导出', exportInterval as Interval, { status: 'running' }, 1000, { status: 'complete' }],
  ['资料补全', pendingRefetch as Interval, { pending_work: [{ task_key: 'x', label: '封面', status: 'running' }] },
    4000, { pending_work: [] }],
  ['后台问题', backgroundIssuesInterval as Interval, { issues: [] }, 30_000, null],
];

describe('页面进度轮询的失败退避', () => {
  it.each(SITES)('%s：读失败退避，成功回到常规间隔', (_name, interval, running, regular, stopped) => {
    expect(at(interval, { data: running, status: 'success' })).toBe(regular);
    expect(at(interval, { data: running, status: 'error', errorUpdateCount: 1 })).toBe(backoffMs(1));
    expect(at(interval, { data: running, status: 'error', errorUpdateCount: 3 })).toBe(backoffMs(3));
    if (stopped) expect(at(interval, { data: stopped, status: 'success' })).toBe(false);
  });
});
