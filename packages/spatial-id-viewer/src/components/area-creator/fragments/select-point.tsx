import { Button } from 'flowbite-react';
import { memo } from 'react';
import { useUpdateEffect } from 'react-use';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';
import { NavigationButtons } from '#app/components/navigation';

export interface SelectPointFragmentProps {
  point: 1 | 2;
}

/** 地点を選択する画面 */
export const SelectPointFragment = memo((props: SelectPointFragmentProps) => {
  const { point } = props;

  const store = useStoreApi();
  const clickedPoint = useStore(store, (s) => s.clickedPoint);
  const areas = useStore(store, (s) => s.areas);
  const currentArea = useStore(store, (s) => s.areas.current);
  const update = useStore(store, (s) => s.update);

  useUpdateEffect(() => {
    update(async (s) => {
      if (!currentArea) {
        s.areas.createNewArea();
      }

      if (point === 1) {
        await s.areas.current.setPoint1(clickedPoint);
        s.page = Pages.SelectPoint2;
      } else {
        await s.areas.current.setPoint2(clickedPoint);
        s.page = Pages.InputTileZ;
      }
    });
  }, [clickedPoint]);

  // SelectPoint2 時のみ
  const onBackButtonClick = () => {
    update((s) => {
      s.areas.removeCurrentArea();
      s.page = Pages.SelectPoint1;
    });
  };

  // SelectPoint1 時のみ
  const onCancelButtonClick = () => {
    update((s) => (s.page = Pages.SelectAddOrSend));
  };

  return (
    <>
      <p>{point === 1 ? '左上' : '右下'}の地点を選択してください</p>
      {(point !== 1 || areas.data.length > 0) && (
        <NavigationButtons>
          {point === 1 && <Button onClick={onCancelButtonClick}>キャンセル</Button>}
          {point === 2 && (
            <Button color="dark" onClick={onBackButtonClick}>
              選び直す
            </Button>
          )}
        </NavigationButtons>
      )}
    </>
  );
});
