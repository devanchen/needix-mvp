// components/integrations/GmailImportStatus.tsx
"use client";

import { useEffect, useState } from "react";

type Status = {
  scanned: number;
  created: number;
  skipped: number;
} | null;

export default function GmailImportStatus() {
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  async function runIngest() {
    setBusy(true);
    try {
      const res = await fetch("/api/detections/gmail/ingest", { method: "POST" });
      const data = (await res.json()) as { ok: boolean; scanned: number; created: number; skipped: number };
      if (data?.ok) setStatus({ scanned: data.scanned, created: data.created, skipped: data.skipped });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    // optional: auto-run once
  }, []);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Gmail import</div>
        <button onClick={runIngest} disabled={busy} className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-60">
          {busy ? "Running…" : "Run import"}
        </button>
      </div>
      {status && (
        <div className="mt-2 text-xs text-white/80">
          scanned {status.scanned}, created {status.created}, skipped {status.skipped}
        </div>
      )}
    </div>
  );
}
