import { castDraft, Draft } from 'immer';
import { useCallback, useMemo } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';

import { IStore, ModelControllers } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';

const OUT_OF_SPACE = 'outOfSpace';
const FLYABLE_SPACE = 'flyableSpace';
const OCCUPIED_SPACE = 'occupiedSpace';

export interface CreateUseModelsProps<
  Metadata extends Record<string, unknown> = Record<string, never>
> {
  /** 空間 ID で範囲を取得してモデルを複数返す */
  loadModels?: (bbox: DisplayDetails) => Promise<Map<string, CuboidCollection<Metadata>>>;
  /** ID を指定してモデルを削除する */
  /** モデルがアンロードされる際のフック */
  /** Promise 外でエラーが発生した場合のエラーの格納先 */
  loadAirSpaceModels?: (
    bbox: DisplayDetails
    // modelTypes: string[]
  ) => Promise<Map<string, CuboidCollection<Metadata>>[]>;

  loadAirSpaceModelsStream?: (
    bbox: DisplayDetails
  ) => Promise<Map<string, CuboidCollection<Metadata>>[]>;
  onUnloadModels?: () => Promise<void>;

  error?: unknown;
}

/** モデルの操作関数を useModels としてラップする */
export const createUseAirspaceModels = <
  Metadata extends Record<string, unknown> = Record<string, never>
>(
  props: CreateUseModelsProps<Metadata>
) => {
  const loadAirSpaceModelsImpl = useLatest(props.loadAirSpaceModels);
  const loadAirSpaceModelsStreamImpl = useLatest(props.loadAirSpaceModelsStream);
  const onUnloadModelsImpl = useLatest(props.onUnloadModels);
  const errorLatest = useLatest(props.error);

  const useModels = useCallback((store: IStore<Metadata>) => {
    const replaceModels = useLatest(store.replaceModels);
    const replaceOutOfSpaceModels = useLatest(store.replaceOutOfSpaceModels);
    const replaceFlyableSpaceModels = useLatest(store.replaceFlyableSpaceModels);
    const replaceOccupiedSpaceModels = useLatest(store.replaceOccupiedSpaceModels);

    const loadAirSpaceModels = useCallback(async (bbox: DisplayDetails, stream = false) => {
      let models: Map<string, CuboidCollection<any>>[] = null;
      if (stream) {
        models = await loadAirSpaceModelsStreamImpl.current(bbox);
      } else {
        models = await loadAirSpaceModelsImpl.current(bbox);
      }

      models.forEach((map) => {
        if (map.has(OUT_OF_SPACE)) {
          replaceOutOfSpaceModels.current(() => castDraft(map));
        }
        if (map.has(FLYABLE_SPACE)) {
          replaceFlyableSpaceModels.current(() => castDraft(map));
        }
        if (map.has(OCCUPIED_SPACE)) {
          replaceOccupiedSpaceModels.current(() => castDraft(map));
        }
      });
    }, []);

    const loadAirSpaceModelsStream = useCallback(async (bbox: DisplayDetails) => {
      return loadAirSpaceModels(bbox, true);
    }, []);

    const unloadModels = useCallback(async () => {
      onUnloadModelsImpl.current && (await onUnloadModelsImpl.current());
      replaceModels.current(() => new Map());
    }, []);

    return useMemo(() => {
      const result = { unloadModels, error: errorLatest.current } as ModelControllers;
      loadAirSpaceModelsImpl.current && (result.loadAirSpaceModels = loadAirSpaceModels);
      loadAirSpaceModelsStreamImpl.current &&
        (result.loadAirSpaceModelsStream = loadAirSpaceModelsStream);
      return result;
    }, [!!loadAirSpaceModelsImpl.current, !!onUnloadModelsImpl.current, errorLatest.current]);
  }, []);

  return useModels;
};
