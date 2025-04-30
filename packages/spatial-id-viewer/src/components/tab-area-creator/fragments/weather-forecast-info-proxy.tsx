import { memo, useCallback } from 'react';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';

/** エリアに関する追加の情報が必要なとき、使用側から渡される入力欄コンポーネントを表示させる画面 */
export const WeatherForecastInfoProxy = memo(() => {
  const store = useStoreApi();
  const weatherForecastInfo = useStore(store, (s) => s.areas.current.weatherForecastInfo);
  const WeatherForecastInfoFragment = useStore(store, (s) => s.weatherForecastInfoFragment)!;
  const update = useStore(store, (s) => s.update);

  const setWeatherForecastInfo = useCallback((weatherForecastInfo: any) => {
    update((s) => (s.areas.current.weatherForecastInfo = weatherForecastInfo));
  }, []);

  const navigatePrev = useCallback(() => {
    update((s) => (s.page = Pages.InputTileF));
  }, []);

  const navigateNext = useCallback(() => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  }, []);

  return (
    <WeatherForecastInfoFragment
      weatherForecastInfo={weatherForecastInfo}
      setWeatherForecastInfo={setWeatherForecastInfo}
      navigatePrev={navigatePrev}
      navigateNext={navigateNext}
    />
  );
});
