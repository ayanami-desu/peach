import { apiGet } from '../../api';
import type { FaceRef } from '@peach/card-art';
import { queryClient } from '../query';

export interface JavDetail {
  ok: boolean; state: 'ready' | 'partial'; message?: string;
  code: string; title: string; release_date?: string; studio?: string;
  duration?: number; score?: number; summary: string;
  director: string; publisher: string;
  performers: string; performer_refs: JavEntityRef[]; studio_refs: JavEntityRef[]; series_refs: JavEntityRef[];
  tags: string[]; has_cover: boolean; cover_version?: string; cover_url?: string;
  tag_refs?: { name: string; category: string; source_name: string }[];
  preview_video_url?: string; preview_state?: string;
  source_image: boolean; preview_count: number; comments_count: number;
  source_url: string; checked_at?: string; cache_stale?: boolean;
}
export interface JavEntityRef extends FaceRef { name: string; gender?: 'female' | 'male' | 'unknown'; has_logo?: boolean; source_actor_id?: string; source_avatar?: boolean }
export interface JavDetailProps {
  code: string; readOnly: boolean;
  actions: { close(): void; navigate(path: string): void; openTag(tag: string): void; receipt(message: string): void;
    canonicalCode?(code: string): void };
}
export const javDetailKey = (code: string) => ['jav-detail', code] as const;
export const fetchJavDetail = (code: string, signal?: AbortSignal, refresh = false) =>
  apiGet<JavDetail>(`/api/jav/detail?code=${encodeURIComponent(code)}${refresh ? '&refresh=1' : ''}`, signal);
export const prefetchJavDetail = (props: JavDetailProps, signal: AbortSignal) =>
  queryClient.ensureQueryData({ queryKey: javDetailKey(props.code), queryFn: () => fetchJavDetail(props.code, signal),
    staleTime: 6 * 3600_000, revalidateIfStale: true });
