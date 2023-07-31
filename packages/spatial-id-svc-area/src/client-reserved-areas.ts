import {
  AuthInfo,
  CommonResponseHeader,
  fetchJson,
  fetchJsonStream,
  StreamStatus,
} from 'spatial-id-svc-base';
import { SpatialIdentification } from 'spatial-id-svc-common';

export interface ReservedArea {
  id: string;
  spatialIdentifications: SpatialIdentification[];
  startTime: string;
  endTime: string;
}

export interface GetReservedAreasRequest {
  boundary: SpatialIdentification[];
  hasSpatialId: boolean;
  startTime: string;
  endTime: string;
}

export interface GetReservedAreasResponse {
  responseHeader: CommonResponseHeader;
  reservedAreas: ReservedArea[];
  status: StreamStatus;
}

export interface GetReservedAreaResponse {
  responseHeader: CommonResponseHeader;
  reservedArea: ReservedArea;
}

export interface CreateReservedAreaRequest {
  reservedArea: ReservedArea;
}

export interface CreateReservedAreaResponse {
  responseHeader: CommonResponseHeader;
  areaId: string;
}

export interface GetReservedAreasParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetReservedAreasRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内の予約エリアを複数取得する */
export const getReservedAreas = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetReservedAreasParams) {
  for await (const chunk of fetchJsonStream<GetReservedAreasResponse>({
    method: 'POST',
    baseUrl,
    path: '/area_service/reserved_areas_list',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface GetReservedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定して予約エリアを 1 件取得する */
export const getReservedArea = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetReservedAreaParams) => {
  return await fetchJson<GetReservedAreaResponse>({
    method: 'GET',
    baseUrl,
    path: `/area_service/reserved_areas/${encodeURIComponent(id)}`,
    authInfo,
    abortSignal,
  });
};

export interface CreateReservedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: CreateReservedAreaRequest;
  abortSignal?: AbortSignal;
}

/** 予約エリアを生成する */
export const createReservedArea = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateReservedAreaParams) => {
  return await fetchJson<CreateReservedAreaResponse>({
    method: 'POST',
    baseUrl,
    path: '/area_service/reserved_areas',
    authInfo,
    payload,
    abortSignal,
  });
};

export interface DeleteReservedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定して予約エリアを削除する */
export const deleteReservedArea = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: DeleteReservedAreaParams) => {
  await fetchJson({
    method: 'DELETE',
    baseUrl,
    path: `/area_service/reserved_areas/${encodeURIComponent(id)}`,
    authInfo,
    abortSignal,
  });
};
