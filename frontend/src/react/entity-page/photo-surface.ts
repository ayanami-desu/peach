import type { PhotoLayout, PhotoSize } from '../entity-body/entity-body';

/** 资料页视图由 painted 报告；异步墙未落 DOM 时也能正确选择大小图控件。 */
export interface PhotoSurfaceState {
  entityWall: boolean;
  entityCurrent: boolean;
  indexVisible: boolean;
}

export function photoViewActive(state: PhotoSurfaceState, visibleSkeletonWall: () => boolean): boolean {
  if (state.entityWall && state.entityCurrent && state.indexVisible) return true;
  return visibleSkeletonWall();
}

export interface PhotoWallPreferences { size: PhotoSize; layout: PhotoLayout; imagesOnly: boolean }
export interface PhotoSurfacePorts {
  preferences(): PhotoWallPreferences;
  walls(): Iterable<HTMLElement>;
  pushEntity(patch: { photoSize: PhotoSize; photoLayout: PhotoLayout; imagesOnly: boolean }): void;
  syncDensity(): void;
  storeSize(size: string): void;
}

export function createPhotoSurfaceController(ports: PhotoSurfacePorts) {
  const sync = () => {
    const prefs = ports.preferences();
    for (const wall of ports.walls()) {
      wall.dataset.size = prefs.size;
      wall.dataset.layout = 'fixed';
      wall.dataset.imagesOnly = String(prefs.imagesOnly);
    }
    ports.pushEntity({ photoSize: prefs.size, photoLayout: prefs.layout, imagesOnly: prefs.imagesOnly });
    ports.syncDensity();
  };
  return { sync, setSize(size: string) { ports.storeSize(size); sync() } };
}
