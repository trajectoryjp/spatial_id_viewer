import { test } from '@playwright/test';

import { createArea, resetCameraInfo, verifyAndDeleteViaViewer } from './helpers/area-crud';
import { AREA_TYPE_CONFIGS } from './helpers/data-type-configs';

/**
 * 矩形ベースの作成フローを持つ全データタイプの CRUD (作成→表示→削除) テスト。
 * テストは自己完結しており、自分で作成したデータを表示・削除する。
 */
for (const config of AREA_TYPE_CONFIGS) {
  test(`${config.name}: 作成→表示→削除の CRUD ができる`, async ({ page }) => {
    // Cesium の読み込みと複数回の API 呼び出しを待つため、テスト全体のタイムアウトを延長する
    test.setTimeout(300_000);
    await resetCameraInfo(page);

    // 作成: 矩形を選択しタイプ固有の情報を入力して登録する
    const created = await createArea(page, config);
    console.log(`[e2e] created ${config.name} -> ${created.objectId} (${created.spatialId})`);

    // 表示 (範囲検索・ID 検索) → 削除 → 削除確認
    await verifyAndDeleteViaViewer(page, config, created);
  });
}
