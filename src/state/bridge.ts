import { getDefaultStore } from "jotai";
import type { SketchBridge } from "../core/sketch";
import { getPalette } from "../utils/palette";
import { dragStateAtom, palettesAtom, settingsAtom } from "./store";

/** p5 スケッチから jotai のストアを読み書きするための橋渡し */
export function createStoreBridge(): SketchBridge {
  const store = getDefaultStore();
  return {
    getSettings: () => store.get(settingsAtom),
    getPalette: () => {
      const settings = store.get(settingsAtom);
      return getPalette(store.get(palettesAtom), settings.paletteIndex);
    },
    patchSettings: (patch) => {
      store.set(settingsAtom, { ...store.get(settingsAtom), ...patch });
    },
    setDragState: (state) => store.set(dragStateAtom, state),
  };
}
