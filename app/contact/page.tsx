"use client";

import { useState } from "react";

type State = "idle" | "pending" | "ok" | "err";

export default function ContactPage() {
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-extrabold">Contact</h1>
      <p className="mt-2 text-white/75">
        Questions, feedback, or partnership ideas? Send us a note and we’ll get back to you.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          const payload = {
            name: String(fd.get("name") || ""),
            email: String(fd.get("email") || ""),
            topic: String(fd.get("topic") || ""),
            message: String(fd.get("message") || ""),
            website: String(fd.get("website") || ""), // honeypot
          };

          setState("pending");
          setMsg("");

          try {
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.ok) {
              (window as any).gtag?.("event", "contact_submitted", { topic: payload.topic || "general" });
              setState("ok");
              setMsg("Thanks! We’ll reply to your email soon.");
              form.reset();
            } else {
              setState("err");
              setMsg(data.error || "Couldn’t send message. Try again.");
            }
          } catch {
            setState("err");
            setMsg("Network error. Try again.");
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-white/70">Name</label>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40"
              placeholder="Jane Doe"
              disabled={state === "pending"}
            />
          </div>
          <div>
            <label className="block text-sm text-white/70">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40"
              placeholder="jane@company.com"
              disabled={state === "pending"}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70">Topic (optional)</label>
          <select
            name="topic"
            className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
            disabled={state === "pending"}
            defaultValue=""
          >
            <option value="" className="bg-black">Choose a topic…</option>
            <option value="support" className="bg-black">Support</option>
            <option value="partnership" className="bg-black">Partnership</option>
            <option value="press" className="bg-black">Press</option>
            <option value="other" className="bg-black">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/70">Message</label>
          <textarea
            name="message"
            required
            rows={6}
            className="mt-1 w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40"
            placeholder="How can we help?"
            disabled={state === "pending"}
          />
        </div>

        {/* honeypot */}
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <div className="flex items-center gap-3">
          <button
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
            disabled={state === "pending"}
          >
            {state === "pending" ? "Sending…" : "Send message"}
          </button>
          <span
            className={`text-sm ${state === "ok" ? "text-green-300" : state === "err" ? "text-red-300" : "text-white/60"}`}
            role={state === "err" ? "alert" : undefined}
          >
            {msg}
          </span>
        </div>
      </form>

      <div className="mt-10 text-sm text-white/60">
        Prefer email? Reach us at <a className="underline" href="mailto:support@needix.com">support@needix.com</a>.
      </div>
    </main>
  );
}
