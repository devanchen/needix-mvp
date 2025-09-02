// app/api/integrations/gmail/preview/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gmailSearch, gmailGetMessageFull, refreshGoogleAccessToken, headersToMap, extractTextFromPayload } from "@/lib/gmail";
import { parseGmailReceipt } from "@/lib/gmailParser";

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { access_token: true },
  });
  if (!account?.access_token) return NextResponse.json({ error: "No Google connection" }, { status: 400 });

  // broader query, 12 months
  const query = 'newer_than:365d ("receipt" OR "subscription" OR "renewal" OR "invoice" OR "payment")';

  let token = account.access_token;
  let resp = await gmailSearch(token, query, 20);
  if (resp.status === 401) {
    const refreshed = await refreshGoogleAccessToken(userId);
    if (!refreshed) return NextResponse.json({ error: "Google token expired; reconnect" }, { status: 401 });
    token = refreshed;
    resp = await gmailSearch(token, query, 20);
  }
  if (!resp.ok) return NextResponse.json({ error: `Gmail error (${resp.status})` }, { status: 502 });

  const listJson = await resp.json();
  const ids: string[] = Array.isArray(listJson?.messages) ? listJson.messages.map((m: any) => m.id) : [];

  const candidates: Array<{
    messageId: string;
    service: string;
    plan: string | null;
    price: number | null;
    nextDate: string | null;
    intervalDays: number | null;
    manageUrl: string | null;
    subject: string;
    from: string;
    snippet: string;
    confidence: number;
  }> = [];

  for (const id of ids) {
    const r = await gmailGetMessageFull(token, id);
    if (!r.ok) continue;
    const j = await r.json();
    const headers = headersToMap(j?.payload?.headers);
    const { text } = extractTextFromPayload(j?.payload);
    const parsed = parseGmailReceipt({
      from: headers.from,
      subject: headers.subject,
      body: text,
    });

    candidates.push({
      messageId: id,
      service: parsed.service,
      plan: parsed.plan,
      price: parsed.price,
      nextDate: parsed.nextDate,
      intervalDays: parsed.intervalDays,
      manageUrl: parsed.manageUrl,
      subject: headers.subject || "",
      from: headers.from || "",
      snippet: j?.snippet || "",
      confidence: parsed.confidence,
    });
  }

  // Sort by confidence desc, then subject
  candidates.sort((a, b) => b.confidence - a.confidence || a.service.localeCompare(b.service));

  return NextResponse.json({
    ok: true,
    count: candidates.length,
    candidates,
  });
}
