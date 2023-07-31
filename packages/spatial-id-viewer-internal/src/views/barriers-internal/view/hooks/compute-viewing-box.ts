import { Cartographic, EllipsoidGeodesic, Rectangle, Viewer as CesiumViewer } from 'cesium';
import { RefObject, useCallback } from 'react';
import { CesiumComponentRef } from 'resium';

import { HALF_RECT_SIDE_LENGTH_LIMIT } from '#app-internal/views/barriers-internal/view/constants';

/**
 * 長方形の中心座標と対角座標をもとに、長方形の大きさが一定の範囲に収まるよう対角座標を修正する
 * @param center 中心座標
 * @param diagonal 対角座標
 * @returns 制限後の diagonal
 */
const limitDistance = (center: Cartographic, diagonal: Cartographic) => {
  // 緯度方向を丸める
  const geodesicLat = new EllipsoidGeodesic(
    center,
    Cartographic.fromRadians(center.longitude, diagonal.latitude)
  );
  if (geodesicLat.surfaceDistance > HALF_RECT_SIDE_LENGTH_LIMIT) {
    const point = geodesicLat.interpolateUsingSurfaceDistance(HALF_RECT_SIDE_LENGTH_LIMIT);
    diagonal = Cartographic.fromRadians(diagonal.longitude, point.latitude);
  }

  // 経度方向を丸める
  const geodesicLong = new EllipsoidGeodesic(
    center,
    Cartographic.fromRadians(diagonal.longitude, center.latitude)
  );
  if (geodesicLong.surfaceDistance > HALF_RECT_SIDE_LENGTH_LIMIT) {
    const point = geodesicLong.interpolateUsingSurfaceDistance(HALF_RECT_SIDE_LENGTH_LIMIT);
    diagonal = Cartographic.fromRadians(point.longitude, diagonal.latitude);
  }

  return diagonal;
};

/**
 * 表示範囲の対角座標を取得する関数を返す React Hook
 *
 * (範囲が大きすぎるときは、規定量に丸める)
 *
 * @param viewerRef CesiumViewer の参照
 */
export const useComputeViewingBox = (viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>) => {
  const computeViewingBox = useCallback(() => {
    if (!viewerRef.current?.cesiumElement) {
      return null;
    }

    const rect = viewerRef.current.cesiumElement.camera.computeViewRectangle();
    const center = Rectangle.center(rect);
    const origin = limitDistance(center, Cartographic.fromRadians(rect.west, rect.south));
    const diagonal = limitDistance(center, Cartographic.fromRadians(rect.east, rect.north));

    return { origin, diagonal };
  }, []);

  return computeViewingBox;
};
