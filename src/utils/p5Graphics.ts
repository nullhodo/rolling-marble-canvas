import type p5 from "p5";

/**
 * createGraphics で作ったバッファを破棄する。
 * p5 1.x の Graphics.remove() は内部で undefined を参照して例外を投げるため、
 * 失敗時は DOM からキャンバスを外すだけにする。
 */
export function disposeGraphics(graphics: p5.Graphics): void {
  try {
    graphics.remove();
  } catch {
    graphics.elt?.parentNode?.removeChild(graphics.elt);
  }
}
