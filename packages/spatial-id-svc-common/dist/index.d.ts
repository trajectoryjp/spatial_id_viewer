import { AuthInfo } from 'spatial-id-svc-base';

/**
 * ログインを行い、成功時 AuthInfo オブジェクトを返す。
 * 認証失敗時は ApiAuthError 例外を発生させる。
 */
export declare const login: ({ baseUrl, userId, password, abortSignal, }: LoginRequestParams) => Promise<AuthInfo>;
export interface LoginRequestParams {
	baseUrl: string;
	userId: string;
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

