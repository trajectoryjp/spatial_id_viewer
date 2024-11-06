import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { OwnerAddressFragmentProps } from '#app/components/area-creator';
import { NavigationButtons } from '#app/components/navigation';
import { OwnerAddressInfo, StreamType } from '#app/views/overlay-areas/create/interfaces';

export const OwnerAddressFragment = memo(
  ({
    ownerAddressInfo,
    setOwnerAddressInfo,
    navigatePrev,
    navigateNext,
  }: OwnerAddressFragmentProps<OwnerAddressInfo>) => {
    const [type, setType] = useState<StreamType>(StreamType.grpc);
    const [input, setInput] = useState<string>('');

    useMount(() => {
      if (ownerAddressInfo !== null) {
        setType(ownerAddressInfo.type);
        setInput(ownerAddressInfo.input);
      }
    });

    const onTypeChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setType(ev.target.value as StreamType);
    };
    const onInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setInput(ev.target.value);
    };

    const apply = () => {
      setOwnerAddressInfo({
        type,
        input,
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

    const inputId = useId();

    return (
      <>
        <p>所有者の住所情報を入力してください</p>
        <div>
          <div className="flex flex-col">
            {Object.values(StreamType).map((streamType) => (
              <label key={streamType}>
                <input
                  type="radio"
                  value={streamType}
                  checked={type === streamType}
                  onChange={onTypeChange}
                />
                {streamType}
              </label>
            ))}
          </div>
          <p>
            <label htmlFor={inputId}>住所 </label>
          </p>
          <TextInput
            type="text"
            id={inputId}
            required={true}
            value={input}
            onChange={onInputChange}
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
