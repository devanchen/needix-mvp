// components/cta/FinalCta.tsx
"use client";

import { useState } from "react";

export default function FinalCta() {
  const [email, setEmail] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: wire to your newsletter endpoint
    await new Promise((r) => setTimeout(r, 300));
    setEmail("");
  }

  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="text-xl font-semibold">Ready to stop overpaying?</h3>
      <p className="mt-1 text-sm text-white/80">Join Needix and get smart reminders.</p>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2"
        />
        <button className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Join</button>
      </form>
    </section>
  );
}
