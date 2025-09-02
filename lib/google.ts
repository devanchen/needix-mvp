// lib/google.ts
import { google } from "googleapis";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    throw new Error("No Google account with Gmail permissions linked");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token ?? undefined,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  try {
    const expMs = account.expires_at ? account.expires_at * 1000 : 0;
    if (!expMs || expMs < Date.now() + 60_000) {
      const refreshed = await oauth2Client.refreshAccessToken();
      const creds = refreshed.credentials;
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: creds.access_token ?? account.access_token ?? undefined,
          refresh_token: creds.refresh_token ?? account.refresh_token ?? undefined,
          expires_at: creds.expiry_date ? Math.floor(creds.expiry_date / 1000) : account.expires_at ?? undefined,
        },
      });
      oauth2Client.setCredentials({
        access_token: creds.access_token ?? undefined,
        refresh_token: creds.refresh_token ?? account.refresh_token ?? undefined,
        expiry_date: creds.expiry_date,
      });
    }
  } catch (err) {
    console.warn("Gmail token refresh failed", err);
  }

  return { gmail: google.gmail({ version: "v1", auth: oauth2Client }), userId };
}
