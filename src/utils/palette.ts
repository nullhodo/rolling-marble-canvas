import type { Palette } from "../types/simulation";
import { hexToRgb, rgbToHex } from "./color";

const LUMINOSITY_MULTIPLIERS = [0.4, 0.7, 1.0, 1.35, 1.65];

/** 範囲外のインデックスは先頭のパレットに丸める */
export function getPalette(palettes: Palette[], index: number): Palette {
  return palettes[index] ?? palettes[0];
}

/** 背景色と同じ色を除いたビー玉のインク色。除くと空になる場合は全色 */
export function getInkColors(
  palette: Palette,
  backgroundHex: string,
): string[] {
  const background = backgroundHex.toUpperCase();
  const candidates = palette.colors.filter(
    (color) => color.hex.toUpperCase() !== background,
  );
  const source = candidates.length > 0 ? candidates : palette.colors;
  return source.map((color) => color.hex);
}

/** 背景色がパレット内になければ、パレット末尾の色に差し替える */
export function resolveBackground(
  palette: Palette,
  backgroundHex: string,
): string {
  const exists = palette.colors.some(
    (color) => color.hex.toUpperCase() === backgroundHex.toUpperCase(),
  );
  return exists
    ? backgroundHex
    : palette.colors[palette.colors.length - 1].hex;
}

export function buildGradientPalette(baseHex: string): Palette {
  const base = hexToRgb(baseHex);
  return {
    title: `Custom Tint (${baseHex})`,
    comment: "単一色から生成されたグラデーションテーマ",
    colors: LUMINOSITY_MULTIPLIERS.map((factor, index) => {
      const red = Math.min(255, Math.round(base.red * factor));
      const green = Math.min(255, Math.round(base.green * factor));
      const blue = Math.min(255, Math.round(base.blue * factor));
      return {
        name: `Tone ${index + 1}`,
        hex: rgbToHex(red, green, blue),
        rgb: [red, green, blue],
      };
    }),
  };
}

/** 同名パレットがあれば置き換え、なければ追加して、そのインデックスを返す */
export function upsertPalette(
  palettes: Palette[],
  palette: Palette,
): { palettes: Palette[]; index: number } {
  const existing = palettes.findIndex(
    (item) => item.title === palette.title,
  );
  if (existing >= 0) {
    const next = [...palettes];
    next[existing] = palette;
    return { palettes: next, index: existing };
  }
  return { palettes: [...palettes, palette], index: palettes.length };
}
