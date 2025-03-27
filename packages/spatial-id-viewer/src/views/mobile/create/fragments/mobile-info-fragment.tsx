import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { NavigationButtons } from '#app/components/navigation';
import { MobileInfoFragmentProps } from '#app/components/tab-area-creator';
import { mobileInfo } from '#app/views/mobile/create/interfaces';

export const MobileInfoFragment = memo(
  ({
    mobileInfo,
    setMobileInfo,
    navigatePrev,
    navigateNext,
  }: MobileInfoFragmentProps<mobileInfo>) => {
    const [mobileCountryCode, setMobileCountryCode] = useState<string>('');
    const [mobileNetworkCode, setMobileNetworkCode] = useState<string>('');

    useMount(() => {
      if (mobileInfo !== null) {
        setMobileCountryCode(mobileInfo.mobileCountryCode);
        setMobileNetworkCode(mobileInfo.mobileNetworkCode);
      }
    });

    const onMobileCountryCodeChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setMobileCountryCode(ev.target.value);
    };
    const onMobileNetworkCodeChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setMobileNetworkCode(ev.target.value);
    };

    const apply = () => {
      setMobileInfo({
        mobileCountryCode,
        mobileNetworkCode,
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

    const mobileCountryCodeId = useId();
    const mobileNetworkCodeId = useId();

    return (
      <>
        <p>携帯電話情報を入力してください</p>
        <div>
          <p>
            <label htmlFor={mobileCountryCodeId}>モバイルの国番号</label>
          </p>
          <TextInput
            type="text"
            id={mobileCountryCodeId}
            required={true}
            value={mobileCountryCode}
            onChange={onMobileCountryCodeChange}
          />
        </div>
        <div>
          <p>
            <label htmlFor={mobileNetworkCodeId}>モバイルネットワークコード</label>
          </p>
          <TextInput
            type="text"
            id={mobileNetworkCodeId}
            required={true}
            value={mobileNetworkCode}
            onChange={onMobileNetworkCodeChange}
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
