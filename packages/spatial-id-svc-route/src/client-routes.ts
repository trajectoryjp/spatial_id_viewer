import {
  AuthInfo,
  CommonResponseHeader,
  fetchJson,
  fetchJsonStream,
  StreamStatus,
} from 'spatial-id-svc-base';
import { Point, SpatialIdentification } from 'spatial-id-svc-common';

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

export interface CreateReservedRouteResponse {
  responseHeader: CommonResponseHeader;
  result: RouteResponseResult;
  status: StreamStatus;
  reservedRouteId: string;
}

export interface GetReservedRoutesRequest {
  boundary: SpatialIdentification;
  aircraftId: string;
  startTime: string;
  endTime: string;
  hasRoutes: boolean;
}

export interface GetReservedRoutesResponse {
  responseHeader: CommonResponseHeader;
  reservedRouteId: string;
  status: StreamStatus;
  routes: Route[];
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
  responseHeader: CommonResponseHeader;
  reservedRouteId: string;
  routes: Route[];
}

export interface GetReservedRoutesParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetReservedRoutesRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内の予約ルートを複数取得する */
export const getReservedRoutes = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetReservedRoutesParams) {
  for await (const chunk of fetchJsonStream<GetReservedRoutesResponse>({
    method: 'POST',
    baseUrl,
    path: '/route_service/reserved_routes_list',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface GetReservedRouteParams {
  baseUrl: string;
  authInfo: AuthInfo;
  reservedRouteId: string;
  abortSignal?: AbortSignal;
}

/** ID を指定して予約ルートを 1 件取得する */
export const getReservedRoute = async ({
  baseUrl,
  authInfo,
  reservedRouteId,
  abortSignal,
}: GetReservedRouteParams) => {
  return await fetchJson<GetReservedRouteResponse>({
    method: 'GET',
    baseUrl,
    path: `/route_service/reserved_routes/${encodeURIComponent(reservedRouteId)}`,
    authInfo,
    abortSignal,
  });
};

export interface DeleteReservedRouteParams {
  baseUrl: string;
  authInfo: AuthInfo;
  reservedRouteId: string;
  abortSignal?: AbortSignal;
}

/** ID を指定して予約ルートを削除する */
export const deleteReservedRoute = async ({
  baseUrl,
  authInfo,
  reservedRouteId,
  abortSignal,
}: DeleteReservedRouteParams) => {
  await fetchJson({
    method: 'DELETE',
    baseUrl,
    path: `/route_service/reserved_routes/${encodeURIComponent(reservedRouteId)}`,
    authInfo,
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
  payload: CreateReservedRouteRequest;
  abortSignal?: AbortSignal;
}

/** 予約ルートを生成する */
export const createReservedRoute = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateReservedRouteParams) {
  for await (const chunk of fetchJsonStream<CreateReservedRouteResponse>({
    method: 'POST',
    baseUrl,
    path: `/route_service/reserved_routes`,
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};
