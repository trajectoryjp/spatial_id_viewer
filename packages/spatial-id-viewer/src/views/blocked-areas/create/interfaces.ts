/** エリア全体に関する追加の情報 */
export interface WholeAreaInfo {
  startTime: Date | null;
  endTime: Date | null;
}

export enum RestrictionEnums {
  TYPE_FREE = 'TYPE_FREE',
  TYPE_P = 'TYPE_P',
  TYPE_R = 'TYPE_R',
  TYPE_K = 'TYPE_K',
  TYPE_N = 'TYPE_N',
}
export interface RestrictionAdditionalInfo {
  type: string;
}
