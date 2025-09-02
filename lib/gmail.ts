// lib/gmail.ts
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type GmailContext = {
  gmail: ReturnType<typeof google.gmail>;
  userId: string;
};

export async function getGmailForUser(): Promise<GmailContext> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account?.access_token) {
    throw new Error("No Google account linked");
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  const expiryMs = account.expires_at ? account.expires_at * 1000 : 0;
  const hasRefresh = Boolean(account.refresh_token);

  // If token is expired and we lack a refresh token, we must ask the user to reconnect
  if (expiryMs && Date.now() >= expiryMs && !hasRefresh) {
    throw new Error("Google needs reconnect (missing refresh token). Go to Settings and relink Google.");
  }

  client.setCredentials({
    access_token: account.access_token ?? undefined,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: expiryMs || undefined,
  });

  // Try refresh if near expiry and we DO have a refresh token
  try {
    const soon = !expiryMs || expiryMs < Date.now() + 60_000;
    if (hasRefresh && soon) {
      const refreshed = await client.refreshAccessToken();
      const creds = refreshed.credentials;
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: creds.access_token ?? account.access_token ?? undefined,
          refresh_token: creds.refresh_token ?? account.refresh_token ?? undefined,
          expires_at: creds.expiry_date ? Math.floor(creds.expiry_date / 1000) : account.expires_at ?? undefined,
        },
      });
      client.setCredentials({
        access_token: creds.access_token ?? undefined,
        refresh_token: creds.refresh_token ?? account.refresh_token ?? undefined,
        expiry_date: creds.expiry_date,
      });
    }
  } catch {
    // If refresh fails, let API layer handle and suggest reconnect
    throw new Error("Google token refresh failed. Go to Settings and relink Google.");
  }

  return { gmail: google.gmail({ version: "v1", auth: client }), userId };
}
