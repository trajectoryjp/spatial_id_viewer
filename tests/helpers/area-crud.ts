import { expect, Page, Route } from '@playwright/test';

/** 登録・取得・削除系 API の待機タイムアウト */
export const API_TIMEOUT = 30_000;

/** 取得系 (範囲表示) の待機タイムアウト */
export const LOAD_TIMEOUT = 60_000;

/** 範囲検索 (表示範囲で検索) が最大範囲として使うズームレベル (show-models.tsx の MIN_Z) */
const VIEW_TILE_Z = 16;

/** z16 のタイル座標 */
export interface TileXY {
  x: number;
  y: number;
}

/** 経度・緯度から WebMercator のタイル座標を求める */
const lonLatToTile = (lon: number, lat: number, z: number): TileXY => {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** z;
  return {
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n),
  };
};

/**
 * テストデータを作成する基準の z16 タイル (東京湾上 139.8, 35.48)。
 * 既存データが入っていない海上にすることで、範囲検索の応答がテストで作成したデータだけになる。
 */
const BASE_TILE = lonLatToTile(139.8, 35.48, VIEW_TILE_Z);

/**
 * テストごとに使う z16 タイル。基準タイルから東へ index 個ずらす (1 タイル約 500m)。
 * 種別ごとに別タイルにして、同時実行や失敗ランの残骸で範囲検索の結果が混ざらないようにする。
 */
export const testTile = (index: number): TileXY => ({ x: BASE_TILE.x + index, y: BASE_TILE.y });

/**
 * 矩形選択に使う固定座標 (カメラ: タイル中心の上空 5000m 真下向き・ビューポート 1280x720 前提)。
 * 画面中央 (640, 360) がタイル中心で、1px は地上約 4.5m。
 * 範囲検索は検索範囲内のボクセルしか返さず、テストは応答のボクセル列と登録分の一致を取るため、
 * 矩形は z16 タイル (約 500m 四方) に収まる大きさ (中央から ±30px、約 270m 四方) にする。
 * 左側のナビゲーションパネル (幅 384px) にはかからない。
 */
const RECT_POINT_1 = { x: 610, y: 330 };
const RECT_POINT_2 = { x: 670, y: 390 };

/**
 * 作成・表示で明示的に指定する高度 (f)。
 * アプリは地形高さから f を自動計算するが、地形取得に失敗すると異常な f を送って登録に失敗する。
 * テストでは自動値を使わず 0 を入力する。
 * 作成 (z20) の f=0 は高度 0〜32m、表示 (z16) の f=0 は高度 0〜512m で、作成分を含む。
 */
const TILE_F = 0;

/** カメラ高度 (viewer/index.tsx の defaultDestination と同じ 5000m) */
const CAMERA_HEIGHT = 5000;

/** 表示・削除フェーズで必要となるデータタイプ情報 */
export interface ViewerTarget {
  /** 表示・削除ページのパス */
  viewPath: string;
  /** 「{featureName} {id} を表示しています」などに使われる表示名 */
  featureName: string;
  /** タブ型ページの場合のタブ名 */
  tabName?: string;
  /**
   * 範囲検索で登録 objectId での照合をスキップし、応答全体のボクセル列と登録分の一致で検証する種別 (地形)。
   */
  rangeSearchWithoutObjectId?: boolean;
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
 * 変化しなくなり、かつ目標地点から 30m 以内にあることを検証する。
 * 静止しているのに目標から離れている場合 (初回読み込み時に起きる) はページを再読込して
 * プリセットをやり直す。矩形を z16 タイルに収めるため、許容誤差は小さくしている。
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
    if (offset >= 30) {
      await page.reload();
    }
    expect(offset, `カメラが目標地点にいません (ずれ 約${Math.round(offset)}m)`).toBeLessThan(30);
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

/**
 * 2 つの空間 ID 列が、並び順と重複を無視して同じボクセルの集合か検証する (soft)。
 * 失敗時は不足・余分なボクセルの数と例を添える。
 */
const expectSameVoxelSet = (actual: string[], expected: string[], message: string) => {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = [...expectedSet].filter((id) => !actualSet.has(id));
  const extra = [...actualSet].filter((id) => !expectedSet.has(id));
  expect
    .soft(
      { missing: missing.length, extra: extra.length },
      [
        message,
        `応答 ${actualSet.size} 個, 登録 ${expectedSet.size} 個`,
        `不足 ${missing.length} 個 (例: ${missing.slice(0, 3).join(', ') || 'なし'})`,
        `余分 ${extra.length} 個 (例: ${extra.slice(0, 3).join(', ') || 'なし'})`,
      ].join('\n')
    )
    .toEqual({ missing: 0, extra: 0 });
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
    // ハンドラ内で unroute すると元のリクエストがそのまま送られて二重送信になるため、
    // times: 1 で 1 回だけ捕捉させる
    const handler = async (route: Route) => {
      clearTimeout(timer);
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
    page.route(url, handler, { times: 1 });
  });

/** 捕捉した API 呼び出しを失敗メッセージ用に整形する */
const describeApiCall = ({ at, request, status, body }: ApiCall) =>
  `リクエスト: ${request}\n応答 (${at}): HTTP ${status}, 本文 ${body.length} バイト`;

/**
 * 登録 API (put-object / put-reserve-area) の呼び出しを捕捉する (失敗時のメッセージ用)。
 * 登録は副作用があるためルートを挟まず、応答 (ストリームではない JSON) をそのまま読む。
 * 登録ボタンを押す前に呼び、登録後に await する。
 */
export const captureRegistration = (page: Page): Promise<ApiCall> =>
  page
    .waitForResponse(
      (res) => res.request().method() === 'POST' && /\/put-(object|reserve-area)$/.test(res.url()),
      { timeout: API_TIMEOUT }
    )
    .then(async (res) => ({
      at: new Date().toISOString(),
      request: res.request().postData() ?? '',
      status: res.status(),
      body: await res.text(),
    }));

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

/** 矩形ベースの作成フロー全体を指定 z16 タイルの中心で実行し、登録された ID を返す */
export const createArea = async (
  page: Page,
  hooks: CreateAreaHooks,
  tile: TileXY
): Promise<string> => {
  const center = tileCenterLonLat(tile, VIEW_TILE_Z);
  await presetCamera(page, center);
  await page.goto(hooks.createPath);
  // カメラ静定の確認は再読込を伴うことがあるため、タブ切り替えはその後に行う
  await waitForCameraSettled(page, center);
  if (hooks.tabName) {
    await selectTab(page, hooks.tabName);
  }
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
  return extractRegisteredId(page, await registration);
};

/** 登録結果画面から「登録された ID: {数字}」を抽出する (失敗時は登録 API の応答を添える) */
export const extractRegisteredId = async (page: Page, registration: ApiCall): Promise<string> => {
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
 * 範囲検索は、get-object で取得した保存済みの空間 ID が属する z16 タイルに対して行い、
 * 応答のボクセル列 (objectId は問わない) が保存済みの空間 ID と集合として一致することを確認する。
 * 範囲検索は検索範囲内のボクセルしか返さないため、作成したボクセルがそのタイルに
 * 収まっていることを先に検証する。削除後は同じ範囲から保存済みの空間 ID が消えることを確認する。
 * 作成フローの形式 (矩形・JSON アップロード) に依存しないため、全データタイプで共用できる。
 */
export const verifyAndDeleteViaViewer = async (
  page: Page,
  target: ViewerTarget,
  objectId: string
) => {
  // ID 検索: 保存された実体 (空間 ID) を get-object から取得する
  await page.goto(target.viewPath);
  if (target.tabName) {
    await selectTab(page, target.tabName);
  }
  const storedIds = extractSpatialIds(await searchById(page, objectId));
  await expectModelDisplayed(page, target.featureName, objectId);
  expect(storedIds, `get-object 応答に ${objectId} の空間 ID がありません`).not.toHaveLength(0);

  // 作成したボクセルが範囲検索の z16 タイルに収まっていること
  const tile = tileOf(storedIds[0]);
  const outside = storedIds.filter((id) => {
    const t = tileOf(id);
    return t.x !== tile.x || t.y !== tile.y;
  });
  expect(
    outside,
    `作成したボクセルが範囲検索の z16 タイル ${tile.x}/${tile.y} に収まっていません (範囲外 ${outside.length} 個、例: ${outside[0]})`
  ).toHaveLength(0);

  // 範囲検索 (soft: 失敗しても削除まで進めて残骸を消す):
  // 通常は応答に登録 objectId があり、そのボクセル列が保存済みの空間 ID と一致すること。
  // 地形 (rangeSearchWithoutObjectId) は応答全体のボクセル列が保存済みの空間 ID と一致すること。
  const range = `範囲検索 ${VIEW_TILE_Z}/${tile.x}/${tile.y}`;
  const before = await loadModelsInView(page, target, tile);
  const objects = groupVoxelsByObject(before.body);
  if (!target.rangeSearchWithoutObjectId) {
    expect
      .soft(
        objects.has(objectId),
        `${range} の応答に objectId ${objectId} がありません (応答の objectId: ${
          [...objects.keys()].join(', ') || 'なし'
        })\n${describeApiCall(before)}`
      )
      .toBe(true);
  }
  expectSameVoxelSet(
    target.rangeSearchWithoutObjectId ? [...objects.values()].flat() : objects.get(objectId) ?? [],
    storedIds,
    `${range} の応答のボクセルが ${objectId} の保存済み空間 ID と一致しません\n${describeApiCall(
      before
    )}`
  );

  // ID 検索 → 削除: 範囲検索の表示状態をページ再読込でリセットしてから行う
  await page.goto(target.viewPath);
  if (target.tabName) {
    await selectTab(page, target.tabName);
  }
  await searchById(page, objectId);
  await expectModelDisplayed(page, target.featureName, objectId);
  await deleteDisplayedModel(page);

  // 削除確認 (ID 検索)
  await expectModelNotFound(page, objectId);

  // 削除確認 (範囲検索): 登録 objectId (地形は保存済みだった空間 ID) が応答から消えていること
  const after = await loadModelsInView(page, target, tile);
  const afterObjects = groupVoxelsByObject(after.body);
  if (!target.rangeSearchWithoutObjectId) {
    expect(
      afterObjects.has(objectId),
      `削除後も ${range} に objectId ${objectId} が残っています\n${describeApiCall(after)}`
    ).toBe(false);
  }
  const stored = new Set(storedIds);
  const remaining = [...afterObjects.values()].flat().filter((id) => stored.has(id));
  expect(
    remaining,
    `削除後も ${range} に ${objectId} のボクセルが残っています (${remaining.length} 個、例: ${
      remaining[0]
    })\n${describeApiCall(after)}`
  ).toHaveLength(0);
};
