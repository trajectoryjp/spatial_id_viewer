import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useLatest, useUnmount } from 'react-use';

/**
 * ページ移動・リロード・タブを閉じる等の操作時に警告を発する React Hook。
 *
 * Next.js による移動のハンドリング時には引数 message, block が適用される。
 * (それ以外の場合はブラウザデフォルトの操作確認画面が表示され、操作の拒否は不可能。)
 *
 * @param warn 警告を発するかどうか。false のときは何もしない
 * @param message 発する警告のメッセージ
 * @param block 操作を拒否するかどうか。false のときは操作の確認を行う
 */
export const useWarnOnRouteChange = (warn: boolean, message: string, block = false) => {
  const router = useRouter();
  const messageLatest = useLatest(message);
  const blockLatest = useLatest(block);

  const nextjsHandler = useCallback(() => {
    if (blockLatest.current) {
      alert(messageLatest.current);
    }
    if (blockLatest.current || !window.confirm(messageLatest.current)) {
      throw 'cancelling navigation';
    }
  }, []);

  const nativeHandler = useCallback((ev: BeforeUnloadEvent) => {
    ev.preventDefault();
    ev.returnValue = '';
  }, []);

  const registerHandlers = useCallback(() => {
    router.events.on('routeChangeStart', nextjsHandler);
    window.addEventListener('beforeunload', nativeHandler, false);
  }, []);

  const unregisterHandlers = useCallback(() => {
    router.events.off('routeChangeStart', nextjsHandler);
    window.removeEventListener('beforeunload', nativeHandler, false);
  }, []);

  useEffect(() => {
    if (warn) {
      registerHandlers();
    } else {
      unregisterHandlers();
    }
  }, [warn]);

  useUnmount(() => {
    unregisterHandlers();
  });
};
