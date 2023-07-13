import { Cesium3DTileStyle } from 'cesium';
import { memo, useEffect, useState } from 'react';
import { Cesium3DTileset } from 'resium';

import { CuboidCollection } from 'spatial-id-converter';

export interface CuboidCollectionModelProps<
  Metadata extends Record<string, unknown> = Record<string, never>
> {
  data: CuboidCollection<Metadata>;
  style?: Cesium3DTileStyle;
}

const CuboidCollectionModelLayout = <
  Metadata extends Record<string, unknown> = Record<string, never>
>({
  data,
  style,
}: CuboidCollectionModelProps<Metadata>) => {
  const [tilesetUrl, setTilesetUrl] = useState<string | null>(null);

  useEffect(() => {
    const execute = async () => {
      if (data == null) {
        return setTilesetUrl(null);
      }

      setTilesetUrl(await data.create3DTilesetDataUrl());
    };

    execute();
  }, [data]);

  return <>{tilesetUrl && <Cesium3DTileset url={tilesetUrl} style={style} />}</>;
};

/** Viewer に CuboidCollection を表示させるためのコンポーネント */
export const CuboidCollectionModel = memo(
  CuboidCollectionModelLayout
) as typeof CuboidCollectionModelLayout;
