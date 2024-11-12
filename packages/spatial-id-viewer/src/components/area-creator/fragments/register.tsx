import { Button } from 'flowbite-react';
import { set } from 'immer/dist/internal';
import { memo, useCallback, useState } from 'react';
import { useMount } from 'react-use';
import { useStore } from 'zustand';

import { successResponse } from 'spatial-id-svc-route';

import { errorMessages } from '#app/components/area-creator/interfaces';
import { useStoreApi } from '#app/components/area-creator/store';
import { NavigationButtons } from '#app/components/navigation';
import { setCustomError } from '#app/utils/set-custom-error';

/** 使用側から渡される登録関数を呼び出す画面 */
export const RegisterFragment = memo(() => {
  const store = useStoreApi();
  const reset = useStore(store, (s) => s.reset);
  const registerFunc = useStore(store, (s) => s.registerFunc)!;

  const [result, setResult] = useState<boolean>(null);
  const [response, setResponse] = useState<any>(null);
  const register = useCallback(async () => {
    setResult(null);

    try {
      const response = await registerFunc(store.getState().areas);
      setResponse(response);
      setResult(true);
    } catch (e) {
      console.error(e);
      setCustomError(e);
      setResult(false);
    }
  }, []);

  useMount(register);
  const onRetryButtonClick = register;
  const onResetButtonClick = reset;

  return result === null ? (
    <p key={`p1`}>登録しています...</p>
  ) : result ? (
    <>
      {response && response.objectId && response.objectId !== '0' && (
        <p key={`p2`}>登録が正常に完了しました。</p>
      )}
      {response && response.error && errorMessages[response.error] && (
        <p key={`p3`}>{errorMessages[response.error]}</p>
      )}
      {response && response.objectId && response.objectId !== '0' && (
        <p key={'p4'}>登録された ID: {response.objectId}</p>
      )}
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
