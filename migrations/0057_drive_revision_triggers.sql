-- 网盘直连带来的两处版本号补齐（ADR-0157）。
--
-- 1. `asset` 新增 `remote_id`、`drive_root`：改成资源身份与扫描起点归属之后，这两个值变了
--    就要让按版本缓存的聚合重算，所以补进 0054 那份 `UPDATE OF` 白名单。
-- 2. `drive_sync` 是 0055 新建的表，按 0038 的约定同样要有增删改三个触发器：扫描游标与
--    `last_error` 是进程外写的，服务只能靠触发器看见变化。
DROP TRIGGER rev_asset_update;
CREATE TRIGGER rev_asset_update AFTER UPDATE OF
  id, location, path, name, medium, size, mtime, hash_kind, hash, creator, studio, series, code,
  duration, width, height, vcodec, fps, has_audio, ctx_length, ctx_orient, ctx_quality, ctx_pace,
  ctx_people, play_count, rating, o_count, watch_ratio, source_id, stash_scene_id, snapshot_path,
  first_seen, last_seen, feedback, disposal, feedback_at, release_date, catalog_title,
  original_title, field_owners, mutation_revision, region, disposal_reason, remote_id, drive_root
ON asset BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='asset';
END;

CREATE TRIGGER IF NOT EXISTS rev_drive_sync_insert AFTER INSERT ON drive_sync BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='drive_sync';
END;
CREATE TRIGGER IF NOT EXISTS rev_drive_sync_update AFTER UPDATE ON drive_sync BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='drive_sync';
END;
CREATE TRIGGER IF NOT EXISTS rev_drive_sync_delete AFTER DELETE ON drive_sync BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='drive_sync';
END;

INSERT OR IGNORE INTO ledger_revision(tbl, n) VALUES ('drive_sync', 0);
