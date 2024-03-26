import { Checkbox, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useEffect, useId, useState } from 'react';
import DatePicker from 'react-datepicker';

export interface TogglableDateTimeInputFieldProps {
  name: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
}

/** 日付と時刻入力用コンポーネント */
export const TogglableDateTimeInputField = memo(
  ({ selected, onChange, name }: TogglableDateTimeInputFieldProps) => {
    const [enable, setEnable] = useState(false);
    const [date, setDate] = useState<Date>(null);

    const onEnableChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setEnable(ev.target.checked);
    };

    const onDateChange = setDate;

    useEffect(() => {
      setDate(selected);
    }, [selected]);

    useEffect(() => {
      if (!enable) {
        setDate(null);
      }
    }, [enable]);

    useEffect(() => {
      onChange(date);
    }, [date]);

    const checkboxId = useId();

    return (
      <div>
        {name}:
        <Checkbox className="ml-2" id={checkboxId} checked={enable} onChange={onEnableChange} />
        <label htmlFor={checkboxId} className="ml-2">
          指定する
        </label>
        {enable && (
          <DatePicker
            showTimeSelect
            selected={date}
            onChange={onDateChange}
            dateFormat="yyyy-MM-dd HH:mm:ss"
            timeFormat="HH:mm"
            placeholderText="クリックして入力"
            popperProps={{ strategy: 'fixed' }}
            customInput={<TextInput />}
          />
        )}
      </div>
    );
  }
);
