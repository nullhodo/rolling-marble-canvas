import { useAtomValue } from "jotai";
import {
  BugIcon,
  FileCodeIcon,
  FileDownIcon,
  FileUpIcon,
  ImageDownIcon,
  PaintbrushIcon,
  SquareIcon,
  VideoIcon,
} from "lucide-react";
import type React from "react";
import {
  clearTrail,
  exportImage,
  exportJson,
  importJson,
  refillInk,
  updateSettings,
} from "../../state/actions";
import {
  startRecording,
  stopRecording,
} from "../../state/recordingActions";
import { recordingStateAtom, settingsAtom } from "../../state/store";
import { Section } from "../ui/Section";
import {
  DANGER_BUTTON,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../ui/buttonStyles";

export const ExportSection: React.FC = () => {
  const settings = useAtomValue(settingsAtom);
  const recording = useAtomValue(recordingStateAtom);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) importJson(file);
    event.target.value = "";
  };

  return (
    <Section icon={FileCodeIcon} title="出力 & 管理">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={clearTrail}
          title="紙を交換 (C)"
          className={`${SECONDARY_BUTTON} py-1.5`}
        >
          <PaintbrushIcon className="w-3.5 h-3.5" />
          紙を交換 (C)
        </button>
        <button
          type="button"
          onClick={refillInk}
          className={`${SECONDARY_BUTTON} py-1.5`}
        >
          インクを補充
        </button>
      </div>

      <button
        type="button"
        onClick={exportImage}
        title="高解像度PNGと設定JSONを保存 (P)"
        className={`${PRIMARY_BUTTON} w-full py-2`}
      >
        <ImageDownIcon className="w-4 h-4" />
        高解像度 PNG + JSON (P)
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={recording.isRecording}
          onClick={() => startRecording()}
          title="録画開始 (R)"
          className={`${DANGER_BUTTON} py-1.5`}
        >
          <VideoIcon className="w-3.5 h-3.5" />
          録画開始 (R)
        </button>
        <button
          type="button"
          disabled={!recording.isRecording}
          onClick={() => stopRecording()}
          title="録画停止・保存 (S)"
          className={`${SECONDARY_BUTTON} py-1.5`}
        >
          <SquareIcon className="w-3.5 h-3.5" />
          停止・保存 (S)
        </button>
      </div>
      <p className="text-[10px] text-gray-500 text-center">
        60fps MP4 (H.264) / 保存時に設定JSONを自動付与
      </p>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
        <button
          type="button"
          onClick={exportJson}
          className={`${SECONDARY_BUTTON} py-1.5`}
        >
          <FileDownIcon className="w-3.5 h-3.5" />
          JSON 保存
        </button>
        <label className={`${SECONDARY_BUTTON} py-1.5`}>
          <FileUpIcon className="w-3.5 h-3.5" />
          JSON 読込
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() =>
          updateSettings({ debugModeEnabled: !settings.debugModeEnabled })
        }
        className={`${SECONDARY_BUTTON} w-full py-1.5 ${
          settings.debugModeEnabled
            ? "ring-1 ring-gray-900 bg-white/95"
            : ""
        }`}
      >
        <BugIcon className="w-3.5 h-3.5" />
        物理デバッグ表示: {settings.debugModeEnabled ? "ON" : "OFF"}
      </button>
    </Section>
  );
};
