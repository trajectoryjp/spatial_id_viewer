import { Cesium3DTileStyle } from 'cesium';
import { castDraft, Draft } from 'immer';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useLatest } from 'react-use';
import { useStore } from 'zustand';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { AuthInfo, StreamResponse } from 'spatial-id-svc-base';
import { RequestTypes } from 'spatial-id-svc-common';
import {
  getAircrafts,
  getPermittedAirSpace,
  getPermittedAirSpaceRequest,
  getPermittedAirSpaceStream,
  GetPermittedRoutesResponse,
  getReservedId,
  getReservedRoute,
  GetReservedRouteResponse,
} from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { createUseAirspaceModels } from '#app/components/area-viewer/create-use-airspace';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { useStoreApi, WithStore } from '#app/components/area-viewer/store';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import AdditionalDateSettings from '#app/views/aircraft-routes/view/AdditionalDate';
// import { useStoreApi, WithStore } from '#app/views/aircraft-routes/view/store';

/** 表示するメタデータ */
interface AircraftRouteInfo extends Record<string, unknown> {
  id: string;
  reservedRouteId: string;
  spatialId: string;
}

interface AirSpaceInfo extends Record<string, unknown> {
  type: string;
  spatialId: string;
}

interface FetchAircraftInfoResult {
  aircraftId: string;
  response: GetReservedRouteResponse;
}

const createModel = async (IDs: string[], key: string) => {
  const spatialIds = new Map<string, SpatialId<AirSpaceInfo>>();
  for (const spatialId of IDs) {
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<AirSpaceInfo>(spatialId, {
          type: key,
          spatialId,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  const model = new CuboidCollection<AirSpaceInfo>(
    await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
  );
  return new Map<string, Draft<CuboidCollection<any>>>([[key, castDraft(model)]]);
};
const processAircraftRoutes = async (
  result: AsyncGenerator<StreamResponse<any>>,
  stream = false
) => {
  const routes: any[] = [];
  if (!stream) {
    for await (const response of result) {
      if (response.outOfSpace) {
        routes.push(await createModel(response.outOfSpace.ID, 'outOfSpace'));
      }
      if (response.flyableSpace) {
        routes.push(await createModel(response.flyableSpace.ID, 'flyableSpace'));
      }
    }
  } else {
    for await (const response of result) {
      if (response.result.outOfSpace) {
        routes.push(await createModel(response.result.outOfSpace.ID, 'outOfSpace'));
      }
      if (response.result.flyableSpace) {
        routes.push(await createModel(response.result.flyableSpace.ID, 'flyableSpace'));
      }
      if (response.result.occupiedSpace) {
        routes.push(await createModel(response.result.occupiedSpace.ID, 'occupiedSpace'));
      }
    }
  }

  return routes;
};

const useLoadModels = (stream = false) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadAirSpaceModels = useCallback(async (displayDetails: DisplayDetails) => {
    displayDetails.includeReserveArea = true;
    let reservedRoutes = null;

    if (!stream) {
      reservedRoutes = await processAircraftRoutes(
        getPermittedAirSpace({
          baseUrl: apiBaseUrl,
          authInfo: authInfo.current,
          payload: displayDetails as getPermittedAirSpaceRequest,
        }),
        false
      );
    } else {
      reservedRoutes = await processAircraftRoutes(
        getPermittedAirSpaceStream({
          baseUrl: apiBaseUrl,
          authInfo: authInfo.current,
          payload: displayDetails as getPermittedAirSpaceRequest,
        }),
        true
      );
    }

    return reservedRoutes;
  }, []);

  return loadAirSpaceModels;
};

const AircraftRoutesViewer = () => {
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };
  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity));
  }, [tileOpacity]);

  const loadAirSpaceModels = useLoadModels();
  const loadAirSpaceModelsStream = useLoadModels(true);
  const useModels = createUseAirspaceModels({
    loadAirSpaceModels,
    loadAirSpaceModelsStream,
  });

  return (
    <>
      <Head>
        <title>許可空域表示</title>
      </Head>
      <AreaViewer
        featureName="許可空域"
        featureIdName="機体"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.AIR_SPACE}
        opacity={tileOpacity}
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
        <AdditionalDateSettings />
      </AreaViewer>
    </>
  );
};

const tilesetStyleFn = (tileOpacity: number) =>
  new Cesium3DTileStyle({
    color: `hsla(0.5, 1, 0.5, ${tileOpacity})`,
  });

export default WithAuthGuard(WithStore(AircraftRoutesViewer));
