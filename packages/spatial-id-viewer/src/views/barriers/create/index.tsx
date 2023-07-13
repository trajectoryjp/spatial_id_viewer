import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { Barrier, BarrierDefinition, createBarrier } from 'spatial-id-svc-route';

import { AreaCreator, IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { AreaAdditionalInfoFragment } from '#app/views/barriers/create/fragments/area-additional-info';
import { AreaAdditionalInfo } from '#app/views/barriers/create/interfaces';

/** モデルを登録する関数を返す React Hook */
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<never, AreaAdditionalInfo>) => {
    const payload = {
      id: '0',
      barrierDefinitions: areas.data
        .map((area) =>
          area.spatialIds.map((spatialId) => {
            return {
              spatialIdentification: {
                ID: spatialId,
              },
              risk: area.additionalInfo.risk,
            } as BarrierDefinition;
          })
        )
        .flat(),
      status: 'STATUS_DONE',
    } as Barrier;

    await createBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });
  }, []);

  return register;
};

const PrivateBarrierCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>パブリックバリア生成</title>
      </Head>
      <AreaCreator<never, AreaAdditionalInfo>
        register={register}
        areaAdditionalInfoFragment={AreaAdditionalInfoFragment}
      />
    </>
  );
};

export default WithAuthGuard(PrivateBarrierCreator);
