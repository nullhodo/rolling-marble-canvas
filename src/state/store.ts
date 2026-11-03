import { atom } from "jotai";
import {
  DEFAULT_RANDOM_TARGETS,
  DEFAULT_SETTINGS,
} from "../constants/defaults";
import { PRESET_PALETTES } from "../constants/palettes";
import type { SketchController } from "../core/sketch";
import type { DragState } from "../core/sketch";
import type {
  Palette,
  RandomTargets,
  RecordingState,
  SimulationSettings,
  Toast,
} from "../types/simulation";

const INITIAL_SETTINGS: SimulationSettings = {
  ...DEFAULT_SETTINGS,
  isThreeDimensionalView:
    !import.meta.env.DEV ||
    new URLSearchParams(location.search).get("view") !== "2d",
};

export const settingsAtom = atom<SimulationSettings>(INITIAL_SETTINGS);
export const palettesAtom = atom<Palette[]>(PRESET_PALETTES);

export const historyStackAtom = atom<SimulationSettings[]>([
  DEFAULT_SETTINGS,
]);
export const historyPointerAtom = atom<number>(0);

export const randomTargetsAtom = atom<RandomTargets>(
  DEFAULT_RANDOM_TARGETS,
);

export const isPanelOpenAtom = atom<boolean>(
  !import.meta.env.DEV ||
    new URLSearchParams(location.search).get("panel") !== "0",
);
export const dragStateAtom = atom<DragState>("idle");
export const toastsAtom = atom<Toast[]>([]);

export const recordingStateAtom = atom<RecordingState>({
  isRecording: false,
  elapsedSeconds: 0,
  isLoopMode: false,
  currentLoop: 1,
  totalLoops: 1,
  loopIntervalMs: 4000,
});
export const targetLoopsAtom = atom<number>(2);

/** p5 スケッチ側の操作ハンドル。setup 完了までは null */
export const controllerAtom = atom<SketchController | null>(null);
