import { AuthInfo, CommonResponseHeader, StreamStatus } from 'spatial-id-svc-base';
import { SpatialIdentification } from 'spatial-id-svc-common';

/** 割込禁止エリアを生成する */
export declare const createBlockedArea: ({ baseUrl, authInfo, payload, abortSignal, }: CreateBlockedAreaParams) => Promise<CreateBlockedAreaResponse>;
/** 予約エリアを生成する */
export declare const createReservedArea: ({ baseUrl, authInfo, payload, abortSignal, }: CreateReservedAreaParams) => Promise<CreateReservedAreaResponse>;
/** 割込禁止エリアを削除する */
export declare const deleteBlockedArea: ({ baseUrl, authInfo, id, abortSignal, }: DeleteBlockedAreaParams) => Promise<void>;
/** ID を指定して予約エリアを削除する */
export declare const deleteReservedArea: ({ baseUrl, authInfo, id, abortSignal, }: DeleteReservedAreaParams) => Promise<void>;
/** ID を指定して割込禁止エリアを 1 件取得する */
export declare const getBlockedArea: ({ baseUrl, authInfo, id, abortSignal, }: GetBlockedAreaParams) => Promise<GetBlockedAreaResponse>;
/** 空間 ID の範囲内の割込禁止エリアを複数取得する */
export declare const getBlockedAreas: ({ baseUrl, authInfo, payload, abortSignal, }: GetBlockedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBlockedAreasResponse>, void, unknown>;
/** ID を指定して予約エリアを 1 件取得する */
export declare const getReservedArea: ({ baseUrl, authInfo, id, abortSignal, }: GetReservedAreaParams) => Promise<GetReservedAreaResponse>;
/** 空間 ID の範囲内の予約エリアを複数取得する */
export declare const getReservedAreas: ({ baseUrl, authInfo, payload, abortSignal, }: GetReservedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetReservedAreasResponse>, void, unknown>;
/** 空間 ID の範囲内の割込禁止エリアの追加・削除を監視する */
export declare const watchBlockedAreas: ({ baseUrl, authInfo, payload, abortSignal, }: WatchBlockedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<WatchBlockedAreasResponse>, void, unknown>;
export interface BlockedArea {
	id: string;
	spatialIdentifications: SpatialIdentification[];
	startTime: string;
	endTime: string;
}
export interface CreateBlockedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: CreateBlockedAreaRequest;
	abortSignal?: AbortSignal;
}
export interface CreateBlockedAreaRequest {
	blockedArea: BlockedArea;
}
export interface CreateBlockedAreaResponse {
	responseHeader: CommonResponseHeader;
	areaId: string;
}
export interface CreateReservedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: CreateReservedAreaRequest;
	abortSignal?: AbortSignal;
}
export interface CreateReservedAreaRequest {
	reservedArea: ReservedArea;
}
export interface CreateReservedAreaResponse {
	responseHeader: CommonResponseHeader;
	areaId: string;
}
export interface DeleteBlockedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface DeleteReservedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetBlockedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetBlockedAreaResponse {
	responseHeader: CommonResponseHeader;
	blockedArea: BlockedArea;
}
export interface GetBlockedAreasParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetBlockedAreasRequest;
	abortSignal?: AbortSignal;
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
export interface GetReservedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetReservedAreaResponse {
	responseHeader: CommonResponseHeader;
	reservedArea: ReservedArea;
}
export interface GetReservedAreasParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetReservedAreasRequest;
	abortSignal?: AbortSignal;
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
export interface ReservedArea {
	id: string;
	spatialIdentifications: SpatialIdentification[];
	startTime: string;
	endTime: string;
}
export interface WatchBlockedAreasParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: WatchBlockedAreasRequest;
	abortSignal?: AbortSignal;
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

