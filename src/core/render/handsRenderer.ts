import type p5 from "p5";
import type { TrayBounds } from "../../types/simulation";

const HAND_SIDES = [-1, 1] as const;

type Rgb = readonly [number, number, number];

const SKIN: Rgb = [226, 176, 148];
const SLEEVE: Rgb = [58, 68, 88];

/** 位置・向き・半径を指定して置く楕円体。手指や腕のパーツ共通 */
function blob(
  p: p5,
  color: Rgb,
  position: readonly [number, number, number],
  radii: readonly [number, number, number],
  rotation: readonly [number, number, number] = [0, 0, 0],
): void {
  p.push();
  p.translate(...position);
  p.rotateX(rotation[0]);
  p.rotateY(rotation[1]);
  p.rotateZ(rotation[2]);
  p.fill(...color);
  p.ellipsoid(radii[0], radii[1], radii[2], 14, 10);
  p.pop();
}

/** 3D: トレイの左右を支える手。袖・手のひら・親指を離して浮かせた、抽象的な造形 */
export function drawHands3D(p: p5, bounds: TrayBounds): void {
  const wallX = bounds.width * 0.5 + bounds.borderThickness;
  const border = bounds.borderThickness;
  const depth = bounds.depth;
  const topZ = depth * 0.7;
  const midZ = (topZ - depth) * 0.5;

  p.noStroke();

  for (const side of HAND_SIDES) {
    p.push();
    p.translate(wallX * side, 0, 0);

    // 袖: 手から離れて浮かぶ
    blob(
      p,
      SLEEVE,
      [side * 76, 140, midZ - 6],
      [32, 52, 28],
      [0, 0, side * 0.35],
    );

    // 手のひら: 外壁に当たる
    blob(p, SKIN, [side * 30, 48, midZ], [19, 32, 30]);

    // 親指: 木枠の上面を押さえる、独立した小さな粒
    blob(
      p,
      SKIN,
      [-side * border * 0.35, 20, topZ + 6],
      [border * 0.5, 8, 6],
    );

    p.pop();
  }
}
