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
  /** 対数スケール。min / max / step は設定値ではなく log2 の値で指定する */
  logarithmic?: boolean;
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
  logarithmic = false,
}) => {
  const value = useAtomValue(settingsAtom)[settingKey];
  const display = format ? format(value) : value.toFixed(decimalsOf(step));
  const sliderValue = logarithmic ? Math.log2(value) : value;

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
        value={sliderValue}
        onChange={(event) => {
          const raw = Number.parseFloat(event.target.value);
          updateSettings({ [settingKey]: logarithmic ? 2 ** raw : raw });
        }}
        className={`w-full ${accent} bg-gray-200 rounded h-1.5 cursor-pointer`}
      />
    </div>
  );
};
