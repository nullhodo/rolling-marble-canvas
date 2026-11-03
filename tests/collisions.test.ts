import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants/defaults";
import { resolveMarbleCollisions } from "../src/core/physics/collisions";
import { Marble } from "../src/core/physics/marble";
import { createSeededRandom } from "./helpers";

function createMarble(x: number, y: number, vx: number, vy: number) {
  const marble = new Marble(x, y, 10, "#FF0000", createSeededRandom(1));
  marble.vx = vx;
  marble.vy = vy;
  return marble;
}

describe("ビー玉同士の衝突", () => {
  it("重なりが解消される", () => {
    const a = createMarble(100, 100, 0, 0);
    const b = createMarble(110, 100, 0, 0);
    resolveMarbleCollisions([a, b], DEFAULT_SETTINGS);
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeGreaterThanOrEqual(
      20 - 1e-9,
    );
  });

  it("正面衝突で速度が入れ替わる (同質量)", () => {
    const a = createMarble(100, 100, 2, 0);
    const b = createMarble(119, 100, -2, 0);
    resolveMarbleCollisions([a, b], DEFAULT_SETTINGS);
    expect(a.vx).toBeCloseTo(-2);
    expect(b.vx).toBeCloseTo(2);
  });

  it("離れていく玉には力積を与えない", () => {
    const a = createMarble(100, 100, -1, 0);
    const b = createMarble(119, 100, 1, 0);
    resolveMarbleCollisions([a, b], DEFAULT_SETTINGS);
    expect(a.vx).toBe(-1);
    expect(b.vx).toBe(1);
  });

  it("強い衝突だけ飛沫イベントを返す", () => {
    const strong = resolveMarbleCollisions(
      [createMarble(100, 100, 3, 0), createMarble(119, 100, -3, 0)],
      DEFAULT_SETTINGS,
    );
    const weak = resolveMarbleCollisions(
      [createMarble(100, 100, 0.3, 0), createMarble(119, 100, -0.3, 0)],
      DEFAULT_SETTINGS,
    );
    expect(strong).toHaveLength(1);
    expect(weak).toHaveLength(0);
  });
});
