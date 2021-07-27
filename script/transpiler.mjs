"use strict";

import {
  TranspileError
} from "./transpiler.error.mjs";
import {
  parse
} from "./transpiler.parser.mjs";
import {
  tokenize
} from "./transpiler.tokenizer.mjs";


/**
 * 全てのプログラムに共通の処理を実装します。
 * @param {string} parsedSourceCode 構文解析されたソースコードです。
 * @returns {string} 共通処理を実装して完成したソースコードです。
 */
const addCommonCode = (parsedSourceCode) => {
  return `@ECHO OFF\n${parsedSourceCode}EXIT /B\n`;
};

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
  try {
    const tokens = tokenize(sourceCode);
    const parsedSourceCode = parse(tokens);
    const transpiledSourceCode = addCommonCode(parsedSourceCode);
    return transpiledSourceCode;
  } catch (error) {
    if (error instanceof TranspileError) {
      console.log(error.message);
      return null;
    }
    throw error;
  }
};

export {
  transpile
}
