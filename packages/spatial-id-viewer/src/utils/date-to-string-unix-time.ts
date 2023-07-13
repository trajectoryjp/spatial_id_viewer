/** API 用ユーティリティ:
 * date を UNIX 時刻文字列に変換する、無効な値だったときは '0' を返す
 */
export const dateToStringUnixTime = (date: Date | null) =>
  String(date ? Math.floor(+date / 1000) : 0);
