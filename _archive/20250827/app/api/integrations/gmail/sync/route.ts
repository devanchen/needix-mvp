// app/api/integrations/gmail/sync/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function refreshGoogleAccessToken(userId: string) {
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

async function gmailSearch(accessToken: string) {
  const q = encodeURIComponent('newer_than:365d ("receipt" OR "subscription" OR "trial" OR "renewal" OR "invoice")');
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=100`;
  return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
}

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // current token
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { access_token: true },
  });
  if (!account?.access_token) {
    return NextResponse.json({ error: "No Google connection" }, { status: 400 });
  }

  // try search, refresh once if 401
  let token = account.access_token;
  let resp = await gmailSearch(token);
  if (resp.status === 401) {
    const refreshed = await refreshGoogleAccessToken(userId);
    if (!refreshed) {
      return NextResponse.json({ error: "Google token expired; reconnect required" }, { status: 401 });
    }
    token = refreshed;
    resp = await gmailSearch(token);
  }

  if (!resp.ok) {
    const txt = await resp.text();
    return NextResponse.json({ error: `Gmail error (${resp.status})`, details: txt }, { status: 502 });
  }

  const json = await resp.json();
  const messages = Array.isArray(json?.messages) ? json.messages : [];

  return NextResponse.json(
    {
      ok: true,
      estimatedMessages: json?.resultSizeEstimate ?? messages.length ?? 0,
      candidates: messages.length ?? 0,
    },
    { status: 200 }
  );
}
