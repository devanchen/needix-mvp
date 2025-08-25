// components/integrations/GmailPreviewImport.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

type Candidate = {
  messageId: string;
  service: string;
  plan: string | null;
  price: number | null;
  nextDate: string | null;   // YYYY-MM-DD
  intervalDays: number | null;
  manageUrl: string | null;
  subject: string;
  from: string;
  snippet: string;
  confidence: number;
};

export default function GmailPreviewImport() {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const [cands, setCands] = useState<Candidate[] | null>(null);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [importing, setImporting] = useState(false);

  async function fetchPreview() {
    setLoading(true);
    setCands(null);
    setPicked({});
    try {
      const res = await fetch("/api/integrations/gmail/preview", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      const rows: Candidate[] = json.candidates || [];
      setCands(rows);
      // preselect high confidence
      const selected = Object.fromEntries(rows.map((x) => [x.messageId, x.confidence >= 0.5]));
      setPicked(selected);
    } catch (e: any) {
      showToast(e.message || "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  function update(id: string, patch: Partial<Candidate>) {
    setCands((list) => (list ? list.map((c) => (c.messageId === id ? { ...c, ...patch } : c)) : list));
  }

  function toggle(id: string) {
    setPicked((p) => ({ ...p, [id]: !p[id] }));
  }

  async function importSelected() {
    if (!cands) return;
    const rows = cands
      .filter((c) => picked[c.messageId])
      .map((c) => ({
        service: c.service,
        plan: c.plan,
        price: c.price,
        nextDate: c.nextDate,
        intervalDays: c.intervalDays,
        manageUrl: c.manageUrl,
      }));
    if (rows.length === 0) {
      showToast("Nothing selected");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/integrations/gmail/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Import failed");

      showToast(`Created ${json.counts?.created || 0}, updated ${json.counts?.updated || 0}, skipped ${json.counts?.skipped || 0}`);
      r.push("/subscriptions");
      r.refresh();
    } catch (e: any) {
      showToast(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Preview & import</h2>
          <p className="text-sm text-white/70">Smart parser v2: tweak anything before importing.</p>
        </div>
        <button
          onClick={fetchPreview}
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Scanning…" : "Fetch preview"}
        </button>
      </div>

      {!cands ? (
        <div className="mt-6 text-sm text-white/70">No preview yet. Click “Fetch preview”.</div>
      ) : cands.length === 0 ? (
        <div className="mt-6 text-sm text-white/70">No candidates found in the last year.</div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-white/70">
                <tr>
                  <th className="px-3 py-2"><span className="sr-only">Select</span></th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Next date</th>
                  <th className="px-3 py-2">Every (days)</th>
                  <th className="px-3 py-2">Conf.</th>
                  <th className="px-3 py-2">From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {cands.map((c) => (
                  <tr key={c.messageId} className="bg-white/[0.02] hover:bg-white/[0.04]">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!picked[c.messageId]}
                        onChange={() => toggle(c.messageId)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 outline-none"
                        value={c.service}
                        onChange={(e) => update(c.messageId, { service: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 outline-none"
                        value={c.plan || ""}
                        onChange={(e) => update(c.messageId, { plan: e.target.value || null })}
                        placeholder="(optional)"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 outline-none"
                        value={c.price ?? ""}
                        onChange={(e) => update(c.messageId, { price: e.target.value === "" ? null : Number(e.target.value) })}
                        placeholder="—"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 outline-none"
                        value={c.nextDate ?? ""}
                        onChange={(e) => update(c.messageId, { nextDate: e.target.value || null })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 outline-none"
                        value={c.intervalDays ?? ""}
                        onChange={(e) =>
                          update(c.messageId, {
                            intervalDays: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        placeholder="30"
                      />
                    </td>
                    <td className="px-3 py-2">{Math.round((c.confidence || 0) * 100)}%</td>
                    <td className="px-3 py-2 truncate max-w-[24ch]" title={c.from}>
                      {c.from || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={importSelected}
              disabled={importing}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
            >
              {importing ? "Importing…" : "Import selected"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
