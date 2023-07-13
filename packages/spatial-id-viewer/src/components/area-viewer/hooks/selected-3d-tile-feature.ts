import {
  Cesium3DTileFeature,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer as CesiumViewer,
} from 'cesium';
import { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { CesiumComponentRef } from 'resium';

const get3DTileFeatureId = (object: any): string => {
  if (object instanceof Cesium3DTileFeature) {
    return object.getProperty('id') as string;
  }

  return null;
};

/** クリックされたモデルを判別する React Hook */
export const useSelected3DTileFeature = (
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>
): [string, () => void] => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    const eventHandler = new ScreenSpaceEventHandler(viewerRef.current.cesiumElement.canvas);
    eventHandler.setInputAction(onMapClick, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      eventHandler.destroy();
    };
  }, []);

  const onMapClick = (ev: ScreenSpaceEventHandler.PositionedEvent) => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    const position = ev.position;
    const scene = viewerRef.current.cesiumElement.scene;
    const object = scene.pick(position);
    const featureId = get3DTileFeatureId(object);
    setSelectedFeatureId(featureId);
  };

  const unselect = useCallback(() => {
    setSelectedFeatureId(null);
    viewerRef.current.cesiumElement.selectedEntity = undefined;
  }, []);

  return useMemo(() => [selectedFeatureId, unselect], [selectedFeatureId]);
};
