import { Cartesian3 } from 'cesium';

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
