import { TileXY } from './area-crud';

/**
 * 予約ルート作成ページへアップロードする JSON を生成する。
 * 構造は views/reserved-routes/create/index.tsx の validateSchema に合わせる
 * (アップロードした JSON がそのまま API ペイロードとして送信される)。
 *
 * - 空間 ID は指定した z16 タイル (海上) の内側にあるズーム 20 の 3x3 ブロックにする。
 *   範囲検索は検索範囲内のボクセルしか返さないため、タイルからはみ出さない位置に置く
 * - 同じタイルに予約が重なると Collision エラーになるため、
 *   位置を少しランダムにずらし、予約時間も短くして失敗ランの残骸が自然消滅させる
 * - 日時は int64 の UNIX 秒文字列、occupation は protobuf Duration 形式 (API の要求)
 */
export const makeReservedRouteJson = (tile: TileXY) => {
  const z = 20;
  const f = 0;
  // z16 タイルは z20 で 16x16 タイル。中央寄り (6〜11) に収める
  const scale = 2 ** (z - 16);
  const x = tile.x * scale + 6;
  const y = tile.y * scale + 6;

  // 再実行時の衝突を避けるためのランダムオフセット (タイル内に収まる範囲)
  const offsetX = Math.floor(Math.random() * 4);
  const offsetY = Math.floor(Math.random() * 4);

  // 予約は 5 分間とし、失敗したテストの残骸がすぐ期限切れになるようにする
  const now = Math.floor(Date.now() / 1000);
  const period = { startTime: String(now), endTime: String(now + 5 * 60) };

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
