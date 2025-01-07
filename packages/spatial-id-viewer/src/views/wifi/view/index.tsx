import { Cesium3DTileStyle, Viewer } from 'cesium';
import { RangeSlider } from 'flowbite-react';
import Head from 'next/head';
import { ChangeEvent, useEffect, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { RequestTypes } from 'spatial-id-svc-common';

import { createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import { TabAreaViewer } from '#app/components/tab-area-viewer';
import {
  useDeleteModel,
  useLoadModel,
  useLoadModels,
} from '#app/views/mobile/view/hooks/load-models';

interface Props {
  reference: React.RefObject<CesiumComponentRef<Viewer>>;
}

const WifiStrengthViewer = (props: Props) => {
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const loadModel = useLoadModel('wifi');
  const loadModels = useLoadModels('wifi');
  const deleteModel = useDeleteModel();

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };

  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity));
  }, [tileOpacity]);

  const useModels = createUseModels({
    loadModel,
    loadModels,
    deleteModel,
  });

  return (
    <>
      <Head>
        <title>電波強度情報の表示・削除</title>
      </Head>
      <TabAreaViewer
        featureName="Wi-Fi情報"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.MICROWAVE}
        reference={props.reference}
      >
        <input
          type="range"
          className="h-1 accent-yellow-500"
          value={tileOpacity}
          onChange={onTileOpacityChange}
          min={0}
          max={1}
          step={0.01}
        />
      </TabAreaViewer>
    </>
  );
};

const tilesetStyleFn = (tileOpacity: number) =>
  new Cesium3DTileStyle({
    color: `hsla((1-(clamp(\${feature["RSI (dB)"]} + 120, 1, 60) / 60)) * 2 / 3,
      1,
      0.6,
      ${tileOpacity}
    )`,
  });

export default WithAuthGuard(WifiStrengthViewer);
