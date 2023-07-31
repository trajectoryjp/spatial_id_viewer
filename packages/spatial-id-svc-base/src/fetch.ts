/// <reference path="../../../types/textlinestream.d.ts" />

import TextLineStream from 'textlinestream';

import {
  ApiAuthError,
  ApiCommonStatusError,
  ApiDomError,
  ApiHttpStatusError,
  ApiResponseError,
  ApiStreamError,
} from './error';
import { AuthInfo, HttpMethod, StreamResponse, WithCommonResponseHeader } from './types';

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

const doFetch = async (params: FetchJsonParams) => {
  const headers: Record<string, string> = {};
  const req: RequestInit = { method: params.method, headers };
  if (params.payload !== undefined) {
    req.body = JSON.stringify(params.payload);
    headers['Content-Type'] = 'application/json';
  }
  if (params.authInfo !== undefined) {
    headers['Grpc-Metadata-username'] = params.authInfo.username;
    headers['Grpc-Metadata-token'] = params.authInfo.token;
  }
  if (params.headers !== undefined) {
    Object.assign(headers, params.headers);
  }

  if (params.abortSignal !== undefined) {
    req.signal = params.abortSignal;
  }

  let resp: Response;
  try {
    resp = await fetch(params.baseUrl + params.path, req);
  } catch (e) {
    if (e instanceof DOMException) {
      throw new ApiDomError(e.message, e.name);
    }
    throw new ApiDomError('unexpected fetch result');
  }

  if (resp.status === 401) {
    throw new ApiAuthError('failed to authenticate: token might be invalid');
  }
  if (!resp.ok) {
    throw new ApiHttpStatusError('failed to fetch response: invalid http status code', resp.status);
  }

  return resp;
};

/**
 * JSON API をコールする。
 * 成功系応答 (ステータス 200 番台) でなかったときは例外を発生させる。
 * @param params 引数オブジェクト
 * @returns レスポンスペイロードのパース済み JSON オブジェクト
 */
export const fetchRawJson = async <T>(params: FetchJsonParams) => {
  const resp = await doFetch(params);
  try {
    const json = (await resp.json()) as T;
    return json;
  } catch (e) {
    throw new ApiResponseError('failed to parse as json');
  }
};

/**
 * JSON ストリーム API をコールする。
 * 成功系応答 (ステータス 200 番台) でなかったときは例外を発生させる。
 * @param params 引数オブジェクト
 * @returns レスポンスペイロードのパース済み JSON オブジェクトの async generator
 */
export const fetchRawJsonStream = async function* <T>(params: FetchJsonParams) {
  const resp = await doFetch(params);

  const stream = resp.body.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream());
  const reader = stream.getReader();
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) {
      break;
    }

    let parsed: StreamResponse<T>;
    try {
      parsed = JSON.parse(chunk.value);
    } catch (e) {
      throw new ApiResponseError('failed to parse as json');
    }

    if (parsed.error !== undefined) {
      throw new ApiStreamError('response has an error', parsed.error);
    }
    yield parsed;
  }
};

/**
 * レスポンスペイロードに responseHeader を持つ API をコールする。
 * fetchJsonRaw に加え、.responseHeader.status が 0 以外のときに例外を発生させる。
 * @param params 引数オブジェクト
 * @returns
 */
export const fetchJson = async <T extends WithCommonResponseHeader = WithCommonResponseHeader>(
  params: FetchJsonParams
) => {
  const resp = await fetchRawJson<T>(params);

  let status: number;
  try {
    status = resp.responseHeader.status;
  } catch (e) {
    throw new ApiResponseError('failed to get resp.responseHeader.status');
  }

  if (status !== 0) {
    throw new ApiCommonStatusError(`invalid status: ${status}`, resp.responseHeader);
  }
  return resp;
};

/**
 * レスポンスペイロードに responseHeader を持つ JSON ストリーム API をコールする。
 * fetchJsonRaw に加え、.result.responseHeader.status が 0 以外のときに例外を発生させる。
 * @param params 引数オブジェクト
 * @returns レスポンスペイロードのパース済み JSON オブジェクトの async generator
 */
export const fetchJsonStream = async function* <
  T extends WithCommonResponseHeader = WithCommonResponseHeader
>(params: FetchJsonParams) {
  for await (const chunk of fetchRawJsonStream<T>(params)) {
    let status: number;
    try {
      status = chunk.result.responseHeader.status;
    } catch (e) {
      throw new ApiResponseError('failed to get chunk.result.responseHeader.status');
    }

    if (status !== 0) {
      throw new ApiCommonStatusError(`invalid status: ${status}`, chunk.result.responseHeader);
    }
    yield chunk;
  }
};

/**
 * async generator を配列に変換する。
 * @param chunked async generator
 * @returns 配列
 */
export const streamToArray = async <T>(chunked: AsyncGenerator<T, void, unknown>) => {
  const result: T[] = [];
  for await (const elem of chunked) {
    result.push(elem);
  }
  return result;
};
