import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';
import { useStore } from 'zustand';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { StreamResponse } from 'spatial-id-svc-base';
import { Barrier, deleteBarrier, getBarrier, getBarriers } from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import { AdditionalSettings } from '#app/views/barriers/view/additonal-settings';
import { useStoreApi, WithStore } from '#app/views/barriers/view/store';

interface BarrierInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
  risk: number;
}

const processBarriers = async (result: AsyncGenerator<StreamResponse<Barrier>>) => {
  const barriers = new Map<string, Map<string, SpatialId<BarrierInfo>>>();
  for await (const resp of result) {
    const barrierId = resp.result.id;
    const spatialIds = mapGetOrSet(
      barriers,
      barrierId,
      () => new Map<string, SpatialId<BarrierInfo>>()
    );

    for (const barrierDefinition of resp.result.barrierDefinitions) {
      const spatialId = barrierDefinition.spatialIdentification.ID;
      if (spatialIds.has(spatialId)) {
        continue;
      }

      try {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<BarrierInfo>(spatialId, {
            id: barrierId,
            spatialId,
            risk: barrierDefinition.risk,
          })
        );
      } catch (e) {
        console.error(e);
      }
    }

    barriers.set(resp.result.id, spatialIds);
  }

  return barriers;
};

/** ID を指定してモデルを 1 件取得する関数を返す React Hook */
const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const barriers = await processBarriers(
      getBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id })
    );
    const barrier = barriers.get(id);
    if (barrier === undefined) {
      throw new Error(`barrier ${id} not found in response`);
    }

    const model = new CuboidCollection<BarrierInfo>(
      await Promise.all([...barrier.values()].map((s) => s.createCuboid()))
    );
    return model;
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
const useLoadModels = () => {
  const store = useStoreApi();
  const ownedBarriersOnly = useLatest(useStore(store, (s) => s.ownedBarriersOnly));

  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (bbox: SpatialId) => {
    const barriers = await processBarriers(
      getBarriers({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: {
          boundary: {
            ID: bbox.toString(),
          },
          onlyOwnedBarriers: ownedBarriersOnly.current,
          hasSpatialId: true,
        },
      })
    );

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
      )) as [string, CuboidCollection<BarrierInfo>][]
    );

    return models;
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

const BarriersViewer = () => {
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
        <title>パブリックバリア表示・削除</title>
      </Head>
      <AreaViewer featureName="パブリックバリア" useModels={useModels} tilesetStyle={tilesetStyle}>
        <AdditionalSettings />
      </AreaViewer>
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default WithAuthGuard(WithStore(BarriersViewer));
