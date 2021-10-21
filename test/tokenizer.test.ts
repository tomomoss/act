// トランスパイルエラーを捕捉するための独自マッチャーを読みこむためのimport文です。
import "./custom-matcher";

import type {
  Token
} from "../src/d";
import {
  TranspileError
} from "../src/error";
import {
  tokenize
} from "../src/tokenizer";

describe("空文字", (): void => {
  test("空文字を渡されても問題を起こさない", (): void => {
    expect(tokenize("")).toEqual([]);
  });
});
describe("半角空白", (): void => {
  test("半角空白は無視する", (): void => {
    expect(tokenize("")).toEqual([]);
  });
});
describe("改行文字", (): void => {
  test("改行文字は無視する", (): void => {
    expect(tokenize("")).toEqual([]);
  });
});
describe("1行コメント", (): void => {
  test("コメント記号を認識する", (): void => {
    expect(tokenize("#")).toEqual([]);
  });
  test("コメント記号から続くコメント部分を無視する", (): void => {
    expect(tokenize("#Single line comment.\n")).toEqual([]);
  });
  test("コメント内にコメント記号が含まれていても問題を起こさない", (): void => {
    expect(tokenize("#Single#line#comment.#\n")).toEqual([]);
  });
});
describe("複数行コメント", (): void => {
  test("コメント記号を認識する", (): void => {
    expect(tokenize("<##>")).toEqual([]);
  });
  test("コメント記号に挟まれたコメント部分を無視する", (): void => {
    expect(tokenize("<#Multi line comment.#>")).toEqual([]);
  });
  test("コメント内容に改行文字が含まれていても問題を起こさない", (): void => {
    expect(tokenize("<#\n  Multi\n  line\n  comment.\n#>")).toEqual([]);
  });
  test("コメントが閉じられていないときはトランスパイルエラーとする", (): void => {
    let thrownError;
    try {
      tokenize("<#\n  Multi\n  line\n  comment.\n");
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toTranspileError(new TranspileError(5, 1, "複数行コメントが閉じられていません。"));
  });
});
describe("数値リテラル", (): void => {
  test("整数を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "0"
    };
    expect(tokenize("0")).toEqual([token1]);
  });
  test("0埋めされているときはトランスパイルエラーとする", (): void => {
    let thrownError;
    try {
      tokenize("00");
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toTranspileError(new TranspileError(1, 1, "数値リテラルの0埋めは許可されません。"));
  });
  test("小数が記述されているときはトランスパイルエラーとする", (): void => {
    let thrownError;
    try {
      tokenize("1.23");
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toTranspileError(new TranspileError(1, 1, "数値リテラルで定義できるのは32bit整数だけです。"));
  });
});
describe("正値演算子", (): void => {
  test("正値演算子を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "+"
    };
    expect(tokenize("+")).toEqual([token1]);
  });
});
describe("負値演算子", (): void => {
  test("負値演算子を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "-"
    };
    expect(tokenize("-")).toEqual([token1]);
  });
});
describe("加算演算子", (): void => {
  test("加算演算子を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "+"
    };
    expect(tokenize("+")).toEqual([token1]);
  });
});
describe("減算演算子", (): void => {
  test("減算演算子を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "-"
    };
    expect(tokenize("-")).toEqual([token1]);
  });
});
describe("乗算演算子", (): void => {
  test("乗算演算子を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "*"
    };
    expect(tokenize("*")).toEqual([token1]);
  });
});
describe("除算演算子", (): void => {
  test("正値演算子を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "/"
    };
    expect(tokenize("/")).toEqual([token1]);
  });
});
describe("剰余演算子", (): void => {
  test("剰余演算子を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "%"
    };
    expect(tokenize("%")).toEqual([token1]);
  });
});
// describe("変数", (): void => {
//   test("変数を認識する（1）", (): void => {
//     const token1: Token = {
//       column: 1,
//       index: 0,
//       row: 1,
//       value: "$a"
//     };
//     expect(tokenize("$a")).toEqual([token1]);
//   });
//   test("変数を認識する（2）", (): void => {
//     const token1: Token = {
//       column: 1,
//       index: 0,
//       row: 1,
//       value: "$0"
//     };
//     expect(tokenize("$0")).toEqual([token1]);
//   });
//   test("変数を認識する（3）", (): void => {
//     const token1: Token = {
//       column: 1,
//       index: 0,
//       row: 1,
//       value: "$_"
//     };
//     expect(tokenize("$_")).toEqual([token1]);
//   });
//   test("変数名が記述されていないときはトランスパイルエラーとする", (): void => {
//     let thrownError;
//     try {
//       tokenize("$");
//     } catch (error) {
//       thrownError = error;
//     }
//     expect(thrownError).toTranspileError(new TranspileError(1, 1, "変数名が見つかりません。"));
//   });
//   test("変数名にアルファベットの大文字が含まれているときはトランスパイルエラーとする", (): void => {
//     let thrownError;
//     try {
//       tokenize("$FOO");
//     } catch (error) {
//       thrownError = error;
//     }
//     expect(thrownError).toTranspileError(new TranspileError(1, 1, "変数名に使用できるのはアルファベットの小文字、半角数字、アンダースコア記号だけです。"));
//   });
// });
// describe("代入演算子", (): void => {
//   test("代入演算子を認識する", (): void => {
//     const token1: Token = {
//       column: 1,
//       index: 0,
//       row: 1,
//       value: "="
//     };
//     expect(tokenize("=")).toEqual([token1]);
//   });
// });
describe("グループ演算子", (): void => {
  test("グループ演算子の開き記号を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "("
    };
    expect(tokenize("(")).toEqual([token1]);
  });
  test("グループ演算子の閉じ記号を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: ")"
    };
    expect(tokenize(")")).toEqual([token1]);
  });
});
describe("関数", (): void => {
  test("関数を認識する", (): void => {
    const token1: Token = {
      column: 1,
      index: 0,
      row: 1,
      value: "a1_"
    };
    expect(tokenize("a1_")).toEqual([token1]);
  });
  test("関数を認識する（2）", (): void => {
    let thrownError;
    try {
      tokenize("A1_");
    } catch (error) {
      thrownError = error;
    }
    expect(thrownError).toTranspileError(new TranspileError(1, 1, "関数名に使用できるのはアルファベットの小文字、半角数字、アンダースコア記号だけです。"));
  });
});
