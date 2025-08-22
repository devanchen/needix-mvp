// app/api/items/[id]/route.ts
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
  if (body.name) data.name = String(body.name);
  if (body.retailer) data.retailer = String(body.retailer);
  if (body.productUrl) data.productUrl = String(body.productUrl);
  if (body.priceCeiling !== undefined) {
    const n = Number(body.priceCeiling);
    if (!Number.isFinite(n) || n <= 0) return NextResponse.json({ error: "Invalid ceiling" }, { status: 400 });
    data.priceCeiling = n;
  }
  if (body.lastPrice !== undefined) {
    const n = Number(body.lastPrice);
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: "Invalid lastPrice" }, { status: 400 });
    data.lastPrice = n;
  }
  if (body.frequencyDays !== undefined) {
    const n = Number(body.frequencyDays);
    if (!Number.isFinite(n) || n < 7) return NextResponse.json({ error: "Invalid frequencyDays" }, { status: 400 });
    data.frequencyDays = n;
  }
  if (body.nextDate) data.nextDate = new Date(body.nextDate);

  const item = await prisma.item.update({
    where: { id, userId: session.user.id },
    data,
  });

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  await prisma.item.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
