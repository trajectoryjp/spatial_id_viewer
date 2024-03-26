import { Button } from 'flowbite-react';
import { memo, useState } from 'react';
import { useMount } from 'react-use';
import { useStore } from 'zustand';

import { NavigationButtons } from '#app/components/navigation';
import { InvalidPathError } from '#app/components/route-creator/error';
import { Pages, useStoreApi } from '#app/components/route-creator/store';
import { warnIfTokenExpired } from '#app/utils/warn-if-token-expired';

/** 使用側から渡される登録関数を呼び出す画面 */
export const RegisterFragment = memo(() => {
  const store = useStoreApi();
  const reset = useStore(store, (s) => s.reset);
  const update = useStore(store, (s) => s.update);
  const registerFunc = useStore(store, (s) => s.registerFunc)!;

  const [result, setResult] = useState<boolean>(null);

  const register = async () => {
    setResult(null);

    try {
      await registerFunc(store.getState().waypoints);
      setResult(true);
    } catch (e) {
      if (e instanceof InvalidPathError) {
        update((s) =>
          s.waypoints.updateErroredPathsByIndicies((e as InvalidPathError).pathIndices)
        );
      }
      console.error(e);
      warnIfTokenExpired(e);
      setResult(false);
    }
  };

  useMount(register);

  const onRetryButtonClick = () => {
    update((s) => (s.page = Pages.SelectPointOrFeature));
  };

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
        <Button onClick={onRetryButtonClick}>修正する</Button>
      </NavigationButtons>
    </>
  );
});
