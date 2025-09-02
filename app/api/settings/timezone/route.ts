// app/api/settings/timezone/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Body = { timezone?: string };

function parseBody(raw: unknown): Body {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return { timezone: typeof o.timezone === "string" ? o.timezone : undefined };
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { timezone } = parseBody(await safeJson(req));
  if (!timezone) return NextResponse.json({ ok: false, error: "Bad body" }, { status: 400 });

  await prisma.user.update({ where: { id: userId }, data: { timezone } });
  return NextResponse.json({ ok: true });
}

async function safeJson(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { return {}; }
}
