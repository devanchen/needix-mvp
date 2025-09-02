// app/api/membership/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

const secret = process.env.STRIPE_SECRET_KEY ?? "";
const priceId = process.env.STRIPE_PRICE_ID ?? ""; // set this in .env
const site = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000");

const stripe = new Stripe(secret);

type Ok = { url: string };
type Err = { error: string };

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? undefined;

  if (!secret || !priceId) {
    return NextResponse.json<Err>({ error: "Stripe env missing" }, { status: 500 });
  }
  if (!userId) {
    return NextResponse.json<Err>({ error: "Unauthorized" }, { status: 401 });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    metadata: { userId },
    success_url: `${site}/dashboard?checkout=success`,
    cancel_url: `${site}/dashboard?checkout=canceled`,
  });

  if (!checkout.url) {
    return NextResponse.json<Err>({ error: "No checkout URL" }, { status: 500 });
  }

  return NextResponse.json<Ok>({ url: checkout.url });
}
