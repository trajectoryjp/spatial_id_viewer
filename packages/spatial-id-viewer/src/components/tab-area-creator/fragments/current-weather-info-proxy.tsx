import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** エリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const CurrentWeatherInfoProxy = memo(() => {
  const store = useStoreApi();
  const currentWeatherInfo = useStore(store, (s) => s.areas.current.currentWeatherInfo);
  const CurrentWeatherInfoFragment = useStore(store, (s) => s.currentWeatherInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setCurrentWeatherInfo = useCallback((currentWeatherInfo: any) => {
    update((s) => (s.areas.current.currentWeatherInfo = currentWeatherInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.InputTileF));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  return (
    <CurrentWeatherInfoFragment
      currentWeatherInfo={currentWeatherInfo}
      setCurrentWeatherInfo={setCurrentWeatherInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
