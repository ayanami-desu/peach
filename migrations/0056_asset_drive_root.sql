-- 扫描起点归属：`drive_root` 记下这个文件是在哪个配置的扫描根下被找到的。
-- 媒体库分组按「扫描根」划分，页面上按库筛选就靠这一列；旧的挂载时代没有这个概念。
ALTER TABLE asset ADD COLUMN drive_root TEXT;

CREATE INDEX IF NOT EXISTS idx_asset_drive_root ON asset(location, drive_root);
