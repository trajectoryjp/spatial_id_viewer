import { Button, TextInput } from 'flowbite-react';
import { set } from 'immer/dist/internal';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { NavigationButtons } from '#app/components/navigation';
import { RsiInfoFragmentProps } from '#app/components/tab-area-creator';
import { RsiInfo } from '#app/views/mobile/create/interfaces';

export const RsiInfoFragment = memo(
  ({ rsiInfo, setRsiInfo, navigatePrev, navigateNext }: RsiInfoFragmentProps<RsiInfo>) => {
    const [value, setValue] = useState('');
    const [RSI, setRSI] = useState(-1);

    useMount(() => {
      if (rsiInfo !== null) {
        setRSI(rsiInfo.rsi);
      }
    });

    const onRsiChange = (ev: ChangeEvent<HTMLInputElement>) => {
      let inputValue = ev.target.value;
      inputValue = inputValue.replace(/[^-?\d]/g, '');

      if ((inputValue.match(/-/g) || []).length > 1 || inputValue.indexOf('-') > 0) {
        inputValue = inputValue.replace(/-/g, '');
      }

      setValue(inputValue);
      setRSI(Number(inputValue));
    };

    const apply = () => {
      setRsiInfo({
        rsi: RSI,
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

    const ID = useId();

    return (
      <>
        <p>RSI情報を入力してください</p>
        <div>
          <p>
            <label htmlFor={ID}>RSI (dB)</label>
          </p>

          <TextInput
            type="text"
            id={ID}
            value={value}
            onChange={onRsiChange}
            placeholder="Enter a positive or negative number"
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
