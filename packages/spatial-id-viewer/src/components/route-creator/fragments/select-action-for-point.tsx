import { Button } from 'flowbite-react';
import { memo } from 'react';
import { useUpdateEffect } from 'react-use';
import { useStore } from 'zustand';

import { NavigationButtons } from '#app/components/navigation';
import { Pages, useStoreApi } from '#app/components/route-creator/store';

/** 点に行う操作を選択する画面 */
export const SelectActionForPointFragment = memo(() => {
  const store = useStoreApi();
  const clickedPoint = useStore(store, (s) => s.clickedPoint);
  const update = useStore(store, (s) => s.update);

  // クリック時: 点の追加
  useUpdateEffect(() => {
    update(async (s) => {
      await s.waypoints.addNewWaypoint(clickedPoint);
      s.page = Pages.InputAltitude;
    });
  }, [clickedPoint]);

  const onBackButtonClick = () => {
    update((s) => {
      s.waypoints.selected = null;
      s.page = Pages.SelectPointOrFeature;
    });
  };

  const onMoveButtonClick = () => {
    update((s) => (s.page = Pages.MovePoint));
  };

  const onChangeAltitudeButtonClick = () => {
    update((s) => (s.page = Pages.InputAltitude));
  };

  const onRemoveButtonClick = () => {
    update((s) => {
      s.waypoints.removeCurrentWaypoint();
      s.page = Pages.SelectPointOrFeature;
    });
  };

  return (
    <>
      <p>追加済みの地点が選択されました</p>
      <NavigationButtons>
        <Button color="dark" onClick={onBackButtonClick}>
          戻る
        </Button>
        <Button onClick={onMoveButtonClick}>移動</Button>
        <Button onClick={onChangeAltitudeButtonClick}>標高変更</Button>
        <Button color="failure" onClick={onRemoveButtonClick}>
          削除
        </Button>
      </NavigationButtons>
    </>
  );
});
