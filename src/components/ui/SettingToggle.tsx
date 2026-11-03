import { useAtomValue } from "jotai";
import type React from "react";
import { updateSettings } from "../../state/actions";
import { settingsAtom } from "../../state/store";
import type { SimulationSettings } from "../../types/simulation";

type BooleanKey = {
  [K in keyof SimulationSettings]: SimulationSettings[K] extends boolean
    ? K
    : never;
}[keyof SimulationSettings];

interface Props {
  label: string;
  settingKey: BooleanKey;
  hint?: string;
}

export const SettingToggle: React.FC<Props> = ({
  label,
  settingKey,
  hint,
}) => {
  const checked = useAtomValue(settingsAtom)[settingKey];

  return (
    <label
      className="flex items-center justify-between text-[11px] text-gray-700 font-medium cursor-pointer"
      title={hint}
    >
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          updateSettings({ [settingKey]: event.target.checked })
        }
        className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
      />
    </label>
  );
};
