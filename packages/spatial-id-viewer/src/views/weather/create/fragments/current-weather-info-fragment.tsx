import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { NavigationButtons } from '#app/components/navigation';
import { CurrentWeatherInfoFragmentProps } from '#app/components/tab-area-creator';
import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';
import { CurrentWeatherInfo } from '#app/views/weather/create/interfaces';

export const CurrentWeatherInfoFragment = memo(
  ({
    currentWeatherInfo,
    setCurrentWeatherInfo,
    navigatePrev,
    navigateNext,
  }: CurrentWeatherInfoFragmentProps<CurrentWeatherInfo>) => {
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [windDirection, setWindDirection] = useState<number>(0);
    const [windSpeed, setWindSpeed] = useState<number>(0);
    const [cloudRate, setCloudRate] = useState<number>(0);
    const [temperature, setTemperature] = useState<number>(0);
    const [dewPoint, setDewPoint] = useState<number>(0);
    const [pressure, setPressure] = useState<number>(0);
    const [precipitation, setPrecipitation] = useState<number>(0);
    const [visibility, setVisibility] = useState<number>(0);
    const [gggg, setgggg] = useState<string>('');

    useMount(() => {
      if (currentWeatherInfo !== null) {
        setStartTime(currentWeatherInfo.startTime);
        setEndTime(currentWeatherInfo.endTime);
        setWindDirection(currentWeatherInfo.windDirection);
        setWindSpeed(currentWeatherInfo.windSpeed);
        setCloudRate(currentWeatherInfo.cloudRate);
        setTemperature(currentWeatherInfo.temperature);
        setDewPoint(currentWeatherInfo.dewPoint);
        setPressure(currentWeatherInfo.pressure);
        setPrecipitation(currentWeatherInfo.precipitation);
        setVisibility(currentWeatherInfo.visibility);
        setgggg(currentWeatherInfo.gggg);
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
    const onTemperatureChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setTemperature(ev.target.valueAsNumber);
    };
    const onDewPointChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setDewPoint(ev.target.valueAsNumber);
    };
    const onPressureChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setPressure(ev.target.valueAsNumber);
    };
    const onPrecipitationChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setPrecipitation(ev.target.valueAsNumber);
    };
    const onVisibilityChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setVisibility(ev.target.valueAsNumber);
    };
    const onggggChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setgggg(ev.target.value);
    };

    const apply = () => {
      setCurrentWeatherInfo({
        startTime,
        endTime,
        windDirection,
        windSpeed,
        cloudRate,
        temperature,
        dewPoint,
        pressure,
        precipitation,
        visibility,
        gggg,
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
    const temperatureId = useId();
    const dewPointId = useId();
    const pressureId = useId();
    const precipitationId = useId();
    const visibilityId = useId();
    const ggggId = useId();

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
            <label htmlFor={temperatureId}>temperature (ÿ)</label>
          </p>
          <TextInput
            type="number"
            id={temperatureId}
            required={true}
            value={temperature}
            onChange={onTemperatureChange}
          />
        </div>
        <div>
          <p>
            <label htmlFor={dewPointId}>dewPoint (°C)</label>
          </p>
          <TextInput
            type="number"
            id={dewPointId}
            required={true}
            value={dewPoint}
            onChange={onDewPointChange}
          />
        </div>
        <div>
          <p>
            <label htmlFor={pressureId}>pressure (hPa)</label>
          </p>
          <TextInput
            type="number"
            id={pressureId}
            required={true}
            value={pressure}
            onChange={onPressureChange}
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
        <div>
          <p>
            <label htmlFor={visibilityId}>visibility (km)</label>
          </p>
          <TextInput
            type="number"
            id={visibilityId}
            required={true}
            value={visibility}
            onChange={onVisibilityChange}
          />
        </div>
        <div>
          <p>
            <label htmlFor={ggggId}>gggg</label>
          </p>
          <TextInput type="text" id={ggggId} required={true} value={gggg} onChange={onggggChange} />
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
