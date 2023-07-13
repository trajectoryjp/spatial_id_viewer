import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { StreamResponse } from 'spatial-id-svc-base';
import {
  BarrierDefinition,
  deletePrivateBarrier,
  getPrivateBarrier,
  getPrivateBarriers,
} from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { mapGetOrSet } from '#app/utils/map-get-or-set';

/** 表示するメタデータ */
interface PrivateBarrierInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
  risk: number;
}

/** レスポンス中のプライベートバリア共通部分 */
interface IPrivateBarrier {
  id: string;
  barrierDefinitions: BarrierDefinition[];
}

const processPrivateBarriers = async (result: AsyncGenerator<StreamResponse<IPrivateBarrier>>) => {
  const barriers = new Map<string, Map<string, SpatialId<PrivateBarrierInfo>>>();
  for await (const resp of result) {
    const barrierId = resp.result.id;
    const spatialIds = mapGetOrSet(
      barriers,
      barrierId,
      () => new Map<string, SpatialId<PrivateBarrierInfo>>()
    );

    for (const barrierDefinition of resp.result.barrierDefinitions) {
      const spatialId = barrierDefinition.spatialIdentification.ID;
      if (spatialIds.has(spatialId)) {
        continue;
      }

      try {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<PrivateBarrierInfo>(spatialId, {
            id: barrierId,
            spatialId,
            risk: barrierDefinition.risk,
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
  }

  return barriers;
};

/** ID を指定してモデルを 1 件取得する関数を返す React Hook */
const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const barriers = await processPrivateBarriers(
      getPrivateBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id })
    );
    const barrier = barriers.get(id);
    if (barrier === undefined) {
      throw new Error(`private barrier ${id} not found in response`);
    }

    const model = new CuboidCollection<PrivateBarrierInfo>(
      await Promise.all([...barrier.values()].map((b) => b.createCuboid()))
    );
    return model;
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
const useLoadModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (bbox: SpatialId) => {
    const barriers = await processPrivateBarriers(
      getPrivateBarriers({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: {
          boundary: {
            ID: bbox.toString(),
          },
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
      )) as [string, CuboidCollection<PrivateBarrierInfo>][]
    );

    return models;
  }, []);

  return loadModels;
};

/** ID を指定してモデルを削除する関数を返す React Hook */
const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deletePrivateBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

const PrivateBarriersViewer = () => {
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
        <title>プライベートバリア表示・削除</title>
      </Head>
      <AreaViewer
        featureName="プライベートバリア"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
      />
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'hsla(clamp(${feature["risk"]}, 0, 10) / 10, 1, 0.85, 0.95)',
});

export default WithAuthGuard(PrivateBarriersViewer);
