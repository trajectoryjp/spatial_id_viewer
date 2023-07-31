import { fetchRawJson } from 'spatial-id-svc-base';

export interface BarrierMap {
  body: { [modelId: string]: Barrier };
}

export interface Barrier {
  startTime: string;
  endTime: string;
  groupId: string;
}

export interface Box {
  min: Key;
  max: Key;
}

export interface OptionalKey {
  hasValue: boolean;
  key: Key;
}

export interface Keys {
  keys: Key[];
}

export interface TileXyzs {
  tileXyzs: TileXyz[];
}

export interface Key {
  quadKey: string;
  altitudeKey: number;
}

export interface Geodetic {
  tag: string;
  longitude: number;
  latitude: number;
  altitude: number;
}

export interface TileXyz {
  quadKeyZoomLevel: number;
  altitudeKeyZoomLevel: number;
  x: string;
  y: string;
  z: string;
}

export interface Configuration {
  port: string;
  maxRecvMsgSize: string;
  logLevel: Configuration_LogLevel;
  logIsStandardOut: boolean;
  logIsCyclic: boolean;
  webhookUrl: string;
  name: string;
  dataBaseTargetCellZoomLevel: string;
  topAltitude: number;
  bottomAltitude: number;
  zoomLevels: Configuration_ZoomLevel[];
  neighborZoomLevelMin: string;
  neighborZoomLevelMax: string;
  zCostCoefficient: number;
  zoomLevelCostBase: number;
  postgreSql: Configuration_PostgreSql[];
}

export interface Configuration_ZoomLevel {
  quadKeyZoomLevel: number;
  altitudeKeyZoomLevel: number;
}

export type Configuration_LogLevel =
  | 'LOG_LEVEL_TRACE'
  | 'LOG_LEVEL_DEBUG'
  | 'LOG_LEVEL_INFO'
  | 'LOG_LEVEL_WARN'
  | 'LOG_LEVEL_ERROR'
  | 'LOG_LEVEL_FATAL';

export interface Configuration_PostgreSql {
  host: string;
  port: string;
  user: string;
  dataBaseName: string;
  password: string;
}

export interface ListBarrierMapsRequest {
  pageSoftSize: number;
  view: ListBarrierMapsRequest_View;
  box: Box;
  startKey: Key;
  relatedFilter: ListBarrierMapsRequest_RelatedFilter;
}

export type ListBarrierMapsRequest_View = 'VIEW_UNSPECIFIED' | 'VIEW_KEY' | 'VIEW_FULL';

export interface ListBarrierMapsRequest_RelatedFilter {
  isActive: boolean;
  organizationId: string;
  groupId: string;
}

export interface ListBarrierMapsResponse {
  data: ListBarrierMapsResponse_Datum[];
  nextStartKey: OptionalKey;
}

export interface ListBarrierMapsResponse_Datum {
  organizationId: string;
  isTempoary: boolean;
  key: Key;
  barrierMap: BarrierMap;
}

export interface ConvertGeodeticToKeyRequest {
  geodetic: Geodetic;
  zoomLevel: number;
}

export interface GetConfigurationParams {
  baseUrl: string;
  abortSignal?: AbortSignal;
}

/** 環境設定を取得します */
export const getConfiguration = async ({ baseUrl, abortSignal }: GetConfigurationParams) => {
  return await fetchRawJson<Configuration>({
    method: 'GET',
    baseUrl,
    path: '/search_path/configuration',
    abortSignal,
  });
};

export interface ListBarrierMapsParams {
  baseUrl: string;
  payload: ListBarrierMapsRequest;
  abortSignal?: AbortSignal;
}

/** 障害物マップを一覧します */
export const listBarrierMaps = async ({ baseUrl, payload, abortSignal }: ListBarrierMapsParams) => {
  return await fetchRawJson<ListBarrierMapsResponse>({
    method: 'POST',
    baseUrl,
    path: '/search_path/barrier_maps',
    payload,
    abortSignal,
  });
};

export interface ConvertGeodeticToKeyParams {
  baseUrl: string;
  payload: ConvertGeodeticToKeyRequest;
  abortSignal?: AbortSignal;
}

/** 測地座標をキーに変換します。境界の場合は最小のKeyが返ります */
export const convertGeodeticToKey = async ({
  baseUrl,
  payload,
  abortSignal,
}: ConvertGeodeticToKeyParams) => {
  return await fetchRawJson<Key>({
    method: 'POST',
    baseUrl,
    path: '/search_path/geodetic_to_key',
    payload,
    abortSignal,
  });
};

export interface ConvertTileXyzsToKeysParams {
  baseUrl: string;
  payload: TileXyzs;
  abortSignal?: AbortSignal;
}

/** タイルXYZ群をキー群に変換します */
export const convertTileXyzsToKeys = async ({
  baseUrl,
  payload,
  abortSignal,
}: ConvertTileXyzsToKeysParams) => {
  return await fetchRawJson<Keys>({
    method: 'POST',
    baseUrl,
    path: '/search_path/tile_to_key',
    payload,
    abortSignal,
  });
};

export interface ConvertKeysToTileXyzsParams {
  baseUrl: string;
  payload: Keys;
  abortSignal?: AbortSignal;
}

/** キー群をタイルXYZ群に変換します */
export const convertKeysToTileXyzs = async ({
  baseUrl,
  payload,
  abortSignal,
}: ConvertKeysToTileXyzsParams) => {
  return await fetchRawJson<TileXyzs>({
    method: 'POST',
    baseUrl,
    path: '/search_path/key_to_tile',
    payload,
    abortSignal,
  });
};
