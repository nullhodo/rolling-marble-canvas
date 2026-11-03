import { useAtomValue } from "jotai";
import { PaletteIcon, ShuffleIcon, SparklesIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  applyPalette,
  generateGradientTheme,
  pickRandomPalette,
  updateSettings,
} from "../../state/actions";
import { palettesAtom, settingsAtom } from "../../state/store";
import { getPalette } from "../../utils/palette";
import { PaletteSelect } from "../ui/PaletteSelect";
import { Section } from "../ui/Section";
import { SECONDARY_BUTTON } from "../ui/buttonStyles";

export const ColorPaletteSection: React.FC = () => {
  const settings = useAtomValue(settingsAtom);
  const palettes = useAtomValue(palettesAtom);
  const [gradientBase, setGradientBase] = useState("#1E459F");
  const palette = getPalette(palettes, settings.paletteIndex);

  return (
    <Section icon={PaletteIcon} title="配色 & パレット">
      <div className="flex gap-2">
        <PaletteSelect
          palettes={palettes}
          value={settings.paletteIndex}
          onChange={applyPalette}
        />
        <button
          type="button"
          onClick={pickRandomPalette}
          title="パレットをランダムに選ぶ"
          className={`${SECONDARY_BUTTON} px-2.5`}
        >
          <ShuffleIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[10px] text-gray-500">{palette.comment}</p>

      <div className="space-y-1">
        <span className="text-[11px] text-gray-600 font-medium block">
          用紙背景色 (パレットの色、または任意の色)
        </span>
        <div className="h-7 w-full rounded overflow-hidden flex border border-gray-300/80 shadow-inner">
          {palette.colors.map((color) => (
            <button
              key={`${color.name}-${color.hex}`}
              type="button"
              title={`${color.name}: ${color.hex}`}
              onClick={() =>
                updateSettings({ backgroundColorHex: color.hex })
              }
              className={`flex-1 h-full cursor-pointer transition ${
                color.hex.toUpperCase() ===
                settings.backgroundColorHex.toUpperCase()
                  ? "ring-2 ring-inset ring-gray-900"
                  : "hover:opacity-80"
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.backgroundColorHex.toLowerCase()}
            onChange={(event) =>
              updateSettings({ backgroundColorHex: event.target.value })
            }
            title="任意の背景色を選ぶ"
            className="w-8 h-8 rounded border border-gray-300/80 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-gray-700">
            {settings.backgroundColorHex.toUpperCase()}
          </span>
        </div>
        <p className="text-[10px] text-gray-500">
          背景と同じ色はビー玉のインク色から除外されます。任意に選んだ色は、パレットを変えても保たれます
        </p>
      </div>

      <div className="space-y-1 pt-2 border-t border-gray-200/60">
        <span className="text-[11px] text-gray-600 font-medium block">
          1色からグラデーション生成
        </span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={gradientBase}
            onChange={(event) => setGradientBase(event.target.value)}
            className="w-8 h-8 rounded border border-gray-300/80 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-gray-700 flex-1">
            {gradientBase.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={() => generateGradientTheme(gradientBase)}
            className={`${SECONDARY_BUTTON} px-2.5 py-1.5`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            生成
          </button>
        </div>
      </div>
    </Section>
  );
};
