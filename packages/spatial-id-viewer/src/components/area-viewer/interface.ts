import { FigureRequest } from 'spatial-id-converter';

export interface DisplayDetails {
  figure: FigureRequest;
  requestType?: string[];
  period?: {
    startTime: number;
    endTime: number;
  };
  includeReserveArea?: boolean;
  zoomLevel?: number;
}

/** モデルを操作する際に使用する関数・変数群 */
export interface ModelControllers {
  /** ID を指定してモデルを 1 つ読み込む */
  loadModel?: (id: string) => Promise<void>;
  /** 空間 ID を指定してモデルを複数読み込む */
  loadModels?: (displayDetails: DisplayDetails) => Promise<void>;
  /** ID を指定してモデルを 1 つ削除する */
  deleteModel?: (id: string) => Promise<void>;
  /** 読み込まれているモデルをアンロードする */
  unloadModels: () => Promise<void>;
  /** Promise 外で発生したエラー */

  loadAirSpaceModels?: (displayDetails: DisplayDetails) => Promise<void>;
  loadAirSpaceModelsStream?: (displayDetails: DisplayDetails) => Promise<void>;

  loadModelsRisk?: (displayDetails: DisplayDetails) => Promise<void>;

  error?: unknown;
}
