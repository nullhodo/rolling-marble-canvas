import type { TrayBounds } from "../../types/simulation";

const TRAY_BORDER_THICKNESS = 26;
const TRAY_DEPTH = 32;
const MAX_TRAY_WIDTH = 1000;
const MAX_TRAY_HEIGHT = 700;
const CANVAS_FILL_RATIO = 0.72;
const MIN_TRAY_SIZE = 120;

/** キャンバスサイズから用紙サイズを決める。木枠込みの外形がキャンバスに収まる */
export function calculateTrayBounds(
  canvasWidth: number,
  canvasHeight: number,
): TrayBounds {
  return {
    width: Math.max(
      MIN_TRAY_SIZE,
      Math.min(
        MAX_TRAY_WIDTH,
        Math.round(canvasWidth * CANVAS_FILL_RATIO),
      ),
    ),
    height: Math.max(
      MIN_TRAY_SIZE,
      Math.min(
        MAX_TRAY_HEIGHT,
        Math.round(canvasHeight * CANVAS_FILL_RATIO),
      ),
    ),
    depth: TRAY_DEPTH,
    borderThickness: TRAY_BORDER_THICKNESS,
  };
}
