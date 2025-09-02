// components/ui/Toaster.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { onToast } from "@/lib/toast";

type ToastItem = { id: number; text: string };

export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  useEffect(() => {
    const unsubscribe = onToast((text: string) => {
      const id = idRef.current++;
      setItems((prev) => [{ id, text }, ...prev]);
      // auto-dismiss after 3.5s
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // container: top-left, above header (z-50+), pointer-events only on cards
  return (
    <div className="pointer-events-none fixed left-4 top-4 z-[70] flex w-[min(24rem,calc(100%-2rem))] flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-xl border border-white/10 bg-black/90 px-4 py-3 text-sm text-white shadow-xl backdrop-blur transition-all"
          role="status"
          aria-live="polite"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
