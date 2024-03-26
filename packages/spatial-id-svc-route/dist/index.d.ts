import { AuthInfo, CommonResponseHeader, StreamStatus } from 'spatial-id-svc-base';
import { Point, SpatialIdentification } from 'spatial-id-svc-common';

/** パブリックバリアを生成する */
export declare const createBarrier: ({ baseUrl, authInfo, payload, abortSignal, }: CreateBarrierParams) => Promise<IdResponse>;
/** プライベートバリアを生成する */
export declare const createPrivateBarrier: ({ baseUrl, authInfo, payload, abortSignal, }: CreatePrivateBarrierParams) => Promise<IdResponse>;
/** 予約ルートを生成する */
export declare const createReservedRoute: ({ baseUrl, authInfo, payload, abortSignal, }: CreateReservedRouteParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<CreateReservedRouteResponse>, void, unknown>;
/** ルートを設計する */
export declare const createRoute: ({ baseUrl, authInfo, payload, abortSignal, }: CreateRouteParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<CreateRouteResponse>, void, unknown>;
/** ID を指定してパブリックバリアを削除する */
export declare const deleteBarrier: ({ baseUrl, authInfo, id, abortSignal, }: DeleteBarrierParams) => Promise<void>;
/** ID を指定してプライベートバリアを削除する */
export declare const deletePrivateBarrier: ({ baseUrl, authInfo, id, abortSignal, }: DeletePrivateBarrierParams) => Promise<void>;
/** ID を指定して予約ルートを削除する */
export declare const deleteReservedRoute: ({ baseUrl, authInfo, reservedRouteId, abortSignal, }: DeleteReservedRouteParams) => Promise<void>;
/** 空間 ID の範囲内の機体の ID を複数取得する */
export declare const getAircrafts: ({ baseUrl, authInfo, payload, abortSignal, }: GetAircraftsParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetAircraftsResponse>, void, unknown>;
/** ID を指定してパブリックバリアを 1 件取得する */
export declare const getBarrier: ({ baseUrl, authInfo, id, abortSignal, }: GetBarrierParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBarrierResponse>, void, unknown>;
/** 空間 ID の範囲内のパブリックバリアを複数取得する */
export declare const getBarriers: ({ baseUrl, authInfo, payload, abortSignal, }: GetBarriersParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBarrierResponse>, void, unknown>;
/** ID を指定してプライベートバリアを 1 件取得する */
export declare const getPrivateBarrier: ({ baseUrl, authInfo, id, abortSignal, }: GetPrivateBarrierParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetPrivateBarrierResponse>, void, unknown>;
/** 空間 ID の範囲内のプライベートバリアを取得する */
export declare const getPrivateBarriers: ({ baseUrl, authInfo, payload, abortSignal, }: GetPrivateBarriersParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetPrivateBarriersResponse>, void, unknown>;
/** 機体 ID を指定して予約ルート ID を複数取得する */
export declare const getReservedId: ({ baseUrl, authInfo, aircraftId, abortSignal, }: GetReservedIdParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetReservedIdResponse>, void, unknown>;
/** ID を指定して予約ルートを 1 件取得する */
export declare const getReservedRoute: ({ baseUrl, authInfo, reservedRouteId, abortSignal, }: GetReservedRouteParams) => Promise<GetReservedRouteResponse>;
/** 空間 ID の範囲内の予約ルートを複数取得する */
export declare const getReservedRoutes: ({ baseUrl, authInfo, payload, abortSignal, }: GetReservedRoutesParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetReservedRoutesResponse>, void, unknown>;
export interface Barrier {
	id: string;
	barrierDefinitions: BarrierDefinition[];
	status: StreamStatus;
}
export interface BarrierDefinition {
	spatialIdentification: SpatialIdentification;
	risk: number;
}
export interface CreateBarrierParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: Barrier;
	abortSignal?: AbortSignal;
}
export interface CreatePrivateBarrierParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: PrivateBarrier;
	abortSignal?: AbortSignal;
}
export interface CreateReservedRouteParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: CreateReservedRouteRequest;
	abortSignal?: AbortSignal;
}
export interface CreateReservedRouteRequest {
	waypoints: Point[];
	ignoreReservedRouteIds: string[];
	clearance: number;
	aircraftId: string;
	startTime: string;
	endTime: string;
	reservationMethod: ReservationMethod;
	uavInfo: UavInfo;
	ignoreSpatialId: boolean;
}
export interface CreateReservedRouteResponse {
	responseHeader: CommonResponseHeader;
	result: RouteResponseResult;
	status: StreamStatus;
	reservedRouteId: string;
}
export interface CreateRouteParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: CreateRouteRequest;
	abortSignal?: AbortSignal;
}
export interface CreateRouteRequest {
	waypoints: Point[];
	clearance: number;
	ignoreReservedRouteIds: string[];
	uavInfo: UavInfo;
}
export interface CreateRouteResponse {
	responseHeader: CommonResponseHeader;
	result: RouteResponseResult;
	status: StreamStatus;
}
export interface DeleteBarrierParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface DeletePrivateBarrierParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface DeleteReservedRouteParams {
	baseUrl: string;
	authInfo: AuthInfo;
	reservedRouteId: string;
	abortSignal?: AbortSignal;
}
export interface ErrorDef {
	detail: string;
	waypointsInBarrierPaths: Path[];
	noPathPaths: Path[];
	noDataPaths: Path[];
	unexpectedErrorPaths: Path[];
}
export interface GetAircraftsParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetAircraftsRequest;
	abortSignal?: AbortSignal;
}
export interface GetAircraftsRequest {
	boundary: SpatialIdentification[];
}
export interface GetAircraftsResponse {
	responseHeader: CommonResponseHeader;
	aircraftsId: string[];
	status: StreamStatus;
}
export interface GetBarrierParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetBarrierResponse {
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
export interface GetPrivateBarrierParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetPrivateBarrierResponse {
	id: string;
	responseHeader: CommonResponseHeader;
	barrierDefinitions: BarrierDefinition[];
	status: StreamStatus;
}
export interface GetPrivateBarriersParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetPrivateBarriersRequest;
	abortSignal?: AbortSignal;
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
export interface GetReservedIdParams {
	baseUrl: string;
	authInfo: AuthInfo;
	aircraftId: string;
	abortSignal?: AbortSignal;
}
export interface GetReservedIdResponse {
	responseHeader: CommonResponseHeader;
	routeId: string[];
	status: StreamStatus;
}
export interface GetReservedRouteParams {
	baseUrl: string;
	authInfo: AuthInfo;
	reservedRouteId: string;
	abortSignal?: AbortSignal;
}
export interface GetReservedRouteResponse {
	responseHeader: CommonResponseHeader;
	reservedRouteId: string;
	routes: Route[];
}
export interface GetReservedRoutesParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetReservedRoutesRequest;
	abortSignal?: AbortSignal;
}
export interface GetReservedRoutesRequest {
	boundary: SpatialIdentification;
	aircraftId: string;
	startTime: string;
	endTime: string;
	hasRoutes: boolean;
}
export interface GetReservedRoutesResponse {
	responseHeader: CommonResponseHeader;
	reservedRouteId: string;
	status: StreamStatus;
	routes: Route[];
}
export interface IdResponse {
	id: string;
}
export interface Path {
	pathMap: {
		[index: string]: Point;
	};
}
export interface PrivateBarrier {
	id: string;
	barrierDefinitions: BarrierDefinition[];
	clearance: number;
	status: StreamStatus;
}
export interface Route {
	route: SpatialIdentification[];
	waypoints: Point[];
	mappingOfWaypointIndex: number[];
}
export interface RouteResponseResult {
	route?: Route;
	Error?: ErrorDef;
}
export interface UavInfo {
	uavSize: string;
}
export type ReservationMethod = "TRJXRecommend" | "InputWPPriority";

