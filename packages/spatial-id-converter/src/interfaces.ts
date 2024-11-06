import { Cartesian3 } from 'cesium';

import { SpatialId } from './spatial-id';

/** 直方体 */
export interface Cuboid<Metadata extends Record<string, unknown> = Record<string, never>> {
  /**
   * 直方体の範囲を経度・緯度・楕円体高で表した配列
   *
   * 経度・緯度はラジアン、高度はメートル
   *
   * 順序は [west, south, east, north, minHeight, maxHeight]
   */
  region: number[];
  /** 大きさ (m) を x, y, z それぞれの方向で表したオブジェクト */
  scale: Cartesian3;
  /** 中心座標 */
  location: Cartesian3;
  /** メタデータ */
  metadata: Metadata;
}

/** 直方体で表せる範囲を表す基底クラス */
export abstract class CuboidCreator<
  Metadata extends Record<string, unknown> = Record<string, never>
> {
  /** 直方体の情報を作成する */
  abstract createCuboid(): Promise<Cuboid<Metadata>>;
}

export interface Figure {
  identification: {
    ID: SpatialId;
  };
}
// export interface Figure {
//   identification: {
//     ID: SpatialId;
//   };
//   tube: {
//     start: {
//       latitude: number;
//       longitude: number;
//       altitude: number;
//       altitudeAttribute: string;
//     };
//     end: {
//       latitude: number;
//       longitude: number;
//       altitude: number;
//       altitudeAttribute: string;
//     };
//     radian: number;
//   };
//   polygon: any;
// }

export interface FigureRequest {
  identification: {
    ID: string;
  };
}
// export interface FigureRequest {
//   identification: {
//     ID: string;
//   };
//   tube: {
//     start: {
//       latitude: number;
//       longitude: number;
//       altitude: number;
//       altitudeAttribute: string;
//     };
//     end: {
//       latitude: number;
//       longitude: number;
//       altitude: number;
//       altitudeAttribute: string;
//     };
//     radian: number;
//   };
//   polygon: any;
// }
