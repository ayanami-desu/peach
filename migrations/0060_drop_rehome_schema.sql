-- 接回逻辑随身份键作废（ADR-0157 决策九）：`record_rehome` 只服务于「文件消失再把
-- 个人记录接回去」，`replaced_at` 只在接回时标记「寻找更好版本」的目标已替换。
DROP TABLE IF EXISTS record_rehome;
ALTER TABLE asset_quality_goal DROP COLUMN replaced_at;
DELETE FROM ledger_revision WHERE tbl='record_rehome';
