"use client";

import { useSyncExternalStore } from "react";

// Lê uma media query de forma segura para SSR (no servidor assume `false`).
export default function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
