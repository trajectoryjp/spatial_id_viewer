import { expect, Page } from '@playwright/test';

/** 登録・取得・削除系 API の待機タイムアウト */
export const API_TIMEOUT = 30_000;

/** 取得系 (範囲表示) の待機タイムアウト */
export const LOAD_TIMEOUT = 60_000;

/**
 * 矩形選択に使う固定座標 (初期カメラ位置: 新宿上空 5000m・ビューポート 1280x720 前提)。
 * 範囲検索は画面中央の z16 セル単位で行われるため、矩形は中央セルに重なる位置に描く。
 * 矩形を大きくしすぎると、タイル Z 画面がマウント時に既定の z=20 で行う
 * ボクセル分割が重すぎてハングするため、この大きさ (z20 で 200 タイル強) に留める。
 * 代わりにクリック位置→地点の対応を安定させるため、選択前にカメラをホームボタンで
 * 初期位置・初期向きへ即時移動させる (waitForCameraSettled を参照)。
 */
const RECT_POINT_1 = { x: 661, y: 507 };
const RECT_POINT_2 = { x: 836, y: 638 };

/**
 * 範囲表示のボクセルを探すグリッド走査のクリック座標 (ビューポート 1280x720 前提)。
 * 作成時の矩形は固定座標なので、初期カメラで範囲表示するとボクセルは毎回
 * 画面中央やや上 (おおよそ x: 600-730, y: 270-390) の領域に描画される。
 * 描画位置のずれとボクセルの大きさ (最小 30px 程度) を考慮し、
 * その周辺を細かい刻みで走査する。可能性の高い中心から順にクリックする。
 */
const VOXEL_SEARCH_GRID: { x: number; y: number }[] = [];
for (let y = 200; y <= 450; y += 25) {
  for (let x = 520; x <= 840; x += 35) {
    VOXEL_SEARCH_GRID.push({ x, y });
  }
}
VOXEL_SEARCH_GRID.sort(
  (a, b) => Math.hypot(a.x - 670, a.y - 330) - Math.hypot(b.x - 670, b.y - 330)
);

/** 表示・削除フェーズで必要となるデータタイプ情報 */
export interface ViewerTarget {
  /** 表示・削除ページのパス */
  viewPath: string;
  /** 「{featureName} {id} を表示しています」などに使われる表示名 */
  featureName: string;
  /** タブ型ページの場合のタブ名 */
  tabName?: string;
  /**
   * 範囲検索後のボクセル描画確認 (クリック選択) をスキップする。
   * 範囲検索 API (get-value) がデータを返さないタイプ (オーバーレイエリア) 用。
   */
  skipRangeVoxelCheck?: boolean;
}

/**
 * カメラ位置の永続化 (localStorage の cameraInfo) を持ち込まないようにする。
 * Viewer 初期化前に消す必要があるため addInitScript を使う。
 */
export const resetCameraInfo = async (page: Page) => {
  await page.addInitScript(() => localStorage.removeItem('cameraInfo'));
};

/** タブ型ページ (気象・電波強度) で対象タブへ切り替える */
export const selectTab = async (page: Page, tabName: string) => {
  await page.getByRole('tab', { name: tabName }).click();
};

/** 正規表現のメタ文字をエスケープする */
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 経度・緯度・高さ (WGS84) を ECEF 座標へ変換する */
const lonLatToEcef = (lonDeg: number, latDeg: number, height: number) => {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const e2 = f * (2 - f);
  const lon = (lonDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const n = a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
  return {
    x: (n + height) * Math.cos(lat) * Math.cos(lon),
    y: (n + height) * Math.cos(lat) * Math.sin(lon),
    z: (n * (1 - e2) + height) * Math.sin(lat),
  };
};

/** アプリの初期カメラ位置 (新宿上空 5000m) — viewer/index.tsx の defaultDestination と同じ */
const DEFAULT_CAMERA_ECEF = lonLatToEcef(139.70361, 35.69389, 5000);

/**
 * カメラを初期位置・初期向き (新宿上空 5000m・真下向き) に確実に合わせる。
 * ビューア右上のホームボタンは duration: 0 で即座に初期状態へ移動するため、
 * 読み込み時のカメラ飛行アニメーションの完了を待つよりも決定的になる。
 * その後、アプリが 500ms ごとに localStorage (cameraInfo) へ保存するカメラ位置が
 * 初期位置と一致して安定したことを確認する。
 * (カメラの位置・向きがずれたままクリックすると意図しない地点にデータを作成してしまう)
 */
export const waitForCameraSettled = async (page: Page) => {
  // ホームボタン (右上ツールバーの先頭) で初期位置・初期向きへ即時移動する
  const homeButton = page.locator('button.cesium-button').first();
  await expect(async () => {
    await homeButton.click();
    const before = await page.evaluate(() => localStorage.getItem('cameraInfo'));
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => localStorage.getItem('cameraInfo'));
    expect(before, 'カメラ位置がまだ保存されていません').not.toBeNull();
    expect(before === after, 'カメラが移動中です').toBe(true);

    const destination = JSON.parse(after!)?.destination;
    expect(destination, 'カメラ位置が保存されていません').toBeTruthy();
    const distance = Math.hypot(
      destination.x - DEFAULT_CAMERA_ECEF.x,
      destination.y - DEFAULT_CAMERA_ECEF.y,
      destination.z - DEFAULT_CAMERA_ECEF.z
    );
    expect(distance, `カメラが初期位置にいません (ずれ 約${Math.round(distance)}m)`).toBeLessThan(
      200
    );
  }).toPass({ timeout: LOAD_TIMEOUT });
};

/**
 * 期待テキストが表示されるまで canvas クリックをリトライする。
 * Cesium の地形・タイルセットの読み込みが遅れているとクリックが無効になるため。
 */
const clickCanvasUntil = async (
  page: Page,
  position: { x: number; y: number },
  expected: string | RegExp,
  timeout = API_TIMEOUT
) => {
  await expect(async () => {
    await page.locator('canvas').first().click({ position });
    await expect(page.getByText(expected)).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout });
};

/** 矩形の 2 点を選択し、タイル Z / 高度 (F) を既定値のまま確定する */
const selectSimpleRectangle = async (page: Page) => {
  await expect(page.getByText('左上の地点を選択してください')).toBeVisible();
  await clickCanvasUntil(page, RECT_POINT_1, '右下の地点を選択してください');
  await clickCanvasUntil(page, RECT_POINT_2, '矢印キーでタイルのサイズを選択してください');
  await page.getByRole('button', { name: '次へ' }).click();
  // タイル数に応じてモデルの再構築 (ジオイド高さ取得など) が走るため、画面遷移は長めに待つ
  await expect(page.getByText('高度 (f の値) を入力してください')).toBeVisible({
    timeout: API_TIMEOUT,
  });
  await page.getByRole('button', { name: '確定' }).click();
};

/** 作成フローのタイプ固有ステップ */
export interface CreateAreaHooks {
  /** 作成ページのパス */
  createPath: string;
  /** タブ型ページの場合のタブ名 */
  tabName?: string;
  /** タイル F 確定後に挟まる固有入力 (気象値・RSI など) */
  afterTileF?: (page: Page) => Promise<void>;
  /** SelectAddOrSend「登録」後に挟まる固有入力 (制限タイプ・アドレス・SSID・携帯情報など) */
  beforeRegister?: (page: Page) => Promise<void>;
}

/** 矩形ベースの作成フロー全体を実行し、登録された ID を返す */
export const createArea = async (page: Page, hooks: CreateAreaHooks): Promise<string> => {
  await page.goto(hooks.createPath);
  if (hooks.tabName) {
    await selectTab(page, hooks.tabName);
  }
  await waitForCameraSettled(page);
  await selectSimpleRectangle(page);
  if (hooks.afterTileF) {
    await hooks.afterTileF(page);
  }
  // 範囲追加はせず登録へ進む (高度の確定でもモデル再構築が走るため長めに待つ)
  await expect(
    page.getByText('範囲を追加するか、完了して登録に進むか選択してください')
  ).toBeVisible({ timeout: API_TIMEOUT });
  await page.getByRole('button', { name: '登録', exact: true }).click();
  if (hooks.beforeRegister) {
    await hooks.beforeRegister(page);
  }
  return await extractRegisteredId(page);
};

/** 登録結果画面から「登録された ID: {数字}」を抽出する */
export const extractRegisteredId = async (page: Page): Promise<string> => {
  const result = page.getByText(/登録された ID: \d+/);
  await expect(result).toBeVisible({ timeout: API_TIMEOUT });
  return (await result.innerText()).match(/\d+/)![0];
};

/** 「ID で検索」からオブジェクトを取得する */
export const searchById = async (page: Page, id: string) => {
  await page.getByRole('button', { name: 'ID で検索' }).click();
  await page.getByRole('spinbutton').fill(id);
  await page.getByRole('button', { name: '取得する' }).click();
};

/** 「{featureName} {id} を表示しています」が表示されることを検証する */
export const expectModelDisplayed = async (page: Page, featureName: string, id: string) => {
  await expect(page.getByText(`${featureName} ${id} を表示しています`)).toBeVisible({
    timeout: API_TIMEOUT,
  });
};

/** 表示中のモデルを「削除する」で削除し、ID 入力画面へ戻るのを待つ */
export const deleteDisplayedModel = async (page: Page) => {
  await page.getByRole('button', { name: '削除する' }).click();
  await expect(page.getByText(/の ID を入力してください/)).toBeVisible({ timeout: API_TIMEOUT });
};

/** 削除済み ID の再検索でリソースが見つからないことを検証する */
export const expectModelNotFound = async (page: Page, id: string) => {
  await page.getByRole('spinbutton').fill(id);
  await page.getByRole('button', { name: '取得する' }).click();
  // toast (react-toastify) は自動で消えるため先に検証する
  await expect(
    page.getByRole('alert').getByText('リソースが見つかりませんでした。')
  ).toBeVisible({ timeout: API_TIMEOUT });
  await expect(page.getByText('エラーが発生しました。')).toBeVisible();
};

/**
 * 「表示範囲で検索」で読み込み、ボクセルが実際に地図上へ描画されていることを検証する。
 * ボクセルは Cesium の 3D タイルセットとして描画され DOM に現れないため、
 * グリッド走査でクリックし「{featureName} {id} が選択されています」が出ることで描画有無を確認する。
 * ID の一致までは要求しない (並列実行で他のデータが選択されても許容する) が、
 * 何も描画されていなければどの点でも選択されないため確実に失敗する。
 */
export const loadModelsInView = async (
  page: Page,
  featureName: string,
  options?: { skipVoxelCheck?: boolean }
) => {
  await page.getByRole('button', { name: '表示範囲で検索' }).click();
  await expect(page.getByText(`描画範囲の${featureName}を表示`)).toBeVisible();
  await page.getByRole('button', { name: '読み込み' }).click();
  await expect(page.getByRole('button', { name: '読み込み' })).toBeEnabled({
    timeout: LOAD_TIMEOUT,
  });
  await expect(page.getByText('エラーが発生しました。')).not.toBeVisible();
  if (options?.skipVoxelCheck) {
    return;
  }

  // グリッド上の点を順にクリックし、どこかでボクセルが選択されるまで走査を繰り返す
  const selectedText = page.getByText(
    new RegExp(`${escapeRegExp(featureName)} \\d+ が選択されています`)
  );
  await expect(async () => {
    for (const position of VOXEL_SEARCH_GRID) {
      await page.locator('canvas').first().click({ position });
      try {
        await expect(selectedText).toBeVisible({ timeout: 200 });
        return;
      } catch {
        // この点にはボクセルが無いので次の点を試す
      }
    }
    // 1 周して見つからなければ失敗にして走査をやり直す (タイルセットの描画待ち)
    expect(false, 'ボクセルがクリックで選択できませんでした').toBe(true);
  }).toPass({ timeout: LOAD_TIMEOUT });
};

/**
 * ビューアページで「表示 (ID 検索) → 表示 (範囲検索・描画確認) → 削除 → 削除確認」を実行する。
 * 作成フローの形式 (矩形・JSON アップロード) に依存しないため、全データタイプで共用できる。
 */
export const verifyAndDeleteViaViewer = async (
  page: Page,
  target: ViewerTarget,
  objectId: string
) => {
  // 表示 (範囲検索・描画確認): 作成時と同じ初期カメラ位置なら、ボクセルはグリッド走査の範囲内に描画される
  await page.goto(target.viewPath);
  if (target.tabName) {
    await selectTab(page, target.tabName);
  }
  await waitForCameraSettled(page);
  await loadModelsInView(page, target.featureName, {
    skipVoxelCheck: target.skipRangeVoxelCheck,
  });

  // 表示 (ID 検索) → 削除: 範囲検索のボクセル選択状態をページ再読込でリセットしてから行う
  await page.goto(target.viewPath);
  if (target.tabName) {
    await selectTab(page, target.tabName);
  }
  await searchById(page, objectId);
  await expectModelDisplayed(page, target.featureName, objectId);
  await deleteDisplayedModel(page);

  // 削除確認
  await expectModelNotFound(page, objectId);
};
