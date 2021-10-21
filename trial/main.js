import {
  transpile
} from "../dist/act.mjs";
import {
  Encoding
} from "./encoding.min.mjs";
import {
  playOpeningAnimation
} from "./opening-animation.mjs";
import {
  TOMEditor
} from "./tom-editor.mjs";

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
  layer.classList.add("layer-of-col-resize");

  // 区切り線をクリックすると横幅変更処理状態に入ったことを使用者に知らせるために区切り線の色を変更するとともに、
  // ドラッグ操作中であることを視覚的に表現するためのHTML要素を挿入します。
  separator.addEventListener("mousedown", (event) => {
    event.preventDefault();
    document.body.appendChild(layer);
    separator.classList.add("main__separator--dragging");
  });

  // Webページ上でマウスカーソルを移動させたとき、横幅変更処理状態のフラグが立っているならば当該処理を実行します。
  window.addEventListener("mousemove", (event) => {
    if (!document.body.contains(layer) || event.movementX === 0) {
      return;
    }
    const newInputEditorWidth = event.pageX;
    const newOutputEditorWidth = editorsWrapper.clientWidth - separator.offsetWidth - event.pageX;
    _inputEditorContainer.style.flexBasis = `${newInputEditorWidth / (newInputEditorWidth + newOutputEditorWidth) * 100}%`;
    _outputEditorContainer.style.flexBasis = `${newOutputEditorWidth / (newInputEditorWidth + newOutputEditorWidth) * 100}%`;
  });

  // クリックから指を離されたときは横幅変更処理状態から抜けたことを使用者に知らせるために区切り線の色を変更します。
  // ドラッグ操作中であることを視覚的に表現するためのHTML要素を除外します。
  window.addEventListener("mouseup", () => {
    layer.remove();
    separator.classList.remove("main__separator--dragging");
  });
};

/**
 * トランスパイルされたソースコードをファイルに格納してダウンロードする処理を実装します。
 */
const implementSystemThatDownloadFile = () => {

  // ダウンロード処理を実行するたびに<a>タグが作られないようにEventTarget.addEventListenerメソッドの外側で作成しておきます。
  const anchorTag = document.createElement("a");
  anchorTag.download = "act.bat";

  const downloadButton = document.querySelector(".footer__download-button");
  downloadButton.addEventListener("mousedown", () => {
    popupDonwloadProcessWindow();
    if (!_transpileResult.success) {
      return;
    }

    // ライブラリ「encoding.js」を使用してShift JISに変換してからダウンロード処理を実行します。
    const utf16List = [];
    for (let i = 0; i < _transpileResult.value.length; i += 1) {
      utf16List.push(_transpileResult.value.charCodeAt(i));
    }
    const characterEncodingBeforeConvert = Encoding.detect(_transpileResult.value);
    const shiftjisList = Encoding.convert(utf16List, "SJIS", characterEncodingBeforeConvert);
    anchorTag.href = URL.createObjectURL(new Blob([new Uint8Array(shiftjisList)], {
      type: "text/plain"
    }));
    anchorTag.dispatchEvent(new MouseEvent("click"))
    URL.revokeObjectURL(anchorTag.href);
  });
};

/**
 * 入力用エディターに入力された内容をトランスパイラに渡してトランスパイルし、
 * その結果を出力用エディターに反映させる一連の処理を実装します。
 */
const implementSystemThatTranspile = () => {

  // 入力用・出力用のエディターをWebページ上に配置します。
  const inputEditor = new TOMEditor(_inputEditorContainer, {
    autofocus: true
  });
  const outputEditor = new TOMEditor(_outputEditorContainer, {
    readonly: true
  });

  // 入力用エディターに入力があるたびにトランスパイル処理を実行し、その結果をUIに反映します。
  const transpilerConsole = document.querySelector(".footer__console");
  inputEditor.valueObserver = (value) => {
    _transpileResult = transpile(value);
    if (_transpileResult.success) {
      outputEditor.value = _transpileResult.value;
      transpilerConsole.innerText = "";
      return;
    }
    transpilerConsole.innerText = `[Error] ${_transpileResult.value.row}行, ${_transpileResult.value.column}列: ${_transpileResult.value.message}`;
  };

  // 初期化しておきます。
  _transpileResult = transpile("");
  outputEditor.value = _transpileResult.value;
  transpilerConsole.innerText = "";
};

/**
 * ダウンロード処理の状態・状況を知らせるウィンドウを表示します。
 */
const popupDonwloadProcessWindow = () => {
  const popupWindow = document.createElement("div");
  popupWindow.classList.add("popup-window");
  if (_transpileResult.success) {
    popupWindow.classList.add("popup-window--success");
    popupWindow.textContent = "トランスパイル正常: ダウンロードを開始します。";
  } else {
    popupWindow.classList.add("popup-window--failure");
    popupWindow.textContent = "トランスパイル異常: 構文エラーが発生しています。ダウンロードは構文エラーを修正してから再実行してください。";
  }
  document.body.appendChild(popupWindow);
  popupWindow.addEventListener("animationend", () => {
    popupWindow.remove();
  });
};

// 入力用エディターの実装対象となるHTML要素です。
const _inputEditorContainer = document.querySelector(".main__input-editor-container");

// 出力用エディターの実装対象となるHTML要素です。
const _outputEditorContainer = document.querySelector(".main__output-editor-container");

// トランスパイル結果です。
let _transpileResult;

playOpeningAnimation();

// 初期化順は順不同で問題ありません。
implementSystemThatChangeEditorsWidthByDragging();
implementSystemThatDownloadFile();
implementSystemThatTranspile();
