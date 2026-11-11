import { avatarInner, faceOrigin, type FaceRef } from '@peach/card-art';
import type { IndexPerson, IndexProps, IndexRoute, PersonAvatar } from './index-data';

export function indexPath({ kind, q, view, category }: IndexRoute): string {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (kind === 'tags') {
    params.set('view', view);
    if (category !== 'all') params.set('category', category);
  }
  if (kind === 'performers' && category !== 'all') params.set('category', category);
  return `/${kind}` + (params.size ? `?${params}` : '');
}

/** 公司认自有标识；人的代表作头像保留服务端的占位说明与人脸取景。 */
export function personAvatar(item: IndexPerson & Pick<FaceRef, 'logo_version'>, kind: string, big: boolean): PersonAvatar {
  const id = item.entity_id || item.id;
  const company = kind === 'studio' || kind === 'agency';
  return {
    html: avatarInner(item.k, id ? { id, has_image: item.has_image, image_version: item.image_version,
      logo_version: item.logo_version, avatar_stand_in: item.avatar_stand_in } : null,
    item.has_avatar && !company ? item.rep : null, kind, item.mark, item.has_logo ? item.k : '',
    company && big ? 'large' : 'ring', company ? null : item.avatar_focus, true),
    face: faceOrigin(item.avatar_focus),
  };
}

export interface IndexControllerPorts {
  route(path: string, replace: boolean): void;
}

export function createIndexController(ports: IndexControllerPorts) {
  return {
    route(next: IndexRoute, { replace = false }: { replace?: boolean } = {}) { ports.route(indexPath(next), replace) },
    personAvatar,
  } satisfies Pick<IndexProps, 'route' | 'personAvatar'>;
}
