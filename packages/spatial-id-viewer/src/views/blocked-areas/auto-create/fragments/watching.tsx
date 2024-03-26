import { Button, Checkbox } from 'flowbite-react';
import { castDraft } from 'immer';
import { ChangeEvent, useId, useRef, useState } from 'react';
import { useDeepCompareEffect, useMount, useUnmount } from 'react-use';
import { useThrottledCallback } from 'use-debounce';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { createBlockedArea, deleteBlockedArea } from 'spatial-id-svc-area';

import { NavigationButtons } from '#app/components/navigation';
import { apiBaseUrl } from '#app/constants';
import { useWarnOnRouteChange } from '#app/hooks/warn-on-route-change';
import { useAuthInfo } from '#app/stores/auth-info';
import { warnIfTokenExpired } from '#app/utils/warn-if-token-expired';
import { areaToSpatialIds } from '#app/views/blocked-areas/auto-create/area-utils';
import {
  CreatedBlockedAreaInfo,
  Pages,
  useStoreApi,
} from '#app/views/blocked-areas/auto-create/store';

const spatialIdsToModel = async (spatialIds: string[], areaId: string) => {
  const spatialIdObjs = spatialIds.map((s) =>
    SpatialId.fromString<CreatedBlockedAreaInfo>(s, {
      id: areaId,
      spatialId: s,
    })
  );

  const model = new CuboidCollection<CreatedBlockedAreaInfo>(
    await Promise.all(spatialIdObjs.map((s) => s.createCuboid()))
  );

  return model;
};

const States = {
  Initializing: 0,
  Running: 1,
  Errored: 2,
} as const;
type States = (typeof States)[keyof typeof States];

/** 位置情報モニタリング・登録画面 */
export const WatchingFragment = () => {
  const store = useStoreApi();
  const { minimumIntervalSec, highAccuracy, defaultAltitude, zoomLevel, areaSize, followCamera } =
    useStore(store, (s) => s.settings, shallow);
  const setPage = useStore(store, (s) => s.setPage);
  const updateSettings = useStore(store, (s) => s.updateSettings);
  const updateViewerData = useStore(store, (s) => s.updateViewerData);

  const [state, setState] = useState<States>(States.Initializing);
  const [spatialIds, setSpatialIds] = useState<string[]>(null);
  const [disableExitButton, setDisableExitButton] = useState(false);
  const watcherIdRef = useRef<number | null>(null);
  const lastAreaIdRef = useRef<string | null>(null);

  const authInfo = useAuthInfo((s) => s.authInfo);

  // States.Running 状態でページ移動・リロード等の操作が行われた場合、警告
  useWarnOnRouteChange(
    state === States.Running,
    '位置情報のモニタリング中です。終了させてから他の画面に移動してください。',
    true
  );

  useMount(() => {
    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        updateViewerData((draft) => {
          draft.currentPosition = position;
        });
        setState(States.Running);

        // 変化があった旨ブラウザーから通知を受けたら、空間 ID 列を再生成する
        const spatialIds = areaToSpatialIds(
          position.coords.longitude,
          position.coords.latitude,
          position.coords.altitude ?? defaultAltitude,
          areaSize,
          zoomLevel
        );

        setSpatialIds(spatialIds);
      },
      (e) => {
        console.error(e);
        setState(States.Errored);
      },
      {
        enableHighAccuracy: highAccuracy,
      }
    );
    watcherIdRef.current = watcherId;
  });

  const endPositionWatching = () => {
    if (watcherIdRef.current !== null) {
      navigator.geolocation.clearWatch(watcherIdRef.current);
      watcherIdRef.current = null;
    }
  };

  const deleteLastArea = async () => {
    if (lastAreaIdRef.current !== null) {
      try {
        await deleteBlockedArea({ baseUrl: apiBaseUrl, authInfo, id: lastAreaIdRef.current });
      } catch (e) {
        console.error(e);
        warnIfTokenExpired(e);
      }
      lastAreaIdRef.current = null;
    }
  };

  const registerArea = async (spatialIds: string[]) => {
    try {
      // エリアを現在の情報で再生成
      const createdBlockedArea = await createBlockedArea({
        baseUrl: apiBaseUrl,
        authInfo,
        payload: {
          blockedArea: {
            id: '0',
            spatialIdentifications: spatialIds.map((x) => ({ ID: x })),
            startTime: '0',
            endTime: '0',
          },
        },
      });

      // 前回登録したエリアを削除
      await deleteLastArea();

      // 今回のエリア ID を記憶
      const areaId = createdBlockedArea.areaId;
      lastAreaIdRef.current = areaId;

      // モデル表示に反映する
      const model = await spatialIdsToModel(spatialIds, areaId);
      updateViewerData((draft) => {
        draft.model = castDraft(model);
      });
    } catch (e) {
      console.error(e);
      warnIfTokenExpired(e);
    }
  };

  const registerAreaThrottled = useThrottledCallback(registerArea, minimumIntervalSec * 1000, {
    trailing: false,
  });

  useDeepCompareEffect(() => {
    const execute = async () => {
      if (spatialIds === null) {
        return;
      }

      // 登録 → 旧モデル削除、ただしスロットリングする
      await registerAreaThrottled(spatialIds);
    };
    execute();
  }, [spatialIds]);

  useUnmount(() => {
    // 念の為
    endPositionWatching();
  });

  const onExitButtonClick = async () => {
    setDisableExitButton(true);

    registerAreaThrottled.cancel();
    endPositionWatching();
    await deleteLastArea();
    updateViewerData((draft) => {
      draft.currentPosition = null;
      draft.model = null;
    });

    setPage(Pages.Settings);
  };

  const onFollowCameraChange = (ev: ChangeEvent<HTMLInputElement>) => {
    updateSettings((draft) => {
      draft.followCamera = ev.target.checked;
    });
  };

  const followCameraId = useId();

  return (
    <>
      <p>
        {state === States.Initializing && '位置情報を取得しています...'}
        {state === States.Running &&
          '位置情報のモニタリング中です。自動で現在位置を割込禁止エリアに反映します。'}
        {state === States.Errored && '位置情報取得に失敗しました。'}
      </p>

      <div>
        <Checkbox
          className="mr-2"
          id={followCameraId}
          checked={followCamera}
          onChange={onFollowCameraChange}
        />
        <label htmlFor={followCameraId}>カメラ位置の自動追従</label>
      </div>

      <NavigationButtons>
        <Button onClick={onExitButtonClick} disabled={disableExitButton}>
          終了する
        </Button>
      </NavigationButtons>
    </>
  );
};
