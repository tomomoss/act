// トランスパイル処理において必要となる語句をまとめたオブジェクトです。
const keyword = {
  additionOperator: "+",
  additionAssignmentOperator: "+=",
  andOperator: "&",
  assignmentOperator: "=",
  block: {
    closingTag: "}",
    openingTag: "{"
  },
  booleanLiteral: {
    false: "false",
    true: "true"
  },
  divisionOperator: "/",
  divisionAssignmentOperator: "/=",
  equalityOperator: "==",
  greaterThanOperator: ">",
  greaterThanOrEqualOperator: ">=",
  groupingOperator: {
    closingTag: ")",
    openingTag: "("
  },
  inequalityOperator: "!=",
  lessThanOperator: "<",
  lessThanOrEqualOperator: "<=",
  lineFeed: "\n",
  minusOperator: "-",
  multiLineComment: {
    closingTag: "#>",
    openingTag: "<#"
  },
  multiplicationOperator: "*",
  multiplicationAssignmentOperator: "*=",
  notOperator: "!",
  nullLiteral: "null",
  orOperator: "|",
  plusOperator: "+",
  remainderOperator: "%",
  remainderAssignmentOperator: "%=",
  singleLineComment: "#",
  space: " ",
  stringLiteral: {
    doubleQuotationTag: "\"",
    escapeSequence: "\\",
    singleQuotationTag: "'"
  },
  subtractionOperator: "-",
  subtractionAssignmentOperator: "-=",
  variable: "$"
} as const;

export {
  keyword
}
