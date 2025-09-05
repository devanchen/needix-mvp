// app/api/stripe/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

const PRICE_ID = process.env.STRIPE_PRICE_ID;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!email) {
    // Do NOT redirect here; let the client decide to call signIn
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!PRICE_ID) {
    return new NextResponse("Missing STRIPE_PRICE_ID", { status: 500 });
  }

  // Find or create the Stripe customer
  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer =
    existing.data[0] ??
    (await stripe.customers.create({
      email,
      metadata: { userEmail: email },
    }));

  // If the customer already has an active/trialing subscription on this price,
  // send them to the billing portal instead of creating a new checkout.
  const subs = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    expand: ["data.default_payment_method"],
    limit: 10,
  });

  const hasActive = subs.data.some(
    (s) =>
      (s.status === "active" || s.status === "trialing" || s.status === "past_due") &&
      s.items.data.some((it) => it.price.id === PRICE_ID)
  );

  if (hasActive) {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${SITE_URL}/billing`,
    });
    return NextResponse.json({ url: portal.url }, { status: 200 });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${SITE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/pricing`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userEmail: email },
    },
    metadata: { userEmail: email },
  });

  return NextResponse.json({ url: checkout.url }, { status: 200 });
}
