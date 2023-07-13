import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo } from 'react';
import { useStore } from 'zustand';

import { NavigationButtons } from '#app/components/navigation';
import { Pages, useStoreApi } from '#app/components/route-creator/store';
import { replaceNaN } from '#app/utils/replace-nan';

/** 高度入力画面 */
export const InputAltitudeFragment = memo(() => {
  const store = useStoreApi();
  const hasAdditionalInfoFragment = useStore(store, (s) => !!s.waypointAdditionalInfoFragment);
  const altitude = useStore(store, (s) => s.waypoints.current.altitude);
  const update = useStore(store, (s) => s.update);

  const onAltitudeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    update(async (s) => {
      await s.waypoints.current.setAltitude(replaceNaN(ev.target.valueAsNumber, 0));
      s.waypoints.unsetErrorOnCurrentPaths();
    });
  };

  const onBackButtonClick = () => {
    update((s) => {
      s.waypoints.removeCurrentWaypoint();
      s.page = Pages.SelectPointOrFeature;
    });
  };

  const onNextButtonClick = async () => {
    if (hasAdditionalInfoFragment) {
      update((s) => (s.page = Pages.InputWaypointSpecificInfo));
      return;
    }

    update((s) => {
      s.waypoints.selected = null;
      s.page = Pages.SelectPointOrFeature;
    });
  };

  return (
    <>
      <p>選択した地点の標高 (m) を入力してください</p>
      <TextInput type="number" required={true} value={altitude} onChange={onAltitudeChange} />
      <NavigationButtons>
        <Button color="dark" onClick={onBackButtonClick}>
          選び直す
        </Button>
        <Button onClick={onNextButtonClick}>次へ</Button>
      </NavigationButtons>
    </>
  );
});
