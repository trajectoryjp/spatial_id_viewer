import { TextInput } from 'flowbite-react';
import { ChangeEvent, memo } from 'react';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';
import { useStoreApi } from '#app/views/reserved-routes/view/store';

/** 追加の設定の入力欄 */
export const AdditionalSettings = memo(() => {
  const store = useStoreApi();
  const [aircraftId, startTime, endTime, update] = useStore(
    store,
    (s) => [s.aircraftId, s.startTime, s.endTime, s.update],
    shallow
  );

  const onStartTimeChange = (startTime: Date) => {
    update((s) => (s.startTime = startTime));
  };

  const onEndTimeChange = (endTime: Date) => {
    update((s) => (s.endTime = endTime));
  };

  const onAircraftIdChange = (ev: ChangeEvent<HTMLInputElement>) => {
    update((s) => (s.aircraftId = ev.target.value));
  };

  return (
    <>
      <div>
        機体 ID:
        <TextInput type="number" required={true} value={aircraftId} onChange={onAircraftIdChange} />
      </div>

      <TogglableDateTimeInputField
        name="開始日時"
        selected={startTime}
        onChange={onStartTimeChange}
      />

      <TogglableDateTimeInputField name="終了日時" selected={endTime} onChange={onEndTimeChange} />
    </>
  );
});
