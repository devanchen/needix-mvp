// app/api/settings/me/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ emailReminders: false, timezone: "America/Denver" });

  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { wantsEmailReminders: true, timezone: true },
  });

  return NextResponse.json({
    emailReminders: Boolean(u?.wantsEmailReminders),
    timezone: u?.timezone ?? "America/Denver",
  });
}
