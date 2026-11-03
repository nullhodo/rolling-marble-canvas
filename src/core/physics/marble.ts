import type {
  SimulationSettings,
  TrayBounds,
} from "../../types/simulation";

export type NoiseFunction = (x: number, y?: number) => number;
export type Random = () => number;

/** 1ステップの物理更新で発生した、描画側が反応すべき出来事 */
export type PhysicsEvent =
  | {
      kind: "splash";
      marble: Marble;
      speed: number;
      turn: number;
    }
  | {
      kind: "wall";
      marble: Marble;
      impulse: number;
    }
  | {
      kind: "collision";
      marbles: [Marble, Marble];
      impulse: number;
      x: number;
      y: number;
    };

/** 用紙ローカル座標系 (0..width, 0..height) で動くビー玉 */
export class Marble {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  readonly radius: number;
  readonly mass: number;
  readonly inkColorHex: string;
  remainingInkLevel = 1.0;

  // 個体差ノイズ: 重心の偏りや真球度のズレ
  wobblePhase: number;
  readonly wobbleSpeed: number;
  readonly surfaceSeed: number;

  // 3D の自転角
  rotationAngleX: number;
  rotationAngleY: number;

  // インク付着のまだら
  inkPatchPhase: number;
  readonly inkPatchTextureOffset: number;
  rotationDistanceAccumulator = 0;
  private previousVelocityAngle = 0;

  constructor(
    x: number,
    y: number,
    radius: number,
    inkColorHex: string,
    random: Random = Math.random,
  ) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = (random() - 0.5) * 2;
    this.vy = (random() - 0.5) * 2;
    this.radius = radius;
    this.mass = radius * 0.1;
    this.inkColorHex = inkColorHex;

    this.wobblePhase = random() * Math.PI * 2;
    this.wobbleSpeed = 0.08 + random() * 0.05;
    this.surfaceSeed = random() * 1000;
    this.rotationAngleX = random() * Math.PI * 2;
    this.rotationAngleY = random() * Math.PI * 2;
    this.inkPatchPhase = random() * Math.PI * 2;
    this.inkPatchTextureOffset = random() * 500;
  }

  /** 重力傾斜・実世界ノイズ・摩擦・壁反発を1ステップ分進める */
  updatePhysics(
    gravityX: number,
    gravityY: number,
    bounds: Pick<TrayBounds, "width" | "height">,
    settings: SimulationSettings,
    noise: NoiseFunction,
  ): PhysicsEvent[] {
    const events: PhysicsEvent[] = [];
    this.prevX = this.x;
    this.prevY = this.y;

    // 重心の偏り: 進行方向に直交する微小な揺れ
    this.wobblePhase += this.wobbleSpeed;
    const currentSpeed = Math.hypot(this.vx, this.vy);
    let wobbleForceX = 0;
    let wobbleForceY = 0;
    if (currentSpeed > 0.05) {
      const normalX = -this.vy / currentSpeed;
      const normalY = this.vx / currentSpeed;
      const magnitude =
        Math.sin(this.wobblePhase) * settings.wobbleNoiseStrength * 0.35;
      wobbleForceX = normalX * magnitude;
      wobbleForceY = normalY * magnitude;
    }

    // 紙面の微細な凹凸: パーリンノイズによる局所勾配
    const surfaceAngle =
      noise(
        (this.x + this.surfaceSeed) * 0.015,
        (this.y + this.surfaceSeed) * 0.015,
      ) *
      Math.PI *
      4;
    const surfaceMagnitude = settings.surfaceNoiseStrength * 0.25;
    const surfaceForceX = Math.cos(surfaceAngle) * surfaceMagnitude;
    const surfaceForceY = Math.sin(surfaceAngle) * surfaceMagnitude;

    // インクの粘性抵抗
    const inkViscosityDrag = 1.0 - this.remainingInkLevel * 0.015;

    this.vx += gravityX + wobbleForceX + surfaceForceX;
    this.vy += gravityY + wobbleForceY + surfaceForceY;

    const damping = settings.frictionDeceleration * inkViscosityDrag;
    this.vx *= damping;
    this.vy *= damping;

    // 急旋回による遠心スプラッシュ判定
    const velocityAngle = Math.atan2(this.vy, this.vx);
    let turn = Math.abs(velocityAngle - this.previousVelocityAngle);
    if (turn > Math.PI) {
      turn = Math.abs(turn - Math.PI * 2);
    }
    this.previousVelocityAngle = velocityAngle;

    if (
      currentSpeed > 2.2 &&
      turn > 0.25 &&
      settings.splashSprayStrength > 0.05
    ) {
      events.push({
        kind: "splash",
        marble: this,
        speed: currentSpeed,
        turn,
      });
    }

    this.x += this.vx;
    this.y += this.vy;

    // 転がった距離に応じてインクが紙へ転写され減る
    const distanceTraveled = Math.hypot(
      this.x - this.prevX,
      this.y - this.prevY,
    );
    this.remainingInkLevel = Math.max(
      0.04,
      this.remainingInkLevel -
        distanceTraveled * settings.inkDecayRate * 0.01,
    );
    this.rotationDistanceAccumulator += distanceTraveled;

    const wallImpulse = this.collideWithWalls(
      bounds,
      settings.wallBounceElasticity,
    );
    if (wallImpulse > 1.2 && settings.splatterStrength > 0.05) {
      events.push({ kind: "wall", marble: this, impulse: wallImpulse });
    }

    this.rotationAngleX -= this.vy / this.radius;
    this.rotationAngleY += this.vx / this.radius;
    this.inkPatchPhase += currentSpeed / (this.radius * 0.8);

    return events;
  }

  /** 壁にめり込んだ分を戻して反発させ、衝突の強さを返す (衝突なしは0) */
  private collideWithWalls(
    bounds: Pick<TrayBounds, "width" | "height">,
    elasticity: number,
  ): number {
    let impulse = 0;
    const maxX = bounds.width - this.radius;
    const maxY = bounds.height - this.radius;

    if (this.x < this.radius || this.x > maxX) {
      this.x = this.x < this.radius ? this.radius : maxX;
      impulse = Math.abs(this.vx);
      this.vx = -this.vx * elasticity;
    }
    if (this.y < this.radius || this.y > maxY) {
      this.y = this.y < this.radius ? this.radius : maxY;
      impulse = Math.max(impulse, Math.abs(this.vy));
      this.vy = -this.vy * elasticity;
    }
    return impulse;
  }

  /** 位置を用紙内に収める (ビー玉同士の押し出しで壁を越えた場合の保険) */
  clampToBounds(bounds: Pick<TrayBounds, "width" | "height">): void {
    this.x = Math.max(
      this.radius,
      Math.min(bounds.width - this.radius, this.x),
    );
    this.y = Math.max(
      this.radius,
      Math.min(bounds.height - this.radius, this.y),
    );
  }
}
