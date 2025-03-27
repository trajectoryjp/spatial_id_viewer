import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import {
  BlockedAreaRquest,
  createBlockedArea,
  CreateBlockedAreaRequest,
} from 'spatial-id-svc-area';
import { RestrictionTypes, SpatialIdentification } from 'spatial-id-svc-common';
import { BarrierDefinitionVoxel, BarrierNew } from 'spatial-id-svc-route';

import { AreaCreator, IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { RestrictiontypeFragment } from '#app/views/blocked-areas/create/fragments/restriction-additional-info';
import {
  RestrictionAdditionalInfo,
  WholeAreaInfo,
} from '#app/views/blocked-areas/create/interfaces';

/** モデルを登録する関数を返す React Hook */
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(
    async (areas: IAreas<WholeAreaInfo, never, RestrictionAdditionalInfo>) => {
      const payload = {
        overwrite: false,
        object: {
          restrictedArea: {
            reference: 'BTS84',
            type: areas.restrictionInfo.type,
            voxelValues: areas.data
              .map((area) =>
                area.spatialIds.map((spatialId) => {
                  return {
                    id: {
                      ID: spatialId,
                    },
                  } as BarrierDefinitionVoxel;
                })
              )
              .flat(),
          },
        },
      } as BlockedAreaRquest;

      return await createBlockedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });
    },
    []
  );

  return register;
};

const BlockedAreaCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>制限エリアの予約を生成する</title>
      </Head>
      <AreaCreator<WholeAreaInfo, never, RestrictionAdditionalInfo>
        register={register}
        restrictiontypeFragment={RestrictiontypeFragment}
      />
    </>
  );
};

export default WithAuthGuard(BlockedAreaCreator);
