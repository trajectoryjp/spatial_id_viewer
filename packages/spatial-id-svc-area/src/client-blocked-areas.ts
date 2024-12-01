import {
  ApiResponseError,
  AuthInfo,
  CommonResponseHeader,
  fetchJson,
  fetchJsonStream,
  StreamStatus,
} from 'spatial-id-svc-base';
import { SpatialIdentification } from 'spatial-id-svc-common';

export interface BlockedAreaRquest {
  overwrite: boolean;
  object: SpatialDefinition;
}

export interface AreaVoxel {
  id: {
    ID: string;
  };
}
export interface EmergencyAreaVoxels {
  id: {
    ID: string;
  };
  vacant: boolean;
}
export interface CurrentWeather {
  startTime: Date | string | null;
  endTime: Date | string | null;
  windDirection: number;
  windSpeed: number;
  cloudRate: number;
  temperature: number;
  dewPoint: number;
  pressure: number;
  precipitation: number;
  visibility: number;
  gggg: string;
}

export interface WeatherForecast {
  startTime: Date | string | null;
  endTime: Date | string | null;
  windDirection: number;
  windSpeed: number;
  cloudRate: number;
  precipitation: number;
}

export interface currentWeatherVoxel {
  id: {
    ID: string;
  };
  currentWeather: CurrentWeather;
}

export interface weatherForecastVoxel {
  id: {
    ID: string;
  };
  forecast: WeatherForecast;
}

export interface riskVoxel {
  id: {
    ID: string;
  };
  value: number;
}

export interface restrictedAreaDefinition {
  reference: string;
  type: string;
  voxelValues: AreaVoxel[];
}

export interface CurrentWeatherDefinition {
  reference: string;
  voxelValues: currentWeatherVoxel[];
}
export interface WeatherForecastDefinition {
  reference: string;
  voxelValues: weatherForecastVoxel[];
}

export interface GroundRiskDeifinition {
  reference: string;
  voxelValues: riskVoxel[];
}

export interface AirRiskDefinition {
  reference: string;
  voxelValues: riskVoxel[];
}

export interface emergencyAreaDefinition {
  reference: string;
  voxelValues: EmergencyAreaVoxels[];
}

export interface overlayAreaDefinition {
  ownerAddress: {
    grpc: string;
    rest: string;
    other: string;
  };
  voxelValues: AreaVoxel[];
}

export interface MicrowaveDefinition {
  mobile?: MobileDefinition;
  wifi?: WifiDefinition;
}

export interface MobileDefinition {
  reference: string;
  plmnId: {
    mobileCountryCode: string;
    mobileNetworkCode: string;
  };
  voxelValues: SignalVoxel[];
}

export interface WifiDefinition {
  reference: string;
  ssid: string;
  voxelValues: SignalVoxel[];
}

export interface SignalVoxel {
  id: {
    ID: string;
  };
  RSI: number;
}

export interface SpatialDefinition {
  objectId?: string;
  terrain?: any;
  building?: any;
  restrictedArea?: restrictedAreaDefinition;
  emergencyArea?: emergencyAreaDefinition;
  reserveArea?: any;
  channel?: any;
  overlayArea?: overlayAreaDefinition;
  weather?: CurrentWeatherDefinition;
  weatherForecast?: WeatherForecastDefinition;
  microwave?: MicrowaveDefinition;
  groundRisk?: any;
  ariRisk?: any;
}

export interface SpatialDefinitions {
  objects: SpatialDefinition[];
}

export interface success extends successResponse {
  responseHeader?: CommonResponseHeader;
}
export interface successResponse {
  objectId: string;
  error: string;
}

export interface error extends ErrorResponse {
  responseHeader?: CommonResponseHeader;
}

export interface ErrorDetails {
  '@type': string;
  property1: any;
  property2: any;
}

export interface ErrorResponse {
  code: number;
  message: string;
  details: ErrorDetails[];
}
export interface BlockedArea {
  id: string;
  spatialIdentifications: SpatialIdentification[];
  startTime: string;
  endTime: string;
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

export interface RiskLevel {
  id: {
    ID: string;
  };
  min: number;
  max: number;
  avarage: number;
  sourceList: {
    objectId: string;
    riskLevel: number;
  }[];
}

export interface GetAreaRequest {
  figure: SpatialFigure;
  requestType: string[];
}

export interface GetRiskLevelPayload {
  figure: SpatialFigure;
  zoomLevel: number;
}

export interface GetBlockedAreasRequest {
  boundary: SpatialIdentification[];
  hasSpatialId: boolean;
  startTime: string;
  endTime: string;
}

export interface GetBlockedAreasResponse extends SpatialDefinitions {
  responseHeader?: CommonResponseHeader;
  // blockedAreas: BlockedArea[];
  // status: StreamStatus;
}

export interface GetRiskLevelsResponse {
  responseHeader?: CommonResponseHeader;
  riskLevels: RiskLevel[];
}

export interface GetBlockedAreas {
  objects: SpatialDefinition[];
}

export interface GetBlockedAreaResponse extends SpatialDefinition {
  responseHeader?: CommonResponseHeader;
  // blockedArea: BlockedArea;
  result: SpatialDefinition;
  error: ErrorResponse;
}

export interface GetWeatherRequest {
  figure: SpatialFigure;
  requestType: string[];
}
export interface GetSignalRequest {
  figure: SpatialFigure;
  requestType: string[];
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
  // payload: GetBlockedAreasRequest;
  payload: GetAreaRequest;
  abortSignal?: AbortSignal;
}

export interface GetRiskLevelParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetRiskLevelPayload;
  abortSignal?: AbortSignal;
}

/** 空間 ID の範囲内の割込禁止エリアを複数取得する */
export const getBlockedAreas = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetBlockedAreasParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBlockedAreasResponse>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-value',
    authInfo,
    payload,
    abortSignal,
  })) {
    if (chunk?.result?.objects?.[0]?.objectId !== '0') {
      objectId = chunk?.result?.objects[0]?.objectId;
      continue;
    }
    chunk.result.objects[0].objectId = objectId;
    yield chunk;
  }
};

export const getWeatherAreas = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetBlockedAreasParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBlockedAreasResponse>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-value',
    authInfo,
    payload,
    abortSignal,
  })) {
    if (chunk?.result?.objects?.[0]?.objectId !== '0') {
      objectId = chunk?.result?.objects[0]?.objectId;
      continue;
    }
    chunk.result.objects[0].objectId = objectId;
    yield chunk;
  }
};

export const getSignalAreas = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetBlockedAreasParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBlockedAreasResponse>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-value',
    authInfo,
    payload,
    abortSignal,
  })) {
    if (chunk?.result?.objects?.[0]?.objectId !== '0') {
      objectId = chunk?.result?.objects[0]?.objectId;
      continue;
    }
    chunk.result.objects[0].objectId = objectId;
    yield chunk;
  }
};

export const getRiskLevels = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetRiskLevelParams) {
  for await (const chunk of fetchJsonStream<GetRiskLevelsResponse>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-risk-levels',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

// export const getWeather = async ({ baseUrl, authInfo, id, abortSignal }: GetBlockedAreaParams) => {
//   return await fetchJson<GetBlockedAreaResponse>({
//     method: 'POST',
//     baseUrl,
//     path: '/uas/api/airmobility/v3/get-object',
//     authInfo,
//     payload: { objectId: id },
//     abortSignal,
//   });
// };
export const getWeather = async function* ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetBlockedAreaParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBlockedAreaResponse>({
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

export const getSignalArea = async function* ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetBlockedAreaParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBlockedAreaResponse>({
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

export const getRisk = async ({ baseUrl, authInfo, id, abortSignal }: GetBlockedAreaParams) => {
  return await fetchJson<GetBlockedAreaResponse>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-object',
    authInfo,
    payload: { objectId: id },
    abortSignal,
  });
};

export const getRisks = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetBlockedAreasParams) {
  for await (const chunk of fetchJsonStream<GetBlockedAreasResponse>({
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

export interface GetBlockedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}

export const getBlockedArea = async function* ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetBlockedAreaParams) {
  let objectId = '0';
  for await (const chunk of fetchJsonStream<GetBlockedAreaResponse>({
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

export interface CreateBlockedAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  // payload: CreateBlockedAreaRequest;
  payload: BlockedAreaRquest;
  abortSignal?: AbortSignal;
}

export interface CreateWeatherParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: BlockedAreaRquest;
  abortSignal?: AbortSignal;
}

export interface CreateSignalsParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: BlockedAreaRquest;
  abortSignal?: AbortSignal;
}

/** 割込禁止エリアを生成する */
export const createBlockedArea = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateBlockedAreaParams) => {
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

export const createWeather = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateWeatherParams) => {
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

export const createSignals = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateSignalsParams) => {
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
    method: 'POST',
    baseUrl,
    path: `/uas/api/airmobility/v3/delete-object`,
    authInfo,
    payload: { objectId: id },
    abortSignal,
  });
};

export const deleteWeather = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: DeleteBlockedAreaParams) => {
  await fetchJson({
    method: 'POST',
    baseUrl,
    path: `/uas/api/airmobility/v3/delete-object`,
    authInfo,
    payload: { objectId: id },
    abortSignal,
  });
};

export const deleteSignal = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: DeleteBlockedAreaParams) => {
  await fetchJson({
    method: 'POST',
    baseUrl,
    path: `/uas/api/airmobility/v3/delete-object`,
    authInfo,
    payload: { objectId: id },
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
