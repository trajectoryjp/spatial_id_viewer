import {
  AuthInfo,
  CommonResponseHeader,
  fetchJson,
  fetchJsonStream,
  StreamStatus,
} from 'spatial-id-svc-base';
import { SpatialIdentification } from 'spatial-id-svc-common';

export interface BlockedArea {
  id: string;
  spatialIdentifications: SpatialIdentification[];
  startTime: string;
  endTime: string;
}

export interface GetBlockedAreasRequest {
  boundary: SpatialIdentification[];
  hasSpatialId: boolean;
  startTime: string;
  endTime: string;
}

export interface GetBlockedAreasResponse {
  responseHeader: CommonResponseHeader;
  blockedAreas: BlockedArea[];
  status: StreamStatus;
}

export interface GetBlockedAreaResponse {
  responseHeader: CommonResponseHeader;
  blockedArea: BlockedArea;
}

export interface CreateBlockedAreaRequest {
  blockedArea: BlockedArea;
}

export interface CreateBlockedAreaResponse {
  responseHeader: CommonResponseHeader;
  areaId: string;
}

export interface WatchBlockedAreasRequest {
  boundary: SpatialIdentification[];
  hasSpatialId: boolean;
}

export interface WatchBlockedAreasResponse {
  responseHeader: CommonResponseHeader;
  created?: BlockedArea;
  deleted?: BlockedArea;
}

export interface GetBlockedAreasParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetBlockedAreasRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内の割込禁止エリアを複数取得する */
export const getBlockedAreas = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetBlockedAreasParams) {
  for await (const chunk of fetchJsonStream<GetBlockedAreasResponse>({
    method: 'POST',
    baseUrl,
    path: '/area_service/blocked_areas_list',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface GetBlockedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定して割込禁止エリアを 1 件取得する */
export const getBlockedArea = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetBlockedAreaParams) => {
  return await fetchJson<GetBlockedAreaResponse>({
    method: 'GET',
    baseUrl,
    path: `/area_service/blocked_areas/${encodeURIComponent(id)}`,
    authInfo,
    abortSignal,
  });
};

export interface CreateBlockedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: CreateBlockedAreaRequest;
  abortSignal?: AbortSignal;
}

/** 割込禁止エリアを生成する */
export const createBlockedArea = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateBlockedAreaParams) => {
  return await fetchJson<CreateBlockedAreaResponse>({
    method: 'POST',
    baseUrl,
    path: '/area_service/blocked_areas',
    authInfo,
    payload,
    abortSignal,
  });
};

export interface DeleteBlockedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

/** 割込禁止エリアを削除する */
export const deleteBlockedArea = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: DeleteBlockedAreaParams) => {
  await fetchJson({
    method: 'DELETE',
    baseUrl,
    path: `/area_service/blocked_areas/${encodeURIComponent(id)}`,
    authInfo,
    abortSignal,
  });
};

export interface WatchBlockedAreasParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: WatchBlockedAreasRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内の割込禁止エリアの追加・削除を監視する */
export const watchBlockedAreas = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: WatchBlockedAreasParams) {
  for await (const chunk of fetchJsonStream<WatchBlockedAreasResponse>({
    method: 'POST',
    baseUrl,
    path: '/area_service/blocked_areas_events',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};
