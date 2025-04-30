import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/route-creator/store';

/** ルート全体に関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const RouteInfoProxyFragment = memo(() => {
  const store = useStoreApi();
  const routeInfo = useStore(store, (s) => s.waypoints.routeInfo);
  const RouteInfoFragment = useStore(store, (s) => s.routeInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setRouteInfo = useCallback((routeInfo: any) => {
    update((s) => (s.waypoints.routeInfo = routeInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.SelectPointOrFeature));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.Register));
  }, []);

  return (
    <RouteInfoFragment
      routeInfo={routeInfo}
      setRouteInfo={setRouteInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
