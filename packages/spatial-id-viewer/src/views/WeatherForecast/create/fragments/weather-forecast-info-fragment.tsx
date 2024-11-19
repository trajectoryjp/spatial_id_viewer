import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { NavigationButtons } from '#app/components/navigation';
import { WeatherForecastInfoFragmentProps } from '#app/components/tab-area-creator';
import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';
import { WeatherForecastInfo } from '#app/views/weather/create/interfaces';

export const WeatherForecastInfoFragment = memo(
  ({
    weatherForecastInfo,
    setWeatherForecastInfo,
    navigatePrev,
    navigateNext,
  }: WeatherForecastInfoFragmentProps<WeatherForecastInfo>) => {
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [windDirection, setWindDirection] = useState<number>(0);
    const [windSpeed, setWindSpeed] = useState<number>(0);
    const [cloudRate, setCloudRate] = useState<number>(0);
    const [precipitation, setPrecipitation] = useState<number>(0);

    useMount(() => {
      if (weatherForecastInfo !== null) {
        setStartTime(weatherForecastInfo.startTime);
        setEndTime(weatherForecastInfo.endTime);
        setWindDirection(weatherForecastInfo.windDirection);
        setWindSpeed(weatherForecastInfo.windSpeed);
        setCloudRate(weatherForecastInfo.cloudRate);
        setPrecipitation(weatherForecastInfo.precipitation);
      }
    });

    const onStartTimeChange = (startTime: Date) => {
      setStartTime(startTime);
    };

    const onEndTimeChange = (endTime: Date) => {
      setEndTime(endTime);
    };

    const onWindDirectionChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setWindDirection(ev.target.valueAsNumber);
    };
    const onWindSpeedChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setWindSpeed(ev.target.valueAsNumber);
    };
    const onCloudRateChange = (ev: ChangeEvent<HTMLInputElement>) => {
      const val = ev.target.valueAsNumber;
      setCloudRate(val > 100 ? 100 : val < 0 ? 0 : val);
    };

    const onPrecipitationChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setPrecipitation(ev.target.valueAsNumber);
    };

    const apply = () => {
      setWeatherForecastInfo({
        startTime,
        endTime,
        windDirection,
        windSpeed,
        cloudRate,
        precipitation,
      });
    };

    const onBackButtonClick = () => {
      apply();
      navigatePrev();
    };

    const onNextButtonClick = () => {
      apply();
      navigateNext();
    };

    const windDirectionId = useId();
    const windSpeedId = useId();
    const cloudRateId = useId();
    const precipitationId = useId();

    return (
      <>
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
        <div>
          <p>
            <label htmlFor={windSpeedId}>windSpeed (knot)</label>
          </p>
          <TextInput
            type="number"
            id={windSpeedId}
            required={true}
            value={windSpeed}
            onChange={onWindSpeedChange}
          />
        </div>
        <div>
          <p>
            <label htmlFor={windDirectionId}>windDirection (degrees)</label>
          </p>
          <TextInput
            type="number"
            id={windDirectionId}
            required={true}
            value={windDirection}
            onChange={onWindDirectionChange}
          />
        </div>
        <div>
          <p>
            <label htmlFor={cloudRateId}>cloudRate (%)</label>
          </p>
          <TextInput
            type="number"
            id={cloudRateId}
            required={true}
            value={cloudRate}
            onChange={onCloudRateChange}
          />
        </div>
        <div>
          <p>
            <label htmlFor={precipitationId}>precipitation (mm/h)</label>
          </p>
          <TextInput
            type="number"
            id={precipitationId}
            required={true}
            value={precipitation}
            onChange={onPrecipitationChange}
          />
        </div>
        <NavigationButtons>
          <Button color="dark" onClick={onBackButtonClick}>
            前へ
          </Button>
          <Button onClick={onNextButtonClick}>確定</Button>
        </NavigationButtons>
      </>
    );
  }
);
