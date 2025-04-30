import { Viewer } from 'cesium';
import Head from 'next/head';
import { RefObject, useCallback, useEffect } from 'react';
import { useLatest } from 'react-use';
import { CesiumComponentRef } from 'resium';

import { createWeather, OverlayAreaRquest } from 'spatial-id-svc-area';

import { IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { AreaCreator } from '#app/components/tab-area-creator';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { WeatherForecastInfo } from '#app/views/weather/create/interfaces';
import { WeatherForecastInfoFragment } from '#app/views/WeatherForecast/create/fragments/weather-forecast-info-fragment';

interface ForecastVoxel {
  id: {
    ID: 'string';
  };
  forecast: WeatherForecastInfo;
}
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<WeatherForecastInfo>) => {
    const payload = {
      overwrite: false,
      object: {
        weatherForecast: {
          reference: 'WeatherForecastInfo',
          voxelValues: areas.data
            .map((area) =>
              area.spatialIds.map((spatialId) => {
                return {
                  id: {
                    ID: spatialId,
                  },
                  forecast: area.weatherForecastInfo,
                } as ForecastVoxel;
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

const WeatherForecastAreaCreator = ({ reference }: WeatherRiskProps) => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>天気の詳細を生成する</title>
      </Head>
      <AreaCreator<WeatherForecastInfo>
        register={register}
        weatherForecastInfoFragment={WeatherForecastInfoFragment}
        reference={reference}
      />
    </>
  );
};
export default WithAuthGuard(WeatherForecastAreaCreator);
