import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useState } from 'react';
import { useMount } from 'react-use';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';
import { NavigationButtons } from '#app/components/navigation';
import { replaceNaN } from '#app/utils/replace-nan';

/** 高度を入力する画面 */
export const InputTileFFragment = memo(() => {
  const store = useStoreApi();
  const nextPage = useStore(store, (s) =>
    s.areaAdditionalInfoFragment ? Pages.InputAreaSpecificInfo : Pages.SelectAddOrSend
  );
  const currentArea = useStore(store, (s) => s.areas.current);
  const update = useStore(store, (s) => s.update);

  const [tileF1, setTileF1] = useState<number>(0);
  const [tileF2, setTileF2] = useState<number>(0);
  const [dirty, setDirty] = useState(false);

  useMount(() => {
    const f = currentArea?.tileF;
    if (!f) {
      return;
    }
    setTileF1(f[0]);
    setTileF2(f[1]);
  });

  const onTileF1Change = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileF1(replaceNaN(ev.target.valueAsNumber, 0));
    setDirty(true);
  };

  const onTileF2Change = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileF2(replaceNaN(ev.target.valueAsNumber, 0));
    setDirty(true);
  };

  const apply = async () => {
    if (!dirty) return;

    const f = [Math.min(tileF1, tileF2), Math.max(tileF1, tileF2)] as [number, number];
    await update((s) => s.areas.current.setTileF(f));
    setDirty(false);
  };

  const onBackButtonClick = () => {
    update((s) => (s.page = Pages.InputTileZ));
  };

  const onNextButtonClick = async () => {
    await apply();
    update((s) => (s.page = nextPage));
  };

  const onApplyButtonClick = apply;

  return (
    <>
      <p>高度 (f の値) を入力してください</p>
      <TextInput
        type="number"
        required={true}
        value={tileF1}
        onChange={onTileF1Change}
        min={0}
        max={24}
      />
      <TextInput
        type="number"
        required={true}
        value={tileF2}
        onChange={onTileF2Change}
        min={0}
        max={24}
      />
      <NavigationButtons>
        <Button color="dark" onClick={onBackButtonClick}>
          前へ
        </Button>
        <Button onClick={onApplyButtonClick}>適用</Button>
        <Button onClick={onNextButtonClick}>
          {nextPage === Pages.InputAreaSpecificInfo ? '次へ' : '確定'}
        </Button>
      </NavigationButtons>
    </>
  );
});
