/** 測地座標をキーに変換します。境界の場合は最小のKeyが返ります */
export declare const convertGeodeticToKey: ({ baseUrl, payload, abortSignal, }: ConvertGeodeticToKeyParams) => Promise<Key>;
/** キー群をタイルXYZ群に変換します */
export declare const convertKeysToTileXyzs: ({ baseUrl, payload, abortSignal, }: ConvertKeysToTileXyzsParams) => Promise<TileXyzs>;
/** タイルXYZ群をキー群に変換します */
export declare const convertTileXyzsToKeys: ({ baseUrl, payload, abortSignal, }: ConvertTileXyzsToKeysParams) => Promise<Keys>;
/** 環境設定を取得します */
export declare const getConfiguration: ({ baseUrl, abortSignal }: GetConfigurationParams) => Promise<Configuration>;
/** 障害物マップを一覧します */
export declare const listBarrierMaps: ({ baseUrl, payload, abortSignal }: ListBarrierMapsParams) => Promise<ListBarrierMapsResponse>;
export interface Barrier {
	startTime: string;
	endTime: string;
	groupId: string;
}
export interface BarrierMap {
	body: {
		[modelId: string]: Barrier;
	};
}
export interface Box {
	min: Key;
	max: Key;
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
export interface Configuration_PostgreSql {
	host: string;
	port: string;
	user: string;
	dataBaseName: string;
	password: string;
}
export interface Configuration_ZoomLevel {
	quadKeyZoomLevel: number;
	altitudeKeyZoomLevel: number;
}
export interface ConvertGeodeticToKeyParams {
	baseUrl: string;
	payload: ConvertGeodeticToKeyRequest;
	abortSignal?: AbortSignal;
}
export interface ConvertGeodeticToKeyRequest {
	geodetic: Geodetic;
	zoomLevel: number;
}
export interface ConvertKeysToTileXyzsParams {
	baseUrl: string;
	payload: Keys;
	abortSignal?: AbortSignal;
}
export interface ConvertTileXyzsToKeysParams {
	baseUrl: string;
	payload: TileXyzs;
	abortSignal?: AbortSignal;
}
export interface Geodetic {
	tag: string;
	longitude: number;
	latitude: number;
	altitude: number;
}
export interface GetConfigurationParams {
	baseUrl: string;
	abortSignal?: AbortSignal;
}
export interface Key {
	quadKey: string;
	altitudeKey: number;
}
export interface Keys {
	keys: Key[];
}
export interface ListBarrierMapsParams {
	baseUrl: string;
	payload: ListBarrierMapsRequest;
	abortSignal?: AbortSignal;
}
export interface ListBarrierMapsRequest {
	pageSoftSize: number;
	view: ListBarrierMapsRequest_View;
	box: Box;
	startKey: Key;
	relatedFilter: ListBarrierMapsRequest_RelatedFilter;
}
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
export interface OptionalKey {
	hasValue: boolean;
	key: Key;
}
export interface TileXyz {
	quadKeyZoomLevel: number;
	altitudeKeyZoomLevel: number;
	x: string;
	y: string;
	z: string;
}
export interface TileXyzs {
	tileXyzs: TileXyz[];
}
export type Configuration_LogLevel = "LOG_LEVEL_TRACE" | "LOG_LEVEL_DEBUG" | "LOG_LEVEL_INFO" | "LOG_LEVEL_WARN" | "LOG_LEVEL_ERROR" | "LOG_LEVEL_FATAL";
export type ListBarrierMapsRequest_View = "VIEW_UNSPECIFIED" | "VIEW_KEY" | "VIEW_FULL";

