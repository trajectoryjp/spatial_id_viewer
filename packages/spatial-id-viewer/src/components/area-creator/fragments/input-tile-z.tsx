import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useState } from 'react';
import { useMount } from 'react-use';
import { useStore } from 'zustand';

import { Pages, useStoreApi } from '#app/components/area-creator/store';
import { NavigationButtons } from '#app/components/navigation';
import { replaceNaN } from '#app/utils/replace-nan';

/** タイルサイズを入力する画面 */
export const InputTileZFragment = memo(() => {
  const store = useStoreApi();
  const currentAreaTileZ = useStore(store, (s) => s.areas.current?.tileZ);
  const update = useStore(store, (s) => s.update);

  const [tileZ, setTileZ] = useState<number>(20);
  const [dirty, setDirty] = useState(false);

  // TODO: 初期値
  useMount(() => {
    const value = currentAreaTileZ;
    if (value === null) {
      const defaultValue = 20;
      setTileZ(defaultValue);
      performTileZChange(true);
    } else {
      setTileZ(value);
    }
  });

  const performTileZChange = async (force?: boolean) => {
    if (!force && !dirty) return;

    await update((s) => s.areas.current.setTileZ(tileZ));

    setDirty(false);
  };

  const onTileZChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileZ(replaceNaN(ev.target.valueAsNumber, 0));
    setDirty(true);
  };

  const onBackButtonClick = () => {
    update(async (s) => {
      await s.areas.current.setPoint2(null);
      s.page = Pages.SelectPoint2;
    });
  };

  const onNextButtonClick = async () => {
    await performTileZChange();
    update((s) => (s.page = Pages.InputTileF));
  };

  const onApplyButtonClick = async () => {
    await performTileZChange();
  };

  return (
    <>
      <p>タイルサイズを選択してください</p>
      <TextInput
        type="number"
        required={true}
        value={tileZ}
        onChange={onTileZChange}
        min={12}
        max={22}
      />
      <NavigationButtons>
        <Button color="dark" onClick={onBackButtonClick}>
          前へ
        </Button>
        <Button onClick={onApplyButtonClick}>適用</Button>
        <Button onClick={onNextButtonClick}>次へ</Button>
      </NavigationButtons>
    </>
  );
});
