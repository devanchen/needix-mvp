"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteFooter() {
  const [nlState, setNlState] = useState<"idle" | "ok" | "err" | "pending">("idle");
  const [nlMsg, setNlMsg] = useState<string>("");

  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
        <div>
          <div className="font-semibold">Needix</div>
          <p className="mt-2 text-sm text-white/70">
            Auto‑reordering for essentials + subscription tracking.
          </p>
        </div>

        <div className="text-sm">
          <div className="font-semibold">Company</div>
          <ul className="mt-2 space-y-2 text-white/80">
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><a href="/status">Status</a></li>
            <li><a href="/careers">Careers</a></li>
          </ul>
        </div>

        <div className="text-sm">
          <div className="font-semibold">Product</div>
          <ul className="mt-2 space-y-2 text-white/80">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        {/* Newsletter form with inline UX */}
        <div>
          <div className="font-semibold">Stay in the loop</div>
          <p className="mt-2 text-sm text-white/70">
            Notify me about new retailer & service partners.
          </p>

          <form
            className="mt-3 flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const email = new FormData(form).get("email");
              const hp = (form.querySelector('input[name="website"]') as HTMLInputElement)?.value;

              setNlState("pending");
              setNlMsg("");

              // Honeypot (hidden field): if filled, silently succeed
              if (hp) {
                setNlState("ok");
                setNlMsg("You’re in. Watch your inbox.");
                form.reset();
                return;
              }

              try {
                const res = await fetch("/api/newsletter", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (data.ok) {
                  (window as any).gtag?.("event", "newsletter_submitted", { location: "footer" });
                  setNlState("ok");
                  setNlMsg("You’re in. Watch your inbox.");
                  form.reset();
                } else {
                  setNlState("err");
                  setNlMsg(data.error || "Couldn’t subscribe. Try again.");
                }
              } catch {
                setNlState("err");
                setNlMsg("Network error. Try again.");
              }
            }}
          >
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                required
                placeholder="you@email.com"
                className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40"
                aria-label="Email address"
                disabled={nlState === "pending"}
              />
              <button
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
                disabled={nlState === "pending"}
              >
                {nlState === "pending" ? "Sending…" : "Notify"}
              </button>
            </div>

            {/* Honeypot (hidden) */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            {/* Inline message (keeps layout stable) */}
            <p
              className={`h-5 text-xs ${
                nlState === "ok"
                  ? "text-green-300"
                  : nlState === "err"
                  ? "text-red-300"
                  : "text-white/50"
              }`}
              role={nlState === "err" ? "alert" : undefined}
            >
              {nlMsg}
            </p>
          </form>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-4 text-xs text-white/50">
        © {new Date().getFullYear()} Needix, Inc.
      </div>
    </footer>
  );
}
