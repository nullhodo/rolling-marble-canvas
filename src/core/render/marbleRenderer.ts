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

/** 2D 俯瞰: 影・ガラス球・内部のスワール・ハイライト */
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
  p.fill(15, 12, 10, 80);
  p.ellipse(radius * 0.2, radius * 0.3, radius * 2.2, radius * 1.8);

  p.fill(rgb.red, rgb.green, rgb.blue, 240);
  p.circle(0, 0, radius * 2);

  p.rotate(marble.rotationAngleX + marble.rotationAngleY);
  p.noFill();
  p.stroke(255, 255, 255, 150);
  p.strokeWeight(radius * 0.22);
  p.arc(0, 0, radius * 1.2, radius * 1.2, 0, Math.PI * 1.2);

  p.noStroke();
  p.fill(255, 255, 255, 210);
  p.circle(-radius * 0.35, -radius * 0.35, radius * 0.55);

  p.pop();
}
