// app/api/detections/pending/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Pending = not resolved AND NOT(payload.dismissed === true)
  const items = await prisma.detection.findMany({
    where: {
      userId,
      resolvedToSubscriptionId: null,
      NOT: { payload: { path: ["dismissed"], equals: true } },
    },
    orderBy: [{ occurredAt: "desc" }],
    select: {
      id: true,
      source: true,
      merchantRaw: true,
      amount: true,
      currency: true,
      occurredAt: true,
      cadence: true,
      confidence: true,
    },
    take: 100,
  });

  return NextResponse.json({ items });
}
