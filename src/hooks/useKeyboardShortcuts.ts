import { getDefaultStore } from "jotai";
import { useEffect } from "react";
import {
  clearTrail,
  exportImage,
  randomizeSelected,
  redo,
  undo,
  updateSettings,
} from "../state/actions";
import { startRecording, stopRecording } from "../state/recordingActions";
import { isPanelOpenAtom, settingsAtom } from "../state/store";
import { showToast } from "../state/toast";

function toggleAutoTilt(): void {
  const enabled = !getDefaultStore().get(settingsAtom).autoTiltEnabled;
  updateSettings({ autoTiltEnabled: enabled });
  showToast(`自動揺動: ${enabled ? "ON" : "OFF"}`);
}

function togglePanel(): void {
  const store = getDefaultStore();
  store.set(isPanelOpenAtom, !store.get(isPanelOpenAtom));
}

/**
 * グローバルキーボードショートカット
 * Space: ランダム / H: パネル開閉 / U, Ctrl+Z: Undo / Ctrl+Shift+Z, Ctrl+Y: Redo
 * R: 録画開始 / S: 録画停止 / P: 高解像度PNG / C: 紙を交換 / T: 自動揺動の切替
 */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.ctrlKey || event.metaKey) {
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
        } else if (key === "y") {
          event.preventDefault();
          redo();
        }
        return;
      }

      const actions: Record<string, () => void> = {
        " ": randomizeSelected,
        h: togglePanel,
        u: undo,
        r: () => void startRecording(),
        s: () => void stopRecording(),
        p: exportImage,
        c: clearTrail,
        t: toggleAutoTilt,
      };
      const action = actions[key];
      if (action) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
