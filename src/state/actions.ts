import { getDefaultStore } from "jotai";
import { HISTORY_MAX_LENGTH } from "../constants/defaults";
import { SKETCH_NAME, parseConfigFile } from "../core/config";
import { exportJsonSettings } from "../core/exporter";
import type { SimulationSettings } from "../types/simulation";
import { getFormattedDate } from "../utils/date";
import {
  buildGradientPalette,
  getPalette,
  resolveBackgroundOnPaletteChange,
  upsertPalette,
} from "../utils/palette";
import {
  buildModulatedSettings,
  buildRandomizedSettings,
} from "../utils/randomizer";
import {
  controllerAtom,
  historyPointerAtom,
  historyStackAtom,
  palettesAtom,
  randomTargetsAtom,
  settingsAtom,
} from "./store";
import { showToast } from "./toast";

const store = getDefaultStore();
const HISTORY_COMMIT_DELAY_MS = 400;
let historyTimer: ReturnType<typeof setTimeout> | null = null;

function currentSettings(): SimulationSettings {
  return store.get(settingsAtom);
}

/** 現在の設定を履歴に積む。直前の履歴と同じなら何もしない */
function commitHistory(): void {
  if (historyTimer) {
    clearTimeout(historyTimer);
    historyTimer = null;
  }
  const stack = store.get(historyStackAtom);
  const pointer = store.get(historyPointerAtom);
  const current = currentSettings();
  if (JSON.stringify(stack[pointer]) === JSON.stringify(current)) return;

  const next = [...stack.slice(0, pointer + 1), current].slice(
    -HISTORY_MAX_LENGTH,
  );
  store.set(historyStackAtom, next);
  store.set(historyPointerAtom, next.length - 1);
}

/** スライダー操作中の細かい変更をまとめて1回の履歴にする */
function scheduleHistoryCommit(): void {
  if (historyTimer) clearTimeout(historyTimer);
  historyTimer = setTimeout(commitHistory, HISTORY_COMMIT_DELAY_MS);
}

/** 設定を更新して履歴に積む */
export function updateSettings(patch: Partial<SimulationSettings>): void {
  store.set(settingsAtom, { ...currentSettings(), ...patch });
  scheduleHistoryCommit();
}

export function undo(): void {
  commitHistory();
  const pointer = store.get(historyPointerAtom);
  if (pointer <= 0) return;
  store.set(historyPointerAtom, pointer - 1);
  store.set(settingsAtom, store.get(historyStackAtom)[pointer - 1]);
  showToast("元に戻しました (Undo)");
}

export function redo(): void {
  commitHistory();
  const pointer = store.get(historyPointerAtom);
  const stack = store.get(historyStackAtom);
  if (pointer >= stack.length - 1) return;
  store.set(historyPointerAtom, pointer + 1);
  store.set(settingsAtom, stack[pointer + 1]);
  showToast("やり直しました (Redo)");
}

export function applyPalette(index: number): void {
  const palettes = store.get(palettesAtom);
  const settings = currentSettings();
  updateSettings({
    paletteIndex: index,
    backgroundColorHex: resolveBackgroundOnPaletteChange(
      getPalette(palettes, settings.paletteIndex),
      getPalette(palettes, index),
      settings.backgroundColorHex,
    ),
  });
}

export function pickRandomPalette(): void {
  const palettes = store.get(palettesAtom);
  const index = Math.floor(Math.random() * palettes.length);
  applyPalette(index);
  showToast(`パレット: ${palettes[index].title}`);
}

export function generateGradientTheme(baseHex: string): void {
  const palette = buildGradientPalette(baseHex);
  const result = upsertPalette(store.get(palettesAtom), palette);
  store.set(palettesAtom, result.palettes);
  applyPalette(result.index);
  showToast(`テーマ "${palette.title}" を生成・適用しました`, "success");
}

export function randomizeSelected(): void {
  const next = buildRandomizedSettings(
    currentSettings(),
    store.get(randomTargetsAtom),
    store.get(palettesAtom),
  );
  store.set(settingsAtom, next);
  scheduleHistoryCommit();
  store.get(controllerAtom)?.rebuildMarbles(true);
  showToast("選択されたパラメータをランダム設定しました");
}

/** 周期変調: 履歴には積まず、ビー玉も作り直さない */
export function modulateSettings(): void {
  store.set(settingsAtom, buildModulatedSettings(currentSettings()));
}

export function clearTrail(): void {
  store.get(controllerAtom)?.clearTrail();
  showToast("紙を交換しました");
}

export function refillInk(): void {
  store.get(controllerAtom)?.refillInk();
  showToast("全てのビー玉にインクを補充しました");
}

export function exportImage(): void {
  const baseName = store.get(controllerAtom)?.exportHighRes();
  if (baseName)
    showToast(`高解像度画像を出力しました: ${baseName}`, "success");
}

export function exportJson(): void {
  const controller = store.get(controllerAtom);
  if (!controller) return;
  const settings = currentSettings();
  exportJsonSettings(
    `${SKETCH_NAME}_${getFormattedDate()}_config.json`,
    settings,
    controller.getBounds(),
    getPalette(store.get(palettesAtom), settings.paletteIndex),
  );
}

export async function importJson(file: File): Promise<void> {
  try {
    const parsed = parseConfigFile(await file.text());
    let settings = parsed.settings;

    if (parsed.palette) {
      const result = upsertPalette(
        store.get(palettesAtom),
        parsed.palette,
      );
      store.set(palettesAtom, result.palettes);
      settings = { ...settings, paletteIndex: result.index };
    } else if (settings.paletteIndex >= store.get(palettesAtom).length) {
      settings = { ...settings, paletteIndex: 0 };
    }

    store.set(settingsAtom, settings);
    commitHistory();
    store.get(controllerAtom)?.rebuildMarbles(false);
    showToast("設定JSONを復元しました", "success");
  } catch (error) {
    console.error("[Config] JSON import failed:", error);
    showToast("無効なJSONファイルです", "error");
  }
}
