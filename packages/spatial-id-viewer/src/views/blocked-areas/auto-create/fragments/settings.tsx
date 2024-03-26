import { Button, Checkbox, TextInput } from 'flowbite-react';
import { ChangeEvent, useId } from 'react';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { NavigationButtons } from '#app/components/navigation';
import { replaceNaN } from '#app/utils/replace-nan';
import { Pages, useStoreApi } from '#app/views/blocked-areas/auto-create/store';

/** 設定画面 */
export const SettingsFragment = () => {
  const store = useStoreApi();
  const { highAccuracy, defaultAltitude, zoomLevel, areaSize, minimumIntervalSec } = useStore(
    store,
    (s) => s.settings,
    shallow
  );
  const updateSettings = useStore(store, (s) => s.updateSettings);
  const setPage = useStore(store, (s) => s.setPage);

  const onDefaultAltitudeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    updateSettings((draft) => {
      draft.defaultAltitude = replaceNaN(ev.target.valueAsNumber, 0);
    });
  };

  const onHighAccuracyChange = (ev: ChangeEvent<HTMLInputElement>) => {
    updateSettings((draft) => {
      draft.highAccuracy = ev.target.checked;
    });
  };

  const onZoomLevelChange = (ev: ChangeEvent<HTMLInputElement>) => {
    updateSettings((draft) => {
      draft.zoomLevel = replaceNaN(ev.target.valueAsNumber, 0);
    });
  };

  const onAreaSizeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    updateSettings((draft) => {
      draft.areaSize = replaceNaN(ev.target.valueAsNumber, 0);
    });
  };

  const onMinimumIntervalSecChange = (ev: ChangeEvent<HTMLInputElement>) => {
    updateSettings((draft) => {
      draft.minimumIntervalSec = replaceNaN(ev.target.valueAsNumber, 0);
    });
  };

  const onNextButtonClick = async () => {
    setPage(Pages.Watching);
  };

  const highAccuracyId = useId();
  const defaultAltitudeId = useId();
  const zoomLevelId = useId();
  const areaSizeId = useId();
  const minimumIntervalSecId = useId();

  return (
    <>
      <p>位置情報を取得し、割込禁止エリアに登録します</p>

      <div>
        <Checkbox
          className="mr-2"
          id={highAccuracyId}
          checked={highAccuracy}
          onChange={onHighAccuracyChange}
        />
        <label htmlFor={highAccuracyId}>高精度な位置情報を使用する</label>
      </div>

      <div>
        <label htmlFor={defaultAltitudeId}>デフォルトの高度 (MSL, m)</label>
        <TextInput
          id={defaultAltitudeId}
          type="number"
          required={true}
          value={defaultAltitude}
          onChange={onDefaultAltitudeChange}
        />
      </div>

      <div>
        <label htmlFor={zoomLevelId}>ズームレベル</label>
        <TextInput
          id={zoomLevelId}
          type="number"
          required={true}
          value={zoomLevel}
          onChange={onZoomLevelChange}
        />
      </div>

      <div>
        <label htmlFor={areaSizeId}>エリア範囲 (m)</label>
        <TextInput
          id={areaSizeId}
          type="number"
          required={true}
          value={areaSize}
          onChange={onAreaSizeChange}
        />
      </div>

      <div>
        <label htmlFor={minimumIntervalSecId}>位置登録の最短間隔 (秒)</label>
        <TextInput
          id={minimumIntervalSecId}
          type="number"
          required={true}
          min={0}
          value={minimumIntervalSec}
          onChange={onMinimumIntervalSecChange}
        />
      </div>

      <NavigationButtons>
        <Button onClick={onNextButtonClick}>登録開始</Button>
      </NavigationButtons>
    </>
  );
};
