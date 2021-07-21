"use strict";

/**
 * 文字領域です。
 */
const TextArea = class {

  /**
   * 文字領域を初期化します。
   * @param {Element} superRoot エディター本体を表すHTML要素です。
   */
  constructor(superRoot) {
    Object.seal(this);

    // 文字領域を初期化します。
    this.root = document.createElement("div");
    this.root.classList.add("tom-editor__text-area");
    superRoot.appendChild(this.root);
    this.initializeTextLinesWrapper();
    this.initializeNegativeSpaceWrapper();
  }

  /** @type {Array<Array<Element>>} DOMに挿入されている文字（行末文字を含む）を表すHTML要素群をまとめた配列です。 */
  characters = [];

  /** @type {Array<Element>} 余白内に生成されるダミー行をまとめた配列です。 */
  dummyTextLines = [];

  /** @type {boolean} Shiftキーが押されている間はtrueが入ります。 */
  duringSelectionRange = false;

  /** @type {number} フォーカスされている列のインデックス値です。 */
  focusedColumnIndex;

  /** @type {number} フォーカスされている行のインデックス値です。 */
  focusedRowIndex;

  /** @type {Element} 文字領域のサイズ調整に大きく貢献する余白を表すHTML要素です。 */
  negativeSpace;

  /** @type {Element} 余白領域を包むHTML要素です。 */
  negativeSpaceWrapper;

  /** @type {number} 範囲選択開始地点となる列のインデックス値です。 */
  selectionRangeEndColumnIndex;

  /** @type {number} 範囲選択開始地点となる行のインデックス値です。 */
  selectionRangeEndRowIndex;

  /** @type {number} 範囲選択開始地点となる列のインデックス値です。 */
  selectionRangeStartColumnIndex;

  /** @type {number} 範囲選択開始地点となる行のインデックス値です。 */
  selectionRangeStartRowIndex;

  /** @type {Element} 自身（文字領域）を表すHTML要素です。 */
  root;

  /** @type {Array<Element>} DOMに挿入されている行を表すHTML要素群をまとめた配列です。 */
  textLines = [];

  /** @type {Element} 行を表すHTML要素を包むHTML要素です。 */
  textLinesWrapper;

  /**
   * フォーカス位置を起点に、文字を挿入します。
   * @param {string} value 入力する値です。
   */
  appendCharacter = (value) => {
    if (!(this.duringSelectionRange) && typeof this.selectionRangeStartRowIndex !== "undefined") {
      this.removeCharactersInSelectionRange();
    }
    const character = this.createCharacter(value);
    this.characters[this.focusedRowIndex].splice(this.focusedColumnIndex, 0, character);
    this.focusedColumnIndex += 1;
    this.getFocusedCharacter().before(character);
  };

  /**
   * 選択範囲に含めることができる全ての文字を選択範囲に含めます（文末文字は選択範囲に含めることができません）。
   * フォーカスの移動先は文末になります。
   */
  appendAllCharactersIntoSelectionRange = () => {
    this.selectionRangeStartRowIndex = 0;
    this.selectionRangeStartColumnIndex = 0;
    this.selectionRangeEndRowIndex = this.characters.length - 1;
    this.selectionRangeEndColumnIndex = this.characters[this.characters.length - 1].length - 2;
    for (const textLine of this.characters) {
      for (const character of textLine) {
        character.classList.add("tom-editor__text-area__character--select");
      }
    }
    this.focusedRowIndex = this.characters.length - 1;
    this.focusedColumnIndex = this.characters[this.characters.length - 1].length - 1;
    this.getFocusedCharacter().classList.remove("tom-editor__text-area__character--select");
  };

  /**
   * フォーカスされた位置を起点に行を追加します。
   * 改行に伴う文字移動処理も当メソッドで担当します。
   */
  appendTextLine = () => {

    // 改行時に新規行に持っていく文字を抽出します（行末文字は残します）。
    const cutAndPasteCharacters = this.characters[this.focusedRowIndex].slice(this.focusedColumnIndex, -1);
    this.characters[this.focusedRowIndex].splice(this.focusedColumnIndex, cutAndPasteCharacters.length);

    // フォーカス位置を次の行の先頭に移します。
    this.focusedRowIndex += 1;
    this.focusedColumnIndex = 0;

    // 新しい行を生成し、DOMに挿入します。
    const textLine = this.createTextLine();
    this.textLines.splice(this.focusedRowIndex, 0, textLine);
    this.characters.splice(this.focusedRowIndex, 0, []);
    this.textLines[this.focusedRowIndex - 1].after(this.getFocusedTextLine());

    // 改行に伴う移動処理対象となる文字があるならば含めます。
    for (const initialCharacter of cutAndPasteCharacters) {
      this.characters[this.focusedRowIndex].push(initialCharacter);
      this.getFocusedTextLine().appendChild(initialCharacter);
    }

    // 行末文字を追加します。
    const EOL = this.createEOL();
    this.characters[this.focusedRowIndex].push(EOL);
    this.getFocusedTextLine().appendChild(EOL);

    // 余白内にダミー行を追加します。
    const dummyTextLine = this.createDummyTextLine();
    this.dummyTextLines.push(dummyTextLine);
    this.negativeSpace.before(dummyTextLine);
  };

  /**
   * TextArea.autoScrollメソッドから水平方向の自動スクロール処理を抜き出したものです。
   */
  autoHorizontalScroll = () => {

    // そもそもスクロールできないならば、することがないので処理から抜けます。
    if (!(this.root.offsetWidth < this.root.scrollWidth)) {
      return;
    }

    // フォーカスしている文字が見づらい位置にあるならば見やすい位置にまでスクロールします。
    // 文字領域右側の場合は余白の横幅が自動スクロールの基準となります。
    // 文字領域左側の場合は当メソッド内で定義された横幅を基準とします。
    const focusX = this.getFocusedCharacter().getBoundingClientRect().left - this.root.getBoundingClientRect().left;
    const overLeftZone = parseFloat(getComputedStyle(this.root).fontSize) - focusX;
    if (overLeftZone > 0) {
      this.root.scrollLeft -= overLeftZone;
      return;
    }
    const overRightZone = focusX - (this.root.getBoundingClientRect().width - this.negativeSpaceWrapper.getBoundingClientRect().width);
    if (overRightZone > 0) {
      this.root.scrollLeft += overRightZone;
      return;
    }
  };

  /**
   * 文字領域のビューポートに対するフォーカス文字の座標に基づいて自動スクロールを実行します。
   * @param {number} focusedLineNumberScrollTop フォーカスされた行番号のスクロール量です。
   */
  autoScroll = (focusedLineNumberScrollTop) => {
    this.autoVirticalScroll(focusedLineNumberScrollTop);
    this.autoHorizontalScroll();
  };

  /**
   * TextArea.autoScrollメソッドから垂直方向の自動スクロール処理を抜き出したものです。
   * 文字領域のスクロール量は行番号領域のスクロール量から求められます。
   * @param {number} focusedLineNumberScrollTop フォーカスされた行番号のスクロール量です。
   */
  autoVirticalScroll = (focusedLineNumberScrollTop) => {
    this.scrollVertically(this.getFocusedTextLine().getBoundingClientRect().top - focusedLineNumberScrollTop);
  };

  /**
   * 選択範囲に含まれている文字を表すHTML要素群を文字列に変換します。
   * @param {boolean} cutFlag 変換時に範囲選択した範囲を削除するかどうかのフラグです。
   * @returns {string} 文字列化した範囲選択された値です。
   */
  convertSelectedRangeIntoText = (cutFlag) => {

    // 戻り値となる文字列です。
    let convertedText = "";

    // 範囲選択されていないならば空文字を返します。
    if (typeof this.selectionRangeStartRowIndex === "undefined") {
      return convertedText;
    }

    // 1文字ずつ取得していきます。
    let checkingRowIndex = this.selectionRangeStartRowIndex;
    let checkingColumnIndex = this.selectionRangeStartColumnIndex;
    while (true) {
      if (checkingColumnIndex === this.characters[checkingRowIndex].length - 1) {
        convertedText += "\n";
        checkingRowIndex += 1;
        checkingColumnIndex = 0;
      } else {
        convertedText += this.characters[checkingRowIndex][checkingColumnIndex].innerHTML;
        checkingColumnIndex += 1;
      }
      if (
        checkingRowIndex > this.selectionRangeEndRowIndex ||
        (checkingRowIndex === this.selectionRangeEndRowIndex && checkingColumnIndex > this.selectionRangeEndColumnIndex)
      ) {
        break;
      }
    }

    if (cutFlag) {
      this.removeCharactersInSelectionRange();
    }
    return convertedText;
  };

  /**
   * 文字を表すHTML要素を作成します。
   * @param {number|string} value HTML要素に挿れる文字です。
   * @returns {Element} 文字を表すHTML要素です。
   */
  createCharacter = (value) => {
    const character = document.createElement("span");
    character.classList.add("tom-editor__text-area__character");
    character.innerHTML = value;
    return character;
  };

  /**
   * 余白領域に追加するダミー行を表すHTML要素を作成します。
   * @returns {Element} ダミー行を表すHTML要素です。
   */
  createDummyTextLine = () => {
    const textLine = document.createElement("div");
    textLine.style.height = `${parseFloat(getComputedStyle(this.root).lineHeight)}px`;
    return textLine;
  };

  /**
   * 行末文字を表すHTML要素を作成します。
   * @returns {Element} 行末文字を表すHTML要素です。
   */
  createEOL = () => {
    const EOL = document.createElement("span");
    EOL.classList.add("tom-editor__text-area__character");
    EOL.innerHTML = " ";
    return EOL;
  };

  /**
   * 行を表すHTML要素を作成します。
   * @returns {Element} 行を表すHTML要素です。
   */
  createTextLine = () => {
    const textLine = document.createElement("div");
    return textLine;
  };

  /**
   * 選択範囲を解除し、選択範囲を指すインデックス値も空にします。
   */
  deselectSelectionRange = () => {
    if (typeof this.selectionRangeStartRowIndex === "undefined") {
      return;
    }
    let targetRowIndex = this.selectionRangeStartRowIndex;
    let targetColumnIndex = this.selectionRangeStartColumnIndex;
    while (true) {
      this.characters[targetRowIndex][targetColumnIndex].classList.remove("tom-editor__text-area__character--select");
      targetColumnIndex += 1;
      if (typeof this.characters[targetRowIndex][targetColumnIndex] === "undefined") {
        targetRowIndex += 1;
        targetColumnIndex = 0;
      }
      if (targetRowIndex > this.selectionRangeEndRowIndex) {
        break;
      }
      if (targetRowIndex === this.selectionRangeEndRowIndex) {
        if (targetColumnIndex > this.selectionRangeEndColumnIndex) {
          break;
        }
      }
      this.characters[targetRowIndex][targetColumnIndex].classList.remove("tom-editor__text-area__character--select");
    }
    this.selectionRangeStartRowIndex = undefined;
    this.selectionRangeStartColumnIndex = undefined;
    this.selectionRangeEndRowIndex = undefined;
    this.selectionRangeEndColumnIndex = undefined;
    return;
  };

  /**
   * フォーカスしている文字を返します。
   * @returns {Element} フォーカスしている文字です。
   */
  getFocusedCharacter = () => {
    return this.characters[this.focusedRowIndex][this.focusedColumnIndex];
  };

  /**
   * フォーカスしている行を返します。
   * @returns {Element} フォーカスしている文字です。
   */
  getFocusedTextLine = () => {
    return this.textLines[this.focusedRowIndex];
  };

  /**
   * フォーカス中の文字の1つ次の文字を返します。
   * 存在しない場合はnullを返します。
   * @returns {null|Element} フォーカスしている文字の1つ次の文字です。
   */
  getNextFocusedCharacter = () => {
    if (this.isEndOfText(this.focusedRowIndex, this.focusedColumnIndex)) {
      return null;
    }
    if (this.focusedColumnIndex === this.characters[this.focusedRowIndex].length - 1) {
      return this.characters[this.focusedRowIndex + 1][0];
    }
    return this.characters[this.focusedRowIndex][this.focusedColumnIndex + 1];
  };

  /**
   * フォーカス中の文字の1つ前の文字を返します。
   * 存在しない場合はnullを返します。
   * @returns {null|Element} フォーカスしている文字の1つ前の文字です。
   */
  getPreviousFocusedCharacter = () => {
    if (this.isBeginningOfText(this.focusedRowIndex, this.focusedColumnIndex)) {
      return null;
    }
    if (this.focusedColumnIndex === 0) {
      return this.characters[this.focusedRowIndex - 1][this.characters[this.focusedRowIndex - 1].length - 1];
    }
    return this.characters[this.focusedRowIndex][this.focusedColumnIndex - 1];
  };

  /**
   * Element.addEventListenerのコールバック引数に渡されたイベント情報からキャレットを配置すべき文字を特定します。
   * @param {Object} event 判定材料となるイベント情報です。
   */
  identifyCharacterForPlacingCaret = (event) => {

    // 行群よりも下部の空間をクリックしたときは最末尾の文字を配置対象とします。
    if (event.target === this.root || event.target === this.textLinesWrapper || event.target === this.negativeSpace) {
      this.focusedRowIndex = this.characters.length - 1;
      this.focusedColumnIndex = this.characters[this.focusedRowIndex].length - 1;
      return;
    }

    // HTMLDivElementの場合は行であると見なして一致する行を探します。
    // 一致する行が見つかったら、その行の末尾の文字を配置対象とします。
    if (event.target instanceof HTMLDivElement) {
      if (event.path[1] === this.textLinesWrapper) {
        for (let i = 0; i < this.textLines.length; i += 1) {
          if (event.target === this.textLines[i]) {
            this.focusedRowIndex = i;
            this.focusedColumnIndex = this.characters[this.focusedRowIndex].length - 1;
            return;
          }
        }
        throw new Error("キャレットの配置対象となる行が見つかりません。");
      }
      if (event.path[1] === this.negativeSpaceWrapper) {
        for (let i = 0; i < this.dummyTextLines.length; i += 1) {
          if (event.target === this.dummyTextLines[i]) {
            this.focusedRowIndex = i;
            this.focusedColumnIndex = this.characters[this.focusedRowIndex].length - 1;
            return;
          }
        }
        throw new Error("キャレットの配置対象となる行が見つかりません。");
      }
      throw new Error("キャレットの配置対象となる行が見つかりません。");
    }

    // HTMLSpanElementの場合は文字であると見なして一致する文字を探します。
    // といっても1文字ずつ突合させていては処理が重くなるため、まずは一致する行を見つけることにします。
    if (event.target instanceof HTMLSpanElement) {
      for (let i = 0; i < this.textLines.length; i += 1) {
        if (event.path[1] === this.textLines[i]) {
          this.focusedRowIndex = i;
          for (let j = 0; j < this.characters[this.focusedRowIndex].length; j += 1) {
            if (event.target === this.characters[this.focusedRowIndex][j]) {
              this.focusedColumnIndex = j;
              return;
            }
          }
          throw new Error("キャレットの配置対象となる文字が見つかりません。");
        }
      }
      throw new Error("キャレットの配置対象となる行が見つかりません。");
    }
  };

  /**
   * 余白領域を包むHTML要素を初期化します。
   */
  initializeNegativeSpaceWrapper = () => {
    this.negativeSpaceWrapper = document.createElement("div");
    this.root.appendChild(this.negativeSpaceWrapper);

    // ダミー行の1行目を追加します。
    this.dummyTextLines[0] = this.createDummyTextLine();
    this.negativeSpaceWrapper.appendChild(this.dummyTextLines[0]);

    // 余白を挿入します。
    this.negativeSpace = document.createElement("div");
    this.negativeSpace.classList.add("tom-editor__text-area__negative-space");
    this.resetNegativeSpaceHeight();
    this.negativeSpaceWrapper.appendChild(this.negativeSpace);
  };

  /**
   * 行を表すHTML要素群を包むHTML要素を初期化します。
   */
  initializeTextLinesWrapper = () => {
    this.textLinesWrapper = document.createElement("div");
    this.textLinesWrapper.classList.add("tom-editor__text-area__text-lines-wrapper");
    this.root.appendChild(this.textLinesWrapper);
    this.textLines[0] = this.createTextLine();
    this.characters.push([]);
    this.textLinesWrapper.appendChild(this.textLines[0]);
    const EOL = this.createEOL();
    this.characters[0].push(EOL);
    this.textLines[0].appendChild(EOL);
  };

  /**
   * 引数で指定されたインデックス値が指す文字が文頭（行頭ではない）ならばtrueを返します。
   * @param {number} targetRowIndex 検査対象となる行を指すインデックス値です。
   * @param {number} targetColumnIndex 検査対象となる列を指すインデックス値です。
   * @returns {boolean} 文頭ならばtrueを返します。
   */
  isBeginningOfText = (targetRowIndex, targetColumnIndex) => {
    if (targetRowIndex === 0 && targetColumnIndex === 0) {
      return true;
    }
    return false;
  };

  /**
   * 引数で指定されたインデックス値が指す文字が文末（行末ではない）ならばtrueを返します。
   * @param {number} targetRowIndex 検査対象となる行を指すインデックス値です。
   * @param {number} targetColumnIndex 検査対象となる列を指すインデックス値です。
   * @returns {boolean} 文頭ならばtrueを返します。
   */
  isEndOfText = (targetRowIndex, targetColumnIndex) => {
    if (targetRowIndex === this.characters.length - 1 && targetColumnIndex === this.characters[this.focusedRowIndex].length - 1) {
      return true;
    }
    return false;
  };

  /**
   * 引数で指定された文字を削除します。
   * @param {string} option 挙動を制御する値です。
   */
  removeCharacter = (option) => {
    if (option === "Backspace") {
      if (!(this.duringSelectionRange) && typeof this.selectionRangeStartRowIndex !== "undefined") {
        this.removeCharactersInSelectionRange();
        return;
      }
      this.removeCharacterByBackspace();
      return;
    }
    if (option === "Delete") {
      if (!(this.duringSelectionRange) && typeof this.selectionRangeStartRowIndex !== "undefined") {
        this.removeCharactersInSelectionRange();
        return;
      }
      this.removeCharacterByDelete();
      return;
    }
  };

  /**
   * Backspaceキーによる文字削除処理です。
   */
  removeCharacterByBackspace = () => {
    if (this.focusedColumnIndex === 0) {

      // フォーカス位置が文頭の場合は何もできないので処理から抜けます。
      if (this.focusedRowIndex === 0) {
        return;
      }

      // フォーカス位置が2行目以降の行頭の場合は行削除処理に任せます。
      this.removeTextLine();
      return;
    }

    // フォーカス位置が1列目でない場合は普通に削除します。
    this.focusedColumnIndex -= 1;
    this.getFocusedCharacter().remove();
    this.characters[this.focusedRowIndex].splice(this.focusedColumnIndex, 1);
    return;
  };

  /**
   * Deleteキーによる文字削除処理です。
   */
  removeCharacterByDelete = () => {
    if (this.characters[this.focusedRowIndex].length - 1 === this.focusedColumnIndex) {

      // フォーカス位置が行末で、かつ次の行が無い場合は何もできないので処理から抜けます。
      if (typeof this.textLines[this.focusedRowIndex + 1] === "undefined") {
        return;
      }

      // フォーカス位置が行末で、かつ次行が存在する場合は行削除処理に任せます。
      this.focusedRowIndex += 1;
      this.focusedColumnIndex = 0;
      this.removeTextLine();
      return;
    }

    // フォーカス位置が行末でない場合は普通に削除します。
    this.getFocusedCharacter().remove();
    this.characters[this.focusedRowIndex].splice(this.focusedColumnIndex, 1);
    return;
  };

  /**
   * 選択範囲に含まれている文字を全て削除します。
   */
  removeCharactersInSelectionRange = () => {
    if (typeof this.selectionRangeStartRowIndex === "undefined") {
      return;
    }

    // まずはフォーカス位置を選択範囲末尾にします。
    // さらに、Backspaceキーによる文字削除処理を使用する関係上、1文字だけ文末方向にフォーカスを移動させておきます。
    this.focusedRowIndex = this.selectionRangeEndRowIndex;
    this.focusedColumnIndex = this.selectionRangeEndColumnIndex;
    if (this.focusedColumnIndex === this.characters[this.focusedRowIndex].length - 1) {
      this.focusedRowIndex += 1;
      this.focusedColumnIndex = 0;
    } else {
      this.focusedColumnIndex += 1;
    }

    // Backspaceキーによる文字削除処理を使って選択範囲にある文字を全て削除します。
    while (!(this.focusedRowIndex === this.selectionRangeStartRowIndex && this.focusedColumnIndex === this.selectionRangeStartColumnIndex)) {
      this.removeCharacterByBackspace();
    }

    // 選択範囲情報を削除します。
    this.selectionRangeStartRowIndex = undefined;
    this.selectionRangeStartColumnIndex = undefined;
    this.selectionRangeEndRowIndex = undefined;
    this.selectionRangeEndColumnIndex = undefined;
  };

  /**
   * フォーカス位置を基準に行を削除します。
   * 改行に伴う文字移動処理も当メソッドで担当します。
   */
  removeTextLine = () => {

    // 改行時に新規行に持っていく文字を抽出します（行末文字も含めます）。
    const cutAndPasteCharacters = this.characters[this.focusedRowIndex].slice(0);

    // フォーカス位置を前の行の末尾に移します。
    this.focusedRowIndex -= 1;
    this.focusedColumnIndex = this.characters[this.focusedRowIndex].length - 1;

    // 当メソッド呼び出し時点でフォーカスされていた行を削除します。
    this.textLines[this.focusedRowIndex + 1].remove();
    this.textLines.splice(this.focusedRowIndex + 1, 1);
    this.characters.splice(this.focusedRowIndex + 1, 1);

    // 改行に伴う移動処理対象となる文字があるならば含めます。
    for (const character of cutAndPasteCharacters) {
      this.characters[this.focusedRowIndex].push(character);
      this.getFocusedTextLine().appendChild(character);
    }

    // このままだと1つの行に2つの行末文字が存在することになります。
    // 現在フォーカスしているのは改行先の行末文字なので、これを削除します。
    this.removeCharacterByDelete();

    // 余白内にある行も削除します。
    this.dummyTextLines[this.dummyTextLines.length - 1].remove();
    this.dummyTextLines.pop();
  };

  /**
   * フォーカス情報を更新します。
   * Shiftキーが押されている場合はフォーカスの更新に合わせて選択範囲も更新します。
   * @param {string} option 挙動を制御する値です。
   */
  resetFocusAndSelectionRange = (option) => {

    // 引数が指定されていないときはフォーカスの解除と選択範囲の解除を行います。
    if (typeof option === "undefined") {
      this.focusedRowIndex = undefined;
      this.focusedColumnIndex = undefined;
      this.deselectSelectionRange();
      return;
    }

    // Shiftキーが押されていないが範囲選択は行われている状況で矢印キーが押されたときは選択範囲の解除を行います。
    if (option.includes("Arrow") && !(this.duringSelectionRange) && typeof this.selectionRangeStartRowIndex !== "undefined") {
      this.deselectSelectionRange();
      return;
    }

    // 以下処理は矢印キーによる普通のフォーカス移動処理です。
    // Shiftキーが押されているならば選択範囲の更新処理も行います。
    if (option === "ArrowDown") {
      let numberOfArrowRight = 0;
      numberOfArrowRight += this.characters[this.focusedRowIndex].length - 1 - this.focusedColumnIndex;
      if (!(this.isEndOfText(this.focusedRowIndex, this.characters[this.focusedRowIndex].length - 1))) {
        if (typeof this.characters[this.focusedRowIndex + 1][this.focusedColumnIndex] === "undefined") {
          numberOfArrowRight += 1 + this.characters[this.focusedRowIndex + 1].length - 1;
        } else {
          numberOfArrowRight += 1 + this.focusedColumnIndex;
        }
      }
      for (let i = 0; i < numberOfArrowRight; i += 1) {
        this.resetFocusAndSelectionRangeByArrowRight();
      }
      return;
    }
    if (option === "ArrowLeft") {
      this.resetFocusAndSelectionRangeByArrowLeft();
      return;
    }
    if (option === "ArrowRight") {
      this.resetFocusAndSelectionRangeByArrowRight();
      return;
    }
    if (option === "ArrowUp") {
      let numberOfArrowLeft = 0;
      numberOfArrowLeft += this.focusedColumnIndex;
      if (!this.isBeginningOfText(this.focusedRowIndex, 0)) {
        if (typeof this.characters[this.focusedRowIndex - 1][this.focusedColumnIndex] === "undefined") {
          numberOfArrowLeft += 1;
        } else {
          numberOfArrowLeft += 1 + this.characters[this.focusedRowIndex - 1].length - 1 - this.focusedColumnIndex;
        }
      }
      for (let i = 0; i < numberOfArrowLeft; i += 1) {
        this.resetFocusAndSelectionRangeByArrowLeft();
      }
      return;
    }

    // その他キーだった場合の処理です。
    if (option === "End") {
      let numberOfArrowRight = 0;
      numberOfArrowRight += this.characters[this.focusedRowIndex].length - 1 - this.focusedColumnIndex;
      for (let i = 0; i < numberOfArrowRight; i += 1) {
        this.resetFocusAndSelectionRangeByArrowRight();
      }
      return;
    }
    if (option === "Home") {
      let numberOfArrowLeft = 0;
      numberOfArrowLeft += this.focusedColumnIndex;
      for (let i = 0; i < numberOfArrowLeft; i += 1) {
        this.resetFocusAndSelectionRangeByArrowLeft();
      }
    }
  };

  /**
   * TextArea.resetFocusAndSelectionRangeメソッドから左矢印キー用の処理を抜き出したものです。
   */
  resetFocusAndSelectionRangeByArrowLeft = () => {

    // 文頭にフォーカスしているときはできることがないので早々に処理から抜けます。
    if (this.isBeginningOfText(this.focusedRowIndex, this.focusedColumnIndex)) {
      return;
    }

    // フォーカスを1文字分、文頭方向に移動させます。
    if (this.focusedColumnIndex === 0) {
      this.focusedRowIndex -= 1;
      this.focusedColumnIndex = this.characters[this.focusedRowIndex].length - 1;
    } else {
      this.focusedColumnIndex -= 1;
    }

    // Shiftキーが押されていないならば、ここで処理から抜けます。
    // Shiftキーが押されているならば、フォーカス位置を選択範囲に含める・外す処理を追加で行います。
    if (!(this.duringSelectionRange)) {
      return;
    }

    // 選択範囲用背景色の切り替えを行います。
    this.getFocusedCharacter().classList.toggle("tom-editor__text-area__character--select");

    // 選択範囲を表すインデックス値を更新します。
    // 範囲選択中でないならば――今回新たに範囲選択が始まった場合は現在フォーカスしている位置が選択範囲の始端であり終端となります。
    // 範囲選択中ならば、先ほどの処理フォーカス位置に選択範囲用背景色が適用されたかどうかで選択範囲が広がったか狭まったかが求められます。
    if (typeof this.selectionRangeStartRowIndex === "undefined") {
      this.selectionRangeStartRowIndex = this.focusedRowIndex;
      this.selectionRangeStartColumnIndex = this.focusedColumnIndex;
      this.selectionRangeEndRowIndex = this.focusedRowIndex;
      this.selectionRangeEndColumnIndex = this.focusedColumnIndex;
      return;
    }

    // 現在フォーカスしている文字が選択範囲に含まれているかどうかで、選択範囲が広がったのか狭まったのかを求めることができます。
    if (this.getFocusedCharacter().classList.contains("tom-editor__text-area__character--select")) {

      // 以下、広がった場合の処理です。
      this.selectionRangeStartRowIndex = this.focusedRowIndex;
      this.selectionRangeStartColumnIndex = this.focusedColumnIndex;
      return;
    }

    // 以下、狭まった場合の処理です。
    if (this.isBeginningOfText(this.focusedRowIndex, this.focusedColumnIndex)) {

      // 選択範囲が狭まったにも関わらず、現在フォーカスしているのが文頭であるということは選択範囲が消失したことを意味します。
      this.selectionRangeStartRowIndex = undefined;
      this.selectionRangeStartColumnIndex = undefined;
      this.selectionRangeEndRowIndex = undefined;
      this.selectionRangeEndColumnIndex = undefined;
      return;
    }

    // 以下、文頭以外の位置にいる場合の処理です。
    if (this.getPreviousFocusedCharacter().classList.contains("tom-editor__text-area__character--select")) {

      // 範囲選択が解除された文字の1つ前の文字が選択範囲に含まれているならば選択範囲の末尾情報のみ更新します。
      this.selectionRangeEndRowIndex = this.focusedRowIndex;
      this.selectionRangeEndColumnIndex = this.focusedColumnIndex - 1;
      return;
    }

    // 範囲選択が解除された文字の1つ前の文字が選択範囲に含まれていないということは選択範囲そのものが消失したことを意味します。
    this.selectionRangeStartRowIndex = undefined;
    this.selectionRangeStartColumnIndex = undefined;
    this.selectionRangeEndRowIndex = undefined;
    this.selectionRangeEndColumnIndex = undefined;
    return;
  };

  /**
   * TextArea.resetFocusAndSelectionRangeメソッドから右矢印キー用の処理を抜き出したものです。
   */
  resetFocusAndSelectionRangeByArrowRight = () => {

    // 文末にフォーカスしているときはできることがないので早々に処理から抜けます。
    if (this.isEndOfText(this.focusedRowIndex, this.focusedColumnIndex)) {
      return;
    }

    // フォーカスを1文字分、文末方向に移動させます。
    if (this.focusedColumnIndex === this.characters[this.focusedRowIndex].length - 1) {
      this.focusedRowIndex += 1;
      this.focusedColumnIndex = 0;
    } else {
      this.focusedColumnIndex += 1;
    }

    // Shiftキーが押されていないならば、ここで処理から抜けます。
    // Shiftキーが押されているならば、フォーカス位置を選択範囲に含める・外す処理を追加で行います。
    if (!(this.duringSelectionRange)) {
      return;
    }

    // 選択範囲用背景色の切り替えを行います。
    this.getPreviousFocusedCharacter().classList.toggle("tom-editor__text-area__character--select");

    // 選択範囲を表すインデックス値を更新します。
    // 範囲選択中でないならば――今回新たに範囲選択が始まった場合は現在フォーカスしている位置の1つ前の文字が選択範囲の始端であり終端となります。
    // 範囲選択中ならば、先ほどの処理フォーカス位置に選択範囲用背景色が適用されたかどうかで選択範囲が広がったか狭まったかが求められます。
    if (typeof this.selectionRangeStartRowIndex === "undefined") {
      if (this.focusedColumnIndex === 0) {
        this.selectionRangeStartRowIndex = this.focusedRowIndex - 1;
        this.selectionRangeStartColumnIndex = this.characters[this.focusedRowIndex - 1].length - 1;
        this.selectionRangeEndRowIndex = this.focusedRowIndex - 1;
        this.selectionRangeEndColumnIndex = this.characters[this.focusedRowIndex - 1].length - 1;
        return;
      }
      this.selectionRangeStartRowIndex = this.focusedRowIndex;
      this.selectionRangeStartColumnIndex = this.focusedColumnIndex - 1;
      this.selectionRangeEndRowIndex = this.focusedRowIndex;
      this.selectionRangeEndColumnIndex = this.focusedColumnIndex - 1;
      return;
    }
    if (this.getPreviousFocusedCharacter().classList.contains("tom-editor__text-area__character--select")) {

      // 以下、広がった場合の処理です。
      if (this.focusedColumnIndex === 0) {
        this.selectionRangeEndRowIndex = this.focusedRowIndex - 1;
        this.selectionRangeEndColumnIndex = this.characters[this.focusedRowIndex - 1].length - 1;
        return;
      }
      this.selectionRangeEndRowIndex = this.focusedRowIndex;
      this.selectionRangeEndColumnIndex = this.focusedColumnIndex - 1;
      return;
    }

    // 以下、狭まった場合の処理です。
    if (this.isEndOfText(this.focusedRowIndex, this.focusedColumnIndex)) {

      // 現在フォーカスしているのが文末であるということは先ほど選択範囲から外れた文字は文末の1つ直前の文字ということになります。
      // 文末は選択範囲に入りませんので、これは選択範囲そのものが消失したことを意味します。
      this.selectionRangeStartRowIndex = undefined;
      this.selectionRangeStartColumnIndex = undefined;
      this.selectionRangeEndRowIndex = undefined;
      this.selectionRangeEndColumnIndex = undefined;
      return;
    }
    if (this.getFocusedCharacter().classList.contains("tom-editor__text-area__character--select")) {

      // 現在フォーカスしている文字が選択範囲に含まれているならば選択範囲の先頭情報のみ更新します。
      this.selectionRangeStartRowIndex = this.focusedRowIndex;
      this.selectionRangeStartColumnIndex = this.focusedColumnIndex;
      return;
    }

    // 現在フォーカスしている文字が選択範囲に含まれていないということは選択範囲そのものが消失したことを意味します。
    this.selectionRangeStartRowIndex = undefined;
    this.selectionRangeStartColumnIndex = undefined;
    this.selectionRangeEndRowIndex = undefined;
    this.selectionRangeEndColumnIndex = undefined;
    return;
  };

  /**
   * 余白の縦幅を変更します。
   */
  resetNegativeSpaceHeight = () => {
    const areaHeight = this.root.getBoundingClientRect().height
    const textLineHeight = parseFloat(getComputedStyle(this.root).lineHeight);
    this.negativeSpace.style.height = `${areaHeight - parseFloat(getComputedStyle(this.root).paddingTop) - textLineHeight}px`;
  };

  /**
   * 引数で指定された量だけ横方向にスクロールします。
   * @param {number} scrollSize スクロールする量です。
   */
  scrollHorizontally = (scrollSize) => {
    this.root.scrollLeft += scrollSize;
  };

  /**
   * 引数で指定された量だけ縦方向にスクロールします。
   * @param {number} scrollSize スクロールする量です。
   */
  scrollVertically = (scrollSize) => {
    this.root.scrollTop += scrollSize;
  };

  /**
   * マウスのドラッグによる選択範囲の更新処理です。
   * @param {object} event EventTarget.addEventListenerメソッドのイベント情報をまとめたオブジェクトです。
   */
  updateSelectionRangeByMouseDragging = (event) => {

    // まずはドラッグの移動先を求めます。
    // このとき、あらかじめ現在のフォーカス位置を残しておき戻せるようにしておきます。
    const temporarilyStoredFocusedRowIndex = this.focusedRowIndex;
    const temporarilyStoredFocusedColumnIndex = this.focusedColumnIndex;
    this.identifyCharacterForPlacingCaret(event);
    const goalFocusedRowIndex = this.focusedRowIndex;
    const goalFocusedColumnIndex = this.focusedColumnIndex;
    this.focusedRowIndex = temporarilyStoredFocusedRowIndex;
    this.focusedColumnIndex = temporarilyStoredFocusedColumnIndex;

    // 移動先となる文字まで移動します。
    // まずは行移動で一気に距離を詰めます。
    if (this.focusedRowIndex < goalFocusedRowIndex) {
      for (let i = 0; i < goalFocusedRowIndex - this.focusedRowIndex; i += 1) {
        this.resetFocusAndSelectionRange("ArrowDown");
      }
    } else if (this.focusedRowIndex > goalFocusedRowIndex) {
      for (let i = 0; i < this.focusedRowIndex - goalFocusedRowIndex; i += 1) {
        this.resetFocusAndSelectionRange("ArrowUp");
      }
    }

    // 移動先の文字と同じ行になったので列を合わせます。
    if (this.focusedColumnIndex < goalFocusedColumnIndex) {
      for (let i = 0; goalFocusedColumnIndex - this.focusedColumnIndex; i += 1) {
        this.resetFocusAndSelectionRangeByArrowRight();
      }
      return;
    }
    if (this.focusedColumnIndex > goalFocusedColumnIndex) {
      for (let i = 0; this.focusedColumnIndex - goalFocusedColumnIndex; i += 1) {
        this.resetFocusAndSelectionRangeByArrowLeft();
      }
      return;
    }
  };
};

export {
  TextArea
}
