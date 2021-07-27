"use strict";

import {
  TranspileError
} from "./transpiler.error.mjs";

/**
 * 引数で計算式を評価して、その値を返します。
 * @param {string} expression 評価対象となる式です。
 * @returns {null|string} 結果です。
 */
const evalArguments = (expression) => {
  try {
    const result = Function(`"use strict"; return ${expression}`)();
    if (Number.isNaN(result)) {
      throw new TranspileError("不正な引数です。");
    }
    return result;
  } catch (error) {
    throw new TranspileError("不正な引数です。");
  }
};

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

  // モジュールオブジェクトを初期化します。
  _.index = 0;
  _.parsedSourceCode = "";
  _.parsingArguments = [];
  _.parsingFunction = undefined;
  _.tokens = tokens;

  for (_.index; _.index < _.tokens.length; _.index += 1) {
    parseFunction();
    parseArguments();

    // 各関数ごとの処理を実行します。
    if (_.parsingFunction === "echo") {

      // echo関数の処理です。
      if (_.parsingArguments.length === 0) {
        _.parsedSourceCode += "ECHO.\n";
      } else {
        for (const argument of _.parsingArguments) {
          if (typeof argument === "number") {
            _.parsedSourceCode += `ECHO ${argument}\n`;
            continue;
          }
          if (typeof argument === "string") {
            if (argument.trim() === "") {
              _.parsedSourceCode += "ECHO.\n";
              continue;
            }
            _.parsedSourceCode += `ECHO ${argument}\n`;
            continue;
          }
        }
      }
    } else {

      // 想定外の関数が現れたときはエラーにします。
      throw new TranspileError(`想定外の関数です（${_.parsingFunction}）。`);
    }

    // 現在分析中の関数と引数を初期化します。
    _.parsingArguments = [];
    _.parsingFunction = undefined;
  }

  return _.parsedSourceCode;
};

/**
 * 実行する関数に対応した引数を特定します。
 */
const parseArguments = () => {
  let lastArgumentCategory;
  for (_.index; _.index < _.tokens.length; _.index += 1) {

    // 関数の終了を告げる制御文字が現れるまでループします。
    if (_.tokens[_.index].category === "system") {
      if (lastArgumentCategory === "operator") {
        throw new TranspileError(`${_.parsingFunction}関数の引数が演算子で終わっています。`);
      }
      if (_.tokens[_.index].value === "FUNCTION_END") {
        break;
      }
      throw new Error(`system型の字句に想定外の値が入っていました（${_.tokens[_.index].value}）。`);
    }

    // リテラルの判定処理です。
    if (_.tokens[_.index].category === "number") {
      if (lastArgumentCategory === "operator") {
        lastArgumentCategory = "number";
        _.parsingArguments[_.parsingArguments.length - 1] += ` ${_.tokens[_.index].value}`;
        continue;
      }
      lastArgumentCategory = "number";
      _.parsingArguments.push(_.tokens[_.index].value);
      continue;
    }
    if (_.tokens[_.index].category === "string") {
      if (lastArgumentCategory === "operator") {
        lastArgumentCategory = "string";
        _.parsingArguments[_.parsingArguments.length - 1] += ` '${_.tokens[_.index].value}'`;
        continue;
      }
      lastArgumentCategory = "string";
      _.parsingArguments.push(`'${_.tokens[_.index].value}'`);
      continue;
    }

    // 演算子の判定処理です。
    if (_.tokens[_.index].category === "operator") {
      if (lastArgumentCategory === "number" || lastArgumentCategory === "string") {
        lastArgumentCategory = "operator";
        _.parsingArguments[_.parsingArguments.length - 1] += ` ${_.tokens[_.index].value}`;
        continue;
      }
      if (lastArgumentCategory === "operator") {
        throw new TranspileError(`演算子が連続しています（${_.tokens[_.index].value}）。`);
      }
      throw new TranspileError(`演算子「${_.tokens[_.index].value}」の位置が異常です。`);
    }

    // リテラルでも演算子でもなかった場合はエラーにします。
    throw new Error(`想定外の字句です（${tokens[i].value}）。`);
  }

  // 引数を評価して単一の値にします。
  _.parsingArguments = _.parsingArguments.map((argument) => {
    return evalArguments(argument);
  });
};

/**
 * 実行する関数を特定します。
 */
const parseFunction = () => {
  if (_.tokens[_.index].category !== "function") {
    throw new Error(`文頭が関数ではありません（${_.tokens[_.index].category, _.tokens[_.index].value}）。`);
  }
  _.parsingFunction = _.tokens[_.index].value;
  _.index += 1;
};

/**
 * 各所から頻繁に参照される値をまとめたモジュールオブジェクトです。
 * @property {number} index 現在解析中の字句を指すインデックス値です。
 * @property {string} parsedSourceCode 当構文解析器を通して生成されたソースコードです。
 * @property {Array<string>} parsingArguments 現在解析中の引数です。
 * @property {string} parsingFunction 現在解析中の関数名です。
 * @property {Array<object>} tokens 字句解析器を通して得た字句です。
 */
const _ = {
  index: undefined,
  parsedSourceCode: undefined,
  parsingArguments: undefined,
  parsingFunction: undefined,
  tokens: undefined
};

Object.seal(_);

export {
  parse
}
