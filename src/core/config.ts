import { DEFAULT_SETTINGS } from "../constants/defaults";
import type {
  Palette,
  SimulationSettings,
  TrayBounds,
} from "../types/simulation";

export const SKETCH_NAME = "RollingMarbleCanvas";
const CONFIG_FORMAT_VERSION = "3.0";

type ConfigFile = {
  metadata: {
    sketch: string;
    exportedAt: string;
    formatVersion: string;
  };
  settings: SimulationSettings;
  trayBounds: TrayBounds;
  palette: Palette;
};

type ParsedConfig = {
  settings: SimulationSettings;
  palette: Palette | null;
};

export function buildConfigFile(
  settings: SimulationSettings,
  trayBounds: TrayBounds,
  palette: Palette,
  now: Date = new Date(),
): ConfigFile {
  return {
    metadata: {
      sketch: SKETCH_NAME,
      exportedAt: now.toISOString(),
      formatVersion: CONFIG_FORMAT_VERSION,
    },
    settings: { ...settings },
    trayBounds: { ...trayBounds },
    palette,
  };
}

function isPalette(value: unknown): value is Palette {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Palette>;
  return (
    typeof candidate.title === "string" &&
    Array.isArray(candidate.colors) &&
    candidate.colors.length > 0 &&
    candidate.colors.every(
      (color) =>
        typeof color?.hex === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(color.hex),
    )
  );
}

/**
 * JSON文字列から設定を復元する。
 * 既知のキーで型が一致するものだけ採用し、欠けた値は既定値で補う。
 */
export function parseConfigFile(text: string): ParsedConfig {
  const parsed: unknown = JSON.parse(text);
  const rawSettings = (parsed as { settings?: unknown } | null)?.settings;
  if (typeof rawSettings !== "object" || rawSettings === null) {
    throw new Error("settings が見つかりません");
  }

  const source = rawSettings as Record<string, unknown>;
  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const defaultValue = DEFAULT_SETTINGS[key as keyof SimulationSettings];
    if (typeof source[key] === typeof defaultValue) {
      settings[key] = source[key];
    }
  }

  const rawPalette = (parsed as { palette?: unknown }).palette;
  return {
    settings: settings as SimulationSettings,
    palette: isPalette(rawPalette) ? rawPalette : null,
  };
}
