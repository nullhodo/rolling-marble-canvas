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

/** 2D でポインタを押している間、ビー玉を引き寄せる点 (用紙ローカル座標) */
export type PullPoint = {
  x: number;
  y: number;
  /** 引力の最大加速度 */
  strength: number;
};

/** この距離以上では引力が頭打ちになる (px) */
const PULL_FULL_DISTANCE = 260;

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
    pull?: PullPoint,
  ): PhysicsEvent[] {
    const events: PhysicsEvent[] = [];

    for (const marble of this.marbles) {
      let pullX = 0;
      let pullY = 0;
      if (pull) {
        // 近いほど弱く、遠いほど強い。真上では 0 になり、点の周りを回って落ち着く
        const dx = pull.x - marble.x;
        const dy = pull.y - marble.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0.001) {
          const magnitude =
            pull.strength * Math.min(1, distance / PULL_FULL_DISTANCE);
          pullX = (dx / distance) * magnitude;
          pullY = (dy / distance) * magnitude;
        }
      }
      events.push(
        ...marble.updatePhysics(
          gravityX + pullX,
          gravityY + pullY,
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
