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
import { ResponseTooLargeError, StreamResponse, VoxelTypeError } from 'spatial-id-svc-base';

import { DisplayDetails } from '#app/components/area-viewer/interface';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { barrierTypes } from '#app/utils/create-process-barrier-map';
import { mapGetOrSet } from '#app/utils/map-get-or-set';

interface SignalInfo extends Record<string, unknown> {
  id: string;
  'RSI (dB)': number;
}
const SINGLE = 'single_model';
const MULTIPLE = 'multiple_models';

const toFiniteNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
export const useLoadModel = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async function* (id: string) {
    for await (const spatialIds of processSignals(
      getSignalArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      type as keyof typeof barrierTypes
    )) {
      const barrier = spatialIds.get(id);
      if (barrier === undefined) {
        throw new Error(`barrier ${id} not found in response`);
      }

      const model = new CuboidCollection<SignalInfo>(
        await Promise.all([...barrier.values()].map((s) => s.createCuboid()))
      );

      yield model;
    }
  }, []);

  return loadModel;
};

export const useLoadModels = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async function* (displayDetails: DisplayDetails) {
    for await (const areas of processSignals(
      getSignalAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetSignalRequest,
      }),
      type as keyof typeof barrierTypes
    )) {
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
      yield models;
    }
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
    const rsi = toFiniteNumber(spatialIdentification.RSI);
    if (rsi == null) {
      continue;
    }
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<SignalInfo>(spatialId, {
          id: areaId,
          'RSI (dB)': rsi,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return spatialIds;
};

export const createSignalMap = (
  map: Map<string, Map<string, SpatialId<SignalInfo>>>,
  object: any,
  type: string,
  modelQuantity: string = MULTIPLE
) => {
  if (object.microwave[type] == undefined) {
    return map;
  }
  const objectId = object.objectId;
  let objectIdOrCode;
  if (modelQuantity == MULTIPLE && type == 'mobile') {
    const countryCode = object.microwave?.mobile?.plmnId?.mobileCountryCode ?? '';
    const networkCode = object.microwave?.mobile?.plmnId?.mobileNetworkCode ?? '';
    objectIdOrCode = `${countryCode}${networkCode}`;
  } else {
    objectIdOrCode = objectId;
  }
  const spatialIds = mapGetOrSet(
    map,
    objectIdOrCode,
    () => new Map<string, SpatialId<SignalInfo>>()
  );

  for (const definition of object.microwave[type].voxelValues) {
    const spatialId = definition.id.ID;
    if (spatialIds.has(spatialId)) {
      continue;
    }
    const rsi = toFiniteNumber(definition.RSI);
    if (rsi == null) {
      continue;
    }
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<SignalInfo>(spatialId, {
          id: objectId,
          'RSI (dB)': rsi,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return map;
};

export const processSignals = async function* (
  result: AsyncGenerator<StreamResponse<SpatialDefinition | SpatialDefinitions>>,
  type: keyof typeof barrierTypes
) {
  let barriers = new Map<string, Map<string, SpatialId<SignalInfo>>>();
  for await (const resp of result) {
    if ('objectId' in resp.result) {
      if (!(resp.result.microwave !== undefined && type in resp.result.microwave)) {
        throw new VoxelTypeError(`指定したIDは${barrierTypes[type]}ではありません`);
      }
      barriers = createSignalMap(barriers, resp.result, type, SINGLE);
    } else if ('objects' in resp.result) {
      for (const object of resp.result.objects) {
        barriers = createSignalMap(barriers, object, type);
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
