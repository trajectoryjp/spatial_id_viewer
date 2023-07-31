import { Button, Radio, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { ReservationMethod } from 'spatial-id-svc-route';

import { NavigationButtons } from '#app/components/navigation';
import { WholeRouteInfoFragmentProps } from '#app/components/route-creator';
import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';
import { replaceNaN } from '#app/utils/replace-nan';
import { WholeRouteInfo } from '#app/views/reserved-routes/create/interfaces';

/** ルート全体に関する追加の情報の入力欄 */
export const WholeRouteInfoFragment = memo(
  ({
    wholeRouteInfo,
    setWholeRouteInfo,
    navigatePrev,
    navigateNext,
  }: WholeRouteInfoFragmentProps<WholeRouteInfo>) => {
    const [clearance, setClearance] = useState<number>(0);
    const [aircraftId, setAircraftId] = useState<string>('');
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [uavSize, setUavSize] = useState<number>(0);
    const [reservationMethod, setReservationMethod] = useState<ReservationMethod>('TRJXRecommend');

    useMount(() => {
      if (wholeRouteInfo !== null) {
        setClearance(wholeRouteInfo.clearance);
      }
    });

    const onClearanceChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setClearance(replaceNaN(ev.target.valueAsNumber, 0));
    };

    const onAircraftIdChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setAircraftId(ev.target.value);
    };

    const onStartTimeChange = setStartTime;
    const onEndTimeChange = setEndTime;

    const onUavSizeChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setUavSize(replaceNaN(ev.target.valueAsNumber, 0));
    };

    const onReservationMethodChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setReservationMethod(ev.target.value as ReservationMethod);
    };

    const apply = () => {
      setWholeRouteInfo({
        clearance,
        aircraftId,
        startTime,
        endTime,
        uavSize,
        reservationMethod,
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

    const reservationMethodId = useId();
    const trjxRecommendId = useId();
    const inputWpPriorityId = useId();

    return (
      <>
        <p>範囲全体の情報を入力してください</p>

        <div>
          clearance 値
          <TextInput type="number" required={true} value={clearance} onChange={onClearanceChange} />
        </div>

        <div>
          機体 ID
          <TextInput type="text" required={true} value={aircraftId} onChange={onAircraftIdChange} />
        </div>

        <div>
          UAV サイズ
          <TextInput type="number" required={true} value={uavSize} onChange={onUavSizeChange} />
        </div>

        <div>
          <p>予約方法</p>
          <Radio
            name={reservationMethodId}
            value="TRJXRecommend"
            id={trjxRecommendId}
            checked={reservationMethod === 'TRJXRecommend'}
            onChange={onReservationMethodChange}
          />
          <label htmlFor={trjxRecommendId}>TRJX 推奨ルート</label>
          <Radio
            name={reservationMethodId}
            value="InputWPPriority"
            id={inputWpPriorityId}
            checked={reservationMethod === 'InputWPPriority'}
            onChange={onReservationMethodChange}
          />
          <label htmlFor={inputWpPriorityId}>入力 WP 優先登録</label>
        </div>

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
