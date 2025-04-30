import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLatest, useUnmount } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  deleteBlockedArea,
  GetAreaRequest,
  getBlockedArea,
  GetBlockedAreas,
  getBlockedAreas,
} from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';
import { RequestTypes } from 'spatial-id-svc-common';

import { AreaViewer, createUseModels, ModelControllers } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { IStore } from '#app/components/area-viewer/store';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { processBarriers } from '#app/utils/create-process-barrier-map';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import { WithStore } from '#app/views/blocked-areas/view/store';

/** 表示するメタデータ */
interface BlockedAreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

const processBlockedArea = (area: any, type: string) => {
  const areaId = area.objectId;
  const spatialIds = new Map<string, SpatialId<BlockedAreaInfo>>();
  for (const spatialIdentification of area[type].voxelValues) {
    const spatialId = spatialIdentification.id.ID;
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<BlockedAreaInfo>(spatialId, {
          id: areaId,
          spatialId,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return spatialIds;
};

const processBlockedAreas = async function* (
  result: AsyncGenerator<StreamResponse<GetBlockedAreas>>,
  type: string
) {
  const areas = new Map<string, Map<string, SpatialId<BlockedAreaInfo>>>();
  for await (const resp of result) {
    for (const area of resp.result.objects) {
      const areaId = area.objectId;
      const spatialIds = mapGetOrSet(
        areas,
        areaId,
        () => new Map<string, SpatialId<BlockedAreaInfo>>()
      );

      for (const [spatialId, spatialIdObj] of processBlockedArea(area, type).entries()) {
        spatialIds.set(spatialId, spatialIdObj);
      }
    }

    yield areas;
  }
};

const convertToModels = async (areas: Map<string, Map<string, SpatialId<BlockedAreaInfo>>>) => {
  const models = new Map(
    (await Promise.all(
      [...areas.entries()]
        .filter(([, v]) => v.size)
        .map(async ([areaId, spatialIds]) => [
          areaId,
          new CuboidCollection(
            await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
          ),
        ])
    )) as [string, CuboidCollection<BlockedAreaInfo>][]
  );

  return models;
};

const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async function* (id: string) {
    for await (const barriers of processBarriers(
      getBlockedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      'restrictedArea'
    )) {
      const barrier = barriers.get(id);
      if (barrier === undefined) {
        throw new Error(`barrier ${id} not found in response`);
      }

      const model = new CuboidCollection<BlockedAreaInfo>(
        await Promise.all([...barrier.values()].map((s) => s.createCuboid()))
      );
      yield model;
    }
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
const useLoadModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async function* (displayDetails: DisplayDetails) {
    for await (const areas of processBlockedAreas(
      getBlockedAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetAreaRequest,
      }),
      'restrictedArea'
    )) {
      const models = await convertToModels(areas);
      yield models;
    }
  }, []);

  return loadModels;
};

/** ID を指定してモデルを削除する関数を返す React Hook */
const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteBlockedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

/** モデルに関連する操作を行う関数群を返す React Hook */
const useModels = (store: IStore<BlockedAreaInfo>): ModelControllers => {
  // const updateModels = useLatest(store.replaceModels);

  const loadModelImpl = useLoadModel();
  const loadModelsImpl = useLoadModels();
  const deleteModelImpl = useDeleteModel();
  // const watchModelsImpl = useWatchModels();

  // まず他の機能との共通のインターフェースを作り、createUseModels でベースとなる関数群を作る
  const abortControllerRef = useRef<AbortController | null>(null);

  const onUnloadModels = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const useModelsBase = createUseModels({
    loadModel: loadModelImpl,
    loadModels: loadModelsImpl,
    deleteModel: deleteModelImpl,
    onUnloadModels,
  });

  const { loadModel, loadModels: loadModelsBase, deleteModel, unloadModels } = useModelsBase(store);

  // createUseModels により作られた loadModels 関数をラップして監視処理をミックスする
  const loadModels = async (bbox: DisplayDetails) => {
    await loadModelsBase(bbox);
    // watchModels(bbox);
  };

  useUnmount(() => {
    abortControllerRef.current?.abort();
  });

  return useMemo(() => ({ loadModel, loadModels, deleteModel, unloadModels }), []);
};

const BlockedAreasViewer = () => {
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };
  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity));
  }, [tileOpacity]);

  return (
    <>
      <Head>
        <title>制限エリアの予約表示・削除</title>
      </Head>
      <AreaViewer
        featureName="制限エリア予約"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.RESTRICTED_AREA}
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

export default WithAuthGuard(WithStore(BlockedAreasViewer));
