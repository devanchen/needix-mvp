// app/billing/page.tsx
"use client";

import { useState } from "react";

export default function BillingPage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  async function openPortal() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/stripe/create-portal-link", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data?.url) {
        setErr(data?.error ?? "Couldn’t create a portal session.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Billing</h1>
      <p className="mt-2 text-white/80 text-sm">
        Open your Stripe customer portal to update payment methods, cancel, or view invoices.
      </p>

      <button
        onClick={openPortal}
        disabled={busy}
        className="mt-6 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm hover:bg-emerald-400/15 disabled:opacity-60"
      >
        {busy ? "Opening…" : "Open Stripe Billing Portal"}
      </button>

      {err && <div className="mt-3 text-sm text-amber-300">{err}</div>}
    </main>
  );
}
