// app/api/stripe/webhook/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

/** Accept snake_case or camelCase seconds → Date | null */
function toDateFromSecs(v?: number | null): Date | null {
  return typeof v === "number" && Number.isFinite(v) ? new Date(v * 1000) : null;
}

/** Narrow unknown object */
function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

/** Read current period end from either `current_period_end` or `currentPeriodEnd` */
function getPeriodEndSecs(x: unknown): number | null {
  if (!isObj(x)) return null;
  const snake = x["current_period_end"];
  if (typeof snake === "number") return snake;
  const camel = x["currentPeriodEnd"];
  if (typeof camel === "number") return camel;
  return null;
}

/** Get subscription id from an Invoice across SDK shapes */
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const maybe = (invoice as unknown as { subscription?: unknown }).subscription;
  if (typeof maybe === "string") return maybe;
  if (isObj(maybe)) {
    const id = maybe["id"];
    return typeof id === "string" ? id : null;
  }
  return null;
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey);

  // Next 15 typings: headers() may be async – handle both.
  const hdrs = await headers();
  const sig = hdrs.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      /** User finished checkout */
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        const userId = (cs.client_reference_id ?? cs.metadata?.userId) ?? null;

        let subscriptionId: string | null = null;
        if (typeof cs.subscription === "string") subscriptionId = cs.subscription;

        let status: string | null = "active";
        let periodEnd: Date | null = null;

        if (subscriptionId) {
          // Response<Subscription> – access fields via helpers for both shapes
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          status = (sub as unknown as { status?: string }).status ?? status;
          periodEnd = toDateFromSecs(getPeriodEndSecs(sub));
        }

        if (userId) {
          await prisma.membership.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId:
                typeof cs.customer === "string" ? cs.customer : undefined,
              stripeSubscriptionId: subscriptionId ?? undefined,
              status: status ?? undefined,
              currentPeriodEnd: periodEnd ?? undefined,
            },
            update: {
              stripeCustomerId:
                typeof cs.customer === "string" ? cs.customer : undefined,
              stripeSubscriptionId: subscriptionId ?? undefined,
              status: status ?? undefined,
              currentPeriodEnd: periodEnd ?? undefined,
            },
          });
        }
        break;
      }

      /** Sub was created/updated (plan change, renewal, etc.) */
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.userId as string | undefined) ?? null;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : undefined;

        const status = (sub as unknown as { status?: string }).status ?? "active";
        const periodEnd = toDateFromSecs(getPeriodEndSecs(sub));

        if (userId) {
          await prisma.membership.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: sub.id,
              status,
              currentPeriodEnd: periodEnd ?? undefined,
            },
            update: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: sub.id,
              status,
              currentPeriodEnd: periodEnd ?? undefined,
            },
          });
        }
        break;
      }

      /** Sub canceled */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.userId as string | undefined) ?? null;
        if (userId) {
          await prisma.membership.updateMany({
            where: { userId },
            data: { status: "canceled" },
          });
        }
        break;
      }

      /** Invoice succeeded → bump status/period end from the related subscription */
      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(inv);
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = (sub.metadata?.userId as string | undefined) ?? null;
          const status = (sub as unknown as { status?: string }).status ?? "active";
          const periodEnd = toDateFromSecs(getPeriodEndSecs(sub));
          if (userId) {
            await prisma.membership.updateMany({
              where: { userId },
              data: {
                status,
                currentPeriodEnd: periodEnd ?? undefined,
              },
            });
          }
        }
        break;
      }

      /** Invoice failed → mark as past_due */
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(inv);
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = (sub.metadata?.userId as string | undefined) ?? null;
          if (userId) {
            await prisma.membership.updateMany({
              where: { userId },
              data: { status: "past_due" },
            });
          }
        }
        break;
      }

      default:
        // ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Webhook handler error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
