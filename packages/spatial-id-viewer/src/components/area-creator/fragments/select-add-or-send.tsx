import { Button } from 'flowbite-react';
import { memo } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';
import { NavigationButtons } from '#app/components/navigation';

/** 範囲をさらに追加するか、確定させるかを選択する画面 */
export const SelectAddOrSendFragment = memo(() => {
  const store = useStoreApi();
  const nextPage = useStore(store, (s) =>
    s.wholeAreaInfoFragment ? Pages.InputWholeAreaInfo : Pages.Register
  );
  const update = useStore(store, (s) => s.update);

  const onAddAreaClick = () => {
    update((s) => {
      s.areas.unselect();
      s.page = Pages.SelectPoint1;
    });
  };

  const onRegisterClick = () => {
    update((s) => (s.page = nextPage));
  };

  return (
    <>
      <p>範囲を追加するか、完了して登録に進むか選択してください</p>
      <NavigationButtons>
        <Button color="dark" onClick={onAddAreaClick}>
          範囲を追加する
        </Button>
        <Button onClick={onRegisterClick}>
          登録{nextPage === Pages.InputWholeAreaInfo && 'にすすむ'}
        </Button>
      </NavigationButtons>
    </>
  );
});
