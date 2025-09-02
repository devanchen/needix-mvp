// components/dashboard/CheckoutStatusBanner.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BillingActions from "@/components/billing/BillingActions";

export default function CheckoutStatusBanner({ active }: { active: boolean }) {
  const sp = useSearchParams();
  const router = useRouter();
  const cleaned = useRef(false);

  const checkout = sp.get("checkout"); // "success" | "canceled" | null
  const isSuccess = checkout === "success";
  const isCanceled = checkout === "canceled";

  useEffect(() => {
    if (!checkout || cleaned.current) return;
    cleaned.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    router.replace(url.toString(), { scroll: false });
  }, [checkout, router]);

  if (!isSuccess && !isCanceled) return null;

  return isSuccess ? (
    <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
      <div className="text-sm font-semibold">Thanks — your checkout completed!</div>
      <div className="mt-1 text-xs">
        If you don&apos;t see your membership active yet, click <strong>Manage billing / Refresh</strong>.
      </div>
      <div className="mt-3">
        <BillingActions active={active} checkoutSuccess />
      </div>
    </div>
  ) : (
    <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
      <div className="text-sm font-semibold">Checkout canceled.</div>
      <div className="mt-1 text-xs">You can restart it anytime below.</div>
      <div className="mt-3">
        <BillingActions active={active} />
      </div>
    </div>
  );
}
