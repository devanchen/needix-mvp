// app/api/subscriptions/import/gmail/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  ensureGoogleAccessToken,
  guessSubscriptionsFromSubjects,
} from "@/lib/google";

export const runtime = "nodejs";

type Suggestion = {
  id: string;
  service: string;
  plan: string | null;
  price: number | null;
  nextDate: string | null;
  manageUrl: string | null;
  canceled: boolean;
};

async function gmailFetch(token: string, url: string) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

/**
 * GET /api/subscriptions/import/gmail
 * Returns an array of inferred subscriptions from recent Gmail subjects.
 * If the user hasn't granted Gmail scope (or token is invalid), returns 409 to trigger re-consent.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Ensure we have a valid access token (auto-refresh if expired)
  let token = await ensureGoogleAccessToken(userId);
  if (!token) {
    // Either never connected with Google or no refresh token available → re-consent
    return new NextResponse("needs_google_reconsent", { status: 409 });
  }

  const q =
    "newer_than:365d (subject:subscription OR subject:renewal OR subject:receipt)";
  const listUrl =
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?" +
    new URLSearchParams({ q, maxResults: "20" }).toString();

  // Try listing messages
  let listRes = await gmailFetch(token, listUrl);

  // If invalid/expired/insufficient scope, try one refresh; if still bad, ask to re-consent
  if (listRes.status === 401 || listRes.status === 403) {
    token = await ensureGoogleAccessToken(userId);
    if (!token) return new NextResponse("needs_google_reconsent", { status: 409 });
    listRes = await gmailFetch(token, listUrl);
    if (listRes.status === 401 || listRes.status === 403) {
      return new NextResponse("needs_google_reconsent", { status: 409 });
    }
  }

  if (!listRes.ok) {
    const text = await listRes.text();
    return new NextResponse(`gmail_list_failed: ${text}`, { status: 502 });
  }

  const listJson: { messages?: { id: string }[] } = await listRes.json();
  const ids: string[] = (listJson.messages ?? []).map((m) => m.id);
  if (ids.length === 0) return NextResponse.json<Suggestion[]>([]);

  // Fetch subjects for up to 10 messages
  const subjects: string[] = [];
  for (const id of ids.slice(0, 10)) {
    const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject`;
    const msgRes = await gmailFetch(token, msgUrl);
    if (!msgRes.ok) continue;
    const msg = (await msgRes.json()) as {
      payload?: { headers?: Array<{ name: string; value: string }> };
    };
    const subj =
      msg.payload?.headers?.find((h) => h.name === "Subject")?.value ?? "";
    if (subj) subjects.push(subj);
  }

  const guesses = guessSubscriptionsFromSubjects(subjects);
  const suggestions: Suggestion[] = guesses.map((g, i) => ({
    id: `gmail-${Date.now()}-${i}`,
    service: g.service,
    plan: null,
    price: typeof g.price === "number" ? g.price : null,
    nextDate: g.nextDate ?? null,
    manageUrl: null,
    canceled: false,
  }));

  return NextResponse.json<Suggestion[]>(suggestions);
}
