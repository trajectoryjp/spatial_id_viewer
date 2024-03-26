/** 配列 array を count 個ごとに分割した配列を返す */
export const splitArrayIntoChunks = <T>(array: T[], count: number) => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += count) {
    result.push(array.slice(i, i + count));
  }
  return result;
};
