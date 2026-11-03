import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import type React from "react";
import { toastsAtom } from "../state/store";
import type { ToastType } from "../types/simulation";

const TOAST_STYLES: Record<ToastType, string> = {
  info: "border-white/50 bg-white/75 text-gray-900",
  success: "border-emerald-300 bg-emerald-50/90 text-emerald-900",
  error: "border-red-300 bg-red-50/90 text-red-900",
};

export const ToastHost: React.FC = () => {
  const toasts = useAtomValue(toastsAtom);

  return (
    <div className="absolute bottom-5 right-5 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className={`px-3.5 py-2 rounded-md border backdrop-blur-xl shadow-lg text-xs font-medium ${TOAST_STYLES[toast.type]}`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
