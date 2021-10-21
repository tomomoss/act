import {
  TranspileError
} from "../src/error";

// TranspileErrorオブジェクトを正しく判定するための独自マッチャーです。
declare global {
  namespace jest {
    interface Matchers<R> {
      toTranspileError(expected: InstanceType<typeof TranspileError>): jest.CustomMatcherResult
    }
  }
}
expect.extend({
  toTranspileError: (received: InstanceType<typeof TranspileError>, expected: InstanceType<typeof TranspileError>): jest.CustomMatcherResult => {
    if (received.column === expected.column && received.message === expected.message && received.name === expected.name && received.row === expected.row) {
      return {
        message: () => {
          return "期待どおりのTranspileErrorが投げられています。";
        },
        pass: true
      };
    }
    return {
      message: () => {
        return "期待していた内容とは異なるTranspileErrorが投げられています。";
      },
      pass: false
    };
  }
});
