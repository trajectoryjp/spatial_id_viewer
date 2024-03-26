import { Button } from 'flowbite-react';
import { memo, useCallback, useState } from 'react';
import { useMount } from 'react-use';
import { useStore } from 'zustand';

import { useStoreApi } from '#app/components/area-creator/store';
import { NavigationButtons } from '#app/components/navigation';
import { warnIfTokenExpired } from '#app/utils/warn-if-token-expired';

/** 使用側から渡される登録関数を呼び出す画面 */
export const RegisterFragment = memo(() => {
  const store = useStoreApi();
  const reset = useStore(store, (s) => s.reset);
  const registerFunc = useStore(store, (s) => s.registerFunc)!;

  const [result, setResult] = useState<boolean>(null);

  const register = useCallback(async () => {
    setResult(null);

    try {
      await registerFunc(store.getState().areas);
      setResult(true);
    } catch (e) {
      console.error(e);
      warnIfTokenExpired(e);
      setResult(false);
    }
  }, []);

  useMount(register);
  const onRetryButtonClick = register;
  const onResetButtonClick = reset;

  return result === null ? (
    <p>登録しています...</p>
  ) : result ? (
    <>
      <p>登録が正常に完了しました。</p>
      <NavigationButtons>
        <Button onClick={onResetButtonClick}>さらに登録する</Button>
      </NavigationButtons>
    </>
  ) : (
    <>
      <p>登録に失敗しました。</p>
      <NavigationButtons>
        <Button color="dark" onClick={onResetButtonClick}>
          はじめからやり直す
        </Button>
        <Button onClick={onRetryButtonClick}>再試行</Button>
      </NavigationButtons>
    </>
  );
});
