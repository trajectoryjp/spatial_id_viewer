import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { WholeAreaInfoFragmentProps } from '#app/components/area-creator';
import { NavigationButtons } from '#app/components/navigation';
import { replaceNaN } from '#app/utils/replace-nan';
import { WholeAreaInfo } from '#app/views/private-barriers/create/interfaces';

/** エリア全体に関する追加の情報の入力欄 */
export const WholeAreaInfoFragment = memo(
  ({
    wholeAreaInfo,
    setWholeAreaInfo,
    navigatePrev,
    navigateNext,
  }: WholeAreaInfoFragmentProps<WholeAreaInfo>) => {
    const [clearance, setClearance] = useState(0);

    useMount(() => {
      if (wholeAreaInfo !== null) {
        setClearance(wholeAreaInfo.clearance);
      }
    });

    const onClearanceChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setClearance(replaceNaN(ev.target.valueAsNumber, 0));
    };

    const apply = () => {
      setWholeAreaInfo({
        clearance,
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

    const clearanceId = useId();

    return (
      <>
        <p>範囲全体の情報を入力してください</p>
        <div>
          <p>
            <label htmlFor={clearanceId}>clearance 値</label>
          </p>
          <TextInput
            type="number"
            id={clearanceId}
            required={true}
            value={clearance}
            onChange={onClearanceChange}
            min={0}
          />
        </div>
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
