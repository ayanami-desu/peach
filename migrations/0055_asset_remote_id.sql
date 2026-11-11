-- 网盘直连（ADR-0157）：远端 id 是资源身份，path 降级为展示用的虚拟路径。
-- 旧来源行（115/PikPak/光鸭/已挂载网盘）保留原样只读展示，remote_id 为空不参与扫描与播放。
ALTER TABLE asset ADD COLUMN remote_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_remote_id
ON asset(location, remote_id)
WHERE remote_id IS NOT NULL;

-- 每个网盘账号一份增量游标与最近一次全量核对时间。
CREATE TABLE IF NOT EXISTS drive_sync(
  location TEXT PRIMARY KEY,
  account_id TEXT NOT NULL DEFAULT '',
  cursor TEXT,
  full_synced_at TEXT,
  last_error TEXT
);
