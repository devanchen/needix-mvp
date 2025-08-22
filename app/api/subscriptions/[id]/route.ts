// app/api/subscriptions/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function getIdFromUrl(req: Request) {
  const pathname = new URL(req.url).pathname.replace(/\/$/, "");
  return pathname.split("/").pop() || "";
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const data: any = {};

  if (body.service !== undefined) data.service = String(body.service);
  if (body.plan !== undefined) data.plan = body.plan ? String(body.plan) : null;
  if (body.manageUrl !== undefined) data.manageUrl = body.manageUrl ? String(body.manageUrl) : null;
  if (body.price !== undefined) {
    const n = Number(body.price);
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    data.price = n;
  }
  if (body.nextDate !== undefined) {
    const dt = new Date(body.nextDate);
    if (isNaN(+dt)) return NextResponse.json({ error: "Invalid nextDate" }, { status: 400 });
    data.nextDate = dt;
  }

  const result = await prisma.subscription.updateMany({
    where: { id, userId: session.user.id },
    data,
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sub = await prisma.subscription.findFirst({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true, sub });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const result = await prisma.subscription.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
