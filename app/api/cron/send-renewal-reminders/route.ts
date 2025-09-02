// app/api/cron/send-renewal-reminders/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend"; // ✅ your helper exports `resend`, not `getResend`

/**
 * Sends reminder emails for upcoming renewals within the next N days.
 * Default window: 3 days. Call with POST and (optionally) { days?: number } body.
 *
 * Env:
 *  - RESEND_FROM=onboarding@resend.dev  (or your domain)
 */
type Body = { days?: number };

function parseBody(input: unknown): Body {
  if (!input || typeof input !== "object") return {};
  const obj = input as Record<string, unknown>;
  const days = typeof obj.days === "number" ? obj.days : undefined;
  return { days };
}

const FROM_EMAIL =
  (process.env.RESEND_FROM && process.env.RESEND_FROM.trim()) ||
  "onboarding@resend.dev";

export async function POST(req: Request) {
  const { days = 3 } = parseBody(await safeJson(req));
  const windowDays = clamp(days, 1, 30);

  const now = new Date();
  const until = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  // Find upcoming renewals per user
  const subs = await prisma.subscription.findMany({
    where: {
      canceled: false,
      nextDate: { not: null, gte: now, lte: until },
    },
    orderBy: { nextDate: "asc" },
    select: {
      id: true,
      service: true,
      plan: true,
      nextDate: true,
      price: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  // Group per user
  const byUser = new Map<
    string,
    {
      email: string | null;
      name: string | null;
      items: {
        service: string;
        plan: string | null;
        nextDate: Date;
        price: string | null;
      }[];
    }
  >();

  for (const s of subs) {
    if (!s.user?.id) continue;
    const key = s.user.id;
    const entry =
      byUser.get(key) ??
      byUser.set(key, { email: s.user.email ?? null, name: s.user.name ?? null, items: [] })
        .get(key)!;

    entry.items.push({
      service: s.service,
      plan: s.plan ?? null,
      nextDate: s.nextDate!, // filtered not null above
      price: s.price != null ? Number(s.price).toFixed(2) : null,
    });
  }

  let sent = 0;
  let skipped = 0;
  const failures: { userId: string; reason: string }[] = [];

  // Send one email per user with items
  for (const [userId, payload] of byUser.entries()) {
    if (!payload.email) {
      skipped++;
      continue;
    }
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: payload.email,
        subject: subjectFor(payload.items.length),
        html: renderHtml(payload.name, payload.items),
      });
      sent++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      failures.push({ userId, reason: msg });
    }
  }

  return NextResponse.json({
    ok: true,
    days: windowDays,
    scanned: subs.length,
    users: byUser.size,
    sent,
    skipped,
    failures,
  });
}

export async function GET(req: Request) {
  // allow GET for quick tests; defaults to 3 days
  return POST(req);
}

async function safeJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function subjectFor(count: number): string {
  return count === 1
    ? "Upcoming subscription renewal"
    : `Upcoming ${count} subscription renewals`;
}

function renderHtml(
  name: string | null,
  items: { service: string; plan: string | null; nextDate: Date; price: string | null }[]
): string {
  const title = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const rows = items
    .map((it) => {
      const when = it.nextDate.toLocaleDateString();
      const plan = it.plan ? ` — ${escapeHtml(it.plan)}` : "";
      const price = it.price ? ` • $${it.price}` : "";
      return `<li><strong>${escapeHtml(it.service)}</strong>${plan} — <em>${when}</em>${price}</li>`;
    })
    .join("");

  return `
  <div style="font-family:Inter,system-ui,Arial,sans-serif;font-size:14px;line-height:1.5;color:#0b0f1a">
    <p>${title}</p>
    <p>You have the following renewal${items.length > 1 ? "s" : ""} coming up:</p>
    <ul>${rows}</ul>
    <p>Open your dashboard to manage or snooze reminders.</p>
    <p style="margin-top:24px;color:#6b7280">— Needix</p>
  </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
