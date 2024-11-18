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

export interface BarrierDefinitionVoxel {
  id: {
    ID: string;
  };
  vacant?: boolean;
}

export interface terrainBuildingDefinition {
  reference: string;
  voxelValues: BarrierDefinitionVoxel[];
}

export interface restrictedAreaDefinition {
  reference: string;
  type: string;
  voxelValues: BarrierDefinitionVoxel[];
}

export interface emergencyAreaDefinition {
  reference: string;
  voxelValues: EmergencyAreaVoxels[];
}

export interface EmergencyAreaVoxels {
  id: {
    ID: string;
  };
  vacant: boolean;
}

export interface reservationTime {
  period: {
    startTime: string;
    endTime: string;
  };
  occupation: string;
  reserveId: string;
}

export interface reservedAreaDefinition {
  ownerId: string;
  reservationTime: reservationTime;
  voxelValues: reserveAreaVoxels[];
}

export interface reserveAreaVoxels {
  id: {
    ID: string;
  };
  reservationTime: reservationTime;
}

export interface SpatialDefinition {
  objectId?: string;
  terrain?: terrainBuildingDefinition;
  building?: terrainBuildingDefinition;
  restrictedArea?: restrictedAreaDefinition;
  emergencyArea?: emergencyAreaDefinition;
  reserveArea?: reservedAreaDefinition;
  channel?: any;
  overlayArea?: any;
  weather?: any;
  weatherForecast?: any;
  microwave?: any;
  groundRisk?: any;
  ariRisk?: any;
}

export interface SpatialDefinitions {
  objects: SpatialDefinition[];
}

export interface BarrierNew {
  overwrite: boolean;
  object: SpatialDefinition;
}

export interface BarrierSpatial {
  result: SpatialDefinition;
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

export interface GetTerrainBarriersRequest {
  figure: SpatialFigure;
  requestType: string[];
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
export interface GetBarrierResponseNew extends SpatialDefinition {
  responseHeader?: CommonResponseHeader;
}

export interface GetBarriersResponseNew extends SpatialDefinitions {
  responseHeader?: CommonResponseHeader;
}
export interface IdResponse {
  id: string;
}

interface successResponse {
  objectId: string;
  error: string;
}

interface ErrorDetails {
  '@type': string;
  property1: any;
  property2: any;
}

interface ErrorResponse {
  code: number;
  message: string;
  details: ErrorDetails[];
}

export interface GetPrivateBarriersRequest {
  boundary: SpatialIdentification;
  hasSpatialId: boolean;
}

export interface SpatialFigure {
  identification: {
    ID: string;
  };
}
// export interface SpatialFigure {
//   identification: {
//     ID: string;
//   };
//   tube: {
//     start: {
//       latitude: number;
//       longitude: number;
//       altitude: number;
//       altitudeAttribute: string;
//     };
//     end: {
//       latitude: number;
//       longitude: number;
//       altitude: number;
//       altitudeAttribute: string;
//     };
//     radian: number;
//   };
//   polygon: any;
// }

export interface GetBuildingBarriersRequest {
  figure: SpatialFigure;
  requestType: string[];
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
  payload: GetTerrainBarriersRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内のパブリックバリアを複数取得する */
export const getBarriers = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetBarriersParams) {
  // for await (const chunk of fetchJsonStream<GetBarrierResponse>({
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBarriersResponseNew>({
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
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBarrierResponseNew>({
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

export interface CreateBarrierParams {
  baseUrl: string;
  authInfo: AuthInfo;
  // payload: Barrier;
  payload: BarrierNew;
  abortSignal?: AbortSignal;
}

/** パブリックバリアを生成する */
export const createBarrier = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateBarrierParams) => {
  const resp = await fetchRawJson<successResponse | ErrorResponse>({
    method: 'POST',
    baseUrl,
    // path: '/route_service/barriers',
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
    method: 'POST',
    baseUrl,
    path: `/uas/api/airmobility/v3/delete-object`,
    authInfo,
    payload: { objectId: id },
    abortSignal,
  });
};

export interface GetPrivateBarriersParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetBuildingBarriersRequest;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内のプライベートバリアを取得する */
export const getPrivateBarriers = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetPrivateBarriersParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBarriersResponseNew>({
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
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBarrierResponseNew>({
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

export interface CreatePrivateBarrierParams {
  baseUrl: string;
  authInfo: AuthInfo;
  // payload: PrivateBarrier;
  payload: BarrierNew;
  abortSignal?: AbortSignal;
}

/** プライベートバリアを生成する */
export const createBuildingBarrier = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreatePrivateBarrierParams) => {
  const resp = await fetchRawJson<successResponse | ErrorResponse>({
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
