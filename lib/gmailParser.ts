// lib/gmailParser.ts
import type { gmail_v1 } from "googleapis";

export type ParsedReceipt = {
  merchantRaw: string;
  occurredAt: Date;
  amount?: number;
  currency?: string;
};

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

export function parseGmailMessage(msg: gmail_v1.Schema$Message): ParsedReceipt | null {
  const headers = Object.fromEntries(
    (msg.payload?.headers ?? []).map((h) => [String(h.name ?? "").toLowerCase(), String(h.value ?? "")])
  );
  const subject = headers["subject"] ?? "";
  const from = headers["from"] ?? "";
  const dateHeader = headers["date"] ?? "";

  // remove unnecessary escapes in regex
  const haystack = `${subject} ${from}`.toLowerCase();
  const looksLikeReceipt = /(receipt|subscription|renewal|invoice|order confirmation|thanks for your order)/.test(
    haystack
  );
  if (!looksLikeReceipt) return null;

  let merchantRaw = from.replace(/.*<|>.*/g, "").split("@")[0] || from;
  if (subject) {
    const token = subject.split(/[-|]/)[0]?.trim();
    if (token && token.length >= 3) merchantRaw = token;
  }

  const occurredAt = dateHeader ? new Date(dateHeader) : new Date();

  const bodyData =
    msg.payload?.parts?.find((p) => p.mimeType?.includes("text/plain"))?.body?.data ??
    msg.payload?.parts?.[0]?.body?.data ??
    msg.payload?.body?.data ??
    "";

  const bodyText = bodyData ? decodeBase64Url(bodyData) : "";

  let amount: number | undefined;
  let currency: string | undefined;

  const usd = bodyText.match(/(?:USD|US\$|\$)\s?(\d+(?:\.\d{1,2})?)/i);
  if (usd) {
    amount = Number(usd[1]);
    currency = "USD";
  }

  return { merchantRaw, occurredAt, amount, currency };
}
