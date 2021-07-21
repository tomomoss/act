"use strict";

/**
 * 行番号領域です。
 */
const LineNumberArea = class {

  /**
   * 行番号領域を初期化します。
   * @param {Element} superRoot エディター本体を表すHTML要素です。
   */
  constructor(superRoot) {
    Object.seal(this);

    // 行番号領域の横幅を決めるために、半角英数字の横幅を求めます。
    const temporaryElement = document.createElement("span");
    temporaryElement.innerHTML = "0";
    superRoot.appendChild(temporaryElement);
    const alphanumericWidth = temporaryElement.getBoundingClientRect().width;
    temporaryElement.remove();
    
    // 行番号領域を初期化します。
    this.root = document.createElement("div");
    this.root.classList.add("tom-editor__line-number-area");
    this.root.style.flexBasis = `${alphanumericWidth * 4}px`;
    superRoot.appendChild(this.root);
    this.negativeSpace = document.createElement("div");
    this.root.appendChild(this.negativeSpace);
    this.appendLineNumber();
  }

  /** @type {number} フォーカスしている行を指すインデックス値です。 */
  focusedLineNumberIndex;

  /** @type {Array<Element>} DOMに挿入中の行番号達です。 */
  lineNumbers = [];

  /** @type {Element} 領域下部の余白を表すHTML要素です。 */
  negativeSpace;

  /** @type {Element} 自身（行番号領域）を表すHTML要素です。 */
  root;

  /**
   * 行番号を1つ追加します。
   */
  appendLineNumber = () => {
    const lineNumber = this.createLineNumber();
    this.lineNumbers.push(lineNumber);
    this.negativeSpace.before(this.lineNumbers[this.lineNumbers.length - 1]);
  };

  /**
   * フォーカスしている位置に応じて自動的にスクロールします。
   * 行番号領域のスクロール量が文字領域のスクロール量に影響を与えます。
   */
  autoScroll = () => {

    // そもそもスクロールできないならば、することがないので処理から抜けます。
    if (!(this.root.offsetHeight < this.root.scrollHeight)) {
      return;
    }

    const focusedLineNumberPositionY = this.lineNumbers[this.focusedLineNumberIndex].getBoundingClientRect().top;
    const lineNumberAreaPositionY = this.root.getBoundingClientRect().top;
    const remHeight = parseFloat(getComputedStyle(this.root).fontSize);

    // 行番号上縁より0.5rem以上は自動スクロールの対象となります。
    if (focusedLineNumberPositionY < lineNumberAreaPositionY + remHeight * 0.5) {
      this.scrollVertically(focusedLineNumberPositionY - lineNumberAreaPositionY - remHeight * 0.5);
      return;
    }

    // 行番号下縁より3.5rem以下は自動スクロールの対象となります。
    const lineNumberAreaHeight = this.root.getBoundingClientRect().height;
    if (focusedLineNumberPositionY > lineNumberAreaPositionY + lineNumberAreaHeight - remHeight * 3.5) {
      this.scrollVertically(focusedLineNumberPositionY - lineNumberAreaPositionY - lineNumberAreaHeight + remHeight * 3.5);
      return;
    }
  };

  /**
   * 行番号を表すHTML要素を生成します。
   * @returns {Element} 行番号を表すHTML要素です。
   */
  createLineNumber = () => {
    const lineNumber = document.createElement("div");
    lineNumber.innerHTML = this.lineNumbers.length + 1;
    lineNumber.classList.add("tom-editor__line-number-area__line-number");
    return lineNumber;
  };

  /**
   * 行番号を1つ消します。
   */
  removeLineNumber = () => {
    this.lineNumbers.pop().remove();
  };

  /**
   * 行番号を更新します。
   * @param {number} numberOfTextLines 行数です。
   * @param {number} focusedTextLineIndex フォーカスしている行を指すインデックスです。
   */
  resetLineNumber = (numberOfTextLines, focusedTextLineIndex) => {
    if (typeof numberOfTextLines === "undefined") {
      if (typeof this.focusedLineNumberIndex !== "undefined") {
        this.lineNumbers[this.focusedLineNumberIndex].classList.remove("tom-editor__line-number-area__line-number--focus");
        this.focusedLineNumberIndex = undefined;
        return;
      }
      return;
    }

    // 行番号数を更新します。
    if (this.lineNumbers.length < numberOfTextLines) {
      for (let i = 0; numberOfTextLines - this.lineNumbers.length; i += 1) {
        this.appendLineNumber();
      }
    } else if (this.lineNumbers.length > numberOfTextLines) {
      for (let i = 0; this.lineNumbers.length - numberOfTextLines; i += 1) {
        this.removeLineNumber();
      }
    }

    // フォーカス行を更新します。
    if (this.focusedLineNumberIndex === focusedTextLineIndex) {
      return;
    }
    if (typeof this.focusedLineNumberIndex !== "undefined" && typeof this.lineNumbers[this.focusedLineNumberIndex] !== "undefined") {
      this.lineNumbers[this.focusedLineNumberIndex].classList.remove("tom-editor__line-number-area__line-number--focus");
    }
    this.focusedLineNumberIndex = focusedTextLineIndex;
    this.lineNumbers[this.focusedLineNumberIndex].classList.add("tom-editor__line-number-area__line-number--focus");
  };

  /**
   * 余白の縦幅を更新します。
   */
  resetNegativeSpaceHeight = () => {
    const areaHeight = this.root.getBoundingClientRect().height;
    const sampleLineNumber = this.createLineNumber();
    this.root.appendChild(sampleLineNumber);
    const lineNumberHeight = sampleLineNumber.getBoundingClientRect().height;
    sampleLineNumber.remove();
    const negativeSpaceHeight = `${areaHeight - parseFloat(getComputedStyle(this.root).paddingTop) - lineNumberHeight}px`;
    this.negativeSpace.style.height = negativeSpaceHeight;
  };

  /**
   * 引数で指定された量だけ縦方向にスクロールします。
   * @param {number} scrollSize スクロールする量です。
   */
  scrollVertically = (scrollSize) => {
    this.root.scrollTop += scrollSize;
  };
};

export {
  LineNumberArea
}
