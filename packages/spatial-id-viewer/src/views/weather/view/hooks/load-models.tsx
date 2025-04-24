import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  deleteWeather,
  getWeather,
  getWeatherAreas,
  GetWeatherRequest,
  SpatialDefinition,
  SpatialDefinitions,
} from 'spatial-id-svc-area';
import { ResponseTooLargeError, StreamResponse, VoxelTypeError } from 'spatial-id-svc-base';

import { DisplayDetails } from '#app/components/area-viewer/interface';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { barrierTypes } from '#app/utils/create-process-barrier-map';
import { mapGetOrSet } from '#app/utils/map-get-or-set';

interface WeatherInfo extends Record<string, unknown> {
  id: string;
  spatialId?: string;
  startTime?: string;
  endTime?: string;
  'windDirection (degree)'?: number;
  'windSpeed (knot)'?: number;
  'cloudRate (%)'?: number;
  'temperature (°C)'?: number;
  'dewPoint (°C)'?: number;
  'pressure (hPa)'?: number;
  'precipitation (mm/h)': number;
  'visibility (km)'?: number;
  gggg?: string;
}

export const useLoadModel = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async function* (id: string) {
    for await (const spatialIds of processWeathers(
      getWeather({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      type as keyof typeof barrierTypes
    )) {
      const barrier = spatialIds.get(id);
      if (barrier === undefined) {
        throw new Error(`barrier ${id} not found in response`);
      }

      const model = new CuboidCollection<WeatherInfo>(
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
    for await (const areas of processWeathers(
      getWeatherAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetWeatherRequest,
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
        )) as [string, CuboidCollection<WeatherInfo>][]
      );
      yield models;
    }
  }, []);

  return loadModels;
};

export const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteWeather({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

export const createWeatherMap = (
  map: Map<string, Map<string, SpatialId<WeatherInfo>>>,
  object: any,
  type: string
) => {
  const objectId = object.objectId;
  const spatialIds = mapGetOrSet(map, objectId, () => new Map<string, SpatialId<WeatherInfo>>());

  for (const definition of object[type].voxelValues) {
    const spatialId = definition.id.ID;
    if (spatialIds.has(spatialId)) {
      continue;
    }

    try {
      if (type === 'weather') {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<WeatherInfo>(spatialId, {
            id: objectId,
            startTime: definition.currentWeather.startTime,
            endTime: definition.currentWeather.endTime,
            'windDirection (degree)': definition.currentWeather.windDirection ?? 0,
            'windSpeed (knot)': definition.currentWeather.windSpeed ?? 0,
            'cloudRate (%)': definition.currentWeather.cloudRate ?? 0,
            'temperature (°C)': definition.currentWeather.temperature ?? 0,
            'dewPoint (°C)': definition.currentWeather.dewPoint ?? 0,
            'pressure (hPa)': definition.currentWeather.pressure ?? 0,
            'precipitation (mm/h)': definition.currentWeather.precipitation ?? 0,
            'visibility (km)': definition.currentWeather.visibility ?? 0,
          })
        );
      } else {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<WeatherInfo>(spatialId, {
            id: objectId,
            startTime: definition.forecast.startTime,
            endTime: definition.forecast.endTime,
            'windDirection (degree)': definition.forecast.windDirection ?? 0,
            'windSpeed (knot)': definition.forecast.windSpeed ?? 0,
            'cloudRate (%)': definition.forecast.cloudRate ?? 0,
            'precipitation (mm/h)': definition.forecast.precipitation ?? 0,
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return map;
};

export const processWeathers = async function* (
  result: AsyncGenerator<StreamResponse<SpatialDefinition | SpatialDefinitions>>,
  type: keyof typeof barrierTypes
) {
  let barriers = new Map<string, Map<string, SpatialId<WeatherInfo>>>();
  for await (const resp of result) {
    if ('objectId' in resp.result) {
      if (!(type in resp.result)) {
        throw new VoxelTypeError(`指定したIDは${barrierTypes[type]}ではありません`);
      }
      barriers = createWeatherMap(barriers, resp.result, type);
    } else if ('objects' in resp.result) {
      for (const object of resp.result.objects) {
        barriers = createWeatherMap(barriers, object, type);
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
