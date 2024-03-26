import { Cartesian3, Cartographic, WebMercatorTilingScheme } from 'cesium';
import { immerable, produce } from 'immer';
import { FC } from 'react';
import { Mutate, StoreApi } from 'zustand';

import { CuboidCollection, getGeoidHeight, SpatialId } from 'spatial-id-converter';

import { createStoreHandlers, createStoreUpdater } from '#app/stores/utils';

/** エリア情報を格納しているインターフェース */
export interface IArea<AreaAdditionalInfo = any> {
  spatialIds: string[] | null;
  additionalInfo: AreaAdditionalInfo | null;
}

/** エリア全体の情報を格納しているインターフェース */
export interface IAreas<WholeAreaInfo = any, AreaAdditionalInfo = any> {
  data: IArea<AreaAdditionalInfo>[];
  wholeAreaInfo: WholeAreaInfo | null;
}

class Area implements IArea {
  [immerable] = true;

  point1: Cartesian3 | null = null;
  point2: Cartesian3 | null = null;

  tileZ: number | null = null;
  tileF: [number, number] | null = null;
  tileX: [number, number] | null = null;
  tileY: [number, number] | null = null;

  polygons: Cartesian3[] | null = null;
  polygonsHeightPoint: Cartographic | null = null;
  spatialIds: string[] | null = null;
  model: CuboidCollection | null = null;

  additionalInfo: any = null;

  async setPoint1(point: Cartesian3 | null) {
    this.point1 = point;
    await this.update();
  }

  async setPoint2(point: Cartesian3 | null) {
    this.point2 = point;
    await this.update();
  }

  get polygonsHeight() {
    return this.polygonsHeightPoint.height;
  }

  async setTileZ(value: number | null) {
    this.tileZ = value;
    // 高さ方向の指定を一旦リセット
    this.tileF = null;

    await this.update();
  }

  async setTileF(values: [number, number] | null) {
    this.tileF = values;
    await this.update();
  }

  private async update() {
    this.updatePolygons();
    this.updateTileXY();
    await this.updateSpatialIds();
    await this.updateModel();
  }

  private updatePolygons() {
    if (!this.point1 || !this.point2) {
      this.polygons = null;
      this.polygonsHeightPoint = null;
      return;
    }

    const point1 = Cartographic.fromCartesian(this.point1);
    const point2 = Cartographic.fromCartesian(this.point2);
    // 高度は一番低いものを採用する
    if (point1.height < point2.height) {
      this.polygonsHeightPoint = point1;
    } else {
      this.polygonsHeightPoint = point2;
    }

    this.polygons = Cartesian3.fromRadiansArray([
      point1.longitude,
      point1.latitude,
      point1.longitude,
      point2.latitude,
      point2.longitude,
      point2.latitude,
      point2.longitude,
      point1.latitude,
    ]);
  }

  private updateTileXY() {
    if (!this.point1 || !this.point2 || !this.tileZ) {
      this.tileX = this.tileY = null;
      return;
    }

    const tile1 = new WebMercatorTilingScheme().positionToTileXY(
      Cartographic.fromCartesian(this.point1),
      this.tileZ
    );
    const tile2 = new WebMercatorTilingScheme().positionToTileXY(
      Cartographic.fromCartesian(this.point2),
      this.tileZ
    );

    this.tileX = [Math.min(tile1.x, tile2.x), Math.max(tile1.x, tile2.x)];
    this.tileY = [Math.min(tile1.y, tile2.y), Math.max(tile1.y, tile2.y)];
  }

  private async updateSpatialIds() {
    if (!this.tileZ || !this.tileX || !this.tileY || (!this.tileF && !this.polygonsHeightPoint)) {
      this.spatialIds = null;
      return;
    }

    if (!this.tileF) {
      // ポリゴンの高度で初期値を作る
      const altitude =
        this.polygonsHeightPoint.height -
        (await getGeoidHeight(
          this.polygonsHeightPoint.longitude,
          this.polygonsHeightPoint.latitude
        ));
      const f = Math.floor((2 ** this.tileZ * altitude) / 2 ** 25);
      this.tileF = [f, f];
    }

    this.spatialIds = [];
    for (let f = this.tileF[0]; f <= this.tileF[1]; f++) {
      for (let x = this.tileX[0]; x <= this.tileX[1]; x++) {
        for (let y = this.tileY[0]; y <= this.tileY[1]; y++) {
          this.spatialIds.push(`${this.tileZ}/${f}/${x}/${y}`);
        }
      }
    }
  }

  private async updateModel() {
    if (!this.spatialIds) {
      this.model = null;
      return;
    }

    const cuboids = await Promise.all(
      this.spatialIds.map((x) => SpatialId.fromString(x).createCuboid())
    );
    this.model = new CuboidCollection(cuboids);
  }
}

class Areas implements IAreas {
  [immerable] = true;

  data: Area[] = [];
  currentIndex = -1;
  wholeAreaInfo: any = null;

  get current() {
    return this.data[this.currentIndex] ?? null;
  }

  reset() {
    this.data = [];
    this.currentIndex = -1;
    this.wholeAreaInfo = null;
  }

  createNewArea() {
    this.currentIndex = this.data.length;
    this.data.push(new Area());
  }

  removeCurrentArea() {
    this.data.splice(this.currentIndex, 1);
    this.currentIndex = -1;
  }

  unselect() {
    this.currentIndex = -1;
  }
}

export const Pages = {
  SelectPoint1: 0,
  SelectPoint2: 1,
  InputTileZ: 2,
  InputTileF: 3,
  InputAreaSpecificInfo: 4,
  SelectAddOrSend: 5,
  InputWholeAreaInfo: 6,
  Register: 7,
} as const;
export type Pages = (typeof Pages)[keyof typeof Pages];

/** areaAdditionalInfoFragment (エリア単体に関する追加の情報が必要な際に渡すコンポーネント) に渡されるプロパティ */
export interface AreaAdditionalInfoFragmentProps<AreaAdditionalInfo = any> {
  areaAdditionalInfo: AreaAdditionalInfo | null;
  setAreaAdditionalInfo: (additionalInfo: AreaAdditionalInfo | null) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
}

/** wholeAreaInfoFragment (エリア全体に関する追加の情報が必要な際に渡すコンポーネント) に渡されるプロパティ */
export interface WholeAreaInfoFragmentProps<WholeAreaInfo = any> {
  wholeAreaInfo: WholeAreaInfo | null;
  setWholeAreaInfo: (wholeAreaInfo: WholeAreaInfo | null) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
}

class Store {
  [immerable] = true;

  areaAdditionalInfoFragment: FC<AreaAdditionalInfoFragmentProps> | null = null;
  wholeAreaInfoFragment: FC<WholeAreaInfoFragmentProps> | null = null;
  registerFunc: ((areas: IAreas) => Promise<void>) | null = null;

  clickedPoint: Cartesian3 | null = null;
  areas = new Areas();
  page: Pages = 0 as Pages;

  constructor(
    private readonly set: StoreApi<Store>['setState'],
    private readonly get: StoreApi<Store>['getState'],
    private readonly store: Mutate<StoreApi<Store>, []>
  ) {}

  readonly update = createStoreUpdater(this.set, this.get);

  readonly reset = () => {
    this.set(
      produce(this.get(), (draft) => {
        draft.clickedPoint = null;
        draft.areas.reset();
        draft.page = 0 as Pages;
      })
    );
  };
}

export const [WithStore, useStoreApi] = createStoreHandlers(Store);
