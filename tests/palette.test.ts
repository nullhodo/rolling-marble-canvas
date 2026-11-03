import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants/defaults";
import { PRESET_PALETTES } from "../src/constants/palettes";
import { hexToRgb, rgbToHex } from "../src/utils/color";
import {
  buildGradientPalette,
  getInkColors,
  getPalette,
  resolveBackground,
  upsertPalette,
} from "../src/utils/palette";

describe("プリセットパレット", () => {
  it("28種あり、全色が正しい HEX で rgb 値と一致する", () => {
    expect(PRESET_PALETTES).toHaveLength(28);
    for (const palette of PRESET_PALETTES) {
      expect(palette.colors.length).toBeGreaterThan(0);
      for (const color of palette.colors) {
        expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
        const rgb = hexToRgb(color.hex);
        expect([rgb.red, rgb.green, rgb.blue]).toEqual(color.rgb);
      }
    }
  });

  it("既定の背景色は既定パレットに含まれる", () => {
    const palette = getPalette(
      PRESET_PALETTES,
      DEFAULT_SETTINGS.paletteIndex,
    );
    expect(
      resolveBackground(palette, DEFAULT_SETTINGS.backgroundColorHex),
    ).toBe(DEFAULT_SETTINGS.backgroundColorHex);
  });
});

describe("getInkColors", () => {
  const palette = PRESET_PALETTES[1];

  it("背景色と同じ色を除く (大文字小文字を区別しない)", () => {
    const colors = getInkColors(palette, "#e1dcca");
    expect(colors).toHaveLength(palette.colors.length - 1);
    expect(colors).not.toContain("#E1DCCA");
  });

  it("除くと空になる場合は全色を返す", () => {
    const single = { ...palette, colors: [palette.colors[0]] };
    expect(getInkColors(single, palette.colors[0].hex)).toEqual([
      palette.colors[0].hex,
    ]);
  });
});

describe("resolveBackground", () => {
  it("パレットにない背景色は末尾の色になる", () => {
    const palette = PRESET_PALETTES[0];
    expect(resolveBackground(palette, "#123456")).toBe(
      palette.colors[palette.colors.length - 1].hex,
    );
  });
});

describe("グラデーションテーマ", () => {
  it("5階調を生成し、各値は 0..255 に収まる", () => {
    const palette = buildGradientPalette("#1E459F");
    expect(palette.colors).toHaveLength(5);
    for (const color of palette.colors) {
      expect(color.rgb.every((value) => value >= 0 && value <= 255)).toBe(
        true,
      );
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("同じ色から作ると既存のテーマを置き換える", () => {
    const palette = buildGradientPalette("#1E459F");
    const first = upsertPalette(PRESET_PALETTES, palette);
    expect(first.index).toBe(PRESET_PALETTES.length);
    const second = upsertPalette(first.palettes, palette);
    expect(second.index).toBe(first.index);
    expect(second.palettes).toHaveLength(first.palettes.length);
  });
});

describe("color", () => {
  it("3桁 HEX を展開する", () => {
    expect(hexToRgb("#f80")).toEqual({ red: 255, green: 136, blue: 0 });
  });

  it("rgbToHex は範囲外をクランプする", () => {
    expect(rgbToHex(300, -5, 15.6)).toBe("#ff0010");
  });
});
