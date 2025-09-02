// components/billing/BillingActions.tsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

type Props = {
  active: boolean;
  checkoutSuccess?: boolean;
};

type CheckoutResponse = { url: string } | { error: string };

export default function BillingActions({ active, checkoutSuccess }: Props) {
  const { status } = useSession();
  const [busy, setBusy] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sp = useSearchParams();
  const router = useRouter();
  const startedOnce = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (startedOnce.current) return;
    if (sp.get("startCheckout") === "1") {
      startedOnce.current = true;
      void handleStart();
      const url = new URL(window.location.href);
      url.searchParams.delete("startCheckout");
      router.replace(url.toString(), { scroll: false });
    }
  }, [router, sp, status]);

  async function handleStart() {
    if (status !== "authenticated") {
      await signIn(undefined, { callbackUrl: "/dashboard?startCheckout=1" });
      return;
    }
    try {
      setBusy(true);
      const res = await fetch("/api/membership/checkout", { method: "POST" });
      const ct = res.headers.get("content-type") ?? "";
      const data: CheckoutResponse | null = ct.includes("application/json") ? await res.json() : null;
      if (!res.ok || !data || "error" in data) {
        console.error("Checkout error", data);
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  }

  if (active) {
    return (
      <div className="mt-3 flex items-center gap-3">
        <span className="rounded-full bg-emerald-600/10 px-2 py-1 text-xs font-medium text-emerald-600">
          Active
        </span>
        <Link href="/billing" className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-accent">
          Manage billing
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={busy || isPending}
        onClick={() => startTransition(handleStart)}
        className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-accent disabled:opacity-60"
      >
        {busy || isPending ? "Starting…" : checkoutSuccess ? "Refresh membership" : "Start membership"}
      </button>
    </div>
  );
}
