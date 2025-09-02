// app/api/items/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function getIdFromUrl(req: Request) {
  const pathname = new URL(req.url).pathname.replace(/\/$/, "");
  const id = pathname.split("/").pop() || "";
  return id;
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const data: any = {};

  if (body.name !== undefined) data.name = String(body.name);
  if (body.retailer !== undefined) data.retailer = String(body.retailer);
  if (body.productUrl !== undefined) data.productUrl = String(body.productUrl);

  if (body.priceCeiling !== undefined) {
    const n = Number(body.priceCeiling);
    if (!Number.isFinite(n) || n <= 0) return NextResponse.json({ error: "Invalid priceCeiling" }, { status: 400 });
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
  if (body.nextDate !== undefined) {
    const dt = new Date(body.nextDate);
    if (isNaN(+dt)) return NextResponse.json({ error: "Invalid nextDate" }, { status: 400 });
    data.nextDate = dt;
  }

  const result = await prisma.item.updateMany({
    where: { id, userId: session.user.id },
    data,
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = await prisma.item.findFirst({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const result = await prisma.item.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
