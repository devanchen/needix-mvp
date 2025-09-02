// components/notifications/ReminderBell.tsx
"use client";

import { useState } from "react";

export default function ReminderBell() {
  const [enabled, setEnabled] = useState<boolean>(false);

  return (
    <button
      className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
      aria-pressed={enabled}
      onClick={() => setEnabled((v) => !v)}
      title="Toggle reminder"
    >
      {enabled ? "🔔 On" : "🔕 Off"}
    </button>
  );
}
