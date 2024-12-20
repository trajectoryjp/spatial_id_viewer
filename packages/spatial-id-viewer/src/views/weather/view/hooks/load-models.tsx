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
import { StreamResponse } from 'spatial-id-svc-base';

import { DisplayDetails } from '#app/components/area-viewer/interface';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { mapGetOrSet } from '#app/utils/map-get-or-set';

interface WeatherInfo extends Record<string, unknown> {
  id: string;
  spatialId?: string;
  startTime?: string;
  endTime?: string;
  'windDirection (degree)': number;
  'windSpeed (knot)': number;
  'cloudRate (%)': number;
  'temperature (°C)'?: number;
  'dewPoint (°C)'?: number;
  'pressure (hPa)'?: number;
  'precipitation (mm/h)': number;
  'visibility (km)'?: number;
  gggg?: string;
}

export const useLoadModel = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = await processWeathers(
      getWeather({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      type
    );
    const barrier = spatialIds.get(id);
    if (barrier === undefined) {
      throw new Error(`barrier ${id} not found in response`);
    }

    const model = new CuboidCollection<WeatherInfo>(
      await Promise.all([...barrier.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

export const useLoadModels = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    const areas = await processWeathers(
      getWeatherAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetWeatherRequest,
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
      )) as [string, CuboidCollection<WeatherInfo>][]
    );

    return models;
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

// export const processWeather = (area: any, type: string) => {
//   const areaId = area.objectId;
//   const spatialIds = new Map<string, SpatialId<WeatherInfo>>();
//   for (const spatialIdentification of area[type].voxelValues) {
//     const spatialId = spatialIdentification.id.ID;
//     try {
//       if (type === 'weather') {
//         spatialIds.set(
//           spatialId,
//           SpatialId.fromString<WeatherInfo>(spatialId, {
//             id: areaId,
//             ...spatialIdentification.currentWeather,
//           })
//         );
//       } else {
//         spatialIds.set(
//           spatialId,
//           SpatialId.fromString<WeatherInfo>(spatialId, {
//             id: areaId,
//             ...spatialIdentification.forecast,
//           })
//         );
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   return spatialIds;
// };

// interface GetAreas {
//   objects: SpatialDefinition[];
// }

// export const processWeathers = async (
//   result: AsyncGenerator<StreamResponse<GetAreas>>,
//   type: string
// ) => {
//   const areas = new Map<string, Map<string, SpatialId<WeatherInfo>>>();
//   for await (const resp of result) {
//     for (const area of resp.result.objects) {
//       const areaId = area.objectId;
//       const spatialIds = mapGetOrSet(
//         areas,
//         areaId,
//         () => new Map<string, SpatialId<WeatherInfo>>()
//       );

//       for (const [spatialId, spatialIdObj] of processWeather(area, type).entries()) {
//         spatialIds.set(spatialId, spatialIdObj);
//       }
//     }
//   }

//   return areas;
// };

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
            'windDirection (degree)': definition.currentWeather.windDirection,
            'windSpeed (knot)': definition.currentWeather.windSpeed,
            'cloudRate (%)': definition.currentWeather.cloudRate,
            'temperature (°C)': definition.currentWeather.temperature,
            'dewPoint (°C)': definition.currentWeather.dewPoint,
            'pressure (hPa)': definition.currentWeather.pressure,
            'precipitation (mm/h)': definition.currentWeather.precipitation,
            'visibility (km)': definition.currentWeather.visibility,
          })
        );
      } else {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<WeatherInfo>(spatialId, {
            id: objectId,
            startTime: definition.forecast.startTime,
            endTime: definition.forecast.endTime,
            'windDirection (degree)': definition.forecast.windDirection,
            'windSpeed (knot)': definition.forecast.windSpeed,
            'cloudRate (%)': definition.forecast.cloudRate,
            'precipitation (mm/h)': definition.forecast.precipitation,
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return map;
};

export const processWeathers = async (
  result: AsyncGenerator<StreamResponse<SpatialDefinition | SpatialDefinitions>>,
  type: string
) => {
  let barriers = new Map<string, Map<string, SpatialId<WeatherInfo>>>();
  for await (const resp of result) {
    if ('objectId' in resp.result) {
      barriers = createWeatherMap(barriers, resp.result, type);
    } else if ('objects' in resp.result) {
      for (const object of resp.result.objects) {
        barriers = createWeatherMap(barriers, object, type);
      }
    }
  }
  return barriers;
};
