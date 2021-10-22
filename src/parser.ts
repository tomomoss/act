import type {
  Token
} from "./d";
import {
  keyword
} from "./data";
import {
  TranspileError
} from "./error";

/**
 * 引数に指定した字句が二項演算子であるかを判定します。
 * @param {Token} token 判定対象となる字句です。
 * @returns {boolean} 二項演算子であるならばtrueを返します。
 */
const isBinaryOperator = (token: Token): boolean => {
  return token?.value === keyword.additionOperator ||
    token?.value === keyword.subtractionOperator ||
    token?.value === keyword.multiplicationOperator ||
    token?.value === keyword.divisionOperator ||
    token?.value === keyword.remainderOperator;
};

/**
 * 引数に指定した字句が数値リテラルであるかを判定します。
 * @param {Token} token 判定対象となる字句です。
 * @returns {boolean} 数値リテラルであるならばtrueを返します。
 */
const isNumberLiteral = (token: Token): boolean => {
  return token?.value.replace(/[0-9]/g, "") === "";
};

/**
 * 引数に指定した字句が単項演算子であるかを判定します。
 * @param {Token} token 判定対象となる字句です。
 * @returns {boolean} 単項演算子であるならばtrueを返します。
 */
const isUnaryOperator = (token: Token): boolean => {
  return token?.value === keyword.plusOperator || token?.value === keyword.minusOperator;
};

/**
 * 共通処理を実装します。
 */
const implementCommonProcess = (): void => {

  // 当然エコー機能はOFFにします。
  _transpiledSourceCode = `@ECHO OFF\n${_transpiledSourceCode}`;

  // 呼びだし元の可視範囲を汚染しないようにSETLOCALコマンドを実行しておきます。
  _transpiledSourceCode = `SETLOCAL\n${_transpiledSourceCode}`;

  // 正常終了してもインスタンスを閉じないように/Bオプション付きでEXITコマンドを呼びだします。
  _transpiledSourceCode = `${_transpiledSourceCode}EXIT /B 0\n`;
};

/**
 * 構文解析を実行します。
 * @param {Token[]} tokenList 構文解析対象となる字句をまとめた配列です。
 * @returns {string} トランスパイルされたソースコードです。
 */
const parse = (tokenList: Token[]): string => {
  _index = 0;
  _tokenList = tokenList;
  _transpiledSourceCode = "";
  while (parsing()) {
    if (parseCalculationStatement() || parseEchoFunctionStatement()) {
      continue;
    }
    throwUnexpectedTokenError();
  }
  implementCommonProcess();
  return _transpiledSourceCode;
};

/**
 * 計算式用の構文解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const parseCalculationExpression = (): boolean => {
  let parsedTokenList: Token[] = [];
  let numberOfOpeningGroup = 0;

  // 計算式は次のような構造になります。
  //   計算式 = 被演算子 { 演算子 被演算子 }
  //   被演算子 = [ "+" , "-" ] , 数値リテラル | "(" , 計算式 , ")"
  //   演算子 = "+" | "-" | "*" | "/" | "%"
  // また、計算式は1つの行に記述する必要があります。
  const rowBeforeProcess = _tokenList[_index]?.row;
  while (parsing()) {

    // まずは被演算子の抽出から始めます。
    // ただし、最初の構文解析ループ時とグループ演算子の開き記号の直後は演算子の処理を飛ばします。
    let binaryOperatorTokenIndex: number | null = null;
    if (
      parsedTokenList.length > 0 &&
      parsedTokenList[parsedTokenList.length - 1]?.value !== keyword.groupingOperator.openingTag &&
      _tokenList[_index]?.value !== keyword.groupingOperator.closingTag
    ) {
      if (!isBinaryOperator(_tokenList[_index]) || _tokenList[_index].row !== rowBeforeProcess) {
        break;
      }
      binaryOperatorTokenIndex = _index;
      parsedTokenList.push(_tokenList[_index]);
      _index += 1;
    }

    // 単項演算子が存在するならばソースコードに含めます。
    // 必須の字句ではないのでなくても問題ありません。
    if (isUnaryOperator(_tokenList[_index])) {
      if (binaryOperatorTokenIndex !== null && _tokenList[_index].row !== rowBeforeProcess) {
        throw new TranspileError(
          _tokenList[binaryOperatorTokenIndex].row,
          _tokenList[binaryOperatorTokenIndex].column,
          `${_tokenList[binaryOperatorTokenIndex].value}演算子の右辺被演算子が見つかりません。`
        );
      }
      parsedTokenList.push(_tokenList[_index]);
      _index += 1;
    }

    // 最後に被演算子を抽出します。
    if (binaryOperatorTokenIndex !== null && !parsing()) {
      throw new TranspileError(
        _tokenList[binaryOperatorTokenIndex].row,
        _tokenList[binaryOperatorTokenIndex].column,
        `${_tokenList[binaryOperatorTokenIndex].value}演算子の右辺被演算子が見つかりません。`
      );
    }
    
    // 数値リテラル用の抽出処理です。
    if (isNumberLiteral(_tokenList[_index])) {
      if (binaryOperatorTokenIndex !== null && _tokenList[_index].row !== rowBeforeProcess) {
        throw new TranspileError(
          _tokenList[binaryOperatorTokenIndex].row,
          _tokenList[binaryOperatorTokenIndex].column,
          `${_tokenList[binaryOperatorTokenIndex].value}演算子の右辺被演算子が見つかりません。`
        );
      }
      parsedTokenList.push(_tokenList[_index]);
      _index += 1;
      continue;
    }

    // グループ演算子の開き記号用の抽出処理です。
    if (_tokenList[_index].value === keyword.groupingOperator.openingTag) {      
      if (binaryOperatorTokenIndex !== null && _tokenList[_index].row !== rowBeforeProcess) {
        throw new TranspileError(
          _tokenList[binaryOperatorTokenIndex].row,
          _tokenList[binaryOperatorTokenIndex].column,
          `${_tokenList[binaryOperatorTokenIndex].value}演算子の右辺被演算子が見つかりません。`
        );
      }
      numberOfOpeningGroup += 1;
      parsedTokenList.push(_tokenList[_index]);
      _index += 1;
      continue;
    }

    // グループ演算子の閉じ記号用の抽出処理です。
    if (_tokenList[_index].value === keyword.groupingOperator.closingTag) {      
      if (binaryOperatorTokenIndex !== null && _tokenList[_index].row !== rowBeforeProcess) {
        throw new TranspileError(
          _tokenList[binaryOperatorTokenIndex].row,
          _tokenList[binaryOperatorTokenIndex].column,
          `${_tokenList[binaryOperatorTokenIndex].value}演算子の右辺被演算子が見つかりません。`
        );
      }
      numberOfOpeningGroup -= 1;
      parsedTokenList.push(_tokenList[_index]);
      _index += 1;
      continue;
    }

    // どの字句にも合致しない場合の処理です。
    if (binaryOperatorTokenIndex === null) {
      break;
    }
    throw new TranspileError(
      _tokenList[binaryOperatorTokenIndex].row,
      _tokenList[binaryOperatorTokenIndex].column,
      `${_tokenList[binaryOperatorTokenIndex].value}演算子の右辺被演算子が見つかりません。`
    );
  }
  if (parsedTokenList.length === 0) {
    return false;
  }
  if (numberOfOpeningGroup > 0) {
    throw new TranspileError(
      parsedTokenList[parsedTokenList.length - 1].row,
      parsedTokenList[parsedTokenList.length - 1].column + parsedTokenList[parsedTokenList.length - 1].value.length,
      "グループが閉じられていません。"
    );
  }
  _transpiledSourceCode += "SET /A act.@exit=";
  for (const e of parsedTokenList) {
    _transpiledSourceCode += e.value;
  }
  _transpiledSourceCode += "\n";
  return true;
};

/**
 * 計算文用の構文解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const parseCalculationStatement = (): boolean => {
  if (!parseCalculationExpression()) {
    return false;
  }

  // 計算文は1つの計算式と等しいため、計算式と同じ行に別の字句が記述されている場合は構文エラーとなります。
  if (_tokenList[_index - 1].row === _tokenList[_index]?.row) {
    throwUnexpectedTokenError();
  }
  return true;
};

/**
 * echo関数用の構文解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const parseEchoFunctionStatement = (): boolean => {
  if (!parsing() || _tokenList[_index].value !== "echo") {
    return false;
  }
  const indexOfFunctionToken = _tokenList[_index].index;
  const rowOfFunctionToken = _tokenList[_index].row;
  _index += 1;

  // 引数を求めます。
  // まだ字句解析が終わっておらず、かつ、関数名の次の字句が関数名と同じ行にある場合は引数なので抽出します。
  if (parsing() && _tokenList[_index].row === rowOfFunctionToken) {

    // 引数の抽出には計算式用の構文処理を利用します。
    // その構文解析処理に失敗したということは、引数として有効でない値が関数の引数部分に記述されているということなのでトランスパイルエラーとします。
    if (!parseCalculationExpression()) {
      throwUnexpectedTokenError();
    }

    // 引数は半角区切りで指定するのですが、その都合上計算式は必ずグループ演算子で囲まれている必要があります。
    // 計算式が登場した以上、現在の構文解析位置は関数の位置より3つ以上大きくなっているはずです。
    // なぜならばグループ演算子の開閉記号と値1つだけで3つあるからです。
    // その状況で1つ直前の字句がグループ演算子の閉じ記号でない場合はグループ演算子を付けずに数式を記述したというわけで、
    // しかも、echo関数は第1引数のみを許容するため引数の数が不正であるというエラーを生じさせます。
    if (_index > indexOfFunctionToken + 2 && _tokenList[_index - 1].value !== keyword.groupingOperator.closingTag) {
      throw new TranspileError(_tokenList[indexOfFunctionToken + 1].row, _tokenList[indexOfFunctionToken + 1].column, "引数の数が不正です。");
    }

    // さらに、この状況で関数名と同じ行に字句が存在していた場合も引数の数のエラーとします。
    if (parsing() && _tokenList[_index].row === rowOfFunctionToken) {
      throw new TranspileError(_tokenList[_index].row, _tokenList[_index].column, "引数の数が不正です。");
    }

    // ここまでの検査を全て突破した場合は正常に引数を構文解析できたと見なします。
    _transpiledSourceCode += "SET act.@argument1=%act.@exit%\nECHO %act.@argument1%\n";
    return true;
  }

  // 引数がない場合は改行だけします。
  _transpiledSourceCode += "ECHO;\n";
  return true;
};

/**
 * 構文解析の途中であるかを判定します。
 * @returns {boolean} 構文解析の途中ならばtrueを返します。
 */
const parsing = (): boolean => {
  return _index < _tokenList.length;
};

/**
 * 計算式のグループが閉じられていないときの例外処理を実行します。
 */
const throwGroupError = (): void => {
  throw new TranspileError(
    _tokenList[_index - 1].row,
    _tokenList[_index - 1].column + _tokenList[_index - 1].value.length,
    "グループ演算子の閉じ記号が見つかりません。"
  );
};

/**
 * 予期しない字句と遭遇したとき用の例外処理を実行します。
 */
const throwUnexpectedTokenError = (): void => {
  if (typeof _tokenList[_index] === "undefined") {
    throw new TranspileError(_tokenList[_index - 1].row, _tokenList[_index - 1].column, "予期しない字句です。");
  }
  throw new TranspileError(_tokenList[_index].row, _tokenList[_index].column, "予期しない字句です。");
};

// 現在の構文解析位置です。
let _index: number;

// 構文解析対象となる字句をまとめた配列です。
let _tokenList: Token[];

// トランスパイルされたソースコードです。
let _transpiledSourceCode: string;

export {
  parse
}
