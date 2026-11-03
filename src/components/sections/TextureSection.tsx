import { useAtom, useAtomValue } from "jotai";
import { LayersIcon, RepeatIcon } from "lucide-react";
import type React from "react";
import { N_LOOP_OPTIONS } from "../../constants/defaults";
import { startLoopRecording } from "../../state/recordingActions";
import {
  recordingStateAtom,
  settingsAtom,
  targetLoopsAtom,
} from "../../state/store";
import { Section } from "../ui/Section";
import { SettingSlider } from "../ui/SettingSlider";
import { SettingToggle } from "../ui/SettingToggle";
import { PRIMARY_BUTTON } from "../ui/buttonStyles";

export const TextureSection: React.FC = () => {
  const settings = useAtomValue(settingsAtom);
  const recording = useAtomValue(recordingStateAtom);
  const [targetLoops, setTargetLoops] = useAtom(targetLoopsAtom);

  return (
    <Section icon={LayersIcon} title="質感 & 周期変調ループ">
      <SettingToggle
        label="紙のざらつき質感 (グレイン)"
        settingKey="grainTextureEnabled"
      />

      <div className="space-y-2.5 pt-2 border-t border-gray-200/60">
        <SettingToggle
          label="周期自動ランダム変調"
          settingKey="autoModulateEnabled"
          hint="指定周期ごとに物理・インク設定を少しずつ揺らします"
        />
        <SettingSlider
          label="変調周期 (1ループの長さ)"
          settingKey="modulatePeriodMilliseconds"
          min={1000}
          max={12000}
          step={500}
          format={(value) => `${value}ms`}
        />

        <div className="flex items-center gap-2">
          <select
            value={targetLoops}
            onChange={(event) =>
              setTargetLoops(Number.parseInt(event.target.value, 10))
            }
            className="bg-white/70 border border-gray-300/80 text-gray-900 rounded p-1.5 text-xs focus:outline-none cursor-pointer"
          >
            {N_LOOP_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count} Loop{count > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={recording.isRecording}
            onClick={() => startLoopRecording()}
            title={`${targetLoops} × ${settings.modulatePeriodMilliseconds}ms ぴったりの動画を録画します`}
            className={`${PRIMARY_BUTTON} flex-1 py-2`}
          >
            <RepeatIcon className="w-3.5 h-3.5" />n Loop 録画
          </button>
        </div>
      </div>
    </Section>
  );
};
