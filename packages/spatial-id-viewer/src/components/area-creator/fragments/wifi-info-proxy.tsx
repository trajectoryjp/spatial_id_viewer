import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** エリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const WifiInfoFragmentProxy = memo(() => {
  const store = useStoreApi();
  const wifiInfo = useStore(store, (s) => s.areas.wifiInfo);
  const WifiInfoFragment = useStore(store, (s) => s.wifiInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setWifiInfo = useCallback((wifiInfo: any) => {
    update((s) => (s.areas.wifiInfo = wifiInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.Register));
  }, []);

  return (
    <WifiInfoFragment
      wifiInfo={wifiInfo}
      setWifiInfo={setWifiInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
