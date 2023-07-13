import { Cartographic, sampleTerrain, Viewer as CesiumViewer } from 'cesium';
import { RefObject, useMemo } from 'react';
import { CesiumComponentRef } from 'resium';

import { ViewerControllers } from '#app/components/area-viewer/store';

/**
 * Cesium の機能をラップした関数をつくる React Hook
 * fragments 側から store 経由でアクセスさせるために利用
 */
export const useViewerCtrls = (viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>) => {
  const computeViewRectangle = () => {
    if (!viewerRef.current?.cesiumElement) {
      return null;
    }

    return viewerRef.current.cesiumElement.camera.computeViewRectangle();
  };

  const getEllipsoidHeight = async (point: Cartographic) => {
    if (!viewerRef.current?.cesiumElement) {
      return null;
    }

    const height = (
      await sampleTerrain(viewerRef.current.cesiumElement.terrainProvider, 11, [point])
    )[0].height;

    return height;
  };

  const flyCameraTo = (options: Parameters<CesiumViewer['camera']['flyTo']>[0]) => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    viewerRef.current.cesiumElement.camera.flyTo(options);
  };

  return useMemo(
    () => ({ computeViewRectangle, getEllipsoidHeight, flyCameraTo }),
    []
  ) as ViewerControllers;
};
