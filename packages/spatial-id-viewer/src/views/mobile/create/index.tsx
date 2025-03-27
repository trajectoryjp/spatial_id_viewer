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
import { MobileInfoFragment } from '#app/views/mobile/create/fragments/mobile-info-fragment';
import { RsiInfoFragment } from '#app/views/mobile/create/fragments/rsi-info-fragment';
import { mobileInfo } from '#app/views/mobile/create/interfaces';

interface SignalVoxel {
  id: {
    ID: 'string';
  };
  RSI: number;
}
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<mobileInfo>) => {
    const payload = {
      overwrite: false,
      object: {
        microwave: {
          mobile: {
            reference: 'mobileInfo',
            plmnId: {
              mobileCountryCode: areas.mobileInfo.mobileCountryCode,
              mobileNetworkCode: areas.mobileInfo.mobileNetworkCode,
            },
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

interface MobileProps {
  reference: RefObject<CesiumComponentRef<Viewer>>;
}

const MobileAreaCreator = ({ reference }: MobileProps) => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>電子レンジの詳細を生成する</title>
      </Head>
      <AreaCreator<mobileInfo>
        register={register}
        mobileInfoFragment={MobileInfoFragment}
        rsiInfoFragment={RsiInfoFragment}
        reference={reference}
      />
    </>
  );
};
export default WithAuthGuard(MobileAreaCreator);
