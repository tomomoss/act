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
 * 当アプリ起動時に流れるオープニングアニメーションを実装します。
 */
const initializeOpeningAnimationProcess = () => {

  // まずは描画するアニメーションの下地となるcanvasタグを配置します。
  const openingAnimationLayer = document.createElement("canvas");
  openingAnimationLayer.classList.add("opening-animation-layer");
  openingAnimationLayer.height = innerHeight;
  openingAnimationLayer.width = innerWidth;
  document.body.appendChild(openingAnimationLayer);

  // 配置するのと同時にWeb Animations APIで背景を白から空色へフェードします。
  // フェードが完了したら今度はCanvas APIによるアニメーションに移ります。
  openingAnimationLayer.addEventListener("animationend", () => {
    const context2D = openingAnimationLayer.getContext("2d");
    context2D.lineCap = "round";
    context2D.lineJoin = "round";
    requestOpeningAnimationFrame(context2D);
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
 * Window.requestAnimationFrameメソッドを使用してオープニングアニメーションを描画していきます。
 * @param {CanvasRenderingContext2D} context2D 2Dレンダリングコンテキストです。
 */
const requestOpeningAnimationFrame = (context2D) => {
  const animationMinWidth = 960;
  let overAnimationMinWidth;
  let animationScale;
  if (innerWidth < animationMinWidth) {
    overAnimationMinWidth = 0;
    animationScale = innerWidth / animationMinWidth;
  } else {
    overAnimationMinWidth = innerWidth - animationMinWidth;
    animationScale = 1;
  }

  // まずはロゴのうち一筆書きでかける部分を描画します。
  context2D.lineWidth = 3;
  context2D.strokeStyle = "rgb(0, 51, 102)";
  context2D.beginPath();
  context2D.moveTo(-10, innerHeight / 100 * 50);
  context2D.lineTo((320 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50);
  context2D.lineTo((360 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 100 * animationScale);
  context2D.lineTo((400 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50);
  context2D.lineTo((560 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 100 * animationScale);
  context2D.lineTo(innerWidth + 10, innerHeight / 100 * 50 - 100 * animationScale);
  context2D.stroke();

  // 「A」の横線を描画します。
  context2D.beginPath();
  context2D.moveTo((340 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 25 * animationScale);
  context2D.lineTo((380 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 25 * animationScale);
  context2D.stroke();

  // 「T」の縦線を描画します。
  context2D.beginPath();
  context2D.moveTo((600 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 90 * animationScale);
  context2D.lineTo((600 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50);
  context2D.stroke();

  // 「C」の上部分を描画します。
  const gradient = context2D.createLinearGradient(
    (430 + overAnimationMinWidth / 2) * animationScale,
    innerHeight / 100 * 50 - 100 * animationScale,
    (530 + overAnimationMinWidth / 2) * animationScale,
    innerHeight / 100 * 50
  );
  gradient.addColorStop(0, "rgb(255, 153, 0)");
  gradient.addColorStop(0.5, "rgb(255, 204, 0)");
  gradient.addColorStop(1, "rgb(204, 102, 0)");
  context2D.lineWidth = 5;
  context2D.shadowColor = "rgb(255, 204, 0)";
  context2D.shadowBlur = 5;
  context2D.strokeStyle = gradient;
  context2D.beginPath();
  context2D.arc(
    (480 + overAnimationMinWidth / 2) * animationScale,
    innerHeight / 100 * 50 - 50 * animationScale,
    50,
    162 / 180 * Math.PI,
    315 / 180 * Math.PI
  );
  context2D.arc(
    (480 + overAnimationMinWidth / 2) * animationScale,
    innerHeight / 100 * 50 - 50 * animationScale,
    50,
    315 / 180 * Math.PI,
    238.5 / 180 * Math.PI,
    true
  );
  context2D.lineTo(((480 + overAnimationMinWidth / 2) * animationScale) - 6, (innerHeight / 100 * 50 - 50 * animationScale) - 10);
  context2D.stroke();

  // 「C」の下部分を描画します。
  context2D.beginPath();
  context2D.arc(
    (480 + overAnimationMinWidth / 2) * animationScale,
    innerHeight / 100 * 50 - 50 * animationScale,
    50,
    45 / 180 * Math.PI,
    135 / 180 * Math.PI
  );
  context2D.lineTo(((480 + overAnimationMinWidth / 2) * animationScale) + 6, (innerHeight / 100 * 50 - 50 * animationScale) + 10);
  context2D.lineTo(((480 + overAnimationMinWidth / 2) * animationScale) + 26, (innerHeight / 100 * 50 - 50 * animationScale) + 42);
  context2D.stroke();

  return;
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

initializeOpeningAnimationProcess();
initializeTranspilerProcess();
initializeAreasWidthRatioResizingProcess();
