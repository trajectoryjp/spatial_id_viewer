import { AuthInfo, CommonResponseHeader, StreamStatus } from 'spatial-id-svc-base';
import { Point, SpatialIdentification } from 'spatial-id-svc-common';

/** パブリックバリアを生成する */
export declare const createBarrier: ({ baseUrl, authInfo, payload, abortSignal, }: CreateBarrierParams) => Promise<successResponse>;
/** プライベートバリアを生成する */
export declare const createBuildingBarrier: ({ baseUrl, authInfo, payload, abortSignal, }: CreatePrivateBarrierParams) => Promise<successResponse>;
/** 予約ルートを生成する */
export declare const createReservedRoute: ({ baseUrl, authInfo, payload, abortSignal, }: CreateReservedRouteParams) => Promise<successResponse>;
/** ルートを設計する */
export declare const createRoute: ({ baseUrl, authInfo, payload, abortSignal, }: CreateRouteParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<CreateRouteResponse>, void, unknown>;
/** ID を指定してパブリックバリアを削除する */
export declare const deleteBarrier: ({ baseUrl, authInfo, id, abortSignal, }: DeleteBarrierParams) => Promise<void>;
/** ID を指定してプライベートバリアを削除する */
export declare const deletePrivateBarrier: ({ baseUrl, authInfo, id, abortSignal, }: DeletePrivateBarrierParams) => Promise<void>;
/** ID を指定して予約ルートを削除する */
export declare const deleteReservedRoute: ({ baseUrl, authInfo, id, abortSignal, }: DeleteReservedRouteParams) => Promise<void>;
/** 空間 ID の範囲内の機体の ID を複数取得する */
export declare const getAircrafts: ({ baseUrl, authInfo, payload, abortSignal, }: GetAircraftsParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetAircraftsResponse>, void, unknown>;
/** ID を指定してパブリックバリアを 1 件取得する */
export declare const getBarrier: ({ baseUrl, authInfo, id, abortSignal, }: GetBarrierParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBarrierResponseNew>, void, unknown>;
/** 空間 ID の範囲内のパブリックバリアを複数取得する */
export declare const getBarriers: ({ baseUrl, authInfo, payload, abortSignal, }: GetBarriersParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBarriersResponseNew>, void, unknown>;
export declare const getPermittedAirSpace: ({ baseUrl, authInfo, payload, abortSignal, }: GetPermittedRoutesParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetPermittedRoutesResponse>, void, unknown>;
export declare const getPermittedAirSpaceStream: ({ baseUrl, authInfo, payload, abortSignal, }: GetPermittedRoutesParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetPermittedRoutesResponseStream>, void, unknown>;
/** ID を指定してプライベートバリアを 1 件取得する */
export declare const getPrivateBarrier: ({ baseUrl, authInfo, id, abortSignal, }: GetPrivateBarrierParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBarrierResponseNew>, void, unknown>;
/** 空間 ID の範囲内のプライベートバリアを取得する */
export declare const getPrivateBarriers: ({ baseUrl, authInfo, payload, abortSignal, }: GetPrivateBarriersParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBarriersResponseNew>, void, unknown>;
/** 機体 ID を指定して予約ルート ID を複数取得する */
export declare const getReservedId: ({ baseUrl, authInfo, aircraftId, abortSignal, }: GetReservedIdParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetReservedIdResponse>, void, unknown>;
/** ID を指定して予約ルートを 1 件取得する */
export declare const getReservedRoute: ({ baseUrl, authInfo, id, abortSignal, }: GetReservedRouteParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetReservedRouteResponseV3>, void, unknown>;
/** 空間 ID の範囲内の予約ルートを複数取得する */
export declare const getReservedRoutes: ({ baseUrl, authInfo, payload, abortSignal, }: GetReservedRoutesParamsV3) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetReservedRoutesResponseV3>, void, unknown>;
export interface Barrier {
	id: string;
	barrierDefinitions: BarrierDefinition[];
	status: StreamStatus;
}
export interface BarrierDefinition {
	spatialIdentification: SpatialIdentification;
	risk: number;
}
export interface BarrierDefinitionVoxel {
	id: {
		ID: string;
	};
	vacant?: boolean;
}
export interface BarrierNew {
	overwrite: boolean;
	object: SpatialDefinition;
}
export interface BarrierSpatial {
	result: SpatialDefinition;
}
export interface CreateBarrierParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: BarrierNew;
	abortSignal?: AbortSignal;
}
export interface CreatePrivateBarrierParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: BarrierNew;
	abortSignal?: AbortSignal;
}
export interface CreateReservedRouteParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: CreateReservedRouteRequestV3;
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
export interface CreateReservedRouteRequestV3 {
	overwrite: boolean;
	object: SpatialDefinition;
}
export interface CreateReservedRouteResponse {
	responseHeader?: CommonResponseHeader;
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
	id: string;
	abortSignal?: AbortSignal;
}
export interface EmergencyAreaVoxels {
	id: {
		ID: string;
	};
	vacant: boolean;
}
export interface ErrorDef {
	detail: string;
	waypointsInBarrierPaths: Path[];
	noPathPaths: Path[];
	noDataPaths: Path[];
	unexpectedErrorPaths: Path[];
}
export interface ErrorDetails {
	"@type": string;
	property1: any;
	property2: any;
}
export interface ErrorResponse {
	code: number;
	message: string;
	details: ErrorDetails[];
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
export interface GetBarrierResponseNew extends SpatialDefinition {
	responseHeader?: CommonResponseHeader;
}
export interface GetBarriersParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetTerrainBarriersRequest;
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
export interface GetBarriersResponseNew extends SpatialDefinitions {
	responseHeader?: CommonResponseHeader;
}
export interface GetBuildingBarriersRequest {
	figure: SpatialFigure;
	requestType: string[];
}
export interface GetPermittedRoutesParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: getPermittedAirSpaceRequest;
	abortSignal?: AbortSignal;
}
export interface GetPermittedRoutesResponse {
	responseHeader?: CommonResponseHeader;
	outOfSpace: {
		ID: string[];
	};
	flyableSpace: {
		ID: string[];
	};
	error: string;
}
export interface GetPermittedRoutesResponseStream {
	responseHeader?: CommonResponseHeader;
	result: {
		outOfSpace: {
			ID: string[];
		};
		flyableSpace: {
			ID: string[];
		};
		occupiedSpace: {
			ID: string[];
		};
		error: string;
	};
	error: ErrorResponse;
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
	payload: GetBuildingBarriersRequest;
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
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetReservedRouteResponse {
	responseHeader?: CommonResponseHeader;
	reservedRouteId: string;
	routes: Route[];
}
export interface GetReservedRouteResponseV3 extends SpatialDefinition {
	responseHeader?: CommonResponseHeader;
	error: ErrorResponse;
}
export interface GetReservedRoutesParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetReservedRoutesRequest;
	abortSignal?: AbortSignal;
}
export interface GetReservedRoutesParamsV3 {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetReservedRoutesRequestV3;
	abortSignal?: AbortSignal;
}
export interface GetReservedRoutesRequest {
	boundary: SpatialIdentification;
	aircraftId: string;
	startTime: string;
	endTime: string;
	hasRoutes: boolean;
}
export interface GetReservedRoutesRequestV3 {
	figure: SpatialFigure;
	requestType: string[];
}
export interface GetReservedRoutesResponse {
	responseHeader: CommonResponseHeader;
	reservedRouteId: string;
	status: StreamStatus;
	routes: Route[];
}
export interface GetReservedRoutesResponseV3 {
	responseHeader?: CommonResponseHeader;
	objects: SpatialDefinition[];
}
export interface GetTerrainBarriersRequest {
	figure: SpatialFigure;
	requestType: string[];
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
export interface SpatialFigure {
	identification: {
		ID: string;
	};
}
export interface UavInfo {
	uavSize: string;
}
export interface emergencyAreaDefinition {
	reference: string;
	voxelValues: EmergencyAreaVoxels[];
}
export interface getPermittedAirSpaceRequest {
	figure: SpatialFigure;
	period: {
		startTime: number;
		endTime: number;
	};
	includeReserveArea: boolean;
}
export interface reservationTime {
	period: {
		startTime: string;
		endTime: string;
	};
	occupation: string;
	reserveId: string;
}
export interface reserveAreaVoxels {
	id: {
		ID: string;
	};
	reservationTime: reservationTime;
}
export interface reservedAreaDefinition {
	ownerId: string;
	reservationTime: reservationTime;
	voxelValues: reserveAreaVoxels[];
}
export interface restrictedAreaDefinition {
	reference: string;
	type: string;
	voxelValues: BarrierDefinitionVoxel[];
}
export interface routeArea {
	id: {
		ID: string;
	};
	reservationTime: {
		period: {
			startTime?: Date;
			endTime?: Date;
		};
		occupation: string;
		reserveId: string;
	};
}
export interface successResponse {
	objectId: string;
	error: string;
}
export interface successResponse {
	objectId: string;
	error: string;
}
export interface terrainBuildingDefinition {
	reference: string;
	voxelValues: BarrierDefinitionVoxel[];
}
export type ReservationMethod = "TRJXRecommend" | "InputWPPriority";

