import { immerable } from 'immer';
import { Mutate, StoreApi } from 'zustand';

import { createStoreHandlers, createStoreUpdater } from '#app/stores/utils';

export class Store {
  [immerable] = true;

  ownedBarriersOnly = false;

  constructor(
    private readonly set: StoreApi<Store>['setState'],
    private readonly get: StoreApi<Store>['getState'],
    private readonly store: Mutate<StoreApi<Store>, []>
  ) {}

  readonly update = createStoreUpdater(this.set, this.get);
}

export const [WithStore, useStoreApi] = createStoreHandlers(Store);
