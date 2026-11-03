import { DropletsIcon } from "lucide-react";
import type React from "react";
import { Section } from "../ui/Section";
import { SettingSlider } from "../ui/SettingSlider";

export const InkSection: React.FC = () => (
  <Section icon={DropletsIcon} title="ビー玉 & インク・飛沫">
    <SettingSlider
      label="ビー玉の個数"
      settingKey="marbleCount"
      min={1}
      max={36}
      step={1}
      accent="accent-sky-600"
    />
    <SettingSlider
      label="ビー玉サイズ (基準半径)"
      settingKey="marbleRadiusBase"
      min={6}
      max={32}
      step={1}
      format={(value) => `${value}px`}
      accent="accent-sky-600"
    />
    <SettingSlider
      label="インク枯渇速度 (かすれ)"
      settingKey="inkDecayRate"
      min={0.0005}
      max={0.015}
      step={0.0005}
      hint="転がるにつれて絵の具が紙に移り、色がかすれていく度合い"
      accent="accent-sky-600"
    />
    <SettingSlider
      label="インク太さ・まだらゆらぎ"
      settingKey="thicknessFluctuationStrength"
      min={0}
      max={1}
      step={0.05}
      hint="球表面の絵の具付着ムラと転がり周期による、線の太さ・濃淡のゆらぎ"
      accent="accent-sky-600"
    />
    <SettingSlider
      label="旋回スプラッシュ (遠心飛沫)"
      settingKey="splashSprayStrength"
      min={0}
      max={1}
      step={0.05}
      hint="急旋回時に、粘性インクが遠心力で外側へ飛び散る量"
      accent="accent-sky-600"
    />
    <SettingSlider
      label="衝突スプラッター (壁・玉)"
      settingKey="splatterStrength"
      min={0}
      max={1}
      step={0.05}
      hint="壁やビー玉同士の衝突で放射状に飛び散るインク飛沫の量"
      accent="accent-sky-600"
    />
  </Section>
);
