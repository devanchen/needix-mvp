// app/api/subscriptions/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: [{ nextDate: "asc" }],
  });
  return NextResponse.json({ ok: true, subs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { service, plan, manageUrl, price, nextDate } = body;

  if (!service || !nextDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const p = Number(price || 0);
  if (!Number.isFinite(p) || p < 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const sub = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      service,
      plan: plan || null,
      manageUrl: manageUrl || null,
      price: p,
      nextDate: new Date(nextDate),
    },
  });

  return NextResponse.json({ ok: true, sub });
}
