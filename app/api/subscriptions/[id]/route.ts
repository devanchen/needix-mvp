// app/api/subscriptions/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IdParam, SubscriptionBody } from "@/lib/schemas";
import { getJson, getParams } from "@/lib/validate";

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

async function getDbUserId() {
  const session = await auth();
  if (!session?.user) return { userId: null as string | null, session };

  const email = (session.user.email ?? "").toLowerCase().trim();
  if (session.user.id) {
    const found = await prisma.user.findUnique({ where: { id: session.user.id as string } });
    if (found) return { userId: found.id, session };
  }
  if (email) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: session.user.name ?? "User" },
      create: { email, name: session.user.name ?? "User" },
    });
    return { userId: user.id, session };
  }
  const created = await prisma.user.create({
    data: { email: `user_${Date.now()}@example.com`, name: session.user.name ?? "User" },
  });
  return { userId: created.id, session };
}

export async function PUT(req: Request, ctx: any) {
  const params = await getParams(ctx, IdParam);
  if (!params.ok) return params.error;
  const { id } = params.data;

  const { userId, session } = await getDbUserId();
  if (!session?.user || !userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await getJson(req, SubscriptionBody.partial()); // partial updates allowed
  if (!parsed.ok) return parsed.error;

  const update: any = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === undefined) continue;
    if (k === "nextDate") update.nextDate = v === null ? null : new Date(v as string);
    else update[k] = v;
  }

  const existing = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.subscription.update({ where: { id }, data: update });
  return NextResponse.json(toDTO(updated), { status: 200 });
}

export async function DELETE(_req: Request, ctx: any) {
  const params = await getParams(ctx, IdParam);
  if (!params.ok) return params.error;
  const { id } = params.data;

  const { userId, session } = await getDbUserId();
  if (!session?.user || !userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
