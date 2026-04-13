import { AuthInfo } from 'spatial-id-svc-base';

/**
 * ログインを行い、成功時 AuthInfo オブジェクトを返す。
 * 認証失敗時は ApiAuthError 例外を発生させる。
 */
export declare const login: ({ baseUrl, userID, organizationID, password, abortSignal, }: LoginRequestParams) => Promise<AuthInfo>;
export declare enum RequestTypes {
	OBJECT_TYPE_UNSPECIFIED = "OBJECT_TYPE_UNSPECIFIED",
	TERRAIN = "TERRAIN",
	BUILDING = "BUILDING",
	RESTRICTED_AREA = "RESTRICTED_AREA",
	EMERGENCY_AREA = "EMERGENCY_AREA",
	RESERVE_AREA = "RESERVE_AREA",
	CHANNEL = "CHANNEL",
	OVERLAY_AREA = "OVERLAY_AREA",
	WEATHER = "WEATHER",
	WEATHER_FORECAST = "WEATHER_FORECAST",
	MICROWAVE = "MICROWAVE",
	GROUND_RISK = "GROUND_RISK",
	AIR_RISK = "AIR_RISK",
	AIR_SPACE = "AIR_SPACE",
	RISK_LEVEL = "RISK_LEVEL"
}
export declare enum RestrictionTypes {
	TYPE_FREE = "\u5236\u9650\u306A\u3057",
	TYPE_P = "\u30D5\u30E9\u30A4\u30C8\u306A\u3057",
	TYPE_R = "\u98DB\u884C\u5236\u9650",
	TYPE_K = "\u8A13\u7DF4",
	TYPE_N = "\u4E00\u6642\u7684\u306A\u5236\u9650"
}
export interface LoginRequestParams {
	baseUrl: string;
	userID: string;
	organizationID?: string;
	password: string;
	abortSignal?: AbortSignal;
}
export interface Point {
	latitude: number;
	longitude: number;
	altitude: number;
	altitudeAttribute: AltitudeAttribute;
}
export interface SpatialIdentification {
	ID: string;
}
export type AltitudeAttribute = "ALTITUDE_ATTRIBUTE_ELIPSOIDE" | "ALTITUDE_ATTRIBUTE_MSL" | "ALTITUDE_ATTRIBUTE_AGL";

