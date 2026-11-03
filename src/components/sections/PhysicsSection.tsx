import { WindIcon } from "lucide-react";
import type React from "react";
import { Section } from "../ui/Section";
import { SettingSlider } from "../ui/SettingSlider";
import { SettingToggle } from "../ui/SettingToggle";

export const PhysicsSection: React.FC = () => (
  <Section icon={WindIcon} title="物理挙動 & 実世界ノイズ">
    <SettingSlider
      label="シミュレーション速度"
      settingKey="simulationSpeed"
      min={-3}
      max={4}
      step={0.05}
      logarithmic
      format={(value) => `${Number(value.toPrecision(3))}倍`}
      hint="物理とインク描画を進める速さ (対数、0.125〜16倍)。2倍以上は1フレームに複数回計算します"
      accent="accent-amber-600"
    />
    <SettingSlider
      label="トレイ傾き感度"
      settingKey="tiltForceMultiplier"
      min={0.1}
      max={2}
      step={0.05}
      hint="マウスや自動揺動によるトレイの傾斜加速度"
      accent="accent-amber-600"
    />
    <SettingSlider
      label="紙面摩擦抵抗"
      settingKey="frictionDeceleration"
      min={0.94}
      max={0.999}
      step={0.001}
      hint="値が小さいほどインクの粘りと紙の摩擦で早く減速します"
      accent="accent-amber-600"
    />
    <SettingSlider
      label="木枠の壁反発係数"
      settingKey="wallBounceElasticity"
      min={0.2}
      max={0.98}
      step={0.02}
      accent="accent-amber-600"
    />
    <SettingSlider
      label="玉の重心ブレ (蛇行)"
      settingKey="wobbleNoiseStrength"
      min={0}
      max={1}
      step={0.05}
      hint="ビー玉固有の真球度ズレによる蛇行軌跡"
      accent="accent-amber-600"
    />
    <SettingSlider
      label="紙面微細凹凸 (局所勾配)"
      settingKey="surfaceNoiseStrength"
      min={0}
      max={1}
      step={0.05}
      hint="水彩紙の微小な繊維凹凸が玉の進路を逸らす力"
      accent="accent-amber-600"
    />
    <SettingToggle
      label="自動トレイ揺動 (T)"
      settingKey="autoTiltEnabled"
      hint="手を離してもノイズでトレイが自然に傾きます"
    />
    <SettingSlider
      label="自動揺動の激しさ"
      settingKey="autoTiltIntensity"
      min={0}
      max={3}
      step={0.05}
      hint="自動揺動で、トレイが傾く強さ (1.00 が標準)"
      accent="accent-amber-600"
    />
    <SettingSlider
      label="壁際に溜まったら中央へ傾ける"
      settingKey="edgeEscapeRatio"
      min={0}
      max={1}
      step={0.05}
      format={(value) =>
        value === 0 ? "オフ" : `${Math.round(value * 100)}%以上`
      }
      hint="壁際で止まっている玉がこの割合以上になると、溜まっている側と反対へ数秒かけて傾けます"
      accent="accent-amber-600"
    />
    <SettingSlider
      label="中央へ傾ける強さ"
      settingKey="edgeEscapeStrength"
      min={0.5}
      max={4}
      step={0.1}
      accent="accent-amber-600"
    />
  </Section>
);
