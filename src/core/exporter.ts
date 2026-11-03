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

const HIGH_RES_LONG_SIDE = 2560;

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
  trail: p5.Graphics;
};

/** 用紙 (背景色 + インク軌跡 + グレイン) だけを高解像度PNGで保存し、設定JSONも保存する。保存名の基準部分を返す */
export function exportHighResImage(p: p5, source: HighResSource): string {
  const { settings, bounds, trail } = source;

  const scale = Math.max(2.5, HIGH_RES_LONG_SIDE / bounds.width);
  const width = Math.round(bounds.width * scale);
  const height = Math.round(bounds.height * scale);

  const g = p.createGraphics(width, height);
  g.pixelDensity(1);

  const background = hexToRgb(settings.backgroundColorHex);
  g.background(background.red, background.green, background.blue);
  g.image(trail, 0, 0, width, height);

  if (settings.grainTextureEnabled) {
    g.blendMode(p.MULTIPLY);
    const step = Math.round(4 * scale);
    g.noStroke();
    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        g.fill(30, 25, 20, Math.random() * 18);
        g.rect(x, y, step, step);
      }
    }
    g.blendMode(p.BLEND);
  }

  const baseFilename = `${SKETCH_NAME}_${getFormattedDate()}_${width}x${height}`;
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
