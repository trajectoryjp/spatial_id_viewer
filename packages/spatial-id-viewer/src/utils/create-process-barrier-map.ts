import { SpatialId } from 'spatial-id-converter';
import { ResponseTooLargeError, StreamResponse, VoxelTypeError } from 'spatial-id-svc-base';
import { SpatialDefinition, SpatialDefinitions } from 'spatial-id-svc-route';

import { mapGetOrSet } from '#app/utils/map-get-or-set';

/** 表示するメタデータ */
export interface Info extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

export const createBarrierMap = (
  map: Map<string, Map<string, SpatialId<Info>>>,
  object: any,
  type: string
) => {
  const objectId = object.objectId;
  const spatialIds = mapGetOrSet(map, objectId, () => new Map<string, SpatialId<Info>>());

  for (const definition of object[type].voxelValues) {
    const spatialId = definition.id.ID;
    if (spatialIds.has(spatialId)) {
      continue;
    }

    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<Info>(spatialId, {
          id: objectId,
          spatialId,
          // risk: 10,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return map;
};

export const processBarriers = async function* (
  result: AsyncGenerator<StreamResponse<SpatialDefinition | SpatialDefinitions>>,
  type: keyof typeof barrierTypes
) {
  let barriers = new Map<string, Map<string, SpatialId<Info>>>();
  for await (const resp of result) {
    if ('objectId' in resp.result) {
      if (!(type in resp.result)) {
        throw new VoxelTypeError(`指定したIDは${barrierTypes[type]}ではありません`);
      }
      barriers = createBarrierMap(barriers, resp.result, type);
    } else if ('objects' in resp.result) {
      for (const object of resp.result.objects) {
        barriers = createBarrierMap(barriers, object, type);
      }
    }

    let totalObjects = 0;
    for (const innerMap of barriers.values()) {
      totalObjects += innerMap.size;
      if (totalObjects > 250000) {
        throw new ResponseTooLargeError();
      }
    }

    yield barriers;
  }
};

export enum barrierTypes {
  'terrain' = '地形バリア',
  'building' = '建物バリア',
  'restrictedArea' = '立ち入り禁止エリア',
  'mobile' = 'モバイル情報',
  'wifi' = 'Wi-Fi情報',
  'overlayArea' = 'オーバーレイエリア',
  'emergencyArea' = '緊急エリア',
  'reserveArea' = '予約ルート',
  'weather' = '気象情報',
  'weatherForecast' = '気象予報',
}
