import { Button } from 'flowbite-react';
import { memo, useRef } from 'react';
import { useUpdateEffect } from 'react-use';
import { useStore } from 'zustand';

import { NavigationButtons } from '#app/components/navigation';
import { Pages, useStoreApi } from '#app/components/route-creator/store';

/** 地表面・点・線をクリックして次に行う操作を決定する画面 */
export const SelectPointOrFeatureFragment = memo(() => {
  const store = useStoreApi();
  const hasWaypoint = useStore(store, (s) => s.waypoints.data.length > 0);
  const hasLine = useStore(store, (s) => s.waypoints.data.length >= 2);
  const hasWholeRouteInfoFragment = useStore(store, (s) => !!s.wholeRouteInfoFragment);
  const clickedFeature = useStore(store, (s) => s.waypoints.clicked);
  const clickedPoint = useStore(store, (s) => s.clickedPoint);
  const update = useStore(store, (s) => s.update);

  const actionDetermined = useRef(false);

  // オブジェクトのクリック時: 選択状態として反映する
  useUpdateEffect(() => {
    if (clickedFeature === null) {
      return;
    }

    actionDetermined.current = true;

    update((s) => {
      s.waypoints.selected = s.waypoints.clicked;
      s.page = {
        point: Pages.SelectActionForPoint,
        line: Pages.SplitLine,
      }[clickedFeature.type];
    });
  }, [clickedFeature]);

  // オブジェクト以外のクリック時: 点の追加
  useUpdateEffect(() => {
    // オブジェクトがクリックされていたときは処理しない
    if (actionDetermined.current) {
      return;
    }

    update(async (s) => {
      await s.waypoints.addNewWaypoint(clickedPoint);
      s.page = Pages.InputAltitude;
    });
  }, [clickedPoint]);

  const onCompleteButtonClick = async () => {
    update(
      (s) => (s.page = hasWholeRouteInfoFragment ? Pages.InputWholeRouteInfo : Pages.Register)
    );
  };

  return hasWaypoint ? (
    <>
      <p>地点をクリックして操作を選択してください</p>
      <ul>
        <li>地表面: 新たな点の追加</li>
        <li>点: 位置の変更・削除</li>
        {hasLine && <li>辺: 新たな点を途中に挿入</li>}
      </ul>
      <NavigationButtons>
        <Button onClick={onCompleteButtonClick}>
          登録{hasWholeRouteInfoFragment && 'にすすむ'}
        </Button>
      </NavigationButtons>
    </>
  ) : (
    <p>地表面の地点を選択してください</p>
  );
});
