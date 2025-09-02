// app/api/integrations/gmail/import/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ImportRow = {
  service: string;
  plan?: string | null;
  price?: number | null;
  nextDate?: string | null;   // YYYY-MM-DD or ISO
  intervalDays?: number | null;
  manageUrl?: string | null;
};

function normService(s: string) {
  const t = (s || "").trim();
  if (!t) return "Subscription";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  const email = (session?.user?.email || "").toLowerCase().trim();

  if (!userId && !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user =
    (userId && (await prisma.user.findUnique({ where: { id: userId } }))) ||
    (email && (await prisma.user.upsert({ where: { email }, update: {}, create: { email } }))) ||
    null;

  if (!user) return NextResponse.json({ error: "No user" }, { status: 401 });

  const body = (await req.json()) as { rows: ImportRow[] | undefined };
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  if (rows.length === 0) {
    return NextResponse.json({ error: "No rows" }, { status: 400 });
  }

  const created: any[] = [];
  const updated: any[] = [];
  const skipped: any[] = [];

  for (const r of rows) {
    const svc = normService(r.service || "Subscription");

    // dedupe: same user+service and (manageUrl | nextDate±7d | same price)
    const whereBase: any = { userId: user.id, service: { equals: svc, mode: "insensitive" } };
    const orConds: any[] = [];

    if (typeof r.manageUrl === "string" && r.manageUrl.trim()) {
      orConds.push({ manageUrl: r.manageUrl.trim() });
    }
    if (typeof r.nextDate === "string" && r.nextDate.trim()) {
      const dt = new Date(r.nextDate);
      if (!Number.isNaN(dt.getTime())) {
        const min = new Date(dt);
        const max = new Date(dt);
        min.setDate(min.getDate() - 7);
        max.setDate(max.getDate() + 7);
        orConds.push({ nextDate: { gte: min, lte: max } });
      }
    }
    if (r.price !== null && r.price !== undefined && Number.isFinite(Number(r.price))) {
      orConds.push({ price: Number(r.price) });
    }

    let existing = null;
    if (orConds.length > 0) {
      existing = await prisma.subscription.findFirst({ where: { AND: [whereBase], OR: orConds } });
    } else {
      existing = await prisma.subscription.findFirst({ where: whereBase });
    }

    // Build incoming partials
    const incoming: Record<string, any> = {};
    if (typeof r.manageUrl === "string" && r.manageUrl.trim()) incoming.manageUrl = r.manageUrl.trim();
    if (r.plan !== undefined) incoming.plan = r.plan ? r.plan.trim() : null;
    if (r.price !== null && r.price !== undefined && Number.isFinite(Number(r.price))) incoming.price = Number(r.price);
    if (typeof r.nextDate === "string" && r.nextDate.trim()) {
      const dt = new Date(r.nextDate);
      if (!Number.isNaN(dt.getTime())) incoming.nextDate = dt;
    }
    if (r.intervalDays !== null && r.intervalDays !== undefined && Number.isFinite(Number(r.intervalDays))) {
      const n = Number(r.intervalDays);
      if (n > 0) incoming.intervalDays = n;
    }

    if (existing) {
      const updateData: Record<string, any> = {};
      for (const k of ["manageUrl", "plan", "price", "nextDate", "intervalDays"] as const) {
        const cur = (existing as any)[k];
        const inc = (incoming as any)[k];
        if ((cur == null || cur === "" || cur === 0) && inc != null) updateData[k] = inc;
      }

      if (Object.keys(updateData).length > 0) {
        // 👇 cast to any so TS doesn't care if your Prisma types are behind
        const u = await prisma.subscription.update({ where: { id: existing.id }, data: updateData as any });
        updated.push({ id: u.id, service: u.service });
      } else {
        skipped.push({ id: existing.id, service: existing.service });
      }
      continue;
    }

    const createData: Record<string, any> = { userId: user.id, service: svc };
    for (const k of ["manageUrl", "plan", "price", "nextDate", "intervalDays"] as const) {
      if ((incoming as any)[k] != null) (createData as any)[k] = (incoming as any)[k];
    }

    // 👇 cast to any for the same reason
    const c = await prisma.subscription.create({ data: createData as any });

    created.push({
      id: c.id,
      userId: c.userId,
      service: c.service,
      plan: c.plan,
      manageUrl: c.manageUrl,
      price: c.price == null ? null : Number(c.price),
      nextDate: c.nextDate ? c.nextDate.toISOString() : null,
      intervalDays: (c as any).intervalDays ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    });
  }

  return NextResponse.json({
    ok: true,
    counts: { created: created.length, updated: updated.length, skipped: skipped.length },
    created,
    updated,
    skipped,
  });
}
