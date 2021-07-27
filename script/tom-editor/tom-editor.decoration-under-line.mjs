"use strict";

/**
 * 現在フォーカスしている行の位置を分かりやすくするための装飾線です。
 */
const DecorationUnderline = class {

  /**
   * 装飾下線を初期化します。
   * @param {Element} superRoot エディター本体を表すHTML要素です。
   * @param {number} lineNumberAreaWidth 行番号領域の横幅です。
   * @param {number} virticalScrollbarAreaWidth 水平方向のスクロールバー領域の横幅です。
   */
  constructor(superRoot, lineNumberAreaWidth, virticalScrollbarAreaWidth) {
    Object.seal(this);
    this.root = document.createElement("div");
    this.root.classList.add("tom-editor__decoration-underline");
    this.root.style.left = `${lineNumberAreaWidth}px`;
    this.root.style.right = `${virticalScrollbarAreaWidth}px`;
    superRoot.appendChild(this.root);
  }

  /** @type {Element} 自身（装飾下線）を表すHTML要素です。 */
  root;

  /**
   * エディター上から装飾下線を取り除きます。
   */
  blurDecorationUnderline = () => {
    this.root.classList.remove("tom-editor__decoration-underline--active");
  };

  /**
   * 引数で指定された文字領域の列に装飾下線を移動させます。
   * @param {number} cordinateY 装飾下線を配置する垂直座標です。
   */
  placeDecorationUnderline = (cordinateY) => {
    this.root.classList.add("tom-editor__decoration-underline--active");
    this.root.style.top = `${cordinateY + parseFloat(getComputedStyle(this.root).lineHeight)}px`;
  };
};

export {
  DecorationUnderline
}
