import { expect, Page, Route } from '@playwright/test';

/** 登録・取得・削除系 API の待機タイムアウト */
export const API_TIMEOUT = 30_000;

/** 取得系 (範囲表示) の待機タイムアウト */
export const LOAD_TIMEOUT = 60_000;

/**
 * テストデータを作成する地点 (東京湾上)。
 * 既存データが入っていない海上にすることで、範囲検索の応答がテストで作成したデータだけになり、
 * 既存データを拾って通ってしまうことや、残骸との衝突を避ける。
 * 作成・表示とも localStorage の cameraInfo でこの地点の真上 5000m にカメラをプリセットする。
 */
export const TEST_LOCATION = { lon: 139.8, lat: 35.5 };

/**
 * 矩形選択に使う固定座標 (カメラ: TEST_LOCATION 上空 5000m 真下向き・ビューポート 1280x720 前提)。
 * 矩形を大きくしすぎると作成画面の処理が重くなるため、この大きさ (z20 で 200 タイル強) に留める。
 * 着地した正確な位置は get-object の保存済み空間 ID から求めるため、多少のズレは表示フェーズに影響しない。
 */
const RECT_POINT_1 = { x: 661, y: 507 };
const RECT_POINT_2 = { x: 836, y: 638 };

/** 範囲検索 (表示範囲で検索) が最大範囲として使うズームレベル (show-models.tsx の MIN_Z) */
const VIEW_TILE_Z = 16;

/**
 * 作成・表示で明示的に指定する高度 (f)。
 * アプリは地形高さから f を自動計算するが、地形取得に失敗すると異常な f を送って登録に失敗する。
 * テストでは自動値を使わず 0 を入力する。
 * 作成 (z20) の f=0 は高度 0〜32m、表示 (z16) の f=0 は高度 0〜512m で、作成分を含む。
 */
const TILE_F = 0;

/** カメラ高度 (viewer/index.tsx の defaultDestination と同じ 5000m) */
const CAMERA_HEIGHT = 5000;

/** z16 のタイル座標 */
export interface TileXY {
  x: number;
  y: number;
}

/** 表示・削除フェーズで必要となるデータタイプ情報 */
export interface ViewerTarget {
  /** 表示・削除ページのパス */
  viewPath: string;
  /** 「{featureName} {id} を表示しています」などに使われる表示名 */
  featureName: string;
  /** タブ型ページの場合のタブ名 */
  tabName?: string;
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

/** WebMercator タイルの中心の経度・緯度を求める */
const tileCenterLonLat = (tile: TileXY, z: number) => {
  const n = 2 ** z;
  const lon = ((tile.x + 0.5) / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (tile.y + 0.5)) / n))) * 180) / Math.PI;
  return { lon, lat };
};

/**
 * 次のページ読み込みから、カメラを指定地点の真上 5000m (真下向き) で開始させる。
 * アプリは localStorage の cameraInfo を初期カメラ位置として使う (viewer/index.tsx の useMount)。
 * Viewer 初期化前に書く必要があるため addInitScript を使い、page.goto の前に呼ぶ。
 */
export const presetCamera = async (page: Page, { lon, lat }: { lon: number; lat: number }) => {
  const cameraInfo = {
    destination: lonLatToEcef(lon, lat, CAMERA_HEIGHT),
    orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 },
  };
  await page.addInitScript(
    (value) => localStorage.setItem('cameraInfo', value),
    JSON.stringify(cameraInfo)
  );
};

/**
 * カメラがプリセットした地点の真上 5000m に静止したことを確認する。
 * アプリが 500ms ごとに localStorage (cameraInfo) へ保存するカメラ位置が
 * 変化しなくなり、かつ目標地点から 200m 以内にあることを検証する。
 */
export const waitForCameraSettled = async (
  page: Page,
  { lon, lat }: { lon: number; lat: number }
) => {
  const target = lonLatToEcef(lon, lat, CAMERA_HEIGHT);
  const distance = (a: { x: number; y: number; z: number }, b: typeof a) =>
    Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  const readDestination = async () => {
    const info = await page.evaluate(() => localStorage.getItem('cameraInfo'));
    expect(info, 'カメラ位置がまだ保存されていません').not.toBeNull();
    const destination = JSON.parse(info!)?.destination;
    expect(destination, 'カメラ位置が保存されていません').toBeTruthy();
    return destination as { x: number; y: number; z: number };
  };
  await expect(async () => {
    const before = await readDestination();
    await page.waitForTimeout(800);
    const after = await readDestination();
    // 描画中のわずかな揺らぎは移動とみなさない
    const moved = distance(before, after);
    const offset = distance(after, target);
    expect(
      moved,
      `カメラが移動中です (0.8 秒で約${moved.toFixed(1)}m 移動、目標から約${Math.round(offset)}m)`
    ).toBeLessThan(1);
    expect(offset, `カメラが目標地点にいません (ずれ 約${Math.round(offset)}m)`).toBeLessThan(200);
  }).toPass({ timeout: LOAD_TIMEOUT });
};

/**
 * 次のページ読み込みから、カメラを指定 z16 タイルの真上で開始させる。
 * これで「表示範囲で検索」の取得範囲がそのタイルになる (作成時の着地ズレの影響を受けない)。
 */
const presetCameraOnTile = (page: Page, tile: TileXY) =>
  presetCamera(page, tileCenterLonLat(tile, VIEW_TILE_Z));

/** JSON 文字列中の空間 ID ("ID":"z/f/x/y") をすべて抽出する */
const extractSpatialIds = (json: string): string[] =>
  [...json.matchAll(/"ID":\s*"(\d+\/-?\d+\/\d+\/\d+)"/g)].map((m) => m[1]);

/** 空間 ID (z/f/x/y) が属する z16 タイル */
const tileOf = (spatialId: string): TileXY => {
  const [z, , x, y] = spatialId.split('/').map(Number);
  const scale = 2 ** (z - VIEW_TILE_Z);
  return { x: Math.floor(x / scale), y: Math.floor(y / scale) };
};

/**
 * 2 つの空間 ID が同じボクセルか、祖先・子孫の関係にあるか (ズームが違っても同じ領域を指すか)。
 * 保存されたボクセルは登録時と異なるズームで返ることがあるため、ズームを揃えて比較する。
 */
const isSameRegion = (a: string, b: string) => {
  const [lo, hi] = [a, b].map((id) => id.split('/').map(Number)).sort(([za], [zb]) => za - zb);
  const scale = 2 ** (hi[0] - lo[0]);
  return hi.slice(1).every((v, i) => Math.floor(v / scale) === lo[i + 1]);
};

/**
 * 行区切り JSON ストリームの応答を objectId ごとの空間 ID 一覧にまとめる。
 * objectId "0" の行は直前のオブジェクトのボクセルの続きとして扱う
 * (spatial-id-svc-area の getSignalArea と同じ解釈)。
 */
const groupVoxelsByObject = (body: string): Map<string, string[]> => {
  const objects = new Map<string, string[]>();
  let current = '';
  for (const line of body.split('\n').filter(Boolean)) {
    const objectId = line.match(/"objectId":\s*"(-?\d+)"/)?.[1] ?? current;
    if (objectId !== '0') {
      current = objectId;
    }
    objects.set(current, [...(objects.get(current) ?? []), ...extractSpatialIds(line)]);
  }
  return objects;
};

/** 捕捉した API 呼び出し */
interface ApiCall {
  /** 応答を受け取った時刻 (ISO 8601) */
  at: string;
  /** リクエスト本文 */
  request: string;
  /** HTTP ステータス */
  status: number;
  /** 応答本文 */
  body: string;
}

/**
 * 次に発生する指定 API の呼び出しをルート経由で捕捉し、リクエスト本文と応答本文を返す。
 * 応答はストリーム (行区切り JSON) で、ページ側が読み切った後に response.text() を呼ぶと
 * Chromium が "No data found for resource" を返すことがあるため、
 * Playwright 側で全文を取得してからページへ渡す。
 * API を呼ぶ操作の前に呼び、操作後に await する。
 */
const captureApiCall = (page: Page, url: RegExp, timeout: number): Promise<ApiCall> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      await page.unroute(url, handler);
      reject(new Error(`${url} の呼び出しを ${timeout}ms 以内に捕捉できませんでした`));
    }, timeout);
    const handler = async (route: Route) => {
      clearTimeout(timer);
      await page.unroute(url, handler);
      try {
        const response = await route.fetch();
        const body = await response.text();
        await route.fulfill({ response, body });
        resolve({
          at: new Date().toISOString(),
          request: route.request().postData() ?? '',
          status: response.status(),
          body,
        });
      } catch (e) {
        await route.abort();
        reject(e);
      }
    };
    page.route(url, handler);
  });

/** 捕捉した API 呼び出しを失敗メッセージ用に整形する */
const describeApiCall = ({ at, request, status, body }: ApiCall) =>
  `リクエスト: ${request}\n応答 (${at}): HTTP ${status}, 本文 ${body.length} バイト`;

/** 登録リクエストから得た情報 */
export interface Registration extends ApiCall {
  /** 送信された先頭の空間 ID (z/f/x/y) */
  spatialId: string;
}

/**
 * 登録 API (put-object / put-reserve-area) の呼び出しを捕捉し、送信された先頭の空間 ID を返す。
 * 登録ボタンを押す前に呼び、登録後に await する。
 */
export const captureRegistration = (page: Page): Promise<Registration> =>
  captureApiCall(page, /\/put-(object|reserve-area)$/, API_TIMEOUT).then((call) => {
    const [spatialId] = extractSpatialIds(call.request);
    expect(spatialId, '登録リクエストに空間 ID が含まれていません').toBeTruthy();
    return { ...call, spatialId };
  });

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
    // 地点確定後のモデル再構築で画面遷移が遅れることがあるため、再クリックまで長めに待つ
    await expect(page.getByText(expected)).toBeVisible({ timeout: 10_000 });
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
  // 自動計算された f を使わず、下限・上限とも TILE_F を入力する (値が同じでも入力して確実に反映させる)
  for (const input of await page.getByRole('spinbutton').all()) {
    await input.fill(String(TILE_F + 1));
    await input.fill(String(TILE_F));
  }
  await page.getByRole('button', { name: '適用' }).click();
  // 「適用」の非同期更新 (createStoreUpdater は Promise を返さない) が完了する前に「確定」すると、
  // 完了時に古い状態で store が上書きされて高度入力画面へ戻る。戻らなくなるまで確定を繰り返す。
  const tileFPrompt = page.getByText('高度 (f の値) を入力してください');
  await expect(async () => {
    await page.getByRole('button', { name: '確定' }).click();
    await expect(tileFPrompt).not.toBeVisible({ timeout: 3_000 });
    await page.waitForTimeout(1_000);
    await expect(tileFPrompt, '非同期更新の完了で高度入力画面へ戻されました').not.toBeVisible();
  }).toPass({ timeout: API_TIMEOUT });
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

/** 作成結果: 登録された ID と、登録リクエストの先頭の空間 ID */
export interface CreatedObject {
  objectId: string;
  spatialId: string;
}

/** 矩形ベースの作成フロー全体を実行し、登録された ID と空間 ID を返す */
export const createArea = async (page: Page, hooks: CreateAreaHooks): Promise<CreatedObject> => {
  await presetCamera(page, TEST_LOCATION);
  await page.goto(hooks.createPath);
  if (hooks.tabName) {
    await selectTab(page, hooks.tabName);
  }
  await waitForCameraSettled(page, TEST_LOCATION);
  await selectSimpleRectangle(page);
  if (hooks.afterTileF) {
    await hooks.afterTileF(page);
  }
  // 範囲追加はせず登録へ進む (高度の確定でもモデル再構築が走るため長めに待つ)
  await expect(
    page.getByText('範囲を追加するか、完了して登録に進むか選択してください')
  ).toBeVisible({ timeout: API_TIMEOUT });
  const registration = captureRegistration(page);
  await page.getByRole('button', { name: '登録', exact: true }).click();
  if (hooks.beforeRegister) {
    await hooks.beforeRegister(page);
  }
  const { spatialId } = await registration;
  return { objectId: await extractRegisteredId(page, await registration), spatialId };
};

/** 登録結果画面から「登録された ID: {数字}」を抽出する (失敗時は登録 API の応答を添える) */
export const extractRegisteredId = async (
  page: Page,
  registration: Registration
): Promise<string> => {
  const result = page.getByText(/登録された ID: \d+/);
  await expect(result, `登録結果が表示されません\n${describeApiCall(registration)}`).toBeVisible({
    timeout: API_TIMEOUT,
  });
  return (await result.innerText()).match(/\d+/)![0];
};

/** 「ID で検索」からオブジェクトを取得し、get-object の応答本文を返す */
export const searchById = async (page: Page, id: string): Promise<string> => {
  await page.getByRole('button', { name: 'ID で検索' }).click();
  await page.getByRole('spinbutton').fill(id);
  const call = captureApiCall(page, /\/get-object$/, API_TIMEOUT);
  await page.getByRole('button', { name: '取得する' }).click();
  return (await call).body;
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
  await expect(page.getByRole('alert').getByText('リソースが見つかりませんでした。')).toBeVisible({
    timeout: API_TIMEOUT,
  });
  await expect(page.getByText('エラーが発生しました。')).toBeVisible();
};

/**
 * 指定 z16 タイルの真上から表示ページを開き、「表示範囲で検索」でそのタイルを読み込んで
 * 範囲検索 API (get-value) の呼び出し内容を返す。
 * ボクセルは Cesium の 3D タイルセットとして描画され DOM に現れず、クリック位置も
 * 安定しないため、描画そのものではなく API 応答で範囲検索の結果を確認する。
 */
export const loadModelsInView = async (
  page: Page,
  target: ViewerTarget,
  tile: TileXY
): Promise<ApiCall> => {
  await presetCameraOnTile(page, tile);
  await page.goto(target.viewPath);
  if (target.tabName) {
    await selectTab(page, target.tabName);
  }
  await page.getByRole('button', { name: '表示範囲で検索' }).click();
  await expect(page.getByText(`描画範囲の${target.featureName}を表示`)).toBeVisible();
  // 高度 (f) を自動 (地表面付近) にせず TILE_F を指定する
  await page.getByRole('checkbox', { name: '自動 (地表面付近)' }).uncheck();
  await page.getByRole('spinbutton').fill(String(TILE_F));
  // カメラが指定タイルの真上にあり、取得範囲がそのタイルになるのを待つ
  const tileText = new RegExp(`取得範囲 .*${VIEW_TILE_Z}/${TILE_F}/${tile.x}/${tile.y}`);
  await expect(page.getByText(tileText)).toBeVisible({ timeout: LOAD_TIMEOUT });

  const call = captureApiCall(page, /\/get-value$/, LOAD_TIMEOUT);
  await page.getByRole('button', { name: '読み込み' }).click();
  const result = await call;
  await expect(page.getByRole('button', { name: '読み込み' })).toBeEnabled({
    timeout: LOAD_TIMEOUT,
  });
  await expect(page.getByText('エラーが発生しました。')).not.toBeVisible();
  return result;
};

/**
 * ビューアページで「ID 検索 → 範囲検索 → ID 検索 → 削除 → 削除確認 → 範囲検索」を実行する。
 * 範囲検索は、get-object で取得したサーバ保存済みの空間 ID のタイルに対して行い、
 * 応答に登録した objectId があり、そのボクセルに保存済み空間 ID が含まれることを確認する
 * (既存データを拾っただけでは通らない)。削除後は同じ範囲から objectId が消えることを確認する。
 * 作成フローの形式 (矩形・JSON アップロード) に依存しないため、全データタイプで共用できる。
 */
export const verifyAndDeleteViaViewer = async (
  page: Page,
  target: ViewerTarget,
  created: CreatedObject
) => {
  // ID 検索: サーバに保存された実体 (空間 ID) を get-object から取得する
  await page.goto(target.viewPath);
  if (target.tabName) {
    await selectTab(page, target.tabName);
  }
  const storedIds = extractSpatialIds(await searchById(page, created.objectId));
  await expectModelDisplayed(page, target.featureName, created.objectId);
  expect(
    storedIds,
    `get-object 応答に ${created.objectId} の空間 ID がありません`
  ).not.toHaveLength(0);
  const [storedId] = storedIds;
  if (!storedIds.includes(created.spatialId)) {
    console.log(
      `[e2e] ${created.objectId}: 登録リクエストの空間 ID ${created.spatialId} が保存データに無く、保存データは ${storedId} から始まります`
    );
  }

  // 範囲検索: 保存済み空間 ID のタイルを検索し、登録した objectId とそのボクセルが返ることを確認する
  // (soft: 失敗しても削除まで進めて残骸を消す)
  const tile = tileOf(storedId);
  const before = await loadModelsInView(page, target, tile);
  const objects = groupVoxelsByObject(before.body);
  const holders = [...objects].filter(([, ids]) => ids.some((id) => isSameRegion(id, storedId)));
  const range = `範囲検索 ${VIEW_TILE_Z}/${tile.x}/${tile.y}`;
  expect
    .soft(
      objects.has(created.objectId),
      [
        `${range} の応答に objectId ${created.objectId} がありません`,
        `応答の objectId: ${[...objects.keys()].join(', ') || 'なし'}`,
        `保存済み空間 ID ${storedId} を含む objectId: ${
          holders.map(([id]) => id).join(', ') || 'なし'
        }`,
        describeApiCall(before),
      ].join('\n')
    )
    .toBe(true);
  expect
    .soft(
      (objects.get(created.objectId) ?? []).some((id) => isSameRegion(id, storedId)),
      `${range} の応答の objectId ${
        created.objectId
      } に保存済み空間 ID ${storedId} が含まれていません\n${describeApiCall(before)}`
    )
    .toBe(true);

  // ID 検索 → 削除: 範囲検索の表示状態をページ再読込でリセットしてから行う
  await page.goto(target.viewPath);
  if (target.tabName) {
    await selectTab(page, target.tabName);
  }
  await searchById(page, created.objectId);
  await expectModelDisplayed(page, target.featureName, created.objectId);
  await deleteDisplayedModel(page);

  // 削除確認 (ID 検索)
  await expectModelNotFound(page, created.objectId);

  // 削除確認 (範囲検索): 削除した objectId が消えていること
  const after = await loadModelsInView(page, target, tile);
  expect(
    groupVoxelsByObject(after.body).has(created.objectId),
    `削除後も ${range} に objectId ${created.objectId} が残っています\n${describeApiCall(after)}`
  ).toBe(false);
};
