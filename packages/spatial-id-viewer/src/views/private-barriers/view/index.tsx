import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { RequestTypes } from 'spatial-id-svc-common';
import {
  deleteBarrier,
  GetBuildingBarriersRequest,
  getPrivateBarrier,
  getPrivateBarriers,
} from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { Info, processBarriers } from '#app/utils/create-process-barrier-map';

/** ID を指定してモデルを 1 件取得する関数を返す React Hook */
const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async function* (id: string) {
    for await (const barriers of processBarriers(
      getPrivateBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      'building'
    )) {
      const barrier = barriers.get(id);
      if (barrier === undefined) {
        throw new Error(`private barrier ${id} not found in response`);
      }

      const model = new CuboidCollection<Info>(
        await Promise.all([...barrier.values()].map((s) => s.createCuboid()))
      );
      yield model;
    }
  }, []);

  return loadModel;
};

const useLoadModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async function* (displayDetails: DisplayDetails) {
    for await (const barriers of processBarriers(
      getPrivateBarriers({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetBuildingBarriersRequest,
      }),
      'building'
    )) {
      const models = new Map(
        (await Promise.all(
          [...barriers.entries()]
            .filter(([, v]) => v.size)
            .map(async ([barrierId, spatialIds]) => [
              barrierId,
              new CuboidCollection(
                await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
              ),
            ])
        )) as [string, CuboidCollection<Info>][]
      );

      yield models;
    }
  }, []);

  return loadModels;
};

/** ID を指定してモデルを削除する関数を返す React Hook */
const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

const PrivateBarriersViewer = () => {
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);
  const loadModel = useLoadModel();
  const loadModels = useLoadModels();
  const deleteModel = useDeleteModel();

  const useModels = createUseModels({
    loadModel,
    loadModels,
    deleteModel,
  });

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };
  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity));
  }, [tileOpacity]);

  return (
    <>
      <Head>
        <title>建物バリア表示・削除</title>
      </Head>
      <AreaViewer
        featureName="建物バリア"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.BUILDING}
      >
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

export default WithAuthGuard(PrivateBarriersViewer);
