import { Cartographic, Rectangle, WebMercatorTilingScheme } from 'cesium';
import deepEqual from 'deep-equal';
import { Button, Checkbox, TextInput } from 'flowbite-react';
import {
  ChangeEvent,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useInterval, useUpdateEffect } from 'react-use';
import { useStore } from 'zustand';

import { Figure, getGeoidHeight, SpatialId } from 'spatial-id-converter';
import { RequestTypes } from 'spatial-id-svc-common';

import { Pages, useStoreApi } from '#app/components/area-viewer/store';
import { NavigationButtons } from '#app/components/navigation';
import { useStateRef } from '#app/hooks/state-ref';
import { createFigure } from '#app/utils/create-figure';
import { replaceNaN } from '#app/utils/replace-nan';
import { warnIfTokenExpired } from '#app/utils/warn-if-token-expired';

// 最大値 (範囲が狭い)
const MAX_Z = 22;

// 最小値 (範囲が大きい)
const MIN_Z = 8;

export const useViewingBoxTile = () => {
  const store = useStoreApi();
  const computeViewRectangle = useStore(store, (s) => s.viewerCtrls.computeViewRectangle);
  const getEllipsoidHeight = useStore(store, (s) => s.viewerCtrls.getEllipsoidHeight);
  const [figure, setFigure] = useStateRef<Figure | null>(null);
  const rectRef = useRef<Rectangle>();

  const get = useCallback(async () => {
    const rect = computeViewRectangle();
    if (rect === null) {
      return;
    }

    // 表示範囲に変更がないときは処理しない
    if (deepEqual(rect, rectRef.current)) {
      return figure.current;
    }
    rectRef.current = rect;

    const pointCenter = Rectangle.center(rect);
    const height = await getEllipsoidHeight(pointCenter);
    const geoidHeight = await getGeoidHeight(pointCenter.longitude, pointCenter.latitude);
    const altitude = replaceNaN(height - geoidHeight, 0);
    const point1 = Cartographic.fromRadians(rect.west, rect.north);
    const point2 = Cartographic.fromRadians(rect.east, rect.south);

    // const tubeStart = {
    //   latitude: point1.latitude,
    //   longitude: point1.longitude,
    //   altitude: altitude,
    //   altitudeAttribute: 'ALTITUDE_ATTRIBUTE_ELLIPSOID', // Adjust as needed
    // };

    // const tubeEnd = {
    //   latitude: point2.latitude,
    //   longitude: point2.longitude,
    //   altitude: altitude,
    //   altitudeAttribute: 'ALTITUDE_ATTRIBUTE_ELLIPSOID', // Adjust as needed
    // };

    // point1 と point2 の両方が収まる最小のタイルを取得
    for (let tileZ = MAX_Z; tileZ >= MIN_Z; tileZ--) {
      const tile1 = new WebMercatorTilingScheme().positionToTileXY(point1, tileZ);
      const tile2 = new WebMercatorTilingScheme().positionToTileXY(point2, tileZ);
      if (tile1 && tile2 && tile1.equals(tile2)) {
        const tileF = Math.floor((2 ** tileZ * altitude) / 2 ** 25);

        // const Fig = createFigure(
        //   new SpatialId(tileZ, tileF, tile1.x, tile1.y),
        //   tubeStart,
        //   tubeEnd,
        //   0,
        //   {}
        // );
        const Fig = {
          identification: { ID: new SpatialId(tileZ, tileF, tile1.x, tile1.y) },
        };
        return Fig;
      }
    }

    // 最大の範囲 (MIN_Z) にも収まらなかったときは、中央の座標を含む tileZ: MIN_Z の範囲を取得
    const tileCenter = new WebMercatorTilingScheme().positionToTileXY(pointCenter, MIN_Z);
    const tileF = Math.floor((2 ** MIN_Z * altitude) / 2 ** 25);

    // const Figure = createFigure(
    //   new SpatialId(MIN_Z, tileF, tileCenter.x, tileCenter.y),
    //   tubeStart,
    //   tubeEnd,
    //   0,
    //   {}
    // );
    const Figure = {
      identification: { ID: new SpatialId(MIN_Z, tileF, tileCenter.x, tileCenter.y) },
    };

    return Figure;
  }, []);

  // camera.changed で取れる表示範囲変更イベントでは漏れがあるようなので、タイマーで実装
  useInterval(async () => {
    const newFigure = await get();
    if (!deepEqual(newFigure, figure.current)) {
      setFigure(newFigure);
    }
  }, 500);

  return figure.current;
};

export interface ShowModelsFragmentProps {
  requestType?: string;
  stream?: boolean;
  children?: ReactNode;
}

const States = {
  Default: 0,
  Errored: 1,
} as const;
type States = (typeof States)[keyof typeof States];

/** 複数取得系 API を呼び、モデルを 1 つ表示させる画面 */
export const ShowModelsFragment = memo(
  ({ requestType, stream, children }: ShowModelsFragmentProps) => {
    const store = useStoreApi();
    const startTime = useStore(store, (s) => s.startTime);
    const endTime = useStore(store, (s) => s.endTime);
    const featureName = useStore(store, (s) => s.featureName);
    const isFunctionSelectable = useStore(store, (s) => s.isFunctionSelectable());
    const isAirSpaceSelectable = useStore(store, (s) => s.isAirSpaceSelectable());
    const selectedModelId = useStore(store, (s) => s.selectedCtrls[0]);
    const update = useStore(store, (s) => s.update);
    const errorOutsidePromise = useStore(store, (s) => s.modelCtrls.error);
    const loadModels = useStore(store, (s) => s.modelCtrls.loadModels);
    const loadAirSpaceModels = useStore(store, (s) => s.modelCtrls.loadAirSpaceModels);
    const loadAirSpaceModelsStream = useStore(store, (s) => s.modelCtrls.loadAirSpaceModelsStream);
    const loadModelsRisk = useStore(store, (s) => s.modelCtrls.loadModelsRisk);
    const deleteModel = useStore(store, (s) => s.modelCtrls.deleteModel);
    const hasDeleteModel = !!deleteModel;
    const resetAllModels = useStore(store, (s) => s.resetAllModels);

    const [state, setState] = useState<States>(States.Default);
    const [loading, setLoading] = useState(false);
    const [isTileFAuto, setIsTileFAuto] = useState(true);
    const [tileF, setTileF] = useState(0);
    const vbox = useViewingBoxTile();

    // const [tileF1, setTileF1] = useState<number>(0);
    // const [tileF2, setTileF2] = useState<number>(0);

    useEffect(() => {
      if (isTileFAuto && vbox) {
        setTileF(vbox.identification.ID.f);
      }
    }, [isTileFAuto, vbox]);

    // Promise 外でエラー発生の場合のエラーハンドリング
    useUpdateEffect(() => {
      // null or undefined
      if (errorOutsidePromise == null) {
        return;
      }

      console.error(errorOutsidePromise);
      warnIfTokenExpired(errorOutsidePromise);
      setState(States.Errored);
    }, [errorOutsidePromise]);

    const onLoadModelsClick = async () => {
      resetAllModels();
      const figure = JSON.parse(JSON.stringify(vbox));
      if (!isTileFAuto) {
        figure.identification.ID.f = tileF;
      }
      const spatialID = figure.identification.ID;
      const newSpatialID = new SpatialId(
        spatialID.z,
        spatialID.f,
        spatialID.x,
        spatialID.y
      ).toString();

      // figure.tube.start.altitude = tileF1;
      // figure.tube.end.altitude = tileF2;

      const displayDetails: any = {
        // figure: { ...figure, identification: { ID: newSpatialID } },
        figure: { identification: { ID: newSpatialID } },
      };

      if (requestType === RequestTypes.AIR_SPACE) {
        displayDetails['period'] = {
          startTime: `${startTime}`,
          endTime: `${endTime}`,
        };
      } else if (requestType === RequestTypes.RISK_LEVEL) {
        displayDetails['zoomLevel'] = tileF;
      } else {
        displayDetails['requestType'] = [requestType];
      }

      setLoading(true);
      try {
        if (requestType === RequestTypes.AIR_SPACE && !stream) {
          await loadAirSpaceModels(displayDetails);
        } else if (requestType === RequestTypes.AIR_SPACE && stream) {
          await loadAirSpaceModelsStream(displayDetails);
        } else if (requestType === RequestTypes.RISK_LEVEL) {
          await loadModelsRisk(displayDetails);
        } else {
          await loadModels(displayDetails);
        }
      } catch (e) {
        console.error(e);
        warnIfTokenExpired(e);
        setState(States.Errored);
      } finally {
        setLoading(false);
      }
    };

    const onCancelButtonClick = () => {
      update((d) => (d.page = Pages.SelectFunction));
      update((d) => (d.pageAirSpace = Pages.SelectFunction));
    };

    const onBackButtonClick = () => {
      setState(States.Default);
    };

    const onIsTileFAutoChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setIsTileFAuto(ev.target.checked);
    };

    const onTileFChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setTileF(replaceNaN(ev.target.valueAsNumber, 0));
    };

    // const onTileF1Change = (ev: ChangeEvent<HTMLInputElement>) => {
    //   setTileF1(replaceNaN(ev.target.valueAsNumber, 0));
    // };

    // const onTileF2Change = (ev: ChangeEvent<HTMLInputElement>) => {
    //   setTileF2(replaceNaN(ev.target.valueAsNumber, 0));
    // };

    const onDeleteButtonClick = async () => {
      setLoading(true);
      try {
        await deleteModel(selectedModelId);
        update((s) => (s.selectedCtrls[0] = null));
      } catch (e) {
        console.error(e);
        warnIfTokenExpired(e);
      } finally {
        setLoading(false);
      }
    };

    const automaticId = useId();

    return (
      <>
        {state === States.Errored ? (
          <>
            <p>エラーが発生しました。</p>
            <NavigationButtons>
              <Button color="dark" onClick={onBackButtonClick}>
                戻る
              </Button>
            </NavigationButtons>
          </>
        ) : selectedModelId !== null && requestType !== RequestTypes.AIR_SPACE ? (
          <>
            <p>
              {featureName} {selectedModelId} が選択されています
            </p>
            {hasDeleteModel && (
              <NavigationButtons>
                <Button color="warning" onClick={onDeleteButtonClick} disabled={loading}>
                  削除
                </Button>
              </NavigationButtons>
            )}
          </>
        ) : (
          <>
            <p>描画範囲の{featureName}を表示</p>
            <NavigationButtons>
              {(isFunctionSelectable || isAirSpaceSelectable) && (
                <Button color="dark" onClick={onCancelButtonClick} disabled={loading}>
                  戻る
                </Button>
              )}
              <Button color="dark" onClick={onLoadModelsClick} disabled={!vbox || loading}>
                読み込み
              </Button>
            </NavigationButtons>
            {children}
            {/* <div>
              <p>開始高度と終了高度を入力してください</p>
              <TextInput
                type="number"
                required={true}
                value={tileF1}
                onChange={onTileF1Change}
                min={0}
                max={24}
              />
              <TextInput
                className="mt-2"
                type="number"
                required={true}
                value={tileF2}
                onChange={onTileF2Change}
                min={0}
                max={24}
              />
            </div> */}
            <div>
              高度 (f):
              <Checkbox
                className="ml-2"
                id={automaticId}
                checked={isTileFAuto}
                onChange={onIsTileFAutoChange}
              />
              <label className="ml-2" htmlFor={automaticId}>
                自動 (地表面付近)
              </label>
              {!isTileFAuto && (
                <TextInput type="number" min={0} value={tileF} onChange={onTileFChange} />
              )}
            </div>
            <p>
              取得範囲 (z/f/x/y):{' '}
              {vbox ? (
                <>
                  {vbox.identification.ID.z}/{tileF}/{vbox.identification.ID.x}/
                  {vbox.identification.ID.y}
                </>
              ) : (
                'Loading...'
              )}
            </p>
          </>
        )}
      </>
    );
  }
);
