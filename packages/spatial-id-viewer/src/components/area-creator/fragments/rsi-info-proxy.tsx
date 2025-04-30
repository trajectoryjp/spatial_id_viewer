import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** エリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const RsiInfoFragmentProxy = memo(() => {
  const store = useStoreApi();
  const rsiInfo = useStore(store, (s) => s.areas.current.rsiInfo);
  const RsiInfoFragment = useStore(store, (s) => s.rsiInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setRsiInfo = useCallback((rsiInfo: any) => {
    update((s) => (s.areas.current.rsiInfo = rsiInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.InputTileF));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  return (
    <RsiInfoFragment
      rsiInfo={rsiInfo}
      setRsiInfo={setRsiInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
