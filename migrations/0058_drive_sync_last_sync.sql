-- 「上次同步」要覆盖每一次成功同步：增量与全量分开记。
-- `full_synced_at` 只认全量核对，管的是「什么时候该整棵重扫」；`synced_at` 每次成功都写，
-- 「立即刷新」按完才看得见时间在动。
ALTER TABLE drive_sync ADD COLUMN synced_at TEXT;

UPDATE drive_sync SET synced_at = full_synced_at WHERE synced_at IS NULL;
