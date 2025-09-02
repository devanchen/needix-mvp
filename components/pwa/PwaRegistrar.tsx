// components/pwa/PwaRegistrar.tsx
"use client";

import { useEffect } from "react";

/**
 * In dev, unregister ALL service workers to avoid stale `_next` chunks
 * causing ChunkLoadError during HMR / route changes.
 * In production, register `/sw.js` once on page load.
 */
export default function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // DEV: make sure nothing is registered or caching app chunks
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    // PROD: register once
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
