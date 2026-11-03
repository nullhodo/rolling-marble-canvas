import type { TrayBounds } from "../../types/simulation";
import type { Marble } from "./marble";

const EDGE_MARGIN_RADII = 1.5;
const EDGE_SPEED_LIMIT = 0.8;

type EscapeDirection = { x: number; y: number };

/**
 * 壁際に溜まったビー玉が全体の ratio 以上なら、溜まっている側から中央へ向かう単位ベクトルを返す。
 * 壁際は壁から半径の約1.5倍以内で、遅い玉だけ数える (跳ね返った直後の玉を除く)
 */
export function detectEdgeCluster(
  marbles: readonly Marble[],
  bounds: Pick<TrayBounds, "width" | "height">,
  ratio: number,
): EscapeDirection | null {
  if (ratio <= 0 || marbles.length === 0) return null;

  let count = 0;
  let sumX = 0;
  let sumY = 0;
  for (const marble of marbles) {
    const margin = marble.radius * EDGE_MARGIN_RADII;
    const nearWall =
      marble.x < margin ||
      marble.x > bounds.width - margin ||
      marble.y < margin ||
      marble.y > bounds.height - margin;
    if (!nearWall || Math.hypot(marble.vx, marble.vy) > EDGE_SPEED_LIMIT) {
      continue;
    }
    count++;
    sumX += marble.x - bounds.width * 0.5;
    sumY += marble.y - bounds.height * 0.5;
  }
  if (count < Math.max(2, Math.ceil(marbles.length * ratio))) return null;

  const length = Math.hypot(sumX, sumY);
  if (length < 1e-6) return null;
  return { x: -sumX / length, y: -sumY / length };
}
