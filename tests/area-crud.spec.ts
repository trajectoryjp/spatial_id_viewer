import { test } from '@playwright/test';

import {
  createArea,
  resetCameraInfo,
  testTile,
  verifyAndDeleteViaViewer,
} from './helpers/area-crud';
import { AREA_TYPE_CONFIGS } from './helpers/data-type-configs';

/**
 * 矩形ベースの作成フローを持つ全データタイプの CRUD (作成→表示→削除) テスト。
 * テストは自己完結しており、自分で作成したデータを表示・削除する。
 * 種別ごとに別の z16 タイルを使う (testTile)。
 */
AREA_TYPE_CONFIGS.forEach((config, index) => {
  test(`${config.name}: 作成→表示→削除の CRUD ができる`, async ({ page }) => {
    // Cesium の読み込みと複数回の API 呼び出しを待つため、テスト全体のタイムアウトを延長する
    test.setTimeout(300_000);
    await resetCameraInfo(page);

    // 作成: 矩形を選択しタイプ固有の情報を入力して登録する
    const tile = testTile(index);
    const objectId = await createArea(page, config, tile);
    console.log(`[e2e] created ${config.name} -> ${objectId} (z16 tile ${tile.x}/${tile.y})`);

    // 表示 (範囲検索・ID 検索) → 削除 → 削除確認
    await verifyAndDeleteViaViewer(page, config, objectId);
  });
});
