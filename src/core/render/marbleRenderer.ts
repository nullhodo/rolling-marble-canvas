import type p5 from "p5";
import { hexToRgb } from "../../utils/color";
import type { Marble } from "../physics/marble";

/** 3D: XY平面の用紙の上 (+Z) に乗る光沢ガラス球 */
export function drawMarble3D(
  p: p5,
  marble: Marble,
  trayWidth: number,
  trayHeight: number,
): void {
  const rgb = hexToRgb(marble.inkColorHex);

  p.push();
  p.translate(
    marble.x - trayWidth * 0.5,
    marble.y - trayHeight * 0.5,
    marble.radius,
  );
  p.rotateX(marble.rotationAngleX);
  p.rotateY(marble.rotationAngleY);
  p.noStroke();
  p.specularMaterial(240, 240, 255);
  p.shininess(50);
  p.fill(rgb.red, rgb.green, rgb.blue, 235);
  p.sphere(marble.radius, 24, 20);
  p.pop();
}

const SHADE_LAYERS = 6;

/** 2D 俯瞰: 柔らかい影・奥行きのある濃淡・窓映りのハイライト */
export function drawMarble2D(
  p: p5,
  marble: Marble,
  trayWidth: number,
  trayHeight: number,
): void {
  const rgb = hexToRgb(marble.inkColorHex);
  const radius = marble.radius;

  p.push();
  p.translate(marble.x - trayWidth * 0.5, marble.y - trayHeight * 0.5, 1);

  p.noStroke();

  // 接地影: 小さく濃い影の外側に、広く淡い影を重ねる
  for (let layer = 0; layer < 4; layer++) {
    p.fill(20, 16, 12, 16);
    const spread = 1.7 + layer * 0.22;
    p.ellipse(
      radius * 0.3,
      radius * 0.4,
      radius * spread,
      radius * spread * 0.92,
    );
  }

  // 球の濃淡: 暗い縁から、左上へずらしながら明るい芯へ重ねる
  for (let layer = 0; layer < SHADE_LAYERS; layer++) {
    const ratio = layer / (SHADE_LAYERS - 1);
    const shade = 0.62 + ratio * 0.5;
    const lift = ratio * 255 * 0.12;
    p.fill(
      Math.min(255, rgb.red * shade + lift),
      Math.min(255, rgb.green * shade + lift),
      Math.min(255, rgb.blue * shade + lift),
    );
    const size = radius * 2 * (1 - ratio * 0.5);
    const shift = -radius * 0.2 * ratio;
    p.circle(shift, shift, size);
  }

  // 窓の映り込み: 左上の小さな楕円と、右下の縁に回り込む反射光
  p.push();
  p.rotate(-0.7);
  p.fill(255, 255, 255, 215);
  p.ellipse(-radius * 0.1, -radius * 0.52, radius * 0.5, radius * 0.24);
  p.pop();
  p.fill(255, 255, 255, 55);
  p.circle(radius * 0.42, radius * 0.46, radius * 0.22);

  p.pop();
}
