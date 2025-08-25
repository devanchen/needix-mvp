// lib/gmail.ts
import { prisma } from "@/lib/prisma";

/** Refresh Google access token via stored refresh_token */
export async function refreshGoogleAccessToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { refresh_token: true },
  });
  if (!account?.refresh_token) return null;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    grant_type: "refresh_token",
    refresh_token: account.refresh_token,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    cache: "no-store",
  });
  if (!resp.ok) return null;

  const json = await resp.json();
  const access_token: string | undefined = json.access_token;
  const expires_in: number | undefined = json.expires_in;
  if (!access_token) return null;

  const expires_at = expires_in ? Math.floor(Date.now() / 1000) + expires_in : null;

  await prisma.account.updateMany({
    where: { userId, provider: "google" },
    data: { access_token, ...(expires_at ? { expires_at } : {}) },
  });

  return access_token;
}

export async function gmailSearch(accessToken: string, q: string, max = 25) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=${max}`;
  return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
}

export async function gmailGetMessageFull(accessToken: string, id: string) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
  return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
}

/** Utility to collect a few common headers (From/Subject/Date) into a map */
export function headersToMap(headers: Array<{ name: string; value: string }> | undefined) {
  const map = new Map<string, string>();
  (headers || []).forEach((h) => map.set(h.name.toLowerCase(), h.value));
  return {
    from: map.get("from"),
    subject: map.get("subject"),
    date: map.get("date"),
  };
}

/** Base64url decode (Gmail uses URL-safe base64) */
export function b64urlDecode(data: string) {
  // replace URL-safe chars
  const s = data.replace(/-/g, "+").replace(/_/g, "/");
  // pad to multiple of 4
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  const str = s + "=".repeat(pad);
  if (typeof Buffer !== "undefined") return Buffer.from(str, "base64").toString("utf8");
  // browser fallback
  try {
    return atob(str);
  } catch {
    return "";
  }
}

/** Recursively extract text content from a Gmail message payload (prefers text/plain; falls back to stripped HTML) */
export function extractTextFromPayload(payload: any): { text: string; html?: string } {
  const texts: string[] = [];
  const htmls: string[] = [];

  function walk(p: any) {
    if (!p) return;
    const mime = p.mimeType || "";
    const data = p.body?.data ? b64urlDecode(p.body.data) : "";

    if (mime.startsWith("text/plain")) {
      if (data) texts.push(data);
    } else if (mime.startsWith("text/html")) {
      if (data) htmls.push(data);
    }

    if (Array.isArray(p.parts)) p.parts.forEach(walk);
  }

  walk(payload);

  const html = htmls.join("\n");
  const textFromHtml = html
    ? html
        .replace(/<\/(p|div|li|tr)>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : "";

  const text = [texts.join("\n"), textFromHtml].filter(Boolean).join("\n").trim();
  return { text, html: html || undefined };
}
