import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants/defaults";
import { MarbleSimulation } from "../src/core/physics/simulation";
import { calculateTrayBounds } from "../src/core/physics/tray";
import type { SimulationSettings } from "../src/types/simulation";
import { createSeededRandom, fakeNoise } from "./helpers";

const INK_COLORS = ["#A6171C", "#D6D0C5", "#F1C045"];

function findViolation(
  simulation: MarbleSimulation,
  width: number,
  height: number,
): string | null {
  for (const marble of simulation.marbles) {
    const inside =
      marble.x >= marble.radius - 1e-9 &&
      marble.x <= width - marble.radius + 1e-9 &&
      marble.y >= marble.radius - 1e-9 &&
      marble.y <= height - marble.radius + 1e-9;
    if (!inside) return `(${marble.x}, ${marble.y}) r=${marble.radius}`;
  }
  return null;
}

function runSimulation(
  settings: SimulationSettings,
  canvas: { width: number; height: number },
  steps: number,
  seed: number,
) {
  const random = createSeededRandom(seed);
  const bounds = calculateTrayBounds(canvas.width, canvas.height);
  const simulation = new MarbleSimulation(fakeNoise, random);
  simulation.rebuild(settings, INK_COLORS, bounds);

  for (let step = 0; step < steps; step++) {
    // 強い傾きを周期的に変えて、四方の壁に押し付ける
    const angle = step * 0.05;
    const gravityX = Math.cos(angle) * 1.5;
    const gravityY = Math.sin(angle * 1.3) * 1.5;
    simulation.step(settings, gravityX, gravityY, bounds);
    expect(
      findViolation(simulation, bounds.width, bounds.height),
    ).toBeNull();
  }
}

describe("ビー玉が用紙からはみ出さない", () => {
  it("既定設定で長時間動かしても全フレームで用紙内に収まる", () => {
    runSimulation(DEFAULT_SETTINGS, { width: 1440, height: 900 }, 3000, 1);
  });

  it("最大個数・最大サイズの高密度でも収まる", () => {
    runSimulation(
      { ...DEFAULT_SETTINGS, marbleCount: 36, marbleRadiusBase: 32 },
      { width: 1440, height: 900 },
      2000,
      2,
    );
  });

  it("小さなウィンドウでも収まる", () => {
    runSimulation(
      { ...DEFAULT_SETTINGS, marbleCount: 24, marbleRadiusBase: 20 },
      { width: 300, height: 300 },
      2000,
      3,
    );
  });

  it("反発係数と摩擦が最大でも収まる", () => {
    runSimulation(
      {
        ...DEFAULT_SETTINGS,
        wallBounceElasticity: 0.98,
        frictionDeceleration: 0.999,
        tiltForceMultiplier: 2,
      },
      { width: 1920, height: 1080 },
      2000,
      4,
    );
  });

  it("用紙が縮んだ後 (ウィンドウ縮小) も次のステップで収まる", () => {
    const random = createSeededRandom(5);
    const large = calculateTrayBounds(1920, 1080);
    const small = calculateTrayBounds(500, 400);
    const simulation = new MarbleSimulation(fakeNoise, random);
    simulation.rebuild(DEFAULT_SETTINGS, INK_COLORS, large);

    simulation.step(DEFAULT_SETTINGS, 0, 0, small);
    expect(
      findViolation(simulation, small.width, small.height),
    ).toBeNull();
  });
});

describe("用紙がキャンバスからはみ出さない", () => {
  const canvasSizes = [
    [300, 300],
    [375, 667],
    [800, 600],
    [1280, 720],
    [1440, 900],
    [1920, 1080],
    [2560, 1440],
    [3840, 2160],
  ];

  it.each(canvasSizes)(
    "%i x %i: 木枠込みの外形がキャンバス内",
    (width, height) => {
      const bounds = calculateTrayBounds(width, height);
      expect(
        bounds.width + bounds.borderThickness * 2,
      ).toBeLessThanOrEqual(width);
      expect(
        bounds.height + bounds.borderThickness * 2,
      ).toBeLessThanOrEqual(height);
    },
  );

  it("大画面でも上限サイズを超えない", () => {
    const bounds = calculateTrayBounds(7680, 4320);
    expect(bounds.width).toBeLessThanOrEqual(1000);
    expect(bounds.height).toBeLessThanOrEqual(700);
  });
});
