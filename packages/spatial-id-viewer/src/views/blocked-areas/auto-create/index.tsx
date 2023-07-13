import { Cartesian3, Cesium3DTileStyle, Viewer as CesiumViewer } from 'cesium';
import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { useLatest } from 'react-use';
import { CesiumComponentRef } from 'resium';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { WithAuthGuard } from '#app/components/auth-guard';
import { Navigation } from '#app/components/navigation';
import { Viewer, ViewerContainer } from '#app/components/viewer';
import { CuboidCollectionModel } from '#app/components/viewer/cuboid-collection-model';
import { SettingsFragment } from '#app/views/blocked-areas/auto-create/fragments/settings';
import { WatchingFragment } from '#app/views/blocked-areas/auto-create/fragments/watching';
import { Pages, useStoreApi, WithStore } from '#app/views/blocked-areas/auto-create/store';

const BlockedAreaAutoCreator = () => {
  const store = useStoreApi();
  const page = useStore(store, (s) => s.page);
  const followCamera = useLatest(useStore(store, (s) => s.settings.followCamera));
  const { model, currentPosition } = useStore(store, (s) => s.viewerData, shallow);

  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();

  // カメラ位置自動追従
  useEffect(() => {
    if (currentPosition === null || !viewerRef.current?.cesiumElement || !followCamera.current) {
      return;
    }

    const camera = viewerRef.current.cesiumElement.camera;
    camera.flyTo({
      destination: Cartesian3.fromDegrees(
        currentPosition.coords.longitude,
        currentPosition.coords.latitude,
        camera.positionCartographic.height
      ),
    });
  }, [currentPosition]);

  return (
    <>
      <Head>
        <title>割込禁止エリア自動生成</title>
      </Head>
      <ViewerContainer>
        <Viewer ref={viewerRef}>
          {model && <CuboidCollectionModel data={model} style={tilesetStyle} />}
        </Viewer>
        <Navigation>
          {page === Pages.Settings && <SettingsFragment />}
          {page === Pages.Watching && <WatchingFragment />}
        </Navigation>
      </ViewerContainer>
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default WithAuthGuard(WithStore(BlockedAreaAutoCreator));
