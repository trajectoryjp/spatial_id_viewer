import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  deleteReservedArea,
  GetAreaRequest,
  GetEmergencyAreas,
  getReservedArea,
  getReservedAreas,
  GetReservedAreasResponse,
  ReservedArea,
} from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';
import { RequestTypes } from 'spatial-id-svc-common';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { processBarriers } from '#app/utils/create-process-barrier-map';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import { WithStore } from '#app/views/reserved-areas/view/store';

/** 表示するメタデータ */
interface ReservedAreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

const processReservedArea = (area: any, type: string) => {
  const areaId = area.objectId;
  const spatialIds = new Map<string, SpatialId<ReservedAreaInfo>>();
  for (const spatialIdent of area[type].voxelValues) {
    const spatialId = spatialIdent.id.ID;

    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<ReservedAreaInfo>(spatialId, {
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

const processReservedAreas = async (
  result: AsyncGenerator<StreamResponse<GetEmergencyAreas>>,
  type: string
) => {
  const areas = new Map<string, Map<string, SpatialId<ReservedAreaInfo>>>();
  for await (const resp of result) {
    for (const area of resp.result.objects) {
      const areaId = area.objectId;
      const spatialIds = mapGetOrSet(
        areas,
        areaId,
        () => new Map<string, SpatialId<ReservedAreaInfo>>()
      );

      for (const [key, value] of processReservedArea(area, type).entries()) {
        spatialIds.set(key, value);
      }
    }
  }

  return areas;
};

/** ID を指定してモデルを 1 つ取得する関数を返す React Hook */
const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = await processBarriers(
      getReservedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      'emergencyArea'
    );

    const barrier = spatialIds.get(id);
    if (barrier === undefined) {
      throw new Error(`barrier ${id} not found in response`);
    }
    const model = new CuboidCollection<ReservedAreaInfo>(
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
    const areas = await processReservedAreas(
      getReservedAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetAreaRequest,
      }),
      'emergencyArea'
    );

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
      )) as [string, CuboidCollection<ReservedAreaInfo>][]
    );

    return models;
  }, []);

  return loadModels;
};

/** ID を指定してモデルを 1 つ削除する関数を返す React Hook */
const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteReservedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

const ReservedAreasViewer = () => {
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
    console.log(tilesetStyleFn(tileOpacity));
  }, [tileOpacity]);

  return (
    <>
      <Head>
        <title>緊急エリア予約の表示・削除</title>
      </Head>
      <AreaViewer
        featureName="緊急エリアの予約"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.EMERGENCY_AREA}
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

export default WithAuthGuard(WithStore(ReservedAreasViewer));
