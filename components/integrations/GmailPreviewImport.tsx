// components/integrations/GmailPreviewImport.tsx
"use client";

import { useState } from "react";

type Row = {
  merchantRaw: string;
  occurredAt: string;
  amount?: number | null;
  currency?: string | null;
};

export default function GmailPreviewImport() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function preview() {
    setBusy(true);
    try {
      const res = await fetch("/api/detections/gmail/ingest", {
        method: "POST",
        body: JSON.stringify({ maxMessages: 20 }),
        headers: { "Content-Type": "application/json" },
      });
      // In your ingest we only return counts. If you add a preview endpoint, wire it here.
      await res.json();
      setRows([]); // keep empty for now
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Gmail preview</div>
        <button onClick={preview} disabled={busy} className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-60">
          {busy ? "Loading…" : "Preview"}
        </button>
      </div>
      {rows.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs">
          {rows.map((r, i) => (
            <li key={i}>
              {r.merchantRaw} — {new Date(r.occurredAt).toLocaleString()}{" "}
              {r.amount != null ? `• $${r.amount.toFixed(2)}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
