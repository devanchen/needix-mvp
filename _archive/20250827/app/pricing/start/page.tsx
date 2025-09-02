"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StartCheckoutPage() {
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data?.url) window.location.href = data.url;
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Taking you to checkout…</h1>
      <p className="mt-2 text-white/70">If nothing happens, click below.</p>
      <div className="mt-6">
        <Link
          href="/pricing"
          className="rounded-xl border border-white/20 px-4 py-2 text-white hover:bg-white/10"
        >
          Back to Pricing
        </Link>
      </div>
    </main>
  );
}
