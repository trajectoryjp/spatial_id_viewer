import {
  ApiResponseError,
  AuthInfo,
  CommonResponseHeader,
  fetchJson,
  fetchJsonStream,
  StreamStatus,
} from 'spatial-id-svc-base';
import { SpatialIdentification } from 'spatial-id-svc-common';

import {
  error,
  ErrorResponse,
  GetAreaRequest,
  SpatialDefinition,
  SpatialDefinitions,
  success,
} from './client-blocked-areas';

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
  responseHeader?: CommonResponseHeader;
  objects: SpatialDefinition[];
  // reservedAreas: ReservedArea[];
  // status: StreamStatus;
}
export interface GetEmergencyAreas {
  objects: SpatialDefinition[];
}

export interface GetReservedAreaResponse extends SpatialDefinition {
  responseHeader?: CommonResponseHeader;
  // reservedArea: ReservedArea;
  // result: SpatialDefinition;
  // error: ErrorResponse;
}

export interface CreateReservedAreaRequest {
  reservedArea: ReservedArea;
}

export interface CreateEmergencyAreaRequest {
  overwrite: boolean;
  object: SpatialDefinition;
}

export interface CreateReservedAreaResponse {
  responseHeader: CommonResponseHeader;
  areaId: string;
}

export interface GetReservedAreasParams {
  baseUrl: string;
  authInfo: AuthInfo;
  // payload: GetReservedAreasRequest;
  payload: GetAreaRequest;
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
    path: '/uas/api/airmobility/v3/get-value',
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

export const getReservedArea = async function* ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetReservedAreaParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetReservedAreaResponse>({
    method: 'POST',
    baseUrl,
    path: `/uas/api/airmobility/v3/get-object`,
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

export interface CreateReservedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  // payload: CreateReservedAreaRequest;
  payload: CreateEmergencyAreaRequest;
  abortSignal?: AbortSignal;
}

/** 予約エリアを生成する */
export const createReservedArea = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateReservedAreaParams) => {
  const resp = await fetchJson<success | error>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/put-object',
    authInfo,
    payload,
    abortSignal,
  });
  if ('code' in resp) {
    throw new ApiResponseError('failed to create: error occured with code ' + resp.code);
  }
  return resp;
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
    method: 'POST',
    baseUrl,
    path: `/uas/api/airmobility/v3/delete-object`,
    authInfo,
    payload: { objectId: id },
    abortSignal,
  });
};
