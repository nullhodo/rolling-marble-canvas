import type { RgbColor } from "../types/simulation";

export function hexToRgb(hex: string): RgbColor {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((character) => character + character)
      .join("");
  }
  const parsed = Number.parseInt(sanitized, 16);
  return {
    red: (parsed >> 16) & 255,
    green: (parsed >> 8) & 255,
    blue: parsed & 255,
  };
}

export function rgbToHex(
  red: number,
  green: number,
  blue: number,
): string {
  const clamp = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)));
  return `#${[red, green, blue]
    .map((value) => clamp(value).toString(16).padStart(2, "0"))
    .join("")}`;
}
