"use strict";

/**
 * 縦方向のスクロールバー領域です。
 */
const VirticalScrollbarArea = class {

  /**
   * 縦方向のスクロールバー領域を初期化します。
   * @param {Element} superRoot エディター本体を表すHTML要素です。
   */
  constructor(superRoot) {
    Object.seal(this);

    // 領域を初期化します。
    this.root = document.createElement("div");
    this.root.classList.add("tom-editor__virtical-scrollbar-area");
    superRoot.appendChild(this.root);

    // スクロールバーを初期化します。
    this.virticalScrollbar = document.createElement("div");
    this.virticalScrollbar.classList.add("tom-editor__virtical-scrollbar-area__virtical-scrollbar");
    this.root.appendChild(this.virticalScrollbar);
  }

  /** @type {Element} 自身（縦方向のスクロールバー領域）を表すHTML要素です。 */
  root;

  /** @type {Element} スクロールバーを表すHTML要素です。 */
  virticalScrollbar;

  /**
   * スクロールバーの状態を更新します。
   * @param {number} textAreaContentHeight 文字領域の内容量の縦幅です。
   * @param {number} textAreaScrollHeight 文字領域の完全な縦幅です。
   * @param {number} textAreaScrollTop 文字領域の縦方向のスクロール量です。
   */
  resetVirticalScrollbar = (textAreaContentHeight, textAreaScrollHeight, textAreaScrollTop) => {

    // 文字領域内容量の横幅が文字領域横幅に収まっているときはスクロールバーを表示しません。
    if (!(textAreaContentHeight < textAreaScrollHeight)) {
      this.virticalScrollbar.classList.remove("tom-editor__virtical-scrollbar-area__virtical-scrollbar--active");
      return;
    }

    // スクロールバーのスタイルを更新します。
    this.virticalScrollbar.classList.add("tom-editor__virtical-scrollbar-area__virtical-scrollbar--active");
    this.virticalScrollbar.style.height = new Intl.NumberFormat("ja", {
      maximumSignificantDigits: 4,
      style: "percent"
    }).format(textAreaContentHeight / textAreaScrollHeight);

    // スクロールバーの位置を更新します。
    this.virticalScrollbar.style.top = `${textAreaScrollTop * (textAreaContentHeight / textAreaScrollHeight)}px`;
  };
};

export {
  VirticalScrollbarArea
}
