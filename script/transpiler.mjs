"use strict";

/**
 * トランスパイル処理に直接関係するエラーです。
 */
const TranspileError = class extends Error {

  /**
   * エラー時の挙動を定義します。
   * @param {string} errorMessage エラーメッセージです。
   */
  constructor(errorMessage) {
    super(errorMessage);
    this.name = new.target.name;
  }
};

/**
 * 全てのプログラムに共通の処理を実装します。
 * @param {string} parsedSourceCode 構文解析されたソースコードです。
 * @returns {string} 共通処理を実装して完成したソースコードです。
 */
const addCommonCode = (parsedSourceCode) => {
  return `@ECHO OFF\n${parsedSourceCode}EXIT /B\n`;
};

/**
 * 引数で指定されたキーワードが、ソースコードの現在位置に存在するかを判定します。
 * @param {string} sourceCode 判定対象となるソースコードです。
 * @param {number} index 現在解析中の文字を表すインデックスです。
 * @param {string} keyword 判定に使用するキーワードです。
 * @returns {boolean} 一致しているならばtrueを返します。
 */
const matchKeyword = (sourceCode, index, keyword) => {
  if (sourceCode.slice(index, index + keyword.length) === keyword) {
    return true;
  }
  return false;
};

/**
 * 構文解析を行います。
 * @param {Array<Array<object>>} token 解析対象となる字句です。
 * @returns {string} 変換されたソースコードです。
 */
const parse = (token) => {
  console.log(token);
  return "";
};

/**
 * 字句解析を行います。
 * @param {string} sourceCode 解析対象となるソースコードです。
 * @returns {Array<Array<string>>} 字句です。
 */
const tokenize = (sourceCode) => {

  // 戻り値となる2次元配列です。
  // 1次元目の要素はソースコードの各行（命令文）と対応しています。
  // 2次元目の要素が字句にあたります。
  // 初期化の一環として、1行目を指す配列をあらかじめ入れておきます。
  const token = [
    [""]
  ];

  const keyword = {
    linefeed: "\n",
    multiLineComment: {
      closingTag: "#&gt;",
      openingTag: "&lt;#"
    },
    singleLineComment: "#",
    space: " ",
    string: "'"
  };
  let index = 0;
  while (index < sourceCode.length) {

    // 無意味な空白は無視します。
    if (matchKeyword(sourceCode, index, keyword.space)) {
      token[token.length - 1].push("");
      index += keyword.space.length;
      continue;
    }

    // 無意味な改行も無視します。
    if (matchKeyword(sourceCode, index, keyword.linefeed)) {
      token.push([""]);
      index += keyword.linefeed.length;
      continue;
    }

    // 1行コメントの解析処理です。
    // 改行がくるまでの文字を全て無視します。
    if (matchKeyword(sourceCode, index, keyword.singleLineComment)) {
      index += keyword.singleLineComment.length;
      while (index < sourceCode.length) {
        if (matchKeyword(sourceCode, index, keyword.linefeed)) {
          token.push([]);
          index += keyword.linefeed.length;
          break;
        }
        index += 1;
      }
      continue;
    }

    // 複数行コメントの解析処理です。
    // 閉じタグがくるまでの文字を全て無視します。
    // コメントが閉じられていないときはエラーにします。
    if (matchKeyword(sourceCode, index, keyword.multiLineComment.openingTag)) {
      index += keyword.multiLineComment.openingTag.length;
      let isClosed = false;
      while (index < sourceCode.length) {
        if (matchKeyword(sourceCode, index, keyword.multiLineComment.closingTag)) {
          isClosed = true;
          index += keyword.multiLineComment.closingTag.length;
          break;
        }
        if (matchKeyword(sourceCode, index, keyword.linefeed)) {
          token.push([]);
          index += keyword.linefeed.length;
          continue;
        }
        index += 1;
      }
      if (isClosed) {
        continue;
      }
      throw new TranspileError(`${token.length}行目: 複数行コメントが閉じられていません。`);
    }

    // 以下、字句抽出処理です。
    token[token.length - 1][token[token.length - 1].length - 1] += sourceCode[index];
    index += 1;
  }
  return token;
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
    const token = tokenize(sourceCode);
    const parsedSourceCode = parse(token);
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
