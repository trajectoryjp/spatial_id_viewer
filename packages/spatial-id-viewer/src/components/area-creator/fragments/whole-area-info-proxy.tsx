import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** すべてのエリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const WholeAreaInfoProxyFragment = memo(() => {
  const store = useStoreApi();
  const wholeAreaInfo = useStore(store, (s) => s.areas.wholeAreaInfo);
  const WholeAreaInfoFragment = useStore(store, (s) => s.wholeAreaInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setWholeAreaInfo = useCallback((wholeAreaInfo: any) => {
    update((s) => (s.areas.wholeAreaInfo = wholeAreaInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.Register));
  }, []);

  return (
    <WholeAreaInfoFragment
      wholeAreaInfo={wholeAreaInfo}
      setWholeAreaInfo={setWholeAreaInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
