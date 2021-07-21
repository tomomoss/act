"use strict";

import {
  transpile
} from "./transpiler.mjs";
import {
  TOMEditor
} from "./tom-editor/tom-editor.mjs";

/**
 * 区切り線のドラッグ移動によるエディター領域とトランスパイル結果領域の横幅調整処理を実装します。
 */
const initializeAreasWidthRatioResizingProcess = () => {

  // 領域を包む親要素の横幅です。
  const mainArea = document.querySelector(".main");
  let mainAreaWidth = mainArea.getBoundingClientRect().width;

  // 区切り線の水平座標の親要素の領域に対する割合です。
  // 「0」だと左端に、「1」だと右端に近い位置にあることを意味します。
  // 直後のResizeObserverオブジェクトのインスタンス化時に横幅調整処理が走るのですが、
  // そのときに初期状態――エディター領域とトランスパイル結果領域の横幅半々になるように初期値を設定しています。
  let separatorRatio = 0.5;

  // 領域の親要素の横幅が変化したときは、コンテンツそれぞれの横幅の割合を維持するように調整をかけます。
  // ResizeObserverオブジェクトのインスタンス化と同時に調整処理も1回走るようになっています。
  new ResizeObserver(() => {
    mainAreaWidth = mainArea.getBoundingClientRect().width;
    setMainAreaContentsWidthRatio(separatorRatio);
  }).observe(mainArea);

  // ドラッグによる横幅調整処理です。
  let isDragging = false;
  window.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.classList.remove("body--resizing");
  });
  mainArea.addEventListener("mousemove", (event) => {
    if (isDragging) {
      separatorRatio = event.pageX / mainAreaWidth;
      setMainAreaContentsWidthRatio(separatorRatio);
    }
  });
  _.separator.addEventListener("mousedown", () => {
    isDragging = true;
    document.body.classList.add("body--resizing");
  });

  // 区切り線をダブルクリックしたときは初期状態――エディター領域とトランスパイル結果領域の横幅半々になるようにします。
  _.separator.addEventListener("dblclick", () => {
    separatorRatio = 0.5;
    setMainAreaContentsWidthRatio(separatorRatio);
  });
};

/**
 * 当Webアプリの根幹であるトランスパイラに直接関係する処理を実装します。
 */
const initializeTranspilerProcess = () => {

  // 主エディターの内容が変更されるたびにトランスパイル処理を実行します。
  let transpiledSourceCode = "";
  _.mainEditor.valueObserver = (value) => {
    transpiledSourceCode = transpile(value);
    if (transpiledSourceCode !== null) {
      _.subEditor.value = transpiledSourceCode;
    }
  };

  // トランスパイルが成功しているかどうか、どのような操作をしているかで背景色を変更します。
  const lineNumberArea = _.subEditor.lineNumberArea.root;
  const textArea = _.subEditor.textArea.root;
  _.subEditor.root.addEventListener("mouseenter", () => {
    if (transpiledSourceCode === null) {
      if (lineNumberArea.classList.contains("main__areas-in-sub-editor--successed")) {
        lineNumberArea.classList.remove("main__areas-in-sub-editor--successed");
      }
      if (textArea.classList.contains("main__areas-in-sub-editor--successed")) {
        textArea.classList.remove("main__areas-in-sub-editor--successed");
      }
      lineNumberArea.classList.add("main__areas-in-sub-editor--failed");
      textArea.classList.add("main__areas-in-sub-editor--failed");
      return;
    }
    if (lineNumberArea.classList.contains("main__areas-in-sub-editor--failed")) {
      lineNumberArea.classList.remove("main__areas-in-sub-editor--failed");
    }
    if (textArea.classList.contains("main__areas-in-sub-editor--failed")) {
      textArea.classList.remove("main__areas-in-sub-editor--failed");
    }
    _.subEditor.lineNumberArea.root.classList.add("main__areas-in-sub-editor--successed");
    _.subEditor.textArea.root.classList.add("main__areas-in-sub-editor--successed");
  });
  _.subEditor.root.addEventListener("mouseleave", () => {
    if (lineNumberArea.classList.contains("main__areas-in-sub-editor--successed")) {
      lineNumberArea.classList.remove("main__areas-in-sub-editor--successed");
    }
    if (lineNumberArea.classList.contains("main__areas-in-sub-editor--failed")) {
      lineNumberArea.classList.remove("main__areas-in-sub-editor--failed");
    }
    if (textArea.classList.contains("main__areas-in-sub-editor--successed")) {
      textArea.classList.remove("main__areas-in-sub-editor--successed");
    }
    if (textArea.classList.contains("main__areas-in-sub-editor--failed")) {
      textArea.classList.remove("main__areas-in-sub-editor--failed");
    }
  });
  _.subEditor.root.addEventListener("mousedown", () => {
    if (transpiledSourceCode === null) {
      popupMessage("トランスパイルエラー", "failed");
      return;
    }
    navigator.clipboard.writeText(_.subEditor.value);
    popupMessage("クリップボードにコピーしました", "successed");
  });

  // 初期化の一貫としてJavaScript側からエディターを操作します。
  _.mainEditor.value = " ";
  _.mainEditor.value = "";
};

/**
 * 引数に指定された文字を画面下部に表示します。
 * @param {string} message 表示するメッセージです。
 * @param {string} state 表示するウィンドウの種類です。
 */
const popupMessage = (message, state) => {
  const popupMessageWindow = document.createElement("div");
  popupMessageWindow.classList.add("main__popup-message-window");
  popupMessageWindow.innerHTML = message;
  document.body.appendChild(popupMessageWindow);
  if (state === "failed") {
    popupMessageWindow.classList.add("main__popup-message-window--failed");
  }
  if (state === "successed") {
    popupMessageWindow.classList.add("main__popup-message-window--successed");
  }
  popupMessageWindow.addEventListener("animationend", () => {
    popupMessageWindow.remove();
  });
};

/**
 * エディター領域とトランスパイル結果領域の横幅を調整します。
 * @param {number} editorAreaWidthRatio エディター領域の横幅の割合です。
 */
const setMainAreaContentsWidthRatio = (editorAreaWidthRatio) => {
  _.editorArea.style.flexBasis = `${editorAreaWidthRatio * 100}%`;
  _.resultArea.style.flexBasis = `${(1 - editorAreaWidthRatio) * 100}%`;
}

// さまざまな箇所で参照される値をまとめたオブジェクトです。
const _ = {};
_.editorArea = document.querySelector(".main__editor-area");
_.mainEditor = new TOMEditor(_.editorArea);
_.resultArea = document.querySelector(".main__result-area");
_.separator = document.querySelector(".main__separator");
_.subEditor = new TOMEditor(_.resultArea, {
  readonly: true
});

initializeTranspilerProcess();
initializeAreasWidthRatioResizingProcess();
