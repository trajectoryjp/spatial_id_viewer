import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { SpatialDefinition } from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';

import { mapGetOrSet } from '#app/utils/map-get-or-set';

interface AreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

interface GetAreas {
  objects: SpatialDefinition[];
}

export const processArea = (area: any, type: string) => {
  const areaId = area.objectId;
  const spatialIds = new Map<string, SpatialId<AreaInfo>>();
  for (const spatialIdentification of area[type].voxelValues) {
    const spatialId = spatialIdentification.id.ID;
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<AreaInfo>(spatialId, {
          id: areaId,
          spatialId,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return spatialIds;
};

export const processAreas = async (
  result: AsyncGenerator<StreamResponse<GetAreas>>,
  type: string
) => {
  const areas = new Map<string, Map<string, SpatialId<AreaInfo>>>();
  for await (const resp of result) {
    for (const area of resp.result.objects) {
      const areaId = area.objectId;
      const spatialIds = mapGetOrSet(areas, areaId, () => new Map<string, SpatialId<AreaInfo>>());

      for (const [spatialId, spatialIdObj] of processArea(area, type).entries()) {
        spatialIds.set(spatialId, spatialIdObj);
      }
    }
  }

  return areas;
};

export const convertToModels = async (areas: Map<string, Map<string, SpatialId<AreaInfo>>>) => {
  const models = new Map(
    (await Promise.all(
      [...areas.entries()]
        .filter(([, v]) => v.size)
        .map(async ([areaId, spatialIds]) => [
          areaId,
          new CuboidCollection(
            await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
          ),
        ])
    )) as [string, CuboidCollection<AreaInfo>][]
  );

  return models;
};
