import { CommonResponseHeader, StreamError } from './types';

/** REST API ラッパーのエラー基底クラス */
export class ApiBaseError extends Error {
  name = 'ApiBaseError';
}

/** REST API のリクエスト関連のエラー */
export class ApiDomError extends ApiBaseError {
  constructor(message: string, readonly name: string = 'ApiDomError', options?: ErrorOptions) {
    super(message, options);
  }
}

/** REST API の HTTP ステータスコード検証エラー */
export class ApiHttpStatusError extends ApiBaseError {
  name = 'ApiHttpStatusError';

  constructor(message: string, readonly status: number, options?: ErrorOptions) {
    super(message, options);
  }
}

/** REST API の認証関連エラー */
export class ApiAuthError extends ApiHttpStatusError {
  name = 'ApiAuthError';

  constructor(message: string, options?: ErrorOptions) {
    super(message, 401, options);
  }
}

/** REST API レスポンスのペイロード関連のエラー */
export class ApiResponseError extends ApiBaseError {
  name = 'ApiResponseError';
}

/** REST API レスポンスのストリーム処理の際のエラー */
export class ApiStreamError extends ApiResponseError {
  name = 'ApiStreamError';

  constructor(message: string, readonly error: StreamError, options?: ErrorOptions) {
    super(message, options);
  }
}

/** REST API のレスポンスペイロード responseHeader 内 status の検証エラー */
export class ApiCommonStatusError extends ApiResponseError {
  name = 'ApiCommonStatusError';

  constructor(
    message: string,
    readonly responseHeader: CommonResponseHeader,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}
