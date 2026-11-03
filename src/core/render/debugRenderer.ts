import type p5 from "p5";
import type { SimulationSettings } from "../../types/simulation";

/** 傾斜加速度ベクトルとビュー情報の物理デバッグ表示 */
export function drawDebugOverlay(
  p: p5,
  settings: SimulationSettings,
  gravityX: number,
  gravityY: number,
): void {
  p.push();
  p.camera(0, 0, 1000, 0, 0, 0, 0, 1, 0);
  p.ortho(
    -p.width / 2,
    p.width / 2,
    -p.height / 2,
    p.height / 2,
    0.1,
    3000,
  );

  const centerX = 0;
  const centerY = -p.height * 0.4;

  p.noFill();
  p.stroke(255, 255, 255, 90);
  p.strokeWeight(1.5);
  p.circle(centerX, centerY, 60);

  p.stroke(255, 80, 80);
  p.strokeWeight(2.5);
  p.line(
    centerX,
    centerY,
    centerX + gravityX * 45,
    centerY + gravityY * 45,
  );

  p.noStroke();
  p.fill(0, 220, 255);
  p.textAlign(p.CENTER, p.CENTER);
  const view = settings.isThreeDimensionalView ? "3D VIEW" : "2D TOPDOWN";
  p.text(
    `VIEW: ${view} | PITCH: ${settings.cameraPitchDegrees}° | YAW: ${settings.cameraYawDegrees}°`,
    centerX,
    centerY + 45,
  );
  p.pop();
}
