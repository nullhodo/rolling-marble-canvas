import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import {
  DicesIcon,
  Redo2Icon,
  SettingsIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import {
  randomizeSelected,
  redo,
  undo,
  updateSettings,
} from "../state/actions";
import {
  historyPointerAtom,
  historyStackAtom,
  isPanelOpenAtom,
  randomTargetsAtom,
  settingsAtom,
} from "../state/store";
import type {
  RandomTargets,
  SimulationSettings,
} from "../types/simulation";
import { ColorPaletteSection } from "./sections/ColorPaletteSection";
import { ExportSection } from "./sections/ExportSection";
import { InkSection } from "./sections/InkSection";
import { PhysicsSection } from "./sections/PhysicsSection";
import { TextureSection } from "./sections/TextureSection";
import { ViewSection } from "./sections/ViewSection";
import { SECONDARY_BUTTON } from "./ui/buttonStyles";

const RANDOM_TARGET_LABELS: { key: keyof RandomTargets; label: string }[] =
  [
    { key: "color", label: "配色" },
    { key: "physics", label: "物理特性" },
    { key: "ink", label: "玉・インク" },
    { key: "noise", label: "実世界ノイズ" },
  ];

const RANDOM_OPTION_LABELS: {
  key: "keepBackgroundOnRandomize" | "replacePaperOnRandomize";
  label: string;
}[] = [
  { key: "keepBackgroundOnRandomize", label: "紙の背景色を維持" },
  { key: "replacePaperOnRandomize", label: "紙を交換" },
];

export const ControlPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useAtom(isPanelOpenAtom);
  const [randomTargets, setRandomTargets] = useAtom(randomTargetsAtom);
  const settings = useAtomValue(settingsAtom);
  const historyStack = useAtomValue(historyStackAtom);
  const historyPointer = useAtomValue(historyPointerAtom);

  const canUndo = historyPointer > 0;
  const canRedo = historyPointer < historyStack.length - 1;

  const panelRef = useRef<HTMLDivElement>(null);

  // パネル外のクリックで閉じる
  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      if (!isOpen) return;
      const path = event.composedPath?.() ?? [];
      if (
        panelRef.current &&
        (path.includes(panelRef.current) ||
          panelRef.current.contains(event.target as Node))
      ) {
        return;
      }
      setIsOpen(false);
    };

    window.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      window.removeEventListener("pointerdown", handleOutsidePointer);
  }, [isOpen, setIsOpen]);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="ツール設定 (H)"
          aria-label="ツール設定を開く"
          className="absolute top-4 left-4 z-50 bg-white/70 hover:bg-white/90 text-gray-800 hover:text-gray-950 p-2.5 rounded-md shadow-lg backdrop-blur-md border border-white/50 transition-all flex items-center justify-center cursor-pointer active:scale-95"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div
            ref={panelRef}
            className="absolute top-4 left-4 bottom-4 flex items-start gap-3 z-40 pointer-events-none"
          >
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-96 h-full bg-white/65 backdrop-blur-xl text-gray-900 rounded-md shadow-2xl border border-white/50 flex flex-col overflow-hidden pointer-events-auto"
            >
              <div className="p-3.5 border-b border-gray-200/50 flex items-center justify-between bg-white/40 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4 text-gray-800" />
                  <span className="text-xs font-bold tracking-wide text-gray-900">
                    ツール設定
                  </span>
                  {import.meta.env.DEV && (
                    <span className="bg-amber-100/90 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px] leading-none select-none">
                      DEV
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-900 p-1 rounded hover:bg-gray-200/50 transition cursor-pointer"
                  title="パネルを閉じる (H)"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-white/40 backdrop-blur-md border-b border-gray-200/50 space-y-2 flex-shrink-0 shadow-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={randomizeSelected}
                    title="選択された対象パラメータをランダム設定します (スペースキー)"
                    className="flex-1 bg-gray-900/90 hover:bg-gray-900 active:scale-[0.99] text-white py-2 px-3 rounded font-bold transition flex items-center justify-center gap-2 cursor-pointer text-xs shadow-sm"
                  >
                    <DicesIcon className="w-4 h-4" />
                    <span>ランダム実行 (Space)</span>
                  </button>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={!canUndo}
                      onClick={undo}
                      title="元に戻す (Ctrl+Z)"
                      className={`${SECONDARY_BUTTON} px-2 py-1.5`}
                    >
                      <Undo2Icon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!canRedo}
                      onClick={redo}
                      title="やり直す (Ctrl+Y)"
                      className={`${SECONDARY_BUTTON} px-2 py-1.5`}
                    >
                      <Redo2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1 text-[10px] text-gray-700 font-medium">
                  {RANDOM_TARGET_LABELS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={randomTargets[key]}
                        onChange={(event) =>
                          setRandomTargets({
                            ...randomTargets,
                            [key]: event.target.checked,
                          })
                        }
                        className="w-3 h-3 accent-emerald-600 cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-700 font-medium">
                  {RANDOM_OPTION_LABELS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={(event) =>
                          updateSettings({
                            [key]: event.target.checked,
                          } as Partial<SimulationSettings>)
                        }
                        className="w-3 h-3 accent-emerald-600 cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
                <ViewSection />
                <ColorPaletteSection />
                <InkSection />
                <PhysicsSection />
                <TextureSection />
                <ExportSection />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
