import { useSetAtom } from "jotai";
import p5 from "p5";
import type React from "react";
import { useEffect, useRef } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { InteractionHud } from "./components/InteractionHud";
import { RecordingOverlay } from "./components/RecordingOverlay";
import { ToastHost } from "./components/ToastHost";
import { createMarbleSketch } from "./core/sketch";
import { useAutoModulation } from "./hooks/useAutoModulation";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useWheelRangeSlider } from "./hooks/useWheelRangeSlider";
import { createStoreBridge } from "./state/bridge";
import { stopRecording } from "./state/recordingActions";
import { controllerAtom } from "./state/store";

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setController = useSetAtom(controllerAtom);

  useKeyboardShortcuts();
  useWheelRangeSlider();
  useAutoModulation();

  useEffect(() => {
    if (!containerRef.current) return;

    const { sketch, controller } = createMarbleSketch(createStoreBridge());
    const instance = new p5(sketch, containerRef.current);
    setController(controller);

    return () => {
      setController(null);
      instance.remove();
    };
  }, [setController]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950">
      <div ref={containerRef} className="absolute inset-0" />
      <InteractionHud />
      <ControlPanel />
      <RecordingOverlay onStopRecord={() => void stopRecording()} />
      <ToastHost />
    </div>
  );
};
