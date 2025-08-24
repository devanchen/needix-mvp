// components/ui/Toaster.tsx
"use client";

import { useEffect, useState } from "react";
import { onToast } from "@/lib/toast";

type ToastItem = { id: number; text: string };

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return onToast((text) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, text }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2400);
    });
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className="pointer-events-auto rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
