/* 每轮任务的实测读数。高占用仅改变 Chip 强调程度，不调整任务资源使用。 */
import { ResourceChip } from './resource-chip';

import { isActive, type TaskResourceMetric, type TaskRunPayload } from './tasks';

const METRICS = {
  cpu: { name: 'CPU', color: 'blue' },
  gpu: { name: 'GPU', color: 'purple' },
} as const;

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
  const resources = run.resources;
  return <div data-task-resources={run.id} className="flex min-w-0 flex-wrap items-center gap-2">
    {(['cpu', 'gpu'] as const).map((key) => {
      const metric = resources[key];
      const appearance = METRICS[key];
      const value = metric.percent;
      const ready = metric.state === 'ready' && value !== null;
      const high = ready && metric.high;
      const label = ready ? reading(value) : unavailable(metric);
      const explanation = [metric.reason, high ? '当前为高占用。' : ''].filter(Boolean).join('\n');
      return <ResourceChip key={key} color={appearance.color} high={high}
        tabIndex={explanation ? 0 : undefined} title={explanation || undefined}
        data-task-resource={key} data-resource-state={metric.state} data-resource-high={high || undefined}
        data-resource-idle={ready && value === 0 || undefined} data-copy-ignore="">
        {appearance.name} {label}
      </ResourceChip>;
    })}
  </div>;
}
