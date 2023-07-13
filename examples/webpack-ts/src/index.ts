// 使用するモジュールの機能をインポート
import {
  getBlockedAreas,
  GetBlockedAreasRequest,
  GetBlockedAreasResponse,
} from 'spatial-id-svc-area';
import { ApiAuthError, AuthInfo, StreamResponse } from 'spatial-id-svc-base';
import { login } from 'spatial-id-svc-common';
import { getReservedRoute } from 'spatial-id-svc-route';

// グローバルにエクスポートする関数の型定義
declare global {
  interface Window {
    execLogin: () => Promise<void>;
    execGetReservedRoute: () => Promise<void>;
    execGetBlockedAreas: () => Promise<void>;
  }
}

// API サーバのベース URL (最後の / は含めない)
const baseUrl = 'https://trjxdev.trajectory.jp';

// 認証情報を保存する変数
let authInfo: AuthInfo | null = null;

// ログイン ----------------------------------------------------------------
window.execLogin = async () => {
  // UI から入力値を取得
  const userId = (document.querySelector('#login-userId') as HTMLInputElement).value;
  const password = (document.querySelector('#login-password') as HTMLInputElement).value;

  // 出力欄
  const resultElement = document.querySelector('#login-result') as HTMLInputElement;

  // ライブラリの関数を呼び出し、UI に反映
  try {
    resultElement.value = '読み込み中';
    authInfo = await login({
      baseUrl,
      userId,
      password,
    });
    resultElement.value = `認証成功: ${authInfo.token}`;
  } catch (e) {
    resultElement.value = 'エラー: 認証失敗';
  }
};

// 予約ルートを 1 件取得 ----------------------------------------------------------------
window.execGetReservedRoute = async () => {
  // UI から入力値を取得
  const id = (document.querySelector('#getReservedRoute-id') as HTMLInputElement).value;

  // 出力欄
  const resultElement = document.querySelector('#getReservedRoute-result') as HTMLTextAreaElement;

  if (authInfo === null) {
    resultElement.value = 'エラー: ログインしてください';
    return;
  }

  // ライブラリの関数を呼び出し、UI に反映
  try {
    resultElement.value = '読み込み中';
    const result = await getReservedRoute({
      baseUrl,
      authInfo,
      reservedRouteId: id,
    });

    // 出力用にインデントする
    const resultJson = JSON.stringify(result, null, 2);

    resultElement.value = resultJson;
  } catch (e) {
    if (e instanceof ApiAuthError) {
      // 認証失敗時
      resultElement.value = 'エラー: トークン期限切れ';
    } else {
      // その他
      resultElement.value = 'エラー: 呼び出し失敗';
    }
  }
};

// 割込禁止エリアを複数取得 ----------------------------------------------------------------
window.execGetBlockedAreas = async () => {
  // UI から入力値を取得
  const spatialId = (document.querySelector('#getBlockedAreas-spatialId') as HTMLInputElement)
    .value;

  // 出力欄
  const resultElement = document.querySelector('#getBlockedAreas-result') as HTMLTextAreaElement;

  if (authInfo === null) {
    resultElement.value = 'エラー: ログインしてください';
    return;
  }

  // リクエストボディが必要:
  // getBlockedAreas の場合、GetBlockedAreasRequest インタフェースを満たすように記述する
  const payload = {
    boundary: [{ ID: spatialId }],
    hasSpatialId: true,
    startTime: '0',
    endTime: '0',
  } as GetBlockedAreasRequest;

  // チャンク受信結果を溜め込む配列
  const resultArray: StreamResponse<GetBlockedAreasResponse>[] = [];

  try {
    resultElement.value = '読み込み中';

    // ストリームの処理には for await を使用する
    for await (const chunk of getBlockedAreas({
      baseUrl,
      authInfo,
      payload,
    })) {
      // チャンクを受信するたびに、ここを通る

      // チャンクを配列に格納
      resultArray.push(chunk);

      // 配列を画面に出力する
      const resultJson = JSON.stringify(resultArray, null, 2);
      resultElement.value = resultJson;
    }
  } catch (e) {
    if (e instanceof ApiAuthError) {
      // 認証失敗時
      resultElement.value = 'エラー: トークン期限切れ';
    } else {
      // その他
      resultElement.value = 'エラー: 呼び出し失敗';
    }
  }
};
