export type DragMode = "tilt" | "orbit";

export type PaletteColor = {
  name: string;
  hex: string;
  rgb: [number, number, number];
};

export type Palette = {
  title: string;
  comment: string;
  colors: PaletteColor[];
};

export type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

/** Undo / Redo / JSON 保存の対象になる設定一式 */
export type SimulationSettings = {
  isThreeDimensionalView: boolean;
  isHandsVisible: boolean;
  dragInteractionMode: DragMode;
  cameraPitchDegrees: number;
  cameraYawDegrees: number;
  cameraDistancePixels: number;
  paletteIndex: number;
  backgroundColorHex: string;
  tiltForceMultiplier: number;
  frictionDeceleration: number;
  wallBounceElasticity: number;
  autoTiltEnabled: boolean;
  autoTiltIntensity: number;
  marbleCount: number;
  marbleRadiusBase: number;
  inkDecayRate: number;
  thicknessFluctuationStrength: number;
  splashSprayStrength: number;
  splatterStrength: number;
  wobbleNoiseStrength: number;
  surfaceNoiseStrength: number;
  grainTextureEnabled: boolean;
  autoModulateEnabled: boolean;
  modulatePeriodMilliseconds: number;
  debugModeEnabled: boolean;
};

export type RandomTargets = {
  color: boolean;
  physics: boolean;
  ink: boolean;
  noise: boolean;
};

/** 用紙 (トレイ内側) のサイズ。物理座標は左上原点、描画時に中心原点へ変換する */
export type TrayBounds = {
  width: number;
  height: number;
  depth: number;
  borderThickness: number;
};

export type ToastType = "info" | "success" | "error";

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

export type RecordingState = {
  isRecording: boolean;
  elapsedSeconds: number;
  isLoopMode: boolean;
  currentLoop: number;
  totalLoops: number;
  loopIntervalMs: number;
};
