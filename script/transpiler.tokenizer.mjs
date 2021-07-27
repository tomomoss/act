"use strict";

import {
  TranspileError
} from "./transpiler.error.mjs";

/**
 * 引数で指定されたキーワードが、ソースコードの現在位置に存在するかを判定します。
 * @param {string} keyword 判定に使用するキーワードです。
 * @returns {boolean} 一致しているならばtrueを返します。
 */
const matchKeyword = (keyword) => {
  if (_.sourceCode.slice(_.index, _.index + keyword.length) === keyword) {
    return true;
  }
  return false;
};

/**
 * 特殊文字を元に戻します。
 */
const replaceAllSpecialCharacter = () => {
  _.tokens[_.tokens.length - 1] = _.tokens[_.tokens.length - 1].replaceAll("&lt;", "<");
  _.tokens[_.tokens.length - 1] = _.tokens[_.tokens.length - 1].replaceAll("&gt;", ">");
};

/**
 * 字句解析を実行します。
 * 当関数はモジュール外に出すため引数検査を実施しておきます。
 * @param {string} sourceCode 解析対象となるソースコードです。
 * @param {...any} rest 引数検査のためだけに定義された引数です。
 * @returns {Array<object>} 字句です。
 */
const tokenize = (sourceCode, ...rest) => {
  if (typeof sourceCode === "undefined") {
    throw new Error("第1引数が指定されていません。");
  }
  if (typeof sourceCode !== "string") {
    throw new Error("第1引数は文字列である必要があります。");
  }
  if (rest.length !== 0) {
    throw new Error("引数の数が不正です。");
  }

  // モジュールオブジェクトを初期化します。
  _.index = 0;
  _.lineNumber = 1;
  _.sourceCode = sourceCode;
  _.tokens = [];

  while (_.index < _.sourceCode.length) {

    // 無意味な空白は無視します。
    if (matchKeyword(_.keyword.space)) {
      _.index += _.keyword.space.length;
      continue;
    }

    // 無意味な改行は無視します。
    if (matchKeyword(_.keyword.linefeed)) {
      _.lineNumber += 1;
      _.index += _.keyword.linefeed.length;
      continue;
    }

    // 1行コメントの解析処理です。
    // 改行がくるまでの文字を全て無視します。
    if (matchKeyword(_.keyword.singleLineComment)) {
      _.index += _.keyword.singleLineComment.length;
      while (_.index < _.sourceCode.length) {
        if (matchKeyword(_.keyword.linefeed)) {
          _.lineNumber += 1;
          _.index += _.keyword.linefeed.length;
          break;
        }
        _.index += 1;
      }
      continue;
    }

    // 複数行コメントの解析処理です。
    // 閉じタグがくるまでの文字を全て無視します。
    if (matchKeyword(_.keyword.multiLineComment.openingTag)) {
      _.index += _.keyword.multiLineComment.openingTag.length;

      // コメントが閉じられていないときはエラーにします。
      let isClosed = false;
      while (_.index < _.sourceCode.length) {
        if (matchKeyword(_.keyword.multiLineComment.closingTag)) {
          isClosed = true;
          _.index += _.keyword.multiLineComment.closingTag.length;
          break;
        }
        if (matchKeyword(_.keyword.linefeed)) {
          _.lineNumber += 1;
          _.index += _.keyword.linefeed.length;
          continue;
        }
        index += 1;
      }
      if (isClosed) {
        continue;
      }
      throw new TranspileError(`${_.lineNumber}行目: 複数行コメントが閉じられていません。`);
    }

    // 関数の解析を開始します。
    if (/[a-z]/gi.test(_.sourceCode[_.index])) {

      // まずはソースコードの1行を抽出します。
      // 文末に達する、改行文字と出会う、コメントと出会う、のいずれかの条件に遭遇したら抽出処理を止めます。
      let textLine = "";
      while (_.index < _.sourceCode.length) {
        if (matchKeyword(_.keyword.linefeed)) {
          break;
        }
        if (matchKeyword(_.keyword.singleLineComment)) {
          break;
        }
        if (matchKeyword(_.keyword.multiLineComment.openingTag)) {
          break;
        }
        textLine += _.sourceCode[_.index];
        _.index += 1;
      }

      // 半角空白で区切ります。
      textLine = textLine.split(" ");

      // 第1要素は必然的に関数名ということになります。
      _.tokens.push({
        category: "function",
        value: textLine[0]
      });

      // 第2要素以後がどのような値であるかを特定します。
      for (let i = 1; i < textLine.length; i += 1) {

        // 空文字は無視します。
        if (textLine[i] === "") {
          continue;
        }

        // 算術演算子・連結演算子であるか判定します。
        if (/^[+\-*/%]$/.test(textLine[i])) {
          _.tokens.push({
            category: "operator",
            value: textLine[i]
          });
          continue;
        }

        // 数値であるか判定します。
        if (/^[+,-]?([1-9]\d*|0)(\.\d+)?$/.test(textLine[i])) {
          const numberToken = {
            category: "number",
            value: ""
          };
          if (Math.sign(textLine[i]) === 1) {
            numberToken.value = `+${String(Number(textLine[i]))}`;
          } else if (Math.sign(textLine[i]) === -1) {
            numberToken.value = String(Number(textLine[i]));
          } else {
            numberToken.value = "0";
          }
          _.tokens.push(numberToken);
          continue;
        }

        // 文字列であるか判定します。
        if (textLine[i][0] === _.keyword.stringTag) {

          // 文字列リテラルタグは字句に含めませんので除外します。
          const stringToken = {
            category: "string",
            value: textLine[i]
          };
          stringToken.value = stringToken.value.slice(1);

          // 文字列リテラル内に半角空白が含まれていない場合は簡単に処理できます。
          if (stringToken.value[stringToken.value.length - 1] === _.keyword.stringTag) {
            stringToken.value = stringToken.value.slice(0, -1);
            _.tokens.push(stringToken);
            replaceAllSpecialCharacter();
            continue;
          }

          // 問題は含まれている場合です。
          let isClosed = false;
          for (i += 1; i < textLine.length; i += 1) {
            stringToken.value += ` ${textLine[i]}`;
            if (stringToken.value[stringToken.value.length - 1] === _.keyword.stringTag) {
              isClosed = true;
              stringToken.value = stringToken.value.slice(0, -1);
              _.tokens.push(stringToken);
              break;
            }
          }
          if (isClosed) {
            replaceAllSpecialCharacter();
            continue;
          }
          throw new TranspileError(`${_.lineNumber}行目: 文字列が閉じられていません。`);
        }

        // いずれの判定にも引っかからなかったときはエラーとして処理します。
        throw new TranspileError(`${_.lineNumber}行目: 不正なキーワードです（${textLine[i]}）。`);
      }

      // 処理の区切りとなる忘れずに入れておきます。
      _.tokens.push({
        category: "system",
        value: "FUNCTION_END"
      });

      continue;
    }

    // いずれの判定にも引っかからなかったときはエラーとして処理します。
    throw new TranspileError(`${_.lineNumber}行目: 不正なキーワードです。`);
  }
  return _.tokens;
};

/**
 * 各所から頻繁に参照される値をまとめたモジュールオブジェクトです。
 * @property {number} index 解析中の文字を指すインデックス値です。
 * @property {number} lineNumber 解析中の行番号です。
 * @property {object} keyword 字句解析で必要となるキーワードです。
 * @property {string} sourceCode 字句解析の対象となるソースコードです。
 * @property {Array<object>} tokens 解析によって得られた字句です。
 */
const _ = {
  index: undefined,
  lineNumber: undefined,
  keyword: {
    linefeed: "\n",
    multiLineComment: {
      closingTag: "#&gt;",
      openingTag: "&lt;#"
    },
    singleLineComment: "#",
    space: " ",
    stringTag: "'"
  },
  sourceCode: undefined,
  tokens: undefined
};

Object.seal(_);

export {
  tokenize
}
