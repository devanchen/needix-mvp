"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function CheckoutButton() {
  const { status } = useSession(); // "authenticated" | "unauthenticated" | "loading"
  const params = useSearchParams();
  const doCheckout = params.get("doCheckout"); // stable primitive for deps
  const [loading, setLoading] = useState(false);
  const [autoRan, setAutoRan] = useState(false);

  const startCheckout = useCallback(async () => {
    setLoading(true);
    try {
      // If not signed in, go sign in and come back here to auto-continue
      if (status !== "authenticated") {
        await signIn(undefined, { callbackUrl: "/pricing?doCheckout=1" });
        return;
      }

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });

      if (res.status === 401) {
        await signIn(undefined, { callbackUrl: "/pricing?doCheckout=1" });
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "Unable to start checkout.");
        alert(msg);
        setLoading(false);
        return;
      }

      const { url } = (await res.json()) as { url?: string };
      if (!url) {
        alert("Checkout could not be created. Please try again.");
        setLoading(false);
        return;
      }

      window.location.assign(url);
    } catch (err) {
      console.error(err);
      alert("Something went wrong starting checkout.");
      setLoading(false);
    }
  }, [status]);

  // Auto-resume checkout after sign-in when ?doCheckout=1 is present
  useEffect(() => {
    if (!autoRan && status === "authenticated" && doCheckout === "1" && !loading) {
      setAutoRan(true);
      void startCheckout();
    }
  }, [autoRan, status, doCheckout, loading, startCheckout]);

  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90 disabled:opacity-60"
    >
      {loading ? "Starting…" : "Upgrade — $4.99/mo"}
    </button>
  );
}
