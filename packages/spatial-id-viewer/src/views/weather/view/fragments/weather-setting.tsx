import { memo, useState } from 'react';

interface SettingProps {
  setType: React.Dispatch<React.SetStateAction<string>>;
}

export const WeatherSettings = memo((props: SettingProps) => {
  const setType = props.setType;
  const [selectedOption, setSelectedOption] = useState('windDirection');
  const options = [
    { label: 'Wind Direction', value: 'windDirection (degree)' },
    { label: 'Wind Speed', value: 'windSpeed (knot)' },
    { label: 'Cloud Rate', value: 'cloudRate (%)' },
    { label: 'Temperature', value: 'temperature (°C)' },
    { label: 'Dew Point', value: 'dewPoint (°C)' },
    { label: 'Pressure', value: 'pressure (hPa)' },
    { label: 'Precipitation', value: 'precipitation (mm/h)' },
    { label: 'Visibility', value: 'visibility (km)' },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedOption(value);
    setType(value);
  };

  return (
    <div>
      {options.map((option) => (
        <div key={option.value}>
          <label>
            <input
              type="radio"
              name="settingType"
              value={option.value}
              checked={selectedOption === option.value}
              onChange={handleChange}
            />
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
});
