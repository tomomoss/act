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
 * 現在の字句解析位置から任意の語句が出現するかを判定します。
 * @param {string | RegExp} word 判定に使用する語句です。
 * @returns {boolean} 引数で指定した語句が出現するときはtrueを返します。
 */
const encounter = (word: string | RegExp): boolean => {
  if (typeof word === "string") {
    return _sourceCode.slice(_index, _index + word.length) === word;
  }
  return word.test(_sourceCode.slice(_index, _index + 1));
};

/**
 * 字句解析を実行します。
 * @param {string} sourceCode 字句解析対象となるソースコードです。
 * @returns {Token[]} 抽出した字句をまとめた配列です。
 */
const tokenize = (sourceCode: string): Token[] => {
  _column = 1;
  _index = 0;
  _row = 1;
  _sourceCode = sourceCode;
  _tokenList = [];
  while (tokenizing()) {
    if (
      tokenizeSpace() ||
      tokenizeLineFeed() ||
      tokenizeSingleLineComment() ||
      tokenizeMultiLineComment() ||
      tokenizeNumberLiteral() ||
      tokenizePlusOperator() ||
      tokenizeMinusOperator() ||
      tokenizeAdditionOperator() ||
      tokenizeSubtractionOperator() ||
      tokenizeMultiplicationOperator() ||
      tokenizeDivisionOperator() ||
      tokenizeRemainderOperator() ||
      // tokenizeVariable() ||
      // tokenizeAssignmentOperator() ||
      tokenizeGroupingOperator() ||
      tokenizeFunction()
    ) {
      continue;
    }
    throw new TranspileError(_row, _column, "予期しない字句です。");
  }
  return _tokenList;
};

/**
 * 加算演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeAdditionOperator = (): boolean => {
  if (!encounter(keyword.additionOperator)) {
    return false;
  }
  _tokenList.push({
    column: _column,
    index: _index,
    row: _row,
    value: keyword.additionOperator
  });
  updateTokenizePosition(keyword.additionOperator);
  return true;
};

/**
 * 代入演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeAssignmentOperator = (): boolean => {
  if (!encounter(keyword.assignmentOperator)) {
    return false;
  }
  _tokenList.push({
    column: _column,
    index: _index,
    row: _row,
    value: keyword.assignmentOperator
  });
  updateTokenizePosition(keyword.assignmentOperator);
  return true;
};

/**
 * 除算演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeDivisionOperator = (): boolean => {
  if (!encounter(keyword.divisionOperator)) {
    return false;
  }
  _tokenList.push({
    column: _column,
    index: _index,
    row: _row,
    value: keyword.divisionOperator
  });
  updateTokenizePosition(keyword.divisionOperator);
  return true;
};

/**
 * 関数用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeFunction = (): boolean => {
  const token: Token = {
    column: _column,
    index: _index,
    row: _row,
    value: ""
  };
  while (tokenizing()) {
    if (!encounter(/[A-Za-z0-9_]/)) {
      break;
    }
    const character = _sourceCode.slice(_index, _index + 1);
    token.value += character;
    updateTokenizePosition(character);
  }
  if (token.value === ""){
    return false;
  }
  if (/[A-Z]/.test(token.value)) {
    throw new TranspileError(token.row, token.column, "関数名に使用できるのはアルファベットの小文字、半角数字、アンダースコア記号だけです。");
  }
  _tokenList.push(token);
  return true;
};

/**
 * グループ演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeGroupingOperator = (): boolean => {
  const token: Token = {
    column: _column,
    index: _index,
    row: _row,
    value: ""
  };
  if (encounter(keyword.groupingOperator.openingTag)) {
    token.value = keyword.groupingOperator.openingTag;
  } else if (encounter(keyword.groupingOperator.closingTag)) {
    token.value = keyword.groupingOperator.closingTag;
  } else {
    return false;
  }
  _tokenList.push(token);
  updateTokenizePosition(token.value);
  return true;
};

/**
 * 改行文字用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeLineFeed = (): boolean => {
  if (!encounter(keyword.lineFeed)) {
    return false;
  }
  updateTokenizePosition(keyword.lineFeed);
  return true;
};

/**
 * 1行コメント用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeSingleLineComment = (): boolean => {
  if (!encounter(keyword.singleLineComment)) {
    return false;
  }
  updateTokenizePosition(keyword.singleLineComment);
  while (tokenizing()) {
    if (tokenizeLineFeed()) {
      break;
    }
    updateTokenizePosition(_sourceCode.slice(_index, _index + 1));
  }
  return true;
};

/**
 * 負値演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeMinusOperator = (): boolean => {
  if (!encounter(keyword.minusOperator)) {
    return false;
  }
  _tokenList.push({
    column: _column,
    index: _index,
    row: _row,
    value: keyword.minusOperator
  });
  updateTokenizePosition(keyword.minusOperator);
  return true;
};

/**
 * 複数行コメント用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeMultiLineComment = (): boolean => {
  if (!encounter(keyword.multiLineComment.openingTag)) {
    return false;
  }
  updateTokenizePosition(keyword.multiLineComment.openingTag);
  let closed = false;
  while (tokenizing()) {
    if (encounter(keyword.multiLineComment.closingTag)) {
      closed = true;
      updateTokenizePosition(keyword.multiLineComment.closingTag);
      break;
    }
    updateTokenizePosition(_sourceCode.slice(_index, _index + 1));
  }
  if (!closed) {
    throw new TranspileError(_row, _column, "複数行コメントが閉じられていません。");
  }
  return true;
};

/**
 * 乗算演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeMultiplicationOperator = (): boolean => {
  if (!encounter(keyword.multiplicationOperator)) {
    return false;
  }
  _tokenList.push({
    column: _column,
    index: _index,
    row: _row,
    value: keyword.multiplicationOperator
  });
  updateTokenizePosition(keyword.multiplicationOperator);
  return true;
};

/**
 * 数値リテラル用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeNumberLiteral = (): boolean => {
  const token: Token = {
    column: _column,
    index: _index,
    row: _row,
    value: ""
  };
  while (tokenizing()) {
    if (!encounter(/[0-9.]/)) {
      break;
    }
    const number = _sourceCode.slice(_index, _index + 1);
    token.value += number;
    updateTokenizePosition(number);
  }
  if (token.value === "") {
    return false;
  }
  if (/0[0-9]/.test(token.value)) {
    throw new TranspileError(token.row, token.column, "数値リテラルの0埋めは許可されません。");
  }
  if (/\./.test(token.value)) {
    throw new TranspileError(token.row, token.column, "数値リテラルで定義できるのは32bit整数だけです。");
  }
  _tokenList.push(token);
  return true;
};

/**
 * 正値演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizePlusOperator = (): boolean => {
  if (!encounter(keyword.plusOperator)) {
    return false;
  }
  _tokenList.push({
    column: _column,
    index: _index,
    row: _row,
    value: keyword.plusOperator
  });
  updateTokenizePosition(keyword.plusOperator);
  return true;
};

/**
 * 剰余演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeRemainderOperator = (): boolean => {
  if (!encounter(keyword.remainderOperator)) {
    return false;
  }
  _tokenList.push({
    column: _column,
    index: _index,
    row: _row,
    value: keyword.remainderOperator
  });
  updateTokenizePosition(keyword.remainderOperator);
  return true;
};

/**
 * 半角空白用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeSpace = (): boolean => {
  if (!encounter(keyword.space)) {
    return false;
  }
  updateTokenizePosition(keyword.space);
  return true;
};

/**
 * 減算演算子用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeSubtractionOperator = (): boolean => {
  if (!encounter(keyword.subtractionOperator)) {
    return false;
  }
  _tokenList.push({
    column: _column,
    index: _index,
    row: _row,
    value: keyword.subtractionOperator
  });
  updateTokenizePosition(keyword.subtractionOperator);
  return true;
};

/**
 * 変数用の字句解析処理です。
 * @returns {boolean} 処理を実行したときはtrueを返します。
 */
const tokenizeVariable = (): boolean => {
  if (!encounter(keyword.variable)) {
    return false;
  }
  const token: Token = {
    column: _column,
    index: _index,
    row: _row,
    value: keyword.variable
  };
  updateTokenizePosition(keyword.variable);
  while (tokenizing()) {
    if (!encounter(/[A-Za-z0-9_]/)) {
      break;
    }
    const character = _sourceCode.slice(_index, _index + 1);
    token.value += character;
    updateTokenizePosition(character);
  }
  if (token.value === keyword.variable) {
    throw new TranspileError(token.row, token.column, "変数名が見つかりません。");
  }
  if (/[A-Z]/.test(token.value)) {
    throw new TranspileError(token.row, token.column, "変数名に使用できるのはアルファベットの小文字、半角数字、アンダースコア記号だけです。");
  }
  _tokenList.push(token);
  return true;
};

/**
 * 字句解析の途中であるかを判定します。
 * @returns {boolean} 字句解析の途中ならばtrueを返します。
 */
const tokenizing = (): boolean => {
  return _index < _sourceCode.length;
};

/**
 * 引数に指定された語句のぶんだけ字句解析位置を更新します。
 * @param {string} 更新量を決める語句です。
 */
const updateTokenizePosition = (value: string): void => {
  for (const e of value) {
    _index += e.length;
    if (e === keyword.lineFeed) {
      _column = 1;
      _row += 1;
      continue;
    }
    _column += e.length;
  }
};

// 字句解析中の列番号です。
let _column: number;

// 現在の字句解析位置です。
let _index: number;

// 字句解析中の行番号です。
let _row: number;

// 字句解析対象となるソースコードです。
let _sourceCode: string;

// 抽出した字句をまとめた配列です。
let _tokenList: Token[];

export {
  tokenize
}
