/** 無効なパスが存在したときに発生させるエラー */
export class InvalidPathError extends Error {
  name = 'InvalidPathError';

  constructor(readonly pathIndices: Iterable<number>) {
    super('invalid path found');
  }
}
