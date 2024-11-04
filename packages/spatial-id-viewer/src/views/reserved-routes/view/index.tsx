import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useLatest } from 'react-use';
import { useStore } from 'zustand';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { StreamResponse } from 'spatial-id-svc-base';
import { RequestTypes } from 'spatial-id-svc-common';
import {
  deleteReservedRoute,
  getReservedRoute,
  getReservedRoutes,
  GetReservedRoutesRequestV3,
  GetReservedRoutesResponse,
  Route,
} from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { processArea, processAreas } from '#app/utils/create-areas';
import { processBarriers } from '#app/utils/create-process-barrier-map';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import { AdditionalSettings } from '#app/views/reserved-routes/view/additonal-settings';
import { useStoreApi, WithStore } from '#app/views/reserved-routes/view/store';

/** 表示するメタデータ */
interface ReservedRouteInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}
interface AreaInfo extends Record<string, unknown> {
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
// const useLoadModel = () => {
//   const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

//   const loadModel = useCallback(async (reservedRouteId: string) => {
//     const reservedRoute = processReservedRoute(
//       reservedRouteId,
//       (await getReservedRoute({ baseUrl: apiBaseUrl, authInfo: authInfo.current, reservedRouteId }))
//         .routes
//     );

//     const model = new CuboidCollection<ReservedRouteInfo>(
//       await Promise.all([...reservedRoute.values()].map((s) => s.createCuboid()))
//     );

//     return model;
//   }, []);

//   return loadModel;
// };

function getLinePoints(x1: number, y1: number, x2: number, y2: number, f: number) {
  const points = new Map<string, SpatialId<AreaInfo>>();

  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  while (x1 !== x2 || y1 !== y2) {
    // points.push({ x: x1, y: y1 }); // Add the current point to the path
    points.set(`20/${f}/${x1}/${y1}`, new SpatialId(20, f, x1, y1));

    const e2 = 2 * err;

    if (e2 < dx) {
      err += dx;
      y1 += sy; // Move vertically
    }

    if (e2 > -dy) {
      err -= dy;
      x1 += sx; // Move horizontally
    }
  }

  return points;
}

function mergeMaps(map: Map<string, SpatialId<AreaInfo>>) {
  const entriesArray = Array.from(map.entries());
  for (let i = 0; i < entriesArray.length - 1; i++) {
    const [key1, spatialId1] = entriesArray[i];
    const [key2, spatialId2] = entriesArray[i + 1];

    const points = getLinePoints(
      spatialId1.x,
      spatialId1.y,
      spatialId2.x,
      spatialId2.y,
      spatialId1.f
    );

    points.forEach((value, key) => {
      if (!map.has(key)) {
        map.set(key, value);
      }
    });
  }
}

const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = await processBarriers(
      getReservedRoute({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      'reserveArea'
    );

    const route = spatialIds.get(id);
    if (route === undefined) {
      throw new Error(`private barrier ${id} not found in response`);
    }

    const model = new CuboidCollection<ReservedRouteInfo>(
      await Promise.all([...route.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
// const useLoadModels = () => {
//   const store = useStoreApi();
//   const aircraftId = useLatest(useStore(store, (s) => s.aircraftId));
//   const startTime = useLatest(useStore(store, (s) => s.startTime));
//   const endTime = useLatest(useStore(store, (s) => s.endTime));

//   const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

//   const loadModels = useCallback(async (bbox: SpatialId) => {
//     const reservedRoutes = await processReservedRoutes(
//       getReservedRoutes({
//         baseUrl: apiBaseUrl,
//         authInfo: authInfo.current,
//         payload: {
//           boundary: {
//             ID: bbox.toString(),
//           },
//           aircraftId: aircraftId.current,
//           startTime: dateToStringUnixTime(startTime.current),
//           endTime: dateToStringUnixTime(endTime.current),
//           hasRoutes: true,
//         },
//       })
//     );

//     const models = new Map(
//       (await Promise.all(
//         [...reservedRoutes.entries()]
//           .filter(([, v]) => v.size)
//           .map(async ([barrierId, spatialIds]) => [
//             barrierId,
//             new CuboidCollection(
//               await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
//             ),
//           ])
//       )) as [string, CuboidCollection<ReservedRouteInfo>][]
//     );

//     return models;
//   }, []);

//   return loadModels;
// };

const useLoadModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    const reservedRoutes = await processAreas(
      getReservedRoutes({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetReservedRoutesRequestV3,
      }),
      'reserveArea'
    );

    //go inside reservedRoutes and get the map foreach object id and add points
    // const entries = Array.from(reservedRoutes.entries());
    // for (let i = 0; i < entries.length; i++) {
    //   const map = reservedRoutes.get(entries[i][0]);
    //   mergeMaps(map);
    // }

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

  const deleteModel = useCallback(async (id: string) => {
    await deleteReservedRoute({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

const ReservedRoutesViewer = () => {
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const loadModel = useLoadModel();
  const loadModels = useLoadModels();
  const deleteModel = useDeleteModel();

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };
  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity));
  }, [tileOpacity]);

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
      <AreaViewer
        featureName="予約ルート"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.RESERVE_AREA}
      >
        {/* <AdditionalSettings /> */}
        <input
          type="range"
          className="h-1 accent-yellow-500"
          value={tileOpacity}
          onChange={onTileOpacityChange}
          min={0}
          max={1}
          step={0.01}
        />
      </AreaViewer>
    </>
  );
};

const tilesetStyleFn = (tileOpacity: number) =>
  new Cesium3DTileStyle({
    color: `hsla(0.5, 1, 0.5, ${tileOpacity})`,
  });

export default WithAuthGuard(WithStore(ReservedRoutesViewer));
