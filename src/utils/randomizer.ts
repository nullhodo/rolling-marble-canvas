import type {
  Palette,
  RandomTargets,
  SimulationSettings,
} from "../types/simulation";
import { clamp } from "./math";
import { getPalette, resolveBackgroundOnPaletteChange } from "./palette";

type Random = () => number;

/** [min, max) の乱数を小数 decimals 桁に丸めて返す */
function randomInRange(
  min: number,
  max: number,
  decimals: number,
  random: Random,
): number {
  return Number.parseFloat(
    (min + random() * (max - min)).toFixed(decimals),
  );
}

/** 選択された対象グループだけをランダムにした設定を返す */
export function buildRandomizedSettings(
  current: SimulationSettings,
  targets: RandomTargets,
  palettes: Palette[],
  random: Random = Math.random,
): SimulationSettings {
  const next = { ...current };

  if (targets.color) {
    next.paletteIndex = Math.floor(random() * palettes.length);
    if (!current.keepBackgroundOnRandomize) {
      next.backgroundColorHex = resolveBackgroundOnPaletteChange(
        getPalette(palettes, current.paletteIndex),
        palettes[next.paletteIndex],
        next.backgroundColorHex,
      );
    }
  }

  if (targets.physics) {
    next.tiltForceMultiplier = randomInRange(0.3, 1.6, 2, random);
    next.frictionDeceleration = randomInRange(0.97, 0.995, 3, random);
    next.wallBounceElasticity = randomInRange(0.4, 0.95, 2, random);
  }

  if (targets.ink) {
    // 少ない個数が出やすいよう、乱数を2乗して小さい側へ偏らせる
    next.marbleCount = Math.floor(3 + random() ** 2 * 25);
    next.marbleRadiusBase = Math.floor(8 + random() * 18);
    next.inkDecayRate = randomInRange(0.001, 0.009, 4, random);
    next.thicknessFluctuationStrength = randomInRange(
      0.2,
      0.95,
      2,
      random,
    );
    next.splashSprayStrength = randomInRange(0.15, 0.95, 2, random);
    next.splatterStrength = randomInRange(0.2, 1.0, 2, random);
  }

  if (targets.noise) {
    next.wobbleNoiseStrength = randomInRange(0.1, 0.9, 2, random);
    next.surfaceNoiseStrength = randomInRange(0.1, 0.8, 2, random);
  }

  return next;
}

/** 周期変調: 現在値の近傍で少しだけ設定を揺らす */
export function buildModulatedSettings(
  current: SimulationSettings,
  random: Random = Math.random,
): SimulationSettings {
  const jitter = (
    value: number,
    amplitude: number,
    min: number,
    max: number,
  ) => clamp(value + (random() - 0.5) * amplitude, min, max);

  return {
    ...current,
    tiltForceMultiplier: jitter(
      current.tiltForceMultiplier,
      0.25,
      0.2,
      1.6,
    ),
    frictionDeceleration: jitter(
      current.frictionDeceleration,
      0.008,
      0.965,
      0.995,
    ),
    thicknessFluctuationStrength: jitter(
      current.thicknessFluctuationStrength,
      0.2,
      0.1,
      0.95,
    ),
    splashSprayStrength: jitter(
      current.splashSprayStrength,
      0.2,
      0.1,
      0.95,
    ),
  };
}
