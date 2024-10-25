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

const processBlockedAreas = async (
  result: AsyncGenerator<StreamResponse<GetBlockedAreas>>,
  type: string
) => {
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
    const spatialIds = await processBarriers(
      getBlockedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      'restrictedArea'
    );

    const barrier = spatialIds.get(id);
    if (barrier === undefined) {
      throw new Error(`barrier ${id} not found in response`);
    }

    const model = new CuboidCollection<BlockedAreaInfo>(
      await Promise.all([...barrier.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
const useLoadModels = () => {
  // const store = useStoreApi();
  // const startTime = useLatest(useStore(store, (s) => s.startTime));
  // const endTime = useLatest(useStore(store, (s) => s.endTime));

  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    const areas = await processBlockedAreas(
      getBlockedAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetAreaRequest,
      }),
      'restrictedArea'
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
// const useWatchModels = () => {
//   const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

//   const watchModels = useCallback(async function* (bbox: DisplayDetails, abortSignal: AbortSignal) {
//     for await (const chunk of watchBlockedAreas({
//       baseUrl: apiBaseUrl,
//       authInfo: authInfo.current,
//       payload: {
//         boundary: [
//           {
//             ID: bbox.figure.identification.ID.toString(),
//           },
//         ],
//         hasSpatialId: true,
//       },
//       abortSignal,
//     })) {
//       const created = new Map<string, CuboidCollection<BlockedAreaInfo>>();
//       const deleted = new Set<string>();
//       if (chunk.result.created !== undefined) {
//         const area = processBlockedArea(chunk.result.created);
//         for (const [id, model] of (
//           await convertToModels(new Map([[chunk.result.created.id, area]]))
//         ).entries()) {
//           created.set(id, model);
//         }
//       }
//       if (chunk.result.deleted !== undefined) {
//         deleted.add(chunk.result.deleted.id);
//       }

//       yield { created, deleted };
//     }
//   }, []);

//   return watchModels;
// };

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

  // 空間 ID で指定された範囲のモデルの変更を監視し、モデルの表示に反映させる関数
  // const watchModels = (bbox: SpatialId) => {
  //   const abortController = new AbortController();
  //   const execute = async () => {
  //     for await (const { created, deleted } of watchModelsImpl(bbox, abortController.signal)) {
  //       updateModels.current((models) => {
  //         const toastOptions: ToastOptions = { position: 'bottom-center', autoClose: 2000 };

  //         for (const [id, model] of created) {
  //           models.set(id, castDraft(model));
  //           toast.info(`追加されました: ${id}`, toastOptions);
  //         }
  //         for (const id of deleted) {
  //           models.delete(id);
  //           toast.info(`削除されました: ${id}`, toastOptions);
  //         }

  //         return models;
  //       });
  //     }
  //   };

  //   abortControllerRef.current?.abort();
  //   abortControllerRef.current = abortController;
  //   execute().catch((x) => {
  //     console.error(x);
  //     warnIfTokenExpired(x);
  //   });
  // };

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
    console.log(tilesetStyleFn(tileOpacity));
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
