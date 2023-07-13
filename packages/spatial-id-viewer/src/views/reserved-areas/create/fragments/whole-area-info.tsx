import { Button } from 'flowbite-react';
import { memo, useState } from 'react';
import { useMount } from 'react-use';

import { WholeAreaInfoFragmentProps } from '#app/components/area-creator';
import { NavigationButtons } from '#app/components/navigation';
import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';
import { WholeAreaInfo } from '#app/views/reserved-areas/create/interfaces';

/** エリア全体に関する追加の情報の入力欄 */
export const WholeAreaInfoFragment = memo(
  ({
    wholeAreaInfo,
    setWholeAreaInfo,
    navigatePrev,
    navigateNext,
  }: WholeAreaInfoFragmentProps<WholeAreaInfo>) => {
    const [startTime, setStartTime] = useState<Date>(null);
    const [endTime, setEndTime] = useState<Date>(null);

    useMount(() => {
      if (wholeAreaInfo !== null) {
        setStartTime(wholeAreaInfo.startTime);
        setEndTime(wholeAreaInfo.endTime);
      }
    });

    const onStartTimeChange = setStartTime;
    const onEndTimeChange = setEndTime;

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
        <TogglableDateTimeInputField
          name="終了日時"
          selected={endTime}
          onChange={onEndTimeChange}
        />
        <NavigationButtons>
          <Button color="dark" onClick={onBackButtonClick}>
            前へ
          </Button>
          <Button onClick={onRegisterButtonClick}>登録</Button>
        </NavigationButtons>
      </>
    );
  }
);
