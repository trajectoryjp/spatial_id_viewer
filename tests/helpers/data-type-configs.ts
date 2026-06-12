import { expect, Page } from '@playwright/test';

import { CreateAreaHooks, ViewerTarget } from './area-crud';

/** 矩形ベースの作成フローを持つデータタイプの CRUD テスト設定 */
export interface AreaTypeConfig extends CreateAreaHooks, ViewerTarget {
  /** テストタイトル用の識別子 */
  name: string;
}

/** ラベル付きの入力欄へ値を入力する (各 fragment は label htmlFor を張っている) */
const fillByLabel = async (page: Page, label: string, value: string) => {
  await page.getByLabel(label).fill(value);
};

/**
 * 全データタイプの設定一覧。
 * Channel は本ビューア上で作成・表示ができないため対象外。
 * 予約ルートは JSON アップロードの特殊フローのため reserved-routes-crud.spec.ts で扱う。
 * タイプ固有の入力値は実データに近い現実的な値を使う。
 */
export const AREA_TYPE_CONFIGS: AreaTypeConfig[] = [
  {
    name: '地形バリア (Terrain)',
    createPath: '/barriers/create',
    viewPath: '/barriers',
    featureName: '地形バリア',
  },
  {
    name: '建物バリア (Building)',
    createPath: '/building-barriers/create',
    viewPath: '/building-barriers',
    featureName: '建物バリア',
  },
  {
    name: '立ち入り禁止エリア (RestrictedArea)',
    createPath: '/blocked-areas/create',
    viewPath: '/blocked-areas',
    featureName: '制限エリア予約',
    beforeRegister: async (page) => {
      // 制限の種類を選択して登録する
      await expect(page.getByText('制限の種類を選択してください')).toBeVisible();
      await page.getByLabel('制限タイプ').selectOption('飛行制限');
      await page.getByRole('button', { name: '登録', exact: true }).click();
    },
  },
  {
    name: '緊急エリア (EmergencyArea)',
    createPath: '/emergency-areas/create',
    viewPath: '/emergency-areas',
    featureName: '緊急エリアの予約',
  },
  {
    name: 'オーバーレイエリア (OverlayArea)',
    createPath: '/overlay-areas/create',
    viewPath: '/overlay-areas',
    featureName: 'オーバーレイエリアの予約',
    beforeRegister: async (page) => {
      // 所有システムのアドレス情報を入力する
      await expect(page.getByText('所有システムのアドレス情報を入力してください')).toBeVisible();
      await page.getByLabel('gRPCサーバーアドレスおよびポート').check();
      // getByLabel('アドレス') はラジオボタンのラベルにも部分一致するため textbox に限定する
      await page.getByRole('textbox', { name: 'アドレス' }).fill('grpc.example.com:50051');
      await page.getByRole('button', { name: '確定' }).click();
    },
  },
  {
    name: '気象 (Weather)',
    createPath: '/weather/create',
    viewPath: '/weather',
    featureName: '気象情報',
    tabName: '現在の天気',
    afterTileF: async (page) => {
      // 現実的な気象値を入力する (日時は既定値のまま)
      await fillByLabel(page, 'windSpeed (knot)', '12');
      await fillByLabel(page, 'windDirection (degree)', '225');
      await fillByLabel(page, 'cloudRate (%)', '40');
      await fillByLabel(page, 'temperature (°C)', '24');
      await fillByLabel(page, 'dewPoint (°C)', '18');
      await fillByLabel(page, 'pressure (hPa)', '1013');
      await fillByLabel(page, 'precipitation (mm/h)', '2');
      await fillByLabel(page, 'visibility (km)', '10');
      await fillByLabel(page, 'gggg', '1200');
      await page.getByRole('button', { name: '確定' }).click();
    },
  },
  {
    name: '気象予報 (WeatherForecast)',
    createPath: '/weather/create',
    viewPath: '/weather',
    featureName: '気象情報',
    tabName: '天気予報',
    afterTileF: async (page) => {
      // 現実的な予報値を入力する (日時は既定値のまま)
      await fillByLabel(page, 'windSpeed (knot)', '8');
      await fillByLabel(page, 'windDirection (degree)', '180');
      await fillByLabel(page, 'cloudRate (%)', '70');
      await fillByLabel(page, 'precipitation (mm/h)', '1');
      await page.getByRole('button', { name: '確定' }).click();
    },
  },
  {
    name: '電波強度・携帯 (Microwave Mobile)',
    createPath: '/signal-strength/create',
    viewPath: '/signal-strength',
    featureName: 'モバイル情報',
    tabName: '携帯',
    afterTileF: async (page) => {
      // 受信強度 (現実的な携帯の RSI 値) を入力する
      await expect(page.getByText('RSI情報を入力してください')).toBeVisible();
      await fillByLabel(page, 'RSI (dB)', '-85');
      await page.getByRole('button', { name: '確定' }).click();
    },
    beforeRegister: async (page) => {
      // 日本の MCC (440) と docomo の MNC (10) を入力する
      await expect(page.getByText('携帯電話情報を入力してください')).toBeVisible();
      await fillByLabel(page, 'モバイルの国番号', '440');
      await fillByLabel(page, 'モバイルネットワークコード', '10');
      await page.getByRole('button', { name: '確定' }).click();
    },
  },
  {
    name: '電波強度・Wi-Fi (Microwave WiFi)',
    createPath: '/signal-strength/create',
    viewPath: '/signal-strength',
    featureName: 'Wi-Fi情報',
    tabName: 'Wi-Fi',
    afterTileF: async (page) => {
      // 受信強度 (現実的な Wi-Fi の RSI 値) を入力する
      await expect(page.getByText('RSI情報を入力してください')).toBeVisible();
      await fillByLabel(page, 'RSI (dB)', '-60');
      await page.getByRole('button', { name: '確定' }).click();
    },
    beforeRegister: async (page) => {
      await expect(page.getByText('ssid情報を入力してください')).toBeVisible();
      await fillByLabel(page, 'ssid', 'e2e-test-ssid');
      await page.getByRole('button', { name: '確定' }).click();
    },
  },
];
