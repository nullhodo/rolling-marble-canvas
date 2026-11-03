import type p5 from "p5";
import type { SimulationSettings } from "../../types/simulation";
import { hexToRgb } from "../../utils/color";
import type { Marble, NoiseFunction, Random } from "../physics/marble";

/** 転がった軌跡を、粘性まだらゆらぎ・インクだまり付きで用紙バッファに描く */
export function paintTrail(
  g: p5.Graphics,
  marble: Marble,
  settings: SimulationSettings,
  noise: NoiseFunction,
  random: Random = Math.random,
): void {
  const speed = Math.hypot(marble.vx, marble.vy);
  if (speed < 0.05) return;

  g.push();
  const rgb = hexToRgb(marble.inkColorHex);

  // 球表面の絵の具付着ムラ
  const circumference = Math.PI * 2 * marble.radius;
  const rollCycle =
    (marble.rotationDistanceAccumulator % circumference) / circumference;
  const phaseModulation = Math.sin(
    rollCycle * Math.PI * 2 + marble.inkPatchPhase,
  );

  // 紙の繊維とインク粘性による微小なテクスチャノイズ
  const textureNoise = noise(
    (marble.x + marble.inkPatchTextureOffset) * 0.035,
    (marble.y + marble.inkPatchTextureOffset) * 0.035,
  );

  const thicknessVariation =
    (phaseModulation * 0.55 + (textureNoise - 0.5) * 0.45) *
    settings.thicknessFluctuationStrength;
  const thicknessMultiplier = Math.max(0.2, 1.0 + thicknessVariation);

  const baseWidth =
    marble.radius * 0.52 * (0.28 + marble.remainingInkLevel * 0.72);
  const strokeThickness = Math.max(
    0.8,
    (baseWidth - speed * 0.08) * thicknessMultiplier,
  );
  const strokeAlpha = Math.min(
    255,
    (20 + marble.remainingInkLevel * 210) * (0.65 + textureNoise * 0.35),
  );

  // 1. メイン軌跡線
  g.stroke(rgb.red, rgb.green, rgb.blue, strokeAlpha);
  g.strokeWeight(strokeThickness);
  g.strokeCap("round");
  g.strokeJoin("round");
  g.line(marble.prevX, marble.prevY, marble.x, marble.y);

  // 2. 粘性インクの芯とエッジ濃淡
  if (
    marble.remainingInkLevel > 0.2 &&
    settings.thicknessFluctuationStrength > 0.15
  ) {
    g.stroke(
      rgb.red * 0.8,
      rgb.green * 0.8,
      rgb.blue * 0.8,
      strokeAlpha * 0.75,
    );
    g.strokeWeight(strokeThickness * 0.4);
    g.line(marble.prevX, marble.prevY, marble.x, marble.y);
  }

  // 3. インクだまりが紙に接触した瞬間のボタ落ち
  const isDepositPeak = phaseModulation > 0.72;
  if (
    isDepositPeak &&
    marble.remainingInkLevel > 0.28 &&
    random() < 0.28 + settings.thicknessFluctuationStrength * 0.45
  ) {
    g.noStroke();
    g.fill(
      rgb.red * 0.85,
      rgb.green * 0.85,
      rgb.blue * 0.85,
      Math.min(255, strokeAlpha * 0.85),
    );
    const clotRadius = 1.5 + random() * 3.2 * marble.remainingInkLevel;
    const jitterX = (random() - 0.5) * strokeThickness * 0.6;
    const jitterY = (random() - 0.5) * strokeThickness * 0.6;
    g.circle(marble.x + jitterX, marble.y + jitterY, clotRadius * 2);
  }

  g.pop();
}

/** 急旋回の遠心力で外側へ尾を引いて飛び散るインク */
export function paintCentrifugalSplash(
  g: p5.Graphics,
  marble: Marble,
  speed: number,
  turn: number,
  settings: SimulationSettings,
  random: Random = Math.random,
): void {
  g.push();
  const rgb = hexToRgb(marble.inkColorHex);
  const strength = settings.splashSprayStrength;
  const sprayCount = Math.floor((1.5 + turn * 4.0) * strength * 4);
  const sprayAlpha = Math.min(255, 130 + marble.remainingInkLevel * 110);

  g.noStroke();
  g.fill(rgb.red, rgb.green, rgb.blue, sprayAlpha);

  const movementAngle = Math.atan2(marble.vy, marble.vx);
  const outwardSign = random() > 0.5 ? 1 : -1;
  const baseAngle = movementAngle + Math.PI * 0.5 * outwardSign;

  for (let index = 0; index < sprayCount; index++) {
    const angle = baseAngle + (random() - 0.5) * 1.1;
    const distance =
      marble.radius * 0.9 + random() * speed * 5.2 * strength;
    const dropRadius =
      (0.6 + random() * 2.2) * Math.max(0.4, marble.remainingInkLevel);

    const dropX = marble.x + Math.cos(angle) * distance;
    const dropY = marble.y + Math.sin(angle) * distance;
    g.circle(dropX, dropY, dropRadius * 2);

    if (random() < 0.35 + strength * 0.3) {
      g.stroke(rgb.red, rgb.green, rgb.blue, sprayAlpha * 0.55);
      g.strokeWeight(Math.max(0.6, dropRadius * 0.65));
      g.line(
        dropX,
        dropY,
        dropX + Math.cos(angle) * dropRadius * 4.0,
        dropY + Math.sin(angle) * dropRadius * 4.0,
      );
      g.noStroke();
    }
  }
  g.pop();
}

/** 壁・ビー玉同士の衝突で放射状に飛び散るインク飛沫 */
export function paintSplatter(
  g: p5.Graphics,
  marble: Marble,
  impulse: number,
  settings: SimulationSettings,
  origin: { x: number; y: number } = marble,
  random: Random = Math.random,
): void {
  g.push();
  const rgb = hexToRgb(marble.inkColorHex);
  const strength = settings.splatterStrength;
  const dropCount = Math.floor(impulse * strength * 4.5);
  const alpha = Math.min(
    255,
    175 * Math.max(0.4, marble.remainingInkLevel),
  );

  g.noStroke();
  g.fill(rgb.red, rgb.green, rgb.blue, alpha);

  for (let index = 0; index < dropCount; index++) {
    const angle = random() * Math.PI * 2;
    const distance = 3 + random() * impulse * 14 * strength;
    const dropRadius =
      (0.7 + random() * 2.4) * (0.4 + marble.remainingInkLevel * 0.6);

    g.circle(
      origin.x + Math.cos(angle) * distance,
      origin.y + Math.sin(angle) * distance,
      dropRadius * 2,
    );

    if (impulse > 2.5 && random() < 0.3) {
      const satelliteDistance = distance + 2 + random() * 5;
      g.circle(
        origin.x + Math.cos(angle) * satelliteDistance,
        origin.y + Math.sin(angle) * satelliteDistance,
        dropRadius * 0.8,
      );
    }
  }
  g.pop();
}
