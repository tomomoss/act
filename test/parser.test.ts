// トランスパイルエラーを捕捉するための独自マッチャーを読みこむためのimport文です。
import "./custom-matcher";

import {
  TranspileError
} from "../src/error";
import {
  parse
} from "../src/parser";

/**
 * 独自処理の実を実装したソースコードに共通処理を実装して完全にトランスパイルされたソースコードを返します。
 * @param {string} sourceCode 独自処理のみを記述したソースコードです。
 * @returns {string} 共通処理を実装して完成したソースコードです。
 */
const implementCommonProcess = (sourceCode: string): string => {
  let transpiledSourceCode = sourceCode;

  // 当然エコー機能はOFFにします。
  transpiledSourceCode = `@ECHO OFF\n${transpiledSourceCode}`;

  // 呼びだし元の可視範囲を汚染しないようにSETLOCALコマンドを実行しておきます。
  transpiledSourceCode = `SETLOCAL\n${transpiledSourceCode}`;

  // 正常終了してもインスタンスを閉じないように/Bオプション付きでEXITコマンドを呼びだします。
  transpiledSourceCode = `${transpiledSourceCode}EXIT /B 0\n`;

  return transpiledSourceCode;
};

describe("字句解析器で有効な字句が抽出されなかった場合", (): void => {
  test("共通処理のみ実装する", (): void => {
    expect(parse([])).toBe(implementCommonProcess(""));
  });
});
describe("計算文", (): void => {
  test("数値リテラルを認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "0"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=0\n"));
  });
  test("正の値を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "+"
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "1"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=+1\n"));
  });
  test("負の値を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "-"
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "1"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=-1\n"));
  });
  test("加算式を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "1"
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "+"
      },
      {
        column: 3,
        index: 2,
        row: 1,
        value: "2"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=1+2\n"));
  });
  test("減算式を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "1"
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "-"
      },
      {
        column: 3,
        index: 2,
        row: 1,
        value: "2"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=1-2\n"));
  });
  test("乗算式を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "1"
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "*"
      },
      {
        column: 3,
        index: 2,
        row: 1,
        value: "2"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=1*2\n"));
  });
  test("除算式を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "1"
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "/"
      },
      {
        column: 3,
        index: 2,
        row: 1,
        value: "2"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=1/2\n"));
  });
  test("剰余式を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "1"
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "%"
      },
      {
        column: 3,
        index: 2,
        row: 1,
        value: "2"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=1%2\n"));
  });
  test("グループ演算子を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "("
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "1"
      },
      {
        column: 3,
        index: 2,
        row: 1,
        value: ")"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=(1)\n"));
  });
  test("複雑な計算式を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "+"
      },
      {
        column: 2,
        index: 1,
        row: 1,
        value: "1"
      },
      {
        column: 3,
        index: 2,
        row: 1,
        value: "+"
      },
      {
        column: 4,
        index: 3,
        row: 1,
        value: "("
      },
      {
        column: 5,
        index: 4,
        row: 1,
        value: "-"
      },
      {
        column: 6,
        index: 5,
        row: 1,
        value: "2"
      },
      {
        column: 7,
        index: 6,
        row: 1,
        value: "-"
      },
      {
        column: 8,
        index: 7,
        row: 1,
        value: "+"
      },
      {
        column: 9,
        index: 8,
        row: 1,
        value: "3"
      },
      {
        column: 10,
        index: 9,
        row: 1,
        value: "*"
      },
      {
        column: 11,
        index: 10,
        row: 1,
        value: "("
      },
      {
        column: 12,
        index: 11,
        row: 1,
        value: "-"
      },
      {
        column: 13,
        index: 12,
        row: 1,
        value: "4"
      },
      {
        column: 14,
        index: 13,
        row: 1,
        value: "/"
      },
      {
        column: 15,
        index: 14,
        row: 1,
        value: "+"
      },
      {
        column: 16,
        index: 15,
        row: 1,
        value: "5"
      },
      {
        column: 17,
        index: 16,
        row: 1,
        value: ")"
      },
      {
        column: 18,
        index: 17,
        row: 1,
        value: ")"
      },
      {
        column: 19,
        index: 18,
        row: 1,
        value: "%"
      },
      {
        column: 20,
        index: 19,
        row: 1,
        value: "-"
      },
      {
        column: 21,
        index: 20,
        row: 1,
        value: "6"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=+1+(-2-+3*(-4/+5))%-6\n"));
  });
});
describe("echo関数", (): void => {
  test("引数が指定されていないときは改行だけする", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "echo"
      }
    ])).toBe(implementCommonProcess("ECHO;\n"));
  });
  test("引数を認識する", (): void => {
    expect(parse([
      {
        column: 1,
        index: 0,
        row: 1,
        value: "echo"
      },
      {
        column: 3,
        index: 2,
        row: 1,
        value: "0"
      }
    ])).toBe(implementCommonProcess("SET /A act.@exit=0\nSET act.@argument1=%act.@exit%\nECHO %act.@argument1%\n"));
  });
  test("第2引数が指定されているときはトランスパイルエラーとする", (): void => {
    let thrownError;
    try {
      parse([
        {
          column: 1,
          index: 0,
          row: 1,
          value: "echo"
        },
        {
          column: 3,
          index: 2,
          row: 1,
          value: "0"
        },
        {
          column: 5,
          index: 4,
          row: 1,
          value: "0"
        }
      ]);
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toTranspileError(new TranspileError(1, 5, "引数の数が不正です。"));
  });
});
