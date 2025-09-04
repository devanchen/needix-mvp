"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  /** Whether the user currently has an active Pro subscription */
  active?: boolean;
  /** Show success state right after a completed checkout */
  checkoutSuccess?: boolean;
};

export default function CheckoutStatusBanner({
  active = false,
  checkoutSuccess = false,
}: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  // Nothing to show
  if (!active && !checkoutSuccess) return null;

  const base =
    "rounded-xl border px-4 py-3 text-sm flex items-start justify-between gap-3";

  if (checkoutSuccess) {
    return (
      <div className={`${base} border-emerald-500/25 bg-emerald-500/10`}>
        <div>
          <div className="font-medium text-emerald-200">
            🎉 Thanks for subscribing!
          </div>
          <div className="mt-1 text-emerald-100/80">
            Your Pro features will be available shortly.
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/subscriptions"
            className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-black/90"
          >
            Continue
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white/80 hover:bg-white/15"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  // Active plan banner
  if (active) {
    return (
      <div className={`${base} border-white/15 bg-white/[0.04]`}>
        <div>
          <div className="font-medium text-white">Needix Pro is active ✓</div>
          <div className="mt-1 text-white/70">
            Manage your subscription, payment method, or invoices anytime.
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/billing"
            className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-white hover:bg-white/15"
          >
            Open billing
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white/80 hover:bg-white/15"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return null;
}
