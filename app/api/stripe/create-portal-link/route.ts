import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  const email = session?.user?.email || "";
  if (!email) return new NextResponse("Unauthorized", { status: 401 });

  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer = existing.data[0];
  if (!customer) {
    // No Stripe customer yet — let the client fall back to Checkout
    return new NextResponse("No Stripe customer", { status: 404 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${SITE_URL}/billing`,
  });

  return NextResponse.json({ url: portal.url }, { status: 200 });
}
