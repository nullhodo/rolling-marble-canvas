import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Palette } from "../../types/simulation";

interface Props {
  palettes: Palette[];
  value: number;
  onChange: (index: number) => void;
}

const Swatches = ({ palette }: { palette: Palette }) => (
  <span className="flex h-3.5 w-full rounded-sm overflow-hidden border border-gray-300/80">
    {palette.colors.map((color) => (
      <span
        key={`${color.name}-${color.hex}`}
        className="flex-1 h-full"
        style={{ backgroundColor: color.hex }}
      />
    ))}
  </span>
);

/** 色見本つきのパレット選択。ネイティブの select は色を表示できないため自作 */
export const PaletteSelect = ({ palettes, value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const current = palettes[value] ?? palettes[0];

  useEffect(() => {
    if (!isOpen) return;
    selectedRef.current?.scrollIntoView({ block: "nearest" });

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node))
        setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-white/70 hover:bg-white/95 border border-gray-300/80 rounded p-1.5 text-xs text-left cursor-pointer shadow-2xs transition space-y-1"
      >
        <span className="flex items-center justify-between gap-1 text-gray-900">
          <span className="truncate">
            {current.title} ({current.colors.length}色)
          </span>
          <ChevronDownIcon
            className={`w-3.5 h-3.5 flex-shrink-0 transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
        <Swatches palette={current} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto custom-scrollbar bg-white/95 backdrop-blur-xl border border-gray-300/80 rounded shadow-xl p-1">
          {palettes.map((palette, index) => {
            const isSelected = index === value;
            return (
              <button
                key={palette.title}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                aria-current={isSelected}
                onClick={() => {
                  onChange(index);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-1.5 rounded space-y-1 cursor-pointer transition ${
                  isSelected ? "bg-gray-200/80" : "hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center justify-between gap-1 text-[11px] text-gray-900">
                  <span className="truncate">
                    {palette.title} ({palette.colors.length}色)
                  </span>
                  {isSelected && (
                    <CheckIcon className="w-3 h-3 flex-shrink-0" />
                  )}
                </span>
                <Swatches palette={palette} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
