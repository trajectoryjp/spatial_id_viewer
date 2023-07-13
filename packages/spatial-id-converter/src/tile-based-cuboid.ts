import { Cartesian3, Math as CesiumMath, Rectangle, WebMercatorTilingScheme } from 'cesium';

import { getGeoidHeight } from './geoid-height';
import { Cuboid, CuboidCreator } from './interfaces';

/** タイル座標ベースの直方体を表すための基底クラス */
export abstract class TileBasedCuboidCreator<
  Metadata extends Record<string, unknown> = Record<string, never>
> extends CuboidCreator<Metadata> {
  /**
   * タイル座標ベースの直方体を表すオブジェクトを作成する。
   * @param z ズームレベル
   * @param x タイル X 座標
   * @param y タイル Y 座標
   * @param metadata メタデータ
   */
  constructor(
    readonly z: number,
    readonly x: number,
    readonly y: number,
    readonly metadata?: Metadata
  ) {
    super();
  }

  /** 高度 (MSL) の範囲を返す */
  protected abstract getMslHeights(): Promise<readonly [number, number]>;

  override async createCuboid() {
    const rect = new WebMercatorTilingScheme().tileXYToRectangle(this.x, this.y, this.z);
    const rectCenter = Rectangle.center(rect);

    // 中心を含む直線距離
    const rectWidth = Cartesian3.distance(
      Cartesian3.fromRadians(rect.east, rectCenter.latitude),
      Cartesian3.fromRadians(rect.west, rectCenter.latitude)
    );
    const rectHeight = Cartesian3.distance(
      Cartesian3.fromRadians(rectCenter.longitude, rect.north),
      Cartesian3.fromRadians(rectCenter.longitude, rect.south)
    );

    const rectCenterLong = CesiumMath.toDegrees(rectCenter.longitude);
    const rectCenterLat = CesiumMath.toDegrees(rectCenter.latitude);
    const geoidHeight = await getGeoidHeight(rectCenterLong, rectCenterLat);

    const [bottomHeightMsl, topHeightMsl] = await this.getMslHeights();
    const bottomHeight = geoidHeight + bottomHeightMsl;
    const topHeight = geoidHeight + topHeightMsl;
    const height = topHeight - bottomHeight;
    const centerHeight = (bottomHeight + topHeight) / 2;

    // 拡大
    const scale = new Cartesian3(rectWidth, rectHeight, height);

    // 移動
    const location = Cartesian3.fromRadians(
      rectCenter.longitude,
      rectCenter.latitude,
      centerHeight
    );

    const metadata = this.metadata;

    return {
      region: [rect.west, rect.south, rect.east, rect.north, bottomHeight, topHeight],
      scale,
      location,
      metadata,
    } as Cuboid<Metadata>;
  }
}
