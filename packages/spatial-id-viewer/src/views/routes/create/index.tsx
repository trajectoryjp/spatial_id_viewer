import { Cartographic, Math as CesiumMath } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { Point } from 'spatial-id-svc-common';
import { createRoute, CreateRouteRequest } from 'spatial-id-svc-route';

import { WithAuthGuard } from '#app/components/auth-guard';
import {
  addErroredPathsFromErrorDef,
  InvalidPathError,
  IWaypoints,
  RouteCreator,
} from '#app/components/route-creator';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { WholeRouteInfoFragment } from '#app/views/routes/create/fragments/whole-route-info';
import { WholeRouteInfo } from '#app/views/routes/create/interfaces';

/** ルート登録関数を返す React Hook */
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  /** ルート登録関数 */
  const register = useCallback(async (waypoints: IWaypoints<WholeRouteInfo, never>) => {
    const waypointsForApi = waypoints.data.map((wp) => {
      const cart = Cartographic.fromCartesian(wp.point);
      return {
        latitude: CesiumMath.toDegrees(cart.latitude),
        longitude: CesiumMath.toDegrees(cart.longitude),
        altitude: wp.altitude,
        altitudeAttribute: 'ALTITUDE_ATTRIBUTE_MSL',
      } as Point;
    });

    const payload = {
      clearance: waypoints.wholeRouteInfo.clearance,
      ignoreReservedRouteIds: [],
      waypoints: waypointsForApi,
      uavInfo: {
        uavSize: String(waypoints.wholeRouteInfo.uavSize),
      },
    } as CreateRouteRequest;

    let errored = false;
    const erroredPathIndices = new Set<number>();
    for await (const resp of createRoute({
      baseUrl: apiBaseUrl,
      authInfo: authInfo.current,
      payload,
    })) {
      if (resp.result?.result.Error != null) {
        errored = true;
        addErroredPathsFromErrorDef(erroredPathIndices, resp.result.result.Error);
      }
    }

    if (errored) {
      throw new InvalidPathError(erroredPathIndices);
    }
  }, []);

  return register;
};

const ReservedRouteCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>ルート設計</title>
      </Head>
      <RouteCreator<WholeRouteInfo, never>
        register={register}
        wholeRouteInfoFragment={WholeRouteInfoFragment}
      />
    </>
  );
};

export default WithAuthGuard(ReservedRouteCreator);
