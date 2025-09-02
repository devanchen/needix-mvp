// app/api/detections/gmail/ingest/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGmailForUser } from "@/lib/gmail";
import { parseGmailMessage } from "@/lib/gmailParser";
import type { gmail_v1 } from "googleapis";

type Body = { maxMessages?: number };

function parseBody(raw: unknown): Body {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return { maxMessages: typeof o.maxMessages === "number" ? o.maxMessages : undefined };
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { maxMessages = 50 } = parseBody(await safeJson(req));

  let gmailCtx;
  try {
    gmailCtx = await getGmailForUser();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Google connection error";
    // special hint for reconnect
    const hint = /reconnect|refresh token/i.test(msg) ? " Visit Settings to relink Google access." : "";
    return NextResponse.json({ ok: false, error: msg + hint }, { status: 400 });
  }

  const q =
    'newer_than:365d (receipt OR invoice OR subscription OR "thanks for your order" OR renewal)';
  const list = await gmailCtx.gmail.users.messages.list({
    userId: "me",
    q,
    maxResults: Math.min(Math.max(maxMessages, 1), 200),
  });

  const ids = (list.data.messages ?? []).map((m) => String(m.id));
  let scanned = 0;
  let created = 0;
  let skipped = 0;

  for (const id of ids) {
    scanned++;
    const msg = await gmailCtx.gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });

    const parsed = parseGmailMessage(msg.data as gmail_v1.Schema$Message);
    if (!parsed) {
      skipped++;
      continue;
    }

    const exists = await prisma.detection.findFirst({
      where: { userId, source: "gmail", rawId: id },
      select: { id: true },
    });
    if (exists) {
      skipped++;
      continue;
    }

    await prisma.detection.create({
      data: {
        userId,
        source: "gmail",
        rawId: id,
        merchantRaw: parsed.merchantRaw,
        merchantId: null,
        amount: parsed.amount ?? null,
        currency: parsed.currency ?? null,
        occurredAt: parsed.occurredAt,
        cadence: null,
        confidence: 60,
        payload: {},
      },
    });
    created++;
  }

  return NextResponse.json({ ok: true, scanned, created, skipped });
}

async function safeJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
