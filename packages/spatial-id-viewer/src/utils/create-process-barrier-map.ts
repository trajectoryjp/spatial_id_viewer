import { SpatialId } from 'spatial-id-converter';
import { ResponseTooLargeError, StreamResponse } from 'spatial-id-svc-base';
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

export const processBarriers = async (
  result: AsyncGenerator<StreamResponse<SpatialDefinition | SpatialDefinitions>>,
  type: string
) => {
  let barriers = new Map<string, Map<string, SpatialId<Info>>>();
  for await (const resp of result) {
    if ('objectId' in resp.result) {
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
  }
  return barriers;
};
