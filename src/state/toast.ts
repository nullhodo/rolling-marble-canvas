import { getDefaultStore } from "jotai";
import type { ToastType } from "../types/simulation";
import { toastsAtom } from "./store";

const TOAST_LIFETIME_MS = 3200;
let nextToastId = 1;

/** 画面右下に通知を出す。React の外 (録画処理など) からも呼べる */
export function showToast(
  message: string,
  type: ToastType = "info",
): void {
  const store = getDefaultStore();
  const id = nextToastId++;
  store.set(toastsAtom, (prev) => [...prev, { id, message, type }]);
  setTimeout(() => {
    store.set(toastsAtom, (prev) =>
      prev.filter((toast) => toast.id !== id),
    );
  }, TOAST_LIFETIME_MS);
}
