/** number が NaN のとき replaceTo を返し、それ以外は number をそのまま返す */
export const replaceNaN = (number: number, replaceTo: number) => {
  return Number.isNaN(number) ? replaceTo : number;
};
