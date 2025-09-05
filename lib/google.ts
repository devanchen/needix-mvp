// lib/google.ts
import { prisma } from "@/lib/prisma";

export type GoogleAccount = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // seconds since epoch
};

// Pull Google account row for a user
export async function getGoogleAccountForUser(userId: string): Promise<GoogleAccount | null> {
  const acc = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { access_token: true, refresh_token: true, expires_at: true },
  });
  if (!acc) return null;
  return {
    accessToken: acc.access_token ?? null,
    refreshToken: acc.refresh_token ?? null,
    expiresAt: acc.expires_at ?? null,
  };
}

// Ensure we have a valid (non-expired) access token; refresh if needed.
// Returns the access token string or null if we cannot obtain one.
export async function ensureGoogleAccessToken(userId: string): Promise<string | null> {
  const acc = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { id: true, access_token: true, refresh_token: true, expires_at: true },
  });
  if (!acc) return null;

  const now = Math.floor(Date.now() / 1000);
  const isExpired = typeof acc.expires_at === "number" && acc.expires_at !== 0 && acc.expires_at < now - 60;

  if (!isExpired && acc.access_token) {
    return acc.access_token;
  }

  // Need to refresh
  if (!acc.refresh_token) {
    return null;
  }

  const clientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    return null;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: acc.refresh_token,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!resp.ok) {
    // refresh failed (revoked refresh token, etc.)
    return null;
  }

  const json = (await resp.json()) as {
    access_token?: string;
    expires_in?: number;
    id_token?: string;
    scope?: string;
    token_type?: string;
  };

  const newAccess = json.access_token ?? null;
  if (!newAccess) return null;

  const newExpiresAt = typeof json.expires_in === "number" ? Math.floor(Date.now() / 1000) + json.expires_in : null;

  // Persist the new access token/expires
  await prisma.account.update({
    where: { id: acc.id },
    data: { access_token: newAccess, expires_at: newExpiresAt ?? undefined },
  });

  return newAccess;
}

// Very naive parser for subscription-looking subjects (demo)
export function guessSubscriptionsFromSubjects(
  subjects: string[]
): Array<{ service: string; price?: number; nextDate?: string }> {
  const out: Array<{ service: string; price?: number; nextDate?: string }> = [];
  for (const s of subjects) {
    const mPrice = s.match(/\$([0-9]+(?:\.[0-9]{2})?)/);
    const mDate = s.match(/\b(20[2-9][0-9]-[01][0-9]-[0-3][0-9])\b/);
    const svc = s
      .replace(/subscription/i, "")
      .replace(/renew(al)?/i, "")
      .replace(/receipt/i, "")
      .split(/[-–—|:]/)[0]
      .trim();
    out.push({
      service: svc || "Subscription",
      price: mPrice ? Number(mPrice[1]) : undefined,
      nextDate: mDate ? mDate[1] : undefined,
    });
  }
  return out;
}
