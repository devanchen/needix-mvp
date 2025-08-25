// components/integrations/GmailImportStatus.tsx
"use client";

import { useState } from "react";

export default function GmailImportStatus() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runImport() {
    setLoading(true);
    setSummary(null);
    setError(null);
    try {
      const res = await fetch("/api/integrations/gmail/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Sync failed");
      setSummary(
        `Scanned ~${data.estimatedMessages || 0} messages, found ${data.candidates || 0} potential subscriptions.`
      );
    } catch (e: any) {
      setError(e?.message || "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Initial scan</div>
          <div className="text-sm text-white/70">Scan last 12 months for receipt-like messages (read-only).</div>
        </div>
        <button
          onClick={runImport}
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Scanning…" : "Scan inbox"}
        </button>
      </div>

      {summary && <div className="mt-3 text-sm text-white/80">{summary}</div>}
      {error && <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
    </section>
  );
}
