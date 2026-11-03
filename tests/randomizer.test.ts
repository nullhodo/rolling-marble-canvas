import { describe, expect, it } from "vitest";
import {
  DEFAULT_RANDOM_TARGETS,
  DEFAULT_SETTINGS,
} from "../src/constants/defaults";
import { PRESET_PALETTES } from "../src/constants/palettes";
import {
  buildModulatedSettings,
  buildRandomizedSettings,
} from "../src/utils/randomizer";
import { createSeededRandom } from "./helpers";

// UI スライダーの min / max (components/sections と同じ値)
const SLIDER_RANGES = {
  tiltForceMultiplier: [0.1, 2],
  frictionDeceleration: [0.94, 0.999],
  wallBounceElasticity: [0.2, 0.98],
  marbleCount: [1, 36],
  marbleRadiusBase: [6, 32],
  inkDecayRate: [0.0005, 0.015],
  thicknessFluctuationStrength: [0, 1],
  splashSprayStrength: [0, 1],
  splatterStrength: [0, 1],
  wobbleNoiseStrength: [0, 1],
  surfaceNoiseStrength: [0, 1],
  autoTiltIntensity: [0, 3],
} as const;

function expectWithinSliders(settings: typeof DEFAULT_SETTINGS) {
  for (const [key, [min, max]] of Object.entries(SLIDER_RANGES)) {
    const value = settings[key as keyof typeof SLIDER_RANGES];
    expect(value, key).toBeGreaterThanOrEqual(min);
    expect(value, key).toBeLessThanOrEqual(max);
  }
}

describe("ランダム化", () => {
  it("1000回繰り返しても値がスライダー範囲内に収まる", () => {
    const random = createSeededRandom(42);
    let settings = DEFAULT_SETTINGS;
    for (let index = 0; index < 1000; index++) {
      settings = buildRandomizedSettings(
        settings,
        DEFAULT_RANDOM_TARGETS,
        PRESET_PALETTES,
        random,
      );
      expectWithinSliders(settings);
    }
  });

  it("パレットから選んだ背景色は、選ばれたパレットに含まれる", () => {
    const random = createSeededRandom(7);
    for (let index = 0; index < 200; index++) {
      const next = buildRandomizedSettings(
        DEFAULT_SETTINGS,
        DEFAULT_RANDOM_TARGETS,
        PRESET_PALETTES,
        random,
      );
      const palette = PRESET_PALETTES[next.paletteIndex];
      expect(palette.colors.map((c) => c.hex)).toContain(
        next.backgroundColorHex,
      );
    }
  });

  it("背景色の維持を有効にすると、パレット内の色でも保たれる", () => {
    const keep = {
      ...DEFAULT_SETTINGS,
      keepBackgroundOnRandomize: true,
    };
    const random = createSeededRandom(5);
    for (let index = 0; index < 50; index++) {
      const next = buildRandomizedSettings(
        keep,
        DEFAULT_RANDOM_TARGETS,
        PRESET_PALETTES,
        random,
      );
      expect(next.backgroundColorHex).toBe(keep.backgroundColorHex);
    }
  });

  it("任意に選んだ背景色は、ランダム化しても保たれる", () => {
    const custom = { ...DEFAULT_SETTINGS, backgroundColorHex: "#123456" };
    const random = createSeededRandom(9);
    for (let index = 0; index < 50; index++) {
      const next = buildRandomizedSettings(
        custom,
        DEFAULT_RANDOM_TARGETS,
        PRESET_PALETTES,
        random,
      );
      expect(next.backgroundColorHex).toBe("#123456");
    }
  });

  it("対象外のグループは変わらない", () => {
    const next = buildRandomizedSettings(
      DEFAULT_SETTINGS,
      { color: false, physics: false, ink: false, noise: true },
      PRESET_PALETTES,
      createSeededRandom(3),
    );
    expect(next.paletteIndex).toBe(DEFAULT_SETTINGS.paletteIndex);
    expect(next.marbleCount).toBe(DEFAULT_SETTINGS.marbleCount);
    expect(next.tiltForceMultiplier).toBe(
      DEFAULT_SETTINGS.tiltForceMultiplier,
    );
    expect(next.wobbleNoiseStrength).not.toBe(
      DEFAULT_SETTINGS.wobbleNoiseStrength,
    );
  });
});

describe("周期変調", () => {
  it("1000回繰り返しても範囲内に収まり、個数やパレットは変えない", () => {
    const random = createSeededRandom(11);
    let settings = DEFAULT_SETTINGS;
    for (let index = 0; index < 1000; index++) {
      settings = buildModulatedSettings(settings, random);
      expectWithinSliders(settings);
    }
    expect(settings.marbleCount).toBe(DEFAULT_SETTINGS.marbleCount);
    expect(settings.paletteIndex).toBe(DEFAULT_SETTINGS.paletteIndex);
  });
});
