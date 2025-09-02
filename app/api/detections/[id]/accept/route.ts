// app/api/detections/[id]/accept/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type Params = { params: { id: string } };
type Body = {
  service?: string;
  plan?: string | null;
  price?: number | null;
  nextDate?: string | null; // ISO
  manageUrl?: string | null;
};

function parseBody(raw: unknown): Body {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    service: typeof o.service === "string" ? o.service : undefined,
    plan: typeof o.plan === "string" ? o.plan : o.plan === null ? null : undefined,
    price: typeof o.price === "number" ? o.price : o.price === null ? null : undefined,
    nextDate: typeof o.nextDate === "string" ? o.nextDate : o.nextDate === null ? null : undefined,
    manageUrl: typeof o.manageUrl === "string" ? o.manageUrl : o.manageUrl === null ? null : undefined,
  };
}

function addMonthsUTC(d: Date, months: number) {
  const copy = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0));
  copy.setUTCMonth(copy.getUTCMonth() + months);
  return copy;
}
function addYearsUTC(d: Date, years: number) {
  const copy = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0));
  copy.setUTCFullYear(copy.getUTCFullYear() + years);
  return copy;
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const det = await prisma.detection.findFirst({
    where: { id: params.id, userId, resolvedToSubscriptionId: null },
  });
  if (!det) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = parseBody(await req.json().catch(() => ({})));

  // Defaults from detection
  const service = body.service ?? (det.merchantRaw || "Subscription");
  const price = body.price ?? (det.amount ?? null);
  const plan = body.plan ?? null;
  const manageUrl = body.manageUrl ?? null;

  // Guess nextDate if not provided: add cadence interval to occurredAt
  let nextDate: Date | null = null;
  if (body.nextDate) {
    nextDate = new Date(body.nextDate);
  } else if (det.occurredAt) {
    if (det.cadence === "monthly") nextDate = addMonthsUTC(det.occurredAt, 1);
    else if (det.cadence === "yearly") nextDate = addYearsUTC(det.occurredAt, 1);
    else nextDate = null;
  }

  const sub = await prisma.subscription.create({
    data: {
      userId,
      service,
      plan,
      price,
      nextDate,
      manageUrl,
      createdFromDetectionId: det.id,
    },
  });

  await prisma.detection.update({
    where: { id: det.id },
    data: { resolvedToSubscriptionId: sub.id },
  });

  return NextResponse.json({ ok: true, subscriptionId: sub.id });
}
