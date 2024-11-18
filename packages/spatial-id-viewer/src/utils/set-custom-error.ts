import { toast } from 'react-toastify';

import {
  ApiAuthError,
  ApiHttpStatusError,
  ApiNotFoundError,
  ApiServiceError,
} from 'spatial-id-svc-base';

export const setCustomError = (error: unknown) => {
  if (error instanceof ApiAuthError) {
    toast.error('トークン期限切れ: 再度ログインしてください', { position: 'bottom-center' });
  } else if (error instanceof ApiServiceError) {
    toast.error('サーバーから読み取れません', { position: 'bottom-center' });
  } else if (error instanceof ApiNotFoundError) {
    toast.error('リソースが見つかりませんでした。', { position: 'bottom-center' });
  } else if (error instanceof ApiHttpStatusError) {
    toast.error('不明なエラーが発生しました。しばらくしてからもう一度お試しください。', {
      position: 'bottom-center',
    });
  }
};
