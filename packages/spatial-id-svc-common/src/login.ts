import { ApiAuthError, AuthInfo, fetchRawJson } from 'spatial-id-svc-base';

interface LoginRequestBody {
  userID: string;
  organizationID: string;
  password: string;
}

interface LoginResponseBody {
  result: 'COMPLETE' | 'Invalid';
  token: string;
}

export interface LoginRequestParams {
  baseUrl: string;
  userID: string;
  organizationID?: string;
  password: string;
  abortSignal?: AbortSignal;
}

/**
 * ログインを行い、成功時 AuthInfo オブジェクトを返す。
 * 認証失敗時は ApiAuthError 例外を発生させる。
 */
export const login = async ({
  baseUrl,
  userID,
  organizationID,
  password,
  abortSignal,
}: LoginRequestParams): Promise<AuthInfo> => {
  const resp = await fetchRawJson<LoginResponseBody>({
    method: 'POST',
    baseUrl,
    path: '/gen/api/generic/v3/connect-server',
    payload: {
      userID,
      // organizationID,
      password,
    } as LoginRequestBody,
    abortSignal,
  });

  if (resp.result !== 'COMPLETE') {
    throw new ApiAuthError('failed to authenticate');
  }

  return {
    username: userID,
    organizationID,
    token: resp.token,
  };
};
