import { Cartesian3, Cartographic } from 'cesium';
import { immerable, produce } from 'immer';
import { Mutate, StoreApi } from 'zustand';

import { getGeoidHeight } from 'spatial-id-converter';

import { createStoreHandlers, createStoreUpdater } from '#app/stores/utils';

/** ウェイポイントの情報 */
export interface IWaypoint<WaypointAdditionalInfo = any> {
  /** 高度 (MSL) */
  altitude: number;
  /** 地点の座標 */
  point: Cartesian3;
  /** ウェイポイント固有の追加の情報 */
  additionalInfo: WaypointAdditionalInfo | null;
}

/** ウェイポイント全体の情報 */
export interface IWaypoints<WholeRouteInfo = any, WaypointAdditionalInfo = any> {
  /** ウェイポイント情報 */
  data: IWaypoint<WaypointAdditionalInfo>[];
  /** ウェイポイント全体の追加の情報 */
  wholeRouteInfo: WholeRouteInfo;
}

const createRandomId = () => {
  return crypto.getRandomValues(new Uint32Array(1)).at(0).toString(16).padStart(8, '0');
};

class Waypoint implements IWaypoint {
  [immerable] = true;

  altitude: number;
  point: Cartesian3;
  groundPoint: Cartesian3;
  errored: boolean;
  additionalInfo: any = null;

  /** @internal */
  rawPointId: string;
  /** @internal */
  rawGroundPointId: string;

  private constructor() {
    // noop
  }

  get pointId() {
    return 'point-' + this.rawPointId;
  }

  get lineId() {
    return 'line-' + this.rawPointId;
  }

  get groundPointId() {
    return 'groundPoint-' + this.rawGroundPointId;
  }

  get groundLineId() {
    return 'groundLine-' + this.rawGroundPointId;
  }

  static async create(altitude: number, groundPoint: Cartesian3) {
    const self = new Waypoint();
    self.altitude = altitude;
    self.groundPoint = groundPoint;
    self.rawGroundPointId = createRandomId();
    self.rawPointId = createRandomId();
    await self.update();
    return self;
  }

  private async update() {
    const cartographic = Cartographic.fromCartesian(this.groundPoint);
    cartographic.height =
      (await getGeoidHeight(cartographic.longitude, cartographic.latitude)) + this.altitude;
    this.point = Cartographic.toCartesian(cartographic);
  }

  async setGroundPoint(groundPoint: Cartesian3) {
    this.groundPoint = groundPoint;
    await this.update();
  }

  async setAltitude(altitude: number) {
    this.altitude = altitude;
    await this.update();
  }
}

class Waypoints implements IWaypoints {
  [immerable] = true;

  defaultAltitude = 0;
  data: Waypoint[] = [];
  selected: TargetFeature | null = null;
  pointing: TargetFeature | null = null;
  clicked: TargetFeature | null = null;
  wholeRouteInfo: any = null;

  get current() {
    if (this.selected?.type !== 'point') {
      return null;
    }

    return this.data[this.selected.index] ?? null;
  }

  reset() {
    this.defaultAltitude = 0;
    this.data = [];
    this.selected = null;
    this.pointing = null;
    this.clicked = null;
    this.wholeRouteInfo = null;
  }

  private findFeature(object: any): TargetFeature | null {
    // null or undefined
    if (object != null) {
      const id = object.id._id as string;
      const idComponents = id.split('-');
      const type = idComponents[0];
      if (type === 'point' || type === 'line') {
        const index = this.data.findIndex((w) => w.rawPointId === idComponents[1]);
        if (index !== -1) {
          return {
            type,
            index,
          };
        }
      }
    }

    return null;
  }

  applyToClicked(object: any) {
    this.clicked = this.findFeature(object);
  }

  applyToPointing(object: any) {
    this.pointing = this.findFeature(object);
  }

  selectClicked() {
    this.selected = this.clicked;
  }

  /**
   * defaultAltitude と groundPoint で新たなウェイポイントを追加し、選択状態にする
   * 追加位置は、辺が選択されている場合その 2 点間、そうでなければ最後
   * 2 点間の場合は、そのパスのエラー状態を解除する
   */
  async addNewWaypoint(groundPoint: Cartesian3) {
    const waypoint = await Waypoint.create(this.defaultAltitude, groundPoint);

    let index: number;
    if (this.selected?.type === 'line') {
      // パスのエラー状態を解除
      this.data[this.selected.index].errored = false;
      // 辺の 2 点間に追加
      index = this.selected.index + 1;
    } else {
      // 最後に追加
      index = this.data.length;
    }

    this.data.splice(index, 0, waypoint);

    // 選択状態にする
    this.selected = {
      type: 'point',
      index,
    };
  }

  unsetErrorOnCurrentPaths() {
    if (this.selected === null) {
      return;
    }

    const index = this.selected.index;
    if (index > 0) {
      // 前の点から現在の点へのパス
      this.data[index - 1].errored = false;
    }
    // 現在の点から次の点へのパス
    this.data[index].errored = false;
  }

  removeCurrentWaypoint() {
    if (this.selected?.type !== 'point') {
      return;
    }

    this.unsetErrorOnCurrentPaths();
    this.data.splice(this.selected.index, 1);
    this.selected = null;
  }

  updateErroredPathsByIndicies(pathIndices: Iterable<number>) {
    const pathIndicesSet = new Set(pathIndices);
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] && (this.data[i].errored = pathIndicesSet.has(i));
    }
  }
}

export interface TargetFeature {
  type: 'line' | 'point';
  index: number;
}

export interface WaypointAdditionalInfoFragmentProps<WaypointAdditionalInfo = any> {
  waypointAdditionalInfo: WaypointAdditionalInfo | null;
  setWaypointAdditionalInfo: (additionalInfo: WaypointAdditionalInfo | null) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
}

export interface WholeRouteInfoFragmentProps<WholeRouteInfo = any> {
  wholeRouteInfo: WholeRouteInfo | null;
  setWholeRouteInfo: (wholeAreaInfo: WholeRouteInfo | null) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
}

class Store {
  [immerable] = true;

  page: Pages = 0 as Pages;
  waypoints = new Waypoints();
  clickedPoint: Cartesian3 | null = null;

  waypointAdditionalInfoFragment: React.FC<WaypointAdditionalInfoFragmentProps> | null = null;
  wholeRouteInfoFragment: React.FC<WholeRouteInfoFragmentProps> | null = null;
  registerFunc: (store: IWaypoints) => Promise<void> | null = null;

  constructor(
    private readonly set: StoreApi<Store>['setState'],
    private readonly get: StoreApi<Store>['getState'],
    private readonly store: Mutate<StoreApi<Store>, []>
  ) {}

  readonly reset = () => {
    this.set(
      produce(this.get(), (draft) => {
        draft.page = 0 as Pages;
        draft.clickedPoint = null;
        draft.waypoints.reset();
      })
    );
  };

  readonly update = createStoreUpdater(this.set, this.get);
}

export const Pages = {
  InputDefaultAltitude: 0,
  SelectPointOrFeature: 1,
  InputAltitude: 2,
  InputWaypointSpecificInfo: 3,
  SplitLine: 4,
  SelectActionForPoint: 5,
  MovePoint: 6,
  InputWholeRouteInfo: 7,
  Register: 8,
} as const;
export type Pages = (typeof Pages)[keyof typeof Pages];

export const [WithStore, useStoreApi] = createStoreHandlers(Store);
