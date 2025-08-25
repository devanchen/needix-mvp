// app/integrations/gmail/preview/page.tsx
import { auth } from "@/auth";
import GmailPreviewImport from "@/components/integrations/GmailPreviewImport";

export const runtime = "nodejs";

export default async function GmailPreviewPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Gmail import</h1>
        <p className="mt-2 text-white/70">Please sign in to preview & import subscriptions.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Gmail import</h1>
      <p className="mt-2 text-white/70">
        We’ll fetch a small batch of recent messages that look like receipts or renewals. Select the ones you want to
        import as subscriptions.
      </p>

      <div className="mt-6">
        <GmailPreviewImport />
      </div>
    </main>
  );
}
