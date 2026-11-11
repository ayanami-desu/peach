/* 网盘连接快照（`GET /api/drive`）。媒体只在网盘上（ADR-0157），所以「这台机器配了哪些来源」
 * 看的是这里的 `configured`（有 OAuth 客户端凭据）与扫描起点，而不是挂载来源的可达性。
 * 设置页与重复文件页共读这一个查询键，实例随主包只发一份。 */
import { apiGet } from '../api';

export const DRIVE_URL = '/api/drive';
export const DRIVE_KEY = ['drive'] as const;

export interface DriveRoot { remote_id: string; name: string }

export interface DriveConnection {
  location: string;
  label: string;
  /** 这台机器有这个网盘的 OAuth 客户端凭据。 */
  configured: boolean;
  /** 有授权过的账号。 */
  connected: boolean;
  email: string;
  display_name: string;
  roots: DriveRoot[];
  /** 现在的取字节方式：`redirect` 让浏览器跟网盘的预授权地址走，`proxy` 由 Peach 转发 Range。 */
  mode: string;
  /** 这个网盘能选的方式。只能带鉴权取的来源只有 `proxy` 一项。 */
  modes: string[];
  /** 上次同步完成的时刻（服务端本地时间 `YYYY-MM-DD HH:MM:SS`），没同步过是 null。 */
  synced_at: string | null;
  last_error: string;
}

export interface DriveSnapshot { public_url: string; locations: DriveConnection[] }

export const fetchDrives = (signal?: AbortSignal) => apiGet<DriveSnapshot>(DRIVE_URL, signal);

/** 配了凭据又有扫描起点的网盘：重复文件页据此给出「每组优先保留哪个盘」。 */
export const configuredLocations = (data: DriveSnapshot | undefined): string[] =>
  (data?.locations ?? []).filter((drive) => drive.configured && drive.roots.length > 0)
    .map((drive) => drive.location);
