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

const hasColor = (palette: Palette, hex: string) =>
  palette.colors.some(
    (color) => color.hex.toUpperCase() === hex.toUpperCase(),
  );

/**
 * パレット切り替え時の背景色を決める。
 * 前のパレットから選んだ色は、新しいパレットに無ければ末尾の色へ追従する。
 * 任意に選んだ色 (前のパレットに無い色) は、そのまま保つ。
 */
export function resolveBackgroundOnPaletteChange(
  previous: Palette,
  next: Palette,
  backgroundHex: string,
): string {
  const isCustom = !hasColor(previous, backgroundHex);
  if (isCustom || hasColor(next, backgroundHex)) return backgroundHex;
  return next.colors[next.colors.length - 1].hex;
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
