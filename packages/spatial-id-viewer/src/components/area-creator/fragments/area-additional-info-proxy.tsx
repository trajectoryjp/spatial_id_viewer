import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** エリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const AreaAdditionalInfoProxyFragment = memo(() => {
  const store = useStoreApi();
  const areaAdditionalInfo = useStore(store, (s) => s.areas.current.additionalInfo);
  const AreaAdditionalInfoFragment = useStore(store, (s) => s.areaAdditionalInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setAreaAdditionalInfo = useCallback((areaAdditionalInfo: any) => {
    update((s) => (s.areas.current.additionalInfo = areaAdditionalInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.InputTileF));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  return (
    <AreaAdditionalInfoFragment
      areaAdditionalInfo={areaAdditionalInfo}
      setAreaAdditionalInfo={setAreaAdditionalInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
