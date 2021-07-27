"use strict";

import {
  TranspileError
} from "./transpiler.error.mjs";

/**
 * 構文解析を行います。
 * 当関数はモジュール外に出すため引数検査を実施しておきます。
 * @param {Array<object>} tokens 解析対象となる字句です。
 * @param {...any} rest 引数検査のためだけに定義された引数です。
 * @returns {string} 変換されたソースコードです。
 */
const parse = (tokens, ...rest) => {
  if (typeof tokens === "undefined") {
    throw new Error("第1引数が指定されていません。");
  }
  if (!(Array.isArray(tokens))) {
    throw new Error("第1引数は配列である必要があります。");
  }
  if (rest.length !== 0) {
    throw new Error("引数の数が不正です。");
  }
  return "";
};

export {
  parse
}
