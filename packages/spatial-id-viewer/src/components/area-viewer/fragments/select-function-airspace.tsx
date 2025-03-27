import { Button } from 'flowbite-react';
import { memo } from 'react';
import { useStore } from 'zustand';

import { PagesAirSpace, useStoreApi } from '#app/components/area-viewer/store';
import { NavigationButtons } from '#app/components/navigation';

/** ID で検索するか、表示範囲で検索するか選択する画面 */
export const SelectAirSpaceFragment = memo(() => {
  const store = useStoreApi();
  const update = useStore(store, (s) => s.update);

  return (
    <>
      <p>取得方法を選択してください</p>
      <NavigationButtons>
        <Button onClick={() => update((s) => (s.pageAirSpace = PagesAirSpace.ShowModels))}>
          単一ビュー
        </Button>
        <Button onClick={() => update((s) => (s.pageAirSpace = PagesAirSpace.ShowModelStream))}>
          ストリームビュー
        </Button>
      </NavigationButtons>
    </>
  );
});
