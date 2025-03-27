import { Button } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { RestrictionTypes } from 'spatial-id-svc-common';

import { RestrictionTypeFragmentProps } from '#app/components/area-creator';
import { NavigationButtons } from '#app/components/navigation';
import { RestrictionAdditionalInfo } from '#app/views/blocked-areas/create/interfaces';

export const RestrictiontypeFragment = memo(
  ({
    restrictionInfo,
    setRestrictionAdditionalInfo,
    navigatePrev,
    navigateNext,
  }: RestrictionTypeFragmentProps<RestrictionAdditionalInfo>) => {
    const [selectedRestrictionType, setSelectedRestrictionType] = useState<string>(
      RestrictionTypes.TYPE_FREE
    );

    useMount(() => {
      if (restrictionInfo !== null) {
        setSelectedRestrictionType(restrictionInfo.type);
      }
    });

    const onRestrictionTypeChange = (ev: ChangeEvent<HTMLSelectElement>) => {
      setSelectedRestrictionType(ev.target.value);
    };

    const apply = () => {
      setRestrictionAdditionalInfo({
        type: selectedRestrictionType,
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

    const restrictionTypeId = useId();

    return (
      <>
        <p>制限の種類を選択してください</p>
        <div>
          <p>
            <label htmlFor={restrictionTypeId}>制限タイプ</label>
          </p>
          <select
            id={restrictionTypeId}
            value={selectedRestrictionType ?? ''}
            onChange={onRestrictionTypeChange}
            style={{ color: '#3b3a3a' }}
          >
            {Object.values(RestrictionTypes).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <NavigationButtons>
          <Button color="dark" onClick={onBackButtonClick}>
            前へ
          </Button>
          <Button onClick={onNextButtonClick}>登録</Button>
        </NavigationButtons>
      </>
    );
  }
);
