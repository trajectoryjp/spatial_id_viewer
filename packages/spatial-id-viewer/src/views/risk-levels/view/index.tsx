import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { GetRiskLevelPayload, getRiskLevels } from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';
import { RequestTypes } from 'spatial-id-svc-common';

import { AreaViewer } from '#app/components/area-viewer';
import { createUseRiskLevelsModels } from '#app/components/area-viewer/create-use-risk-levels-models';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { WithStore } from '#app/components/area-viewer/store';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';

interface RiskInfo extends Record<string, unknown> {
  max: number;
  min: number;
  avarage: number;
}

interface riskLevel {
  id: {
    ID: string;
  };
  max: number;
  min: number;
  avarage: number;
  sourceList: {
    objectId: string;
    riskLevel: number;
  }[];
}

interface Risks {
  riskLevels: riskLevel[];
}

const useLoadModelsRisk = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModelsRisk = useCallback(async (displayDetails: DisplayDetails) => {
    const spatialIds = await processRiskLevels(
      getRiskLevels({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetRiskLevelPayload,
      })
    );

    const model = new CuboidCollection<RiskInfo>(
      await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModelsRisk;
};

const processRiskLevels = async (result: AsyncGenerator<StreamResponse<Risks>>) => {
  const spatialIds = new Map<string, SpatialId<RiskInfo>>();
  for await (const resp of result) {
    for (const spatialIdentification of resp.result.riskLevels) {
      const spatialId = spatialIdentification.id.ID;
      try {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<RiskInfo>(spatialId, {
            min: spatialIdentification.min,
            max: spatialIdentification.max,
            avarage: spatialIdentification.avarage,
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
  return spatialIds;
};

const RiskLevelsViewer = () => {
  const loadModelsRisk = useLoadModelsRisk();
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const useModels = createUseRiskLevelsModels({
    loadModelsRisk,
  });

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };

  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity));
  }, [tileOpacity]);

  return (
    <>
      <Head>
        <title>リスクレベルの表示</title>
      </Head>
      <AreaViewer
        featureName="リスクレベル"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.RISK_LEVEL}
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
      </AreaViewer>
    </>
  );
};

const tilesetStyleFn = (tileOpacity: number) =>
  new Cesium3DTileStyle({
    color: `hsla((1 - log(clamp(\${feature["avarage"]}, 1, 100)) / log(100)) * 2 / 3, 1, 0.6, ${tileOpacity})`,
  });

export default WithAuthGuard(WithStore(RiskLevelsViewer));
