import {
  TOMEditor
} from "./tom-editor.mjs";
import {
  Encoding
} from "./encoding.min.mjs";

/**
 * ドラッグ操作で入力用エディターと出力用エディターの横幅の割合を変更する一連の処理を実装します。
 */
const implementSystemThatChangeEditorsWidthByDragging = () => {

  // 入力用エディター・出力用エディター・区切り線の親要素です。
  const editorsWrapper = document.querySelector(".main");

  // エディター間の区切り線です。
  const separator = document.querySelector(".main__separator");

  // ドラッグ操作中であることを視覚的に表現するためのHTML要素です。
  // ドラッグ操作中は<body>タグ直下に挿入するかたちで利用します。
  const layer = document.createElement("div");
  layer.style.cursor = "col-resize";
  layer.style.height = "100vh";
  layer.style.position = "absolute";
  layer.style.width = "100vw";
  layer.style.zIndex = "1";

  // 区切り線をクリックすると横幅変更処理状態に入ったことを使用者に知らせるために区切り線の色を変更するとともに、
  // ドラッグ操作中であることを視覚的に表現するためのHTML要素を挿入します。
  separator.addEventListener("mousedown", (event) => {
    event.preventDefault();
    document.body.appendChild(layer);
    separator.style.background = "var(--pale-theme-color)";
    separator.style.borderLeftColor = "var(--pale-theme-color)";
    separator.style.borderRightColor = "var(--pale-theme-color)";
  });

  // Webページ上でマウスカーソルを移動させたとき、横幅変更処理状態のフラグが立っているならば当該処理を実行します。
  window.addEventListener("mousemove", (event) => {
    if (!document.body.contains(layer) || event.movementX === 0) {
      return;
    }
    const newInputEditorWidth = event.pageX;
    const newOutputEditorWidth = editorsWrapper.clientWidth - separator.offsetWidth - event.pageX;
    _inputEditorContainer_.style.flexBasis = `${newInputEditorWidth / (newInputEditorWidth + newOutputEditorWidth) * 100}%`;
    _outputEditorContainer_.style.flexBasis = `${newOutputEditorWidth / (newInputEditorWidth + newOutputEditorWidth) * 100}%`;
  });

  // クリックから指を離されたときは横幅変更処理状態から抜けたことを使用者に知らせるために区切り線の色を変更します。
  // ドラッグ操作中であることを視覚的に表現するためのHTML要素を除外します。
  window.addEventListener("mouseup", () => {
    layer.remove();
    separator.style.background = "var(--separator-color)";
    separator.style.borderLeftColor = "rgb(255, 255, 255)";
    separator.style.borderRightColor = "rgb(255, 255, 255)";
  });
};

/**
 * 入力用エディターに入力された内容をトランスパイラに渡してトランスパイルし、
 * その結果を出力用エディターに反映させる一連の処理を実装します。
 */
const implementSystemThatTranspile = () => {

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

implementSystemThatTranspile();
implementSystemThatChangeEditorsWidthByDragging();
