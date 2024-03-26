import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/route-creator/store';

/** ルート全体に関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const WholeRouteInfoProxyFragment = memo(() => {
  const store = useStoreApi();
  const wholeRouteInfo = useStore(store, (s) => s.waypoints.wholeRouteInfo);
  const WholeRouteInfoFragment = useStore(store, (s) => s.wholeRouteInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setWholeRouteInfo = useCallback((wholeRouteInfo: any) => {
    update((s) => (s.waypoints.wholeRouteInfo = wholeRouteInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.SelectPointOrFeature));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.Register));
  }, []);

  return (
    <WholeRouteInfoFragment
      wholeRouteInfo={wholeRouteInfo}
      setWholeRouteInfo={setWholeRouteInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
