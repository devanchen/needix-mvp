// app/api/stripe/create-portal-link/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

// Omit apiVersion to avoid TS union mismatches with installed SDK
const stripe = new Stripe(stripeSecret);

type JsonOk = { url: string };
type JsonErr = { error: string };

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? undefined;

  if (!userId) return NextResponse.json<JsonErr>({ error: "Unauthorized" }, { status: 401 });
  if (!stripeSecret) return NextResponse.json<JsonErr>({ error: "STRIPE_SECRET_KEY missing" }, { status: 500 });

  const membership = await prisma.membership.findUnique({ where: { userId } });
  let customerId = membership?.stripeCustomerId ?? null;

  if (!customerId && email) {
    const customers = await stripe.customers.list({ email, limit: 10 });
    const exact = customers.data.find(
      (c) => typeof c.email === "string" && c.email.toLowerCase() === email.toLowerCase()
    );
    customerId = (exact ?? customers.data.at(0))?.id ?? null;
    if (customerId && !membership?.stripeCustomerId) {
      await prisma.membership.upsert({
        where: { userId },
        update: { stripeCustomerId: customerId },
        create: { userId, stripeCustomerId: customerId },
      });
    }
  }

  if (!customerId) {
    return NextResponse.json<JsonErr>({ error: "No Stripe customer found" }, { status: 404 });
  }

  const sessionPortal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${SITE_URL}/dashboard`,
  });

  return NextResponse.json<JsonOk>({ url: sessionPortal.url });
}
