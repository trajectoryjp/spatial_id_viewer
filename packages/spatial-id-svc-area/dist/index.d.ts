import { AuthInfo, CommonResponseHeader } from 'spatial-id-svc-base';
import { SpatialIdentification } from 'spatial-id-svc-common';

/** 割込禁止エリアを生成する */
export declare const createBlockedArea: ({ baseUrl, authInfo, payload, abortSignal, }: CreateBlockedAreaParams) => Promise<success>;
export declare const createOverlayArea: ({ baseUrl, authInfo, payload, abortSignal, }: CreateOverlayAreaParams) => Promise<success>;
/** 予約エリアを生成する */
export declare const createReservedArea: ({ baseUrl, authInfo, payload, abortSignal, }: CreateReservedAreaParams) => Promise<success>;
export declare const createSignals: ({ baseUrl, authInfo, payload, abortSignal, }: CreateSignalsParams) => Promise<success>;
export declare const createWeather: ({ baseUrl, authInfo, payload, abortSignal, }: CreateWeatherParams) => Promise<success>;
/** 割込禁止エリアを削除する */
export declare const deleteBlockedArea: ({ baseUrl, authInfo, id, abortSignal, }: DeleteBlockedAreaParams) => Promise<void>;
export declare const deleteOverlayArea: ({ baseUrl, authInfo, id, abortSignal, }: DeleteOverlayAreaParams) => Promise<void>;
/** ID を指定して予約エリアを削除する */
export declare const deleteReservedArea: ({ baseUrl, authInfo, id, abortSignal, }: DeleteReservedAreaParams) => Promise<void>;
export declare const deleteSignal: ({ baseUrl, authInfo, id, abortSignal, }: DeleteBlockedAreaParams) => Promise<void>;
export declare const deleteWeather: ({ baseUrl, authInfo, id, abortSignal, }: DeleteBlockedAreaParams) => Promise<void>;
export declare const getBlockedArea: ({ baseUrl, authInfo, id, abortSignal, }: GetBlockedAreaParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBlockedAreaResponse>, void, unknown>;
/** 空間 ID の範囲内の割込禁止エリアを複数取得する */
export declare const getBlockedAreas: ({ baseUrl, authInfo, payload, abortSignal, }: GetBlockedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBlockedAreasResponse>, void, unknown>;
export declare const getOverlayArea: ({ baseUrl, authInfo, id, abortSignal, }: GetOverlayAreaParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetOverlayAreaResponse>, void, unknown>;
export declare const getOverlayAreas: ({ baseUrl, authInfo, payload, abortSignal, }: GetOverlayAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetOverlayAreasResponse>, void, unknown>;
export declare const getReservedArea: ({ baseUrl, authInfo, id, abortSignal, }: GetReservedAreaParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetReservedAreaResponse>, void, unknown>;
/** 空間 ID の範囲内の予約エリアを複数取得する */
export declare const getReservedAreas: ({ baseUrl, authInfo, payload, abortSignal, }: GetReservedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetReservedAreasResponse>, void, unknown>;
export declare const getRisk: ({ baseUrl, authInfo, id, abortSignal }: GetBlockedAreaParams) => Promise<GetBlockedAreaResponse>;
export declare const getRiskLevels: ({ baseUrl, authInfo, payload, abortSignal, }: GetRiskLevelParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetRiskLevelsResponse>, void, unknown>;
export declare const getRisks: ({ baseUrl, authInfo, payload, abortSignal, }: GetBlockedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBlockedAreasResponse>, void, unknown>;
export declare const getSignalArea: ({ baseUrl, authInfo, id, abortSignal, }: GetBlockedAreaParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBlockedAreaResponse>, void, unknown>;
export declare const getSignalAreas: ({ baseUrl, authInfo, payload, abortSignal, }: GetBlockedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBlockedAreasResponse>, void, unknown>;
export declare const getWeather: ({ baseUrl, authInfo, id, abortSignal, }: GetBlockedAreaParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBlockedAreaResponse>, void, unknown>;
export declare const getWeatherAreas: ({ baseUrl, authInfo, payload, abortSignal, }: GetBlockedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<GetBlockedAreasResponse>, void, unknown>;
/** 空間 ID の範囲内の割込禁止エリアの追加・削除を監視する */
export declare const watchBlockedAreas: ({ baseUrl, authInfo, payload, abortSignal, }: WatchBlockedAreasParams) => AsyncGenerator<import("spatial-id-svc-base").StreamResponse<WatchBlockedAreasResponse>, void, unknown>;
export interface AirRiskDefinition {
	reference: string;
	voxelValues: riskVoxel[];
}
export interface AreaVoxel {
	id: {
		ID: string;
	};
}
export interface BlockedArea {
	id: string;
	spatialIdentifications: SpatialIdentification[];
	startTime: string;
	endTime: string;
}
export interface BlockedAreaRquest {
	overwrite: boolean;
	object: SpatialDefinition;
}
export interface CreateBlockedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: BlockedAreaRquest;
	abortSignal?: AbortSignal;
}
export interface CreateBlockedAreaRequest {
	blockedArea: BlockedArea;
}
export interface CreateBlockedAreaResponse {
	responseHeader: CommonResponseHeader;
	areaId: string;
}
export interface CreateEmergencyAreaRequest {
	overwrite: boolean;
	object: SpatialDefinition;
}
export interface CreateOverlayAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: OverlayAreaRquest;
	abortSignal?: AbortSignal;
}
export interface CreateReservedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: CreateEmergencyAreaRequest;
	abortSignal?: AbortSignal;
}
export interface CreateReservedAreaRequest {
	reservedArea: ReservedArea;
}
export interface CreateReservedAreaResponse {
	responseHeader: CommonResponseHeader;
	areaId: string;
}
export interface CreateSignalsParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: BlockedAreaRquest;
	abortSignal?: AbortSignal;
}
export interface CreateWeatherParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: BlockedAreaRquest;
	abortSignal?: AbortSignal;
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
export interface CurrentWeatherDefinition {
	reference: string;
	voxelValues: currentWeatherVoxel[];
}
export interface DeleteBlockedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface DeleteOverlayAreaParams {
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
export interface EmergencyAreaVoxels {
	id: {
		ID: string;
	};
	vacant: boolean;
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
export interface GetAreaRequest {
	figure: SpatialFigure;
	requestType: string[];
}
export interface GetBlockedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetBlockedAreaResponse extends SpatialDefinition {
	responseHeader?: CommonResponseHeader;
	result: SpatialDefinition;
	error: ErrorResponse;
}
export interface GetBlockedAreas {
	objects: SpatialDefinition[];
}
export interface GetBlockedAreasParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetAreaRequest;
	abortSignal?: AbortSignal;
}
export interface GetBlockedAreasRequest {
	boundary: SpatialIdentification[];
	hasSpatialId: boolean;
	startTime: string;
	endTime: string;
}
export interface GetBlockedAreasResponse extends SpatialDefinitions {
	responseHeader?: CommonResponseHeader;
}
export interface GetEmergencyAreas {
	objects: SpatialDefinition[];
}
export interface GetOverlayAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetOverlayAreaResponse extends SpatialDefinition {
	responseHeader?: CommonResponseHeader;
	result: SpatialDefinition;
	error: ErrorResponse;
}
export interface GetOverlayAreas {
	objects: SpatialDefinition[];
}
export interface GetOverlayAreasParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetAreaRequest;
	abortSignal?: AbortSignal;
}
export interface GetOverlayAreasResponse {
	responseHeader?: CommonResponseHeader;
	objects: SpatialDefinition[];
}
export interface GetReservedAreaParams {
	baseUrl: string;
	authInfo: AuthInfo;
	id: string;
	abortSignal?: AbortSignal;
}
export interface GetReservedAreaResponse extends SpatialDefinition {
	responseHeader?: CommonResponseHeader;
}
export interface GetReservedAreasParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetAreaRequest;
	abortSignal?: AbortSignal;
}
export interface GetReservedAreasRequest {
	boundary: SpatialIdentification[];
	hasSpatialId: boolean;
	startTime: string;
	endTime: string;
}
export interface GetReservedAreasResponse {
	responseHeader?: CommonResponseHeader;
	objects: SpatialDefinition[];
}
export interface GetRiskLevelParams {
	baseUrl: string;
	authInfo: AuthInfo;
	payload: GetRiskLevelPayload;
	abortSignal?: AbortSignal;
}
export interface GetRiskLevelPayload {
	figure: SpatialFigure;
	zoomLevel: number;
}
export interface GetRiskLevelsResponse {
	responseHeader?: CommonResponseHeader;
	riskLevels: RiskLevel[];
}
export interface GetSignalRequest {
	figure: SpatialFigure;
	requestType: string[];
}
export interface GetWeatherRequest {
	figure: SpatialFigure;
	requestType: string[];
}
export interface GroundRiskDeifinition {
	reference: string;
	voxelValues: riskVoxel[];
}
export interface MicrowaveDefinition {
	mobile?: MobileDefinition;
	wifi?: WifiDefinition;
}
export interface MobileDefinition {
	reference: string;
	plmnId: {
		mobileCountryCode?: string;
		mobileNetworkCode?: string;
	};
	voxelValues: SignalVoxel[];
}
export interface OverlayAreaRquest {
	overwrite: boolean;
	object: SpatialDefinition;
}
export interface ReservedArea {
	id: string;
	spatialIdentifications: SpatialIdentification[];
	startTime: string;
	endTime: string;
}
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
export interface SpatialFigure {
	identification: {
		ID: string;
	};
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
export interface WeatherForecast {
	startTime: Date | string | null;
	endTime: Date | string | null;
	windDirection: number;
	windSpeed: number;
	cloudRate: number;
	precipitation: number;
}
export interface WeatherForecastDefinition {
	reference: string;
	voxelValues: weatherForecastVoxel[];
}
export interface WifiDefinition {
	reference: string;
	ssid: string;
	voxelValues: SignalVoxel[];
}
export interface currentWeatherVoxel {
	id: {
		ID: string;
	};
	currentWeather: CurrentWeather;
}
export interface emergencyAreaDefinition {
	reference: string;
	voxelValues: EmergencyAreaVoxels[];
}
export interface error extends ErrorResponse {
	responseHeader?: CommonResponseHeader;
}
export interface overlayAreaDefinition {
	ownerAddress: {
		grpc: string;
		rest: string;
		other: string;
	};
	voxelValues: AreaVoxel[];
}
export interface restrictedAreaDefinition {
	reference: string;
	type: string;
	voxelValues: AreaVoxel[];
}
export interface riskVoxel {
	id: {
		ID: string;
	};
	value: number;
}
export interface success extends successResponse {
	responseHeader?: CommonResponseHeader;
}
export interface successResponse {
	objectId: string;
	error: string;
}
export interface weatherForecastVoxel {
	id: {
		ID: string;
	};
	forecast: WeatherForecast;
}

