import { Viewer } from 'cesium';
import Head from 'next/head';
import { RefObject, useCallback } from 'react';
import { useLatest } from 'react-use';
import { CesiumComponentRef } from 'resium';

import { createSignals, OverlayAreaRquest } from 'spatial-id-svc-area';

import { IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { AreaCreator } from '#app/components/tab-area-creator';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { RsiInfoFragment } from '#app/views/mobile/create/fragments/rsi-info-fragment';
import { wifiInfo } from '#app/views/mobile/create/interfaces';
import { WifiInfoFragment } from '#app/views/wifi/create/fragments/wifi-info-fragment';

interface SignalVoxel {
  id: {
    ID: 'string';
  };
  RSI: number;
}
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<wifiInfo>) => {
    const payload = {
      overwrite: false,
      object: {
        microwave: {
          wifi: {
            reference: 'wifiInfo',
            ssid: areas.wifiInfo.ssid,
            voxelValues: areas.data
              .map((area) =>
                area.spatialIds.map((spatialId) => {
                  return {
                    id: {
                      ID: spatialId,
                    },
                    RSI: area.rsiInfo.rsi,
                  } as SignalVoxel;
                })
              )
              .flat(),
          },
        },
      },
    } as OverlayAreaRquest;

    return await createSignals({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });
  }, []);

  return register;
};

interface WifiProps {
  reference: RefObject<CesiumComponentRef<Viewer>>;
}

const WifiAreaCreator = ({ reference }: WifiProps) => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>電子レンジの詳細を生成する</title>
      </Head>
      <AreaCreator<wifiInfo>
        register={register}
        wifiInfoFragment={WifiInfoFragment}
        rsiInfoFragment={RsiInfoFragment}
        reference={reference}
      />
    </>
  );
};
export default WithAuthGuard(WifiAreaCreator);
