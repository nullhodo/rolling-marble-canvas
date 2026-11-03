import type p5 from "p5";
import type {
  Palette,
  SimulationSettings,
  TrayBounds,
} from "../types/simulation";
import { getFormattedDate } from "../utils/date";
import { downloadBlob } from "../utils/download";
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

/** 紙のざらつき。1セルずつ描かず、小さなノイズ画像を1回拡大して重ねる */
function paintGrain(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number,
): void {
  const noise = document.createElement("canvas");
  noise.width = Math.ceil(width / step);
  noise.height = Math.ceil(height / step);
  const noiseContext = noise.getContext("2d");
  if (!noiseContext) return;

  const image = noiseContext.createImageData(noise.width, noise.height);
  for (let index = 0; index < image.data.length; index += 4) {
    image.data[index] = 30;
    image.data[index + 1] = 25;
    image.data[index + 2] = 20;
    image.data[index + 3] = Math.random() * 18;
  }
  noiseContext.putImageData(image, 0, 0);

  context.save();
  context.globalCompositeOperation = "multiply";
  context.imageSmoothingEnabled = false;
  context.drawImage(noise, 0, 0, noise.width * step, noise.height * step);
  context.restore();
}

/** 用紙 (背景色 + インク軌跡 + グレイン) だけを高解像度PNGで保存し、設定JSONも保存する。保存名の基準部分を返す */
export function exportHighResImage(source: HighResSource): string {
  const { settings, bounds, trail } = source;

  const scale = Math.max(2.5, HIGH_RES_LONG_SIDE / bounds.width);
  const width = Math.round(bounds.width * scale);
  const height = Math.round(bounds.height * scale);

  // p5.Graphics は画面の pixelDensity で確保してから縮めるため、素の canvas で作る
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D コンテキストを取得できません");

  context.fillStyle = settings.backgroundColorHex;
  context.fillRect(0, 0, width, height);
  context.drawImage(trail.elt as HTMLCanvasElement, 0, 0, width, height);

  if (settings.grainTextureEnabled) {
    paintGrain(context, width, height, Math.round(4 * scale));
  }

  const baseFilename = `${SKETCH_NAME}_${getFormattedDate()}_${width}x${height}`;
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `${baseFilename}.png`);
  }, "image/png");
  exportJsonSettings(
    `${baseFilename}.json`,
    settings,
    bounds,
    source.palette,
  );

  return baseFilename;
}
