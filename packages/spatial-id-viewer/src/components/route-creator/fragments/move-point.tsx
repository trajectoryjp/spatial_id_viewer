import { Button } from 'flowbite-react';
import { memo } from 'react';
import { useUpdateEffect } from 'react-use';
import { useStore } from 'zustand';

import { NavigationButtons } from '#app/components/navigation';
import { Pages, useStoreApi } from '#app/components/route-creator/store';

/** 点の移動画面 */
export const MovePointFragment = memo(() => {
  const store = useStoreApi();
  const clickedPoint = useStore(store, (s) => s.clickedPoint);
  const update = useStore(store, (s) => s.update);

  // クリック時: 点の移動
  useUpdateEffect(() => {
    update(async (s) => {
      await s.waypoints.current.setGroundPoint(clickedPoint);
      s.waypoints.unsetErrorOnCurrentPaths();
      s.page = Pages.InputDefaultAltitude;
    });
  }, [clickedPoint]);

  const onBackButtonClick = () => {
    update((s) => {
      s.waypoints.selected = null;
      s.page = Pages.SelectPointOrFeature;
    });
  };

  return (
    <>
      <p>移動先の地表面をクリックしてください</p>
      <NavigationButtons>
        <Button color="dark" onClick={onBackButtonClick}>
          キャンセル
        </Button>
      </NavigationButtons>
    </>
  );
});
