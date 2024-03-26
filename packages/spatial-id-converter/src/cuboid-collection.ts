/// <reference path="../../../types/binary-files.d.ts" />

import boxGlbBinary from './assets/box.glb';
import { Cuboid } from './interfaces';

/**
 * 1 つ以上の直方体を表す。
 * Cesium が読み込める形式 (i3dm + 3D Tileset JSON) に変換する機能を備える。
 */
export class CuboidCollection<Metadata extends Record<string, unknown> = Record<string, never>> {
  /**
   * 1 つ以上の直方体を表す CuboidCollection インスタンスを作成する。
   * @param cuboids 直方体の配列
   */
  constructor(public readonly cuboids: readonly Cuboid<Metadata>[]) {}

  /**
   * 3D Tileset の JSON データをオブジェクトとして生成し返す
   * @param i3dmUrl 生成済みの i3dm の URL。指定しない場合は i3dm を生成して data URL として埋め込む
   * @returns JSON データのオブジェクト
   */
  async create3DTilesetJson(i3dmUrl?: string): Promise<object> {
    const region = this.calculateRegion();

    if (i3dmUrl === undefined) {
      i3dmUrl = await this.createI3dmDataUrl();
    }

    const tileset = {
      asset: {
        version: '1.0',
      },
      properties: {},
      root: {
        boundingVolume: {
          region: [] as number[],
        },
        geometricError: 1000,
        refine: 'ADD',
        children: [] as {
          boundingVolume: {
            region: number[];
          };
          geometricError: number;
          content: {
            uri: string;
          };
          extras?: { [name: string]: string };
        }[],
      },
    };

    tileset.root.boundingVolume.region = region;
    tileset.root.children.push({
      boundingVolume: {
        region,
      },
      geometricError: 0,
      content: {
        uri: i3dmUrl,
      },
    });
    return tileset;
  }

  /** バイナリデータを data URL に変換する */
  private static async toDataUrl(data: BlobPart, contentType: string) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string), false);
      reader.readAsDataURL(new Blob([data], { type: contentType }));
    });
  }

  /**
   * 3D Tileset 形式の JSON を data URL として生成し返す
   * @param i3dmUrl 生成済みの i3dm の URL。指定しない場合は i3dm を生成して data URL として埋め込む
   * @returns JSON の data URL
   */
  async create3DTilesetDataUrl(i3dmUrl?: string) {
    const jsonContent = await this.create3DTilesetJson(i3dmUrl);
    return await CuboidCollection.toDataUrl(JSON.stringify(jsonContent), 'application/json');
  }

  /**
   * モデルが存在する範囲を直方体で返す
   * (経度・緯度はラジアン、高度は楕円体高 (m))
   * @returns [west, south, east, north, minHeight, maxHeight]
   */
  calculateRegion() {
    if (!this.cuboids.length) {
      return [0, 0, 0, 0, 0, 0];
    }

    const region = [Math.PI, Math.PI / 2, -Math.PI, -Math.PI / 2, Infinity, 0];
    for (const { region: tileRegion } of this.cuboids) {
      region[0] = Math.min(region[0], tileRegion[0]); // west
      region[1] = Math.min(region[1], tileRegion[1]); // south
      region[2] = Math.max(region[2], tileRegion[2]); // east
      region[3] = Math.max(region[3], tileRegion[3]); // north
      region[4] = Math.min(region[4], tileRegion[4]); // minHeight
      region[5] = Math.max(region[5], tileRegion[5]); // maxHeight
    }

    return region;
  }

  /** i3dm 形式のバイナリを生成する */
  async createI3dmBinary() {
    const { featureTableJson, featureTableBinary } = this.createFeatureTable();
    const { batchTableJson } = this.createBatchTable();

    const headerSize = 0x20;
    const i3dmByteLength =
      headerSize +
      featureTableJson.byteLength +
      featureTableBinary.byteLength +
      batchTableJson.byteLength +
      boxGlbBinary.byteLength;
    const data = new DataView(new ArrayBuffer(i3dmByteLength));

    let pos = 0;
    data.setUint32(pos, 0x6d643369, true); // magic: 'i3dm'
    pos += 4;
    data.setUint32(pos, 1, true); // version
    pos += 4;
    data.setUint32(pos, i3dmByteLength, true); // byteLength
    pos += 4;
    data.setUint32(pos, featureTableJson.byteLength, true); // featureTableJSONByteLength
    pos += 4;
    data.setUint32(pos, featureTableBinary.byteLength, true); // featureTableBinaryByteLength
    pos += 4;
    data.setUint32(pos, batchTableJson.byteLength, true); // batchTableJSONByteLength
    pos += 4;
    data.setUint32(pos, 0, true); // batchTableBinaryByteLength
    pos += 4;
    data.setUint32(pos, 1, true); // gltfFormat
    pos += 4;
    new Uint8Array(data.buffer, pos).set(new Uint8Array(featureTableJson));
    pos += featureTableJson.byteLength;
    new Uint8Array(data.buffer, pos).set(new Uint8Array(featureTableBinary));
    pos += featureTableBinary.byteLength;
    new Uint8Array(data.buffer, pos).set(new Uint8Array(batchTableJson));
    pos += batchTableJson.byteLength;
    new Uint8Array(data.buffer, pos).set(new Uint8Array(boxGlbBinary));

    return data.buffer;
  }

  /** i3dm 形式のバイナリを data URL として生成し返す */
  async createI3dmDataUrl() {
    const data = await this.createI3dmBinary();
    return await CuboidCollection.toDataUrl(data, 'application/octet-stream');
  }

  /** i3dm 内部の feature table を生成する */
  private createFeatureTable() {
    const positionsByteLength = this.cuboids.length * 12;
    const positionsByteOffset = 0;
    const scalesByteLength = this.cuboids.length * 12;
    const scalesByteOffset = positionsByteOffset + positionsByteLength;
    const batchIdsByteLength = this.cuboids.length * 4;
    const batchIdsByteOffset = scalesByteOffset + scalesByteLength;
    const featureTableJson = CuboidCollection.createPaddedBinary(
      new TextEncoder().encode(
        JSON.stringify({
          INSTANCES_LENGTH: this.cuboids.length,
          EAST_NORTH_UP: true,
          POSITION: {
            byteOffset: positionsByteOffset,
          },
          SCALE_NON_UNIFORM: {
            byteOffset: scalesByteOffset,
          },
          BATCH_ID: {
            componentType: 'UNSIGNED_INT',
            byteOffset: batchIdsByteOffset,
          },
        })
      ),
      0x20
    );
    const featureTableBinary = CuboidCollection.createPaddedBinary(
      new ArrayBuffer(positionsByteLength + scalesByteLength + batchIdsByteLength),
      0x00
    );
    const positions = new DataView(featureTableBinary, positionsByteOffset, positionsByteLength);
    const scales = new DataView(featureTableBinary, scalesByteOffset, scalesByteLength);
    const batchIds = new DataView(featureTableBinary, batchIdsByteOffset, batchIdsByteLength);
    for (const [i, { location: tileLocation, scale: tileScale }] of Object.entries(
      this.cuboids
    ).map(([k, v]) => [Number(k), v] as [number, typeof v])) {
      positions.setFloat32(i * 12, tileLocation.x, true);
      positions.setFloat32(i * 12 + 4, tileLocation.y, true);
      positions.setFloat32(i * 12 + 8, tileLocation.z, true);
      scales.setFloat32(i * 12, tileScale.x, true);
      scales.setFloat32(i * 12 + 4, tileScale.y, true);
      scales.setFloat32(i * 12 + 8, tileScale.z, true);
      batchIds.setUint32(i * 4, i, true);
    }

    return {
      featureTableJson,
      featureTableBinary,
    };
  }

  /** i3dm 内部の batch table を作成する */
  private createBatchTable() {
    const batchTable = {} as { [Key in keyof Metadata]: Metadata[Key][] };
    for (const [i, { metadata }] of Object.entries(this.cuboids).map(
      ([k, v]) => [Number(k), v] as [number, typeof v]
    )) {
      if (!metadata) {
        continue;
      }

      for (const [key, value] of Object.entries(metadata)) {
        if (!Object.prototype.hasOwnProperty.call(batchTable, key)) {
          batchTable[key as keyof Metadata] = new Array(this.cuboids.length).fill(null);
        }
        batchTable[key as keyof Metadata][i] = value as Metadata[keyof Metadata];
      }
    }
    const batchTableJson = CuboidCollection.createPaddedBinary(
      new TextEncoder().encode(JSON.stringify(batchTable)),
      0x20
    );

    return { batchTableJson };
  }

  /**
   * バイナリデータにパディングを行う
   * @param binary パディングを行うバイナリデータ
   * @param value パディング部分に詰める値 (0 〜 255)
   * @param boundary 何バイト単位にパディングを行うか
   * @returns パディング済みのバイナリデータ
   */
  private static createPaddedBinary(binary: ArrayBuffer, value: number, boundary = 8) {
    const padLength = boundary - (binary.byteLength % boundary);
    if (padLength === boundary) {
      return binary;
    }

    const newBinary = new Uint8Array(binary.byteLength + padLength);
    newBinary.set(new Uint8Array(binary));

    const padding = new Uint8Array(padLength);
    padding.fill(value);
    newBinary.set(padding, binary.byteLength);

    return newBinary.buffer;
  }
}
