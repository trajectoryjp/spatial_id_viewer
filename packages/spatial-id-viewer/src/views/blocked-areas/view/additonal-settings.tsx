import { memo } from 'react';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';
import { useStoreApi } from '#app/views/blocked-areas/view/store';

/** 追加の情報の入力欄 */
export const AdditionalSettings = memo(() => {
  const store = useStoreApi();
  const [startTime, endTime, update] = useStore(
    store,
    (s) => [s.startTime, s.endTime, s.update],
    shallow
  );

  const onStartTimeChange = (startTime: Date) => {
    update((s) => (s.startTime = startTime));
  };

  const onEndTimeChange = (endTime: Date) => {
    update((s) => (s.endTime = endTime));
  };

  return (
    <>
      <TogglableDateTimeInputField
        name="開始日時"
        selected={startTime}
        onChange={onStartTimeChange}
      />

      <TogglableDateTimeInputField name="終了日時" selected={endTime} onChange={onEndTimeChange} />
    </>
  );
});
