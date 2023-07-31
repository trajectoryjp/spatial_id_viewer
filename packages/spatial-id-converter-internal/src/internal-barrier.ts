import { TileBasedCuboidCreator } from 'spatial-id-converter';

/** 内部形式バリアを直方体で表すためのクラス */
export class InternalBarrier<
  Metadata extends Record<string, unknown> = Record<string, never>
> extends TileBasedCuboidCreator<Metadata> {
  /**
   * 内部形式バリアオブジェクトを作成する
   * @param quadKeyZoomLevel 水平方向ズームレベル
   * @param altitudeKeyZoomLevel 高度方向ズームレベル
   * @param x タイル X 座標
   * @param y タイル Y 座標
   * @param altitudeKey 高度方向タイル座標
   * @param bottomAltitude 高度下限
   * @param topAltitude 高度上限
   * @param metadata メタデータ
   */
  constructor(
    readonly quadKeyZoomLevel: number,
    readonly altitudeKeyZoomLevel: number,
    x: number,
    y: number,
    readonly altitudeKey: number,
    readonly bottomAltitude: number,
    readonly topAltitude: number,
    readonly metadata?: Metadata
  ) {
    super(quadKeyZoomLevel, x, y, metadata);
  }

  protected override async getMslHeights() {
    const voxelHeight = (this.topAltitude - this.bottomAltitude) / 2 ** this.altitudeKeyZoomLevel;
    const bottomHeightMsl = this.bottomAltitude + voxelHeight * this.altitudeKey;
    const topHeightMsl = bottomHeightMsl + voxelHeight;

    return [bottomHeightMsl, topHeightMsl] as const;
  }

  /**
   * 文字列形式に変換する
   * @returns '地表方向ズームレベル/高さ方向ズームレベル/高さ方向タイル座標/タイル X 座標/タイル Y 座標' 形式の文字列
   */
  toString() {
    return `${this.quadKeyZoomLevel}/${this.altitudeKeyZoomLevel}/${this.altitudeKey}/${this.x}/${this.y}`;
  }
}
