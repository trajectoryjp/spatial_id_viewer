/**
 * map からキー key の値を取得できたときはそれを返す
 * 取得できなかったときは func(key) を呼び、その戻り値をキー key の値としてセットしてから返す
 */
export const mapGetOrSet = <K, V>(map: Map<K, V>, key: K, func: (key: K) => V) => {
  if (map.has(key)) {
    return map.get(key);
  }
  const value = func(key);
  map.set(key, value);
  return value;
};
