"use strict";

/**
 * 引数で受け取ったソースコードを変換して返します。
 * 当関数はモジュール外に出すため引数検査を実施しておきます。
 * @param {string} sourceCode 変換対象となるソースコードです。
 * @param {...any} rest 引数検査のためだけに用意した引数です。
 * @returns {null|string} 変換されたソースコードです。変換が失敗した場合はnullを返します。
 */
const transpile = (sourceCode, ...rest) => {
  if (typeof sourceCode === "undefined") {
    throw new Error("第1引数が指定されていません。");
  }
  if (typeof sourceCode !== "string") {
    throw new Error("第1引数は文字列である必要があります。");
  }
  if (rest.length !== 0) {
    throw new Error("引数の数が不正です。");
  }
  return sourceCode;
};

export {
  transpile
}
