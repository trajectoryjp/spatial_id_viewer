import { TEST_LOCATION } from './area-crud';
/** 経度・緯度から WebMercator のタイル座標を計算する */
const lonLatToTile = (lon: number, lat: number, z: number): { x: number; y: number } => {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** z;
  return {
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n),
  };
};

/**
 * 予約ルート作成ページへアップロードする JSON を生成する。
 * 構造は views/reserved-routes/create/index.tsx の validateSchema に合わせる
 * (アップロードした JSON がそのまま API ペイロードとして送信される)。
 *
 * - 空間 ID はテスト地点 (TEST_LOCATION: 東京湾上) 付近のズーム 20 のタイルにし、
 *   範囲検索の描画確認でグリッド走査のクリックに当たる大きさ (3x3 ブロック) にする
 * - 同じタイルに予約が重なると Collision エラーになるため、
 *   位置を少しランダムにずらし、予約時間も短くして失敗ランの残骸が自然消滅するようにする
 * - 日時は int64 の UNIX 秒文字列、occupation は protobuf Duration 形式 (API の要求)
 */
export const makeReservedRouteJson = () => {
  const z = 20;
  const f = 0;
  const { x, y } = lonLatToTile(TEST_LOCATION.lon, TEST_LOCATION.lat, z);

  // 再実行時の衝突を避けるためのランダムオフセット (画面内に収まる範囲)
  const offsetX = Math.floor(Math.random() * 4);
  const offsetY = Math.floor(Math.random() * 4);

  // 予約は 5 分間とし、失敗したテストの残骸がすぐ期限切れになるようにする
  const now = Math.floor(Date.now() / 1000);
  const period = { startTime: String(now), endTime: String(now + 5 * 60) };

  // クリックで選択しやすいよう 3x3 タイルのブロックにする
  const voxelValues = [];
  for (let dx = 0; dx < 3; dx++) {
    for (let dy = 0; dy < 3; dy++) {
      voxelValues.push({
        id: { ID: `${z}/${f}/${x + offsetX + dx}/${y + offsetY + dy}` },
        reservationTime: { period },
      });
    }
  }

  return {
    area: [
      {
        reservationTime: { period, occupation: '300s' },
        voxelValues,
      },
    ],
  };
};
