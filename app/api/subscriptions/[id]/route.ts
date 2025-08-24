// app/api/subscriptions/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Body = {
  service?: string;
  plan?: string | null;
  manageUrl?: string | null;
  price?: number | string | null;
  nextDate?: string | null; // "YYYY-MM-DD"
};

async function getDbUserId() {
  const session = await auth();
  if (!session?.user) return { userId: null, session };
  const email = (session.user.email ?? "").toLowerCase().trim();

  if (session.user.id) {
    const byId = await prisma.user.findUnique({ where: { id: session.user.id as string } });
    if (byId) return { userId: byId.id, session };
  }

  if (email) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: session.user.name ?? "User" },
      create: { email, name: session.user.name ?? "User" },
    });
    return { userId: user.id, session };
  }

  const user = await prisma.user.create({
    data: { email: `user_${Date.now()}@example.com`, name: session.user.name ?? "User" },
  });
  return { userId: user.id, session };
}

/** Serialize to plain JSON (no Decimal/Date objects) */
function toDTO(s: any) {
  return {
    id: s.id as string,
    userId: s.userId as string,
    service: s.service as string,
    plan: (s.plan ?? null) as string | null,
    manageUrl: (s.manageUrl ?? null) as string | null,
    price: s.price === null ? null : Number(s.price),
    nextDate: s.nextDate ? new Date(s.nextDate).toISOString() : null,
    createdAt: new Date(s.createdAt).toISOString(),
    updatedAt: new Date(s.updatedAt).toISOString(),
  };
}

// Support Next 15's async params (and older sync) without typing the arg
async function getParams(ctx: any) {
  const p = ctx?.params;
  return p && typeof p.then === "function" ? await p : p;
}

export async function PUT(req: Request, ctx: any) {
  const { id } = (await getParams(ctx)) ?? {};
  const { userId, session } = await getDbUserId();
  if (!session?.user || !userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const raw = (await req.json()) as Body;

  const data: any = {};
  if (raw.service !== undefined) data.service = String(raw.service).trim();
  if (raw.plan !== undefined) data.plan = raw.plan ? String(raw.plan).trim() : null;
  if (raw.manageUrl !== undefined) data.manageUrl = raw.manageUrl ? String(raw.manageUrl).trim() : null;

  if (raw.price !== undefined) {
    if (raw.price === null || String(raw.price).trim() === "") data.price = null;
    else data.price = Number(raw.price);
  }

  if (raw.nextDate !== undefined) {
    if (!raw.nextDate) data.nextDate = null;
    else data.nextDate = new Date(raw.nextDate); // expects YYYY-MM-DD
  }

  const existing = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.subscription.update({ where: { id }, data });
  return NextResponse.json(toDTO(updated), { status: 200 });
}

export async function DELETE(_req: Request, ctx: any) {
  const { id } = (await getParams(ctx)) ?? {};
  const { userId, session } = await getDbUserId();
  if (!session?.user || !userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
