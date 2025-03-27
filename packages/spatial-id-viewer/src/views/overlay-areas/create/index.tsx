import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { AreaVoxel, createOverlayArea, OverlayAreaRquest } from 'spatial-id-svc-area';

import { AreaCreator, IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { OwnerAddressFragment } from '#app/views/overlay-areas/create/fragments/owner-address-info-fragment';
import { OwnerAddressInfo } from '#app/views/overlay-areas/create/interfaces';

const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<OwnerAddressInfo>) => {
    const payload = {
      overwrite: false,
      object: {
        overlayArea: {
          ownerAddress: {
            [areas.ownerAddressInfo.type]: areas.ownerAddressInfo.input,
          },
          voxelValues: areas.data
            .map((area) =>
              area.spatialIds.map((spatialId) => {
                return {
                  id: {
                    ID: spatialId,
                  },
                } as AreaVoxel;
              })
            )
            .flat(),
        },
      },
    } as OverlayAreaRquest;

    return await createOverlayArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });
  }, []);

  return register;
};

const OverlayAreaCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>オーバーレイエリアの予約を生成する</title>
      </Head>
      <AreaCreator<OwnerAddressInfo>
        register={register}
        ownerAddressFragment={OwnerAddressFragment}
      />
    </>
  );
};
export default WithAuthGuard(OverlayAreaCreator);
