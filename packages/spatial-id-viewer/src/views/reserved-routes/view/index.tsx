import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection } from 'spatial-id-converter';
import { RequestTypes } from 'spatial-id-svc-common';
import {
  deleteReservedRoute,
  getReservedRoute,
  getReservedRoutes,
  GetReservedRoutesRequestV3,
} from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { processAreas } from '#app/utils/create-areas';
import { processBarriers } from '#app/utils/create-process-barrier-map';
import { WithStore } from '#app/views/reserved-routes/view/store';

/** 表示するメタデータ */
interface ReservedRouteInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async function* (id: string) {
    for await (const spatialIds of processBarriers(
      getReservedRoute({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      'reserveArea'
    )) {
      const route = spatialIds.get(id);
      if (route === undefined) {
        throw new Error(`private barrier ${id} not found in response`);
      }

      const model = new CuboidCollection<ReservedRouteInfo>(
        await Promise.all([...route.values()].map((s) => s.createCuboid()))
      );
      yield model;
    }
  }, []);

  return loadModel;
};

const useLoadModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async function* (displayDetails: DisplayDetails) {
    for await (const reservedRoutes of processAreas(
      getReservedRoutes({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetReservedRoutesRequestV3,
      }),
      'reserveArea'
    )) {
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

      yield models;
    }
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
