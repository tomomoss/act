/**
 * オープニングアニメーションを描画する<canvas>タグを生成します。
 * @returns {HTMLCanvasElement} オープニングアニメーションを描画する<canvas>タグです。
 */
const createOpeningAnimationLayer = () => {
  const openingAnimationLayer = document.createElement("canvas");
  openingAnimationLayer.classList.add("opening-animation-layer");
  openingAnimationLayer.height = innerHeight;
  openingAnimationLayer.width = innerWidth;

  // オープニングアニメーションを描画する<canvas>タグはResizeObserverオブジェクトで寸法の変更を監視します。
  // 寸法が変更されるたびにHTMLCanvasElement.prototype.heightプロパティとHTMLCanvasElement.prototype.heightプロパティを更新します。
  // まぁ、アニメーション中に寸法が変更されるという状況はそう多くないでしょうが念のための措置です。
  new ResizeObserver(() => {
    openingAnimationLayer.height = innerHeight;
    openingAnimationLayer.width = innerWidth;
  }).observe(openingAnimationLayer);

  return openingAnimationLayer;
};

/**
 * オープニングアニメーションを描画します。
 */
const drawOpeningAnimation = () => {
  // 描画するアニメーションの寸法や内容はビューポートと<canvas>タグの寸法に影響を受けます。
  // 実際に描画を始めるまえに、それら描画に必要な値を求めておきます。
  const scale = getOpeningAnimationScale();
  const excessWidth = getExcessWidth();

  // 次のフレームを描画するために現在描画している内容を全て削除します。
  _context2D_.clearRect(0, 0, _canvas_.width, _canvas_.height);

  // 第2段階をさらに細かく分けて実行していきます。
  playOpeningAnimationPhase2Part1(scale, excessWidth);
  playOpeningAnimationPhase2Part2(scale, excessWidth);
  playOpeningAnimationPhase2Part3(scale, excessWidth);

  // 各処理が全て完了したときは当関数のループを閉じます。
  if (_progressOfPhase2_.part3 > 1) {
    const delay = 750;
    const duration = 750;
    _canvas_.animate(
      [
        {
          opacity: 1
        },
        {
          opacity: 0
        }
      ],
      {
        delay: 750,
        duration: 750,
        fill: "forwards"
      }
    );
    setTimeout(() => {
      _canvas_.remove();
    }, delay + duration);
    return;
  }

  // 完了していないならばrequestAnimationFrameメソッドで繰りかえし描画します。
  requestAnimationFrame(drawOpeningAnimation);
};

/**
 * <canvas>タグの横幅のうち、オープニングアニメーションの最低横幅値を超過したぶんを取得します。
 * @returns {number} 超過した横幅（ピクセル単位）です。
 */
const getExcessWidth = () => {
  if (_canvas_.width > _minWidthOfOpeningAnimation_) {
    return _canvas_.width - _minWidthOfOpeningAnimation_;
  }
  return 0;
};

/**
 * オープニングアニメーションの比率を取得します。
 * 最大値は「1（100%）」であり、オープニングアニメーションの最低横幅値と<canvas>タグの横幅に応じて小さなったりします。
 * @returns {number} オープニングアニメーションの比率です。
 */
const getOpeningAnimationScale = () => {
  if (_canvas_.width < _minWidthOfOpeningAnimation_) {
    return _canvas_.width / _minWidthOfOpeningAnimation_;
  }
  return 1;
};

/**
 * ACTのオープニングアニメーションを再生します。
 */
const playOpeningAnimation = () => {
  document.body.appendChild(_canvas_);

  // まずは生成されたばかりのまっさらな<canvas>タグの背景に薄い青色を着色します。
  // このとき、いきなり色を変えるとどうしても安っぽくなるためアニメーションで変化させます。
  // また、着色が完了するまでは後続の処理が走らないようにもします。
  const delay = 250;
  const duration = 750;
  _canvas_.animate(
    [
      {
        background: "rgb(255, 255, 255)"
      },
      {
        background: "var(--pale-theme-color)"
      }
    ],
    {
      delay: delay,
      duration: duration,
      fill: "forwards"
    }
  );
  setTimeout(() => {
    requestAnimationFrame(drawOpeningAnimation);
  }, delay + duration);
};

/**
 * オープニングアニメーションの第2段階の第1段階です。
 * ACTのロゴのうち、一筆書きで書くことができるところを描画します。
 * @param {number} scale オープニングアニメーションの比率です。
 * @param {number} excessWidth 超過した横幅です。
 */
const playOpeningAnimationPhase2Part1 = (scale, excessWidth) => {
  _context2D_.globalCompositeOperation = "source-over";
  _context2D_.lineCap = "round";
  _context2D_.lineJoin = "round";
  _context2D_.lineWidth = 2 * scale;
  _context2D_.shadowBlur = 0;
  _context2D_.strokeStyle = "rgb(0, 51, 102)";
  _context2D_.beginPath();
  _context2D_.moveTo(-10, _canvas_.height / 100 * 50);
  _context2D_.lineTo((320 + excessWidth / 2) * scale, _canvas_.height / 100 * 50);
  _context2D_.lineTo((360 + excessWidth / 2) * scale, _canvas_.height / 100 * 50 - 100 * scale);
  _context2D_.lineTo((400 + excessWidth / 2) * scale, _canvas_.height / 100 * 50);
  _context2D_.lineTo((560 + excessWidth / 2) * scale, _canvas_.height / 100 * 50 - 100 * scale);
  _context2D_.lineTo(_canvas_.width + 10, _canvas_.height / 100 * 50 - 100 * scale);
  _context2D_.stroke();
  if (_progressOfPhase2_.part1 < 0.33) {
    _progressOfPhase2_.part1 *= 1.07;
  } else if (_progressOfPhase2_.part1 < 0.66) {
    _progressOfPhase2_.part1 *= 1.05;
  } else {
    _progressOfPhase2_.part1 *= 1.02;
  }
  _context2D_.fillStyle = "rgb(0, 51, 102)";
  _context2D_.globalCompositeOperation = "source-in";
  _context2D_.beginPath();
  _context2D_.fillRect(0, 0, _canvas_.width * _progressOfPhase2_.part1, _canvas_.height);
};

/**
 * オープニングアニメーションの第2段階の第2段階です。
 * ACTのロゴのうち、一筆書きで書くことができるところを描画します。
 * @param {number} scale オープニングアニメーションの比率です。
 * @param {number} excessWidth 超過した横幅です。
 */
const playOpeningAnimationPhase2Part2 = (scale, excessWidth) => {
  if (!(_progressOfPhase2_.part1 > 1.5)) {
    return;
  }
  _progressOfPhase2_.part2 *= 1.1;
  if (_progressOfPhase2_.part2 > 1) {
    _progressOfPhase2_.part2 = 1.001;
  }
  _context2D_.globalCompositeOperation = "source-over";

  // 「A」の横線を描画します。
  _context2D_.beginPath();
  _context2D_.moveTo((340 + excessWidth / 2) * scale, _canvas_.height / 100 * 50 - 25 * scale);
  _context2D_.lineTo((340 + excessWidth / 2) * scale + (40 * scale) * _progressOfPhase2_.part2, _canvas_.height / 100 * 50 - 25 * scale);
  _context2D_.stroke();

  // 「T」の縦線を描画します。
  _context2D_.beginPath();
  _context2D_.moveTo((600 + excessWidth / 2) * scale, _canvas_.height / 100 * 50 - 90 * scale);
  _context2D_.lineTo((600 + excessWidth / 2) * scale, _canvas_.height / 100 * 50 - 90 * scale * (1 - _progressOfPhase2_.part2));
  _context2D_.stroke();
};

/**
 * オープニングアニメーションの第2段階の第3段階です。
 * ACTのロゴのうち、一筆書きで書くことができるところを描画します。
 * @param {number} scale オープニングアニメーションの比率です。
 * @param {number} excessWidth 超過した横幅です。
 */
const playOpeningAnimationPhase2Part3 = (scale, excessWidth) => {
  if (!(_progressOfPhase2_.part1 > 5)) {
    return;
  }
  _progressOfPhase2_.part3 += 0.008;

  // 「C」にかけるグラデーションです。
  const gradient = _context2D_.createLinearGradient(
    (430 + excessWidth / 2) * scale,
    innerHeight / 100 * 50 - 100 * scale,
    (530 + excessWidth / 2) * scale,
    innerHeight / 100 * 50
  );
  gradient.addColorStop(0, "rgb(255, 153, 0)");
  gradient.addColorStop(0.5, "rgb(255, 204, 0)");
  gradient.addColorStop(1, "rgb(204, 102, 0)");
  _context2D_.globalCompositeOperation = "source-over";
  _context2D_.lineWidth = 5 * scale;
  _context2D_.shadowColor = "rgb(255, 204, 0)";
  _context2D_.shadowBlur = 7 * scale;
  _context2D_.strokeStyle = gradient;

  // 以下、各部位の描画進捗率を表す値です。
  let cTopFirstHalf;
  if (_progressOfPhase2_.part3 < 0.274) {
    cTopFirstHalf = _progressOfPhase2_.part3 / 0.274;
  } else {
    cTopFirstHalf = 1;
  }
  let cTopCenterBar;
  let cTopSecondHalf;
  if (_progressOfPhase2_.part3 > 0.274) {
    if (_progressOfPhase2_.part3 < 0.5) {
      cTopCenterBar = (_progressOfPhase2_.part3 - 0.274) / 0.226;
    } else {
      cTopCenterBar = 1;
    }
    if (_progressOfPhase2_.part3 < 0.548) {
      cTopSecondHalf = (_progressOfPhase2_.part3 - 0.274) / 0.274;
    } else {
      cTopSecondHalf = 1;
    }
  }
  let cBottom;
  if (_progressOfPhase2_.part3 > 0.645) {
    if (_progressOfPhase2_.part3 < 1) {
      cBottom = (_progressOfPhase2_.part3 - 0.645) / 0.355;
    } else {
      cBottom = 1;
    }
  }
  let cBottomBar1;
  if (_progressOfPhase2_.part3 > 0.645) {
    if (_progressOfPhase2_.part3 < 0.85) {
      cBottomBar1 = (_progressOfPhase2_.part3 - 0.645) / 0.205;
    } else {
      cBottomBar1 = 1;
    }
  }
  let cBottomBar2;
  if (_progressOfPhase2_.part3 > 0.85) {
    if (_progressOfPhase2_.part3 < 1) {
      cBottomBar2 = (_progressOfPhase2_.part3 - 0.85) / 0.15;
    } else {
      cBottomBar2 = 1;
    }
  }

  // 最初は「C」の上半分を描画します。
  _context2D_.beginPath();
  _context2D_.arc(
    (480 + excessWidth / 2) * scale,
    innerHeight / 100 * 50 - 50 * scale,
    50 * scale,
    315 / 180 * Math.PI,
    (238.5 + 76.5 * (1 - cTopFirstHalf)) / 180 * Math.PI,
    true
  );
  _context2D_.stroke();

  // 「C」の中央線です。
  if (typeof cTopCenterBar !== "undefined") {
    _context2D_.beginPath();
    _context2D_.moveTo(
      (((480 + excessWidth / 2) * scale) - 26.1 * scale),
      ((innerHeight / 100 * 50 - 50 * scale) - 42.3 * scale)
    );
    _context2D_.lineTo(
      ((480 + excessWidth / 2) * scale) - (6 + 20.1 * (1 - cTopCenterBar)) * scale,
      (innerHeight / 100 * 50 - 50 * scale) - (10 + 32.3 * (1 - cTopCenterBar)) * scale
    );
    _context2D_.stroke();
  }

  // 「C」の後半部分です。
  if (typeof cTopSecondHalf !== "undefined") {
    _context2D_.beginPath();
    _context2D_.arc(
      (480 + excessWidth / 2) * scale,
      innerHeight / 100 * 50 - 50 * scale,
      50 * scale,
      238.5 / 180 * Math.PI,
      (162 + 76.5 * (1 - cTopSecondHalf)) / 180 * Math.PI,
      true
    );
    _context2D_.stroke();
  }

  // 次に「C」の下半分を描画します。
  if (typeof cBottom !== "undefined") {
    _context2D_.beginPath();
    _context2D_.arc(
      (480 + excessWidth / 2) * scale,
      innerHeight / 100 * 50 - 50 * scale,
      50 * scale,
      135 / 180 * Math.PI,
      (36 + 99 * (1 - cBottom)) / 180 * Math.PI,
      true
    );
    _context2D_.stroke();
  }
  if (typeof cBottomBar1 !== "undefined") {
    _context2D_.beginPath();
    _context2D_.moveTo(
      ((480 + excessWidth / 2) * scale) - 35.4 * scale,
      (innerHeight / 100 * 50 - 50 * scale) + 35.4 * scale
    );
    _context2D_.lineTo(
      ((480 + excessWidth / 2) * scale) + (-35.4 + 41.4 * cBottomBar1) * scale,
      (innerHeight / 100 * 50 - 50 * scale) + (35.4 - 25.4 * cBottomBar1) * scale
    );
    _context2D_.stroke();
  }
  if (typeof cBottomBar2 !== "undefined") {
    _context2D_.beginPath();
    _context2D_.lineTo(
      ((480 + excessWidth / 2) * scale) + 6 * scale,
      (innerHeight / 100 * 50 - 50 * scale) + 10 * scale
    );
    _context2D_.lineTo(
      ((480 + excessWidth / 2) * scale) + (6 + 20 * cBottomBar2) * scale,
      (innerHeight / 100 * 50 - 50 * scale) + (10 + 32 * cBottomBar2) * scale
    );
    _context2D_.stroke();
  }
};

// オープニングアニメーションを描画する<canvas>タグです。
const _canvas_ = createOpeningAnimationLayer();

// 上記<canvas>タグの二次元描画用コンテキストです。
const _context2D_ = _canvas_.getContext("2d");

// オープニングアニメーションを縮小せずに描画する最低限の横幅です（ピクセル単位）。
// <canvas>タグの横幅が当変数に格納された横幅を下回ったときはオープニングアニメーションの縦横比を維持したまま、
// オープニングアニメーションの寸法を縮小します。
// 逆に、上回ったときはビューポート左端から右端に向けて走る線がそのぶんだけ伸びるようになっています。
const _minWidthOfOpeningAnimation_ = 960;

// オープニングアニメーション第2段階の描画進捗率をまとめたオブジェクトです。
const _progressOfPhase2_ = {
  part1: 0.001,
  part2: 0.075,
  part3: 0
};

export {
  playOpeningAnimation
}
