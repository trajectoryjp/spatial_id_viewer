import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { AreaAdditionalInfoFragmentProps } from '#app/components/area-creator';
import { NavigationButtons } from '#app/components/navigation';
import { replaceNaN } from '#app/utils/replace-nan';
import { AreaAdditionalInfo } from '#app/views/barriers/create/interfaces';

/** 単一のエリアに関する追加の情報の入力欄 */
export const AreaAdditionalInfoFragment = memo(
  ({
    areaAdditionalInfo,
    setAreaAdditionalInfo,
    navigatePrev,
    navigateNext,
  }: AreaAdditionalInfoFragmentProps<AreaAdditionalInfo>) => {
    const [risk, setRisk] = useState(0);

    useMount(() => {
      if (areaAdditionalInfo !== null) {
        setRisk(areaAdditionalInfo.risk);
      }
    });

    const onRiskChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setRisk(replaceNaN(ev.target.valueAsNumber, 0));
    };

    const apply = () => {
      setAreaAdditionalInfo({
        risk,
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

    const riskId = useId();

    return (
      <>
        <p>範囲の情報を入力してください</p>
        <div>
          <p>
            <label htmlFor={riskId}>リスク値</label>
          </p>
          <TextInput
            type="number"
            id={riskId}
            required={true}
            value={risk}
            onChange={onRiskChange}
            min={0}
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
