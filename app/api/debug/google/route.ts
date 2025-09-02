// app/api/debug/google/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const acct = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: {
      id: true,
      provider: true,
      providerAccountId: true,
      refresh_token: true,
      access_token: true,
      expires_at: true,
      scope: true,
    },
  });

  return NextResponse.json({
    linked: Boolean(acct),
    hasRefresh: Boolean(acct?.refresh_token),
    account: acct ?? null,
  });
}
