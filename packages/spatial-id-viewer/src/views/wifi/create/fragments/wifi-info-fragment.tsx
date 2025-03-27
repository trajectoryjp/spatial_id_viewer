import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { NavigationButtons } from '#app/components/navigation';
import { WifiInfoFragmentProps } from '#app/components/tab-area-creator';
import { wifiInfo } from '#app/views/mobile/create/interfaces';

export const WifiInfoFragment = memo(
  ({ wifiInfo, setWifiInfo, navigatePrev, navigateNext }: WifiInfoFragmentProps<wifiInfo>) => {
    const [ssid, setSsid] = useState<string>('');

    useMount(() => {
      if (wifiInfo !== null) {
        setSsid(wifiInfo.ssid);
      }
    });

    const onSsidChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setSsid(ev.target.value);
    };

    const apply = () => {
      setWifiInfo({
        ssid,
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

    const Ssid = useId();

    return (
      <>
        <p>ssid情報を入力してください</p>
        <div>
          <p>
            <label htmlFor={Ssid}>ssid</label>
          </p>
          <TextInput type="text" id={Ssid} required={true} value={ssid} onChange={onSsidChange} />
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
