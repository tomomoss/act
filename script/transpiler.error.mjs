"use strict";

/**
 * トランスパイル処理に直接関係するエラーを表すErrorオブジェクトです。
 */
const TranspileError = class extends Error {
  constructor(...args) {
    super(...args)
    this.name = new.target.name;
  }
};

export {
  TranspileError
}
