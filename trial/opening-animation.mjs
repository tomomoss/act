/**
 * オープニングアニメーションを描画する<canvas>タグを生成します。
 * @returns {HTMLCanvasElement} オープニングアニメーションを描画する<canvas>タグです。
 */
const createOpeningAnimationLayer = () => {
  const openingAnimationLayer = document.createElement("canvas");
  openingAnimationLayer.classList.add("opening-animation-layer");
  openingAnimationLayer.height = innerHeight;
  openingAnimationLayer.width = innerWidth;
  return openingAnimationLayer;
};

/**
 * ACTのオープニングアニメーションを再生します。
 */
const playOpeningAnimation = () => {};

export {
  playOpeningAnimation
}
