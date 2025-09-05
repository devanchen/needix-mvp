// app/billing/success/page.tsx
import Link from "next/link";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type SearchParamsP = Promise<Record<string, string | string[] | undefined>>;

// minimal shapes so we don't need @types/stripe
type MinimalRecurring = { interval?: string | null } | null | undefined;
type MinimalPrice = {
  unit_amount: number | null | undefined;
  currency: string | null | undefined;
  recurring?: MinimalRecurring;
} | null | undefined;
type MinimalLineItem = { price?: MinimalPrice } | null | undefined;

function fmtCurrency(cents?: number | null, currency?: string | null) {
  if (cents == null || currency == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export default async function BillingSuccess({
  searchParams,
}: {
  searchParams: SearchParamsP;
}) {
  const sp = await searchParams;
  const sessionId =
    typeof sp.session_id === "string" ? sp.session_id : undefined;

  const plan = {
    amount: null as number | null,
    currency: null as string | null,
    interval: "" as string,
  };
  let email: string | null = null;

  if (sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price", "customer"],
    });

    // Prefer customer_details.email; fall back to expanded customer.email
    email = session.customer_details?.email ?? null;
    if (!email && session.customer && typeof session.customer === "object") {
      const cust = session.customer as { email?: string | null };
      email = cust.email ?? null;
    }

    const li: MinimalLineItem = session.line_items?.data?.[0];
    const price: MinimalPrice = li?.price;

    plan.amount = price?.unit_amount ?? null;
    plan.currency = price?.currency ?? null;
    plan.interval = (price?.recurring?.interval ?? "") || "";
  }

  return (
    <div className="mx-auto max-w-2xl p-6 text-center">
      <h1 className="text-xl font-semibold">🎉 Thanks for subscribing!</h1>

      <p className="mt-2 text-sm text-white/80">
        {email
          ? `We activated Pro for ${email}.`
          : "Your Pro access will activate in a few seconds."}
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="text-sm text-white/70">Plan</div>
        <div className="mt-1 text-lg font-semibold">
          {fmtCurrency(plan.amount, plan.currency)}
          {plan.interval ? ` / ${plan.interval}` : ""}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/subscriptions"
          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
        >
          Go to Subscriptions
        </Link>
        <Link
          href="/billing"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
        >
          Manage billing
        </Link>
      </div>
    </div>
  );
}
