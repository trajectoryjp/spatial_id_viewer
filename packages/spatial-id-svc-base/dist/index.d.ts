/** REST API の認証関連エラー */
export declare class ApiAuthError extends ApiHttpStatusError {
	name: string;
	constructor(message: string, options?: ErrorOptions);
}
/** REST API ラッパーのエラー基底クラス */
export declare class ApiBaseError extends Error {
	name: string;
}
/** REST API のレスポンスペイロード responseHeader 内 status の検証エラー */
export declare class ApiCommonStatusError extends ApiResponseError {
	readonly responseHeader: CommonResponseHeader;
	name: string;
	constructor(message: string, responseHeader: CommonResponseHeader, options?: ErrorOptions);
}
/** REST API のリクエスト関連のエラー */
export declare class ApiDomError extends ApiBaseError {
	readonly name: string;
	constructor(message: string, name?: string, options?: ErrorOptions);
}
/** REST API の HTTP ステータスコード検証エラー */
export declare class ApiHttpStatusError extends ApiBaseError {
	readonly status: number;
	name: string;
	constructor(message: string, status: number, options?: ErrorOptions);
}
/** REST API レスポンスのペイロード関連のエラー */
export declare class ApiResponseError extends ApiBaseError {
	name: string;
}
/** REST API レスポンスのストリーム処理の際のエラー */
export declare class ApiStreamError extends ApiResponseError {
	readonly error: StreamError;
	name: string;
	constructor(message: string, error: StreamError, options?: ErrorOptions);
}
/**
 * レスポンスペイロードに responseHeader を持つ API をコールする。
 * fetchJsonRaw に加え、.responseHeader.status が 0 以外のときに例外を発生させる。
 * @param params 引数オブジェクト
 * @returns
 */
export declare const fetchJson: <T extends WithCommonResponseHeader = WithCommonResponseHeader>(params: FetchJsonParams) => Promise<T>;
/**
 * レスポンスペイロードに responseHeader を持つ JSON ストリーム API をコールする。
 * fetchJsonRaw に加え、.result.responseHeader.status が 0 以外のときに例外を発生させる。
 * @param params 引数オブジェクト
 * @returns レスポンスペイロードのパース済み JSON オブジェクトの async generator
 */
export declare const fetchJsonStream: <T extends WithCommonResponseHeader = WithCommonResponseHeader>(params: FetchJsonParams) => AsyncGenerator<StreamResponse<T>, void, unknown>;
/**
 * JSON API をコールする。
 * 成功系応答 (ステータス 200 番台) でなかったときは例外を発生させる。
 * @param params 引数オブジェクト
 * @returns レスポンスペイロードのパース済み JSON オブジェクト
 */
export declare const fetchRawJson: <T>(params: FetchJsonParams) => Promise<T>;
/**
 * JSON ストリーム API をコールする。
 * 成功系応答 (ステータス 200 番台) でなかったときは例外を発生させる。
 * @param params 引数オブジェクト
 * @returns レスポンスペイロードのパース済み JSON オブジェクトの async generator
 */
export declare const fetchRawJsonStream: <T>(params: FetchJsonParams) => AsyncGenerator<StreamResponse<T>, void, unknown>;
/**
 * async generator を配列に変換する。
 * @param chunked async generator
 * @returns 配列
 */
export declare const streamToArray: <T>(chunked: AsyncGenerator<T, void, unknown>) => Promise<T[]>;
/** 認証情報オブジェクト */
export interface AuthInfo {
	username: string;
	token: string;
}
/** レスポンスペイロードの gRPC 共通レスポンスヘッダー */
export interface CommonResponseHeader {
	status: number;
	message: string;
}
export interface FetchJsonParams {
	/** HTTP メソッド */
	method: HttpMethod;
	/** REST API のベース URL */
	baseUrl: string;
	/** 認証情報 */
	authInfo?: AuthInfo;
	/** リクエスト先のパス */
	path: string;
	/** リクエストのペイロード (オブジェクト形式) */
	payload?: unknown;
	/** 追加の HTTP ヘッダー */
	headers?: Record<string, string>;
	/** リクエスト中断用シグナル */
	abortSignal?: AbortSignal;
}
/** ストリーム API レスポンスペイロード内のエラーオブジェクト */
export interface StreamError {
	code: number;
	message: string;
}
/** ストリーム API のレスポンスペイロード */
export interface StreamResponse<T> {
	result?: T;
	error?: StreamError;
}
/** 共通レスポンスヘッダーを持つオブジェクト */
export interface WithCommonResponseHeader {
	responseHeader: CommonResponseHeader;
}
/** HTTP メソッド */
export type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
/** ストリーム API のステータス */
export type StreamStatus = "STATUS_UNSPECIFIED" | "STATUS_CONTINUE" | "STATUS_DONE" | "STATUS_ABORT";

