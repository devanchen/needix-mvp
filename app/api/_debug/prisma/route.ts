// app/api/_debug/prisma/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [users, items, subs, orders] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.subscription.count(),
    prisma.orderRequest.count(),
  ]);
  return NextResponse.json({ users, items, subs, orders, ok: true });
}
