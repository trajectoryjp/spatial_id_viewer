import { Cesium3DTileStyle, Viewer as CesiumViewer } from 'cesium';
import { Button, Checkbox, TextInput } from 'flowbite-react';
import { ChangeEvent, useRef, useState } from 'react';
import { useUnmount } from 'react-use';
import { CesiumComponentRef } from 'resium';

import { CuboidCollection } from 'spatial-id-converter';

import { Navigation, NavigationButtons } from '#app/components/navigation';
import { ViewerContainer } from '#app/components/viewer';
import { CuboidCollectionModel } from '#app/components/viewer/cuboid-collection-model';
import { replaceNaN } from '#app/utils/replace-nan';

import { Viewer } from '#app-internal/components/viewer';
import {
  DEFAULT_BOTTOM_ALTITUDE,
  DEFAULT_PAGE_SOFT_SIZE,
  DEFAULT_TOP_ALTITUDE,
  DEFAULT_ZOOM_LEVEL,
} from '#app-internal/views/barriers-internal/view/constants';
import {
  InternalBarrierInfo,
  useLoadModels,
} from '#app-internal/views/barriers-internal/view/hooks/load-models';

const States = {
  Default: 0,
  Errored: 1,
} as const;
type States = (typeof States)[keyof typeof States];

export const AreaViewer = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();
  const [loadModels, loading] = useLoadModels(viewerRef);

  const [state, setState] = useState<States>(States.Default);
  const [models, setModels] = useState<CuboidCollection<InternalBarrierInfo>[]>([]);
  const [bottomAltitude, setBottomAltitude] = useState(DEFAULT_BOTTOM_ALTITUDE);
  const [topAltitude, setTopAltitude] = useState(DEFAULT_TOP_ALTITUDE);
  const [pageSoftSize, setPageSoftSize] = useState(DEFAULT_PAGE_SOFT_SIZE);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);
  const [isActive, setIsActive] = useState(true);
  const [organizationId, setOrganizationId] = useState('0');
  const [groupId, setGroupId] = useState('0');

  const onBottomAltitudeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setBottomAltitude(replaceNaN(ev.target.valueAsNumber, DEFAULT_BOTTOM_ALTITUDE));
  };

  const onTopAltitudeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTopAltitude(replaceNaN(ev.target.valueAsNumber, DEFAULT_TOP_ALTITUDE));
  };

  const onPageSoftSizeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setPageSoftSize(replaceNaN(ev.target.valueAsNumber, DEFAULT_PAGE_SOFT_SIZE));
  };

  const onZoomLevelChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(replaceNaN(ev.target.valueAsNumber, DEFAULT_ZOOM_LEVEL));
  };

  const onIsActiveChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setIsActive(ev.target.checked);
  };

  const onOrganizationIdChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setOrganizationId(ev.target.value);
  };

  const onGroupIdChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setGroupId(ev.target.value);
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const onLoadModelsButtonClick = () => {
    const abortController = new AbortController();
    const execute = async () => {
      const currentBottomAltitude = Math.min(bottomAltitude, topAltitude);
      const currentTopAltitude = Math.max(bottomAltitude, topAltitude);
      for await (const model of loadModels(
        {
          bottomAltitude: currentBottomAltitude,
          topAltitude: currentTopAltitude,
          pageSoftSize,
          zoomLevel,
          isActive,
          organizationId,
          groupId,
        },
        abortController.signal
      )) {
        setModels((models) => [...models, model]);
      }
    };

    abortControllerRef.current?.abort();
    abortControllerRef.current = abortController;
    execute().catch((x) => {
      console.error(x);
      setState(States.Errored);
    });
  };

  const onBackButtonClick = () => {
    setState(States.Default);
  };

  useUnmount(() => {
    abortControllerRef.current?.abort();
  });

  return (
    <ViewerContainer>
      <Viewer ref={viewerRef}>
        {models.map((model, index) => (
          <CuboidCollectionModel key={index} data={model} style={tilesetStyle} />
        ))}
      </Viewer>
      <Navigation>
        {state === States.Errored ? (
          <>
            <p>エラーが発生しました。</p>
            <NavigationButtons>
              <Button color="dark" onClick={onBackButtonClick}>
                読み込み
              </Button>
            </NavigationButtons>
          </>
        ) : (
          <>
            <p>描画範囲の内部形式バリアを表示</p>
            <NavigationButtons>
              <Button color="dark" onClick={onLoadModelsButtonClick} disabled={loading}>
                読み込み
              </Button>
            </NavigationButtons>
            <div className="mt-2">
              高度の範囲 (MSL):
              <TextInput type="number" value={bottomAltitude} onChange={onBottomAltitudeChange} />
              <TextInput
                className="mt-2"
                type="number"
                value={topAltitude}
                onChange={onTopAltitudeChange}
              />
            </div>
            <div>
              取得するバリアーマップの最大数:
              <TextInput type="number" value={pageSoftSize} onChange={onPageSoftSizeChange} />
            </div>
            <div>
              ズームレベル:
              <TextInput type="number" value={zoomLevel} onChange={onZoomLevelChange} />
            </div>
            <div>
              有効 / 無効:
              <Checkbox className="ml-2" checked={isActive} onChange={onIsActiveChange} />
            </div>
            <div>
              組織 ID:
              <TextInput value={organizationId} onChange={onOrganizationIdChange} />
            </div>
            <div>
              グループ ID:
              <TextInput value={groupId} onChange={onGroupIdChange} />
            </div>
          </>
        )}
      </Navigation>
    </ViewerContainer>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default AreaViewer;
