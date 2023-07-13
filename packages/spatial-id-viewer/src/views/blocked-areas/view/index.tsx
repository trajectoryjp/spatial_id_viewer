import { Cesium3DTileStyle } from 'cesium';
import { castDraft } from 'immer';
import Head from 'next/head';
import { useCallback, useMemo, useRef } from 'react';
import { toast, ToastOptions } from 'react-toastify';
import { useLatest, useUnmount } from 'react-use';
import { useStore } from 'zustand';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  BlockedArea,
  deleteBlockedArea,
  getBlockedArea,
  getBlockedAreas,
  GetBlockedAreasResponse,
  watchBlockedAreas,
} from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';

import { AreaViewer, createUseModels, ModelControllers } from '#app/components/area-viewer';
import { IStore } from '#app/components/area-viewer/store';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import { warnIfTokenExpired } from '#app/utils/warn-if-token-expired';
import { AdditionalSettings } from '#app/views/blocked-areas/view/additonal-settings';
import { useStoreApi, WithStore } from '#app/views/blocked-areas/view/store';

/** 表示するメタデータ */
interface BlockedAreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
  startTime: string;
  endTime: string;
}

const processBlockedArea = (area: BlockedArea) => {
  const areaId = area.id;
  const spatialIds = new Map<string, SpatialId<BlockedAreaInfo>>();
  for (const spatialIdentification of area.spatialIdentifications) {
    const spatialId = spatialIdentification.ID;
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<BlockedAreaInfo>(spatialId, {
          id: areaId,
          spatialId,
          startTime: area.startTime,
          endTime: area.endTime,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return spatialIds;
};

const processBlockedAreas = async (
  result: AsyncGenerator<StreamResponse<GetBlockedAreasResponse>>
) => {
  const areas = new Map<string, Map<string, SpatialId<BlockedAreaInfo>>>();
  for await (const resp of result) {
    for (const area of resp.result.blockedAreas) {
      const areaId = area.id;
      const spatialIds = mapGetOrSet(
        areas,
        areaId,
        () => new Map<string, SpatialId<BlockedAreaInfo>>()
      );

      for (const [spatialId, spatialIdObj] of processBlockedArea(area).entries()) {
        spatialIds.set(spatialId, spatialIdObj);
      }
    }
  }

  return areas;
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

/** ID を指定してモデルを 1 件取得する関数を返す React Hook */
const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = processBlockedArea(
      (await getBlockedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id })).blockedArea
    );

    const model = new CuboidCollection<BlockedAreaInfo>(
      await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
const useLoadModels = () => {
  const store = useStoreApi();
  const startTime = useLatest(useStore(store, (s) => s.startTime));
  const endTime = useLatest(useStore(store, (s) => s.endTime));

  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (bbox: SpatialId) => {
    const areas = await processBlockedAreas(
      getBlockedAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: {
          boundary: [
            {
              ID: bbox.toString(),
            },
          ],
          hasSpatialId: true,
          startTime: dateToStringUnixTime(startTime.current),
          endTime: dateToStringUnixTime(endTime.current),
        },
      })
    );

    const models = await convertToModels(areas);
    return models;
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

/** 空間 ID で範囲を指定してモデルの追加・削除を監視する関数を返す React Hook */
const useWatchModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const watchModels = useCallback(async function* (bbox: SpatialId, abortSignal: AbortSignal) {
    for await (const chunk of watchBlockedAreas({
      baseUrl: apiBaseUrl,
      authInfo: authInfo.current,
      payload: {
        boundary: [
          {
            ID: bbox.toString(),
          },
        ],
        hasSpatialId: true,
      },
      abortSignal,
    })) {
      const created = new Map<string, CuboidCollection<BlockedAreaInfo>>();
      const deleted = new Set<string>();
      if (chunk.result.created !== undefined) {
        const area = processBlockedArea(chunk.result.created);
        for (const [id, model] of (
          await convertToModels(new Map([[chunk.result.created.id, area]]))
        ).entries()) {
          created.set(id, model);
        }
      }
      if (chunk.result.deleted !== undefined) {
        deleted.add(chunk.result.deleted.id);
      }

      yield { created, deleted };
    }
  }, []);

  return watchModels;
};

/** モデルに関連する操作を行う関数群を返す React Hook */
const useModels = (store: IStore<BlockedAreaInfo>): ModelControllers => {
  const updateModels = useLatest(store.replaceModels);

  const loadModelImpl = useLoadModel();
  const loadModelsImpl = useLoadModels();
  const deleteModelImpl = useDeleteModel();
  const watchModelsImpl = useWatchModels();

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

  // 空間 ID で指定された範囲のモデルの変更を監視し、モデルの表示に反映させる関数
  const watchModels = (bbox: SpatialId) => {
    const abortController = new AbortController();
    const execute = async () => {
      for await (const { created, deleted } of watchModelsImpl(bbox, abortController.signal)) {
        updateModels.current((models) => {
          const toastOptions: ToastOptions = { position: 'bottom-center', autoClose: 2000 };

          for (const [id, model] of created) {
            models.set(id, castDraft(model));
            toast.info(`追加されました: ${id}`, toastOptions);
          }
          for (const id of deleted) {
            models.delete(id);
            toast.info(`削除されました: ${id}`, toastOptions);
          }

          return models;
        });
      }
    };

    abortControllerRef.current?.abort();
    abortControllerRef.current = abortController;
    execute().catch((x) => {
      console.error(x);
      warnIfTokenExpired(x);
    });
  };

  // createUseModels により作られた loadModels 関数をラップして監視処理をミックスする
  const loadModels = async (bbox: SpatialId) => {
    await loadModelsBase(bbox);
    watchModels(bbox);
  };

  useUnmount(() => {
    abortControllerRef.current?.abort();
  });

  return useMemo(() => ({ loadModel, loadModels, deleteModel, unloadModels }), []);
};

const BlockedAreasViewer = () => {
  return (
    <>
      <Head>
        <title>割込禁止エリア予約表示・削除</title>
      </Head>
      <AreaViewer
        featureName="割込禁止エリア予約"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
      >
        <AdditionalSettings />
      </AreaViewer>
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default WithAuthGuard(WithStore(BlockedAreasViewer));
