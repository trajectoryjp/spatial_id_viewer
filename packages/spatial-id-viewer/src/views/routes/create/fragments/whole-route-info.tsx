import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useState } from 'react';
import { useMount } from 'react-use';

import { NavigationButtons } from '#app/components/navigation';
import { WholeRouteInfoFragmentProps } from '#app/components/route-creator';
import { replaceNaN } from '#app/utils/replace-nan';
import { WholeRouteInfo } from '#app/views/routes/create/interfaces';

/** ルート全体に関する情報の入力欄 */
export const WholeRouteInfoFragment = memo(
  ({
    wholeRouteInfo,
    setWholeRouteInfo,
    navigatePrev,
    navigateNext,
  }: WholeRouteInfoFragmentProps<WholeRouteInfo>) => {
    const [clearance, setClearance] = useState<number>(0);
    const [uavSize, setUavSize] = useState<number>(0);

    useMount(() => {
      if (wholeRouteInfo !== null) {
        setClearance(wholeRouteInfo.clearance);
      }
    });

    const onClearanceChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setClearance(replaceNaN(ev.target.valueAsNumber, 0));
    };

    const onUavSizeChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setUavSize(replaceNaN(ev.target.valueAsNumber, 0));
    };

    const apply = () => {
      setWholeRouteInfo({
        clearance,
        uavSize,
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

    return (
      <>
        <p>範囲全体の情報を入力してください</p>

        <div>
          clearance 値
          <TextInput type="number" required={true} value={clearance} onChange={onClearanceChange} />
        </div>

        <div>
          UAV サイズ
          <TextInput type="number" required={true} value={uavSize} onChange={onUavSizeChange} />
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
