import produce, { immerable } from 'immer';
import { create, Mutate, StoreApi } from 'zustand';

import { AuthInfo } from 'spatial-id-svc-base';

/** 認証情報を永続化させる */
export class AuthInfoStore {
  [immerable] = true;

  authInfo: AuthInfo = {
    username: null,
    token: null,
  };
  backTo: string | null = null;

  constructor(
    private readonly set: StoreApi<AuthInfoStore>['setState'],
    private readonly get: StoreApi<AuthInfoStore>['getState'],
    private readonly store: Mutate<StoreApi<AuthInfoStore>, []>
  ) {
    if (typeof window !== 'undefined') {
      this.authInfo.username = localStorage.getItem('username');
      this.authInfo.token = localStorage.getItem('token');
      this.backTo = sessionStorage.getItem('backTo');
    }
  }

  readonly isSignedIn = () => {
    const self = this.get();
    return self.authInfo && self.authInfo.username && self.authInfo.token;
  };

  readonly setAuthInfo = (authInfo: AuthInfo) => {
    this.set(
      produce(this.get(), (draft) => {
        draft.authInfo = authInfo;

        if (typeof window !== 'undefined') {
          localStorage.setItem('username', authInfo.username);
          localStorage.setItem('token', authInfo.token);
        }
      })
    );
  };

  readonly removeAuthInfo = () => {
    this.set(
      produce(this.get(), (draft) => {
        draft.authInfo.username = null;
        draft.authInfo.token = null;

        if (typeof window !== 'undefined') {
          localStorage.removeItem('username');
          localStorage.removeItem('token');
        }
      })
    );
  };

  readonly setBackTo = (backTo: string) => {
    this.set(
      produce(this.get(), (draft) => {
        draft.backTo = backTo;

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('backTo', backTo);
        }
      })
    );
  };

  readonly removeBackTo = () => {
    this.set(
      produce(this.get(), (draft) => {
        draft.backTo = null;

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('backTo');
        }
      })
    );
  };
}

export const useAuthInfo = create<AuthInfoStore>(
  (set, get, store) => new AuthInfoStore(set, get, store)
);
