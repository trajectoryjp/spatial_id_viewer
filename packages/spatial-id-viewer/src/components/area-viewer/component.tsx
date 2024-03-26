import { Cesium3DTileStyle, Viewer as CesiumViewer } from 'cesium';
import { memo, ReactNode, useEffect, useRef } from 'react';
import { useLatest, useMount, useShallowCompareEffect } from 'react-use';
import { CesiumComponentRef } from 'resium';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { SelectFunctionFragment } from '#app/components/area-viewer/fragments/select-function';
import { ShowModelFragment } from '#app/components/area-viewer/fragments/show-model';
import { ShowModelsFragment } from '#app/components/area-viewer/fragments/show-models';
import { useSelected3DTileFeature } from '#app/components/area-viewer/hooks/selected-3d-tile-feature';
import { useViewerCtrls } from '#app/components/area-viewer/hooks/viewer-ctrls';
import { ModelControllers } from '#app/components/area-viewer/interface';
import { IStore, Pages, useStoreApi, WithStore } from '#app/components/area-viewer/store';
import { Navigation } from '#app/components/navigation';
import { Viewer, ViewerContainer } from '#app/components/viewer';
import { CuboidCollectionModel } from '#app/components/viewer/cuboid-collection-model';

export interface AreaViewerProps<Metadata extends Record<string, unknown> = Record<string, never>> {
  /** オブジェクトの種類名 */
  featureName: string;
  /** ID のオブジェクトの種類名 */
  featureIdName?: string;
  /** モデルに関連する操作を行う関数群を返す React Hook */
  useModels: (store: IStore<Metadata>) => ModelControllers;
  /** モデルに適用するスタイル */
  tilesetStyle: Cesium3DTileStyle;
  children?: ReactNode;
}

const AreaViewerLayout = <Metadata extends Record<string, unknown> = Record<string, never>>(
  props: AreaViewerProps<Metadata>
) => {
  const { featureName, featureIdName, useModels } = props;

  const store = useStoreApi();
  const page = useStore(store, (s) => s.page);
  const models = useStore(store, (s) => s.models);
  const modelStore = useStore(
    store,
    (s) => ({
      models: s.models,
      replaceModels: s.replaceModels,
      viewerCtrls: s.viewerCtrls,
    }),
    shallow
  ) as IStore<Metadata>;
  const update = useStore(store, (s) => s.update);

  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();

  const modelCtrls = useModels(modelStore);
  const isFunctionSelectable = !!(modelCtrls.loadModel && modelCtrls.loadModels);
  const unloadModels = useLatest(modelCtrls.unloadModels);
  const selectedCtrls = useSelected3DTileFeature(viewerRef);
  const [selectedModelId, unselectModel] = selectedCtrls;
  const viewerCtrls = useViewerCtrls(viewerRef);

  useMount(() => {
    update((s) => (s.viewerCtrls = viewerCtrls));
  });

  useMount(() => {
    if (isFunctionSelectable) {
      update((s) => (s.page = Pages.SelectFunction));
    } else if (modelCtrls.loadModel) {
      update((s) => (s.page = Pages.ShowModel));
    } else {
      update((s) => (s.page = Pages.ShowModels));
    }
  });

  useEffect(() => {
    update((s) => (s.featureName = featureName));
  }, [featureName]);

  useEffect(() => {
    update((s) => (s.featureIdName = featureIdName));
  }, [featureIdName]);

  useShallowCompareEffect(() => {
    update((s) => (s.modelCtrls = modelCtrls));
  }, [modelCtrls]);

  useShallowCompareEffect(() => {
    update((s) => (s.selectedCtrls = selectedCtrls));
  }, [selectedCtrls]);

  useEffect(() => {
    const exec = async () => {
      viewerRef.current?.cesiumElement &&
        (viewerRef.current.cesiumElement.selectedEntity = undefined);

      await unloadModels.current();
    };
    exec();
  }, [page]);

  useEffect(() => {
    if (!models.has(selectedModelId)) {
      unselectModel();
    }
  }, [models]);

  return (
    <ViewerContainer>
      <Viewer ref={viewerRef}>
        {[...models.entries()].map(([modelId, model]) => (
          <CuboidCollectionModel key={modelId} data={model} style={props.tilesetStyle} />
        ))}
      </Viewer>
      <Navigation>
        {page === Pages.SelectFunction && <SelectFunctionFragment />}
        {page === Pages.ShowModel && <ShowModelFragment />}
        {page === Pages.ShowModels && <ShowModelsFragment>{props.children}</ShowModelsFragment>}
      </Navigation>
    </ViewerContainer>
  );
};

/** 空間 ID ベースのモデルを表示・削除する画面の共通コンポーネント */
export const AreaViewer = memo(WithStore(AreaViewerLayout)) as typeof AreaViewerLayout;
