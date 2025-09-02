// app/api/stripe/create-checkout-session/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? undefined;

  if (!userId) {
    // Not signed in → client will redirect to signin with callback
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.STRIPE_SECRET_KEY ?? "";
  const priceId = process.env.STRIPE_PRICE_ID ?? "";

  if (!secret || !priceId) {
    return NextResponse.json(
      { error: "Stripe is not configured (missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID)." },
      { status: 500 },
    );
  }

  // ✅ Let the SDK use its pinned API version (avoid TS literal mismatch)
  const stripe = new Stripe(secret);

  // Ensure a Stripe customer and a Membership row exist for this user
  const existing = await prisma.membership.findUnique({
    where: { userId },
    select: { id: true, stripeCustomerId: true },
  });

  let stripeCustomerId = existing?.stripeCustomerId ?? undefined;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    stripeCustomerId = customer.id;

    await prisma.membership.upsert({
      where: { userId },
      update: { stripeCustomerId, priceId },
      create: {
        userId,
        stripeCustomerId,
        priceId,
        status: "incomplete",
      },
    });
  }

  const success = `${siteUrl()}/dashboard?checkout=success`;
  const cancel = `${siteUrl()}/pricing?canceled=1`;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: success,
    cancel_url: cancel,
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId },
    },
    client_reference_id: userId,
  });

  return NextResponse.json({ url: checkout.url }, { status: 200 });
}
