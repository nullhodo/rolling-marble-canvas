import type { SimulationSettings } from "../../types/simulation";
import type { Marble, PhysicsEvent } from "./marble";

/** ビー玉同士の重なり解消と弾性衝突。激しい衝突はイベントとして返す */
export function resolveMarbleCollisions(
  marbles: Marble[],
  settings: SimulationSettings,
): PhysicsEvent[] {
  const events: PhysicsEvent[] = [];

  for (let first = 0; first < marbles.length; first++) {
    for (let second = first + 1; second < marbles.length; second++) {
      const marbleA = marbles[first];
      const marbleB = marbles[second];

      const dx = marbleB.x - marbleA.x;
      const dy = marbleB.y - marbleA.y;
      const distance = Math.hypot(dx, dy);
      const minimumDistance = marbleA.radius + marbleB.radius;

      if (distance >= minimumDistance || distance <= 0.001) continue;

      const overlap = minimumDistance - distance;
      const normalX = dx / distance;
      const normalY = dy / distance;

      marbleA.x -= normalX * overlap * 0.5;
      marbleA.y -= normalY * overlap * 0.5;
      marbleB.x += normalX * overlap * 0.5;
      marbleB.y += normalY * overlap * 0.5;

      const relativeVx = marbleA.vx - marbleB.vx;
      const relativeVy = marbleA.vy - marbleB.vy;
      const velocityAlongNormal =
        relativeVx * normalX + relativeVy * normalY;
      if (velocityAlongNormal <= 0) continue;

      const impulse =
        (2 * velocityAlongNormal) / (marbleA.mass + marbleB.mass);
      marbleA.vx -= impulse * marbleB.mass * normalX;
      marbleA.vy -= impulse * marbleB.mass * normalY;
      marbleB.vx += impulse * marbleA.mass * normalX;
      marbleB.vy += impulse * marbleA.mass * normalY;

      if (velocityAlongNormal > 1.4 && settings.splatterStrength > 0.05) {
        events.push({
          kind: "collision",
          marbles: [marbleA, marbleB],
          impulse: velocityAlongNormal * 0.9,
          x: marbleA.x + normalX * marbleA.radius,
          y: marbleA.y + normalY * marbleA.radius,
        });
      }
    }
  }

  return events;
}
