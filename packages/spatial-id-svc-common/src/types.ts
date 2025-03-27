export interface SpatialIdentification {
  ID: string;
}

export interface Point {
  latitude: number;
  longitude: number;
  altitude: number;
  altitudeAttribute: AltitudeAttribute;
}

export type AltitudeAttribute =
  | 'ALTITUDE_ATTRIBUTE_ELIPSOIDE'
  | 'ALTITUDE_ATTRIBUTE_MSL'
  | 'ALTITUDE_ATTRIBUTE_AGL';

export enum RequestTypes {
  OBJECT_TYPE_UNSPECIFIED = 'OBJECT_TYPE_UNSPECIFIED',
  TERRAIN = 'TERRAIN',
  BUILDING = 'BUILDING',
  RESTRICTED_AREA = 'RESTRICTED_AREA',
  EMERGENCY_AREA = 'EMERGENCY_AREA',
  RESERVE_AREA = 'RESERVE_AREA',
  CHANNEL = 'CHANNEL',
  OVERLAY_AREA = 'OVERLAY_AREA',
  WEATHER = 'WEATHER',
  WEATHER_FORECAST = 'WEATHER_FORECAST',
  MICROWAVE = 'MICROWAVE',
  GROUND_RISK = 'GROUND_RISK',
  AIR_RISK = 'AIR_RISK',
  AIR_SPACE = 'AIR_SPACE',
  RISK_LEVEL = 'RISK_LEVEL',
}

export enum RestrictionTypes {
  TYPE_FREE = '制限なし',
  TYPE_P = 'フライトなし',
  TYPE_R = '飛行制限',
  TYPE_K = '訓練',
  TYPE_N = '一時的な制限',
}
