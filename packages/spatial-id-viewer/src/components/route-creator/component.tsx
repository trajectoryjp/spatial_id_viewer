import {
  Color,
  HeightReference,
  ScreenSpaceEventHandler as CesiumScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer as CesiumViewer,
} from 'cesium';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  CesiumComponentRef,
  Entity,
  PointGraphics,
  PolylineGraphics,
  ScreenSpaceEvent,
  ScreenSpaceEventHandler,
} from 'resium';
import { useStore } from 'zustand';

import { Navigation } from '#app/components/navigation';
import { InputAltitudeFragment } from '#app/components/route-creator/fragments/input-altitude';
import { InputDefaultAltitudeFragment } from '#app/components/route-creator/fragments/input-default-altitude';
import { MovePointFragment } from '#app/components/route-creator/fragments/move-point';
import { RegisterFragment } from '#app/components/route-creator/fragments/register';
import { SelectActionForPointFragment } from '#app/components/route-creator/fragments/select-action-for-point';
import { SelectPointOrFeatureFragment } from '#app/components/route-creator/fragments/select-point-or-feature';
import { SplitLineFragment } from '#app/components/route-creator/fragments/split-line';
import { WaypointSpecificInfoProxyFragment } from '#app/components/route-creator/fragments/waypoint-specific-info-proxy';
import { WholeRouteInfoProxyFragment } from '#app/components/route-creator/fragments/whole-route-info-proxy';
import {
  IWaypoints,
  Pages,
  useStoreApi,
  WaypointAdditionalInfoFragmentProps,
  WholeRouteInfoFragmentProps,
  WithStore,
} from '#app/components/route-creator/store';
import { Viewer, ViewerContainer } from '#app/components/viewer';

export interface RouteCreatorProps<WholeRouteInfo = any, WaypointAdditionalInfo = any> {
  waypointAdditionalInfoFragment?: React.FC<
    WaypointAdditionalInfoFragmentProps<WaypointAdditionalInfo>
  >;
  wholeRouteInfoFragment?: React.FC<WholeRouteInfoFragmentProps<WholeRouteInfo>>;
  register: (features: IWaypoints<WholeRouteInfo, WaypointAdditionalInfo>) => Promise<void>;
}

// main
const RouteCreatorLayout = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  WholeRouteInfo extends any = any,
  RouteAdditionalInfo = any
>({
  waypointAdditionalInfoFragment,
  wholeRouteInfoFragment,
  register,
}: RouteCreatorProps<WholeRouteInfo, RouteAdditionalInfo>) => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();

  const store = useStoreApi();
  const page = useStore(store, (s) => s.page);
  const waypoints = useStore(store, (s) => s.waypoints.data);
  const selectedFeature = useStore(store, (s) => s.waypoints.selected);
  const pointingFeature = useStore(store, (s) => s.waypoints.pointing);
  const update = useStore(store, (s) => s.update);

  useEffect(
    () => void update((s) => (s.wholeRouteInfoFragment = wholeRouteInfoFragment)),
    [wholeRouteInfoFragment]
  );
  useEffect(
    () => void update((s) => (s.waypointAdditionalInfoFragment = waypointAdditionalInfoFragment)),
    [waypointAdditionalInfoFragment]
  );
  useEffect(() => void update((s) => (s.registerFunc = register)), [register]);

  const onMapClick = useCallback<(typeof ScreenSpaceEvent)['defaultProps']['action']>((ev) => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    const position = (ev as CesiumScreenSpaceEventHandler.PositionedEvent).position;
    const object = viewerRef.current.cesiumElement.scene.pick(position);
    update((s) => s.waypoints.applyToClicked(object));

    const ray = viewerRef.current.cesiumElement.camera.getPickRay(position);
    const scene = viewerRef.current.cesiumElement.scene;
    const clickedPoint = scene.globe.pick(ray, scene);
    if (clickedPoint !== undefined) {
      update((s) => (s.clickedPoint = clickedPoint));
    }
  }, []);

  const onMapMouseMove = useCallback<(typeof ScreenSpaceEvent)['defaultProps']['action']>((ev) => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    const position = (ev as CesiumScreenSpaceEventHandler.MotionEvent).endPosition;
    const scene = viewerRef.current.cesiumElement.scene;
    const object = scene.pick(position);
    update((s) => s.waypoints.applyToPointing(object));
  }, []);

  return (
    <ViewerContainer>
      <Viewer ref={viewerRef} selectionIndicator={false} infoBox={false}>
        <ScreenSpaceEventHandler>
          <ScreenSpaceEvent action={onMapClick} type={ScreenSpaceEventType.LEFT_CLICK} />
          <ScreenSpaceEvent action={onMapMouseMove} type={ScreenSpaceEventType.MOUSE_MOVE} />
        </ScreenSpaceEventHandler>
        {waypoints.map((p, i) => {
          const id = p.pointId;
          return (
            <Entity key={id} id={id} position={p.point}>
              <PointGraphics
                pixelSize={16}
                color={(() => {
                  if (pointingFeature?.type === 'point' && i === pointingFeature.index) {
                    return Color.ORANGE;
                  }
                  if (selectedFeature?.type === 'point' && i === selectedFeature.index) {
                    return Color.GREENYELLOW;
                  }
                  return Color.YELLOW;
                })()}
              />
            </Entity>
          );
        })}
        {Array.from({ length: waypoints.length - 1 }).map((_, i) => {
          const p1 = waypoints[i];
          const p2 = waypoints[i + 1];
          const id = p1.lineId;
          return (
            <Entity id={id} key={id}>
              <PolylineGraphics
                width={4}
                material={(() => {
                  if (pointingFeature?.type === 'line' && i === pointingFeature.index) {
                    return Color.ORANGE;
                  }
                  if (p1.errored) {
                    return Color.ORANGERED;
                  }
                  return Color.YELLOW;
                })()}
                positions={[p1.point, p2.point]}
              />
            </Entity>
          );
        })}
        {waypoints.map((p) => {
          const id = p.groundPointId;
          return (
            <Entity key={id} id={id} position={p.groundPoint}>
              <PointGraphics
                pixelSize={16}
                color={Color.DARKBLUE}
                heightReference={HeightReference.CLAMP_TO_GROUND}
              />
            </Entity>
          );
        })}
        {Array.from({ length: waypoints.length - 1 }).map((_, i) => {
          const p1 = waypoints[i];
          const p2 = waypoints[i + 1];
          const id = p1.groundLineId;
          return (
            <Entity id={id} key={id}>
              <PolylineGraphics
                width={4}
                material={Color.DARKBLUE}
                positions={[p1.groundPoint, p2.groundPoint]}
                clampToGround={true}
              />
            </Entity>
          );
        })}
      </Viewer>

      <Navigation>
        {page === Pages.InputDefaultAltitude && <InputDefaultAltitudeFragment />}
        {page === Pages.SelectPointOrFeature && <SelectPointOrFeatureFragment />}
        {page === Pages.InputAltitude && <InputAltitudeFragment />}
        {page === Pages.InputWaypointSpecificInfo && <WaypointSpecificInfoProxyFragment />}
        {page === Pages.SplitLine && <SplitLineFragment />}
        {page === Pages.SelectActionForPoint && <SelectActionForPointFragment />}
        {page === Pages.MovePoint && <MovePointFragment />}
        {page === Pages.InputWholeRouteInfo && <WholeRouteInfoProxyFragment />}
        {page === Pages.Register && <RegisterFragment />}
      </Navigation>
    </ViewerContainer>
  );
};

/** ルート生成用共通コンポーネント */
export const RouteCreator = memo(WithStore(RouteCreatorLayout)) as typeof RouteCreatorLayout;
