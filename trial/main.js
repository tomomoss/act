import {
  TOMEditor
} from "./tom-editor.mjs";

/**
 * 入力用エディターに入力された内容をトランスパイラに渡してトランスパイルし、
 * その結果を出力用エディターに反映させる一連の処理を実装します。
 */
const implementTranspileSystem = () => {

  // 入力用・出力用のエディターをWebページ上に配置します。
  const inputEditor = new TOMEditor(_inputEditorContainer_, {
    autofocus: true
  });
  const outputEditor = new TOMEditor(_outputEditorContainer_, {
    readonly: true
  });
  inputEditor.valueObserver = (value) => {
    outputEditor.value = value;
  };
};

// 入力用エディターの実装対象となるHTML要素です。
const _inputEditorContainer_ = document.querySelector(".main__input-editor-container");

// 出力用エディターの実装対象となるHTML要素です。
const _outputEditorContainer_ = document.querySelector(".main__output-editor-container");

implementTranspileSystem();
