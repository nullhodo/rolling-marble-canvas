import { getDefaultStore } from "jotai";
import { SKETCH_NAME } from "../core/config";
import { exportJsonSettings } from "../core/exporter";
import { VideoRecorderManager } from "../core/recorder";
import { getFormattedDate } from "../utils/date";
import { getPalette } from "../utils/palette";
import { modulateSettings } from "./actions";
import {
  controllerAtom,
  palettesAtom,
  recordingStateAtom,
  settingsAtom,
  targetLoopsAtom,
} from "./store";
import { showToast } from "./toast";

const store = getDefaultStore();

let recorder: VideoRecorderManager | null = null;
let loopTimers: ReturnType<typeof setTimeout>[] = [];
let loopProgressTimer: ReturnType<typeof setInterval> | null = null;

function idleRecordingState() {
  return {
    isRecording: false,
    elapsedSeconds: 0,
    isLoopMode: false,
    currentLoop: 1,
    totalLoops: 1,
    loopIntervalMs: store.get(settingsAtom).modulatePeriodMilliseconds,
  };
}

function getRecorder(): VideoRecorderManager | null {
  const canvas = store.get(controllerAtom)?.getCanvas();
  if (!canvas) return null;
  if (!recorder) {
    recorder = new VideoRecorderManager(canvas, (isRecording, elapsed) => {
      store.set(recordingStateAtom, (prev) => ({
        ...prev,
        isRecording,
        elapsedSeconds: elapsed,
      }));
    });
  }
  recorder.setCanvas(canvas);
  return recorder;
}

function clearLoopTimers(): void {
  for (const timer of loopTimers) clearTimeout(timer);
  loopTimers = [];
  if (loopProgressTimer) {
    clearInterval(loopProgressTimer);
    loopProgressTimer = null;
  }
}

function saveSettingsJson(baseName: string): void {
  const controller = store.get(controllerAtom);
  if (!controller) return;
  const settings = store.get(settingsAtom);
  exportJsonSettings(
    `${baseName}.json`,
    settings,
    controller.getBounds(),
    getPalette(store.get(palettesAtom), settings.paletteIndex),
  );
}

export async function startRecording(): Promise<boolean> {
  const manager = getRecorder();
  if (!manager) return false;
  clearLoopTimers();
  const started = await manager.startRecording();
  if (started) {
    showToast("60fps 録画を開始しました [Sで停止]");
  } else {
    showToast("録画を開始できませんでした", "error");
  }
  return started;
}

export async function stopRecording(): Promise<void> {
  clearLoopTimers();
  const manager = recorder;
  if (!manager) return;
  const filename = await manager.stopRecording();
  store.set(recordingStateAtom, idleRecordingState());
  if (filename) {
    saveSettingsJson(filename.replace(/\.[^.]+$/, ""));
    showToast(`動画を保存しました (${filename})`, "success");
  }
}

/** 変調周期 × N ループぴったりの長さで録画する。各周期の境目で設定を変調する */
export async function startLoopRecording(): Promise<void> {
  const manager = getRecorder();
  if (!manager) return;
  clearLoopTimers();

  const loops = store.get(targetLoopsAtom);
  const periodMs = store.get(settingsAtom).modulatePeriodMilliseconds;

  store.set(settingsAtom, {
    ...store.get(settingsAtom),
    autoModulateEnabled: false,
  });
  store.set(recordingStateAtom, {
    isRecording: true,
    elapsedSeconds: 0,
    isLoopMode: true,
    currentLoop: 1,
    totalLoops: loops,
    loopIntervalMs: periodMs,
  });

  const started = await manager.startRecording();
  if (!started) {
    store.set(recordingStateAtom, idleRecordingState());
    showToast("録画を開始できませんでした", "error");
    return;
  }
  showToast(`${loops} Loop 録画を開始しました`);

  const startTime = performance.now();
  loopProgressTimer = setInterval(() => {
    const elapsed = performance.now() - startTime;
    store.set(recordingStateAtom, (prev) => ({
      ...prev,
      isRecording: true,
      isLoopMode: true,
      currentLoop: Math.min(loops, Math.floor(elapsed / periodMs) + 1),
      totalLoops: loops,
      loopIntervalMs: periodMs,
    }));
  }, 100);

  for (let index = 1; index < loops; index++) {
    loopTimers.push(setTimeout(modulateSettings, index * periodMs));
  }
  loopTimers.push(
    setTimeout(async () => {
      await stopLoopRecording(loops, periodMs);
    }, loops * periodMs),
  );
}

async function stopLoopRecording(
  loops: number,
  periodMs: number,
): Promise<void> {
  clearLoopTimers();
  const manager = recorder;
  if (!manager) return;
  const baseName = `${SKETCH_NAME}_${getFormattedDate()}_nloop_${loops}x${periodMs}ms`;
  const filename = await manager.stopRecording(`${baseName}.mp4`);
  store.set(recordingStateAtom, idleRecordingState());
  if (filename) {
    saveSettingsJson(baseName);
    showToast(`${loops} Loop の録画が完了しました`, "success");
  }
}
