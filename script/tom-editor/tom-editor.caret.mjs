"use strict";

/**
 * キャレットです。
 */
 const Caret = class {

  /**
   * キャレットを初期化します。
   * @param {Element} superRoot エディター本体を表すHTML要素です。
   */
  constructor(superRoot) {
    Object.seal(this);
    this.root = document.createElement("textarea");
    this.root.classList.add("tom-editor__caret");
    this.root.style.height = superRoot.style.lineHeight;
    superRoot.appendChild(this.root);
  }

  /** @type {Element} 自身（キャレット）を表すHTML要素です。 */
  root;

  /**
   * エディター上からキャレットを取り除きます。
   */
  blurCaret = () => {
    this.root.classList.remove("tom-editor__caret--active");
  };

  /**
   * 引数で指定されたHTML要素（文字領域の文字であるはず）にキャレットを移動させます。
   * @param {number} coordinateX 文字領域左上から相対的に求められたキャレットの水平座標です。
   * @param {number} cordinateY 文字領域左上から相対的に求められたキャレットの垂直座標です。
   */
  placeCaret = (coordinateX, cordinateY) => {
    this.root.classList.add("tom-editor__caret--active");
    this.root.classList.remove("tom-editor__caret--blinking-animation-active");
    this.root.style.left = `${coordinateX}px`;
    this.root.style.top = `${cordinateY}px`;
    this.root.focus();
    setTimeout(() => {
      this.root.classList.add("tom-editor__caret--blinking-animation-active");
    }, 1);
  };
};

export {
  Caret
}
