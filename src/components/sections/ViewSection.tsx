import { useAtomValue } from "jotai";
import { EyeIcon, RotateCcwIcon } from "lucide-react";
import type React from "react";
import { CAMERA_LIMITS, DEFAULT_SETTINGS } from "../../constants/defaults";
import { updateSettings } from "../../state/actions";
import { settingsAtom } from "../../state/store";
import { showToast } from "../../state/toast";
import type { DragMode } from "../../types/simulation";
import { Section } from "../ui/Section";
import { SegmentedControl } from "../ui/SegmentedControl";
import { SettingSlider } from "../ui/SettingSlider";
import { SettingToggle } from "../ui/SettingToggle";
import { SECONDARY_BUTTON } from "../ui/buttonStyles";

const VIEW_OPTIONS = [
  { value: "2d", label: "2D 俯瞰" },
  { value: "3d", label: "3D 視界" },
] as const;

const DRAG_OPTIONS: { value: DragMode; label: string }[] = [
  { value: "tilt", label: "トレイ傾け" },
  { value: "orbit", label: "カメラ回転" },
];

export const ViewSection: React.FC = () => {
  const settings = useAtomValue(settingsAtom);

  const resetCamera = () => {
    updateSettings({
      cameraPitchDegrees: DEFAULT_SETTINGS.cameraPitchDegrees,
      cameraYawDegrees: DEFAULT_SETTINGS.cameraYawDegrees,
      cameraDistancePixels: DEFAULT_SETTINGS.cameraDistancePixels,
    });
    showToast("カメラ視点をリセットしました");
  };

  return (
    <Section icon={EyeIcon} title="視界 & カメラ">
      <SegmentedControl
        options={[...VIEW_OPTIONS]}
        value={settings.isThreeDimensionalView ? "3d" : "2d"}
        onChange={(value) =>
          updateSettings({ isThreeDimensionalView: value === "3d" })
        }
      />

      {settings.isThreeDimensionalView && (
        <div className="space-y-1">
          <span className="text-[11px] text-gray-600 font-medium block">
            左ボタンドラッグの動作
          </span>
          <SegmentedControl
            options={DRAG_OPTIONS}
            value={settings.dragInteractionMode}
            onChange={(value) =>
              updateSettings({ dragInteractionMode: value })
            }
          />
        </div>
      )}

      {settings.isThreeDimensionalView && (
        <SettingToggle
          label="台を持つ手を表示"
          settingKey="isHandsVisible"
          hint="トレイの左右を握る両手を表示します"
        />
      )}

      {settings.isThreeDimensionalView && (
        <div className="space-y-2.5 pt-2 border-t border-gray-200/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-700 font-medium">
              カメラ視点
            </span>
            <button
              type="button"
              onClick={resetCamera}
              className={`${SECONDARY_BUTTON} px-2 py-1 text-[10px]`}
            >
              <RotateCcwIcon className="w-3 h-3" />
              リセット
            </button>
          </div>
          <SettingSlider
            label="見下ろし仰角 (Pitch)"
            settingKey="cameraPitchDegrees"
            min={CAMERA_LIMITS.pitchMin}
            max={CAMERA_LIMITS.pitchMax}
            step={1}
            format={(value) => `${Math.round(value)}°`}
          />
          <SettingSlider
            label="水平旋回角 (Yaw)"
            settingKey="cameraYawDegrees"
            min={-180}
            max={180}
            step={1}
            format={(value) => `${Math.round(value)}°`}
          />
          <SettingSlider
            label="カメラ距離 (Zoom)"
            settingKey="cameraDistancePixels"
            min={CAMERA_LIMITS.distanceMin}
            max={CAMERA_LIMITS.distanceMax}
            step={20}
            format={(value) => `${Math.round(value)}px`}
            hint="キャンバス上のマウスホイールでも調整できます"
          />
        </div>
      )}
    </Section>
  );
};
