// app/contact/page.tsx
"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  message: string;
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      // TODO: post to /api/contact when you add it
      await new Promise((r) => setTimeout(r, 400));
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contact</h1>
      {done ? (
        <p className="mt-4 text-sm text-white/80">Thanks! We’ll get back to you soon.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-md border bg-transparent px-3 py-2"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <input
            className="w-full rounded-md border bg-transparent px-3 py-2"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <textarea
            className="h-36 w-full rounded-md border bg-transparent px-3 py-2"
            placeholder="How can we help?"
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </form>
      )}
    </main>
  );
}
