// app/integrations/gmail/connected/page.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import GmailImportStatus from "@/components/integrations/GmailImportStatus";

export const runtime = "nodejs";

export default async function GmailConnectedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Gmail</h1>
        <p className="mt-2 text-white/70">
          Please{" "}
          <Link href="/signin" className="underline underline-offset-2">
            sign in
          </Link>{" "}
          first.
        </p>
      </main>
    );
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id as string, provider: "google" },
    select: { providerAccountId: true, access_token: true, expires_at: true, scope: true },
  });

  const connected = !!account?.access_token;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Gmail {connected ? "connected" : "not connected"}</h1>
        <p className="mt-2 text-white/70">
          {connected
            ? "We have read-only access to your inbox for receipts. You can revoke access anytime in your Google Account."
            : "We couldn't find an active Google connection for your account."}
        </p>
      </header>

      {connected ? (
        <>
          <GmailImportStatus />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Preview & Import</div>
                <div className="text-sm text-white/70">Review candidates before creating subscriptions.</div>
              </div>
              <Link
                href="/integrations/gmail/preview"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90"
              >
                Open preview
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          Try connecting from your{" "}
          <Link href="/dashboard" className="underline underline-offset-2">
            Dashboard
          </Link>{" "}
          with the “Connect subscriptions” card.
        </div>
      )}
    </main>
  );
}
