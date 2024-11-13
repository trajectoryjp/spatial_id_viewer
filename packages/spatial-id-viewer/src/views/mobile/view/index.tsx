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

const MobileStrengthViewer = (props: Props) => {
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const loadModel = useLoadModel('mobile');
  const loadModels = useLoadModels('mobile');
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
        featureName="モバイル情報"
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
    color: `hsla(
      \${feature["RSI"]} >= 0
        ? (1 - log(clamp(\${feature["RSI"]}, 1, 100)) / log(100)) * 2 / 3
        : (log(clamp(\${feature["RSI"]} *-1, 1, 100)) / log(100)) * 2 / 3,
      1, 
      0.6, 
      ${tileOpacity}
    )`,
  });
export default WithAuthGuard(MobileStrengthViewer);
