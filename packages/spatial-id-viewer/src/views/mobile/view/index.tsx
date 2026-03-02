import { Cesium3DTileStyle, Viewer } from 'cesium';
import Head from 'next/head';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { RequestTypes } from 'spatial-id-svc-common';

import { createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import MultiRangeSlider from '#app/components/slider/multiRangeSlider';
import { TabAreaViewer } from '#app/components/tab-area-viewer';
import {
  useDeleteModel,
  useLoadModel,
  useLoadModels,
} from '#app/views/mobile/view/hooks/load-models';

interface Props {
  reference: React.RefObject<CesiumComponentRef<Viewer>>;
  setMin?: Dispatch<SetStateAction<number>>;
  setMax?: Dispatch<SetStateAction<number>>;
}

const MobileStrengthViewer = (props: Props) => {
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const [minValueTileSet, setMinValueTileSet] = useState(-200);
  const [maxValueTileSet, setMaxValueTileSet] = useState(-60);

  const loadModel = useLoadModel('mobile');
  const loadModels = useLoadModels('mobile');
  const deleteModel = useDeleteModel();

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };

  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity, minValueTileSet, maxValueTileSet));
  }, [tileOpacity, minValueTileSet, maxValueTileSet]);

  const useModels = createUseModels({
    loadModel,
    loadModels,
    deleteModel,
  });

  // const changeMin = (e: ChangeEvent<HTMLInputElement>) => {
  //   const value = Math.min(Number(e.target.valueAsNumber), maxValue - 1);
  //   setMinValue(value);
  //   props.setMin(value);
  // };

  // const changeMax = (e: ChangeEvent<HTMLInputElement>) => {
  //   const value = Math.min(Math.max(Number(e.target.valueAsNumber), minValue + 1));
  //   setMaxValue(value);
  //   props.setMax(value);
  // };

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
        signalType="mobile"
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

        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-lg font-semibold">RSI範囲を調整する</h2>

          <MultiRangeSlider
            min={-200}
            max={-60}
            setMax={props.setMax}
            setMin={props.setMin}
            setMaxValueTileSet={setMaxValueTileSet}
            setMinValueTileSet={setMinValueTileSet}
          />
        </div>
      </TabAreaViewer>
    </>
  );
};
const tilesetStyleFn = (tileOpacity: number, minRSI: number, maxRSI: number) => {
  return new Cesium3DTileStyle({
    color: `
      hsla(
        (1 - (clamp(((\${feature["RSI (dB)"]} === \${feature["RSI (dB)"]} ? \${feature["RSI (dB)"]} : ${minRSI}) - ${minRSI}) / (${maxRSI} - ${minRSI}), 0, 1))) * 2/3,
        1,
        0.6,
        ${tileOpacity}
      )
    `,
  });
};

export default WithAuthGuard(MobileStrengthViewer);
