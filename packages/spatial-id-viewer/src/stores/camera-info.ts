import deepEqual from 'deep-equal';
import produce, { immerable } from 'immer';
import { create, Mutate, StoreApi } from 'zustand';

export interface CameraDestination {
  x: number;
  y: number;
  z: number;
}

export interface CameraOrientation {
  heading: number;
  pitch: number;
  roll: number;
}

/** カメラ位置を永続化させる */
export class CameraInfoStore {
  [immerable] = true;

  destination: CameraDestination | null = null;
  orientation: CameraOrientation | null = null;

  constructor(
    private readonly set: StoreApi<CameraInfoStore>['setState'],
    private readonly get: StoreApi<CameraInfoStore>['getState'],
    private readonly store: Mutate<StoreApi<CameraInfoStore>, []>
  ) {
    if (typeof window !== 'undefined') {
      try {
        const { destination, orientation } = JSON.parse(
          localStorage.getItem('cameraInfo')
        ) as CameraInfoStore;
        this.destination = destination;
        this.orientation = orientation;
      } catch {
        // noop
      }
    }
  }

  readonly setCameraInfo = (
    destination: CameraDestination | null,
    orientation: CameraOrientation | null
  ) => {
    this.set(
      produce(this.get(), (draft) => {
        if (
          deepEqual(draft.destination, destination) &&
          deepEqual(draft.orientation, orientation)
        ) {
          return;
        }

        draft.destination = destination;
        draft.orientation = orientation;

        if (typeof window !== 'undefined') {
          localStorage.setItem('cameraInfo', JSON.stringify({ destination, orientation }));
        }
      })
    );
  };
}

export const useCameraInfo = create<CameraInfoStore>(
  (set, get, store) => new CameraInfoStore(set, get, store)
);
