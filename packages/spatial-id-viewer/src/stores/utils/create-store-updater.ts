import produce, { Draft } from 'immer';
import isPromise from 'is-promise';

import { Awaitable } from '#app/utils/awaitable';

/** Store を更新する関数 */
export type StorePartialUpdater<T> = {
  (fn: (draft: Draft<T>) => Promise<unknown>): Promise<void>;
  (fn: (draft: Draft<T>) => unknown): void;
};

/** Store の一部分を置き換える関数 */
export type StorePartialReplacer<T> = {
  (fn: (draft: Draft<T>) => Promise<Draft<T>>): Promise<void>;
  (fn: (draft: Draft<T>) => Draft<T>): void;
};

const defaultSelect = <Store, Partial = Store>(store: Draft<Store>) => {
  return store as unknown as Draft<Partial>;
};

const defaultReplace = () => {
  // noop
};

/**
 * Store を更新する関数を作る
 * @param set Store に更新をマージする関数
 * @param get Store を取得する関数
 */
export function createStoreUpdater<Store>(
  set: (value: Store) => void,
  get: () => Store
): StorePartialUpdater<Store>;

/**
 * Store の一部分を更新する関数を作る
 * @param set Store に更新をマージする関数
 * @param get Store を取得する関数
 * @param select Store の更新対象となる一部分を取得する関数
 */
export function createStoreUpdater<Store, Partial>(
  set: (value: Store) => void,
  get: () => Store,
  select: (store: Draft<Store>) => Draft<Partial>
): StorePartialUpdater<Partial>;

/**
 * Store の一部分を置き換える関数を作る
 * @param set Store に更新をマージする関数
 * @param get Store を取得する関数
 * @param select Store の更新対象となる一部分を取得する関数
 * @param replace Store の更新対象となる一部分を置き換える関数
 */
export function createStoreUpdater<Store, Partial>(
  set: (value: Store) => void,
  get: () => Store,
  select: (store: Draft<Store>) => Draft<Partial>,
  replace: (store: Draft<Store>, partial: Draft<Partial>) => void
): StorePartialReplacer<Partial>;

export function createStoreUpdater<Store, Partial>(
  set: (value: Store) => void,
  get: () => Store,
  select: (store: Draft<Store>) => Draft<Partial> = defaultSelect,
  replace: (store: Draft<Store>, value: Draft<Partial>) => void = defaultReplace
) {
  const updater: unknown = (fn: (draft: Draft<Partial>) => unknown) => {
    const result = produce(get(), ((draft: Draft<Store>) => {
      const result = fn(select(draft)) as Awaitable<Draft<Partial>>;
      if (isPromise(result)) {
        return result.then((value) => void replace(draft, value));
      }
      replace(draft, result);
    }) as any);

    if (isPromise<Store, unknown>(result)) {
      result.then((x) => set(x));
      return;
    }
    set(result);
  };

  return updater as StorePartialUpdater<Partial> | StorePartialReplacer<Partial>;
}
