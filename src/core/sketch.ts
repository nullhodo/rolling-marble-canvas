import type p5 from "p5";
import { CAMERA_LIMITS } from "../constants/defaults";
import type {
  Palette,
  SimulationSettings,
  TrayBounds,
} from "../types/simulation";
import { clamp } from "../utils/math";
import { disposeGraphics } from "../utils/p5Graphics";
import { getInkColors } from "../utils/palette";
import { exportHighResImage } from "./exporter";
import type { Marble } from "./physics/marble";
import { MarbleSimulation } from "./physics/simulation";
import { calculateTrayBounds } from "./physics/tray";
import { drawDebugOverlay } from "./render/debugRenderer";
import { drawHands3D } from "./render/handsRenderer";
import {
  paintCentrifugalSplash,
  paintSplatter,
  paintTrail,
} from "./render/inkPainter";
import { drawMarble2D, drawMarble3D } from "./render/marbleRenderer";
import {
  drawTray2D,
  drawTray3D,
  paintPaperGrain,
} from "./render/trayRenderer";

export type DragState = "idle" | "tilting" | "orbiting";

/** スケッチが React 側の状態を読み書きするための窓口 */
export type SketchBridge = {
  getSettings: () => SimulationSettings;
  getPalette: () => Palette;
  /** Undo 履歴に積まない設定更新 (カメラ操作など) */
  patchSettings: (patch: Partial<SimulationSettings>) => void;
  setDragState: (state: DragState) => void;
};

export type SketchController = {
  clearTrail: () => void;
  refillInk: () => void;
  rebuildMarbles: (preserveTrail: boolean) => void;
  exportHighRes: () => string | null;
  getCanvas: () => HTMLCanvasElement | null;
  getBounds: () => TrayBounds;
};

const MIN_CANVAS_SIZE = 300;
const REBUILD_DEBOUNCE_MS = 200;
const MANUAL_TILT_LIMIT = 1.5;
const WALL_SPLATTER_COOLDOWN_STEPS = 24;

export function createMarbleSketch(bridge: SketchBridge): {
  sketch: (p: p5) => void;
  controller: SketchController;
} {
  let canvasElement: HTMLCanvasElement | null = null;
  let simulation: MarbleSimulation | null = null;
  let trail: p5.Graphics | null = null;
  let grain: p5.Graphics | null = null;
  let bounds: TrayBounds = calculateTrayBounds(
    MIN_CANVAS_SIZE,
    MIN_CANVAS_SIZE,
  );

  // トレイ姿勢 (ラジアン) と自動傾きのノイズ位相
  let tiltPitch = 0;
  let tiltRoll = 0;
  let autoTiltTime = 0;
  let stepCount = 0;
  const lastWallSplatter = new WeakMap<Marble, number>();
  // 周期性が出ないよう、軸ごとにランダムな節点を滑らかに補間した値ノイズで揺らす
  const tiltKnots: Map<number, number>[] = [new Map(), new Map()];
  const tiltKnot = (axis: number, index: number) => {
    const knots = tiltKnots[axis];
    let value = knots.get(index);
    if (value === undefined) {
      value = Math.random() * 2 - 1;
      knots.set(index, value);
    }
    return value;
  };
  const smoothNoise = (axis: number, position: number) => {
    const index = Math.floor(position);
    const fraction = position - index;
    const eased = fraction * fraction * (3 - 2 * fraction);
    return (
      tiltKnot(axis, index) * (1 - eased) +
      tiltKnot(axis, index + 1) * eased
    );
  };
  const swing = (time: number, axis: number) =>
    (smoothNoise(axis, time * 0.9) +
      0.5 * smoothNoise(axis, time * 2.3 + 100)) /
    1.5;
  const fastForwardSteps = import.meta.env.DEV
    ? Number(new URLSearchParams(location.search).get("ff")) || 0
    : 0;
  let warmupSteps = import.meta.env.DEV
    ? Number(new URLSearchParams(location.search).get("warmup")) || 0
    : 0;

  // ポインタ操作
  let isDragging = false;
  let dragButton = 0;
  let dragWithShift = false;
  let previousPointerX = 0;
  let previousPointerY = 0;
  const manualTilt = { x: 0, y: 0 };

  // 設定変更後にビー玉を作り直すための状態
  let builtKey = "";
  let pendingKey = "";
  let pendingSince = 0;

  const rebuildKey = (settings: SimulationSettings, palette: Palette) =>
    [
      settings.marbleCount,
      settings.marbleRadiusBase,
      getInkColors(palette, settings.backgroundColorHex).join(""),
    ].join("|");

  const rebuildMarbles = (preserveTrail: boolean) => {
    if (!simulation) return;
    const settings = bridge.getSettings();
    const palette = bridge.getPalette();
    simulation.rebuild(
      settings,
      getInkColors(palette, settings.backgroundColorHex),
      bounds,
    );
    builtKey = rebuildKey(settings, palette);
    pendingKey = builtKey;
    if (!preserveTrail) trail?.clear();
  };

  const controller: SketchController = {
    clearTrail: () => trail?.clear(),
    refillInk: () => simulation?.refillInk(),
    rebuildMarbles,
    exportHighRes: () => {
      if (!simulation || !trail) return null;
      return exportHighResImage({
        settings: bridge.getSettings(),
        bounds,
        palette: bridge.getPalette(),
        trail,
      });
    },
    getCanvas: () => canvasElement,
    getBounds: () => bounds,
  };

  const sketch = (p: p5) => {
    simulation = new MarbleSimulation((x, y) => p.noise(x, y));

    const canvasSize = () => ({
      width: Math.max(MIN_CANVAS_SIZE, p.windowWidth),
      height: Math.max(MIN_CANVAS_SIZE, p.windowHeight),
    });

    const rebuildPaperBuffers = () => {
      const previousTrail = trail;
      trail = p.createGraphics(bounds.width, bounds.height);
      trail.clear();
      if (previousTrail) {
        trail.image(previousTrail, 0, 0, bounds.width, bounds.height);
        disposeGraphics(previousTrail);
      }

      if (grain) disposeGraphics(grain);
      grain = p.createGraphics(bounds.width, bounds.height);
      paintPaperGrain(grain);
    };

    const updateManualTilt = () => {
      const normalizedX = (p.mouseX - p.width * 0.5) / (p.width * 0.5);
      const normalizedY = (p.mouseY - p.height * 0.5) / (p.height * 0.5);
      manualTilt.x = clamp(
        normalizedX * 1.5,
        -MANUAL_TILT_LIMIT,
        MANUAL_TILT_LIMIT,
      );
      manualTilt.y = clamp(
        normalizedY * 1.5,
        -MANUAL_TILT_LIMIT,
        MANUAL_TILT_LIMIT,
      );
    };

    const isTiltDrag = (settings: SimulationSettings) =>
      dragButton === 0 &&
      settings.dragInteractionMode === "tilt" &&
      !dragWithShift;

    const applyLights = () => {
      p.ambientLight(135, 135, 145);
      p.directionalLight(215, 208, 196, 0.4, -0.6, -0.8);
      p.pointLight(150, 146, 140, 0, 200, 400);
    };

    const applyCamera = (settings: SimulationSettings) => {
      if (settings.isThreeDimensionalView) {
        p.perspective(Math.PI / 3.4, p.width / p.height, 10, 6000);

        // 球面座標でカメラ位置を決める。用紙は XY 平面、天面は +Z。p5 は画面の下が +Y なので、Up は (0, 0, -1)
        const yaw = (settings.cameraYawDegrees * Math.PI) / 180;
        const pitch = (settings.cameraPitchDegrees * Math.PI) / 180;
        const distance = settings.cameraDistancePixels;
        p.camera(
          distance * Math.sin(yaw) * Math.cos(pitch),
          distance * Math.cos(yaw) * Math.cos(pitch),
          distance * Math.sin(pitch),
          0,
          0,
          0,
          0,
          0,
          -1,
        );

        applyLights();
      } else {
        // 真上から見下ろす。p5 の既定どおり、Y 軸正が画面下
        p.ortho(
          -p.width / 2,
          p.width / 2,
          -p.height / 2,
          p.height / 2,
          0.1,
          4000,
        );
        p.camera(0, 0, 1000, 0, 0, 0, 0, 1, 0);
        p.ambientLight(255, 255, 255);
      }
    };

    p.setup = () => {
      const size = canvasSize();
      const canvas = p.createCanvas(size.width, size.height, p.WEBGL);
      p.pixelDensity(window.devicePixelRatio || 1);
      p.frameRate(60);

      const element = canvas.elt as HTMLCanvasElement;
      canvasElement = element;
      element.addEventListener("contextmenu", (event) =>
        event.preventDefault(),
      );
      element.addEventListener(
        "wheel",
        (event) => {
          const settings = bridge.getSettings();
          if (!settings.isThreeDimensionalView) return;
          event.preventDefault();
          bridge.patchSettings({
            cameraDistancePixels: clamp(
              settings.cameraDistancePixels + event.deltaY * 1.2,
              CAMERA_LIMITS.distanceMin,
              CAMERA_LIMITS.distanceMax,
            ),
          });
        },
        { passive: false },
      );

      bounds = calculateTrayBounds(p.width, p.height);
      rebuildPaperBuffers();
      rebuildMarbles(false);
    };

    p.windowResized = () => {
      const size = canvasSize();
      p.resizeCanvas(size.width, size.height);
      bounds = calculateTrayBounds(p.width, p.height);
      rebuildPaperBuffers();
    };

    p.mousePressed = (event?: object) => {
      if ((event as MouseEvent | undefined)?.target !== canvasElement)
        return;
      const mouseEvent = event as MouseEvent;
      const settings = bridge.getSettings();

      isDragging = true;
      dragButton = mouseEvent.button;
      dragWithShift = mouseEvent.shiftKey;
      previousPointerX = p.mouseX;
      previousPointerY = p.mouseY;

      if (isTiltDrag(settings)) updateManualTilt();
      bridge.setDragState(isTiltDrag(settings) ? "tilting" : "orbiting");
    };

    p.mouseDragged = () => {
      if (!isDragging) return;
      const settings = bridge.getSettings();
      const deltaX = p.mouseX - previousPointerX;
      const deltaY = p.mouseY - previousPointerY;
      previousPointerX = p.mouseX;
      previousPointerY = p.mouseY;

      if (settings.isThreeDimensionalView && !isTiltDrag(settings)) {
        let yaw = settings.cameraYawDegrees - deltaX * 0.45;
        if (yaw > 180) yaw -= 360;
        if (yaw < -180) yaw += 360;
        bridge.patchSettings({
          cameraYawDegrees: yaw,
          cameraPitchDegrees: clamp(
            settings.cameraPitchDegrees + deltaY * 0.45,
            CAMERA_LIMITS.pitchMin,
            CAMERA_LIMITS.pitchMax,
          ),
        });
      } else {
        updateManualTilt();
      }
    };

    p.mouseReleased = () => {
      if (!isDragging) return;
      isDragging = false;
      manualTilt.x = 0;
      manualTilt.y = 0;
      bridge.setDragState("idle");
    };

    const advance = (
      settings: SimulationSettings,
      gravityX: number,
      gravityY: number,
    ) => {
      if (!simulation) return;
      stepCount++;
      const events = simulation.step(settings, gravityX, gravityY, bounds);
      const noise = (x: number, y?: number) => p.noise(x, y);
      if (!trail) return;
      for (const marble of simulation.marbles) {
        paintTrail(trail, marble, settings, noise);
      }
      for (const event of events) {
        if (event.kind === "splash") {
          paintCentrifugalSplash(
            trail,
            event.marble,
            event.speed,
            event.turn,
            settings,
          );
        } else if (event.kind === "wall") {
          const last =
            lastWallSplatter.get(event.marble) ?? Number.NEGATIVE_INFINITY;
          if (stepCount - last < WALL_SPLATTER_COOLDOWN_STEPS) continue;
          lastWallSplatter.set(event.marble, stepCount);
          paintSplatter(trail, event.marble, event.impulse, settings);
        } else {
          for (const marble of event.marbles) {
            paintSplatter(trail, marble, event.impulse, settings, event);
          }
        }
      }
    };

    p.draw = () => {
      if (p.width <= 0 || p.height <= 0 || !simulation) return;

      const settings = bridge.getSettings();
      const palette = bridge.getPalette();
      p.background(62, 63, 70);

      // パレット・個数・サイズが変わったら、入力が落ち着いてからビー玉を作り直す
      const key = rebuildKey(settings, palette);
      if (key !== pendingKey) {
        pendingKey = key;
        pendingSince = p.millis();
      } else if (
        key !== builtKey &&
        p.millis() - pendingSince > REBUILD_DEBOUNCE_MS
      ) {
        rebuildMarbles(true);
      }

      // 1. トレイ傾斜 (自動揺動 + 手動ドラッグ) と、2. 物理更新・インク描画
      const steps = 1 + warmupSteps + fastForwardSteps;
      warmupSteps = 0;
      let gravityX = 0;
      let gravityY = 0;
      for (let step = 0; step < steps; step++) {
        gravityX = 0;
        gravityY = 0;
        if (settings.autoTiltEnabled) {
          autoTiltTime += 0.018;
          // X と Y を、位相の違う正弦波の合成で動かす。平均が 0 なので傾く向きが偏らない
          const strength =
            settings.tiltForceMultiplier * settings.autoTiltIntensity;
          gravityX += swing(autoTiltTime, 0) * strength;
          gravityY += swing(autoTiltTime, 1) * strength;
        }
        if (isDragging && isTiltDrag(settings)) {
          gravityX += manualTilt.x * settings.tiltForceMultiplier * 0.8;
          gravityY += manualTilt.y * settings.tiltForceMultiplier * 0.8;
        }
        advance(settings, gravityX, gravityY);
      }

      const targetRoll = (gravityX / settings.tiltForceMultiplier) * 0.16;
      const targetPitch =
        -(gravityY / settings.tiltForceMultiplier) * 0.16;
      tiltRoll += (targetRoll - tiltRoll) * 0.12;
      tiltPitch += (targetPitch - tiltPitch) * 0.12;

      // 3. カメラ・ライティング・シーン描画
      applyCamera(settings);
      const layers = {
        trail,
        grain,
        grainEnabled: settings.grainTextureEnabled,
        backgroundHex: settings.backgroundColorHex,
      };

      p.push();
      if (settings.isThreeDimensionalView) {
        // 手でトレイを傾けているような姿勢回転
        p.rotateX(tiltPitch);
        p.rotateY(tiltRoll);
        drawTray3D(p, bounds, layers);
        // 手を先に描く。ビー玉の鏡面材質が手に残って白飛びするため
        if (settings.isHandsVisible) drawHands3D(p, bounds);
        for (const marble of simulation.marbles) {
          drawMarble3D(p, marble, bounds.width, bounds.height);
        }
      } else {
        drawTray2D(p, bounds, layers);
        for (const marble of simulation.marbles) {
          drawMarble2D(p, marble, bounds.width, bounds.height);
        }
      }
      p.pop();

      if (settings.debugModeEnabled) {
        drawDebugOverlay(p, settings, gravityX, gravityY);
      }
    };
  };

  return { sketch, controller };
}
