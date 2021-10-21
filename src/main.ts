import type {
  TranspileResult
} from "./d";
import {
  TranspileError
} from "./error";
import {
  parse
} from "./parser";
import {
  tokenize
} from "./tokenizer";

/**
 * ACTで書かれたソースコードをCommand Prompt上で動作するソースコードにトランスパイルします。
 * @param {string} sourceCode トランスパイル対象となるソースコードです。
 * @returns {TranspileResult} トランスパイル結果です。
 */
const transpile = (sourceCode: string): TranspileResult => {
  try {
    const tokenList = tokenize(sourceCode);
    const transpiledSourceCode = parse(tokenList);
    return {
      success: true,
      value: transpiledSourceCode
    };
  } catch (error) {
    if (error instanceof TranspileError) {
      return {
        success: true,
        value: error
      };
    }
    throw error;
  }
};

export {
  transpile
}
