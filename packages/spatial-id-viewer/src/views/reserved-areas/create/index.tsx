import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import {
  CreateEmergencyAreaRequest,
  createReservedArea,
  CreateReservedAreaRequest,
  EmergencyAreaVoxels,
} from 'spatial-id-svc-area';
import { SpatialIdentification } from 'spatial-id-svc-common';

import { AreaCreator, IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { WholeAreaInfoFragment } from '#app/views/reserved-areas/create/fragments/whole-area-info';
import { WholeAreaInfo } from '#app/views/reserved-areas/create/interfaces';

/** モデルを登録する関数を返す React Hook */
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<WholeAreaInfo, never>) => {
    const payload = {
      overwrite: false,
      object: {
        emergencyArea: {
          reference: 'EmergencyArea',
          voxelValues: areas.data
            .map((area) =>
              area.spatialIds.map((spatialId) => {
                return {
                  id: {
                    ID: spatialId,
                  },
                  vacant: true,
                } as EmergencyAreaVoxels;
              })
            )
            .flat(),
        },
      },
    } as CreateEmergencyAreaRequest;

    return await createReservedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });
  }, []);

  return register;
};

const ReservedAreaCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>緊急エリア予約生成</title>
      </Head>
      <AreaCreator<WholeAreaInfo, never>
        register={register}
        // wholeAreaInfoFragment={WholeAreaInfoFragment}
      />
    </>
  );
};

export default WithAuthGuard(ReservedAreaCreator);
