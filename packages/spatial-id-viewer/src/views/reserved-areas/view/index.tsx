import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';
import { useStore } from 'zustand';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  deleteReservedArea,
  getReservedArea,
  getReservedAreas,
  GetReservedAreasResponse,
  ReservedArea,
} from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import { AdditionalSettings } from '#app/views/reserved-areas/view/additonal-settings';
import { useStoreApi, WithStore } from '#app/views/reserved-areas/view/store';

/** 表示するメタデータ */
interface ReservedAreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
  startTime: string;
  endTime: string;
}

const processReservedArea = (id: string, area: ReservedArea) => {
  const spatialIds = new Map<string, SpatialId<ReservedAreaInfo>>();
  for (const spatialIdent of area.spatialIdentifications) {
    const spatialId = spatialIdent.ID;

    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<ReservedAreaInfo>(spatialId, {
          id,
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

const processReservedAreas = async (
  result: AsyncGenerator<StreamResponse<GetReservedAreasResponse>>
) => {
  const areas = new Map<string, Map<string, SpatialId<ReservedAreaInfo>>>();
  for await (const resp of result) {
    for (const area of resp.result.reservedAreas) {
      const areaId = area.id;
      const spatialIds = mapGetOrSet(
        areas,
        areaId,
        () => new Map<string, SpatialId<ReservedAreaInfo>>()
      );

      for (const [key, value] of processReservedArea(areaId, area).entries()) {
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
    const spatialIds = processReservedArea(
      id,
      (await getReservedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id })).reservedArea
    );

    const model = new CuboidCollection<ReservedAreaInfo>(
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
    const areas = await processReservedAreas(
      getReservedAreas({
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
        <title>飛行エリア予約表示・削除</title>
      </Head>
      <AreaViewer featureName="飛行エリア予約" useModels={useModels} tilesetStyle={tilesetStyle}>
        <AdditionalSettings />
      </AreaViewer>
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default WithAuthGuard(WithStore(ReservedAreasViewer));
