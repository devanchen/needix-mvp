// app/api/subscriptions/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Next.js 15 route context typing
type Ctx = { params: Promise<{ id: string }> };

function toDTO(s: any) {
  return {
    id: s.id,
    userId: s.userId,
    service: s.service,
    plan: s.plan ?? null,
    manageUrl: s.manageUrl ?? null,
    price: s.price == null ? null : Number(s.price),
    nextDate: s.nextDate ? new Date(s.nextDate).toISOString() : null,
    intervalDays: typeof (s as any)?.intervalDays === "number" ? (s as any).intervalDays : null,
    canceled: typeof (s as any)?.canceled === "boolean" ? (s as any).canceled : false,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as {
    service?: string | null;
    plan?: string | null;
    manageUrl?: string | null;
    price?: number | null;
    nextDate?: string | null;
    intervalDays?: number | null;
    canceled?: boolean | null;
  };

  const data: Record<string, any> = {};
  if (typeof body.service === "string") data.service = body.service.trim();
  if (body.plan !== undefined) data.plan = body.plan?.trim() || null;
  if (body.manageUrl !== undefined) data.manageUrl = body.manageUrl?.trim() || null;

  if (body.price !== undefined) {
    if (body.price === null || Number.isNaN(Number(body.price))) {
      // omit price
    } else {
      data.price = Number(body.price);
    }
  }

  if (body.nextDate !== undefined) {
    if (!body.nextDate) data.nextDate = null;
    else {
      const dt = new Date(body.nextDate);
      if (!Number.isNaN(dt.getTime())) data.nextDate = dt;
    }
  }

  if (body.intervalDays !== undefined) {
    const n = Number(body.intervalDays);
    data.intervalDays = Number.isFinite(n) && n > 0 ? n : null;
  }

  if (typeof body.canceled === "boolean") data.canceled = body.canceled;

  const updated = await prisma.subscription.update({ where: { id }, data: data as any });
  return NextResponse.json(toDTO(updated));
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH for small actions: toggle cancel / advance nextDate
export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as
    | { action: "toggle-cancel" }
    | { action: "advance"; days?: number };

  if (body?.action === "toggle-cancel") {
    const currentCanceled = Boolean((sub as any).canceled);
    const updated = await prisma.subscription.update({
      where: { id },
      data: { canceled: !currentCanceled } as any,
    });
    return NextResponse.json(toDTO(updated));
  }

  if (body?.action === "advance") {
    const base = sub.nextDate ? new Date(sub.nextDate) : new Date();
    let next = new Date(base);

    const daysArg = typeof (body as any).days === "number" && Number.isFinite((body as any).days)
      ? (body as any).days
      : null;

    const intervalRaw = (sub as any).intervalDays;
    const intervalDays = typeof intervalRaw === "number" && Number.isFinite(intervalRaw) && intervalRaw > 0
      ? intervalRaw
      : null;

    if (daysArg && daysArg > 0) {
      next.setDate(next.getDate() + daysArg);
    } else if (intervalDays) {
      next.setDate(next.getDate() + intervalDays);
    } else {
      // default: +1 calendar month (clamp to month end if necessary)
      const keepDay = base.getDate();
      next.setMonth(base.getMonth() + 1);
      if (next.getDate() < keepDay) {
        next = new Date(next.getFullYear(), next.getMonth() + 1, 0);
      }
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: { nextDate: next } as any,
    });
    return NextResponse.json(toDTO(updated));
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
