import { ApiAuthError, AuthInfo, fetchRawJson } from 'spatial-id-svc-base';

interface LoginRequestBody {
  UserID: string;
  Password: string;
}

interface LoginResponseBody {
  Result: 'Complete' | 'Invalid';
  Token: string;
}

export interface LoginRequestParams {
  baseUrl: string;
  userId: string;
  password: string;
  abortSignal?: AbortSignal;
}

/**
 * ログインを行い、成功時 AuthInfo オブジェクトを返す。
 * 認証失敗時は ApiAuthError 例外を発生させる。
 */
export const login = async ({
  baseUrl,
  userId,
  password,
  abortSignal,
}: LoginRequestParams): Promise<AuthInfo> => {
  const resp = await fetchRawJson<LoginResponseBody>({
    method: 'POST',
    baseUrl,
    path: '/common_service/login',
    payload: {
      UserID: userId,
      Password: password,
    } as LoginRequestBody,
    abortSignal,
  });

  if (resp.Result !== 'Complete') {
    throw new ApiAuthError('failed to authenticate');
  }

  return {
    username: userId,
    token: resp.Token,
  };
};
