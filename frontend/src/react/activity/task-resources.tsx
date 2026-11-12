/* 每轮任务的实测读数。高占用仅改变 Chip 强调程度，不调整任务资源使用。 */
import { ResourceChip } from './resource-chip';

import { isActive, type TaskResourceMetric, type TaskRunPayload } from './tasks';

function unavailable(metric: TaskResourceMetric) {
  if (metric.state === 'sampling') return '采样中';
  return '未取得';
}

/* 读数为 0 说的是这一轮没占用这项资源，直接写「未使用」，不让人去读一个 0。 */
function reading(value: number) {
  if (value === 0) return '未使用';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

export function TaskResources({ run, active = isActive(run) || Boolean(run.control) }: {
  run: TaskRunPayload; active?: boolean;
}) {
  if (!active || !run.resources) return null;
  const { cpu } = run.resources;
  const value = cpu.percent;
  const ready = cpu.state === 'ready' && value !== null;
  const high = ready && cpu.high;
  const label = ready ? reading(value) : unavailable(cpu);
  const explanation = [cpu.reason, high ? '当前为高占用。' : ''].filter(Boolean).join('\n');
  return <div data-task-resources={run.id} className="flex min-w-0 flex-wrap items-center gap-2">
    <ResourceChip color="blue" high={high}
      tabIndex={explanation ? 0 : undefined} title={explanation || undefined}
      data-task-resource="cpu" data-resource-state={cpu.state} data-resource-high={high || undefined}
      data-resource-idle={ready && value === 0 || undefined} data-copy-ignore="">
      CPU {label}
    </ResourceChip>
  </div>;
}
