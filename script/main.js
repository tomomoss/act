"use strict";

import {
  transpile
} from "./transpiler.mjs";
import {
  TOMEditor
} from "./tom-editor/tom-editor.mjs";

/**
 * ACTロゴのうち一筆書きで描ける部分を描画します。
 * @param {CanvasRenderingContext2D} context2D 描画に使用するコンテキストです。
 * @param {number} animationScale アニメーションの縮尺です。
 * @param {number} overAnimationMinWidth 最低限のアニメーション領域横幅から超えているピクセル量です。
 * @param {number} logoDrawingRatio1 一筆書きで描ける部分の描画進行率です。
 * @param {number} logoDrawingRatio2 Aの横線とTの縦線用の描画進行率です。
 * @param {number} logoDrawingRatio3 Cの描画進行率です。
 */
const drawOpeningAnimation = (openingAnimationLayer, context2D, logoDrawingRatio1, logoDrawingRatio2, logoDrawingRatio3) => {
  const animationMinWidth = 960;
  let animationScale;
  let overAnimationMinWidth;
  if (innerWidth < animationMinWidth) {
    animationScale = innerWidth / animationMinWidth;
    overAnimationMinWidth = 0;
  } else {
    animationScale = 1;
    overAnimationMinWidth = innerWidth - animationMinWidth;
  }
  context2D.clearRect(0, 0, innerWidth, innerHeight);

  // まずはロゴのうち一筆書きでかける部分を描画します。
  context2D.globalCompositeOperation = "source-over";
  context2D.lineCap = "round";
  context2D.lineJoin = "round";
  context2D.lineWidth = 2 * animationScale;
  context2D.shadowBlur = 0;
  context2D.strokeStyle = "rgb(0, 51, 102)";
  context2D.beginPath();
  context2D.moveTo(-10, innerHeight / 100 * 50);
  context2D.lineTo((320 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50);
  context2D.lineTo((360 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 100 * animationScale);
  context2D.lineTo((400 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50);
  context2D.lineTo((560 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 100 * animationScale);
  context2D.lineTo(innerWidth + 10, innerHeight / 100 * 50 - 100 * animationScale);
  context2D.stroke();

  // アニメーションで描いていきます。
  if (logoDrawingRatio1 < 0.33) {
    logoDrawingRatio1 *= 1.08;
  } else if (logoDrawingRatio1 < 0.66) {
    logoDrawingRatio1 *= 1.05;
  } else {
    logoDrawingRatio1 *= 1.02;
  }
  context2D.fillStyle = "rgb(0, 51, 102)";
  context2D.globalCompositeOperation = "source-in";
  context2D.beginPath();
  context2D.fillRect(0, 0, innerWidth * logoDrawingRatio1, innerHeight);

  // 第2段階です。
  if (logoDrawingRatio1 > 1.5) {
    logoDrawingRatio2 *= 1.1;
    if (logoDrawingRatio2 > 1) {
      logoDrawingRatio2 = 1.001;
    }
    context2D.globalCompositeOperation = "source-over";

    // 「A」の横線を描画します。
    context2D.beginPath();
    context2D.moveTo((340 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 25 * animationScale);
    context2D.lineTo((340 + overAnimationMinWidth / 2) * animationScale + (40 * animationScale) * logoDrawingRatio2, innerHeight / 100 * 50 - 25 * animationScale);
    context2D.stroke();

    // 「T」の縦線を描画します。
    context2D.beginPath();
    context2D.moveTo((600 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 90 * animationScale);
    context2D.lineTo((600 + overAnimationMinWidth / 2) * animationScale, innerHeight / 100 * 50 - 90 * animationScale * (1 - logoDrawingRatio2));
    context2D.stroke();
  }

  // 第3段階です。
  if (logoDrawingRatio1 > 5) {
    logoDrawingRatio3 += 0.006;

    // 「C」にかけるグラデーションです。
    const gradient = context2D.createLinearGradient(
      (430 + overAnimationMinWidth / 2) * animationScale,
      innerHeight / 100 * 50 - 100 * animationScale,
      (530 + overAnimationMinWidth / 2) * animationScale,
      innerHeight / 100 * 50
    );
    gradient.addColorStop(0, "rgb(255, 153, 0)");
    gradient.addColorStop(0.5, "rgb(255, 204, 0)");
    gradient.addColorStop(1, "rgb(204, 102, 0)");
    context2D.globalCompositeOperation = "source-over";
    context2D.lineWidth = 5 * animationScale;
    context2D.shadowColor = "rgb(255, 204, 0)";
    context2D.shadowBlur = 7 * animationScale;
    context2D.strokeStyle = gradient;

    // 以下、各部位の描画進捗率を表す値です。
    let cTopFirstHalf;
    if (logoDrawingRatio3 < 0.274) {
      cTopFirstHalf = logoDrawingRatio3 / 0.274;
    } else {
      cTopFirstHalf = 1;
    }
    let cTopCenterBar;
    let cTopSecondHalf;
    if (logoDrawingRatio3 > 0.274) {
      if (logoDrawingRatio3 < 0.5) {
        cTopCenterBar = (logoDrawingRatio3 - 0.274) / 0.226;
      } else {
        cTopCenterBar = 1;
      }
      if (logoDrawingRatio3 < 0.548) {
        cTopSecondHalf = (logoDrawingRatio3 - 0.274) / 0.274;
      } else {
        cTopSecondHalf = 1;
      }
    }
    let cBottom;
    if (logoDrawingRatio3 > 0.645) {
      if (logoDrawingRatio3 < 1) {
        cBottom = (logoDrawingRatio3 - 0.645) / 0.355;
      } else {
        cBottom = 1;
      }
    }
    let cBottomBar1;
    if (logoDrawingRatio3 > 0.645) {
      if (logoDrawingRatio3 < 0.85) {
        cBottomBar1 = (logoDrawingRatio3 - 0.645) / 0.205;
      } else {
        cBottomBar1 = 1;
      }
    }
    let cBottomBar2;
    if (logoDrawingRatio3 > 0.85) {
      if (logoDrawingRatio3 < 1) {
        cBottomBar2 = (logoDrawingRatio3 - 0.85) / 0.15;
      } else {
        cBottomBar2 = 1;
      }
    }

    // 最初は「C」の上半分を描画します。
    context2D.beginPath();
    context2D.arc(
      (480 + overAnimationMinWidth / 2) * animationScale,
      innerHeight / 100 * 50 - 50 * animationScale,
      50 * animationScale,
      315 / 180 * Math.PI,
      (238.5 + 76.5 * (1 - cTopFirstHalf)) / 180 * Math.PI,
      true
    );
    context2D.stroke();

    // 「C」の中央線です。
    if (typeof cTopCenterBar !== "undefined") {
      context2D.beginPath();
      context2D.moveTo(
        (((480 + overAnimationMinWidth / 2) * animationScale) - 26.1 * animationScale),
        ((innerHeight / 100 * 50 - 50 * animationScale) - 42.3 * animationScale)
      );
      context2D.lineTo(
        ((480 + overAnimationMinWidth / 2) * animationScale) - (6 + 20.1 * (1 - cTopCenterBar)) * animationScale,
        (innerHeight / 100 * 50 - 50 * animationScale) - (10 + 32.3 * (1 - cTopCenterBar)) * animationScale
      );
      context2D.stroke();
    }

    // 「C」の後半部分です。
    if (typeof cTopSecondHalf !== "undefined") {
      context2D.beginPath();
      context2D.arc(
        (480 + overAnimationMinWidth / 2) * animationScale,
        innerHeight / 100 * 50 - 50 * animationScale,
        50 * animationScale,
        238.5 / 180 * Math.PI,
        (162 + 76.5 * (1 - cTopSecondHalf)) / 180 * Math.PI,
        true
      );
      context2D.stroke();
    }

    // 次に「C」の下半分を描画します。
    if (typeof cBottom !== "undefined") {
      context2D.beginPath();
      context2D.arc(
        (480 + overAnimationMinWidth / 2) * animationScale,
        innerHeight / 100 * 50 - 50 * animationScale,
        50 * animationScale,
        135 / 180 * Math.PI,
        (36 + 99 * (1 - cBottom)) / 180 * Math.PI,
        true
      );
      context2D.stroke();
    }
    if (typeof cBottomBar1 !== "undefined") {
      context2D.beginPath();
      context2D.moveTo(
        ((480 + overAnimationMinWidth / 2) * animationScale) - 35.4 * animationScale,
        (innerHeight / 100 * 50 - 50 * animationScale) + 35.4 * animationScale
      );
      context2D.lineTo(
        ((480 + overAnimationMinWidth / 2) * animationScale) + (-35.4 + 41.4 * cBottomBar1) * animationScale,
        (innerHeight / 100 * 50 - 50 * animationScale) + (35.4 - 25.4 * cBottomBar1) * animationScale
      );
      context2D.stroke();
    }
    if (typeof cBottomBar2 !== "undefined") {
      context2D.beginPath();
      context2D.lineTo(
        ((480 + overAnimationMinWidth / 2) * animationScale) + 6 * animationScale,
        (innerHeight / 100 * 50 - 50 * animationScale) + 10 * animationScale
      );
      context2D.lineTo(
        ((480 + overAnimationMinWidth / 2) * animationScale) + (6 + 20 * cBottomBar2) * animationScale,
        (innerHeight / 100 * 50 - 50 * animationScale) + (10 + 32 * cBottomBar2) * animationScale
      );
      context2D.stroke();
    }
  }

  // 全部の描画が完了したらアニメーション処理から抜けます。
  if (logoDrawingRatio3 > 1) {
    document.querySelector(".header--opening").classList.remove("header--opening");
    document.querySelector(".main--opening").classList.remove("main--opening");
    openingAnimationLayer.classList.add("opening-animation-layer--fadeout");
    openingAnimationLayer.addEventListener("animationend", () => {
      openingAnimationLayer.remove();
    });
    return;
  }

  requestAnimationFrame(() => {
    drawOpeningAnimation(openingAnimationLayer, context2D, logoDrawingRatio1, logoDrawingRatio2, logoDrawingRatio3);
  });
};

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

  // オープニングアニメーションを描画するcanvasタグをDOMツリーに挿入します。
  // 挿入と同時に、Web Animations APIによる背景色のフェードアニメーションが起動します。
  const openingAnimationLayer = document.createElement("canvas");
  openingAnimationLayer.classList.add("opening-animation-layer");
  openingAnimationLayer.height = innerHeight;
  openingAnimationLayer.width = innerWidth;
  document.body.appendChild(openingAnimationLayer);
  new ResizeObserver(() => {
    openingAnimationLayer.height = innerHeight;
    openingAnimationLayer.width = innerWidth;
  }).observe(openingAnimationLayer);

  // アニメーション終了と同時にロゴの描画を行います。
  setTimeout(() => {
    const context2D = openingAnimationLayer.getContext("2d");

    // アニメーションで描画します。
    requestAnimationFrame(() => {
      drawOpeningAnimation(openingAnimationLayer, context2D, 0.001, 0.075, 0);
    });

  }, parseFloat(getComputedStyle(openingAnimationLayer).animationDuration) * 1000 + parseFloat(getComputedStyle(openingAnimationLayer).animationDelay) * 1000);
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

initializeOpeningAnimationProcess();
initializeTranspilerProcess();
initializeAreasWidthRatioResizingProcess();
