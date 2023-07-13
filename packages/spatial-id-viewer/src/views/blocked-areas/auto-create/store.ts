import produce, { immerable } from 'immer';
import { Mutate, StoreApi } from 'zustand';

import { CuboidCollection } from 'spatial-id-converter';

import { createStoreHandlers, createStoreUpdater } from '#app/stores/utils';

export const Pages = {
  Settings: 0,
  Positioning: 1,
  Watching: 2,
} as const;
export type Pages = (typeof Pages)[keyof typeof Pages];

/** 設定値 */
export interface Settings {
  defaultAltitude: number;
  highAccuracy: boolean;
  zoomLevel: number;
  areaSize: number;
  minimumIntervalSec: number;
  followCamera: boolean;
}

/** 作成した割込禁止エリアに関する情報 */
export interface CreatedBlockedAreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

/** ビューアーの表示に反映させる情報 */
export interface ViewerData {
  currentPosition: GeolocationPosition | null;
  model: CuboidCollection<CreatedBlockedAreaInfo> | null;
}

export class Store {
  [immerable] = true;

  page = 0 as Pages;

  settings: Settings = {
    defaultAltitude: 200,
    highAccuracy: true,
    zoomLevel: 18,
    areaSize: 300,
    minimumIntervalSec: 5,
    followCamera: true,
  };

  viewerData: ViewerData = {
    currentPosition: null,
    model: null,
  };

  constructor(
    private readonly set: StoreApi<Store>['setState'],
    private readonly get: StoreApi<Store>['getState'],
    private readonly store: Mutate<StoreApi<Store>, []>
  ) {}

  readonly setPage = (page: Pages) => {
    this.set(
      produce(this.get(), (draft) => {
        draft.page = page;
      })
    );
  };

  readonly updateSettings = createStoreUpdater(this.set, this.get, (s) => s.settings);
  readonly updateViewerData = createStoreUpdater(this.set, this.get, (s) => s.viewerData);
}

export const [WithStore, useStoreApi] = createStoreHandlers(Store);
