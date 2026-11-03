import { describe, expect, it } from "vitest";
import { detectEdgeCluster } from "../src/core/physics/edgeEscape";
import { Marble } from "../src/core/physics/marble";
import { createSeededRandom } from "./helpers";

const BOUNDS = { width: 400, height: 300 };

function createMarble(x: number, y: number, speed = 0) {
  const marble = new Marble(x, y, 10, "#FF0000", createSeededRandom(1));
  marble.vx = speed;
  marble.vy = 0;
  return marble;
}

describe("壁際の溜まり検出", () => {
  it("割合に達しなければ null", () => {
    const marbles = [
      createMarble(5, 150),
      createMarble(200, 150),
      createMarble(220, 150),
      createMarble(240, 150),
    ];
    expect(detectEdgeCluster(marbles, BOUNDS, 0.5)).toBeNull();
  });

  it("左壁に溜まれば右 (中央側) を返す", () => {
    const marbles = [
      createMarble(5, 140),
      createMarble(8, 160),
      createMarble(200, 150),
    ];
    const direction = detectEdgeCluster(marbles, BOUNDS, 0.5);
    expect(direction?.x).toBeGreaterThan(0.9);
    expect(Math.abs(direction?.y ?? 1)).toBeLessThan(0.2);
  });

  it("速い玉は壁際でも数えない", () => {
    const marbles = [
      createMarble(5, 140, 3),
      createMarble(8, 160, 3),
      createMarble(200, 150),
    ];
    expect(detectEdgeCluster(marbles, BOUNDS, 0.5)).toBeNull();
  });

  it("割合が 0 なら無効", () => {
    const marbles = [createMarble(5, 140), createMarble(8, 160)];
    expect(detectEdgeCluster(marbles, BOUNDS, 0)).toBeNull();
  });
});
