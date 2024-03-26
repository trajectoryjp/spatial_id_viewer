// gsi-map-terrain.ts
//
// このコードは、次のオープンソースコードを基に改変したものです。
// https://github.com/gsi-cyberjapan/gsimaps/blob/gh-pages/globe/resource/JapanGSITerrainProvider.js
//
// 元のライセンス: BSD-2-Clause
// https://github.com/gsi-cyberjapan/gsimaps/blob/gh-pages/LICENSE

import {
  Credit,
  CustomHeightmapTerrainProvider,
  HeightmapTerrainData,
  Math as CesiumMath,
  Rectangle,
  Resource,
  TileAvailability,
  WebMercatorTilingScheme,
} from 'cesium';

import { getGeoidHeight } from 'spatial-id-converter';

class DemArea {
  constructor(private readonly data: Map<number, Map<number, Set<number>>>) {}

  has(level: number, x: number, y: number) {
    return !!this.data.get(level)?.get(x)?.has(y);
  }
}

const DEM_AREA = new DemArea(
  new Map([
    [
      8,
      new Map([
        [215, new Set([108, 109, 110])],
        [216, new Set([108, 109, 110])],
        [217, new Set([109])],
        [218, new Set([107, 108])],
        [219, new Set([101, 102, 103, 104, 105, 106, 107, 108])],
        [220, new Set([101, 102, 103, 104, 105, 106, 107])],
        [221, new Set([99, 101, 102, 103, 104, 105, 108, 109, 110])],
        [222, new Set([100, 101, 102, 103])],
        [223, new Set([100, 101, 102])],
        [224, new Set([99, 100, 101, 102, 113])],
        [225, new Set([98, 99, 100, 101, 102])],
        [226, new Set([98, 99, 100, 101, 102])],
        [227, new Set([96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 93, 94, 95])],
        [228, new Set([96, 97, 98, 99, 100, 107, 108, 109, 110, 91, 92, 93, 94, 95])],
        [229, new Set([97, 107, 108, 91, 92, 93, 94, 95])],
        [230, new Set([92, 93, 94])],
        [231, new Set([92, 93, 94])],
        [232, new Set([91, 92, 93])],
        [233, new Set([91, 92])],
        [237, new Set([110])],
      ]),
    ],
  ])
);

const DEM_AREA_2 = new DemArea(
  new Map([
    [
      9,
      new Map([
        [442, new Set([197, 198])],
        [438, new Set([202, 203])],
        [439, new Set([202, 203])],
        [457, new Set([182])],
        [458, new Set([182])],
      ]),
    ],
  ])
);

const DEM_AREA_3 = new DemArea(new Map([[10, new Map([[879, new Set([406, 407])]])]]));

const GSI_DEM10B_MAX_ZOOM_LEVEL = 14;
const GSI_DEM10B_URL = 'https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png';

const GSI_DEMGM_MAX_ZOOM_LEVEL = 8;
const GSI_DEMGM_URL = 'https://cyberjapandata.gsi.go.jp/xyz/demgm_png/{z}/{x}/{y}.png';

const DEM_DATA_WIDTH = 256;
const HEIGHTMAP_WIDTH = 32;

// 日本水準原点のジオイド高を基準にする
// TODO: どこかで共通に定義できるか？
const HEIGHT_OFFSET = 36.7071;

class GsiMapTerrainProvider extends CustomHeightmapTerrainProvider {
  // 型定義が undefined 許容になっていないため
  availability: TileAvailability = undefined as unknown as TileAvailability;

  constructor() {
    super({
      tilingScheme: new WebMercatorTilingScheme({ numberOfLevelZeroTilesX: 2 }),
      credit: new Credit(
        '<p><a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 (標高タイル)</a></p>' +
          '<p><a href="https://github.com/OSGeo/PROJ-data/tree/master/jp_gsi">PROJ-data</a>: Derived from work by the Geospatial Information Authority of Japan. <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a></p>'
      ),
      width: HEIGHTMAP_WIDTH,
      height: HEIGHTMAP_WIDTH,
      callback: GsiMapTerrainProvider.requestTileGeometryCallback,
    });
  }

  override async requestTileGeometry(
    x: number,
    y: number,
    level: number
  ): Promise<HeightmapTerrainData> {
    const data = await GsiMapTerrainProvider.requestTileGeometryCallback(x, y, level);
    return new HeightmapTerrainData({
      buffer: data,
      width: HEIGHTMAP_WIDTH,
      height: HEIGHTMAP_WIDTH,
      structure: {
        heightOffset: HEIGHT_OFFSET,
      },
    });
  }

  private static async requestTileGeometryCallback(
    x: number,
    y: number,
    level: number
  ): Promise<Int16Array> {
    let tileUrl = GSI_DEMGM_URL;
    let maxLevel = GSI_DEMGM_MAX_ZOOM_LEVEL;
    const demCheckLevel = 8;
    if (level > demCheckLevel) {
      const checkX = x >> (level - demCheckLevel + 1);
      const checkY = y >> (level - demCheckLevel);

      if (DEM_AREA.has(demCheckLevel, checkX, checkY)) {
        tileUrl = GSI_DEM10B_URL;
        maxLevel = GSI_DEM10B_MAX_ZOOM_LEVEL;
        const demCheckLevel2 = demCheckLevel + 1;
        const checkX2 = x >> (level - demCheckLevel2 + 1);
        const checkY2 = y >> (level - demCheckLevel2);

        if (DEM_AREA_2.has(demCheckLevel2, checkX2, checkY2)) {
          tileUrl = GSI_DEMGM_URL;
          maxLevel = GSI_DEMGM_MAX_ZOOM_LEVEL;
          const demCheckLevel3 = demCheckLevel2 + 1;
          const checkX3 = x >> (level - demCheckLevel3 + 1);
          const checkY3 = y >> (level - demCheckLevel3);

          if (level >= demCheckLevel3 && DEM_AREA_3.has(demCheckLevel3, checkX3, checkY3)) {
            tileUrl = GSI_DEM10B_URL;
            maxLevel = GSI_DEM10B_MAX_ZOOM_LEVEL;
          }
        }
      }
    }

    let shift = 0;
    if (level > maxLevel) {
      shift = level - maxLevel;
      level = maxLevel;
    }

    const shiftX = (x % Math.pow(2, shift + 1)) / Math.pow(2, shift + 1);
    const shiftY = (y % Math.pow(2, shift)) / Math.pow(2, shift);

    const tileX = x >> (shift + 1);
    const tileY = y >> shift;
    const url = tileUrl
      .replace('{x}', String(tileX))
      .replace('{y}', String(tileY))
      .replace('{z}', String(level));

    const img = (await Resource.fetchImage({
      url,
      preferImageBitmap: true,
      skipColorSpaceConversion: true,
    })) as ImageBitmap;

    // 計算量削減のため、タイルの中心座標のジオイド高のみ求める
    const rectCenter = Rectangle.center(
      new WebMercatorTilingScheme().tileXYToRectangle(tileX, tileY, level)
    );
    const tileLat = CesiumMath.toDegrees(rectCenter.latitude);
    const tileLong = CesiumMath.toDegrees(rectCenter.longitude);
    const geoidHeight = await getGeoidHeight(tileLong, tileLat);

    return GsiMapTerrainProvider.makeTileData(img, geoidHeight, shift, shiftX, shiftY);
  }

  private static makeTileData(
    img: ImageBitmap,
    geoidHeight: number,
    shift: number,
    shiftX: number,
    shiftY: number
  ): Int16Array {
    const demDataWidth = DEM_DATA_WIDTH;
    const heightmapWidth = HEIGHTMAP_WIDTH;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = demDataWidth;
    canvas.height = demDataWidth;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, demDataWidth, demDataWidth).data;
    const result = new Int16Array(heightmapWidth * heightmapWidth);
    for (let y = 0; y < heightmapWidth; ++y) {
      for (let x = 0; x < heightmapWidth; ++x) {
        const py = Math.round(
          (y / Math.pow(2, shift) / (heightmapWidth - 1) + shiftY) * (demDataWidth - 1)
        );
        const px = Math.round(
          (x / Math.pow(2, shift + 1) / (heightmapWidth - 1) + shiftX) * (demDataWidth - 1)
        );

        const idx = py * (demDataWidth * 4) + px * 4;
        const r = data[idx + 0];
        const g = data[idx + 1];
        const b = data[idx + 2];
        let h = 0;
        if (r !== 128 || g !== 0 || b !== 0) {
          const d = r * 655.36 + g * 2.56 + b * 0.01;
          h = r < 128 ? d : d - 167772.16;
          // ジオイド高を足す
          h += geoidHeight - HEIGHT_OFFSET;
        }

        result[y * heightmapWidth + x] = Math.round(h);
      }
    }

    return result;
  }
}

export const gsiMapTerrainProvider = new GsiMapTerrainProvider();
