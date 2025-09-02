// components/pricing/CheckoutButton.tsx
"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  async function go() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
      if (res.status === 401) {
        const cb = encodeURIComponent("/pricing");
        window.location.href = `/signin?callbackUrl=${cb}`;
        return;
      }
      const data: { url?: string; error?: string } = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setErr(data.error ?? "Could not start checkout.");
    } catch {
      setErr("Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch">
      <button
        onClick={go}
        disabled={busy}
        className="inline-block rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm hover:bg-emerald-400/15 disabled:opacity-60"
      >
        {busy ? "Starting checkout…" : "Upgrade — $4.99/mo"}
      </button>
      {err && <div className="mt-2 text-xs text-amber-300">{err}</div>}
    </div>
  );
}
