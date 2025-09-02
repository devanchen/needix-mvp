// app/api/settings/google/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type Resp = {
  linked: boolean;
  hasRefresh: boolean;
  email?: string | null;
};

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? null;

  if (!userId) return NextResponse.json<Resp>({ linked: false, hasRefresh: false, email });

  const acct = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { id: true, refresh_token: true },
  });

  return NextResponse.json<Resp>({
    linked: Boolean(acct),
    hasRefresh: Boolean(acct?.refresh_token),
    email,
  });
}
