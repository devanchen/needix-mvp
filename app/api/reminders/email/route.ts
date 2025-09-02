// app/api/reminders/email/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Body = { enabled?: boolean };

function parseBody(raw: unknown): Body {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return { enabled: typeof o.enabled === "boolean" ? o.enabled : undefined };
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { enabled } = parseBody(await safeJson(req));
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ ok: false, error: "Bad body" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { wantsEmailReminders: enabled },
  });

  return NextResponse.json({ ok: true });
}

async function safeJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
