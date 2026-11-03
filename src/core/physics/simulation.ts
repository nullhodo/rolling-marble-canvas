import type {
  SimulationSettings,
  TrayBounds,
} from "../../types/simulation";
import { resolveMarbleCollisions } from "./collisions";
import {
  Marble,
  type NoiseFunction,
  type PhysicsEvent,
  type Random,
} from "./marble";

/** ビー玉群の生成と、1フレーム分の物理ステップ。p5 に依存しない */
export class MarbleSimulation {
  marbles: Marble[] = [];

  constructor(
    private readonly noise: NoiseFunction,
    private readonly random: Random = Math.random,
  ) {}

  /** 用紙内の安全な範囲にランダム配置してビー玉を作り直す */
  rebuild(
    settings: SimulationSettings,
    inkColors: string[],
    bounds: TrayBounds,
  ): void {
    const safePadding = settings.marbleRadiusBase * 3;
    this.marbles = [];

    for (let index = 0; index < settings.marbleCount; index++) {
      const x =
        safePadding + this.random() * (bounds.width - safePadding * 2);
      const y =
        safePadding + this.random() * (bounds.height - safePadding * 2);
      const radius =
        settings.marbleRadiusBase * (0.85 + this.random() * 0.3);
      const marble = new Marble(
        x,
        y,
        radius,
        inkColors[index % inkColors.length],
        this.random,
      );
      marble.clampToBounds(bounds);
      this.marbles.push(marble);
    }
  }

  /** 物理更新 → ビー玉同士の衝突 → 用紙内への補正、の順に進める */
  step(
    settings: SimulationSettings,
    gravityX: number,
    gravityY: number,
    bounds: TrayBounds,
  ): PhysicsEvent[] {
    const events: PhysicsEvent[] = [];

    for (const marble of this.marbles) {
      events.push(
        ...marble.updatePhysics(
          gravityX,
          gravityY,
          bounds,
          settings,
          this.noise,
        ),
      );
    }

    events.push(...resolveMarbleCollisions(this.marbles, settings));

    for (const marble of this.marbles) {
      marble.clampToBounds(bounds);
    }

    return events;
  }

  refillInk(): void {
    for (const marble of this.marbles) {
      marble.remainingInkLevel = 1.0;
    }
  }
}
