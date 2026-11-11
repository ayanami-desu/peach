/* 逐层列某个网盘账号的远端目录：只出子目录，「打开」进一层，「上一级」退回去。
 * 媒体库页用它挑目录：挑到哪一层，哪一层的整棵子树就是那个库的扫描范围。
 * 子目录来自 `GET /api/drive/{账号}/folders`，不给 `parent_id` 时从账号根目录开始。 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { SettingsRow } from '@/components/application/settings/settings-rows';
import { Button } from '@/components/base/buttons/button';
import { DRIVE_URL, type DriveRoot } from '@peach/query';

import { apiGet, errorMessage } from '../../api';
import { t } from '../../i18n';
import { ErrorText, Help, Rows, Stack } from './section';

export function FolderPicker({ account, onPick, onClose }: {
  account: string; onPick(folder: DriveRoot): void; onClose(): void;
}) {
  const [path, setPath] = useState<DriveRoot[]>([]);
  const current = path.length ? path[path.length - 1] : null;
  const folders = useQuery({
    queryKey: ['drive-folders', account, current?.remote_id ?? ''],
    queryFn: ({ signal }) => apiGet<{ parent_id: string; folders: DriveRoot[] }>(
      `${DRIVE_URL}/${encodeURIComponent(account)}/folders`
      + (current ? `?parent_id=${encodeURIComponent(current.remote_id)}` : ''), signal),
  });
  const trail = [t('settings:library.folder.root'), ...path.map(item => item.name)].join(' / ');

  return (
    <>
      <Stack divided>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Help role="status">{trail}</Help>
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" disabled={!path.length}
              onClick={() => setPath(path.slice(0, -1))}>{t('settings:library.folder.up')}</Button>
            <Button size="small" variant="secondary" onClick={onClose}>{t('settings:library.folder.close')}</Button>
          </div>
        </div>
        {folders.error ? <ErrorText>{errorMessage(folders.error)}</ErrorText> : null}
        {folders.data && !folders.data.folders.length ? <Help>{t('settings:library.folder.empty')}</Help> : null}
      </Stack>
      {folders.data?.folders.length ? (
        <Rows>
          {folders.data.folders.map(folder => (
            <SettingsRow key={folder.remote_id} label={folder.name}>
              <Button size="small" variant="secondary"
                aria-label={t('settings:library.folder.openLabel', { name: folder.name })}
                onClick={() => setPath([...path, folder])}>{t('settings:library.folder.open')}</Button>
            </SettingsRow>
          ))}
        </Rows>
      ) : null}
      <Stack divided>
        {current ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Help>{t('settings:library.folder.hint')}</Help>
            <Button onClick={() => onPick(current)}>{t('settings:library.folder.use', { name: current.name })}</Button>
          </div>
        ) : <Help>{t('settings:library.folder.start')}</Help>}
      </Stack>
    </>
  );
}
