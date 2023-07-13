import { Credit, UrlTemplateImageryProvider } from 'cesium';

export const aerialPhotoImageryProvider = new UrlTemplateImageryProvider({
  url: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
  credit: new Credit(
    '<p><a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 (ベースマップ 写真)</a></p>' +
      '<p>Images on 世界衛星モザイク画像 obtained from site https://lpdaac.usgs.gov/data_access maintained by the NASA Land Processes Distributed Active Archive Center (LP DAAC), USGS/Earth Resources Observation and Science (EROS) Center, Sioux Falls, South Dakota, (Year). Source of image data product.</p>' +
      '<p>データソース：Landsat8画像（GSI,TSIC,GEO Grid/AIST）, Landsat8画像（courtesy of the U.S. Geological Survey）, 海底地形（GEBCO）</p>'
  ),
  minimumLevel: 2,
  maximumLevel: 18,
});
