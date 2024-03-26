import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';
import { useStore } from 'zustand';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { StreamResponse } from 'spatial-id-svc-base';
import {
  deleteReservedRoute,
  getReservedRoute,
  getReservedRoutes,
  GetReservedRoutesResponse,
  Route,
} from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import { AdditionalSettings } from '#app/views/reserved-routes/view/additonal-settings';
import { useStoreApi, WithStore } from '#app/views/reserved-routes/view/store';

/** 表示するメタデータ */
interface ReservedRouteInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

const processReservedRoute = (id: string, result: Route[]) => {
  const spatialIds = new Map<string, SpatialId<ReservedRouteInfo>>();
  for (const route of result) {
    for (const spatialIdent of route.route) {
      const spatialId = spatialIdent.ID;

      try {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<ReservedRouteInfo>(spatialId, {
            id,
            spatialId,
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
  return spatialIds;
};

const processReservedRoutes = async (
  result: AsyncGenerator<StreamResponse<GetReservedRoutesResponse>>
) => {
  const routes = new Map<string, Map<string, SpatialId<ReservedRouteInfo>>>();
  for await (const resp of result) {
    const reservedRouteId = resp.result.reservedRouteId;
    const spatialIds = mapGetOrSet(
      routes,
      reservedRouteId,
      () => new Map<string, SpatialId<ReservedRouteInfo>>()
    );

    const newSpatialIds = processReservedRoute(reservedRouteId, resp.result.routes);
    for (const [key, value] of newSpatialIds.entries()) {
      spatialIds.set(key, value);
    }
  }

  return routes;
};

/** ID を指定してモデルを 1 つ取得する関数を返す React Hook */
const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (reservedRouteId: string) => {
    const reservedRoute = processReservedRoute(
      reservedRouteId,
      (await getReservedRoute({ baseUrl: apiBaseUrl, authInfo: authInfo.current, reservedRouteId }))
        .routes
    );

    const model = new CuboidCollection<ReservedRouteInfo>(
      await Promise.all([...reservedRoute.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
const useLoadModels = () => {
  const store = useStoreApi();
  const aircraftId = useLatest(useStore(store, (s) => s.aircraftId));
  const startTime = useLatest(useStore(store, (s) => s.startTime));
  const endTime = useLatest(useStore(store, (s) => s.endTime));

  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (bbox: SpatialId) => {
    const reservedRoutes = await processReservedRoutes(
      getReservedRoutes({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: {
          boundary: {
            ID: bbox.toString(),
          },
          aircraftId: aircraftId.current,
          startTime: dateToStringUnixTime(startTime.current),
          endTime: dateToStringUnixTime(endTime.current),
          hasRoutes: true,
        },
      })
    );

    const models = new Map(
      (await Promise.all(
        [...reservedRoutes.entries()]
          .filter(([, v]) => v.size)
          .map(async ([barrierId, spatialIds]) => [
            barrierId,
            new CuboidCollection(
              await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
            ),
          ])
      )) as [string, CuboidCollection<ReservedRouteInfo>][]
    );

    return models;
  }, []);

  return loadModels;
};

/** ID を指定してモデルを 1 つ削除する関数を返す React Hook */
const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (reservedRouteId: string) => {
    await deleteReservedRoute({ baseUrl: apiBaseUrl, authInfo: authInfo.current, reservedRouteId });
  }, []);

  return deleteModel;
};

const ReservedRoutesViewer = () => {
  const loadModel = useLoadModel();
  const loadModels = useLoadModels();
  const deleteModel = useDeleteModel();

  const useModels = createUseModels({
    loadModel,
    loadModels,
    deleteModel,
  });

  return (
    <>
      <Head>
        <title>予約ルート表示・削除</title>
      </Head>
      <AreaViewer featureName="予約ルート" useModels={useModels} tilesetStyle={tilesetStyle}>
        <AdditionalSettings />
      </AreaViewer>
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default WithAuthGuard(WithStore(ReservedRoutesViewer));
