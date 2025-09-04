"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function BillingButtons() {
  const { status } = useSession(); // "authenticated" | "unauthenticated" | "loading"
  const sp = useSearchParams();
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [autoRan, setAutoRan] = useState(false);
  const intent = sp.get("continue"); // "checkout" | "portal" | null

  const startCheckout = useCallback(async () => {
    setLoading("checkout");
    try {
      if (status !== "authenticated") {
        await signIn(undefined, { callbackUrl: "/billing?continue=checkout" });
        return;
      }
      const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
      if (res.status === 401) {
        await signIn(undefined, { callbackUrl: "/billing?continue=checkout" });
        return;
      }
      if (!res.ok) throw new Error(await res.text().catch(() => "Unable to start checkout."));
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new Error("No checkout URL returned.");
      window.location.assign(url);
    } catch (e) {
      alert((e as Error).message || "Checkout failed.");
      setLoading(null);
    }
  }, [status]);

  const openPortal = useCallback(async () => {
    setLoading("portal");
    try {
      if (status !== "authenticated") {
        await signIn(undefined, { callbackUrl: "/billing?continue=portal" });
        return;
      }
      const res = await fetch("/api/stripe/create-portal-link", { method: "POST" });
      if (res.status === 401) {
        await signIn(undefined, { callbackUrl: "/billing?continue=portal" });
        return;
      }
      if (res.status === 404) {
        // No Stripe customer yet → go to checkout instead
        await startCheckout();
        return;
      }
      if (!res.ok) throw new Error(await res.text().catch(() => "Unable to open portal."));
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new Error("No portal URL returned.");
      window.location.assign(url);
    } catch (e) {
      alert((e as Error).message || "Portal failed.");
      setLoading(null);
    }
  }, [status, startCheckout]);

  // Auto-resume after sign-in (/?continue=portal|checkout)
  useEffect(() => {
    if (autoRan || status !== "authenticated") return;
    if (intent === "portal") {
      setAutoRan(true);
      void openPortal();
    } else if (intent === "checkout") {
      setAutoRan(true);
      void startCheckout();
    }
  }, [autoRan, intent, status, openPortal, startCheckout]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="text-base font-semibold">Needix Pro</h2>
      <p className="mt-1 text-sm text-white/70">
        Unlock Pro features for <span className="font-medium text-white">$4.99/month</span>.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={startCheckout}
          disabled={loading !== null}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90 disabled:opacity-60"
        >
          {loading === "checkout" ? "Starting…" : "Get Pro ($4.99/mo)"}
        </button>

        <button
          onClick={openPortal}
          disabled={loading !== null}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-60"
        >
          {loading === "portal" ? "Opening…" : "Open Stripe Billing Portal"}
        </button>
      </div>
    </div>
  );
}
