import { Button } from 'flowbite-react';
import { useMount, useSetState } from 'react-use';

import { WholeAreaInfoFragmentProps } from '#app/components/area-creator';
import { NavigationButtons } from '#app/components/navigation';
import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';
import { WholeAreaInfo } from '#app/views/blocked-areas/create/interfaces';

/** エリア全体に関する追加の情報の入力欄 */
export const WholeAreaInfoFragment = ({
  wholeAreaInfo,
  setWholeAreaInfo,
  navigatePrev,
  navigateNext,
}: WholeAreaInfoFragmentProps<WholeAreaInfo>) => {
  const [{ startTime, endTime }, updateState] = useSetState<{
    startTime: Date | null;
    endTime: Date | null;
  }>({
    startTime: null,
    endTime: null,
  });

  useMount(() => {
    if (wholeAreaInfo !== null) {
      updateState({
        startTime: wholeAreaInfo.startTime,
        endTime: wholeAreaInfo.endTime,
      });
    }
  });

  const onStartTimeChange = (date: Date) => {
    updateState({
      startTime: date,
    });
  };

  const onEndTimeChange = (date: Date) => {
    updateState({
      endTime: date,
    });
  };

  const apply = () => {
    setWholeAreaInfo({
      startTime,
      endTime,
    });
  };

  const onBackButtonClick = () => {
    apply();
    navigatePrev();
  };

  const onRegisterButtonClick = () => {
    apply();
    navigateNext();
  };

  return (
    <>
      <p>範囲全体の情報を入力してください</p>
      <TogglableDateTimeInputField
        name="開始日時"
        selected={startTime}
        onChange={onStartTimeChange}
      />
      <TogglableDateTimeInputField name="終了日時" selected={endTime} onChange={onEndTimeChange} />
      <NavigationButtons>
        <Button color="dark" onClick={onBackButtonClick}>
          前へ
        </Button>
        <Button onClick={onRegisterButtonClick}>登録</Button>
      </NavigationButtons>
    </>
  );
};
