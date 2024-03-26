import { createContext, ReactNode, useContext, useMemo } from 'react';
import { createStore, Mutate, StoreApi } from 'zustand';

type IStore<T> = new (
  set: StoreApi<T>['setState'],
  get: StoreApi<T>['getState'],
  store: Mutate<StoreApi<T>, []>
) => T;

export const createStoreHandlers = <StoreType extends IStore<InstanceType<StoreType>>>(
  Store: StoreType
) => {
  const StoreContext = createContext<StoreApi<InstanceType<StoreType>>>(null);

  const Provider = ({ children }: { children: ReactNode }) => {
    const store = useMemo(
      () => createStore<InstanceType<StoreType>>((set, get, store) => new Store(set, get, store)),
      []
    );

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
  };

  const WithStore = <T,>(Component: React.ComponentType<T>): React.ComponentType<T> => {
    return (props: T) => {
      return (
        <Provider>
          <Component {...props} />
        </Provider>
      );
    };
  };

  const useStoreApi = () => useContext(StoreContext);

  return [WithStore, useStoreApi] as const;
};
