// components/marketing/NewsletterForm.tsx
"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function submit() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMsg("Thanks! You’re on the list.");
        setEmail("");
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setMsg(j.error ?? "Please try again.");
      }
    } catch {
      setMsg("Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="text-sm font-semibold">Join the Needix list</div>
      <div className="mt-1 text-xs text-white/70">Tips, new features, and launch updates.</div>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-sm"
        />
        <button
          onClick={submit}
          disabled={busy || email.trim().length === 0}
          className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm hover:bg-emerald-400/15 disabled:opacity-60"
        >
          {busy ? "Joining…" : "Join"}
        </button>
      </div>
      {msg && <div className="mt-2 text-xs text-emerald-300">{msg}</div>}
    </div>
  );
}
