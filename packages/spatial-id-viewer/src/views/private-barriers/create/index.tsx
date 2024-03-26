import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { BarrierDefinition, createPrivateBarrier, PrivateBarrier } from 'spatial-id-svc-route';

import { AreaCreator, IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { AreaAdditionalInfoFragment } from '#app/views/private-barriers/create/fragments/area-additional-info';
import { WholeAreaInfoFragment } from '#app/views/private-barriers/create/fragments/whole-area-info';
import { AreaAdditionalInfo, WholeAreaInfo } from '#app/views/private-barriers/create/interfaces';

/** モデルを登録する関数を返す React Hook */
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<WholeAreaInfo, AreaAdditionalInfo>) => {
    const payload = {
      id: '0',
      barrierDefinitions: areas.data
        .map((area) =>
          area.spatialIds.map((spatialId) => {
            return {
              spatialIdentification: {
                ID: spatialId,
              },
              risk: (area.additionalInfo as any).risk,
            } as BarrierDefinition;
          })
        )
        .flat(),
      clearance: areas.wholeAreaInfo.clearance,
      status: 'STATUS_DONE',
    } as PrivateBarrier;

    await createPrivateBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });
  }, []);

  return register;
};

const PrivateBarrierCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>プライベートバリア生成</title>
      </Head>
      <AreaCreator<WholeAreaInfo, AreaAdditionalInfo>
        register={register}
        areaAdditionalInfoFragment={AreaAdditionalInfoFragment}
        wholeAreaInfoFragment={WholeAreaInfoFragment}
      />
    </>
  );
};

export default WithAuthGuard(PrivateBarrierCreator);
