import {
  TranspileError
} from "./error";

/**
 * 字句です。
 * @property {number} column 字句が配置されている列番号です。
 * @property {number} index 字句のソースコード上における出現位置です。
 * @property {number} row 字句が配置されている行番号です。
 * @property {string} value 字句の内容です。
 */
type Token = {
  column: number;
  index: number;
  row: number;
  value: string;
};

/**
 * トランスパイル結果です。
 * @property {boolean} success トランスパイルに成功したときはtrueが入ります。
 * @property {string | InstanceType<typeof TranspileError>} value トランスパイルの詳細結果です。
 *   トランスパイルに成功したときはトランスパイルされたソースコードが入ります。
 *   トランスパイルに失敗したときはTranspileErrorオブジェクトが入ります。
 */
type TranspileResult = {
  success: boolean;
  value: string | InstanceType<typeof TranspileError>;
};

export {
  Token,
  TranspileResult
}
