import type {
  RandomTargets,
  SimulationSettings,
} from "../types/simulation";

export const DEFAULT_SETTINGS: SimulationSettings = {
  isThreeDimensionalView: true,
  isHandsVisible: true,
  dragInteractionMode: "tilt",
  cameraPitchDegrees: 50,
  cameraYawDegrees: 0,
  cameraDistancePixels: 980,
  paletteIndex: 1,
  backgroundColorHex: "#E1DCCA",
  tiltForceMultiplier: 0.65,
  frictionDeceleration: 0.985,
  wallBounceElasticity: 0.75,
  autoTiltEnabled: true,
  autoTiltIntensity: 1,
  simulationSpeed: 1,
  marbleCount: 12,
  marbleRadiusBase: 14,
  inkDecayRate: 0.0035,
  thicknessFluctuationStrength: 0.68,
  splashSprayStrength: 0.65,
  splatterStrength: 0.7,
  wobbleNoiseStrength: 0.45,
  surfaceNoiseStrength: 0.7,
  grainTextureEnabled: true,
  autoModulateEnabled: false,
  modulatePeriodMilliseconds: 4000,
  keepBackgroundOnRandomize: false,
  replacePaperOnRandomize: false,
  debugModeEnabled: false,
};

export const DEFAULT_RANDOM_TARGETS: RandomTargets = {
  color: true,
  physics: true,
  ink: true,
  noise: true,
};

export const CAMERA_LIMITS = {
  pitchMin: -85,
  pitchMax: 85,
  distanceMin: 400,
  distanceMax: 2200,
} as const;

export const HISTORY_MAX_LENGTH = 30;
export const N_LOOP_OPTIONS = [1, 2, 4] as const;
