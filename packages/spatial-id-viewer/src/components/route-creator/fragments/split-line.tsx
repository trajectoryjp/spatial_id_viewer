import { Button } from 'flowbite-react';
import { memo } from 'react';
import { useUpdateEffect } from 'react-use';
import { useStore } from 'zustand';

import { NavigationButtons } from '#app/components/navigation';
import { Pages, useStoreApi } from '#app/components/route-creator/store';

/** 線（パス）がクリックされたとき、間に追加する点をクリックする画面 */
export const SplitLineFragment = memo(() => {
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

  return (
    <>
      <p>新しい点を追加したい地表面をクリックしてください</p>
      <NavigationButtons>
        <Button color="dark" onClick={onBackButtonClick}>
          キャンセル
        </Button>
      </NavigationButtons>
    </>
  );
});
