import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo } from 'react';
import { useStore } from 'zustand';

import { NavigationButtons } from '#app/components/navigation';
import { Pages, useStoreApi } from '#app/components/route-creator/store';
import { replaceNaN } from '#app/utils/replace-nan';

/** デフォルト高度入力画面 */
export const InputDefaultAltitudeFragment = memo(() => {
  const store = useStoreApi();
  const defaultAltitude = useStore(store, (s) => s.waypoints.defaultAltitude);
  const update = useStore(store, (s) => s.update);

  const onDefaultAltitudeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    update((s) => (s.waypoints.defaultAltitude = replaceNaN(ev.target.valueAsNumber, 0)));
  };

  const onNextButtonClick = async () => {
    update((s) => (s.page = Pages.SelectPointOrFeature));
  };

  return (
    <>
      <p>デフォルトの標高 (m) を入力してください</p>
      <TextInput
        type="number"
        required={true}
        value={defaultAltitude}
        onChange={onDefaultAltitudeChange}
      />
      <NavigationButtons>
        <Button onClick={onNextButtonClick}>次へ</Button>
      </NavigationButtons>
    </>
  );
});
