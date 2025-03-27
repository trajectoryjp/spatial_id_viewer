import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** エリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const MobileInfoFragmentProxy = memo(() => {
  const store = useStoreApi();
  const mobileInfo = useStore(store, (s) => s.areas.mobileInfo);
  const MobileInfoFragment = useStore(store, (s) => s.mobileInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setMobileInfo = useCallback((mobileInfo: any) => {
    update((s) => (s.areas.mobileInfo = mobileInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.Register));
  }, []);

  return (
    <MobileInfoFragment
      mobileInfo={mobileInfo}
      setMobileInfo={setMobileInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
