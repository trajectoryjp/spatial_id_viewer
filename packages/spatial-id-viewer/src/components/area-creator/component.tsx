import {
  Cesium3DTileStyle,
  Color,
  ScreenSpaceEventHandler as CesiumScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer as CesiumViewer,
} from 'cesium';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  CesiumComponentRef,
  Entity,
  PointGraphics,
  PolygonGraphics,
  ScreenSpaceEvent,
  ScreenSpaceEventHandler,
} from 'resium';
import { useStore } from 'zustand';

import { IAreas } from '#app/components/area-creator';
import { AreaAdditionalInfoProxyFragment } from '#app/components/area-creator/fragments/area-additional-info-proxy';
import { InputTileFFragment } from '#app/components/area-creator/fragments/input-tile-f';
import { InputTileZFragment } from '#app/components/area-creator/fragments/input-tile-z';
import { RegisterFragment } from '#app/components/area-creator/fragments/register';
import { SelectAddOrSendFragment } from '#app/components/area-creator/fragments/select-add-or-send';
import { SelectPointFragment } from '#app/components/area-creator/fragments/select-point';
import { WholeAreaInfoProxyFragment } from '#app/components/area-creator/fragments/whole-area-info-proxy';
import {
  AreaAdditionalInfoFragmentProps,
  Pages,
  useStoreApi,
  WholeAreaInfoFragmentProps,
  WithStore,
} from '#app/components/area-creator/store';
import { Navigation } from '#app/components/navigation';
import { Viewer, ViewerContainer } from '#app/components/viewer';
import { CuboidCollectionModel } from '#app/components/viewer/cuboid-collection-model';

export interface AreaCreatorProps<WholeAreaInfo = any, AreaAdditionalInfo = any> {
  /** 単一エリアの追加の情報入力が必要な場合、その入力欄コンポーネント */
  areaAdditionalInfoFragment?: React.FC<AreaAdditionalInfoFragmentProps<AreaAdditionalInfo>>;
  /** エリア全体で追加の情報入力が必要な場合、その入力欄コンポーネント */
  wholeAreaInfoFragment?: React.FC<WholeAreaInfoFragmentProps<WholeAreaInfo>>;
  /** エリア登録を行う関数 */
  register: (areas: IAreas<WholeAreaInfo, AreaAdditionalInfo>) => Promise<void>;
}

// main
const AreaCreatorLayout = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  WholeAreaInfo extends any = any,
  AreaAdditionalInfo = any
>({
  areaAdditionalInfoFragment,
  wholeAreaInfoFragment,
  register,
}: AreaCreatorProps<WholeAreaInfo, AreaAdditionalInfo>) => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();

  const store = useStoreApi();
  const page = useStore(store, (s) => s.page);
  const areas = useStore(store, (s) => s.areas);
  const currentArea = useStore(store, (s) => s.areas.current);
  const update = useStore(store, (s) => s.update);

  useEffect(
    () => void update((s) => (s.wholeAreaInfoFragment = wholeAreaInfoFragment)),
    [wholeAreaInfoFragment]
  );
  useEffect(
    () => void update((s) => (s.areaAdditionalInfoFragment = areaAdditionalInfoFragment)),
    [areaAdditionalInfoFragment]
  );
  useEffect(() => void update((s) => (s.registerFunc = register)), [register]);

  const onMapClick = useCallback<(typeof ScreenSpaceEvent)['defaultProps']['action']>((ev) => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    const position = (ev as CesiumScreenSpaceEventHandler.PositionedEvent).position;
    const ray = viewerRef.current.cesiumElement.camera.getPickRay(position);
    const scene = viewerRef.current.cesiumElement.scene;
    const clickedPoint = scene.globe.pick(ray, scene);
    if (clickedPoint === undefined) {
      return;
    }

    update((s) => (s.clickedPoint = clickedPoint));
  }, []);

  useEffect(() => {
    console.log(areas);
  }, [areas]);

  return (
    <ViewerContainer>
      <Viewer ref={viewerRef}>
        <ScreenSpaceEventHandler>
          <ScreenSpaceEvent action={onMapClick} type={ScreenSpaceEventType.LEFT_CLICK} />
        </ScreenSpaceEventHandler>
        {currentArea?.point1 && (
          <Entity position={currentArea.point1}>
            <PointGraphics pixelSize={16} color={Color.YELLOW} />
          </Entity>
        )}
        {currentArea?.point2 && (
          <Entity position={currentArea.point2}>
            <PointGraphics pixelSize={16} color={Color.YELLOW} />
          </Entity>
        )}
        {areas.data
          .map((area, i) => {
            return area.polygons ? (
              <Entity key={i}>
                <PolygonGraphics
                  hierarchy={area.polygons as any} // WORKAROUND
                  height={area.polygonsHeight}
                  material={Color.GREEN}
                />
              </Entity>
            ) : null;
          })
          .filter((area) => area !== null)}
        {areas.data
          .map((area, i) => {
            return area.model ? (
              <CuboidCollectionModel key={i} data={area.model} style={tilesetStyle} />
            ) : null;
          })
          .filter((area) => area !== null)}
      </Viewer>

      <Navigation>
        {page === Pages.SelectPoint1 && <SelectPointFragment point={1} />}
        {page === Pages.SelectPoint2 && <SelectPointFragment point={2} />}
        {page === Pages.InputTileZ && <InputTileZFragment />}
        {page === Pages.InputTileF && <InputTileFFragment />}
        {page === Pages.InputAreaSpecificInfo && <AreaAdditionalInfoProxyFragment />}
        {page === Pages.SelectAddOrSend && <SelectAddOrSendFragment />}
        {page === Pages.InputWholeAreaInfo && <WholeAreaInfoProxyFragment />}
        {page === Pages.Register && <RegisterFragment />}
      </Navigation>
    </ViewerContainer>
  );
};

/** エリア作成の共通コンポーネント */
export const AreaCreator = memo(WithStore(AreaCreatorLayout)) as typeof AreaCreatorLayout;

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});
