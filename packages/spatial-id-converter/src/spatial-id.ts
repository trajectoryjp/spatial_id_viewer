import { TileBasedCuboidCreator } from './tile-based-cuboid';

/** 空間 ID オブジェクト */
export class SpatialId<
  Metadata extends Record<string, unknown> = Record<string, never>
> extends TileBasedCuboidCreator<Metadata> {
  /**
   * 空間 ID オブジェクトを作成する。
   * @param z ズームレベル
   * @param f 高度方向タイル座標
   * @param x タイル X 座標
   * @param y タイル Y 座標
   * @param metadata メタデータ
   */
  constructor(z: number, readonly f: number, x: number, y: number, metadata?: Metadata) {
    super(z, x, y, metadata);
  }

  protected override async getMslHeights() {
    const bottomHeightMsl = this.f / 2 ** (this.z - 25);
    const topHeightMsl = (this.f + 1) / 2 ** (this.z - 25);

    return [bottomHeightMsl, topHeightMsl] as const;
  }

  /** 文字列から空間 ID オブジェクトを生成する */
  static fromString<Metadata extends Record<string, unknown> = Record<string, never>>(
    spatialId: string,
    metadata?: Metadata
  ) {
    if (!/^\d+\/-?\d+\/\d+\/\d+$/.test(spatialId)) {
      throw new Error(`invalid spatial id: ${spatialId}`);
    }

    const [z, f, x, y] = spatialId.split('/').map((x) => Number(x));
    return new SpatialId(z, f, x, y, metadata);
  }

  /** 空間 ID 文字列に変換する */
  toString() {
    return `${this.z}/${this.f}/${this.x}/${this.y}`;
  }
}
