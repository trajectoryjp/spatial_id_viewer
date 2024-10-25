import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLatest, useUnmount } from 'react-use';

import { CuboidCollection } from 'spatial-id-converter';
import {
  deleteOverlayArea,
  GetAreaRequest,
  getOverlayArea,
  getOverlayAreas,
} from 'spatial-id-svc-area';
import { RequestTypes } from 'spatial-id-svc-common';

import { AreaViewer, createUseModels, ModelControllers } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { IStore } from '#app/components/area-viewer/store';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { convertToModels, processAreas } from '#app/utils/create-areas';
import { processBarriers } from '#app/utils/create-process-barrier-map';
import { WithStore } from '#app/views/blocked-areas/view/store';

interface OverlayAreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = await processBarriers(
      getOverlayArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      'overlayArea'
    );

    const barrier = spatialIds.get(id);
    if (barrier === undefined) {
      throw new Error(`barrier ${id} not found in response`);
    }

    const model = new CuboidCollection<OverlayAreaInfo>(
      await Promise.all([...barrier.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

const useLoadModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    const areas = await processAreas(
      getOverlayAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetAreaRequest,
      }),
      'overlayArea'
    );

    const models = await convertToModels(areas);
    return models;
  }, []);

  return loadModels;
};

const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteOverlayArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

const useModels = (store: IStore<OverlayAreaInfo>): ModelControllers => {
  const loadModelImpl = useLoadModel();
  const loadModelsImpl = useLoadModels();
  const deleteModelImpl = useDeleteModel();

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

  const loadModels = async (bbox: DisplayDetails) => {
    await loadModelsBase(bbox);
  };

  useUnmount(() => {
    abortControllerRef.current?.abort();
  });

  return useMemo(() => ({ loadModel, loadModels, deleteModel, unloadModels }), []);
};

const OverlayAreasViewer = () => {
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
        <title>オーバーレイエリアの予約表示/削除</title>
      </Head>
      <AreaViewer
        featureName="オーバーレイエリアの予約"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.OVERLAY_AREA}
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

export default WithAuthGuard(WithStore(OverlayAreasViewer));
