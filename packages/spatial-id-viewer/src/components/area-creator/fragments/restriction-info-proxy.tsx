import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** エリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const RestrictionInfoProxy = memo(() => {
  const store = useStoreApi();
  const restrictionInfo = useStore(store, (s) => s.areas.restrictionInfo);
  const RestrictionInfoFragment = useStore(store, (s) => s.restrictionInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setRestrictionAdditionalInfo = useCallback((restrictionInfo: any) => {
    update((s) => (s.areas.restrictionInfo = restrictionInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = s.wholeAreaInfoFragment ? Pages.InputWholeAreaInfo : Pages.Register));
  }, []);

  return (
    <RestrictionInfoFragment
      restrictionInfo={restrictionInfo}
      setRestrictionAdditionalInfo={setRestrictionAdditionalInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
