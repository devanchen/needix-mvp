"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BillingPortalRedirect() {
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stripe/create-portal-link", { method: "POST" });
        const data = await res.json();
        if (data?.url) window.location.href = data.url;
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Opening billing portal…</h1>
      <p className="mt-2 text-white/70">If nothing happens, go back and try again.</p>
      <div className="mt-6">
        <Link href="/dashboard" className="rounded-xl border border-white/20 px-4 py-2 text-white hover:bg-white/10">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
