import { castDraft, Draft } from 'immer';
import { useCallback, useMemo } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';

import { IStore, ModelControllers } from '#app/components/area-viewer';

export interface CreateUseModelsProps<
  Metadata extends Record<string, unknown> = Record<string, never>
> {
  /** ID を指定してモデルを 1 つ返す */
  loadModel?: (id: string) => Promise<CuboidCollection<Metadata>>;
  /** 空間 ID で範囲を取得してモデルを複数返す */
  loadModels?: (bbox: SpatialId) => Promise<Map<string, CuboidCollection<Metadata>>>;
  /** ID を指定してモデルを削除する */
  deleteModel?: (id: string) => Promise<void>;
  /** モデルがアンロードされる際のフック */
  onUnloadModels?: () => Promise<void>;
  /** Promise 外でエラーが発生した場合のエラーの格納先 */
  error?: unknown;
}

/** モデルの操作関数を useModels としてラップする */
export const createUseModels = <Metadata extends Record<string, unknown> = Record<string, never>>(
  props: CreateUseModelsProps<Metadata>
) => {
  const loadModelImpl = useLatest(props.loadModel);
  const loadModelsImpl = useLatest(props.loadModels);
  const deleteModelImpl = useLatest(props.deleteModel);
  const onUnloadModelsImpl = useLatest(props.onUnloadModels);
  const errorLatest = useLatest(props.error);

  const useModels = useCallback((store: IStore<Metadata>) => {
    const replaceModels = useLatest(store.replaceModels);

    const loadModel = useCallback(async (id: string) => {
      const model = await loadModelImpl.current(id);
      replaceModels.current(
        () => new Map<string, Draft<CuboidCollection<any>>>([[id, castDraft(model)]])
      );
    }, []);

    const loadModels = useCallback(async (bbox: SpatialId) => {
      const models: Map<string, CuboidCollection<any>> = await loadModelsImpl.current(bbox);
      replaceModels.current(() => castDraft(models));
    }, []);

    const deleteModel = useCallback(async (id: string) => {
      await deleteModelImpl.current(id);
      replaceModels.current((models: Map<string, any>) => {
        models.delete(id);
        return models;
      });
    }, []);

    const unloadModels = useCallback(async () => {
      onUnloadModelsImpl.current && (await onUnloadModelsImpl.current());
      replaceModels.current(() => new Map());
    }, []);

    return useMemo(() => {
      const result = { unloadModels, error: errorLatest.current } as ModelControllers;
      loadModelImpl.current && (result.loadModel = loadModel);
      loadModelsImpl.current && (result.loadModels = loadModels);
      deleteModelImpl.current && (result.deleteModel = deleteModel);
      return result;
    }, [
      !!loadModelImpl.current,
      !!loadModelsImpl.current,
      !!deleteModelImpl.current,
      !!onUnloadModelsImpl.current,
      errorLatest.current,
    ]);
  }, []);

  return useModels;
};
