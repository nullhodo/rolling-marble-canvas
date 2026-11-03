import type p5 from "p5";
import type { TrayBounds } from "../../types/simulation";

const HAND_SIDES = [-1, 1] as const;

/** 3D: トレイの左右を握る手 (手前 +Y 側から腕が伸びる) */
export function drawHands3D(p: p5, bounds: TrayBounds): void {
  const halfWidth = bounds.width * 0.5;
  const border = bounds.borderThickness;
  const depth = bounds.depth;

  const skin = [228, 182, 154] as const;
  const shadowSkin = [195, 148, 122] as const;
  const nail = [242, 204, 184] as const;
  const cuff = [45, 55, 72] as const;

  for (const side of HAND_SIDES) {
    p.push();
    p.translate((halfWidth + border * 0.4) * side, 25, depth * 0.35);
    p.rotateZ(side * 0.18);
    p.noStroke();

    // 袖口
    p.push();
    p.translate(side * 80, 55, -35);
    p.rotateZ(-side * 0.2);
    p.fill(...cuff);
    p.box(42, 65, 38);
    p.pop();

    // 手首と手の甲
    p.push();
    p.translate(side * 42, 28, -15);
    p.fill(...shadowSkin);
    p.box(36, 52, 28);
    p.pop();

    // 親指: 木枠上面を押さえる
    p.push();
    p.translate(-side * border * 0.15, -10, depth * 0.22);
    p.rotateZ(-side * 0.35);
    p.rotateY(side * 0.15);
    p.fill(...skin);
    p.box(16, 28, 14);
    p.translate(-side * 4, -14, 0);
    p.box(14, 16, 12);
    p.translate(0, -3, 6);
    p.fill(...nail);
    p.box(9, 10, 2);
    p.pop();

    // 木枠の裏側へ回り込む4本の指
    for (const fingerY of [-18, -4, 10, 24]) {
      p.push();
      p.translate(side * (border * 0.5 + 4), fingerY, -depth * 0.35);
      p.rotateZ(side * 0.4);
      p.fill(...shadowSkin);
      p.box(16, 11, 14);
      p.translate(-side * 8, 0, depth * 0.2);
      p.box(14, 10, 12);
      p.pop();
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
