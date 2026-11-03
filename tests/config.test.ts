import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants/defaults";
import { PRESET_PALETTES } from "../src/constants/palettes";
import { buildConfigFile, parseConfigFile } from "../src/core/config";
import { calculateTrayBounds } from "../src/core/physics/tray";

describe("設定JSON", () => {
  const bounds = calculateTrayBounds(1440, 900);

  it("保存した内容がそのまま復元できる", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      marbleCount: 20,
      debugModeEnabled: true,
    };
    const json = JSON.stringify(
      buildConfigFile(settings, bounds, PRESET_PALETTES[3]),
    );
    const parsed = parseConfigFile(json);
    expect(parsed.settings).toEqual(settings);
    expect(parsed.palette?.title).toBe(PRESET_PALETTES[3].title);
  });

  it("欠けたキーは既定値で補う", () => {
    const parsed = parseConfigFile(
      JSON.stringify({ settings: { marbleCount: 7 } }),
    );
    expect(parsed.settings.marbleCount).toBe(7);
    expect(parsed.settings.frictionDeceleration).toBe(
      DEFAULT_SETTINGS.frictionDeceleration,
    );
    expect(parsed.palette).toBeNull();
  });

  it("型が違う値は採用しない", () => {
    const parsed = parseConfigFile(
      JSON.stringify({
        settings: { marbleCount: "many", isHandsVisible: 1 },
      }),
    );
    expect(parsed.settings.marbleCount).toBe(DEFAULT_SETTINGS.marbleCount);
    expect(parsed.settings.isHandsVisible).toBe(
      DEFAULT_SETTINGS.isHandsVisible,
    );
  });

  it("壊れたパレットは無視する", () => {
    const parsed = parseConfigFile(
      JSON.stringify({
        settings: {},
        palette: { title: "x", colors: [{ hex: "red" }] },
      }),
    );
    expect(parsed.palette).toBeNull();
  });

  it("settings がない JSON は拒否する", () => {
    expect(() => parseConfigFile("{}")).toThrow();
    expect(() => parseConfigFile("not json")).toThrow();
  });
});
