import { Button, Radio, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { ReservationMethod } from 'spatial-id-svc-route';

import { NavigationButtons } from '#app/components/navigation';
import { RouteInfoFragmentProps } from '#app/components/route-creator/store';
import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';
import { RouteInfo } from '#app/views/reserved-routes/create/interfaces';

export const RouteInfoFragment = memo(
  ({ routeInfo, setRouteInfo, navigatePrev, navigateNext }: RouteInfoFragmentProps<RouteInfo>) => {
    const [occupation, setOccupation] = useState<string>('');
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [reservationMethod, setReservationMethod] = useState<ReservationMethod>('TRJXRecommend');

    useMount(() => {
      if (routeInfo !== null) {
        setOccupation(routeInfo.occupation);
      }
    });

    const onOccupationChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setOccupation(ev.target.value);
    };

    const onStartTimeChange = setStartTime;
    const onEndTimeChange = setEndTime;

    const onReservationMethodChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setReservationMethod(ev.target.value as ReservationMethod);
    };

    const apply = () => {
      setRouteInfo({
        occupation,
        startTime,
        endTime,
        reservationId: reservationMethod,
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
          occupation
          <TextInput type="text" required={true} value={occupation} onChange={onOccupationChange} />
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
