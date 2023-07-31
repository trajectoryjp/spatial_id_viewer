import { Cartesian3, Rectangle } from 'cesium';
import { Button, TextInput } from 'flowbite-react';
import { memo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { CuboidCollection } from 'spatial-id-converter';

import { Pages, useStoreApi } from '#app/components/area-viewer/store';
import { NavigationButtons } from '#app/components/navigation';
import { warnIfTokenExpired } from '#app/utils/warn-if-token-expired';

// カメラ移動時の高さ
const CAMERA_HEIGHT = 5000;

const States = {
  Input: 0,
  Loaded: 1,
  Errored: 2,
} as const;
type States = (typeof States)[keyof typeof States];

/** 単数取得系 API を呼び、モデルを 1 つ表示させる画面 */
export const ShowModelFragment = memo(() => {
  const store = useStoreApi();
  const featureName = useStore(store, (s) => s.featureName);
  const featureIdName = useStore(store, (s) => s.featureIdName);
  const isFunctionSelectable = useStore(store, (s) => s.isFunctionSelectable());
  const models = useStore(store, (s) => s.models);
  const update = useStore(store, (s) => s.update);
  const errorOutsidePromise = useStore(store, (s) => s.modelCtrls.error);
  const loadModel = useStore(store, (s) => s.modelCtrls.loadModel);
  const unloadModels = useStore(store, (s) => s.modelCtrls.unloadModels);
  const deleteModel = useStore(store, (s) => s.modelCtrls.deleteModel);
  const flyCameraTo = useStore(store, (s) => s.viewerCtrls.flyCameraTo);
  const isDeletable = !!deleteModel;

  const [state, setState] = useState<States>(States.Input);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');

  // Promise 外でエラー発生の場合のエラーハンドリング
  useUpdateEffect(() => {
    // null or undefined
    if (errorOutsidePromise == null) {
      return;
    }

    console.error(errorOutsidePromise);
    warnIfTokenExpired(errorOutsidePromise);
    setState(States.Errored);
  }, [errorOutsidePromise]);

  const onCancelButtonClick = () => {
    update((s) => (s.page = Pages.SelectFunction));
  };

  const onBackButtonClick = () => {
    unloadModels();
    setState(States.Input);
  };

  const onDeleteButtonClick = async () => {
    setLoading(true);
    try {
      await deleteModel(id);
    } catch (e) {
      console.error(e);
      warnIfTokenExpired(e);
      setState(States.Errored);
      return;
    } finally {
      setLoading(false);
    }
    setId('');
    setState(States.Input);
  };

  const onLoadButtonClick = async () => {
    setLoading(true);
    try {
      await loadModel(id);
    } catch (e) {
      console.error(e);
      warnIfTokenExpired(e);
      setState(States.Errored);
      return;
    } finally {
      setLoading(false);
    }
    setState(States.Loaded);
  };

  useUpdateEffect(() => {
    if (models.size === 0) {
      return;
    }

    const model = (models.values().next() as IteratorYieldResult<CuboidCollection<any>>).value;
    const region = model.calculateRegion();
    if (shallow(region, [0, 0, 0, 0, 0, 0])) {
      return;
    }

    // カメラをモデルの中心座標に移動
    const rect = new Rectangle(...region.slice(0, 4));
    const center = Rectangle.center(rect);
    flyCameraTo({
      destination: Cartesian3.fromRadians(center.longitude, center.latitude, CAMERA_HEIGHT),
    });
  }, [models]);

  return (
    <>
      {state === States.Input && (
        <>
          <p>取得する{featureIdName ?? featureName}の ID を入力してください</p>

          <TextInput
            type="text"
            required={true}
            value={id}
            onChange={(ev) => setId(ev.target.value)}
            disabled={loading}
          />

          <NavigationButtons>
            {isFunctionSelectable && (
              <Button color="dark" onClick={onCancelButtonClick} disabled={loading}>
                戻る
              </Button>
            )}
            <Button onClick={onLoadButtonClick} disabled={loading}>
              取得する
            </Button>
          </NavigationButtons>
        </>
      )}
      {state === States.Loaded && (
        <>
          <p>
            {featureName} {id} を表示しています
          </p>
          <NavigationButtons>
            <Button color="dark" onClick={onBackButtonClick} disabled={loading}>
              戻る
            </Button>
            {isDeletable && (
              <Button color="warning" onClick={onDeleteButtonClick} disabled={loading}>
                削除する
              </Button>
            )}
          </NavigationButtons>
        </>
      )}
      {state === States.Errored && (
        <>
          <p>エラーが発生しました。</p>
          <NavigationButtons>
            <Button color="dark" onClick={onBackButtonClick}>
              戻る
            </Button>
          </NavigationButtons>
        </>
      )}
    </>
  );
});
