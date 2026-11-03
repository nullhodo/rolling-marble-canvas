import type p5 from "p5";
import type { TrayBounds } from "../../types/simulation";

const HAND_SIDES = [-1, 1] as const;

type Rgb = readonly [number, number, number];

const SKIN: Rgb = [226, 176, 148];
const SKIN_SHADE: Rgb = [196, 146, 120];
const NAIL: Rgb = [238, 196, 180];
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

/** 3D: トレイの左右を支える手。親指は木枠の上、4本の指は木枠の下に回る */
export function drawHands3D(p: p5, bounds: TrayBounds): void {
  const halfWidth = bounds.width * 0.5;
  const border = bounds.borderThickness;
  const depth = bounds.depth;
  const rimZ = depth * 0.35;

  p.noStroke();

  for (const side of HAND_SIDES) {
    p.push();
    p.translate((halfWidth + border * 0.5) * side, 0, 0);

    // 袖と前腕: 手前 (+Y) 側へ伸びる
    blob(
      p,
      SLEEVE,
      [side * 70, 128, rimZ - 26],
      [30, 46, 24],
      [0, 0, side * 0.12],
    );
    blob(
      p,
      SKIN_SHADE,
      [side * 46, 78, rimZ - 20],
      [20, 40, 16],
      [0, 0, side * 0.1],
    );

    // 手の甲と手のひら
    blob(
      p,
      SKIN_SHADE,
      [side * 22, 34, rimZ - 12],
      [22, 30, 15],
      [0, 0, side * 0.08],
    );

    // 親指: 木枠の上面を押さえる
    blob(
      p,
      SKIN,
      [-side * 2, 14, rimZ + depth * 0.2],
      [8, 15, 7],
      [0, 0, -side * 0.45],
    );
    blob(
      p,
      SKIN,
      [-side * 8, -2, rimZ + depth * 0.22],
      [7, 11, 6],
      [0, 0, -side * 0.7],
    );
    blob(
      p,
      NAIL,
      [-side * 9, -7, rimZ + depth * 0.22 + 4],
      [4.5, 5.5, 2.5],
      [0, 0, -side * 0.7],
    );

    // 木枠の下へ回り込む4本の指
    const fingerYs = [-14, 0, 14, 28];
    fingerYs.forEach((fingerY, index) => {
      const length = 11 - Math.abs(index - 1.2) * 0.8;
      blob(
        p,
        SKIN_SHADE,
        [-side * 4, fingerY, rimZ - depth * 0.3],
        [13, 6.2, 6],
        [0, 0, side * 0.12],
      );
      blob(
        p,
        SKIN,
        [-side * 14, fingerY, rimZ - depth * 0.15],
        [length * 0.7, 5.4, 5],
      );
    });

    p.pop();
  }
}

/** 2D 俯瞰: 木枠の左右を押さえる手 */
export function drawHands2D(p: p5, bounds: TrayBounds): void {
  const halfWidth = bounds.width * 0.5;
  const border = bounds.borderThickness;

  for (const side of HAND_SIDES) {
    p.push();
    p.translate((halfWidth + border) * side, 20, 2);
    p.noStroke();

    p.fill("#2D3748");
    p.rect(side > 0 ? 30 : -85, 20, 55, 60, 8);

    p.fill("#C3947A");
    p.rect(side > 0 ? 5 : -55, 0, 50, 48, 12);

    p.fill("#E4B69A");
    p.ellipse(side * -8, -10, 24, 34);

    p.fill("#F2CCB8");
    p.ellipse(side * -10, -18, 12, 14);

    p.fill("#C3947A");
    p.ellipse(side * 2, -26, 12, 16);
    p.ellipse(side * 3, 14, 12, 16);
    p.ellipse(side * 4, 32, 11, 15);

    p.pop();
  }
}
