import {
  ApiResponseError,
  AuthInfo,
  CommonResponseHeader,
  fetchJson,
  fetchJsonStream,
  fetchRawJson,
  StreamStatus,
} from 'spatial-id-svc-base';
import { Point, SpatialIdentification } from 'spatial-id-svc-common';

import { SpatialDefinition, SpatialFigure } from './client-barriers';

export interface Route {
  route: SpatialIdentification[];
  waypoints: Point[];
  mappingOfWaypointIndex: number[];
}

export interface Path {
  pathMap: { [index: string]: Point };
}

export interface ErrorDef {
  detail: string;
  waypointsInBarrierPaths: Path[];
  noPathPaths: Path[];
  noDataPaths: Path[];
  unexpectedErrorPaths: Path[];
}

export type ReservationMethod = 'TRJXRecommend' | 'InputWPPriority';

export interface UavInfo {
  uavSize: string;
}

export interface CreateRouteRequest {
  waypoints: Point[];
  clearance: number;
  ignoreReservedRouteIds: string[];
  uavInfo: UavInfo;
}

export interface RouteResponseResult {
  route?: Route;
  Error?: ErrorDef;
}

export interface CreateRouteResponse {
  responseHeader: CommonResponseHeader;
  result: RouteResponseResult;
  status: StreamStatus;
}

export interface CreateReservedRouteRequest {
  waypoints: Point[];
  ignoreReservedRouteIds: string[];
  clearance: number;
  aircraftId: string;
  startTime: string;
  endTime: string;
  reservationMethod: ReservationMethod;
  uavInfo: UavInfo;
  ignoreSpatialId: boolean;
}

export interface CreateReservedRouteRequestV3 {
  overwrite: boolean;
  object: SpatialDefinition;
}

export interface routeArea {
  id: {
    ID: string;
  };
  reservationTime: {
    period: {
      startTime?: Date;
      endTime?: Date;
    };
    occupation: string;
    reserveId: string;
  };
}
export interface CreateReservedRouteResponse {
  responseHeader?: CommonResponseHeader;
  result: RouteResponseResult;
  status: StreamStatus;
  reservedRouteId: string;
}

export interface successResponse {
  objectId: string;
  error: string;
}
export interface ErrorResponse {
  code: number;
  message: string;
  details: ErrorDetails[];
}

export interface ErrorDetails {
  '@type': string;
  property1: any;
  property2: any;
}

export interface GetReservedRoutesRequest {
  boundary: SpatialIdentification;
  aircraftId: string;
  startTime: string;
  endTime: string;
  hasRoutes: boolean;
}
export interface GetReservedRoutesRequestV3 {
  figure: SpatialFigure;
  requestType: string[];
}

export interface getPermittedAirSpaceRequest {
  figure: SpatialFigure;
  period: {
    startTime: number;
    endTime: number;
  };
  includeReserveArea: boolean;
}

export interface GetReservedRoutesResponse {
  responseHeader: CommonResponseHeader;
  reservedRouteId: string;
  status: StreamStatus;
  routes: Route[];
}
export interface GetReservedRoutesResponseV3 {
  responseHeader?: CommonResponseHeader;
  objects: SpatialDefinition[];
}

export interface GetAircraftsRequest {
  boundary: SpatialIdentification[];
}

export interface GetAircraftsResponse {
  responseHeader: CommonResponseHeader;
  aircraftsId: string[];
  status: StreamStatus;
}

export interface GetReservedIdResponse {
  responseHeader: CommonResponseHeader;
  routeId: string[];
  status: StreamStatus;
}

export interface GetReservedRouteResponse {
  responseHeader?: CommonResponseHeader;
  reservedRouteId: string;
  routes: Route[];
}

export interface GetReservedRouteResponseV3 extends SpatialDefinition {
  responseHeader?: CommonResponseHeader;
  error: ErrorResponse;
}

export interface GetPermittedRoutesResponse {
  responseHeader?: CommonResponseHeader;
  outOfSpace: {
    ID: string[];
  };
  flyableSpace: {
    ID: string[];
  };
  error: string;
}

export interface GetPermittedRoutesResponseStream {
  responseHeader?: CommonResponseHeader;
  result: {
    outOfSpace: {
      ID: string[];
    };
    flyableSpace: {
      ID: string[];
    };
    occupiedSpace: {
      ID: string[];
    };
    error: string;
  };
  error: ErrorResponse;
}

export interface GetReservedRoutesParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetReservedRoutesRequest;
  abortSignal?: AbortSignal;
}

export interface GetReservedRoutesParamsV3 {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetReservedRoutesRequestV3;
  abortSignal?: AbortSignal;
}

export interface GetPermittedRoutesParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: getPermittedAirSpaceRequest;
  abortSignal?: AbortSignal;
}
/** 空間 ID の範囲内の予約ルートを複数取得する */
// export const getReservedRoutes = async function* ({
//   baseUrl,
//   authInfo,
//   payload,
//   abortSignal,
// }: GetReservedRoutesParams) {
//   for await (const chunk of fetchJsonStream<GetReservedRoutesResponse>({
//     method: 'POST',
//     baseUrl,
//     path: '/route_service/reserved_routes_list',
//     authInfo,
//     payload,
//     abortSignal,
//   })) {
//     yield chunk;
//   }
// };

export const getReservedRoutes = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetReservedRoutesParamsV3) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetReservedRoutesResponseV3>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-value',
    authInfo,
    payload,
    abortSignal,
  })) {
    if (chunk.result.objects[0].objectId !== '0') {
      objectId = chunk.result.objects[0].objectId;
      continue;
    }
    chunk.result.objects[0].objectId = objectId;
    yield chunk;
  }
};

export interface GetReservedRouteParams {
  baseUrl: string;
  authInfo: AuthInfo;
  // reservedRouteId: string;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定して予約ルートを 1 件取得する */
// export const getReservedRoute = async ({
//   baseUrl,
//   authInfo,
//   reservedRouteId,
//   abortSignal,
// }: GetReservedRouteParams) => {
//   return await fetchJson<GetReservedRouteResponse>({
//     method: 'GET',
//     baseUrl,
//     path: `/route_service/reserved_routes/${encodeURIComponent(reservedRouteId)}`,
//     authInfo,
//     abortSignal,
//   });
// };

// export const getReservedRoute = async ({
//   baseUrl,
//   authInfo,
//   id,
//   abortSignal,
// }: GetReservedRouteParams) => {
//   return await fetchJson<GetReservedRouteResponseV3>({
//     method: 'POST',
//     baseUrl,
//     path: `/uas/api/airmobility/v3/get-object`,
//     authInfo,
//     payload: { objectId: id },
//     abortSignal,
//   });
// };

export const getReservedRoute = async function* ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetReservedRouteParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetReservedRouteResponseV3>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-object',
    authInfo,
    payload: { objectId: id },
    abortSignal,
  })) {
    if (chunk.result.objectId !== '0') {
      objectId = chunk.result.objectId;
      continue;
    }
    chunk.result.objectId = objectId;
    yield chunk;
  }
};

export const getPermittedAirSpace = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetPermittedRoutesParams) {
  for await (const chunk of fetchJsonStream<GetPermittedRoutesResponse>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/select-airspace-arrangement',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

// export const getPermittedAirSpace = async  ({
//   baseUrl,
//   authInfo,
//   payload,
//   abortSignal,
// }: GetPermittedRoutesParams) =>{
//   return await fetchJson<GetPermittedRoutesResponse>({
//     method: 'POST',
//     baseUrl,
//     path: '/uas/api/airmobility/v3/select-airspace-arrangement',
//     authInfo,
//     payload,
//     abortSignal,
//   })

// };

export const getPermittedAirSpaceStream = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetPermittedRoutesParams) {
  for await (const chunk of fetchJsonStream<GetPermittedRoutesResponseStream>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/select-airspace-arrangement-stream',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface DeleteReservedRouteParams {
  baseUrl: string;
  authInfo: AuthInfo;
  // reservedRouteId: string;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定して予約ルートを削除する */
export const deleteReservedRoute = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: DeleteReservedRouteParams) => {
  await fetchJson({
    method: 'POST',
    baseUrl,
    path: `/uas/api/airmobility/v3/delete-object`,
    authInfo,
    payload: { objectId: id },
    abortSignal,
  });
};

export interface GetAircraftsParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetAircraftsRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内の機体の ID を複数取得する */
export const getAircrafts = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetAircraftsParams) {
  for await (const chunk of fetchJsonStream<GetAircraftsResponse>({
    method: 'POST',
    baseUrl,
    path: '/route_service/aircrafts_list',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface GetReservedIdParams {
  baseUrl: string;
  authInfo: AuthInfo;
  aircraftId: string;
  abortSignal?: AbortSignal;
}

/** 機体 ID を指定して予約ルート ID を複数取得する */
export const getReservedId = async function* ({
  baseUrl,
  authInfo,
  aircraftId,
  abortSignal,
}: GetReservedIdParams) {
  for await (const chunk of fetchJsonStream<GetReservedIdResponse>({
    method: 'GET',
    baseUrl,
    path: `/route_service/reserved_id_list/${encodeURIComponent(aircraftId)}`,
    authInfo,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface CreateRouteParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: CreateRouteRequest;
  abortSignal?: AbortSignal;
}

/** ルートを設計する */
export const createRoute = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateRouteParams) {
  for await (const chunk of fetchJsonStream<CreateRouteResponse>({
    method: 'POST',
    baseUrl,
    path: `/route_service/routes`,
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface CreateReservedRouteParams {
  baseUrl: string;
  authInfo: AuthInfo;
  // payload: CreateReservedRouteRequest;
  payload: CreateReservedRouteRequestV3;
  abortSignal?: AbortSignal;
}

/** 予約ルートを生成する */
// export const createReservedRoute = async function* ({
//   baseUrl,
//   authInfo,
//   payload,
//   abortSignal,
// }: CreateReservedRouteParams) {
//   for await (const chunk of fetchJsonStream<CreateReservedRouteResponse>({
//     method: 'POST',
//     baseUrl,
//     path: `uas/api/airmobility/v3/put-reserve-area`,
//     authInfo,
//     payload,
//     abortSignal,
//   })) {
//     yield chunk;
//   }
// };

export const createReservedRoute = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateReservedRouteParams) => {
  const resp = await fetchRawJson<successResponse | ErrorResponse>({
    method: 'POST',
    baseUrl,
    // path: '/uas/api/airmobility/v3/put-reserve-area',
    path: '/uas/api/airmobility/v3/put-reserve-area',
    authInfo,
    payload,
    abortSignal,
  });
  if ('code' in resp) {
    throw new ApiResponseError('failed to create: error occured with code ' + resp.code);
  }
  return resp;
};
