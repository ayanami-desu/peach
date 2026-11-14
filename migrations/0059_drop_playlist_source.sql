-- 播放列表不再记录 Mix 来源。两列分别带 CHECK 与 REFERENCES，SQLite 不能直接
-- ALTER TABLE DROP COLUMN；重建 playlist 与 playlist_item，保留列表、条目、顺序和续播位置。
--
-- 先建新表并 copy，再按子表、父表的顺序删旧表。foreign_keys 在迁移里是打开的，先删
-- playlist 会触发 playlist_item 的级联删除，所以必须先删 playlist_item。
-- 0038 的三对 ledger_revision 触发器挂在旧表上，随 DROP TABLE 一起消失，下面原样重建。

CREATE TABLE playlist_0059(
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 80),
  current_asset_id INTEGER REFERENCES asset(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO playlist_0059(id,profile_id,name,current_asset_id,created_at,updated_at)
SELECT id,profile_id,name,current_asset_id,created_at,updated_at FROM playlist;

CREATE TABLE playlist_item_0059(
  playlist_id INTEGER NOT NULL REFERENCES playlist_0059(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK(position >= 0),
  added_at TEXT NOT NULL,
  PRIMARY KEY(playlist_id,asset_id),
  UNIQUE(playlist_id,position)
);

INSERT INTO playlist_item_0059(playlist_id,asset_id,position,added_at)
SELECT playlist_id,asset_id,position,added_at FROM playlist_item;

DROP TABLE playlist_item;
DROP TABLE playlist;
ALTER TABLE playlist_0059 RENAME TO playlist;
ALTER TABLE playlist_item_0059 RENAME TO playlist_item;

CREATE INDEX idx_playlist_profile_updated
ON playlist(profile_id,updated_at DESC,id DESC);

CREATE INDEX idx_playlist_item_asset
ON playlist_item(asset_id,playlist_id);

CREATE TRIGGER rev_playlist_insert AFTER INSERT ON playlist BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='playlist';
END;

CREATE TRIGGER rev_playlist_update AFTER UPDATE ON playlist BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='playlist';
END;

CREATE TRIGGER rev_playlist_delete AFTER DELETE ON playlist BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='playlist';
END;

CREATE TRIGGER rev_playlist_item_insert AFTER INSERT ON playlist_item BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='playlist_item';
END;

CREATE TRIGGER rev_playlist_item_update AFTER UPDATE ON playlist_item BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='playlist_item';
END;

CREATE TRIGGER rev_playlist_item_delete AFTER DELETE ON playlist_item BEGIN
  UPDATE ledger_revision SET n=n+1 WHERE tbl='playlist_item';
END;
