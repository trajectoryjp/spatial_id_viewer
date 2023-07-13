import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { AuthInfo } from 'spatial-id-svc-base';
import {
  getAircrafts,
  getReservedId,
  getReservedRoute,
  GetReservedRouteResponse,
} from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { mapGetOrSet } from '#app/utils/map-get-or-set';

/** 表示するメタデータ */
interface AircraftRouteInfo extends Record<string, unknown> {
  id: string;
  reservedRouteId: string;
  spatialId: string;
}

interface FetchAircraftInfoResult {
  aircraftId: string;
  response: GetReservedRouteResponse;
}

const fetchAircraftInfo = async function* (authInfo: AuthInfo, aircraftId: string) {
  for await (const reservedIdResp of getReservedId({
    baseUrl: apiBaseUrl,
    authInfo,
    aircraftId,
  })) {
    for await (const reservedRouteId of reservedIdResp.result.routeId) {
      yield {
        aircraftId,
        response: await getReservedRoute({ baseUrl: apiBaseUrl, authInfo, reservedRouteId }),
      } as FetchAircraftInfoResult;
    }
  }
};

const fetchAircraftsInfo = async function* (authInfo: AuthInfo, bbox: SpatialId) {
  for await (const aircraftResp of getAircrafts({
    baseUrl: apiBaseUrl,
    authInfo,
    payload: {
      boundary: [
        {
          ID: bbox.toString(),
        },
      ],
    },
  })) {
    for (const aircraftId of aircraftResp.result.aircraftsId) {
      for await (const result of fetchAircraftInfo(authInfo, aircraftId)) {
        yield result as FetchAircraftInfoResult;
      }
    }
  }
};

const processAircraftRoutes = async (result: AsyncGenerator<FetchAircraftInfoResult>) => {
  const routes = new Map<string, Map<string, SpatialId<AircraftRouteInfo>>>();
  for await (const { aircraftId, response } of result) {
    const reservedRouteId = response.reservedRouteId;
    const spatialIds = mapGetOrSet(
      routes,
      aircraftId,
      () => new Map<string, SpatialId<AircraftRouteInfo>>()
    );

    for (const route of response.routes) {
      for (const spatialIdent of route.route) {
        const spatialId = spatialIdent.ID;
        try {
          spatialIds.set(
            spatialId,
            SpatialId.fromString<AircraftRouteInfo>(spatialId, {
              id: aircraftId,
              reservedRouteId,
              spatialId,
            })
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  return routes;
};

const convertToModels = async (aircraftInfo: AsyncGenerator<FetchAircraftInfoResult>) => {
  const reservedRoutes = await processAircraftRoutes(aircraftInfo);

  const models = new Map(
    (await Promise.all(
      [...reservedRoutes.entries()]
        .filter(([, v]) => v.size)
        .map(async ([aircraftId, spatialIds]) => [
          aircraftId,
          new CuboidCollection(
            await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
          ),
        ])
    )) as [string, CuboidCollection<AircraftRouteInfo>][]
  );

  return models;
};

const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (aircraftId: string) => {
    const models = await convertToModels(fetchAircraftInfo(authInfo.current, aircraftId));
    return models.get(aircraftId);
  }, []);

  return loadModel;
};

const useLoadModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (bbox: SpatialId) => {
    const models = await convertToModels(fetchAircraftsInfo(authInfo.current, bbox));
    return models;
  }, []);

  return loadModels;
};

const AircraftRoutesViewer = () => {
  const loadModel = useLoadModel();
  const loadModels = useLoadModels();
  const useModels = createUseModels({
    loadModel,
    loadModels,
  });

  return (
    <>
      <Head>
        <title>機体割付ルート表示</title>
      </Head>
      <AreaViewer
        featureName="機体割付ルート"
        featureIdName="機体"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
      />
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default WithAuthGuard(AircraftRoutesViewer);
