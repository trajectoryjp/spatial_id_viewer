/** HTTP メソッド */
export type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH';

/** 認証情報オブジェクト */
export interface AuthInfo {
  username: string;
  token: string;
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

/** ストリーム API のステータス */
export type StreamStatus =
  | 'STATUS_UNSPECIFIED'
  | 'STATUS_CONTINUE'
  | 'STATUS_DONE'
  | 'STATUS_ABORT';

/** レスポンスペイロードの gRPC 共通レスポンスヘッダー */
export interface CommonResponseHeader {
  status: number;
  message: string;
}

/** 共通レスポンスヘッダーを持つオブジェクト */
export interface WithCommonResponseHeader {
  responseHeader: CommonResponseHeader;
}
