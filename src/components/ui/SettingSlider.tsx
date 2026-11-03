import { useAtomValue } from "jotai";
import type React from "react";
import { updateSettings } from "../../state/actions";
import { settingsAtom } from "../../state/store";
import type { SimulationSettings } from "../../types/simulation";

type NumericKey = {
  [K in keyof SimulationSettings]: SimulationSettings[K] extends number
    ? K
    : never;
}[keyof SimulationSettings];

interface Props {
  label: string;
  settingKey: NumericKey;
  min: number;
  max: number;
  step: number;
  /** 値の表示形式。省略時は step から小数桁を決める */
  format?: (value: number) => string;
  hint?: string;
  accent?: string;
}

function decimalsOf(step: number): number {
  const text = step.toString();
  return text.includes(".") ? text.split(".")[1].length : 0;
}

export const SettingSlider: React.FC<Props> = ({
  label,
  settingKey,
  min,
  max,
  step,
  format,
  hint,
  accent = "accent-emerald-600",
}) => {
  const value = useAtomValue(settingsAtom)[settingKey];
  const display = format ? format(value) : value.toFixed(decimalsOf(step));

  return (
    <div className="space-y-1" title={hint}>
      <div className="flex justify-between text-[11px] text-gray-600 font-medium">
        <span>{label}</span>
        <span className="text-gray-900 font-mono">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          updateSettings({
            [settingKey]: Number.parseFloat(event.target.value),
          })
        }
        className={`w-full ${accent} bg-gray-200 rounded h-1.5 cursor-pointer`}
      />
    </div>
  );
};
