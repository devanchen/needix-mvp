// app/api/subscriptions/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type Params = { params: { id: string } };

function parsePatch(raw: unknown) {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    service: typeof o.service === "string" ? o.service : undefined,
    plan:
      typeof o.plan === "string"
        ? o.plan
        : o.plan === null
        ? null
        : undefined,
    price:
      typeof o.price === "number"
        ? o.price
        : typeof o.price === "string" && o.price.trim() !== ""
        ? Number(o.price)
        : o.price === null
        ? null
        : undefined,
    nextDate:
      typeof o.nextDate === "string"
        ? o.nextDate
        : o.nextDate === null
        ? null
        : undefined,
    manageUrl:
      typeof o.manageUrl === "string"
        ? o.manageUrl
        : o.manageUrl === null
        ? null
        : undefined,
    canceled:
      typeof o.canceled === "boolean" ? o.canceled : undefined,
  };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.findFirst({
    where: { id: params.id, userId },
    select: {
      id: true,
      service: true,
      plan: true,
      price: true,
      nextDate: true,
      manageUrl: true,
      canceled: true,
    },
  });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(sub);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exists = await prisma.subscription.findFirst({
    where: { id: params.id, userId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = parsePatch(await req.json().catch(() => ({})));

  // Validate nextDate (if provided, cannot be in the past)
  let next: Date | null | undefined = undefined;
  if (Object.prototype.hasOwnProperty.call(body, "nextDate")) {
    next = body.nextDate ? new Date(body.nextDate) : null;
    if (next) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (next < today) {
        return NextResponse.json({ error: "nextDate cannot be in the past." }, { status: 400 });
      }
    }
  }

  const updated = await prisma.subscription.update({
    where: { id: params.id },
    data: {
      service: body.service,
      plan: body.plan,
      price: body.price as number | null | undefined,
      nextDate: next,
      manageUrl: body.manageUrl,
      canceled: body.canceled,
    },
    select: {
      id: true,
      service: true,
      plan: true,
      price: true,
      nextDate: true,
      manageUrl: true,
      canceled: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.findFirst({
    where: { id: params.id, userId },
    select: { id: true },
  });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.subscription.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
