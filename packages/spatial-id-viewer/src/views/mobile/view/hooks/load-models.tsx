import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  deleteSignal,
  getSignalArea,
  getSignalAreas,
  GetSignalRequest,
  SpatialDefinition,
  SpatialDefinitions,
} from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';

import { DisplayDetails } from '#app/components/area-viewer/interface';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { mapGetOrSet } from '#app/utils/map-get-or-set';

interface SignalInfo extends Record<string, unknown> {
  id: string;
  RSI: number;
}

export const useLoadModel = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = await processSignals(
      getSignalArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      type
    );

    const barrier = spatialIds.get(id);
    if (barrier === undefined) {
      throw new Error(`barrier ${id} not found in response`);
    }

    const model = new CuboidCollection<SignalInfo>(
      await Promise.all([...barrier.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

export const useLoadModels = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    const areas = await processSignals(
      getSignalAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetSignalRequest,
      }),
      type
    );

    const models = new Map(
      (await Promise.all(
        [...areas.entries()]
          .filter(([, v]) => v.size)
          .map(async ([barrierId, spatialIds]) => [
            barrierId,
            new CuboidCollection(
              await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
            ),
          ])
      )) as [string, CuboidCollection<SignalInfo>][]
    );

    return models;
  }, []);

  return loadModels;
};

export const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteSignal({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

export const processSignal = (area: any, type: string) => {
  const areaId = area.objectId;
  const spatialIds = new Map<string, SpatialId<SignalInfo>>();
  const areaType = area.microwave;
  for (const spatialIdentification of areaType[type].voxelValues) {
    const spatialId = spatialIdentification.id.ID;
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<SignalInfo>(spatialId, {
          id: areaId,
          RSI: spatialIdentification.RSI,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return spatialIds;
};

// interface GetAreas {
//   objects: SpatialDefinition[];
// }

// export const processSignals = async (
//   result: AsyncGenerator<StreamResponse<GetAreas>>,
//   type: string
// ) => {
//   const areas = new Map<string, Map<string, SpatialId<SignalInfo>>>();
//   for await (const resp of result) {
//     for (const area of resp.result.objects) {
//       const areaId = area.objectId;
//       const spatialIds = mapGetOrSet(areas, areaId, () => new Map<string, SpatialId<SignalInfo>>());

//       for (const [spatialId, spatialIdObj] of processSignal(area, type).entries()) {
//         spatialIds.set(spatialId, spatialIdObj);
//       }
//     }
//   }

//   return areas;
// };

export const createSignalMap = (
  map: Map<string, Map<string, SpatialId<SignalInfo>>>,
  object: any,
  type: string
) => {
  const objectId = object.objectId;
  const spatialIds = mapGetOrSet(map, objectId, () => new Map<string, SpatialId<SignalInfo>>());

  for (const definition of object.microwave[type].voxelValues) {
    const spatialId = definition.id.ID;
    if (spatialIds.has(spatialId)) {
      continue;
    }
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<SignalInfo>(spatialId, {
          id: objectId,
          RSI: definition.RSI,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return map;
};

export const processSignals = async (
  result: AsyncGenerator<StreamResponse<SpatialDefinition | SpatialDefinitions>>,
  type: string
) => {
  let barriers = new Map<string, Map<string, SpatialId<SignalInfo>>>();
  for await (const resp of result) {
    if ('objectId' in resp.result) {
      barriers = createSignalMap(barriers, resp.result, type);
    } else if ('objects' in resp.result) {
      for (const object of resp.result.objects) {
        barriers = createSignalMap(barriers, object, type);
      }
    }
  }
  return barriers;
};
