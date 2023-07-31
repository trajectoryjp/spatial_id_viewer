import { Math as CesiumMath, Viewer as CesiumViewer } from 'cesium';
import { RefObject, useCallback, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { CuboidCollection } from 'spatial-id-converter';
import { InternalBarrier } from 'spatial-id-converter-internal';
import {
  Configuration,
  convertGeodeticToKey,
  convertKeysToTileXyzs,
  getConfiguration,
  listBarrierMaps,
  ListBarrierMapsResponse_Datum,
  TileXyz,
} from 'spatial-id-svc-barriers-internal';

import { splitArrayIntoChunks } from '#app/utils/split-array-into-chunks';

import { apiBaseUrl } from '#app-internal/constants';
import { useComputeViewingBox } from '#app-internal/views/barriers-internal/view/hooks/compute-viewing-box';

/** 表示するメタデータ */
export interface InternalBarrierInfo extends Record<string, unknown> {
  id: string;
  internalBarrierId: string;
  startTime: string;
  endTime: string;
  groupId: string;
}

export interface LoadModelsParams {
  bottomAltitude: number;
  topAltitude: number;
  pageSoftSize: number;
  zoomLevel: number;
  isActive: boolean;
  organizationId: string;
  groupId: string;
}

/** positionKeyToSpKey リクエスト 1 回あたりの positionKey 個数制限 */
const SPKEY_REQUEST_ITEM_LIMIT = 25000;

export const useLoadModels = (viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>) => {
  const computeViewingBox = useComputeViewingBox(viewerRef);

  const [loading, setLoading] = useState(false);

  const fetchModelData = useCallback(async function* (
    {
      bottomAltitude,
      topAltitude,
      pageSoftSize,
      zoomLevel,
      isActive,
      organizationId,
      groupId,
    }: LoadModelsParams,
    abortSignal: AbortSignal
  ) {
    const { origin, diagonal } = computeViewingBox();
    const originKey = await convertGeodeticToKey({
      baseUrl: apiBaseUrl,
      payload: {
        geodetic: {
          latitude: CesiumMath.toDegrees(origin.latitude),
          longitude: CesiumMath.toDegrees(origin.longitude),
          altitude: bottomAltitude,
          tag: '',
        },
        zoomLevel,
      },
    });
    const diagonalKey = await convertGeodeticToKey({
      baseUrl: apiBaseUrl,
      payload: {
        geodetic: {
          latitude: CesiumMath.toDegrees(diagonal.latitude),
          longitude: CesiumMath.toDegrees(diagonal.longitude),
          altitude: topAltitude,
          tag: '',
        },
        zoomLevel,
      },
    });

    let startKey = originKey;
    while (true) {
      const resp = await listBarrierMaps({
        baseUrl: apiBaseUrl,
        payload: {
          pageSoftSize,
          view: 'VIEW_FULL',
          box: {
            min: originKey,
            max: diagonalKey,
          },
          startKey,
          relatedFilter: {
            isActive,
            organizationId,
            groupId,
          },
        },
        abortSignal,
      });
      const data = resp.data;

      const tileXyzs: TileXyz[] = [];
      for (const keyChunk of splitArrayIntoChunks(
        data.map((x) => x.key),
        SPKEY_REQUEST_ITEM_LIMIT
      )) {
        const converted = await convertKeysToTileXyzs({
          baseUrl: apiBaseUrl,
          payload: {
            keys: keyChunk,
          },
        });
        tileXyzs.push(...converted.tileXyzs);
      }

      yield { data, tileXyzs };

      if (resp.nextStartKey.hasValue) {
        startKey = resp.nextStartKey.key;
      } else {
        break;
      }
    }
  },
  []);

  const processModelData = useCallback(
    (
      { data, tileXyzs }: { data: ListBarrierMapsResponse_Datum[]; tileXyzs: TileXyz[] },
      config: Configuration
    ) => {
      const barriers: InternalBarrier<InternalBarrierInfo>[] = [];
      for (let i = 0; i < tileXyzs.length; i++) {
        const datum = data[i];
        const tileXyz = tileXyzs[i];

        for (const [modelId, barrierInfo] of Object.entries(datum.barrierMap.body)) {
          const barrier = new InternalBarrier<InternalBarrierInfo>(
            tileXyz.quadKeyZoomLevel,
            tileXyz.altitudeKeyZoomLevel,
            Number(tileXyz.x),
            Number(tileXyz.y),
            Number(tileXyz.z),
            config.bottomAltitude,
            config.topAltitude,
            {
              id: modelId,
              internalBarrierId: '',
              startTime: barrierInfo.startTime,
              endTime: barrierInfo.endTime,
              groupId: barrierInfo.groupId,
            }
          );
          barrier.metadata!.internalBarrierId = barrier.toString();

          barriers.push(barrier);
        }
      }

      return barriers;
    },
    []
  );

  const convertProcessed = useCallback(
    async (processed: InternalBarrier<InternalBarrierInfo>[]) => {
      const model = new CuboidCollection<InternalBarrierInfo>(
        await Promise.all(processed.map((i) => i.createCuboid()))
      );

      return model;
    },
    []
  );

  const loadModels = useCallback(async function* (
    params: LoadModelsParams,
    abortSignal: AbortSignal
  ) {
    setLoading(true);
    try {
      const configuration = await getConfiguration({ baseUrl: apiBaseUrl, abortSignal });
      for await (const fetched of fetchModelData(params, abortSignal)) {
        const processed = processModelData(fetched, configuration);
        const model = await convertProcessed(processed);
        yield model;
      }
    } finally {
      setLoading(false);
    }
  },
  []);

  return [loadModels, loading] as const;
};
