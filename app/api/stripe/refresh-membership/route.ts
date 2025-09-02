// app/api/stripe/refresh-membership/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
// ✅ Omit apiVersion to avoid union-type incompatibilities with your installed SDK types
const stripe = new Stripe(stripeSecret);

const ACTIVE_STATES = new Set<Stripe.Subscription.Status>(["active", "trialing"]);

type JsonOk = {
  ok: true;
  active: boolean;
  status: string | null;
  membership: {
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    priceId: string | null;
    currentPeriodEnd: string | null; // ISO
  };
};

type JsonErr = { ok: false; error: string };

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? undefined;

  if (!userId) {
    return NextResponse.json<JsonErr>({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!stripeSecret) {
    return NextResponse.json<JsonErr>({ ok: false, error: "STRIPE_SECRET_KEY missing" }, { status: 500 });
  }

  const existing = await prisma.membership.findUnique({ where: { userId } });
  const membership = existing ?? (await prisma.membership.create({ data: { userId } }));

  // Resolve customer id
  let stripeCustomerId: string | null = membership.stripeCustomerId ?? null;

  if (!stripeCustomerId && email) {
    const customers = await stripe.customers.list({ email, limit: 10 });
    const exact = customers.data.find(
      (c) => typeof c.email === "string" && c.email.toLowerCase() === email.toLowerCase()
    );
    const picked =
      exact ??
      customers.data.sort((a, b) => (b.created ?? 0) - (a.created ?? 0))[0];
    stripeCustomerId = picked?.id ?? null;
  }

  // Resolve subscription
  let subscription: Stripe.Subscription | null = null;

  if (membership.stripeSubscriptionId) {
    try {
      subscription = await stripe.subscriptions.retrieve(membership.stripeSubscriptionId);
    } catch {
      subscription = null;
    }
  }

  if (!subscription && stripeCustomerId) {
    const list = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 100,
      expand: ["data.items.data.price"],
    });
    subscription = pickLatestSubscription(list.data);
  }

  const status: string | null = subscription?.status ?? null;
  const periodEndUnix = getCurrentPeriodEnd(subscription);
  const currentPeriodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : null;
  const priceId: string | null = subscription?.items?.data?.[0]?.price?.id ?? null;
  const stripeSubscriptionId: string | null = subscription?.id ?? null;

  const updated = await prisma.membership.update({
    where: { userId },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
      priceId,
      status,
      currentPeriodEnd,
    },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      priceId: true,
      status: true,
      currentPeriodEnd: true,
    },
  });

  const active =
    typeof updated.status === "string" &&
    ACTIVE_STATES.has(updated.status as Stripe.Subscription.Status);

  return NextResponse.json<JsonOk>({
    ok: true,
    active,
    status: updated.status ?? null,
    membership: {
      stripeCustomerId: updated.stripeCustomerId,
      stripeSubscriptionId: updated.stripeSubscriptionId,
      priceId: updated.priceId,
      currentPeriodEnd: updated.currentPeriodEnd
        ? updated.currentPeriodEnd.toISOString()
        : null,
    },
  });
}

/** Safely read `current_period_end` from Subscription payload (type-safe even if SDK types change). */
function getCurrentPeriodEnd(sub: Stripe.Subscription | null): number | null {
  if (!sub) return null;
  const obj = sub as unknown as { current_period_end?: unknown };
  return typeof obj.current_period_end === "number" ? obj.current_period_end : null;
}

/** Pick the latest subscription by current_period_end, falling back to created timestamp. */
function pickLatestSubscription(subs: Stripe.Subscription[]): Stripe.Subscription | null {
  if (subs.length === 0) return null;

  const withEnds = subs
    .map((s) => ({ s, end: getCurrentPeriodEnd(s) ?? 0 }))
    .sort((a, b) => b.end - a.end);

  const best = withEnds[0];
  if (best && best.end > 0) return best.s;

  return [...subs].sort((a, b) => (b.created ?? 0) - (a.created ?? 0))[0] ?? null;
}
