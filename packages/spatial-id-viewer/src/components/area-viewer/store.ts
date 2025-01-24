import { Cartographic, Rectangle, Viewer as CesiumViewer } from 'cesium';
import { Draft, immerable } from 'immer';
import { Mutate, StoreApi } from 'zustand';

import { CuboidCollection } from 'spatial-id-converter';

import { ModelControllers } from '#app/components/area-viewer';
import { useSelected3DTileFeature } from '#app/components/area-viewer/hooks/selected-3d-tile-feature';
import { createStoreHandlers, createStoreUpdater, StorePartialReplacer } from '#app/stores/utils';

export const Pages = {
  SelectFunction: 0,
  ShowModel: 1,
  ShowModels: 2,
} as const;
export type Pages = (typeof Pages)[keyof typeof Pages];

export const PagesAirSpace = {
  SelectFunction: 0,
  ShowModels: 1,
  ShowModelStream: 2,
};

export type PagesAirSpace = (typeof PagesAirSpace)[keyof typeof PagesAirSpace];

/** Cesium ビューアー関連の機能 */
export interface ViewerControllers {
  /** 現在表示されている範囲を Rectangle として取得 */
  computeViewRectangle: () => Rectangle;
  /** point の標高を楕円体高として取得 */
  getEllipsoidHeight: (point: Cartographic) => Promise<number | null>;
  /** カメラ位置を移動 */
  flyCameraTo: CesiumViewer['camera']['flyTo'];
}

/** モデルとビューアーを操作するためのインターフェース */
export interface IStore<Metadata extends Record<string, unknown> = Record<string, never>> {
  /** モデル (キー: モデル ID、値: モデル単体) */
  models: ReadonlyMap<string, CuboidCollection<Metadata>>;
  /** models を書き換える際に使用する関数 */
  replaceModels: StorePartialReplacer<Map<string, Draft<CuboidCollection<Metadata>>>>;
  /** Cesium ビューアー関連の機能 */
  replaceOutOfSpaceModels?: StorePartialReplacer<Map<string, Draft<CuboidCollection<Metadata>>>>;
  replaceFlyableSpaceModels?: StorePartialReplacer<Map<string, Draft<CuboidCollection<Metadata>>>>;
  replaceOccupiedSpaceModels?: StorePartialReplacer<Map<string, Draft<CuboidCollection<Metadata>>>>;
  viewerCtrls: ViewerControllers;
}

export class Store<Metadata extends Record<string, unknown> = Record<string, never>>
  implements IStore<Metadata>
{
  [immerable] = true;

  page = 0 as Pages;
  pageAirSpace = 0 as PagesAirSpace;

  featureName: string;
  featureIdName: string;
  models: Map<string, CuboidCollection<any>> = new Map();
  outOfSpaceModels: Map<string, CuboidCollection<any>> = new Map();
  flyableSpaceModels: Map<string, CuboidCollection<any>> = new Map();
  occupiedSpaceModels: Map<string, CuboidCollection<any>> = new Map();
  modelCtrls: ModelControllers;
  selectedCtrls: ReturnType<typeof useSelected3DTileFeature>;
  viewerCtrls: ViewerControllers;
  startTime = 0;
  endTime = 253402300799;
  airSpaceType = 0;
  carrierCodes: Record<string, string> = {};

  constructor(
    private readonly set: StoreApi<Store>['setState'],
    private readonly get: StoreApi<Store>['getState'],
    private readonly store: Mutate<StoreApi<Store>, []>
  ) {}

  readonly update = createStoreUpdater(this.set, this.get);

  readonly replaceModels = createStoreUpdater(
    this.set,
    this.get,
    (s) => s.models,
    (s, v) => (s.models = v)
  );

  readonly replaceOutOfSpaceModels = createStoreUpdater(
    this.set,
    this.get,
    (s) => s.outOfSpaceModels,
    (s, v) => (s.outOfSpaceModels = v)
  );

  readonly replaceFlyableSpaceModels = createStoreUpdater(
    this.set,
    this.get,
    (s) => s.flyableSpaceModels,
    (s, v) => (s.flyableSpaceModels = v)
  );

  readonly replaceOccupiedSpaceModels = createStoreUpdater(
    this.set,
    this.get,
    (s) => s.occupiedSpaceModels,
    (s, v) => (s.occupiedSpaceModels = v)
  );

  readonly resetAllModels = () => {
    this.replaceModels(() => new Map());
    this.replaceOutOfSpaceModels(() => new Map());
    this.replaceFlyableSpaceModels(() => new Map());
    this.replaceOccupiedSpaceModels(() => new Map());
  };

  readonly isFunctionSelectable = () => {
    const self = this.get();
    return !!(self.modelCtrls.loadModel && self.modelCtrls.loadModels);
  };
  readonly isAirSpaceSelectable = () => {
    const self = this.get();
    return !!(self.modelCtrls.loadAirSpaceModels && self.modelCtrls.loadAirSpaceModelsStream);
  };
}

export const [WithStore, useStoreApi] = createStoreHandlers(Store);
