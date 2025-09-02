// lib/receiptParsers.ts
import type { gmail_v1 } from "googleapis";
import { Prisma, Cadence } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ParsedReceipt = {
  merchantRaw: string;
  occurredAt: Date;
  amount?: number;
  currency?: string;
  subject?: string;
};

const MERCHANT_MAP: Record<string, string> = {
  NETFLIX: "Netflix",
  SPOTIFY: "Spotify",
  ADOBE: "Adobe",
  AMAZON: "Amazon",
  "AMAZON SUBSCRIBE & SAVE": "Amazon",
  MICROSOFT: "Microsoft",
  APPLE: "Apple",
  HULU: "Hulu",
  DISNEY: "Disney+",
  COSTCO: "Costco",
  TARGET: "Target",
  WALMART: "Walmart",
};

function normalizeMerchant(raw: string): string {
  const key = raw.toUpperCase();
  for (const [needle, normalized] of Object.entries(MERCHANT_MAP)) {
    if (key.includes(needle)) return normalized;
  }
  return raw.trim();
}

function decodeBase64Url(input: string): string {
  // Gmail payloads use base64url ( - and _ instead of + and / )
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const buf = Buffer.from(normalized, "base64");
  return buf.toString("utf8");
}

export function parseGmailMessage(msg: gmail_v1.Schema$Message): ParsedReceipt | null {
  const headers = Object.fromEntries(
    (msg.payload?.headers ?? []).map(h => [String(h.name ?? "").toLowerCase(), String(h.value ?? "")])
  );
  const subject = headers["subject"] ?? "";
  const from = headers["from"] ?? "";
  const dateHeader = headers["date"] ?? "";

  const haystack = `${subject} ${from}`.toLowerCase();
  const looksLikeReceipt =
    /receipt|subscription|renewal|invoice|order confirmation|thanks for your order/.test(haystack);
  if (!looksLikeReceipt) return null;

  let merchantRaw = from.replace(/.*<|>.*/g, "").split("@")[0] || from;
  if (subject) {
    const firstToken = subject.split(/[-|]/)[0]?.trim();
    if (firstToken && firstToken.length >= 3) merchantRaw = firstToken;
  }

  const occurredAt = dateHeader ? new Date(dateHeader) : new Date();

  // Pull a text-ish part (prefer the first part, else root body)
  const bodyData =
    msg.payload?.parts?.find(p => p.mimeType?.includes("text/plain"))?.body?.data ??
    msg.payload?.parts?.[0]?.body?.data ??
    msg.payload?.body?.data ??
    "";

  const bodyText = bodyData ? decodeBase64Url(bodyData) : "";

  let amount: number | undefined;
  let currency: string | undefined;

  // Basic USD parse
  const usd = bodyText.match(/(?:USD|US\$|\$)\s?(\d+(?:\.\d{1,2})?)/i);
  if (usd) {
    amount = Number(usd[1]);
    currency = "USD";
  }

  return {
    merchantRaw: normalizeMerchant(merchantRaw),
    occurredAt,
    amount,
    currency,
    subject,
  };
}

export async function ensureMerchant(name: string, alias?: string) {
  const existing = await prisma.merchant.findFirst({ where: { name } });
  if (existing) {
    if (alias && !existing.aliases.includes(alias)) {
      return prisma.merchant.update({
        where: { id: existing.id },
        data: { aliases: [...existing.aliases, alias] },
      });
    }
    return existing;
  }
  return prisma.merchant.create({
    data: { name, aliases: alias ? [alias] : [] },
  });
}

export function guessCadenceFromSubject(subject: string | undefined): Cadence | null {
  if (!subject) return null;
  const s = subject.toLowerCase();
  if (s.includes("monthly")) return Cadence.monthly;
  if (s.includes("yearly") || s.includes("annual")) return Cadence.yearly;
  if (s.includes("weekly")) return Cadence.weekly;
  return null;
}

export function toDecimalOrNull(n?: number): Prisma.Decimal | null {
  return typeof n === "number" && Number.isFinite(n) ? new Prisma.Decimal(n) : null;
}
