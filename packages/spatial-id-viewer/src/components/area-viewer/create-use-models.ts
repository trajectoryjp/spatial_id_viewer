import { castDraft } from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { useCallback, useMemo } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection } from 'spatial-id-converter';

import { IStore, ModelControllers } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';

export interface CreateUseModelsProps<
  Metadata extends Record<string, unknown> = Record<string, never>
> {
  /** ID を指定してモデルを 1 つ返す */

  loadModel: (id: string) => AsyncGenerator<CuboidCollection<Metadata>>;
  /** 空間 ID で範囲を取得してモデルを複数返す */
  loadModels?: (bbox: DisplayDetails) => AsyncGenerator<Map<string, CuboidCollection<Metadata>>>;
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
      for await (const model of loadModelImpl.current(id)) {
        replaceModels.current((prevModels) => {
          const newModels = new Map(prevModels);

          const mutableModel = castDraft(model) as WritableDraft<CuboidCollection<any>>;

          newModels.set(id, mutableModel);
          return newModels;
        });
      }
    }, []);

    const loadModels = useCallback(async (bbox: DisplayDetails) => {
      for await (const models of loadModelsImpl.current(bbox)) {
        replaceModels.current((prevModels) => {
          const newModels = new Map(prevModels); // Clone previous state

          for (const [key, value] of models.entries()) {
            const mutableModel = castDraft(value) as WritableDraft<CuboidCollection<any>>;
            newModels.set(key, mutableModel); // Ensure mutable draft
          }

          return newModels;
        });
      }
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
