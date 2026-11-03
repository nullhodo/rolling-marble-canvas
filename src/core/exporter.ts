import type p5 from "p5";
import type {
  Palette,
  SimulationSettings,
  TrayBounds,
} from "../types/simulation";
import { hexToRgb } from "../utils/color";
import { getFormattedDate } from "../utils/date";
import { downloadBlob } from "../utils/download";
import { disposeGraphics } from "../utils/p5Graphics";
import { SKETCH_NAME, buildConfigFile } from "./config";
import type { Marble } from "./physics/marble";

const HIGH_RES_LONG_SIDE = 2560;
const BACKGROUND_RGB = [12, 14, 20] as const;

export function exportJsonSettings(
  filename: string,
  settings: SimulationSettings,
  bounds: TrayBounds,
  palette: Palette,
): void {
  const config = buildConfigFile(settings, bounds, palette);
  downloadBlob(
    new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    }),
    filename,
  );
}

type HighResSource = {
  settings: SimulationSettings;
  bounds: TrayBounds;
  palette: Palette;
  marbles: Marble[];
  trail: p5.Graphics;
};

/** 用紙・木枠・ビー玉・手を2D描画した高解像度PNGと、設定JSONを保存する。保存名の基準部分を返す */
export function exportHighResImage(p: p5, source: HighResSource): string {
  const { settings, bounds, marbles, trail } = source;

  const scale = Math.max(2.5, HIGH_RES_LONG_SIDE / bounds.width);
  const innerWidth = Math.round(bounds.width * scale);
  const innerHeight = Math.round(bounds.height * scale);
  const border = Math.round(bounds.borderThickness * scale);
  const margin = Math.round(100 * scale);
  const totalWidth = innerWidth + border * 2 + margin;
  const totalHeight = innerHeight + border * 2 + margin;

  const g = p.createGraphics(totalWidth, totalHeight);
  g.pixelDensity(1);
  g.background(...BACKGROUND_RGB);
  g.push();
  g.translate(totalWidth * 0.5, totalHeight * 0.5);

  const left = -innerWidth * 0.5;
  const top = -innerHeight * 0.5;

  // 木枠のドロップシャドウと本体
  g.noStroke();
  g.fill(6, 6, 10, 140);
  g.rect(
    left - border + 12 * scale,
    top - border + 16 * scale,
    innerWidth + border * 2,
    innerHeight + border * 2,
    14 * scale,
  );
  g.fill(68, 50, 38);
  g.rect(
    left - border,
    top - border,
    innerWidth + border * 2,
    innerHeight + border * 2,
    12 * scale,
  );

  // 用紙と蓄積された軌跡
  const background = hexToRgb(settings.backgroundColorHex);
  g.fill(background.red, background.green, background.blue);
  g.rect(left, top, innerWidth, innerHeight);
  g.image(trail, left, top, innerWidth, innerHeight);

  // 高解像度グレイン
  if (settings.grainTextureEnabled) {
    g.blendMode(p.MULTIPLY);
    const step = Math.round(4 * scale);
    g.noStroke();
    for (let x = left; x < innerWidth * 0.5; x += step) {
      for (let y = top; y < innerHeight * 0.5; y += step) {
        g.fill(30, 25, 20, Math.random() * 18);
        g.rect(x, y, step, step);
      }
    }
    g.blendMode(p.BLEND);
  }

  for (const marble of marbles) {
    const rgb = hexToRgb(marble.inkColorHex);
    const radius = marble.radius * scale;
    g.push();
    g.translate(
      (marble.x - bounds.width * 0.5) * scale,
      (marble.y - bounds.height * 0.5) * scale,
    );
    g.noStroke();
    g.fill(15, 12, 10, 80);
    g.ellipse(radius * 0.2, radius * 0.3, radius * 2.2, radius * 1.8);
    g.fill(rgb.red, rgb.green, rgb.blue, 240);
    g.circle(0, 0, radius * 2);
    g.fill(255, 255, 255, 200);
    g.circle(-radius * 0.35, -radius * 0.35, radius * 0.55);
    g.pop();
  }

  if (settings.isHandsVisible) {
    for (const side of [-1, 1]) {
      g.push();
      g.translate((innerWidth * 0.5 + border) * side, 20 * scale);
      g.noStroke();
      g.fill("#2D3748");
      g.rect(
        (side > 0 ? 30 : -85) * scale,
        20 * scale,
        55 * scale,
        60 * scale,
        8 * scale,
      );
      g.fill("#C3947A");
      g.rect(
        (side > 0 ? 5 : -55) * scale,
        0,
        50 * scale,
        48 * scale,
        12 * scale,
      );
      g.fill("#E4B69A");
      g.ellipse(side * -8 * scale, -10 * scale, 24 * scale, 34 * scale);
      g.fill("#F2CCB8");
      g.ellipse(side * -10 * scale, -18 * scale, 12 * scale, 14 * scale);
      g.pop();
    }
  }

  g.pop();

  const baseFilename = `${SKETCH_NAME}_${getFormattedDate()}_${totalWidth}x${totalHeight}`;
  (g.elt as HTMLCanvasElement).toBlob((blob) => {
    if (blob) downloadBlob(blob, `${baseFilename}.png`);
    disposeGraphics(g);
  }, "image/png");
  exportJsonSettings(
    `${baseFilename}.json`,
    settings,
    bounds,
    source.palette,
  );

  return baseFilename;
}
