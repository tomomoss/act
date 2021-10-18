/**
 * トランスパイル処理に直接関係するエラーを表す独自エラー型です。
 * @param {number} row エラー発生行を指す数値です。
 * @param {number} column エラー発生列を指す数値です。
 * @param {string} message エラー内容を説明するメッセージです。
 */
const TranspileError = class extends Error {
  constructor(row: number, column: number, message: string) {
    super(message);
    this.column = column;
    this.name = new.target.name;
    this.row = row;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  // エラーが発生した列番号です。
  column: number;

  // エラーが発生した行番号です。
  row: number;
};

export {
  TranspileError,
};
