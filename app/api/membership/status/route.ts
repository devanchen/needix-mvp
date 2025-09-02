// app/api/membership/status/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ACTIVE_STATES = new Set(["active", "trialing"]);

export async function GET() {
  const session = await auth();
  const userId =
    session?.user && typeof session.user.id === "string" ? session.user.id : undefined;

  if (!userId) {
    return NextResponse.json({ active: false, status: null });
  }

  const m = await prisma.membership.findUnique({ where: { userId } });
  const active = m?.status ? ACTIVE_STATES.has(m.status) : false;

  return NextResponse.json({ active, status: m?.status ?? null });
}
