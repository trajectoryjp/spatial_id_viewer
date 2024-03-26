import {
  ApiResponseError,
  AuthInfo,
  CommonResponseHeader,
  fetchJson,
  fetchJsonStream,
  fetchRawJson,
  StreamStatus,
} from 'spatial-id-svc-base';
import { SpatialIdentification } from 'spatial-id-svc-common';

export interface BarrierDefinition {
  spatialIdentification: SpatialIdentification;
  risk: number;
}

export interface Barrier {
  id: string;
  barrierDefinitions: BarrierDefinition[];
  status: StreamStatus;
}

export interface PrivateBarrier {
  id: string;
  barrierDefinitions: BarrierDefinition[];
  clearance: number;
  status: StreamStatus;
}

export interface GetBarriersRequest {
  boundary: SpatialIdentification;
  onlyOwnedBarriers: boolean;
  hasSpatialId: boolean;
}

export interface GetBarriersResponse {
  id: string;
  responseHeader: CommonResponseHeader;
  barrierDefinitions: BarrierDefinition[];
  status: StreamStatus;
}

export interface GetBarrierResponse {
  id: string;
  responseHeader: CommonResponseHeader;
  barrierDefinitions: BarrierDefinition[];
  status: StreamStatus;
}

export interface IdResponse {
  id: string;
}

export interface GetPrivateBarriersRequest {
  boundary: SpatialIdentification;
  hasSpatialId: boolean;
}

export interface GetPrivateBarriersResponse {
  id: string;
  responseHeader: CommonResponseHeader;
  barrierDefinitions: BarrierDefinition[];
  status: StreamStatus;
}

export interface GetPrivateBarrierResponse {
  id: string;
  responseHeader: CommonResponseHeader;
  barrierDefinitions: BarrierDefinition[];
  status: StreamStatus;
}

export interface GetBarriersParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetBarriersRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内のパブリックバリアを複数取得する */
export const getBarriers = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetBarriersParams) {
  for await (const chunk of fetchJsonStream<GetBarrierResponse>({
    method: 'POST',
    baseUrl,
    path: '/route_service/barriers_list',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface GetBarrierParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定してパブリックバリアを 1 件取得する */
export const getBarrier = async function* ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetBarrierParams) {
  for await (const chunk of fetchJsonStream<GetBarrierResponse>({
    method: 'GET',
    baseUrl,
    path: `/route_service/barriers/${encodeURIComponent(id)}`,
    authInfo,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface CreateBarrierParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: Barrier;
  abortSignal?: AbortSignal;
}

/** パブリックバリアを生成する */
export const createBarrier = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateBarrierParams) => {
  const resp = await fetchRawJson<IdResponse>({
    method: 'POST',
    baseUrl,
    path: '/route_service/barriers',
    authInfo,
    payload,
    abortSignal,
  });
  if (resp.id === '0') {
    throw new ApiResponseError('failed to create: returned id is 0');
  }
  return resp;
};

export interface DeleteBarrierParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定してパブリックバリアを削除する */
export const deleteBarrier = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: DeleteBarrierParams) => {
  await fetchJson({
    method: 'DELETE',
    baseUrl,
    path: `/route_service/barriers/${encodeURIComponent(id)}`,
    authInfo,
    abortSignal,
  });
};

export interface GetPrivateBarriersParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetPrivateBarriersRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内のプライベートバリアを取得する */
export const getPrivateBarriers = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetPrivateBarriersParams) {
  for await (const chunk of fetchJsonStream<GetPrivateBarriersResponse>({
    method: 'POST',
    baseUrl,
    path: '/route_service/private_barriers_list',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface GetPrivateBarrierParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定してプライベートバリアを 1 件取得する */
export const getPrivateBarrier = async function* ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetPrivateBarrierParams) {
  for await (const chunk of fetchJsonStream<GetPrivateBarrierResponse>({
    method: 'GET',
    baseUrl,
    path: `/route_service/private_barriers/${encodeURIComponent(id)}`,
    authInfo,
    abortSignal,
  })) {
    yield chunk;
  }
};

export interface CreatePrivateBarrierParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: PrivateBarrier;
  abortSignal?: AbortSignal;
}

/** プライベートバリアを生成する */
export const createPrivateBarrier = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreatePrivateBarrierParams) => {
  const resp = await fetchRawJson<IdResponse>({
    method: 'POST',
    baseUrl,
    path: '/route_service/private_barriers',
    authInfo,
    payload,
    abortSignal,
  });
  if (resp.id === '0') {
    throw new ApiResponseError('failed to create: returned id is 0');
  }
  return resp;
};

export interface DeletePrivateBarrierParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

/** ID を指定してプライベートバリアを削除する */
export const deletePrivateBarrier = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: DeletePrivateBarrierParams) => {
  await fetchJson({
    method: 'DELETE',
    baseUrl,
    path: `/route_service/temporary_barriers/${encodeURIComponent(id)}`,
    authInfo,
    abortSignal,
  });
};
