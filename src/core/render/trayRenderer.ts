import type p5 from "p5";
import type { TrayBounds } from "../../types/simulation";
import { hexToRgb } from "../../utils/color";

type TrayLayers = {
  trail: p5.Graphics | null;
  grain: p5.Graphics | null;
  grainEnabled: boolean;
  backgroundHex: string;
};

function isDrawable(buffer: p5.Graphics | null): buffer is p5.Graphics {
  return Boolean(buffer?.elt && buffer.elt.width > 0);
}

const SHADOW_LAYERS = 12;

/** トレイの下に落ちる柔らかい影。半透明の板を少しずつ大きくして重ね、ぼかしの代わりにする */
function drawSoftShadow(
  p: p5,
  width: number,
  height: number,
  depth: number,
): void {
  p.push();
  p.noLights();
  p.noStroke();
  for (let layer = 0; layer < SHADOW_LAYERS; layer++) {
    const spread = 2 + layer * 3.2;
    p.push();
    p.translate(8, 12, -depth - 2 - layer * 0.05);
    p.fill(0, 0, 0, 9);
    p.plane(width + spread * 2, height + spread * 2);
    p.pop();
  }
  p.pop();
}

/** 3D: 木枠トレイ (底板 + 4辺のリム) と用紙 (背景 + インク軌跡 + グレイン) */
export function drawTray3D(
  p: p5,
  bounds: TrayBounds,
  layers: TrayLayers,
): void {
  const halfWidth = bounds.width * 0.5;
  const halfHeight = bounds.height * 0.5;
  const border = bounds.borderThickness;
  const depth = bounds.depth;
  const outerWidth = bounds.width + border * 2;

  p.noStroke();
  drawSoftShadow(p, outerWidth, bounds.height + border * 2, depth);

  p.push();
  p.translate(0, 0, -depth * 0.5);
  p.fill(55, 40, 29);
  p.box(outerWidth, bounds.height + border * 2, depth);
  p.pop();

  p.fill(74, 56, 43);
  const rimZ = depth * 0.35;
  const rimDepth = depth * 0.7;

  p.push();
  p.translate(0, -halfHeight - border * 0.5, rimZ);
  p.box(outerWidth, border, rimDepth);
  p.pop();

  p.push();
  p.translate(0, halfHeight + border * 0.5, rimZ);
  p.box(outerWidth, border, rimDepth);
  p.pop();

  p.push();
  p.translate(-halfWidth - border * 0.5, 0, rimZ);
  p.box(border, bounds.height, rimDepth);
  p.pop();

  p.push();
  p.translate(halfWidth + border * 0.5, 0, rimZ);
  p.box(border, bounds.height, rimDepth);
  p.pop();

  // 用紙は照明で白飛びさせず、背景色をそのまま見せる
  p.push();
  p.noLights();
  p.translate(0, 0, 0.5);
  p.noStroke();

  const background = hexToRgb(layers.backgroundHex);
  p.fill(background.red, background.green, background.blue);
  p.plane(bounds.width, bounds.height);

  if (isDrawable(layers.trail)) {
    p.texture(layers.trail);
    p.plane(bounds.width, bounds.height);
  }
  if (layers.grainEnabled && isDrawable(layers.grain)) {
    p.texture(layers.grain);
    p.plane(bounds.width, bounds.height);
  }
  p.pop();
}

/** 2D 俯瞰: ドロップシャドウ・木枠・用紙・内壁の落とし込みシャドウ */
export function drawTray2D(
  p: p5,
  bounds: TrayBounds,
  layers: TrayLayers,
): void {
  const halfWidth = bounds.width * 0.5;
  const halfHeight = bounds.height * 0.5;
  const border = bounds.borderThickness;
  const outerWidth = bounds.width + border * 2;
  const outerHeight = bounds.height + border * 2;

  p.noStroke();
  p.fill(6, 6, 10, 140);
  p.rect(
    -halfWidth - border + 8,
    -halfHeight - border + 10,
    outerWidth,
    outerHeight,
    12,
  );

  p.fill(68, 50, 38);
  p.rect(
    -halfWidth - border,
    -halfHeight - border,
    outerWidth,
    outerHeight,
    10,
  );

  p.noFill();
  p.stroke(96, 74, 58);
  p.strokeWeight(2);
  p.rect(
    -halfWidth - border + 1,
    -halfHeight - border + 1,
    outerWidth - 2,
    outerHeight - 2,
    10,
  );

  p.noStroke();
  const background = hexToRgb(layers.backgroundHex);
  p.fill(background.red, background.green, background.blue);
  p.rect(-halfWidth, -halfHeight, bounds.width, bounds.height);

  if (isDrawable(layers.trail)) {
    p.push();
    p.translate(0, 0, 0.2);
    p.texture(layers.trail);
    p.plane(bounds.width, bounds.height);
    p.pop();
  }
  if (layers.grainEnabled && isDrawable(layers.grain)) {
    p.push();
    p.translate(0, 0, 0.3);
    p.texture(layers.grain);
    p.plane(bounds.width, bounds.height);
    p.pop();
  }

  p.noFill();
  p.stroke(24, 18, 12, 60);
  p.strokeWeight(4);
  p.rect(-halfWidth, -halfHeight, bounds.width, bounds.height);
}

/** 紙の微粒子ノイズテクスチャ */
export function paintPaperGrain(
  g: p5.Graphics,
  random: () => number = Math.random,
): void {
  g.clear();
  g.noStroke();
  const step = 4;
  for (let x = 0; x < g.width; x += step) {
    for (let y = 0; y < g.height; y += step) {
      g.fill(30, 25, 20, random() * 16);
      g.rect(x, y, step, step);
    }
  }
}
