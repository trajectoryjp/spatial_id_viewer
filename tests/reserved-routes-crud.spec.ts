import { expect, test } from '@playwright/test';

import {
  API_TIMEOUT,
  captureRegistration,
  extractRegisteredId,
  resetCameraInfo,
  verifyAndDeleteViaViewer,
} from './helpers/area-crud';
import { makeReservedRouteJson } from './helpers/reserved-route-fixture';

/**
 * 予約ルート (ReserveArea) の CRUD テスト。
 * 作成は他のタイプと異なり JSON ファイルのアップロードで行う。
 */
test('予約ルート (ReserveArea): 作成→表示→削除の CRUD ができる', async ({ page }) => {
  // Cesium の読み込みと複数回の API 呼び出しを待つため、テスト全体のタイムアウトを延長する
  test.setTimeout(300_000);
  await resetCameraInfo(page);

  // 作成: 予約ルートの JSON をメモリ上で生成してアップロードする
  // (アプリ側が file.type === 'application/json' を検証するため mimeType の指定が必須)
  await page.goto('/reserved-routes/create');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'reserved-route.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(makeReservedRouteJson())),
  });
  const registration = captureRegistration(page);
  await page.getByRole('button', { name: 'レジスター' }).click();
  const { spatialId } = await registration;
  await expect(page.getByText('登録が正常に完了しました。')).toBeVisible({
    timeout: API_TIMEOUT,
  });
  const objectId = await extractRegisteredId(page, await registration);

  // 表示 (範囲検索・ID 検索) → 削除 → 削除確認
  await verifyAndDeleteViaViewer(
    page,
    { viewPath: '/reserved-routes', featureName: '予約ルート' },
    { objectId, spatialId }
  );
});
