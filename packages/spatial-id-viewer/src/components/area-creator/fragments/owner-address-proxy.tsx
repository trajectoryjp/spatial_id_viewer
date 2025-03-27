import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** エリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const OwnerAddressProxy = memo(() => {
  const store = useStoreApi();
  const ownerAddressInfo = useStore(store, (s) => s.areas.ownerAddressInfo);
  const OwnerAddressFragment = useStore(store, (s) => s.ownerAddressFragment)!;
  const update = useStore(store, (s) => s.update);

  const setOwnerAddressInfo = useCallback((ownerAddressInfo: any) => {
    update((s) => (s.areas.ownerAddressInfo = ownerAddressInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.Register));
  }, []);

  return (
    <OwnerAddressFragment
      ownerAddressInfo={ownerAddressInfo}
      setOwnerAddressInfo={setOwnerAddressInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
