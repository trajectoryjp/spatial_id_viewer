/** record からキー key を除いたオブジェクトを返す */
export const omitKey = <T1, T2 extends keyof T1>(object: T1, key: T2) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: _, ...rest } = object;
  return rest;
};
