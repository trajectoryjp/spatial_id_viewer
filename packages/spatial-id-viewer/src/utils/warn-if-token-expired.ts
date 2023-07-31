import { toast } from 'react-toastify';

import { ApiAuthError } from 'spatial-id-svc-base';

export const warnIfTokenExpired = (error: unknown) => {
  if (error instanceof ApiAuthError) {
    toast.error('トークン期限切れ: 再度ログインしてください', { position: 'bottom-center' });
  }
};
