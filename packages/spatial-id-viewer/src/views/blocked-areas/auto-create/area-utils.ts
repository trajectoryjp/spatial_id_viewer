import {
  Cartographic,
  EllipsoidRhumbLine,
  Math as CesiumMath,
  Rectangle,
  WebMercatorTilingScheme,
} from 'cesium';

/**
 * 中心座標と 1 辺の長さから正方形を作成する
 * @param center 中心座標
 * @param areaSize 作成する正方形の 1 辺の長さ (m)
 * @returns 作成した正方形
 */
const createRectangle = (center: Cartographic, areaSize: number) => {
  const distance = areaSize / 2;

  const north = EllipsoidRhumbLine.fromStartHeadingDistance(center, 0, distance).end.latitude;
  const east = EllipsoidRhumbLine.fromStartHeadingDistance(center, CesiumMath.PI_OVER_TWO, distance)
    .end.longitude;
  const south = EllipsoidRhumbLine.fromStartHeadingDistance(center, CesiumMath.PI, distance).end
    .latitude;
  const west = EllipsoidRhumbLine.fromStartHeadingDistance(
    center,
    CesiumMath.THREE_PI_OVER_TWO,
    distance
  ).end.longitude;

  return Rectangle.fromRadians(west, south, east, north);
};

/**
 * 長方形を内包するタイル XY 座標の範囲を計算する
 * @param rect 長方形
 * @param zoomLevel 使用するズームレベル
 * @returns [[タイル X 開始座標, タイル X 終了座標][], [タイル Y 開始座標, タイル Y 終了座標][]] の形式
 */
const rectToTileXYRanges = (
  rect: Rectangle,
  zoomLevel: number
): [[number, number][], [number, number][]] => {
  const xTiles = [] as [number, number][];
  const yTiles = [] as [number, number][];

  const northWestTile = new WebMercatorTilingScheme().positionToTileXY(
    Cartographic.fromRadians(rect.west, rect.north),
    zoomLevel
  );
  const southEastTile = new WebMercatorTilingScheme().positionToTileXY(
    Cartographic.fromRadians(rect.east, rect.south),
    zoomLevel
  );
  const endTile = 2 ** zoomLevel - 1;

  if (northWestTile.x <= southEastTile.x) {
    xTiles.push([northWestTile.x, southEastTile.x]);
  } else {
    xTiles.push([southEastTile.x, endTile], [0, northWestTile.x]);
  }

  if (northWestTile.y <= southEastTile.y) {
    yTiles.push([northWestTile.y, southEastTile.y]);
  } else {
    yTiles.push([southEastTile.y, endTile], [0, northWestTile.y]);
  }

  return [xTiles, yTiles];
};

/**
 * 高度 (MSL) の範囲を内包するタイル F 座標の範囲を計算する
 * @param altitudeRange 高度の範囲
 * @param zoomLevel 使用するズームレベル
 * @returns [開始座標, 終了座標] の形式
 */
const altitudeRangeToTileFRange = (
  altitudeRange: [number, number],
  zoomLevel: number
): [number, number] => {
  const bottomAltitude = Math.min(...altitudeRange);
  const topAltitude = Math.max(...altitudeRange);

  const bottomTile = Math.floor(2 ** (zoomLevel - 25) * bottomAltitude);
  const topTile = Math.ceil(2 ** (zoomLevel - 25) * topAltitude);

  return [bottomTile, topTile];
};

/**
 * 立方体の範囲を内包する空間 ID 列を作成する
 * @param longitudeInDegree 中心座標の経度 (度)
 * @param latitudeInDegree 中心座標の緯度 (度)
 * @param altitudeMsl 中心座標の高度 (MSL)
 * @param areaSize 立方体の 1 辺の長さ (m)
 * @param zoomLevel 作成する空間 ID のズームレベル
 * @returns 空間 ID 文字列の配列
 */
export const areaToSpatialIds = (
  longitudeInDegree: number,
  latitudeInDegree: number,
  altitudeMsl: number,
  areaSize: number,
  zoomLevel: number
) => {
  const rect = createRectangle(
    Cartographic.fromDegrees(longitudeInDegree, latitudeInDegree),
    areaSize
  );
  const tileXYRanges = rectToTileXYRanges(rect, zoomLevel);

  const bottomAltitude = altitudeMsl - areaSize / 2;
  const topAltitude = altitudeMsl + areaSize / 2;
  const [minTileF, maxTileF] = altitudeRangeToTileFRange([bottomAltitude, topAltitude], zoomLevel);

  const spatialIds = [] as string[];
  for (const [minTileX, maxTileX] of tileXYRanges[0]) {
    for (let x = minTileX; x <= maxTileX; x++) {
      for (const [minTileY, maxTileY] of tileXYRanges[1]) {
        for (let y = minTileY; y <= maxTileY; y++) {
          for (let f = minTileF; f <= maxTileF; f++) {
            spatialIds.push(`${zoomLevel}/${f}/${x}/${y}`);
          }
        }
      }
    }
  }

  return spatialIds;
};
