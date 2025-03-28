import { toast } from 'react-toastify';

import {
  ApiAuthError,
  ApiDomError,
  ApiHttpStatusError,
  ApiNotFoundError,
  ApiServiceError,
  InvalidRequestError,
  ResponseTooLargeError,
} from 'spatial-id-svc-base';

export const setCustomError = (error: unknown) => {
  if (error instanceof ApiAuthError) {
    toast.error('トークン期限切れ: 再度ログインしてください', { position: 'bottom-center' });
  } else if (error instanceof ApiServiceError) {
    toast.error('サーバーから読み取れません', { position: 'bottom-center' });
  } else if (error instanceof ApiNotFoundError) {
    toast.error('リソースが見つかりませんでした。', { position: 'bottom-center' });
  } else if (error instanceof InvalidRequestError) {
    toast.error('IDの形式が不正です。半角数字で入力してください。', { position: 'bottom-center' });
  } else if (error instanceof ApiHttpStatusError) {
    toast.error('不明なエラーが発生しました。しばらくしてからもう一度お試しください。', {
      position: 'bottom-center',
    });
  } else if (error instanceof ResponseTooLargeError) {
    toast.error('オブジェクトが大きすぎます', {
      position: 'bottom-center',
    });
  } else if (error instanceof ApiDomError) {
    toast.error('予期せぬエラーが発生しました', {
      position: 'bottom-center',
    });
  }
};
