/* Peach 配置中的后台任务与时间轴缩略图，读写复用设置接口和查询缓存。 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { SettingsRow } from '@/components/application/settings/settings-rows';
import { Select, SelectItem } from '@/components/base/select/select';

import { errorMessage } from '../../api';
import {
  SETTINGS_KEY, THUMBNAIL_JOBS_KEY, fetchSettings, fetchThumbnailJobs, useSaveSettings, useSaveThumbnailMode,
} from '../settings-panel/settings-data';
import { ErrorText, Help, Rows, Section, Stack, TaskCenterLink } from './section';
import { ProcessingMode } from '../library-processing/processing-effort';

const THUMBNAIL_OPTIONS = [['off', '关闭'], ['precise', '每 10 秒一张'], ['coarse', '每 30 秒一张']] as const;

export function TaskSpeedSettings({ receipt }: { receipt(message: string): void }) {
  const settings = useQuery({ queryKey: SETTINGS_KEY, queryFn: ({ signal }) => fetchSettings(signal) });
  const save = useSaveSettings();
  const error = save.error || settings.error;
  return <Section guide="speed" title="后台任务">
    <Rows><SettingsRow label="默认处理速度" description="新任务使用此档位。运行中的任务可在活动页单独调整。">
      <ProcessingMode value={settings.data?.taskSpeedMode || 'standard'} busy={!settings.data || save.isPending}
        onChange={(mode) => save.mutate({ taskSpeedMode: mode }, { onSuccess: () => receipt('已保存默认处理速度') })} />
    </SettingsRow></Rows>
    {error ? <Stack divided><ErrorText>{errorMessage(error)}</ErrorText></Stack> : null}
  </Section>;
}

export function VideoThumbnailRow({ epoch = 0 }: { epoch?: number }) {
  return <Section guide="timeline" title="时间轴缩略图"><VideoThumbnailControls epoch={epoch} /></Section>;
}

export function VideoThumbnailControls({ epoch = 0, disabled = false }: { epoch?: number; disabled?: boolean }) {
  const status = useQuery({ queryKey: THUMBNAIL_JOBS_KEY, queryFn: ({ signal }) => fetchThumbnailJobs(signal), refetchOnMount: 'always' });
  const save = useSaveThumbnailMode();
  const reset = save.reset;
  useEffect(() => { reset() }, [epoch, reset]);
  const data = status.data;
  const error = save.error || status.error;
  return (
    <>
      <Rows>
        <SettingsRow label="时间轴预览" description="按所选间隔从网盘视频抽帧。">
          <div id="videoThumbnailSetting">
            <Select aria-label="缩略图采集间隔" selectedKey={data?.mode || 'off'}
              isDisabled={disabled || !data || status.isFetching || save.isPending}
              onSelectionChange={(key) => { if (key !== null) save.mutate(String(key)) }}>
              {THUMBNAIL_OPTIONS.map(([key, label]) => <SelectItem key={key} id={key}>{label}</SelectItem>)}
            </Select>
          </div>
        </SettingsRow>
      </Rows>
      {save.isPending || data?.status === 'running'
        ? <Stack divided>
            <Help role="status">{save.isPending ? '正在保存…' : '正在采集。'}</Help>
            {save.isPending ? null : <TaskCenterLink className="self-start" />}
          </Stack>
        : null}
      {error ? <Stack divided><ErrorText>{errorMessage(error)}</ErrorText></Stack> : null}
    </>
  );
}
