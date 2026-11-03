import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { modulateSettings } from "../state/actions";
import { settingsAtom } from "../state/store";

/** 「周期自動ランダム変調」が有効の間、一定周期で設定を揺らす */
export function useAutoModulation(): void {
  const { autoModulateEnabled, modulatePeriodMilliseconds } =
    useAtomValue(settingsAtom);

  useEffect(() => {
    if (!autoModulateEnabled) return;
    const timer = setInterval(
      modulateSettings,
      modulatePeriodMilliseconds,
    );
    return () => clearInterval(timer);
  }, [autoModulateEnabled, modulatePeriodMilliseconds]);
}
