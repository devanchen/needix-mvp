// app/api/reminders/preview/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ items: [] });

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const items = await prisma.subscription.findMany({
    where: {
      userId,
      canceled: false,
      nextDate: { not: null, gte: now, lte: in30 },
    },
    orderBy: { nextDate: "asc" },
    select: {
      id: true,
      service: true,
      plan: true,
      price: true,
      nextDate: true,
      manageUrl: true,
    },
  });

  return NextResponse.json({ items });
}
