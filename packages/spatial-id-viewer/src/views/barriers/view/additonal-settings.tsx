import { Checkbox } from 'flowbite-react';
import { ChangeEvent, memo, useId } from 'react';
import { useStore } from 'zustand';

import { useStoreApi } from '#app/views/barriers/view/store';

/** 追加の設定の入力欄 */
export const AdditionalSettings = memo(() => {
  const store = useStoreApi();
  const ownedBarriersOnly = useStore(store, (s) => s.ownedBarriersOnly);
  const update = useStore(store, (s) => s.update);

  const onOwnedBarriersOnlyChange = (ev: ChangeEvent<HTMLInputElement>) => {
    update((s) => (s.ownedBarriersOnly = ev.target.checked));
  };

  const ownedBarriersOnlyId = useId();

  return (
    <div>
      <Checkbox
        className="mr-2"
        id={ownedBarriersOnlyId}
        checked={ownedBarriersOnly}
        onChange={onOwnedBarriersOnlyChange}
      />
      <label htmlFor={ownedBarriersOnlyId}>自組織のバリアのみ取得</label>
    </div>
  );
});
