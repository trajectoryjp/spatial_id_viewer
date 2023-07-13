import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { createBlockedArea, CreateBlockedAreaRequest } from 'spatial-id-svc-area';
import { SpatialIdentification } from 'spatial-id-svc-common';

import { AreaCreator, IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { WholeAreaInfoFragment } from '#app/views/blocked-areas/create/fragments/whole-area-info';
import { WholeAreaInfo } from '#app/views/blocked-areas/create/interfaces';

/** モデルを登録する関数を返す React Hook */
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<WholeAreaInfo, never>) => {
    const payload = {
      blockedArea: {
        id: '0',
        spatialIdentifications: areas.data
          .map((area) =>
            area.spatialIds.map((spatialId) => {
              return {
                ID: spatialId,
              } as SpatialIdentification;
            })
          )
          .flat(),
        startTime: dateToStringUnixTime(areas.wholeAreaInfo.startTime),
        endTime: dateToStringUnixTime(areas.wholeAreaInfo.endTime),
      },
    } as CreateBlockedAreaRequest;

    await createBlockedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });
  }, []);

  return register;
};

const BlockedAreaCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>割込禁止エリア予約生成</title>
      </Head>
      <AreaCreator<WholeAreaInfo, never>
        register={register}
        wholeAreaInfoFragment={WholeAreaInfoFragment}
      />
    </>
  );
};

export default WithAuthGuard(BlockedAreaCreator);
