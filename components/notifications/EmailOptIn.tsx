// components/notifications/EmailOptIn.tsx
"use client";

import { useState, useTransition } from "react";

type Props = { initialEnabled: boolean; userEmail: string };

export default function EmailOptIn({ initialEnabled, userEmail }: Props) {
  const [enabled, setEnabled] = useState<boolean>(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string>("");

  async function save(next: boolean) {
    setMsg("");
    startTransition(async () => {
      const res = await fetch("/api/reminders/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) {
        setMsg("Could not update reminders.");
        return;
      }
      setEnabled(next);
      setMsg(next ? `Email reminders enabled for ${userEmail}` : "Email reminders disabled");
    });
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Email reminders</div>
          <div className="text-xs text-white/80">Sends renewal reminders to {userEmail || "your email"}.</div>
        </div>
        <button
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-accent disabled:opacity-60"
          onClick={() => save(!enabled)}
          disabled={isPending}
          aria-pressed={enabled}
        >
          {isPending ? "Saving…" : enabled ? "On" : "Off"}
        </button>
      </div>
      {msg && <div className="mt-2 text-xs text-white/70">{msg}</div>}
    </div>
  );
}
