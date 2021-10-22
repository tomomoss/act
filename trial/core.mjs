import {
  transpile
} from "../dist/act.mjs";
import {
  Encoding
} from "./encoding.min.mjs";
import {
  TOMEditor
} from "./tom-editor.mjs";

/**
 * ダウンロードボタンを表すHTML要素を生成します。
 * @returns {HTMLButtonElement} ダウンロードボタンを表すHTML要素です。
 */
const createDownloadButton = () => {
  const downloadButton = document.createElement("button");
  downloadButton.classList.add("footer__download-button");
  downloadButton.textContent = "Download";
  return downloadButton;
};

/**
 * 外部へのリンクを表すHTML要素を生成します。
 * @param {string} url リンク先を指すURLです。
 * @param {string} name リンク先の名前です。
 * @returns {HTMLAnchorElement} 外部へのリンクを表すHTML要素です。
 */
const createExternalLink = (url, name) => {
  const externalLink = document.createElement("a");
  externalLink.classList.add("header__external-link");
  externalLink.href = url;
  externalLink.rel = "noopener noreferrer";
  externalLink.target = "_blank";
  externalLink.textContent = name;
  return externalLink;
};

/**
 * エディター間の区切り線を表すHTML要素を生成します。
 * @returns {HTMLDivElement} エディター間の区切り線を表すHTML要素です。
 */
const createFooter = () => {
  const footer = document.createElement("div");
  footer.classList.add("footer");
  footer.appendChild(createTranspileConsole());
  footer.appendChild(createDownloadButton());
  return footer;
};

/**
 * ヘッダーを表すHTML要素を生成します。
 * @returns {HTMLElement} ヘッダーを表すHTML要素です。
 */
const createHeader = () => {
  const header = document.createElement("header");
  header.classList.add("header");
  header.appendChild(createTitle());
  header.appendChild(createNavigation());
  return header;
};

/**
 * 入力用エディターを実装するHTML要素を生成します。
 * @returns {HTMLDivElement} 入力用エディターを実装するHTML要素です。
 */
const createInputEditorContainer = () => {
  const inputEditorContainer = document.createElement("div");
  inputEditorContainer.classList.add("main__editor-container", "main__input-editor-container");
  return inputEditorContainer;
};

/**
 * 当アプリの主要な内容を格納したHTML要素を生成します。
 * @returns {HTMLElement} 当アプリの主要な内容を格納したHTML要素です。
 */
const createMain = () => {
  const main = document.createElement("main");
  main.classList.add("main");
  main.appendChild(createInputEditorContainer());
  main.appendChild(createSeparator());
  main.appendChild(createOutputEditorContainer());
  return main;
};

/**
 * 外部WebページへのリンクをまとめたHTML要素を生成します。
 * @returns {HTMLElement} 外部WebページへのリンクをまとめたHTML要素です。
 */
const createNavigation = () => {
  const navigation = document.createElement("nav");
  navigation.classList.add("header__nav");
  navigation.appendChild(createExternalLink("https://github.com/tomomoss/act", "GitHub"));
  navigation.appendChild(createExternalLink("https://github.com/tomomoss/act/wiki", "Wiki"));
  return navigation;
};

/**
 * 出力用エディターを実装するHTML要素を生成します。
 * @returns {HTMLDivElement} 出力用エディターを実装するHTML要素です。
 */
const createOutputEditorContainer = () => {
  const outputEditorContainer = document.createElement("div");
  outputEditorContainer.classList.add("main__editor-container", "main__output-editor-container");
  return outputEditorContainer;
};

/**
 * エディター間の区切り線を表すHTML要素を生成します。
 * @returns {HTMLDivElement} エディター間の区切り線を表すHTML要素です。
 */
const createSeparator = () => {
  const separator = document.createElement("div");
  separator.classList.add("main__separator");
  return separator;
};

/**
 * アプリのタイトルを表すHTML要素を生成します。
 * @returns {HTMLHeadingElement} アプリのタイトルを表すHTML要素です。
 */
const createTitle = () => {
  const title = document.createElement("h1");
  title.classList.add("header__title");
  title.textContent = "Advanced Command-prompt Transpiler";
  return title;
};

/**
 * トランスパイル状況を表示するコンソールを表すHTML要素を生成します。
 * @returns {HTMLParagraphElement} トランスパイル状況を表示するコンソールを表すHTML要素です。
 */
const createTranspileConsole = () => {
  const transpileConsole = document.createElement("p");
  transpileConsole.classList.add("footer__console");
  return transpileConsole;
};

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
let _inputEditorContainer;

// 出力用エディターの実装対象となるHTML要素です。
let _outputEditorContainer;

// トランスパイル結果です。
let _transpileResult;

// 初期化を開始します。
// まずは静的なHTML要素を生成・挿入します。
document.body.appendChild(createHeader());
document.body.appendChild(createMain());
document.body.appendChild(createFooter());

// 静的な初期化が終わったら本命となるトランスパイル処理周りを初期化します。
// 初期化順は順不同で大丈夫です。
_inputEditorContainer = document.querySelector(".main__input-editor-container");
_outputEditorContainer = document.querySelector(".main__output-editor-container");
implementSystemThatChangeEditorsWidthByDragging();
implementSystemThatDownloadFile();
implementSystemThatTranspile();
