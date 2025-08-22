// app/api/subscriptions/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  const body = await req.json();
  const data: any = {};
  if (body.service) data.service = String(body.service);
  if (body.plan !== undefined) data.plan = body.plan ? String(body.plan) : null;
  if (body.manageUrl !== undefined) data.manageUrl = body.manageUrl ? String(body.manageUrl) : null;
  if (body.price !== undefined) {
    const n = Number(body.price);
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    data.price = n;
  }
  if (body.nextDate) data.nextDate = new Date(body.nextDate);

  const sub = await prisma.subscription.update({
    where: { id, userId: session.user.id },
    data,
  });

  return NextResponse.json({ ok: true, sub });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  await prisma.subscription.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
