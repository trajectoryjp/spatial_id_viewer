/// <reference path="../../../types/binary-files.d.ts" />

import { fromArrayBuffer } from 'geotiff';

import geotiffBinary from './assets/jp_gsi_gsigeo2011.tif';

// 日本水準原点のジオイド高を基準にする
const HEIGHT_OFFSET = 36.7071;

interface GeoidHeightResources {
  buffer: Float32Array;
  width: number;
  height: number;
  boundingBox: number[];
}

const initResources = async () => {
  const tiff = await fromArrayBuffer(geotiffBinary);
  const img = await tiff.getImage();
  return {
    buffer: (await img.readRasters())[0] as Float32Array,
    width: img.getWidth(),
    height: img.getHeight(),
    boundingBox: img.getBoundingBox(),
  } as GeoidHeightResources;
};

let resourcesPromise: Promise<GeoidHeightResources> = null;

/**
 * 指定地点のおおよそのジオイド高を返す。日本付近でのみ使用可能。
 * @param long 経度 (度)
 * @param lat 緯度 (度)
 * @param defaultValue 取得できなかった場合に返す値
 * @returns ジオイド高
 */
export const getGeoidHeight = async (long: number, lat: number, defaultValue = HEIGHT_OFFSET) => {
  if (resourcesPromise === null) {
    // ここで await すると、Promise が pending の時もう一度この関数が呼ばれた場合
    // 複数回初期化され不都合な状態となる (メモリ確保が複数回発生してに失敗する等) ため、
    // Promise のまま保持させ使用時に await する
    resourcesPromise = initResources();
  }
  const resources = await resourcesPromise;

  const [longWest, latSouth, longEast, latNorth] = resources.boundingBox;
  if (longWest > long || longEast < long || latSouth > lat || latNorth < lat) {
    return defaultValue;
  }

  const imgWidth = resources.width;
  const imgHeight = resources.height;
  const widthPct = (long - longWest) / (longEast - longWest);
  const heightPct = 1 - (lat - latSouth) / (latNorth - latSouth);
  // パフォーマンス向上のため補間は行っていない
  const posX = Math.floor(imgWidth * widthPct);
  const posY = Math.floor(imgHeight * heightPct);
  const height = resources.buffer[posX + posY * imgWidth];
  if (height === -32768) {
    return defaultValue;
  }

  return height;
};
