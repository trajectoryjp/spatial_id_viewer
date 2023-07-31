import { ErrorDef } from 'spatial-id-svc-route';

// 共通処理だがレスポンスが ErrorDef 型に縛られなくても良いよう、
// route-creator 内部では呼び出さず、外側から任意に呼べる util 関数としている

/**
 * err から取得できたパスのエラーを erroredPathIndices に反映する
 * @param erroredPathIndices パスのエラーの格納先
 * @param err API レスポンスから取得した ErrorDef
 */
export const addErroredPathsFromErrorDef = (erroredPathIndices: Set<number>, err: ErrorDef) => {
  [
    ...err.noDataPaths,
    ...err.noPathPaths,
    ...err.unexpectedErrorPaths,
    ...err.waypointsInBarrierPaths,
  ]
    .map((path) =>
      // パスのエラーは本 UI 上では前の点のエラーとして格納しているため、
      // それぞれの pathMap の 2 つの key のうち小さい方 (＝前の点のインデックス) をエラー登録する
      Math.min(...Object.keys(path.pathMap).map(Number))
    )
    .forEach((index) => erroredPathIndices.add(index));
};
