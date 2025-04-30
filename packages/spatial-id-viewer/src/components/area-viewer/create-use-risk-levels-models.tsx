import { castDraft, Draft } from 'immer';
import { useCallback, useMemo } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';

import { IStore, ModelControllers } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';

export interface CreateUseModelsProps<
  Metadata extends Record<string, unknown> = Record<string, never>
> {
  /** ID を指定してモデルを 1 つ返す */
  loadModel?: (id: string) => Promise<CuboidCollection<Metadata>>;
  /** 空間 ID で範囲を取得してモデルを複数返す */
  loadModels?: (bbox: DisplayDetails) => Promise<Map<string, CuboidCollection<Metadata>>>;
  /** ID を指定してモデルを削除する */
  deleteModel?: (id: string) => Promise<void>;
  /** モデルがアンロードされる際のフック */
  onUnloadModels?: () => Promise<void>;
  /** Promise 外でエラーが発生した場合のエラーの格納先 */
  loadModelsRisk?: (bbox: DisplayDetails) => Promise<CuboidCollection<Metadata>>;
  error?: unknown;
}

/** モデルの操作関数を useModels としてラップする */
export const createUseRiskLevelsModels = <
  Metadata extends Record<string, unknown> = Record<string, never>
>(
  props: CreateUseModelsProps<Metadata>
) => {
  const onUnloadModelsImpl = useLatest(props.onUnloadModels);
  const errorLatest = useLatest(props.error);
  const loadModelsRiskImpl = useLatest(props.loadModelsRisk);

  const useModels = useCallback((store: IStore<Metadata>) => {
    const replaceModels = useLatest(store.replaceModels);

    const loadModelsRisk = useCallback(async (bbox: DisplayDetails) => {
      const model = await loadModelsRiskImpl.current(bbox);
      replaceModels.current(
        () => new Map<string, Draft<CuboidCollection<any>>>([['risk-level', castDraft(model)]])
      );
    }, []);

    const unloadModels = useCallback(async () => {
      onUnloadModelsImpl.current && (await onUnloadModelsImpl.current());
      replaceModels.current(() => new Map());
    }, []);

    return useMemo(() => {
      const result = { unloadModels, error: errorLatest.current } as ModelControllers;
      loadModelsRiskImpl.current && (result.loadModelsRisk = loadModelsRisk);
      return result;
    }, [!!onUnloadModelsImpl.current, !!loadModelsRiskImpl.current, errorLatest.current]);
  }, []);

  return useModels;
};
