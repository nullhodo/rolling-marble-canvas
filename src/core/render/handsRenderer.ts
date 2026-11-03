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

/** 3D: トレイの左右を支える手。木枠の外壁に手のひらを当て、親指は上面、4本の指は底面へ回る */
export function drawHands3D(p: p5, bounds: TrayBounds): void {
  const wallX = bounds.width * 0.5 + bounds.borderThickness;
  const border = bounds.borderThickness;
  const depth = bounds.depth;
  const topZ = depth * 0.7;
  const bottomZ = -depth;
  const midZ = (topZ + bottomZ) * 0.5;

  p.noStroke();

  for (const side of HAND_SIDES) {
    p.push();
    p.translate(wallX * side, 0, 0);

    // 袖と前腕: 外壁から離れつつ手前 (+Y) へ伸びる
    blob(
      p,
      SLEEVE,
      [side * 70, 130, midZ - 4],
      [28, 44, 24],
      [0, 0, side * 0.3],
    );
    blob(
      p,
      SKIN_SHADE,
      [side * 44, 84, midZ - 2],
      [18, 38, 16],
      [0, 0, side * 0.3],
    );

    // 手首: 手のひらと前腕をつなぐ
    blob(
      p,
      SKIN_SHADE,
      [side * 26, 60, midZ - 1],
      [15, 26, 15],
      [0, 0, side * 0.3],
    );
    blob(
      p,
      SLEEVE,
      [side * 56, 106, midZ - 3],
      [26, 30, 22],
      [0, 0, side * 0.3],
    );

    // 手のひら: 外壁に接する
    blob(p, SKIN_SHADE, [side * 11, 38, midZ], [9, 28, 26]);

    // 親指: 木枠の上面を押さえる
    blob(
      p,
      SKIN,
      [-side * border * 0.4, 18, topZ + 5],
      [border * 0.45, 8, 5],
      [0, 0, 0],
    );
    blob(
      p,
      SKIN,
      [-side * border * 0.65, 8, topZ + 5],
      [border * 0.3, 7, 4.5],
    );
    blob(p, NAIL, [-side * border * 0.8, 6, topZ + 8], [4, 5, 1.5]);

    // 底面へ回り込む4本の指
    for (const fingerY of [-8, 4, 16, 28]) {
      blob(
        p,
        SKIN_SHADE,
        [side * 8, fingerY, bottomZ + 3],
        [8, 5.5, 14],
        [0, 0, 0],
      );
      blob(
        p,
        SKIN,
        [-side * border * 0.5, fingerY, bottomZ - 4],
        [border * 0.8, 5, 4.5],
      );
    }

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
