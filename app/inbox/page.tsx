// app/inbox/page.tsx
import { auth } from "@/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Item = {
  id: string;
  source: string;
  merchantRaw: string;
  amount: number | null;
  currency: string | null;
  occurredAt: string;
  cadence: "weekly" | "monthly" | "yearly" | "unknown" | null;
  confidence: number;
};

async function getPending(): Promise<Item[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/detections/pending`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { items: Item[] };
  return data.items ?? [];
}

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Detections inbox</h1>
        <p className="mt-3 text-white/80">
          Please <a className="underline" href="/signin">sign in</a> to review detections.
        </p>
      </main>
    );
  }

  const items = await getPending();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📥 Detections inbox</h1>
        <Link href="/subscriptions" className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15">
          Go to subscriptions
        </Link>
      </div>

      <p className="mt-2 text-sm text-white/70">
        Review charges we found in Gmail. Accept to create a subscription, or dismiss.
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/80">
          No pending detections. Try <Link href="/dashboard" className="underline">importing from Gmail</Link> again later.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((x) => (
            <li key={x.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{x.merchantRaw || "Unknown merchant"}</div>
                  <div className="text-xs text-white/70">
                    {new Date(x.occurredAt).toLocaleDateString()} •{" "}
                    {x.amount != null ? `$${x.amount.toFixed(2)}` : "Amount unknown"} •{" "}
                    cadence: {x.cadence ?? "unknown"} • confidence: {x.confidence}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AcceptButton detectionId={x.id} merchant={x.merchantRaw} amount={x.amount} />
                  <DismissButton detectionId={x.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function AcceptButton({
  detectionId,
  merchant,
  amount,
}: {
  detectionId: string;
  merchant: string;
  amount: number | null;
}) {
  return (
    <form action={`/api/detections/${detectionId}/accept`} method="post">
      <input type="hidden" name="service" value={merchant ?? "Subscription"} />
      <input type="hidden" name="price" value={amount ?? ""} />
      <button className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-sm hover:bg-emerald-400/15">
        Accept
      </button>
    </form>
  );
}

function DismissButton({ detectionId }: { detectionId: string }) {
  return (
    <form action={`/api/detections/${detectionId}/dismiss`} method="post">
      <button className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:bg-white/[0.07]">
        Dismiss
      </button>
    </form>
  );
}
