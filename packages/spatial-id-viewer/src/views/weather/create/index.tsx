import { Viewer } from 'cesium';
import Head from 'next/head';
import { RefObject, useCallback } from 'react';
import { useLatest } from 'react-use';
import { CesiumComponentRef } from 'resium';

import { createWeather, OverlayAreaRquest } from 'spatial-id-svc-area';

import { IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { AreaCreator } from '#app/components/tab-area-creator';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { CurrentWeatherInfoFragment } from '#app/views/weather/create/fragments/current-weather-info-fragment';
import { CurrentWeatherInfo } from '#app/views/weather/create/interfaces';

interface CurrentWeatherVoxel {
  id: {
    ID: 'string';
  };
  currentWeather: CurrentWeatherInfo;
}
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<CurrentWeatherInfo>) => {
    const payload = {
      overwrite: false,
      object: {
        weather: {
          reference: 'CurrentWeatherInfo',
          voxelValues: areas.data
            .map((area) =>
              area.spatialIds.map((spatialId) => {
                return {
                  id: {
                    ID: spatialId,
                  },
                  currentWeather: area.currentWeatherInfo,
                } as CurrentWeatherVoxel;
              })
            )
            .flat(),
        },
      },
    } as OverlayAreaRquest;

    return await createWeather({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });
  }, []);

  return register;
};

interface WeatherRiskProps {
  reference: RefObject<CesiumComponentRef<Viewer>>;
}

const CurrentWeatherAreaCreator = ({ reference }: WeatherRiskProps) => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>天気の詳細を生成する</title>
      </Head>
      <AreaCreator<CurrentWeatherInfo>
        register={register}
        currentWeatherInfoFragment={CurrentWeatherInfoFragment}
        reference={reference}
      />
    </>
  );
};
export default WithAuthGuard(CurrentWeatherAreaCreator);
