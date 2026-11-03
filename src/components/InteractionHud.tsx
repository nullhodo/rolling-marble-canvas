import { useAtomValue } from "jotai";
import type React from "react";
import { dragStateAtom, settingsAtom } from "../state/store";

const DRAG_LABELS = {
  idle: "待機中",
  tilting: "トレイ傾斜操作中",
  orbiting: "3Dカメラ旋回中",
} as const;

/** 画面上部中央の操作ヒント。3D 表示のときだけ出す */
export const InteractionHud: React.FC = () => {
  const settings = useAtomValue(settingsAtom);
  const dragState = useAtomValue(dragStateAtom);

  if (!settings.isThreeDimensionalView) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/65 backdrop-blur-xl border border-white/50 rounded-md shadow-lg text-[11px] text-gray-700 pointer-events-none">
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          dragState === "idle"
            ? "bg-gray-200/80 text-gray-700"
            : "bg-gray-900/90 text-white animate-pulse"
        }`}
      >
        {DRAG_LABELS[dragState]}
      </span>
      <span className="text-gray-400">|</span>
      <span>
        右ドラッグ / Shift+ドラッグ:{" "}
        <strong className="text-gray-900">カメラ回転</strong>
      </span>
      <span className="text-gray-400">|</span>
      <span>
        ホイール: <strong className="text-gray-900">ズーム</strong>
      </span>
    </div>
  );
};
