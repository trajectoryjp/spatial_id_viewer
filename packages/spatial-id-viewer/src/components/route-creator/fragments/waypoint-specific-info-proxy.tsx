import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/route-creator/store';

/** 地点に関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const WaypointSpecificInfoProxyFragment = memo(() => {
  const store = useStoreApi();
  const additionalInfo = useStore(store, (s) => s.waypoints.current.additionalInfo);
  const WaypointAdditionalInfoFragment = useStore(store, (s) => s.waypointAdditionalInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setAdditionalInfo = useCallback((additionalInfo: any) => {
    update((s) => (s.waypoints.current.additionalInfo = additionalInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.InputAltitude));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.SelectPointOrFeature));
  }, []);

  return (
    <WaypointAdditionalInfoFragment
      waypointAdditionalInfo={additionalInfo}
      setWaypointAdditionalInfo={setAdditionalInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
