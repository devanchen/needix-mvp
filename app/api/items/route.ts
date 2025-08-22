// app/api/items/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.item.findMany({
    where: { userId: session.user.id },
    orderBy: [{ nextDate: "asc" }],
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, retailer, productUrl, priceCeiling, lastPrice, frequencyDays, nextDate } = body;

  if (!name || !productUrl || !nextDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const ceiling = Number(priceCeiling);
  const last = Number(lastPrice || ceiling);
  const freq = Number(frequencyDays || 30);
  if (!Number.isFinite(ceiling) || ceiling <= 0) {
    return NextResponse.json({ error: "Invalid priceCeiling" }, { status: 400 });
  }
  if (!Number.isFinite(freq) || freq < 7) {
    return NextResponse.json({ error: "frequencyDays must be ≥ 7" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      userId: session.user.id,
      name,
      retailer,
      productUrl,
      priceCeiling: ceiling,
      lastPrice: last,
      frequencyDays: freq,
      nextDate: new Date(nextDate),
    },
  });

  return NextResponse.json({ ok: true, item });
}
