import useMergedRef from '@react-hook/merged-ref';
import {
  Cartesian3,
  Credit,
  CreditDisplay,
  Ion,
  JulianDate,
  Math as CesiumMath,
  Viewer as CesiumViewer,
} from 'cesium';
import { forwardRef, memo, ReactNode, useCallback, useRef, useState } from 'react';
import { useInterval, useMount } from 'react-use';
import { CameraFlyTo, CesiumComponentRef, Clock, Viewer as ResiumViewer } from 'resium';

import { HamburgerIcon } from '#app/components/viewer/icons/hamburger-icon';
import { HomeIcon } from '#app/components/viewer/icons/home-icon';
import { gsiMapTerrainProvider } from '#app/components/viewer/provider/gsi-map-terrain';
import { aerialPhotoImageryProvider } from '#app/components/viewer/provider/photo-imagery';
import { Sidebar, SidebarRef } from '#app/components/viewer/sidebar';
import { useCameraInfo } from '#app/stores/camera-info';

export interface ViewerContainerProps {
  children?: ReactNode;
}

export const ViewerContainer = ({ children }: ViewerContainerProps) => {
  return <div className="absolute w-full h-full">{children}</div>;
};

export interface ViewerAdditionalProps {
  sidebarContent?: ReactNode;
}

export type ViewerProps = (typeof ResiumViewer)['defaultProps'] & ViewerAdditionalProps;

/**
 * ビューアーとしての共通機能を実装したコンポーネント
 * (地理院タイル、サイドバー、ホームアイコン、カメラ位置永続化等)
 */
export const Viewer = memo(
  forwardRef<CesiumComponentRef<CesiumViewer>, ViewerProps>(
    ({ children, sidebarContent, ...props }, ref) => {
      const sidebarRef = useRef<SidebarRef>();
      const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();
      const mergedViewerRef = useMergedRef(viewerRef, ref);

      const [initialDestination, setInitialDestination] = useState(defaultDestination);
      const [initialOrientation, setInitialOrientation] = useState(defaultOrientation);

      const setCameraInfo = useCameraInfo((s) => s.setCameraInfo);

      // 初期位置を Local Storage の情報に応じて変更
      useMount(() => {
        const { destination, orientation } = useCameraInfo.getState();
        if (destination) {
          setInitialDestination(new Cartesian3(destination.x, destination.y, destination.z));
        }
        if (orientation) {
          setInitialOrientation(orientation);
        }
      });

      // カメラ位置・角度を保存
      // (camera.changed イベントは発生しないときがあるので時間ごとに実行)
      useInterval(() => {
        if (!viewerRef.current?.cesiumElement) {
          return;
        }

        const camera = viewerRef.current.cesiumElement.camera;
        const destination = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
        const orientation = { heading: camera.heading, pitch: camera.pitch, roll: camera.roll };
        setCameraInfo(destination, orientation);
      }, 500);

      // カメラをデフォルト設定に戻す
      const onHomeButtonClick = useCallback(() => {
        if (!viewerRef.current?.cesiumElement) {
          return;
        }

        viewerRef.current.cesiumElement.camera.flyTo({
          destination: defaultDestination,
          orientation: defaultOrientation,
          duration: 0,
        });
      }, []);

      const onToggleButtonClick = useCallback(() => {
        sidebarRef.current?.toggleSidebar();
      }, []);

      return (
        <>
          <div className="absolute right-0 z-10 flex gap-2 m-2">
            <button className="cesium-button" onClick={onHomeButtonClick}>
              <HomeIcon />
            </button>
            <button className="cesium-button" onClick={onToggleButtonClick}>
              <HamburgerIcon />
            </button>
          </div>
          <Sidebar ref={sidebarRef}>{sidebarContent}</Sidebar>
          <ViewerContainer>
            <ResiumViewer
              ref={mergedViewerRef}
              full
              imageryProvider={aerialPhotoImageryProvider}
              terrainProvider={gsiMapTerrainProvider}
              baseLayerPicker={false}
              geocoder={false}
              animation={false}
              timeline={false}
              homeButton={false}
              navigationHelpButton={false}
              scene3DOnly={true}
              {...props}
            >
              <Clock canAnimate={false} currentTime={julianDate} />
              <CameraFlyTo
                duration={0}
                destination={initialDestination}
                orientation={initialOrientation}
                once={true}
              />
              {children}
            </ResiumViewer>
          </ViewerContainer>
        </>
      );
    }
  )
);

// 光の当たり方を固定する: 日本時間正午
// (日中以外にオブジェクトが暗く表示される対策)
const julianDate = new JulianDate(0, 3600 * (12 + 9));

// デフォルトのカメラ位置・角度
const defaultDestination = Cartesian3.fromDegrees(139.70361, 35.69389, 5000);
const defaultOrientation = {
  heading: CesiumMath.toRadians(0),
  pitch: CesiumMath.toRadians(-90),
  roll: 0,
};

// 有料サービス CESIUM ion への接続はしない
// (ページのレンダリングよりも先に行うためここで実行する)
if (typeof window !== 'undefined' && Ion.defaultAccessToken !== '') {
  // Cesium ion にアクセスしないようアクセストークンを削除する
  Ion.defaultAccessToken = '';

  // Cesium のロゴを ion なしのものに変更する
  CreditDisplay.cesiumCredit = (() => {
    const html = document.createElement('div');
    html.innerHTML = CreditDisplay.cesiumCredit.html;

    const img = html.querySelector('img')!;
    img.src = img.src.replace('ion-credit.png', 'cesium_credit.png');
    img.title = 'Cesium';

    return new Credit(html.innerHTML);
  })();
}
